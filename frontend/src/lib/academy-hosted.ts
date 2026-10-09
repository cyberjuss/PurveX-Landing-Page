import "server-only";
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "crypto";
import {
  DescribeInstancesCommand,
  DescribeSecurityGroupsCommand,
  EC2Client,
  RunInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
  TerminateInstancesCommand,
} from "@aws-sdk/client-ec2";
import { DescribeInstanceInformationCommand, SendCommandCommand, SSMClient } from "@aws-sdk/client-ssm";
import {
  addLabMinutes,
  claimPodSlot,
  createLabKey,
  deleteHostedLab,
  hostedLabsDueToStop,
  hostedLabsIdleSince,
  loadHostedLab,
  loadLabState,
  POD_RESERVED,
  readLabMinutes,
  saveHostedLab,
  type HostedLabRow,
} from "@/lib/academy-store";

// Hosted labs: each student's own two-machine pod in AWS. A Windows domain
// controller cloned from the image lab-environment/hosted builds, and an Ubuntu
// server beside it on the same small network. On first boot the domain
// controller links itself to the student with a lab key and installs the same
// sync task a self-hosted lab uses, so Coach, the MCP server, missions and the
// portfolio see it the same way. Students open both machines in the browser
// through the Guacamole gateway with one signed link.
//
// Isolation is the pod's security group, one per student, created by Terraform
// and picked by slot number (see claimPodSlot). The two machines in a pod reach
// each other on every port and nothing else on the network: no student's lab can
// see another's, and nothing on the internet can open a connection to either
// machine. This key cannot create or change a security group, so that shape
// holds even if it leaks.

export type HostedLabState = "none" | "starting" | "ready" | "stopping" | "stopped";
export type HostedLabStatus = {
  state: HostedLabState;
  stopAt: string | null;
  startedAt: string | null;
  firstBoot: boolean;
  instanceType: string;
  /** True once the pod has an Ubuntu server too, so the UI can offer both machines. */
  linux: boolean;
};

function cfg() {
  // Trimmed: a value pasted or piped into Vercel can carry a stray line break.
  const e = Object.fromEntries(Object.entries(process.env).filter(([k]) => k.startsWith("HOSTED_LAB_")).map(([k, v]) => [k, (v ?? "").trim()]));
  return {
    region: e.HOSTED_LAB_REGION || "us-east-1",
    accessKeyId: e.HOSTED_LAB_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: e.HOSTED_LAB_AWS_SECRET_ACCESS_KEY || "",
    ami: e.HOSTED_LAB_AMI || "",
    subnet: e.HOSTED_LAB_SUBNET || "",
    securityGroup: e.HOSTED_LAB_SECURITY_GROUP || "",
    instanceType: e.HOSTED_LAB_INSTANCE_TYPE || "t3.medium",
    /** The Ubuntu server beside the domain controller. Unset means pods are built
     *  with the domain controller alone, which is what they were before. */
    linuxAmi: e.HOSTED_LAB_LINUX_AMI || "",
    linuxInstanceType: e.HOSTED_LAB_LINUX_INSTANCE_TYPE || "t3.small",
    /** How many pod security groups Terraform made. A pod takes one while it
     *  exists, so this is also the cap on students holding a lab at once. */
    podSlots: Math.max(0, Number(e.HOSTED_LAB_POD_SLOTS) || 0),
    /** Gives each lab the SSM agent role, so Range can fire Shift incidents into it. */
    instanceProfile: e.HOSTED_LAB_INSTANCE_PROFILE || "",
    gatewayUrl: (e.HOSTED_LAB_GATEWAY_URL || "").replace(/\/+$/, ""),
    gatewayKey: e.HOSTED_LAB_GATEWAY_KEY || "",
    secret: e.HOSTED_LAB_SECRET || "",
    syncUrl: (e.HOSTED_LAB_SYNC_URL || "https://purvex.io").replace(/\/+$/, ""),
    sessionHours: Math.min(8, Math.max(1, Number(e.HOSTED_LAB_SESSION_HOURS) || 3)),
    /** Hours of lab a subscription buys per calendar month. Without one a
     *  student can restart a session every day indefinitely, and the AWS bill
     *  for that passes what they pay us. 0 turns the cap off. */
    monthlyHours: Math.max(0, Number(e.HOSTED_LAB_MONTHLY_HOURS) || 20),
    /** Days a lab may sit untouched before it is terminated. Its disks bill
     *  every month whether or not anyone signs in, so a lab nobody has opened
     *  since this long ago is pure cost. 0 turns reclaiming off. */
    idleDays: Math.max(0, Number(e.HOSTED_LAB_IDLE_DAYS) || 21),
    emails: (e.HOSTED_LAB_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
  };
}

/** Thrown when a student has spent their month. The route turns it into a 429
 *  with this message, which is written for the student rather than the log. */
export class LabHoursSpentError extends Error {
  // The test is whether a whole session still fits, so someone with 2 hours
  // left is refused while having spent 18 of 20. Saying they used all 20 was
  // both wrong and unactionable.
  constructor(public readonly used: number, public readonly limit: number, session = 0) {
    const left = Math.max(0, limit - used);
    super(
      left > 0 && session > 0
        ? `A session needs ${session} hours and only ${left} of your ${limit} are left this month. Hours reset on the 1st. Email support@purvex.io if you need more.`
        : `All ${limit} lab hours on your plan are used for this month. Hours reset on the 1st. Email support@purvex.io if you need more.`
    );
    this.name = "LabHoursSpentError";
  }
}

/** Hours used and left this month. limit 0 means the cap is off. */
export async function labHours(userId: string): Promise<{ used: number; limit: number; left: number }> {
  const limit = cfg().monthlyHours;
  const used = (await readLabMinutes(userId)) / 60;
  return { used, limit, left: limit ? Math.max(0, limit - used) : Infinity };
}

/** Charges one session against the month, or refuses when nothing is left.
 *  Charged when a session starts rather than when it ends: a lab that is never
 *  stopped cleanly would otherwise cost us the hours and never record them. */
/** Hand a session back when the start it paid for never happened. Charging up
 *  front is deliberate, but it must not bill for a lab that failed to launch. */
async function refundSession(userId: string): Promise<void> {
  const c = cfg();
  if (!c.monthlyHours) return;
  await addLabMinutes(userId, -c.sessionHours * 60).catch((err) => {
    console.error("session refund failed", err instanceof Error ? err.message : err);
    return 0;
  });
}

/** Give back the part of a session that was never used. The charge is taken up
 *  front so a lab that is never stopped cleanly still counts against the month,
 *  but that means stopping after ten minutes spent three hours. stopAt is the
 *  end of the session that was paid for, so whatever is left of it at the moment
 *  of stopping is the refund. */
async function refundUnused(userId: string, stopAt: string | null): Promise<void> {
  const c = cfg();
  if (!c.monthlyHours || !stopAt) return;
  const leftMs = Date.parse(stopAt) - Date.now();
  if (!Number.isFinite(leftMs) || leftMs <= 0) return;
  const minutes = Math.min(c.sessionHours * 60, Math.floor(leftMs / 60000));
  if (minutes <= 0) return;
  await addLabMinutes(userId, -minutes).catch((err) => {
    console.error("session reconcile failed", err instanceof Error ? err.message : err);
    return 0;
  });
}

async function chargeSession(userId: string): Promise<void> {
  const c = cfg();
  if (!c.monthlyHours) return;
  const used = (await readLabMinutes(userId)) / 60;
  if (used + c.sessionHours > c.monthlyHours) throw new LabHoursSpentError(Math.round(used), c.monthlyHours, c.sessionHours);
  await addLabMinutes(userId, c.sessionHours * 60);
}

/** How long one session runs before the lab stops itself. The briefing and the
 *  panel both state it, so it comes from the same config the stop clock uses
 *  rather than a number written down twice. */
export const hostedLabSessionHours = (): number => cfg().sessionHours;

export function hostedLabsConfigured(): boolean {
  const c = cfg();
  return Boolean(c.accessKeyId && c.secretAccessKey && c.ami && c.subnet && c.securityGroup && c.gatewayUrl && /^[0-9a-f]{32}$/i.test(c.gatewayKey) && /^[0-9a-f]{64}$/i.test(c.secret));
}

/** Pilot allowlist: HOSTED_LAB_EMAILS lists who may use a hosted lab, or "*" for everyone. */
export function canUseHostedLab(email: string | null): boolean {
  if (!hostedLabsConfigured()) return false;
  const { emails } = cfg();
  return emails.includes("*") || Boolean(email && emails.includes(email.toLowerCase()));
}

let client: EC2Client | null = null;
function ec2() {
  const c = cfg();
  client ??= new EC2Client({ region: c.region, credentials: { accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey } });
  return client;
}

// ---- secrets ------------------------------------------------------------

function sealPassword(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", Buffer.from(cfg().secret, "hex"), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), ct].map((b) => b.toString("base64url")).join(".");
}

function openPassword(sealed: string): string {
  const [iv, tag, ct] = sealed.split(".").map((p) => Buffer.from(p, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", Buffer.from(cfg().secret, "hex"), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

/** Meets the domain's complexity rule and never needs quoting. */
const newPassword = () => `Pvx-${randomBytes(12).toString("base64url").replace(/[-_]/g, "x")}-9k`;

// ---- first boot -----------------------------------------------------------

const ps = (v: string) => `'${v.replace(/'/g, "''")}'`;

/**
 * The keys every pod would otherwise share, re-rolled so this student's forest
 * has its own.
 *
 * Each pod is cloned from one image, so without this every student's domain has
 * the same `krbtgt` key and the same directory-restore password. A student who
 * dumped `krbtgt` from their own domain controller would hold a golden-ticket
 * key for everyone else's. The security groups are what stop them using it, and
 * this is what makes those groups the outer layer rather than the only one.
 *
 * `krbtgt` is reset twice on purpose. Active Directory keeps the previous key
 * and still accepts tickets signed with it, so one reset leaves the image's
 * shared key working; the second reset is what evicts it. Resetting twice in
 * quick succession is the thing to avoid in a real forest with several domain
 * controllers, because the second reset can outrun replication. There is one
 * domain controller here, nothing to replicate to, and no tickets issued yet.
 *
 * Neither secret is kept. Nothing in Range or the lab content uses either one:
 * the restore password exists for a recovery mode no student enters, and
 * `krbtgt` is never typed. Active Directory also ignores the password handed to
 * a `krbtgt` reset and generates its own, so these are rolled on the machine
 * rather than passed in -- EC2 user data can be read back from inside the
 * instance, and a secret nobody needs should not be sitting there.
 */
function rekeyLines(): string[] {
  return [
    "# Give this student's forest its own krbtgt key and restore password.",
    "$rand = { -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 24 | ForEach-Object { [char]$_ }) }",
    "try {",
    "  foreach ($pass in 1, 2) {",
    "    Set-ADAccountPassword -Identity krbtgt -Reset -NewPassword (ConvertTo-SecureString (& $rand) -AsPlainText -Force) -ErrorAction Stop",
    '    Write-Host "krbtgt reset $pass of 2"',
    "    if ($pass -eq 1) { Start-Sleep -Seconds 20 }",
    "  }",
    "  # The domain controller is holding tickets signed with the key we just replaced.",
    "  & klist.exe purge -li 0x3e7 | Out-Null",
    "  & klist.exe purge | Out-Null",
    "} catch {",
    '  Write-Host "krbtgt reset failed: $($_.Exception.Message)"',
    "}",
    "try {",
    '  & ntdsutil.exe "set dsrm password" "reset password on server null" (& $rand) q q | Out-Null',
    '  Write-Host "directory restore password reset"',
    "} catch {",
    '  Write-Host "restore password reset failed: $($_.Exception.Message)"',
    "}",
  ];
}

/** PowerShell EC2 runs once, on the lab's first boot. Same sync task as a self-hosted lab. */
export function firstBootScript(key: string, password: string, url: string): string {
  return [
    "<powershell>",
    '$dir = "C:\\ProgramData\\PurveX"',
    "New-Item -ItemType Directory -Path $dir -Force | Out-Null",
    'Start-Transcript -Path "$dir\\first-boot.log" -Append',
    "# Active Directory takes a minute or two after boot.",
    "for ($i = 0; $i -lt 60; $i++) { try { Import-Module ActiveDirectory -ErrorAction Stop; Get-ADDomain -ErrorAction Stop | Out-Null; break } catch { Start-Sleep -Seconds 10 } }",
    `Set-ADAccountPassword -Identity Administrator -Reset -NewPassword (ConvertTo-SecureString ${ps(password)} -AsPlainText -Force)`,
    "# Link the image's build script to this student, the same way the Range download does.",
    '$text = Get-Content -LiteralPath "$dir\\image\\Build-Environment.ps1" -Raw',
    `$text = $text.Replace('[string]$PurvexKey = ""', ${ps(`[string]$PurvexKey = ${ps(key)}`)}).Replace('[string]$PurvexUrl = ""', ${ps(`[string]$PurvexUrl = ${ps(url)}`)})`,
    'New-Item -ItemType Directory -Path "$dir\\hosted" -Force | Out-Null',
    'Set-Content -LiteralPath "$dir\\hosted\\Build-Environment.ps1" -Value $text -Encoding UTF8',
    '& powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$dir\\hosted\\Build-Environment.ps1" -InstallSync',
    // Last, so nothing else in first boot runs across a Kerberos key change. The
    // sync that follows talks to Range over HTTPS and does not use Kerberos.
    ...rekeyLines(),
    "Stop-Transcript",
    "</powershell>",
  ].join("\r\n");
}

/** Thrown when every pod security group is taken. Raising var.pod_slots in
 *  Terraform and applying again makes more; they cost nothing while empty. */
export class PodSlotsFullError extends Error {
  constructor() {
    super("Every lab slot is in use right now. Try again in a few minutes, or email support@purvex.io.");
    this.name = "PodSlotsFullError";
  }
}

// ---- pod security group ---------------------------------------------------
// Terraform makes casefile-pod-0 .. casefile-pod-N, each one a group only one
// student's two machines ever share. We look the slot's group up by name rather
// than keeping a list of ids in the environment, and cache it: the ids never
// change once Terraform has made them.

const podGroupIds = new Map<number, string>();

async function podSecurityGroup(slot: number): Promise<string> {
  const cached = podGroupIds.get(slot);
  if (cached) return cached;
  const name = `casefile-pod-${slot}`;
  // Both the name and our own tag, so this can only ever find a group Terraform
  // made for a pod. A group named the same in some other VPC would be refused by
  // RunInstances anyway, but matching on the tag means it is never even picked.
  const out = await ec2().send(
    new DescribeSecurityGroupsCommand({
      Filters: [
        { Name: "group-name", Values: [name] },
        { Name: "tag:casefile-pod", Values: ["true"] },
      ],
    })
  );
  const id = out.SecurityGroups?.[0]?.GroupId;
  if (!id) throw new Error(`No security group named ${name}. Raise pod_slots in Terraform and apply.`);
  podGroupIds.set(slot, id);
  return id;
}

// ---- the Ubuntu server ----------------------------------------------------

const sh = (v: string) => `'${v.replace(/'/g, `'\\''`)}'`;

/**
 * Cloud-init for the Ubuntu server, which boots standalone: its own local
 * account, its own services, not joined to the domain. Joining it is a lab the
 * student does by hand, so this only gets them as far as the starting line --
 * the domain controller is in /etc/hosts and the tools a join needs are already
 * installed, and the rest is theirs to work out.
 *
 * DNS is left pointing at the Amazon resolver on purpose. AWS exempts its own
 * resolver from security group rules, so name resolution and apt keep working
 * on a pod whose egress is 80 and 443 only -- and pointing resolution at the
 * domain controller instead is the first real step of the join.
 */
export function linuxCloudInit(dcIp: string, password: string): string {
  return [
    "#!/bin/bash",
    "set -x",
    "exec > /var/log/purvex-first-boot.log 2>&1",
    "hostnamectl set-hostname web01",
    // The domain controller by name, so the student can reach it before they fix DNS.
    `echo ${sh(`${dcIp} dc01.purvexfinancial.local dc01`)} >> /etc/hosts`,
    `echo ${sh("127.0.0.1 web01 web01.purvexfinancial.local")} >> /etc/hosts`,
    // The account the browser signs in with. Guacamole signs in with a password
    // and the Canonical image turns password logins off, so put it back in a file
    // that sorts ahead of the image's own: sshd keeps the first setting it reads.
    "id -u student >/dev/null 2>&1 || useradd -m -s /bin/bash -G sudo student",
    `echo ${sh(`student:${password}`)} | chpasswd`,
    `echo ${sh("PasswordAuthentication yes")} > /etc/ssh/sshd_config.d/00-purvex.conf`,
    `echo ${sh("PermitRootLogin no")} >> /etc/ssh/sshd_config.d/00-purvex.conf`,
    "systemctl restart ssh || systemctl restart sshd",
    // The tools the domain-join lab needs, plus what Tier 1 work on a Linux box
    // takes. Installed now so the lab does not depend on apt being reachable.
    "export DEBIAN_FRONTEND=noninteractive",
    "apt-get update -y",
    "apt-get install -y --no-install-recommends realmd sssd sssd-tools adcli samba-common-bin krb5-user packagekit oddjob oddjob-mkhomedir libnss-sss libpam-sss ldap-utils dnsutils net-tools auditd curl",
    // Packet capture for the Week 3 labs. Wireshark asks at install time whether
    // non-root users may capture, and a noninteractive install answers no, which
    // leaves dumpcap without the capability and the tool listing no interfaces.
    // Preseed yes, then put student in the group the postinst grants capture to.
    `echo ${sh("wireshark-common wireshark-common/install-setuid boolean true")} | debconf-set-selections`,
    "apt-get install -y --no-install-recommends tcpdump tshark wireshark",
    "usermod -aG wireshark student",
    // A member server with nothing to serve is a thin lab, so it has a web server
    // and a database to look after, the way a real one would.
    "apt-get install -y --no-install-recommends nginx",
    "systemctl enable --now nginx",
    `echo ${sh("web01 -- PurveX Financial internal")} > /var/www/html/index.html`,
    // A desktop, so the Ubuntu half is a machine you look at rather than a
    // terminal. XFCE because it runs in the memory a lab instance has, and
    // xrdp because the gateway already speaks RDP to the domain controller and
    // the pod group already allows 3389 to both machines.
    //
    // Recommends are left in here: a desktop without them comes up missing the
    // session bits that make it usable.
    "apt-get install -y xfce4 xfce4-goodies xrdp dbus-x11 x11-xserver-utils",
    // xrdp reads this to decide what to start. The image's default tries the
    // system session, which on a server install is nothing.
    `echo ${sh("#!/bin/sh")} > /etc/xrdp/startwm.sh`,
    `echo ${sh("export XDG_SESSION_DESKTOP=xfce")} >> /etc/xrdp/startwm.sh`,
    `echo ${sh("export XDG_CURRENT_DESKTOP=XFCE")} >> /etc/xrdp/startwm.sh`,
    `echo ${sh("exec startxfce4")} >> /etc/xrdp/startwm.sh`,
    "chmod +x /etc/xrdp/startwm.sh",
    `echo ${sh("xfce4-session")} > /home/student/.xsession`,
    "chown student:student /home/student/.xsession",
    // xrdp reads the machine certificate, which is root-owned by default.
    // A browser, because a desktop without one is a desktop that cannot reach
    // the web -- which is most of what the egress rules on this pod are for.
    // Mozilla's own .deb rather than the snap: the snap is a quarter of a
    // gigabyte and takes the better part of a minute to open the first time on
    // an instance this size, which reads as a broken lab.
    "install -d -m 0755 /etc/apt/keyrings",
    "curl -fsSL https://packages.mozilla.org/apt/repo-signing-key.gpg -o /etc/apt/keyrings/packages.mozilla.org.asc",
    `echo ${sh("deb [signed-by=/etc/apt/keyrings/packages.mozilla.org.asc] https://packages.mozilla.org/apt mozilla main")} > /etc/apt/sources.list.d/mozilla.list`,
    // Without the pin, apt prefers Ubuntu's firefox package, which is a stub
    // that pulls the snap back in.
    `echo ${sh("Package: *")} > /etc/apt/preferences.d/mozilla`,
    `echo ${sh("Pin: origin packages.mozilla.org")} >> /etc/apt/preferences.d/mozilla`,
    `echo ${sh("Pin-Priority: 1000")} >> /etc/apt/preferences.d/mozilla`,
    "apt-get update -y",
    "apt-get install -y firefox || apt-get install -y --no-install-recommends epiphany-browser",
    // The desktop asks xdg which browser to open a link with, and on a server
    // install the answer is nothing.
    "update-alternatives --install /usr/bin/x-www-browser x-www-browser /usr/bin/firefox 200 || true",
    "xdg-settings set default-web-browser firefox.desktop || true",
    // On the desktop itself, so it is the first thing the student sees.
    "install -d -m 0755 -o student -g student /home/student/Desktop",
    "cp /usr/share/applications/firefox.desktop /home/student/Desktop/firefox.desktop 2>/dev/null || true",
    "chown student:student /home/student/Desktop/firefox.desktop 2>/dev/null || true",
    "chmod +x /home/student/Desktop/firefox.desktop 2>/dev/null || true",
    "adduser xrdp ssl-cert || true",
    "systemctl enable --now xrdp",
    "echo first boot finished",
  ].join("\n");
}

// ---- AWS ------------------------------------------------------------------

async function describe(instanceId: string) {
  const out = await ec2().send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));
  const inst = out.Reservations?.[0]?.Instances?.[0];
  return inst ? { state: inst.State?.Name ?? "unknown", privateIp: inst.PrivateIpAddress ?? null } : null;
}

const stopAtFromNow = () => new Date(Date.now() + cfg().sessionHours * 3600_000).toISOString();

/**
 * Builds a student's pod: their domain controller, then the Ubuntu server beside
 * it in the same security group.
 *
 * The domain controller is saved before the Ubuntu server is launched, so a
 * failure on the second machine leaves a working one-machine pod rather than an
 * EC2 instance nothing in the database knows about. A pod with no Ubuntu server
 * is what every pod was before, and the rest of this file treats it that way.
 */
async function launch(userId: string): Promise<HostedLabRow> {
  const c = cfg();

  // The slot picks the security group that isolates this pod. Without a pool
  // configured yet, fall back to the shared group and a single machine: that is
  // how labs ran before pods, and it keeps a half-finished rollout working.
  const slot = c.podSlots ? await claimPodSlot(userId, c.podSlots) : null;
  if (c.podSlots && slot === null) throw new PodSlotsFullError();
  const securityGroup = slot === null ? c.securityGroup : await podSecurityGroup(slot);

  const key = await createLabKey(userId);
  const password = newPassword();
  const tags = (role: string) => [
    { Key: "Name", Value: `casefile-${role}-${userId.slice(0, 8)}` },
    { Key: "casefile-lab", Value: "true" },
    { Key: "casefile-user", Value: userId },
    { Key: "casefile-role", Value: role },
  ];
  const out = await ec2().send(
    new RunInstancesCommand({
      ImageId: c.ami,
      InstanceType: c.instanceType as never,
      MinCount: 1,
      MaxCount: 1,
      SubnetId: c.subnet,
      SecurityGroupIds: [securityGroup],
      UserData: Buffer.from(firstBootScript(key, password, c.syncUrl)).toString("base64"),
      // Never throttled to 20% CPU. Costs a little more only under long heavy load.
      CreditSpecification: { CpuCredits: "unlimited" },
      // Stop keeps memory on disk, so the lab resumes with the student's windows still open.
      HibernationOptions: { Configured: true },
      MetadataOptions: { HttpTokens: "required", HttpPutResponseHopLimit: 1 },
      InstanceInitiatedShutdownBehavior: "stop",
      // The SSM agent role, so Shift incidents can be fired into the lab. Omitted when not set up.
      ...(c.instanceProfile ? { IamInstanceProfile: { Name: c.instanceProfile } } : {}),
      TagSpecifications: [
        { ResourceType: "instance", Tags: tags("dc") },
        { ResourceType: "volume", Tags: tags("dc") },
      ],
    })
  );
  const dc = out.Instances?.[0];
  const instanceId = dc?.InstanceId;
  if (!instanceId) throw new Error("AWS did not return an instance.");

  const row: HostedLabRow = {
    instanceId,
    passwordEnc: sealPassword(password),
    stopAt: stopAtFromNow(),
    createdAt: new Date().toISOString(),
    linuxInstanceId: null,
    // Both set together once the Ubuntu server is up. A password with no machine
    // to use it on would only be a stale secret sitting in the database.
    linuxPasswordEnc: null,
    podSlot: slot,
  };
  await saveHostedLab(userId, row);

  // The Ubuntu server needs the domain controller's address, which RunInstances
  // has already assigned. A private address survives stop and start, so writing
  // it into the Ubuntu server's /etc/hosts once at first boot is enough.
  if (!c.linuxAmi || slot === null || !dc.PrivateIpAddress) return row;
  const linux = await launchLinux(securityGroup, dc.PrivateIpAddress, tags("linux")).catch((err) => {
    console.error("pod Ubuntu server failed to launch", err instanceof Error ? err.message : err);
    return null;
  });
  if (!linux) return row;
  const full = { ...row, linuxInstanceId: linux.instanceId, linuxPasswordEnc: sealPassword(linux.password) };
  await saveHostedLab(userId, full);
  return full;
}

/** The Ubuntu half of a pod. No hibernation: xrdp hands back a fresh session on
 *  reconnect anyway, and a plain stop is one less thing to go wrong. */
async function launchLinux(
  securityGroup: string,
  dcIp: string,
  tags: { Key: string; Value: string }[]
): Promise<{ instanceId: string; password: string }> {
  const c = cfg();
  const password = newPassword();
  const out = await ec2().send(
    new RunInstancesCommand({
      ImageId: c.linuxAmi,
      InstanceType: c.linuxInstanceType as never,
      MinCount: 1,
      MaxCount: 1,
      SubnetId: c.subnet,
      SecurityGroupIds: [securityGroup],
      UserData: Buffer.from(linuxCloudInit(dcIp, password)).toString("base64"),
      CreditSpecification: { CpuCredits: "unlimited" },
      MetadataOptions: { HttpTokens: "required", HttpPutResponseHopLimit: 1 },
      InstanceInitiatedShutdownBehavior: "stop",
      ...(c.instanceProfile ? { IamInstanceProfile: { Name: c.instanceProfile } } : {}),
      BlockDeviceMappings: [{ DeviceName: "/dev/sda1", Ebs: { VolumeSize: 20, VolumeType: "gp3", Encrypted: true, DeleteOnTermination: true } }],
      TagSpecifications: [
        { ResourceType: "instance", Tags: tags },
        { ResourceType: "volume", Tags: tags },
      ],
    })
  );
  const instanceId = out.Instances?.[0]?.InstanceId;
  if (!instanceId) throw new Error("AWS did not return the Ubuntu server.");
  return { instanceId, password };
}

/** Every machine in the pod. A reserved-but-unbuilt row holds no machine yet, and
 *  a pod from before the Ubuntu server holds only its domain controller. */
function podInstanceIds(row: HostedLabRow): string[] {
  return [row.instanceId, row.linuxInstanceId].filter((id): id is string => Boolean(id) && id !== POD_RESERVED);
}

export async function hostedLabStatus(userId: string): Promise<HostedLabStatus> {
  const c = cfg();
  const none: HostedLabStatus = { state: "none", stopAt: null, startedAt: null, firstBoot: false, instanceType: c.instanceType, linux: false };
  const row = await loadHostedLab(userId);
  if (!row || row.instanceId === POD_RESERVED) return none;
  const inst = await describe(row.instanceId).catch(() => null);
  if (!inst || inst.state === "terminated" || inst.state === "shutting-down") return none;
  // Ready once the lab has sent a snapshot since it was created: first boot has finished linking it.
  const lab = await loadLabState(userId).catch(() => null);
  const linked = Boolean(lab && Date.parse(lab.uploadedAt) >= Date.parse(row.createdAt));
  const map: Record<string, HostedLabState> = { pending: "starting", running: linked ? "ready" : "starting", stopping: "stopping", stopped: "stopped" };
  // Each start sets the stop time a session ahead, so the start time is one session before it.
  const startedAt = row.stopAt ? new Date(Date.parse(row.stopAt) - c.sessionHours * 3600_000).toISOString() : null;
  return { state: map[inst.state] ?? "starting", stopAt: row.stopAt, startedAt, firstBoot: !linked, instanceType: c.instanceType, linux: Boolean(row.linuxInstanceId) };
}

export async function startHostedLab(userId: string): Promise<void> {
  const row = await loadHostedLab(userId);
  // Not caught on purpose. A describe that throws means AWS could not be
  // reached, which is not the same thing as the lab being gone, and treating
  // the two alike is what left five domain controllers running: the call
  // failed, the branch below built a second pod, and the row stopped naming
  // the first one. Failing the Start is the cheaper mistake.
  const inst = row && row.instanceId !== POD_RESERVED ? await describe(row.instanceId) : null;
  if (!row || !inst || inst.state === "terminated" || inst.state === "shutting-down") {
    // Whatever the old row still points at is about to stop being tracked, so
    // take it down first. A machine nothing in the database names is a machine
    // no stop button and no reaper can ever reach again.
    if (row) await terminatePod(row);
    await chargeSession(userId);
    try {
      await launch(userId);
    } catch (err) {
      await refundSession(userId);
      throw err;
    }
    return;
  }
  // A running lab still inside its window is the session they already paid for,
  // so pressing Start again is a no-op. Resetting the stop time here instead
  // would hand out free hours to anyone who kept pressing it.
  if (inst.state === "running" && row.stopAt && Date.parse(row.stopAt) > Date.now()) return;
  await chargeSession(userId);
  // Both machines come back together. A student who opens the Ubuntu server and
  // finds it stopped has a broken lab, not half a lab, so the pod starts as one.
  // A failed resume hands the session's hours back, the same as a failed launch
  // above, rather than charging for a pod that never came up.
  const ids = podInstanceIds(row);
  try {
    if (ids.length) await ec2().send(new StartInstancesCommand({ InstanceIds: ids }));
    await saveHostedLab(userId, { ...row, stopAt: stopAtFromNow() });
  } catch (err) {
    await refundSession(userId);
    throw err;
  }
}

/** Hibernate suits the domain controller: the student gets their windows back as
 *  they left them. The Ubuntu server runs no desktop, so it takes a plain stop. */
async function stopInstance(instanceId: string, hibernate: boolean) {
  if (!hibernate) {
    await ec2().send(new StopInstancesCommand({ InstanceIds: [instanceId] }));
    return;
  }
  try {
    await ec2().send(new StopInstancesCommand({ InstanceIds: [instanceId], Hibernate: true }));
  } catch {
    // Hibernation is not ready for a few minutes after launch. A plain stop still keeps the disk.
    await ec2().send(new StopInstancesCommand({ InstanceIds: [instanceId] }));
  }
}

/** Stops every machine in the pod that is up. Each one on its own, so a failure
 *  on the Ubuntu server still stops the domain controller -- the expensive half. */
async function stopPod(row: HostedLabRow): Promise<boolean> {
  let stopped = false;
  for (const id of podInstanceIds(row)) {
    const inst = await describe(id).catch(() => null);
    if (inst?.state !== "running" && inst?.state !== "pending") continue;
    try {
      await stopInstance(id, id === row.instanceId);
      stopped = true;
    } catch (err) {
      console.error("pod stop failed", id, err instanceof Error ? err.message : err);
    }
  }
  return stopped;
}

/** Every machine a row still names, gone. Used when a row is about to be
 *  replaced or dropped: after that moment nothing knows these instances exist,
 *  so this is the last chance to stop paying for them. Best effort, because a
 *  machine that is already terminated must not block the launch behind it. */
async function terminatePod(row: HostedLabRow): Promise<void> {
  const ids = podInstanceIds(row);
  if (!ids.length) return;
  await ec2()
    .send(new TerminateInstancesCommand({ InstanceIds: ids }))
    .catch((err) => console.error("pod terminate failed", ids.join(","), err instanceof Error ? err.message : err));
}

export async function stopHostedLab(userId: string): Promise<void> {
  const row = await loadHostedLab(userId);
  if (!row) return;
  await stopPod(row);
  // Clearing stopAt first would lose the only record of how much of the session
  // was left, and a second stop then refunds nothing because it is already null.
  await refundUnused(userId, row.stopAt);
  await saveHostedLab(userId, { ...row, stopAt: null });
}

export async function extendHostedLab(userId: string): Promise<string | null> {
  const row = await loadHostedLab(userId);
  if (!row) return null;
  await chargeSession(userId);
  const stopAt = stopAtFromNow();
  await saveHostedLab(userId, { ...row, stopAt });
  return stopAt;
}

/** A clean pod from the image. The old machines and everything the student
 *  changed in them are gone. The pod slot goes back to the pool and is claimed
 *  again by the new pod, so resetting does not use slots up. */
export async function resetHostedLab(userId: string): Promise<void> {
  // A reset boots a fresh lab, which is a new session like any other.
  await chargeSession(userId);
  const row = await loadHostedLab(userId);
  if (row) {
    await terminatePod(row);
    await refundUnused(userId, row.stopAt);
    await deleteHostedLab(userId);
  }
  // Same deal as a first start: the session is charged before the lab exists,
  // so a launch that throws must hand the hours back.
  try {
    await launch(userId);
  } catch (err) {
    await refundSession(userId);
    throw err;
  }
}

// ---- browser access -------------------------------------------------------

/**
 * A Guacamole encrypted-JSON link (guacamole-auth-json): HMAC-SHA256 signature
 * plus the JSON, AES-128-CBC with a zero IV, base64. Valid until the lab's stop
 * time (at most 8 hours): Guacamole drops the connection from the session once
 * the link expires, so a refresh or reconnect during a session needs it alive.
 * Guacamole refuses a link that was already used, so it cannot be replayed.
 */
/**
 * The Ubuntu box's local sign-in, for the student to read.
 *
 * Guacamole signs them in with this already, so the desktop never asks for it.
 * `sudo` does, and the domain-join lab needs sudo, so without somewhere to read
 * this a student hits a prompt for a credential that exists only sealed in the
 * database. Deliberately not part of the polled status response: that is held in
 * client state for the whole session, and this only needs to exist for the
 * moment they ask for it.
 */
export async function linuxCredentials(userId: string): Promise<{ username: string; password: string } | null> {
  const row = await loadHostedLab(userId);
  if (!row?.linuxInstanceId || !row.linuxPasswordEnc) return null;
  const linux = await describe(row.linuxInstanceId).catch(() => null);
  if (linux?.state !== "running") return null;
  return { username: "student", password: openPassword(row.linuxPasswordEnc) };
}

export async function hostedLabLink(userId: string): Promise<string | null> {
  const row = await loadHostedLab(userId);
  if (!row || row.instanceId === POD_RESERVED) return null;
  const inst = await describe(row.instanceId);
  if (inst?.state !== "running" || !inst.privateIp) return null;
  const c = cfg();
  const now = Date.now();
  const stopAt = row.stopAt ? Date.parse(row.stopAt) : now + c.sessionHours * 3600_000;
  // The Ubuntu server as a second connection in the same link, so the student
  // picks a machine in Guacamole rather than coming back here for another link.
  // Left out if it is not running yet: a connection to a machine that is still
  // booting fails in the browser with nothing useful to say.
  const linux = row.linuxInstanceId && row.linuxPasswordEnc ? await describe(row.linuxInstanceId).catch(() => null) : null;
  const linuxConnection =
    linux?.state === "running" && linux.privateIp && row.linuxPasswordEnc
      ? {
          "web01 (Ubuntu)": {
            protocol: "rdp",
            parameters: {
              hostname: linux.privateIp,
              port: "3389",
              username: "student",
              password: openPassword(row.linuxPasswordEnc),
              // xrdp presents a self-signed certificate, and the gateway is the
              // only thing that can reach the port, so there is nothing for a
              // certificate to prove here.
              security: "any",
              "ignore-cert": "true",
              "resize-method": "display-update",
              "enable-wallpaper": "true",
            },
          },
        }
      : {};
  const payload = JSON.stringify({
    username: `lab-${userId.slice(0, 8)}`,
    expires: Math.min(now + 8 * 3600_000, Math.max(now + 15 * 60_000, stopAt)),
    connections: {
      "PurveX Financial DC": {
        protocol: "rdp",
        parameters: {
          hostname: inst.privateIp,
          port: "3389",
          username: "Administrator",
          domain: "PURVEXFINANCIAL",
          password: openPassword(row.passwordEnc),
          security: "nla",
          "ignore-cert": "true",
          "resize-method": "display-update",
          "color-depth": "24",
          "enable-wallpaper": "false",
          "enable-theming": "false",
          "enable-font-smoothing": "true",
          "disable-audio": "true",
          "enable-drive": "false",
          "server-layout": "en-us-qwerty",
        },
      },
      ...linuxConnection,
    },
  });
  const key = Buffer.from(c.gatewayKey, "hex");
  const signature = createHmac("sha256", key).update(payload).digest();
  const cipher = createCipheriv("aes-128-cbc", key, Buffer.alloc(16, 0));
  const data = Buffer.concat([cipher.update(Buffer.concat([signature, Buffer.from(payload, "utf8")])), cipher.final()]).toString("base64");
  return `${c.gatewayUrl}/?data=${encodeURIComponent(data)}`;
}

// ---- Shift incident injection ---------------------------------------------
// Fires one of the fixed Incident-*.ps1 scripts baked into the lab image, so a
// real incident happens in the student's own lab. The script name comes only
// from the server-side incident library and is checked against a strict pattern;
// no student input reaches here.

let ssmClient: SSMClient | null = null;
function ssm() {
  const c = cfg();
  ssmClient ??= new SSMClient({ region: c.region, credentials: { accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey } });
  return ssmClient;
}

const INCIDENT_SCRIPT = /^Incident-[A-Za-z]+\.ps1$/;

async function runningInstance(userId: string): Promise<string | null> {
  const row = await loadHostedLab(userId);
  if (!row) return null;
  const inst = await describe(row.instanceId).catch(() => null);
  return inst?.state === "running" ? row.instanceId : null;
}

/** True only when SSM can actually run a command on the instance. An instance can
 *  be "running" in EC2 while its SSM agent is still coming up after boot, and
 *  SendCommand then throws "Instances not in a valid state". Checking the ping
 *  status first lets us skip quietly and retry on the next poll instead. */
async function ssmOnline(instanceId: string): Promise<boolean> {
  try {
    const out = await ssm().send(new DescribeInstanceInformationCommand({ Filters: [{ Key: "InstanceIds", Values: [instanceId] }] }));
    return out.InstanceInformationList?.[0]?.PingStatus === "Online";
  } catch {
    return false;
  }
}

/**
 * PowerShell that downloads an incident script (and its shared helper) from the
 * site and runs it. Fetching at run time means an incident fix ships by
 * deploying, with no lab image rebuild. The script name is fixed, server-side.
 */
/** Render script args as safe PowerShell flags. Values come from our own roster,
 *  so we still allow only account-name characters and commas (for list args). */
function argFlags(args?: Record<string, string>): string {
  if (!args) return "";
  const ok = /^[A-Za-z0-9._,-]+$/;
  return Object.entries(args)
    .filter(([k, v]) => /^[A-Za-z]+$/.test(k) && ok.test(v))
    .map(([k, v]) => ` -${k} ${v}`)
    .join("");
}

function incidentCommand(script: string, undo: boolean, args?: Record<string, string>): string {
  const base = `${cfg().syncUrl}/lab-scripts/incidents`;
  const dir = "$env:TEMP\\range-inc";
  const arg = `${undo ? " -Undo" : ""}${argFlags(args)}`;
  return [
    `$d="${dir}"`,
    "New-Item -ItemType Directory -Path $d -Force | Out-Null",
    "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12",
    `Invoke-WebRequest -Uri '${base}/Incident-Common.ps1' -OutFile "$d\\Incident-Common.ps1" -UseBasicParsing`,
    `Invoke-WebRequest -Uri '${base}/${script}' -OutFile "$d\\${script}" -UseBasicParsing`,
    `& "$d\\${script}"${arg}`,
  ].join("; ");
}

async function sendIncident(userId: string, script: string, undo: boolean, args?: Record<string, string>): Promise<boolean> {
  if (!INCIDENT_SCRIPT.test(script)) return false;
  const id = await runningInstance(userId);
  if (!id) return false;
  // The instance is running but SSM may not be ready yet; skip quietly and let the
  // next poll retry, rather than firing a command that throws and logs an error.
  if (!(await ssmOnline(id))) return false;
  try {
    await ssm().send(
      new SendCommandCommand({
        InstanceIds: [id],
        DocumentName: "AWS-RunPowerShellScript",
        Comment: undo ? "Range Shift cleanup" : "Range Shift incident",
        TimeoutSeconds: 180,
        Parameters: { commands: [incidentCommand(script, undo, args)] },
      })
    );
    return true;
  } catch (err) {
    console.error("sendIncident failed", script, err instanceof Error ? err.message : err);
    return false;
  }
}

/** Fire an incident into the student's lab. False if the lab is not running or SSM is not set up. */
export function injectIncident(userId: string, script: string, args?: Record<string, string>): Promise<boolean> {
  return sendIncident(userId, script, false, args);
}

/** Undo the shift's incidents so the lab returns to baseline for missions, using
 *  the same args they were fired with so the right victims are restored. Best effort. */
export async function cleanupShiftLab(userId: string, items: { script: string; args?: Record<string, string> }[]): Promise<void> {
  for (const { script, args } of items) {
    if (INCIDENT_SCRIPT.test(script)) await sendIncident(userId, script, true, args).catch(() => false);
  }
}

// ---- on-demand lab sync ---------------------------------------------------
// The installed script syncs on a loop, but a change outside the watched OUs
// waits for the ~1-minute heartbeat. When a student asks us to grade, we push a
// snapshot immediately over SSM so the fresh state lands in seconds. Throttled
// so repeated polls do not queue a burst of commands.

const lastSyncAt = new Map<string, number>();
const SYNC_THROTTLE_MS = 2500;

/**
 * Tell the student's hosted lab to send a fresh snapshot now. Returns true if a
 * command was sent. Best effort: false when there is no running hosted lab, SSM
 * is not set up, or a sync was just requested.
 */
export async function requestLabSync(userId: string, force = false): Promise<boolean> {
  if (!force) {
    const last = lastSyncAt.get(userId) ?? 0;
    if (Date.now() - last < SYNC_THROTTLE_MS) return false;
  }
  const id = await runningInstance(userId);
  if (!id) return false;
  // Skip quietly when SSM is not ready yet, so a boot-window sync does not throw.
  if (!(await ssmOnline(id))) return false;
  lastSyncAt.set(userId, Date.now());
  const command = "$ProgressPreference='SilentlyContinue'; $s=Join-Path $env:ProgramData 'PurveX\\Build-Environment.ps1'; if(Test-Path $s){ & $s -SyncOnly }";
  try {
    await ssm().send(
      new SendCommandCommand({
        InstanceIds: [id],
        DocumentName: "AWS-RunPowerShellScript",
        Comment: "Range on-demand lab sync",
        TimeoutSeconds: 120,
        Parameters: { commands: [command] },
      })
    );
    return true;
  } catch (err) {
    console.error("requestLabSync failed", err instanceof Error ? err.message : err);
    return false;
  }
}

// ---- auto-stop ------------------------------------------------------------

/**
 * Terminates labs nobody has touched in HOSTED_LAB_IDLE_DAYS and forgets them.
 * A stopped lab still bills for its disks every month, so a student who signed
 * up, opened the lab once and never came back costs us until they cancel. The
 * next Start builds them a clean one from the image, which is what a reset
 * already does -- so the loss is the state of a lab they stopped using.
 */
export async function reapIdleHostedLabs(): Promise<number> {
  const c = cfg();
  if (!c.idleDays) return 0;
  const before = new Date(Date.now() - c.idleDays * 86_400_000);
  let reaped = 0;
  for (const { userId, row } of await hostedLabsIdleSince(before)) {
    try {
      const ids = podInstanceIds(row);
      if (ids.length) await ec2().send(new TerminateInstancesCommand({ InstanceIds: ids }));
      // Deleting the row is what frees the pod's security group for someone else.
      await deleteHostedLab(userId);
      reaped++;
    } catch (err) {
      console.error("hosted lab reclaim failed", row.instanceId, err instanceof Error ? err.message : err);
    }
  }
  return reaped;
}

/** Stops every lab past its stop time. Run by the cron route. */
export async function stopDueHostedLabs(): Promise<number> {
  let stopped = 0;
  for (const { userId, row } of await hostedLabsDueToStop()) {
    try {
      if (await stopPod(row)) stopped++;
      await saveHostedLab(userId, { ...row, stopAt: null });
    } catch (err) {
      console.error("hosted lab auto-stop failed", row.instanceId, err instanceof Error ? err.message : err);
    }
  }
  return stopped;
}

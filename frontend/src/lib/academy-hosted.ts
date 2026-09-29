import "server-only";
import { createCipheriv, createDecipheriv, createHmac, randomBytes } from "crypto";
import {
  DescribeInstancesCommand,
  EC2Client,
  RunInstancesCommand,
  StartInstancesCommand,
  StopInstancesCommand,
  TerminateInstancesCommand,
} from "@aws-sdk/client-ec2";
import {
  createLabKey,
  deleteHostedLab,
  hostedLabsDueToStop,
  loadHostedLab,
  loadLabState,
  saveHostedLab,
  type HostedLabRow,
} from "@/lib/academy-store";

// Hosted labs: each student's own PurveX Financial domain controller in AWS,
// cloned from the image lab-environment/hosted builds. On first boot, EC2 user
// data links it to the student with a lab key and installs the same sync task a
// self-hosted lab uses, so Coach, the MCP server, missions and the portfolio
// see it the same way. Students open it in the browser through the Guacamole
// gateway with a signed link that expires in five minutes.

export type HostedLabState = "none" | "starting" | "ready" | "stopping" | "stopped";
export type HostedLabStatus = { state: HostedLabState; stopAt: string | null; firstBoot: boolean };

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
    gatewayUrl: (e.HOSTED_LAB_GATEWAY_URL || "").replace(/\/+$/, ""),
    gatewayKey: e.HOSTED_LAB_GATEWAY_KEY || "",
    secret: e.HOSTED_LAB_SECRET || "",
    syncUrl: (e.HOSTED_LAB_SYNC_URL || "https://purvex.io").replace(/\/+$/, ""),
    sessionHours: Math.min(8, Math.max(1, Number(e.HOSTED_LAB_SESSION_HOURS) || 3)),
    emails: (e.HOSTED_LAB_EMAILS || "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean),
  };
}

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
    "# Link the image's build script to this student, the same way the CaseFile download does.",
    '$text = Get-Content -LiteralPath "$dir\\image\\Build-Environment.ps1" -Raw',
    `$text = $text.Replace('[string]$PurvexKey = ""', ${ps(`[string]$PurvexKey = ${ps(key)}`)}).Replace('[string]$PurvexUrl = ""', ${ps(`[string]$PurvexUrl = ${ps(url)}`)})`,
    'New-Item -ItemType Directory -Path "$dir\\hosted" -Force | Out-Null',
    'Set-Content -LiteralPath "$dir\\hosted\\Build-Environment.ps1" -Value $text -Encoding UTF8',
    '& powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$dir\\hosted\\Build-Environment.ps1" -InstallSync',
    "Stop-Transcript",
    "</powershell>",
  ].join("\r\n");
}

// ---- AWS ------------------------------------------------------------------

async function describe(instanceId: string) {
  const out = await ec2().send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));
  const inst = out.Reservations?.[0]?.Instances?.[0];
  return inst ? { state: inst.State?.Name ?? "unknown", privateIp: inst.PrivateIpAddress ?? null } : null;
}

const stopAtFromNow = () => new Date(Date.now() + cfg().sessionHours * 3600_000).toISOString();

async function launch(userId: string): Promise<HostedLabRow> {
  const c = cfg();
  const key = await createLabKey(userId);
  const password = newPassword();
  const tags = [
    { Key: "Name", Value: `casefile-lab-${userId.slice(0, 8)}` },
    { Key: "casefile-lab", Value: "true" },
    { Key: "casefile-user", Value: userId },
  ];
  const out = await ec2().send(
    new RunInstancesCommand({
      ImageId: c.ami,
      InstanceType: c.instanceType as never,
      MinCount: 1,
      MaxCount: 1,
      SubnetId: c.subnet,
      SecurityGroupIds: [c.securityGroup],
      UserData: Buffer.from(firstBootScript(key, password, c.syncUrl)).toString("base64"),
      // Never throttled to 20% CPU. Costs a little more only under long heavy load.
      CreditSpecification: { CpuCredits: "unlimited" },
      // Stop keeps memory on disk, so the lab resumes with the student's windows still open.
      HibernationOptions: { Configured: true },
      MetadataOptions: { HttpTokens: "required", HttpPutResponseHopLimit: 1 },
      InstanceInitiatedShutdownBehavior: "stop",
      TagSpecifications: [
        { ResourceType: "instance", Tags: tags },
        { ResourceType: "volume", Tags: tags },
      ],
    })
  );
  const instanceId = out.Instances?.[0]?.InstanceId;
  if (!instanceId) throw new Error("AWS did not return an instance.");
  const row: HostedLabRow = { instanceId, passwordEnc: sealPassword(password), stopAt: stopAtFromNow(), createdAt: new Date().toISOString() };
  await saveHostedLab(userId, row);
  return row;
}

export async function hostedLabStatus(userId: string): Promise<HostedLabStatus> {
  const row = await loadHostedLab(userId);
  if (!row) return { state: "none", stopAt: null, firstBoot: false };
  const inst = await describe(row.instanceId).catch(() => null);
  if (!inst || inst.state === "terminated" || inst.state === "shutting-down") return { state: "none", stopAt: null, firstBoot: false };
  // Ready once the lab has sent a snapshot since it was created: first boot has finished linking it.
  const lab = await loadLabState(userId).catch(() => null);
  const linked = Boolean(lab && Date.parse(lab.uploadedAt) >= Date.parse(row.createdAt));
  const map: Record<string, HostedLabState> = { pending: "starting", running: linked ? "ready" : "starting", stopping: "stopping", stopped: "stopped" };
  return { state: map[inst.state] ?? "starting", stopAt: row.stopAt, firstBoot: !linked };
}

export async function startHostedLab(userId: string): Promise<void> {
  const row = await loadHostedLab(userId);
  const inst = row ? await describe(row.instanceId).catch(() => null) : null;
  if (!row || !inst || inst.state === "terminated" || inst.state === "shutting-down") {
    await launch(userId);
    return;
  }
  if (inst.state === "stopped") await ec2().send(new StartInstancesCommand({ InstanceIds: [row.instanceId] }));
  await saveHostedLab(userId, { ...row, stopAt: stopAtFromNow() });
}

async function stopInstance(instanceId: string) {
  try {
    await ec2().send(new StopInstancesCommand({ InstanceIds: [instanceId], Hibernate: true }));
  } catch {
    // Hibernation is not ready for a few minutes after launch. A plain stop still keeps the disk.
    await ec2().send(new StopInstancesCommand({ InstanceIds: [instanceId] }));
  }
}

export async function stopHostedLab(userId: string): Promise<void> {
  const row = await loadHostedLab(userId);
  if (!row) return;
  const inst = await describe(row.instanceId).catch(() => null);
  if (inst?.state === "running" || inst?.state === "pending") await stopInstance(row.instanceId);
  await saveHostedLab(userId, { ...row, stopAt: null });
}

export async function extendHostedLab(userId: string): Promise<string | null> {
  const row = await loadHostedLab(userId);
  if (!row) return null;
  const stopAt = stopAtFromNow();
  await saveHostedLab(userId, { ...row, stopAt });
  return stopAt;
}

/** A clean lab from the image. The old lab and everything the student changed in it are gone. */
export async function resetHostedLab(userId: string): Promise<void> {
  const row = await loadHostedLab(userId);
  if (row) {
    await ec2().send(new TerminateInstancesCommand({ InstanceIds: [row.instanceId] })).catch(() => {});
    await deleteHostedLab(userId);
  }
  await launch(userId);
}

// ---- browser access -------------------------------------------------------

/**
 * A Guacamole encrypted-JSON link (guacamole-auth-json): HMAC-SHA256 signature
 * plus the JSON, AES-128-CBC with a zero IV, base64. Valid for five minutes.
 */
export async function hostedLabLink(userId: string): Promise<string | null> {
  const row = await loadHostedLab(userId);
  if (!row) return null;
  const inst = await describe(row.instanceId);
  if (inst?.state !== "running" || !inst.privateIp) return null;
  const c = cfg();
  const payload = JSON.stringify({
    username: `lab-${userId.slice(0, 8)}`,
    expires: Date.now() + 5 * 60_000,
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
    },
  });
  const key = Buffer.from(c.gatewayKey, "hex");
  const signature = createHmac("sha256", key).update(payload).digest();
  const cipher = createCipheriv("aes-128-cbc", key, Buffer.alloc(16, 0));
  const data = Buffer.concat([cipher.update(Buffer.concat([signature, Buffer.from(payload, "utf8")])), cipher.final()]).toString("base64");
  return `${c.gatewayUrl}/?data=${encodeURIComponent(data)}`;
}

// ---- auto-stop ------------------------------------------------------------

/** Stops every lab past its stop time. Run by the cron route. */
export async function stopDueHostedLabs(): Promise<number> {
  let stopped = 0;
  for (const { userId, row } of await hostedLabsDueToStop()) {
    try {
      const inst = await describe(row.instanceId);
      if (inst?.state === "running" || inst?.state === "pending") {
        await stopInstance(row.instanceId);
        stopped++;
      }
      await saveHostedLab(userId, { ...row, stopAt: null });
    } catch (err) {
      console.error("hosted lab auto-stop failed", row.instanceId, err instanceof Error ? err.message : err);
    }
  }
  return stopped;
}

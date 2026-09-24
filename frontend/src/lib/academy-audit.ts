import "server-only";
import { seeded, shuffle, type Check, type Task } from "@/lib/academy-drills";
import type { LabSnapshot, LabUser } from "@/lib/academy-lab";
import type { Skill } from "@/lib/academy-score";

// A real audit of the student's own lab. Nothing here is invented: every
// finding is read from their latest snapshot, and every fix is checked against
// the next one. If the lab has nothing wrong, there is nothing to fix, and the
// daily drill uses a written or multiple-choice case instead.

/** Objects the Ticket Queue and the 2 AM Login missions are about. Left out so a finding never spoils them. */
const MISSION_OBJECTS = new Set(["old.intern", "svc-backup-job", "jamie.torres", "riley.kwan", "casey.reed", "taylor.osei", "alex.rivera"]);
const MISSION_COMPUTERS = new Set(["wm-wks07", "ops-wks03"]);
const DAY = 24 * 60 * 60 * 1000;

export type FindingKind =
  | "pwd-never-expires"
  | "weak-account-flags"
  | "disabled-with-access"
  | "misplaced-account"
  | "distribution-group"
  | "stale-account"
  | "stale-computer"
  | "lockout-policy"
  | "password-policy"
  | "audit-gap"
  | "log-size"
  | "admin-password-policy"
  | "admin-review";

export type Finding = {
  id: string;
  kind: FindingKind;
  job: string;
  skill: Skill;
  severity: "high" | "medium" | "low";
  title: string;
  /** Plain statement of what the audit found. */
  facts: string;
  /** What a fix must make true. Absent for findings that need judgement, not a change. */
  task?: Task;
  summary: string;
};

export type ChangeBrief = Finding & { theme: string };

const human = (s: string) => s.replace(/([a-z])([A-Z])/g, "$1 $2");
const nameOf = (u: LabUser) => u.name || u.sam;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z]/g, "");
const ADMIN_GROUPS = ["IT Admins", "Server Admins", "Domain Admins"];
const ADUC = "Open Active Directory Users and Computers (Win+R, dsa.msc).";
const GPMC = "Open Group Policy Management (Win+R, gpmc.msc)";
const SYNC_STEP = "Wait for the lab to report (about 15 minutes) or run Build-Environment.ps1 -SyncOnly on the domain controller, then press Check my lab.";
const secStep = (t: string) => `${t} Then run gpupdate /force on the domain controller.`;
const isService = (u: LabUser) => /^svc[-_.]/i.test(u.sam) || /^OU=ServiceAccounts/i.test(u.container);
const usable = (u: LabUser) => !MISSION_OBJECTS.has(u.sam.toLowerCase());
const deptOu = (container: string) => /OU=([^,]+),OU=Departments$/i.exec(container)?.[1] ?? null;

function ageDays(iso: string | null): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? null : (Date.now() - t) / DAY;
}

/** Everything wrong with the lab right now, worst first. */
export function auditLab(s: LabSnapshot): Finding[] {
  const out: Finding[] = [];
  const admins = ADMIN_GROUPS.filter((g) => s.groups.some((x) => x.name.toLowerCase() === g.toLowerCase()));

  // ---- accounts -----------------------------------------------------------
  for (const u of s.users.filter((x) => x.enabled && usable(x))) {
    const name = nameOf(u);
    if (u.passwordNeverExpires && !isService(u)) {
      out.push({
        id: `pwd-never-expires:${u.sam}`,
        kind: "pwd-never-expires",
        job: "password-hygiene",
        skill: "security",
        severity: "medium",
        title: `${name}'s password never expires`,
        facts: `${name} (${u.sam}) has "Password never expires" set. Only service accounts should. A person's password that never expires stays valid forever if it leaks.`,
        task: {
          checks: [
            { c: { t: "noexpire", sam: u.sam, want: false }, label: `${name}'s password can expire like everyone else's` },
            { c: { t: "enabled", sam: u.sam, want: true }, label: `${name}'s account is still enabled` },
          ],
          guide: [ADUC, "Find the account, open Properties, and go to the Account tab.", "Under Account options, clear Password never expires.", SYNC_STEP],
          runbook: [
            `Get-ADUser ${u.sam} -Properties PasswordNeverExpires | Select-Object Name,PasswordNeverExpires`,
            `Set-ADUser -Identity ${u.sam} -PasswordNeverExpires $false`,
          ],
        },
        summary: `${u.sam}'s password can expire and the account is unchanged otherwise.`,
      });
    }
    if (u.pwdNotRequired || u.noPreAuth) {
      const flags = [u.pwdNotRequired ? "does not require a password" : "", u.noPreAuth ? "does not require Kerberos pre-authentication" : ""].filter(Boolean).join(" and ");
      const checks: { c: Check; label: string }[] = [];
      if (u.pwdNotRequired) checks.push({ c: { t: "flag", sam: u.sam, flag: "pwdNotRequired", want: false }, label: `${name} requires a password` });
      if (u.noPreAuth) checks.push({ c: { t: "flag", sam: u.sam, flag: "noPreAuth", want: false }, label: `${name} requires Kerberos pre-authentication` });
      checks.push({ c: { t: "enabled", sam: u.sam, want: true }, label: `${name} is still enabled` });
      out.push({
        id: `weak-account-flags:${u.sam}`,
        kind: "weak-account-flags",
        job: "harden-account",
        skill: "security",
        severity: "high",
        title: `${name} ${flags}`,
        facts: `${name} (${u.sam}) ${flags}. Anyone on the network can ask for this account's password hash and crack it offline, or use it with no password at all.`,
        task: {
          checks,
          guide: [
            `${ADUC} Find the account and open its Properties.`,
            'On the Account tab, clear "Do not require Kerberos preauthentication" if it is ticked.',
            `The no-password flag is not shown in the console. Clear it in PowerShell: Set-ADUser ${u.sam} -PasswordNotRequired $false, then set a real password with Set-ADAccountPassword.`,
            SYNC_STEP,
          ],
          runbook: [
            `Get-ADUser ${u.sam} -Properties PasswordNotRequired,DoesNotRequirePreAuth | Select-Object Name,PasswordNotRequired,DoesNotRequirePreAuth`,
            `Set-ADAccountControl -Identity ${u.sam} -DoesNotRequirePreAuth $false -PasswordNotRequired $false`,
          ],
        },
        summary: `${u.sam} requires a password and pre-authentication and is still enabled.`,
      });
    }
    const idle = ageDays(u.lastLogon);
    if (idle !== null && idle > 90 && !isService(u)) {
      out.push({
        id: `stale-account:${u.sam}`,
        kind: "stale-account",
        job: "offboard",
        skill: "security",
        severity: "medium",
        title: `${name} has not signed in for ${Math.round(idle)} days`,
        facts: `${name} (${u.sam}) is enabled but has not signed in for ${Math.round(idle)} days. Unused enabled accounts are how old access gets abused.`,
        task: {
          checks: [{ c: { t: "enabled", sam: u.sam, want: false }, label: `${name}'s account is disabled` }],
          guide: [ADUC, "Confirm with the owner or manager that the account is no longer needed.", "Right-click the account and choose Disable Account. Do not delete it.", SYNC_STEP],
          runbook: [`Get-ADUser ${u.sam} -Properties LastLogonDate | Select-Object Name,LastLogonDate`, `Disable-ADAccount -Identity ${u.sam}`],
        },
        summary: `${u.sam} is disabled and still exists.`,
      });
    }
  }

  // Disabled accounts that still hold access: offboarding that stopped halfway.
  for (const u of s.users.filter((x) => !x.enabled && x.memberOf.length > 0 && usable(x))) {
    const name = nameOf(u);
    out.push({
      id: `disabled-with-access:${u.sam}`,
      kind: "disabled-with-access",
      job: "offboard",
      skill: "security",
      severity: "medium",
      title: `${name} is disabled but still in ${u.memberOf.length} group${u.memberOf.length === 1 ? "" : "s"}`,
      facts: `${name} (${u.sam}) is disabled, but is still a member of ${u.memberOf.join(", ")}. If the account is ever re-enabled, the old access comes back with it.`,
      task: {
        checks: u.memberOf.map((g) => ({ c: { t: "member", sam: u.sam, group: g, want: false } as Check, label: `${name} is no longer in ${g}` })),
        guide: [ADUC, "Find the account and open the Member Of tab.", "Remove every group. Keep the account and leave it disabled.", SYNC_STEP],
        runbook: [
          `Get-ADPrincipalGroupMembership ${u.sam} | Where-Object Name -ne "Domain Users" | ForEach-Object { Remove-ADGroupMember -Identity $_ -Members ${u.sam} -Confirm:$false }`,
        ],
      },
      summary: `${u.sam} is out of every group and still disabled.`,
    });
  }

  // An account whose department attribute disagrees with the folder it sits in.
  const deptFolders = s.ous.map((o) => /^OU=([^,]+),OU=Departments$/i.exec(o.path)?.[1]).filter((x): x is string => Boolean(x));
  for (const u of s.users.filter((x) => x.enabled && usable(x) && x.department)) {
    const here = deptOu(u.container);
    if (!here) continue;
    const want = deptFolders.find((f) => norm(f) === norm(u.department));
    if (!want || norm(want) === norm(here)) continue;
    const name = nameOf(u);
    const target = `OU=Users,OU=${want},OU=Departments`;
    out.push({
      id: `misplaced-account:${u.sam}`,
      kind: "misplaced-account",
      job: "fix-ou",
      skill: "directory",
      severity: "medium",
      title: `${name} is filed under the wrong department`,
      facts: `${name} (${u.sam}) has the department ${u.department}, but the account sits in the ${human(here)} folder. Department policies and reports follow the folder.`,
      task: {
        checks: [
          { c: { t: "container", sam: u.sam, ou: target }, label: `${name} is in the ${human(want)} Users folder` },
          { c: { t: "enabled", sam: u.sam, want: true }, label: `${name}'s account is still enabled` },
        ],
        guide: [ADUC, `Find the account, right-click it, choose Move, and pick Departments, ${human(want)}, Users.`, "Check the Member Of tab: the department group should match the new folder.", SYNC_STEP],
        runbook: [`Move-ADObject -Identity (Get-ADUser ${u.sam}).DistinguishedName -TargetPath "${target},$((Get-ADDomain).DistinguishedName)"`],
      },
      summary: `${u.sam} is in the ${human(want)} Users folder.`,
    });
  }

  // Groups that cannot grant access.
  for (const g of s.groups.filter((x) => /distribution/i.test(x.category) && x.members.length > 0 && !/all employees/i.test(x.name))) {
    out.push({
      id: `distribution-group:${g.name}`,
      kind: "distribution-group",
      job: "group-type",
      skill: "accounts",
      severity: "low",
      title: `${g.name} is a Distribution group`,
      facts: `${g.name} has ${g.members.length} member${g.members.length === 1 ? "" : "s"} but is a Distribution group, which is for email and cannot be used to grant access. If it is meant for access, it must be a Security group.`,
      task: {
        checks: [{ c: { t: "group", name: g.name, category: "Security" }, label: `${g.name} is a Security group` }],
        guide: [ADUC, `Find ${g.name} and open Properties.`, "On the General tab, under Group type, choose Security. Leave the members alone.", SYNC_STEP],
        runbook: [`Set-ADGroup -Identity "${g.name}" -GroupCategory Security`],
      },
      summary: `${g.name} is a Security group.`,
    });
  }

  // Computers nobody has used.
  for (const c of s.computers.filter((x) => x.enabled && !MISSION_COMPUTERS.has(x.name.toLowerCase()))) {
    const idle = ageDays(c.lastLogon);
    if (idle === null || idle <= 90) continue;
    out.push({
      id: `stale-computer:${c.name}`,
      kind: "stale-computer",
      job: "stale-objects",
      skill: "directory",
      severity: "low",
      title: `${c.name} has not signed in for ${Math.round(idle)} days`,
      facts: `The computer ${c.name} is enabled but its last sign-in to the domain was ${Math.round(idle)} days ago. Unused machines keep their trust in the domain until someone retires them.`,
      task: {
        checks: [{ c: { t: "computer", name: c.name, enabled: false }, label: `${c.name} is disabled` }],
        guide: [ADUC, `Find the computer ${c.name}. Confirm it is really retired.`, "Right-click it and choose Disable Account. Do not delete it yet.", SYNC_STEP],
        runbook: [`Get-ADComputer ${c.name} -Properties LastLogonDate | Select-Object Name,LastLogonDate`, `Disable-ADComputer -Identity ${c.name}`],
      },
      summary: `${c.name} is disabled.`,
    });
  }

  // ---- policy and configuration --------------------------------------------
  const sec = s.security;
  const pp = sec?.passwordPolicy;
  // A lock time of 0 means an administrator must unlock the account, which is stricter than 15 minutes.
  const lockTimeShort = pp !== undefined && pp.lockoutDurationMin !== 0 && pp.lockoutDurationMin < 15;
  if (pp && (pp.lockoutThreshold === 0 || pp.lockoutThreshold > 10 || lockTimeShort)) {
    out.push({
      id: "lockout-policy",
      kind: "lockout-policy",
      job: "lockout-policy",
      skill: "security",
      severity: "high",
      title: pp.lockoutThreshold === 0 ? "The domain never locks an account" : "The lockout policy is too loose",
      facts: `The domain's account lockout threshold is ${pp.lockoutThreshold === 0 ? "0, meaning accounts are never locked" : pp.lockoutThreshold}, with a lock time of ${pp.lockoutDurationMin} minutes. An attacker can keep guessing passwords, which is how password spraying works. The usual standard is a lock of at least 15 minutes after 10 or fewer failed attempts.`,
      task: {
        // Only check what is actually wrong, so a stricter choice (such as an admin-only unlock) is never marked down.
        checks: [
          { c: { t: "policy", key: "lockoutThreshold", min: 1, max: 10 }, label: "Accounts lock after between 1 and 10 failed attempts" },
          ...(lockTimeShort ? [{ c: { t: "policy", key: "lockoutDurationMin", min: 15 } as Check, label: "A locked account stays locked for at least 15 minutes" }] : []),
          ...(pp.lockoutWindowMin > 0 && pp.lockoutWindowMin < 15 ? [{ c: { t: "policy", key: "lockoutWindowMin", min: 15 } as Check, label: "The failed-attempt counter resets after at least 15 minutes" }] : []),
        ],
        guide: [
          `${GPMC}, then edit the Default Domain Policy.`,
          "Go to Computer Configuration, Policies, Windows Settings, Security Settings, Account Policies, Account Lockout Policy.",
          "Set the lockout threshold to 5, the duration to 15 minutes, and Reset account lockout counter after to 15 minutes.",
          secStep("Save the policy."),
          SYNC_STEP,
        ],
        runbook: [
          "Get-ADDefaultDomainPasswordPolicy | Select-Object LockoutThreshold,LockoutDuration,LockoutObservationWindow",
          "Set-ADDefaultDomainPasswordPolicy -Identity (Get-ADDomain).DNSRoot -LockoutThreshold 5 -LockoutDuration 00:15:00 -LockoutObservationWindow 00:15:00",
        ],
      },
      summary: "The domain locks accounts after a few failed attempts for at least 15 minutes.",
    });
  }
  if (pp && (pp.minLength < 12 || !pp.complexity)) {
    out.push({
      id: "password-policy",
      kind: "password-policy",
      job: "password-policy",
      skill: "security",
      severity: "high",
      title: `Passwords can be as short as ${pp.minLength} characters`,
      facts: `The domain password policy requires only ${pp.minLength} characters${pp.complexity ? "" : " and does not require complexity"}. Short passwords fall quickly to guessing tools. The usual standard is at least 12 characters with complexity on. Temporary passwords you set when creating accounts must be at least that long.`,
      task: {
        checks: [
          { c: { t: "policy", key: "minLength", min: 12 }, label: "The minimum password length is at least 12" },
          { c: { t: "policy", key: "complexity", bool: true }, label: "Password complexity is required" },
        ],
        guide: [
          `${GPMC}, then edit the Default Domain Policy.`,
          "Go to Computer Configuration, Policies, Windows Settings, Security Settings, Account Policies, Password Policy.",
          "Set Minimum password length to 12 and Password must meet complexity requirements to Enabled.",
          secStep("Save the policy."),
          SYNC_STEP,
        ],
        runbook: [
          "Get-ADDefaultDomainPasswordPolicy | Select-Object MinPasswordLength,ComplexityEnabled,PasswordHistoryCount",
          "Set-ADDefaultDomainPasswordPolicy -Identity (Get-ADDomain).DNSRoot -MinPasswordLength 12 -ComplexityEnabled $true",
        ],
      },
      summary: "The domain requires 12 or more characters with complexity.",
    });
  }
  const AUDIT_GOALS: { sub: string; need: "Success" | "Failure" | "Both"; category: string; event: string; why: string }[] = [
    { sub: "Process Creation", need: "Success", category: "Detailed Tracking", event: "4688", why: "no event is written when a program starts, so an analyst cannot see what an attacker ran" },
    { sub: "Logon", need: "Both", category: "Logon/Logoff", event: "4624 and 4625", why: "sign-ins are not fully logged, so a password-guessing run leaves no trail" },
    { sub: "Special Logon", need: "Success", category: "Logon/Logoff", event: "4672", why: "nobody is told when an account signs in with administrator rights" },
    { sub: "Security Group Management", need: "Success", category: "Account Management", event: "4728 and 4732", why: "adding someone to an admin group leaves no record" },
  ];
  for (const goal of AUDIT_GOALS) {
    const v = (sec?.audit?.[goal.sub] ?? "").toLowerCase();
    if (!v) continue;
    const hasS = v.includes("success");
    const hasF = v.includes("failure");
    const met = goal.need === "Both" ? hasS && hasF : goal.need === "Success" ? hasS : hasF;
    if (met) continue;
    const word = goal.need === "Both" ? "success and failure" : goal.need.toLowerCase();
    const flags = goal.need === "Both" ? "/success:enable /failure:enable" : goal.need === "Success" ? "/success:enable" : "/failure:enable";
    out.push({
      id: `audit-gap:${goal.sub}`,
      kind: "audit-gap",
      job: "enable-auditing",
      skill: "security",
      severity: "medium",
      title: `"${goal.sub}" is not audited for ${word}`,
      facts: `On the domain controller, ${goal.why}. The events an analyst needs are ${goal.event}. Auditing for "${goal.sub}" is currently: ${sec?.audit?.[goal.sub]}.`,
      task: {
        checks: [{ c: { t: "audit", sub: goal.sub, need: goal.need }, label: `Auditing for "${goal.sub}" includes ${word}` }],
        guide: [
          `${GPMC}, then edit the Default Domain Controllers Policy.`,
          `Go to Computer Configuration, Policies, Windows Settings, Security Settings, Advanced Audit Policy Configuration, Audit Policies, ${goal.category}, ${goal.sub}.`,
          `Tick Configure the following audit events and choose ${goal.need === "Both" ? "Success and Failure" : goal.need}.`,
          secStep("Save the policy."),
          SYNC_STEP,
        ],
        runbook: [`auditpol /get /subcategory:"${goal.sub}"`, `auditpol /set /subcategory:"${goal.sub}" ${flags}`],
      },
      summary: `"${goal.sub}" is audited for ${word}.`,
    });
  }
  if (sec?.securityLogMaxMB !== undefined && sec.securityLogMaxMB < 512) {
    out.push({
      id: "log-size",
      kind: "log-size",
      job: "log-retention",
      skill: "security",
      severity: "medium",
      title: `The Security log is capped at ${sec.securityLogMaxMB} MB`,
      facts: `The Security event log on the domain controller is capped at ${sec.securityLogMaxMB} MB. On a busy domain that fills quickly and old events are overwritten, so by the time an incident is noticed the evidence is gone. The usual standard is at least 512 MB.`,
      task: {
        checks: [{ c: { t: "logsize", minMB: 512 }, label: "The Security log can grow to at least 512 MB" }],
        guide: [
          "Open Event Viewer (Win+R, eventvwr.msc) on the domain controller.",
          "Expand Windows Logs, right-click Security, and choose Properties.",
          "Set Maximum log size to 524288 KB or more and leave Overwrite events as needed. Do not clear the log.",
          SYNC_STEP,
        ],
        runbook: ["Get-WinEvent -ListLog Security | Select-Object LogName,MaximumSizeInBytes,RecordCount", "wevtutil sl Security /ms:536870912"],
      },
      summary: "The Security log can grow to 512 MB or more.",
    });
  }
  const psoTarget = admins.includes("IT Admins") ? "IT Admins" : admins[0];
  const psos = sec?.psos;
  if (psos !== undefined && psoTarget && !psos.some((x) => x.minLength >= 16 && x.appliesTo.some((a) => a.toLowerCase() === psoTarget.toLowerCase()))) {
    const slug = psoTarget.replace(/\s+/g, "-");
    out.push({
      id: "admin-password-policy",
      kind: "admin-password-policy",
      job: "admin-password-policy",
      skill: "security",
      severity: "medium",
      title: `${psoTarget} follow the same password rules as everyone else`,
      facts: `${psoTarget} can change almost anything in the domain, so their accounts are the ones attackers want, yet no separate password policy applies to them. The usual standard is a stricter fine-grained policy for admins: at least 16 characters and a lockout after 5 or fewer failed attempts.`,
      task: {
        checks: [{ c: { t: "pso", minLength: 16, appliesTo: psoTarget, maxLockout: 5 }, label: `A password policy applies to ${psoTarget} with at least 16 characters and a lockout of 5 or fewer` }],
        guide: [
          "Open Active Directory Administrative Center (Win+R, dsac.exe).",
          "Go to your domain, System, Password Settings Container, then New, Password Settings.",
          `Give it a name and a precedence such as 10. Set Minimum password length to 16, enable the lockout with 5 failed attempts, and under Directly Applies To add ${psoTarget}.`,
          SYNC_STEP,
        ],
        runbook: [
          `New-ADFineGrainedPasswordPolicy -Name "PSO-${slug}" -Precedence 10 -MinPasswordLength 16 -ComplexityEnabled $true -PasswordHistoryCount 24 -LockoutThreshold 5 -LockoutDuration 00:30:00 -LockoutObservationWindow 00:30:00`,
          `Add-ADFineGrainedPasswordPolicySubject -Identity "PSO-${slug}" -Subjects "${psoTarget}"`,
        ],
      },
      summary: `A password policy applies to ${psoTarget} with 16 or more characters and a lockout of 5 or fewer.`,
    });
  }

  // ---- for judgement, not a check ------------------------------------------
  for (const g of admins) {
    const grp = s.groups.find((x) => x.name.toLowerCase() === g.toLowerCase());
    for (const m of grp?.members ?? []) {
      const u = s.users.find((x) => x.name === m || x.sam === m);
      const dept = u ? deptOu(u.container) : null;
      if (u && dept && !/^it$|information/i.test(dept) && usable(u) && !isService(u)) {
        out.push({
          id: `admin-review:${g}:${u.sam}`,
          kind: "admin-review",
          job: "least-privilege",
          skill: "security",
          severity: "high",
          title: `${nameOf(u)} is in ${g} but works in ${human(dept)}`,
          facts: `${nameOf(u)} (${u.sam}) is a member of ${g} and sits in the ${human(dept)} folder, not IT. Whether that is right depends on the job. It is worth an owner's sign-off.`,
          summary: `${nameOf(u)}'s ${g} membership was reviewed.`,
        });
      }
    }
  }

  const rank = { high: 0, medium: 1, low: 2 } as const;
  return out.sort((a, b) => rank[a.severity] - rank[b.severity]);
}

/** One real finding to fix as today's lab task. Prefers the one that practices the job the student has shown least. */
export function pickFinding(params: { snapshot: LabSnapshot; seed: string; level: number; avoid: string[]; targetJob?: string; only?: FindingKind }): ChangeBrief | null {
  const findings = auditLab(params.snapshot).filter((f) => f.task && (!params.only || f.kind === params.only));
  if (!findings.length) return null;
  const avoid = new Set(params.avoid);
  const fresh = findings.filter((f) => !avoid.has(f.id));
  const pool = fresh.length ? fresh : findings;
  const match = params.targetJob ? pool.filter((f) => f.job === params.targetJob) : [];
  const from = match.length ? match : pool;
  const pick = shuffle(seeded(`finding:${params.seed}`), from)[0];
  return { ...pick, theme: pick.id };
}

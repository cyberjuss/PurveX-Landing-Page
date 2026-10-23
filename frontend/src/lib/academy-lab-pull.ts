import "server-only";
import { evalCheck, type Check } from "@/lib/academy-drills";
import { loadHostedLab } from "@/lib/academy-store";
import { runOnLab } from "@/lib/academy-hosted";
import type { LabSnapshot } from "@/lib/academy-lab";

// Range's own read of a hosted lab.
//
// A lab reports its state to Range itself, signed with a key that lives on the
// lab, and the student is an administrator there: they can read the key and
// send a report that says anything. So when a check passes on a report, Range
// asks the domain controller directly, over SSM, for exactly the facts that
// check reads. The command is written here, never read from the student's
// disk, and its answer comes back through AWS rather than through the key. A
// check confirmed this way is what the portfolio calls Verified by Range.
//
// Faking that would mean subverting Windows or Active Directory on the box
// itself, not editing a report. It is not impossible on a machine the student
// controls, and nothing is, but it is no longer a text edit.
//
// Behind HOSTED_LAB_VERIFIED_PULL=on until it has run against a real lab.

export type PullOutcome =
  /** The lab, asked directly, agrees with the report. */
  | { status: "confirmed" }
  /** The lab, asked directly, disagrees: the report did not match the lab. */
  | { status: "contradicted"; results: { label: string; ok: boolean }[] }
  /** Could not ask: switched off, not a hosted lab, the lab or its agent is down, or a check this cannot read. */
  | { status: "unverified"; reason: "off" | "not-hosted" | "unreachable" | "unsupported" | "nothing-to-check" };

/** Check kinds this can read straight from the domain controller. */
const READABLE = new Set<Check["t"]>(["member", "exists", "gone", "present", "container", "enabled", "noexpire", "desc", "flag", "group", "pso", "computer", "computerAt", "file", "spn", "policy", "audit", "logsize", "sbl"]);

export const verifiedPullOn = () => (process.env.HOSTED_LAB_VERIFIED_PULL ?? "").trim().toLowerCase() === "on";

/** What the collector has to fetch for these checks. */
export function wantsFor(checks: Check[]) {
  const users = new Set<string>();
  const groups = new Set<string>();
  const computers = new Set<string>();
  const files = new Set<string>();
  const audit = new Set<string>();
  let policy = false;
  let pso = false;
  let logsize = false;
  let sbl = false;
  for (const c of checks) {
    if ("sam" in c) users.add(c.sam);
    if (c.t === "member") groups.add(c.group);
    if (c.t === "group") groups.add(c.name);
    if (c.t === "computer" || c.t === "computerAt") computers.add(c.name);
    if (c.t === "file") files.add(c.path);
    if (c.t === "audit") audit.add(c.sub);
    if (c.t === "policy") policy = true;
    if (c.t === "pso") pso = true;
    if (c.t === "logsize") logsize = true;
    if (c.t === "sbl") sbl = true;
  }
  return { users: [...users], groups: [...groups], computers: [...computers], files: [...files], audit: [...audit], policy, pso, logsize, sbl };
}

/**
 * The PowerShell Range runs. Shapes every object the way Build-Environment.ps1
 * does in its snapshot, so the same checks read it the same way: containers
 * relative to the domain, memberships by short name, users and computers only
 * under the lab's own OUs.
 */
export function collectorScript(want: ReturnType<typeof wantsFor>): string {
  const payload = Buffer.from(JSON.stringify(want), "utf8").toString("base64");
  return `
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
try {
  Import-Module ActiveDirectory
  $w = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${payload}')) | ConvertFrom-Json
  $dn = (Get-ADDomain).DistinguishedName
  $suffix = [regex]::Escape(",$dn") + '$'
  $rel = { param($x) (($x -split '(?<!\\\\),', 2)[1]) -replace $suffix, '' }
  $short = { param($x) (($x -split '(?<!\\\\),', 2)[0] -replace '^(CN|OU)=', '') -replace '\\\\,', ',' }
  $roots = @('Departments', 'AccessLevels', 'ServiceAccounts') | ForEach-Object { ",OU=$_,$dn" }
  $inRoots = { param($x) foreach ($r in $roots) { if ($x.EndsWith($r, [StringComparison]::OrdinalIgnoreCase)) { return $true } }; return $false }
  $q = { param($v) "$v" -replace "'", "''" }
  $out = [ordered]@{ ok = $true; users = @(); groups = @(); computers = @(); files = @() }
  foreach ($sam in @($w.users)) {
    $u = Get-ADUser -Filter "SamAccountName -eq '$(& $q $sam)'" -Properties Title, Department, Description, Enabled, LockedOut, PasswordNeverExpires, PasswordExpired, PasswordNotRequired, DoesNotRequirePreAuth, TrustedForDelegation, ServicePrincipalNames, MemberOf
    if ($u -and (& $inRoots $u.DistinguishedName)) {
      $out.users += [ordered]@{
        sam = $u.SamAccountName; name = $u.Name; title = "$($u.Title)"; department = "$($u.Department)"; description = "$($u.Description)"
        container = (& $rel $u.DistinguishedName); enabled = [bool]$u.Enabled; lockedOut = [bool]$u.LockedOut
        passwordNeverExpires = [bool]$u.PasswordNeverExpires; passwordExpired = [bool]$u.PasswordExpired
        pwdNotRequired = [bool]$u.PasswordNotRequired; noPreAuth = [bool]$u.DoesNotRequirePreAuth; delegation = [bool]$u.TrustedForDelegation
        spns = @($u.ServicePrincipalNames).Count; memberOf = @($u.MemberOf | ForEach-Object { & $short $_ })
      }
    }
  }
  foreach ($name in @($w.groups)) {
    $g = Get-ADGroup -Filter "Name -eq '$(& $q $name)'" -Properties Description, Members
    if ($g) {
      $out.groups += [ordered]@{
        name = $g.Name; scope = "$($g.GroupScope)"; category = "$($g.GroupCategory)"; description = "$($g.Description)"
        container = (& $rel $g.DistinguishedName); members = @($g.Members | ForEach-Object { & $short $_ })
      }
    }
  }
  foreach ($name in @($w.computers)) {
    $pc = Get-ADComputer -Filter "Name -eq '$(& $q $name)'" -Properties Description, Enabled
    if ($pc -and (& $inRoots $pc.DistinguishedName)) {
      $out.computers += [ordered]@{ name = $pc.Name; description = "$($pc.Description)"; container = (& $rel $pc.DistinguishedName); enabled = [bool]$pc.Enabled }
    }
  }
  $sec = [ordered]@{}
  if ($w.policy) {
    $pp = Get-ADDefaultDomainPasswordPolicy
    $sec.passwordPolicy = [ordered]@{
      minLength = [int]$pp.MinPasswordLength; complexity = [bool]$pp.ComplexityEnabled; history = [int]$pp.PasswordHistoryCount
      maxAgeDays = [int]$pp.MaxPasswordAge.TotalDays; lockoutThreshold = [int]$pp.LockoutThreshold
      lockoutDurationMin = [int]$pp.LockoutDuration.TotalMinutes; lockoutWindowMin = [int]$pp.LockoutObservationWindow.TotalMinutes
      reversible = [bool]$pp.ReversibleEncryptionEnabled
    }
  }
  if (@($w.audit).Count) {
    $audit = [ordered]@{}
    foreach ($row in (auditpol /get /category:* /r | ConvertFrom-Csv)) {
      if (@($w.audit) -contains $row.Subcategory) { $audit[$row.Subcategory] = "$($row.'Inclusion Setting')" }
    }
    $sec.audit = $audit
  }
  if ($w.pso) {
    $sec.psos = @(Get-ADFineGrainedPasswordPolicy -Filter * | ForEach-Object {
      [ordered]@{ name = $_.Name; precedence = [int]$_.Precedence; minLength = [int]$_.MinPasswordLength; lockoutThreshold = [int]$_.LockoutThreshold
        appliesTo = @($_.AppliesTo | ForEach-Object { (($_ -split '(?<!\\\\),', 2)[0] -replace '^(CN|OU)=', '') }) }
    })
  }
  if ($w.logsize) { $sec.securityLogMaxMB = [int]((Get-WinEvent -ListLog Security).MaximumSizeInBytes / 1MB) }
  if ($w.sbl) {
    $sbl = Get-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\PowerShell\\ScriptBlockLogging' -Name EnableScriptBlockLogging -ErrorAction SilentlyContinue
    $sec.scriptBlockLogging = [bool]($sbl -and $sbl.EnableScriptBlockLogging -eq 1)
  }
  $out.security = $sec
  foreach ($p in @($w.files)) {
    $full = Join-Path 'C:\\PurveX' $p
    if (Test-Path -LiteralPath $full -PathType Leaf) { $out.files += [ordered]@{ path = $p; size = [int64](Get-Item -LiteralPath $full).Length } }
  }
  [Console]::Out.Write(($out | ConvertTo-Json -Depth 6 -Compress))
}
catch { [Console]::Out.Write('{"ok":false}') }
`.trim();
}

const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : v === undefined || v === null ? [] : [v as T]);

/** The collector's answer as the slice of a snapshot the checks read. Null if it is not a clean answer. */
export function snapshotFrom(raw: string): LabSnapshot | null {
  let j: Record<string, unknown>;
  try {
    j = JSON.parse(raw.replace(/^\uFEFF/, "").trim());
  } catch {
    return null;
  }
  if (!j || j.ok !== true) return null;
  const sec = (j.security ?? {}) as Record<string, unknown>;
  return {
    capturedAt: new Date().toISOString(),
    domain: { dnsRoot: "", netbios: "" },
    ous: [],
    users: list<Record<string, unknown>>(j.users).map((u) => ({
      sam: String(u.sam ?? ""), name: String(u.name ?? ""), title: String(u.title ?? ""), department: String(u.department ?? ""),
      description: String(u.description ?? ""), container: String(u.container ?? ""), enabled: u.enabled === true, lockedOut: u.lockedOut === true,
      badLogonCount: 0, passwordNeverExpires: u.passwordNeverExpires === true, passwordExpired: u.passwordExpired === true, lastLogon: null,
      memberOf: list<string>(u.memberOf).map(String), pwdNotRequired: u.pwdNotRequired === true, noPreAuth: u.noPreAuth === true,
      delegation: u.delegation === true, spns: Number(u.spns) || 0,
    })),
    groups: list<Record<string, unknown>>(j.groups).map((g) => ({
      name: String(g.name ?? ""), scope: String(g.scope ?? ""), category: String(g.category ?? ""), description: String(g.description ?? ""),
      container: String(g.container ?? ""), members: list<string>(g.members).map(String),
    })),
    computers: list<Record<string, unknown>>(j.computers).map((c) => ({
      name: String(c.name ?? ""), description: String(c.description ?? ""), container: String(c.container ?? ""), enabled: c.enabled === true, lastLogon: null,
    })),
    security: {
      ...(sec.passwordPolicy ? { passwordPolicy: sec.passwordPolicy } : {}),
      ...(sec.audit ? { audit: sec.audit } : {}),
      // PowerShell 5.1 writes a one-item list as the item itself, so every list
      // in the answer is normalised, appliesTo included.
      ...(sec.psos !== undefined
        ? {
            psos: list<Record<string, unknown>>(sec.psos).map((x) => ({
              name: String(x.name ?? ""), precedence: Number(x.precedence) || 0, minLength: Number(x.minLength) || 0,
              lockoutThreshold: Number(x.lockoutThreshold) || 0, appliesTo: list<string>(x.appliesTo).map(String),
            })),
          }
        : {}),
      ...(sec.securityLogMaxMB !== undefined ? { securityLogMaxMB: Number(sec.securityLogMaxMB) } : {}),
    } as LabSnapshot["security"],
    infra: { planted: [], firewall: [], dns: [], dcIps: [], gpos: [], gpoLinks: [], files: list<Record<string, unknown>>(j.files).map((f) => ({ path: String(f.path ?? ""), size: Number(f.size) || 0 })) },
  } as LabSnapshot;
}

/** The checks, judged on a snapshot Range collected itself. */
export function judge(snapshot: LabSnapshot, checks: { c: Check; label: string }[]): PullOutcome {
  const results = checks.map(({ c, label }) => ({ label, ok: evalCheck(snapshot, c) }));
  return results.every((r) => r.ok) ? { status: "confirmed" } : { status: "contradicted", results };
}

/**
 * Ask the student's hosted lab directly whether these checks hold. Called only
 * after a check has passed on the lab's own report, so a confirmed outcome is
 * the second, independent read.
 */
export async function confirmOnLab(userId: string, checks: { c: Check; label: string }[]): Promise<PullOutcome> {
  if (!verifiedPullOn()) return { status: "unverified", reason: "off" };
  if (!checks.length) return { status: "unverified", reason: "nothing-to-check" };
  if (checks.some(({ c }) => !READABLE.has(c.t))) return { status: "unverified", reason: "unsupported" };
  const row = await loadHostedLab(userId).catch(() => null);
  if (!row) return { status: "unverified", reason: "not-hosted" };
  const out = await runOnLab(userId, [collectorScript(wantsFor(checks.map((x) => x.c)))]);
  const snapshot = out === null ? null : snapshotFrom(out);
  if (!snapshot) return { status: "unverified", reason: "unreachable" };
  return judge(snapshot, checks);
}

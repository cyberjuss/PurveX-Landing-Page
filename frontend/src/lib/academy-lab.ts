import "server-only";

// Snapshots uploaded at the end of public/lab-scripts/Build-Environment.ps1. Everything is
// re-validated here: the upload is untrusted input that ends up in model
// prompts, so only known fields survive, with length and count caps.

export type LabUser = {
  sam: string;
  name: string;
  title: string;
  department: string;
  description: string;
  container: string;
  enabled: boolean;
  lockedOut: boolean;
  badLogonCount: number;
  passwordNeverExpires: boolean;
  passwordExpired: boolean;
  lastLogon: string | null;
  memberOf: string[];
  /** Risky account flags. Absent when the lab script is older than these fields. */
  pwdNotRequired?: boolean;
  noPreAuth?: boolean;
  delegation?: boolean;
  spns?: number;
};
export type LabGroup = { name: string; scope: string; category: string; description: string; container: string; members: string[] };
export type LabComputer = { name: string; description: string; container: string; enabled: boolean; lastLogon: string | null };
export type LabOu = { path: string; description: string };
export type LabSecurity = {
  passwordPolicy?: {
    minLength: number;
    complexity: boolean;
    history: number;
    maxAgeDays: number;
    lockoutThreshold: number;
    lockoutDurationMin: number;
    lockoutWindowMin: number;
    reversible: boolean;
  };
  /** Advanced audit policy: subcategory to "Success", "Failure", "Success and Failure" or "No Auditing". */
  audit?: Record<string, string>;
  securityLogMaxMB?: number;
  smb1?: boolean;
};

export type LabSnapshot = {
  security?: LabSecurity;
  capturedAt: string;
  domain: { dnsRoot: string; netbios: string };
  ous: LabOu[];
  users: LabUser[];
  groups: LabGroup[];
  computers: LabComputer[];
};

const MAX_ITEMS = 300;
const MAX_MEMBERS = 300;

function str(v: unknown, max = 300): string {
  return typeof v === "string" ? v.replace(/[\u0000-\u001f]/g, " ").slice(0, max) : "";
}

function bool(v: unknown): boolean {
  return v === true;
}

function date(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

// PowerShell 5.1 turns one-element arrays into scalars in some cases.
function list(v: unknown, max = MAX_MEMBERS): string[] {
  const arr = Array.isArray(v) ? v : v === undefined || v === null ? [] : [v];
  return arr.map((x) => str(x, 200)).filter(Boolean).slice(0, max);
}

function objects(v: unknown): Record<string, unknown>[] {
  const arr = Array.isArray(v) ? v : v && typeof v === "object" ? [v] : [];
  return arr.filter((x): x is Record<string, unknown> => !!x && typeof x === "object").slice(0, MAX_ITEMS);
}

const AUDIT_KEYS = ["Logon", "Account Lockout", "Special Logon", "Process Creation", "Security Group Management", "User Account Management"];

function num(v: unknown, max: number): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.round(n))) : undefined;
}

function sanitizeSecurity(raw: unknown): LabSecurity | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const r = raw as Record<string, unknown>;
  const out: LabSecurity = {};
  const pp = r.passwordPolicy && typeof r.passwordPolicy === "object" ? (r.passwordPolicy as Record<string, unknown>) : null;
  if (pp) {
    out.passwordPolicy = {
      minLength: num(pp.minLength, 128) ?? 0,
      complexity: bool(pp.complexity),
      history: num(pp.history, 1000) ?? 0,
      maxAgeDays: num(pp.maxAgeDays, 100000) ?? 0,
      lockoutThreshold: num(pp.lockoutThreshold, 1000) ?? 0,
      lockoutDurationMin: num(pp.lockoutDurationMin, 100000) ?? 0,
      lockoutWindowMin: num(pp.lockoutWindowMin, 100000) ?? 0,
      reversible: bool(pp.reversible),
    };
  }
  if (r.audit && typeof r.audit === "object") {
    const audit: Record<string, string> = {};
    for (const k of AUDIT_KEYS) {
      const v = (r.audit as Record<string, unknown>)[k];
      if (typeof v === "string") audit[k] = v.slice(0, 40);
    }
    if (Object.keys(audit).length) out.audit = audit;
  }
  const log = num(r.securityLogMaxMB, 1_000_000);
  if (log !== undefined) out.securityLogMaxMB = log;
  if (typeof r.smb1 === "boolean") out.smb1 = r.smb1;
  return Object.keys(out).length ? out : undefined;
}

export function sanitizeLabSnapshot(raw: unknown): LabSnapshot | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const domain = (r.domain && typeof r.domain === "object" ? r.domain : {}) as Record<string, unknown>;
  const snapshot: LabSnapshot = {
    security: sanitizeSecurity(r.security),
    capturedAt: date(r.capturedAt) ?? new Date().toISOString(),
    domain: { dnsRoot: str(domain.dnsRoot, 200), netbios: str(domain.netbios, 50) },
    ous: objects(r.ous).map((o) => ({ path: str(o.path), description: str(o.description) })),
    users: objects(r.users)
      .map((u) => ({
        sam: str(u.sam, 100),
        name: str(u.name, 200),
        title: str(u.title, 200),
        department: str(u.department, 200),
        description: str(u.description),
        container: str(u.container),
        enabled: bool(u.enabled),
        lockedOut: bool(u.lockedOut),
        badLogonCount: Math.max(0, Math.min(10000, Math.floor(Number(u.badLogonCount) || 0))),
        passwordNeverExpires: bool(u.passwordNeverExpires),
        passwordExpired: bool(u.passwordExpired),
        lastLogon: date(u.lastLogon),
        memberOf: list(u.memberOf),
        ...(typeof u.pwdNotRequired === "boolean" ? { pwdNotRequired: u.pwdNotRequired } : {}),
        ...(typeof u.noPreAuth === "boolean" ? { noPreAuth: u.noPreAuth } : {}),
        ...(typeof u.delegation === "boolean" ? { delegation: u.delegation } : {}),
        ...(num(u.spns, 1000) !== undefined ? { spns: num(u.spns, 1000) } : {}),
      }))
      .filter((u) => u.sam),
    groups: objects(r.groups)
      .map((g) => ({
        name: str(g.name, 200),
        scope: str(g.scope, 30),
        category: str(g.category, 30),
        description: str(g.description),
        container: str(g.container),
        members: list(g.members),
      }))
      .filter((g) => g.name),
    computers: objects(r.computers)
      .map((c) => ({
        name: str(c.name, 100),
        description: str(c.description),
        container: str(c.container),
        enabled: bool(c.enabled),
        lastLogon: date(c.lastLogon),
      }))
      .filter((c) => c.name),
  };
  if (snapshot.users.length === 0 && snapshot.groups.length === 0 && snapshot.ous.length === 0) return null;
  return snapshot;
}

// The core objects Build-Environment.ps1 creates. Differences are not
// necessarily mistakes: working a ticket (moving an account, adding a
// member) legitimately changes the lab.
export const BASELINE_USERS: { sam: string; deptOu: string; group: string; extra?: string[] }[] = [
  { sam: "alex.rivera", deptOu: "IT", group: "IT Users", extra: ["IT Admins"] },
  { sam: "priya.nair", deptOu: "IT", group: "IT Users" },
  { sam: "devon.brooks", deptOu: "Compliance", group: "Compliance Users" },
  { sam: "morgan.lee", deptOu: "Compliance", group: "Compliance Users" },
  { sam: "sam.whitfield", deptOu: "WealthManagement", group: "Wealth Management Users" },
  { sam: "jamie.torres", deptOu: "WealthManagement", group: "Wealth Management Users" },
  { sam: "taylor.osei", deptOu: "Operations", group: "Operations Users" },
  { sam: "riley.kwan", deptOu: "Operations", group: "Operations Users" },
  { sam: "jordan.ellis", deptOu: "FinanceAccounting", group: "Finance Accounting Users" },
];
export const BASELINE_GROUPS = [
  "IT Users",
  "IT Admins",
  "Compliance Users",
  "Wealth Management Users",
  "Operations Users",
  "Finance Accounting Users",
  "Server Admins",
  "Helpdesk",
];

export function formatLabAge(iso: string): { exact: string; ago: string; hours: number } {
  const t = new Date(iso).getTime();
  const hours = Number.isNaN(t) ? NaN : (Date.now() - t) / 36e5;
  if (Number.isNaN(hours)) return { exact: iso, ago: "unknown time", hours: NaN };
  const mins = Math.round(hours * 60);
  let ago = "just now";
  if (mins >= 2 && mins < 60) ago = `${mins} minutes ago`;
  else if (hours >= 1 && hours < 24) ago = `${Math.round(hours)} hour${Math.round(hours) === 1 ? "" : "s"} ago`;
  else if (hours >= 24 && hours < 48) ago = "yesterday";
  else if (hours >= 48) ago = `${Math.round(hours / 24)} days ago`;
  return { exact: new Date(t).toISOString(), ago, hours };
}

const CTF_USERS = ["old.intern", "svc-backup-job"];
const CTF_COMPUTERS = ["wm-wks07", "ops-wks03"];
const CTF_GROUPS = ["all employees"];

export function labEvidence(s: LabSnapshot) {
  const users = new Set(s.users.map((u) => u.sam.toLowerCase()));
  const groups = new Set(s.groups.map((g) => g.name.toLowerCase()));
  const computers = new Set(s.computers.map((c) => c.name.toLowerCase()));
  const missingCtf = [
    ...CTF_USERS.filter((n) => !users.has(n)),
    ...CTF_COMPUTERS.filter((n) => !computers.has(n)),
    ...CTF_GROUPS.filter((n) => !groups.has(n)),
  ];
  const age = formatLabAge(s.capturedAt);
  return {
    domain: s.domain.dnsRoot || "unknown domain",
    lastCaptured: age.exact,
    lastCapturedAgo: age.ago,
    hoursOld: age.hours,
    counts: { users: s.users.length, groups: s.groups.length, computers: s.computers.length, ous: s.ous.length },
    stockUsers: BASELINE_USERS.filter((b) => users.has(b.sam)).length,
    ctfPlanted: missingCtf.length <= 1,
    missingCtf,
    lockedUsers: s.users.filter((u) => u.lockedOut).map((u) => u.sam),
    disabledUsers: s.users.filter((u) => !u.enabled).map((u) => u.sam),
    diffs: compareToBaseline(s),
  };
}

export function compareToBaseline(s: LabSnapshot): string[] {
  const diffs: string[] = [];
  const users = new Map(s.users.map((u) => [u.sam.toLowerCase(), u]));
  const groupNames = new Set(s.groups.map((g) => g.name.toLowerCase()));

  for (const b of BASELINE_USERS) {
    const u = users.get(b.sam);
    if (!u) {
      diffs.push(`User ${b.sam} is missing.`);
      continue;
    }
    const expected = `OU=Users,OU=${b.deptOu},OU=Departments`;
    if (u.container.toLowerCase() !== expected.toLowerCase()) {
      diffs.push(`User ${b.sam} is in ${u.container || "an unknown location"}, not ${expected}.`);
    }
    const memberOf = new Set(u.memberOf.map((m) => m.toLowerCase()));
    for (const g of [b.group, ...(b.extra ?? [])]) {
      if (!memberOf.has(g.toLowerCase())) diffs.push(`User ${b.sam} is not a member of ${g}.`);
    }
    if (!u.enabled) diffs.push(`User ${b.sam} is disabled.`);
  }
  for (const g of BASELINE_GROUPS) {
    if (!groupNames.has(g.toLowerCase())) diffs.push(`Group ${g} is missing.`);
  }
  const wks = s.computers.find((c) => c.name.toLowerCase() === "it-wks01");
  if (!wks) diffs.push("Computer IT-WKS01 is missing.");
  else if (wks.container.toLowerCase() !== "ou=workstations,ou=it,ou=departments") {
    diffs.push(`Computer IT-WKS01 is in ${wks.container}, not OU=Workstations,OU=IT,OU=Departments.`);
  }
  return diffs;
}

const COACHING_NOTE =
  "This is the student's real lab. Use it to check what they did and to spot mistakes. Do not read out a value that directly answers a mission they have not solved; tell them where to look and let them find it.";

export function labStateForTool(s: LabSnapshot | null, query: string): string {
  if (!s) {
    return JSON.stringify({
      connected: false,
      note: "No lab snapshot yet. One is saved automatically when the student runs Build-Environment.ps1 downloaded from the Build This Lab page. Until then, ask them to check Active Directory Users and Computers or PowerShell. Do not invent lab values.",
    });
  }
  const evidence = labEvidence(s);
  const base = {
    connected: true,
    capturedAt: evidence.lastCaptured,
    lastSynced: evidence.lastCapturedAgo,
    hoursOld: Math.round(evidence.hoursOld),
    ctfPlanted: evidence.ctfPlanted,
    coachingNote: COACHING_NOTE,
  };
  const q = query.trim().toLowerCase();

  if (q) {
    const hit = (...fields: string[]) => fields.some((f) => f.toLowerCase().includes(q));
    const users = s.users.filter((u) => hit(u.sam, u.name, u.title, u.department));
    const groups = s.groups.filter((g) => hit(g.name));
    const computers = s.computers.filter((c) => hit(c.name));
    const ous = s.ous.filter((o) => hit(o.path));
    return JSON.stringify({ ...base, query, users: users.slice(0, 10), groups: groups.slice(0, 10), computers: computers.slice(0, 10), ous: ous.slice(0, 10) });
  }

  return JSON.stringify({
    ...base,
    domain: s.domain.dnsRoot,
    counts: { ous: s.ous.length, users: s.users.length, groups: s.groups.length, computers: s.computers.length },
    differencesFromStandardBuild: compareToBaseline(s),
    security: s.security ?? "not reported yet: the student's lab script is older than the security checks",
    users: s.users.map((u) => ({
      sam: u.sam,
      title: u.title,
      container: u.container,
      enabled: u.enabled,
      lockedOut: u.lockedOut,
      memberOf: u.memberOf,
    })),
    groups: s.groups.map((g) => ({ name: g.name, container: g.container, memberCount: g.members.length })),
    computers: s.computers.map((c) => ({ name: c.name, container: c.container, enabled: c.enabled })),
    tip: "Call get_lab_state again with a name (user, group, computer, or OU) for full details such as descriptions, members, and logon data.",
  });
}

import type { Results, Skill } from "@/lib/academy-score";

// Security+ and CySA+ exam areas, and which Academy work practices each one.
// Tagged by exam area rather than numbered objective, because the numbers move
// with every exam version and the areas do not. Weights are CompTIA's
// published percentages for the exam named in `exam`. Update them here when a
// new version goes live. Safe to import in the browser: data and pure
// functions only.

export type CertId = "secplus" | "cysa";
export type CertStatus = "earned" | "studying" | "planning" | "none";

export type ExamDomain = {
  id: string;
  cert: CertId;
  name: string;
  weight: number;
  /** What the area covers, in the words the Academy teaches it. */
  topics: string[];
};

export type CertDef = { id: CertId; label: string; full: string; exam: string; note?: string; domains: ExamDomain[] };

export const CERTS: Record<CertId, CertDef> = {
  secplus: {
    id: "secplus",
    label: "Security+",
    full: "CompTIA Security+",
    exam: "SY0-701",
    note: "SY0-801 is due in November 2026 with the same five areas and more AI coverage.",
    domains: [
      {
        id: "sp-concepts",
        cert: "secplus",
        name: "General Security Concepts",
        weight: 12,
        topics: ["CIA triad", "authentication, authorization and accounting", "least privilege and zero trust", "change management", "hashing and encryption basics"],
      },
      {
        id: "sp-threats",
        cert: "secplus",
        name: "Threats, Vulnerabilities, and Mitigations",
        weight: 22,
        topics: ["social engineering and pretexting callers", "signs of password guessing and account takeover", "misconfigured and over-privileged accounts", "hardening and isolation as mitigations"],
      },
      {
        id: "sp-arch",
        cert: "secplus",
        name: "Security Architecture",
        weight: 18,
        topics: ["segmenting systems by function", "directory structure and where controls apply", "protecting data by who can reach it", "resilience and keeping evidence"],
      },
      {
        id: "sp-ops",
        cert: "secplus",
        name: "Security Operations",
        weight: 28,
        topics: ["identity and access management: provisioning, changes and offboarding", "password and lockout policy", "logging, monitoring and alerting", "incident response steps", "evidence preservation"],
      },
      {
        id: "sp-program",
        cert: "secplus",
        name: "Security Program Management and Oversight",
        weight: 20,
        topics: ["access reviews and audits", "following policy and procedure", "documentation and tickets", "security awareness"],
      },
    ],
  },
  cysa: {
    id: "cysa",
    label: "CySA+",
    full: "CompTIA CySA+",
    exam: "CS0-004",
    domains: [
      {
        id: "cy-ops",
        cert: "cysa",
        name: "Security Operations",
        weight: 34,
        topics: ["reading Windows security events", "SIEM alerts and log correlation", "indicators of compromise", "what normal looks like for an account or host"],
      },
      {
        id: "cy-vuln",
        cert: "cysa",
        name: "Vulnerability Management",
        weight: 26,
        topics: ["finding misconfigurations", "risky account flags and stale objects", "prioritizing what to fix first", "remediation and compensating controls"],
      },
      {
        id: "cy-ir",
        cert: "cysa",
        name: "Incident Response and Management",
        weight: 24,
        topics: ["detection and analysis", "containment before eradication", "preserving evidence", "attack patterns such as password spraying and privilege abuse"],
      },
      {
        id: "cy-report",
        cert: "cysa",
        name: "Reporting and Communication",
        weight: 16,
        topics: ["escalation notes", "explaining findings to non-technical staff", "incident summaries", "who to notify and when"],
      },
    ],
  },
};

export const CERT_IDS = Object.keys(CERTS) as CertId[];
export const ALL_DOMAINS: ExamDomain[] = CERT_IDS.flatMap((c) => CERTS[c].domains);
const DOMAIN_BY_ID = new Map(ALL_DOMAINS.map((d) => [d.id, d]));
export const domainById = (id: string) => DOMAIN_BY_ID.get(id);

// ---- what each piece of Academy work practices ------------------------------

/** On-the-job tasks (JOBS in academy-drills.ts) to the exam areas they practice. */
export const JOB_DOMAINS: Record<string, string[]> = {
  "enable-account": ["sp-ops", "sp-threats"],
  "group-access": ["sp-ops", "sp-concepts"],
  "create-user": ["sp-ops", "sp-program"],
  "fix-ou": ["sp-arch", "sp-ops"],
  "least-privilege": ["sp-concepts", "sp-ops", "cy-vuln"],
  offboard: ["sp-ops", "sp-program"],
  "service-account": ["sp-ops", "cy-vuln"],
  "reset-password": ["sp-ops", "sp-threats"],
  "stale-objects": ["cy-vuln", "sp-program"],
  "password-hygiene": ["cy-vuln", "sp-ops"],
  "group-type": ["sp-ops", "sp-arch"],
  "role-based-access": ["sp-concepts", "sp-ops"],
  "contain-account": ["cy-ir", "sp-ops"],
  "admin-password-policy": ["sp-ops", "cy-vuln"],
  "lockout-threshold": ["sp-ops", "cy-vuln"],
  "lockout-policy": ["sp-ops", "sp-threats"],
  "password-policy": ["sp-ops", "sp-threats"],
  "enable-auditing": ["cy-ops", "sp-ops"],
  "log-retention": ["cy-ops", "sp-arch"],
  "harden-account": ["cy-vuln", "sp-threats"],
  "verify-claim": ["sp-threats", "sp-program"],
  "triage-alert": ["cy-ir", "cy-ops"],
  "read-logs": ["cy-ops", "sp-ops"],
  "escalate-note": ["cy-report", "sp-program"],
  "trace-logon": ["cy-ops", "cy-ir"],
  "dns-fix": ["sp-arch", "sp-ops"],
  "firewall-rule": ["sp-arch", "cy-vuln"],
  "access-audit": ["cy-vuln", "sp-arch"],
  "gpo-scope": ["sp-ops", "sp-arch"],
  "quarantine-file": ["cy-ir", "sp-threats"],
  "contain-wire-credential": ["cy-ir", "sp-threats"],
  "verify-build-integrity": ["cy-vuln", "sp-threats"],
};

/** Missions to the exam areas they practice. */
export const MISSION_DOMAINS: Record<string, string[]> = {
  "d1-01": ["sp-ops"],
  "d1-02": ["sp-program", "sp-concepts"],
  "d1-03": ["sp-arch"],
  "d1-04": ["sp-arch"],
  "d1-05": ["sp-concepts", "sp-program"],
  "d1-06": ["sp-concepts", "sp-threats"],
  "d1-07": ["sp-ops"],
  "d1-08": ["sp-arch"],
  "d1-09": ["sp-program"],
  "d1-10": ["sp-arch"],
  "tq-01": ["sp-ops", "sp-concepts"],
  "tq-02": ["sp-ops", "sp-threats"],
  "tq-03": ["sp-ops", "sp-program"],
  "tq-04": ["cy-vuln", "sp-program"],
  "tq-05": ["sp-ops", "sp-arch"],
  "tq-11": ["sp-ops", "sp-program"],
  "tq-12": ["sp-concepts", "sp-threats"],
  "tq-13": ["cy-vuln", "sp-ops"],
  "tq-14": ["sp-arch", "sp-ops"],
  "tq-15": ["sp-ops", "sp-arch"],
  "tq-16": ["sp-arch", "sp-ops"],
  "tq-17": ["sp-arch", "cy-vuln"],
  "tq-18": ["sp-ops", "sp-arch"],
  "tq-19": ["cy-ir", "sp-threats"],
  "zt-01": ["sp-arch", "cy-vuln"],
  "zt-02": ["sp-arch", "cy-vuln"],
  "cp-03": ["cy-ir", "sp-threats"],
  "cp-04": ["cy-ir", "sp-arch"],
  "tq-20": ["sp-arch", "sp-ops"],
  "tq-21": ["sp-ops", "sp-threats"],
  "tq-22": ["cy-ops", "sp-ops"],
  "tq-23": ["cy-ops", "cy-ir"],
  "tq-24": ["sp-ops", "sp-arch"],
  "tq-25": ["cy-vuln", "sp-program"],
  "tq-06": ["cy-ops", "sp-arch"],
  "tq-07": ["cy-ops", "sp-threats"],
  "tq-08": ["cy-ops", "sp-concepts"],
  "w1-01": ["sp-concepts", "sp-ops"],
  "w1-02": ["sp-concepts", "cy-ir"],
  "w1-03": ["sp-ops", "sp-arch"],
  "w1-04": ["sp-threats", "sp-concepts"],
  "w1-05": ["sp-program", "cy-report"],
  "w2-01": ["sp-concepts", "sp-threats"],
  "w2-02": ["sp-concepts", "cy-ops"],
  "w2-03": ["sp-ops", "sp-threats"],
  "w2-04": ["sp-threats", "sp-concepts"],
  "w2-05": ["sp-arch", "sp-concepts"],
  "w3-01": ["sp-arch", "cy-ops"],
  "w3-02": ["cy-vuln", "cy-ops"],
  "w3-03": ["sp-arch", "cy-vuln"],
  "w3-04": ["cy-ops", "sp-threats"],
  "w3-05": ["cy-ops", "sp-threats"],
  "w4-06": ["cy-ops", "sp-threats"],
  "w4-01": ["sp-ops", "sp-concepts"],
  "w4-02": ["sp-concepts", "sp-program"],
  "w4-03": ["cy-vuln", "sp-ops"],
  "w4-04": ["sp-ops", "cy-vuln"],
  "w4-05": ["cy-vuln", "sp-arch"],
  "cd-01": ["sp-arch", "cy-ops"],
  "cd-02": ["sp-concepts", "cy-ops"],
  "cd-03": ["sp-program", "sp-concepts"],
  "cd-04": ["sp-program", "cy-report"],
  "cd-05": ["cy-ops", "sp-arch"],
  "cd-06": ["sp-concepts", "cy-ops"],
  "cd-07": ["sp-ops", "sp-concepts"],
  "tq-09": ["cy-ir", "sp-threats"],
  "tq-10": ["cy-ir", "cy-report"],
  "sl-01": ["cy-ops", "sp-threats"],
  "sl-02": ["cy-ops", "sp-threats"],
  "sl-03": ["cy-ops", "sp-ops"],
  "cc-11": ["cy-ops", "sp-ops"],
  "cc-12": ["cy-ops", "sp-concepts"],
  "rc-01": ["cy-ops", "sp-threats"],
  "dl-01": ["cy-ir", "sp-threats"],
  "pc-03": ["cy-ir", "sp-threats"],
  "pi-01": ["cy-ir", "sp-threats"],
  "pc-05": ["cy-ops", "sp-threats"],
  "pi-02": ["cy-ir", "sp-ops"],
  "ao-01": ["cy-ir", "sp-threats"],
  "ao-02": ["cy-ir", "sp-ops"],
  "pc-10": ["cy-ops", "sp-concepts"],
  "od-02": ["cy-ops", "sp-arch"],
  "od-04": ["cy-ir", "sp-threats"],
  "od-05": ["cy-ir", "sp-arch"],
  "od-06": ["cy-ir", "sp-threats"],
  "od-07": ["cy-ir", "sp-ops"],
  "od-08": ["cy-ops", "sp-concepts"],
  "od-09": ["cy-ops", "sp-concepts"],
  "rk-01": ["cy-ops", "sp-threats"],
  "rk-02": ["cy-ops", "sp-arch"],
  "rk-04": ["cy-vuln", "sp-arch"],
  "rk-03": ["cy-vuln", "sp-ops"],
  "rk-05": ["cy-ops", "sp-ops"],
  "rk-06": ["cy-ops", "sp-threats"],
  "rk-07": ["cy-ops", "sp-threats"],
  "rk-08": ["cy-ops", "sp-threats"],
  "rk-09": ["cy-ops", "sp-concepts"],
  // The Nmap addition to the scan lab, the Suricata detection-writing lab,
  // and the eight labs filling soc-mindset, Malware and Log Analysis
  // Fundamentals. Same domain-mapping reasoning as everything above: cy-ops
  // for hands-on tool use, sp-threats/cy-vuln for reasoning about an
  // attacker's behavior, cy-ir for response decisions, cy-report/sp-concepts
  // for write-ups and definitions.
  "nm-01": ["sp-arch", "cy-ops"],
  "nm-03": ["sp-arch", "cy-ops"],
  "nm-02": ["sp-concepts", "cy-vuln"],
  "sm2-01": ["cy-ops", "sp-threats"],
  "sm2-05": ["cy-ops", "sp-threats"],
  "sm2-02": ["sp-concepts", "cy-report"],
  "sm2-03": ["sp-arch", "cy-ops"],
  "sm2-06": ["cy-vuln", "sp-arch"],
  "sm2-04": ["sp-concepts", "cy-vuln"],
  "mw2-03": ["cy-ops", "sp-concepts"],
  "mw2-05": ["cy-ops", "sp-threats"],
  "mw2-04": ["sp-threats", "cy-vuln"],
  "mw2-01": ["cy-ops", "sp-threats"],
  "mw2-06": ["cy-ops", "sp-threats"],
  "mw2-07": ["cy-ops", "sp-threats"],
  "mw2-02": ["cy-ir", "sp-threats"],
  "la2-01": ["cy-ops", "sp-arch"],
  "la2-05": ["cy-ops", "sp-threats"],
  "la2-02": ["cy-ir", "cy-ops"],
  "la2-03": ["cy-ops", "sp-ops"],
  "la2-06": ["cy-ops", "sp-threats"],
  "la2-04": ["cy-ops", "cy-ir"],
};

/** Fallback when a question has no job tag. */
export const SKILL_DOMAINS: Record<Skill, string[]> = {
  accounts: ["sp-ops", "sp-concepts"],
  directory: ["sp-arch", "sp-ops"],
  troubleshooting: ["sp-threats", "sp-program"],
  security: ["cy-ops", "cy-ir"],
  logs: ["cy-ops", "sp-ops"],
  access: ["sp-concepts", "sp-ops"],
  risk: ["sp-program", "sp-concepts"],
};

export function domainsFor(ref: { job?: string; skill?: Skill; mission?: string }): ExamDomain[] {
  const ids = (ref.mission && MISSION_DOMAINS[ref.mission]) || (ref.job && JOB_DOMAINS[ref.job]) || (ref.skill && SKILL_DOMAINS[ref.skill]) || [];
  return ids.map((id) => DOMAIN_BY_ID.get(id)).filter((d): d is ExamDomain => Boolean(d));
}

// ---- the student's goals ---------------------------------------------------

export type RoleId = "help-desk" | "sysadmin" | "soc-analyst" | "cyber-analyst" | "ir-analyst";

/** Entry-level roles the Academy phases prepare for. `short` is the chip label on the marketing site. */
export const ROLES: { id: RoleId; label: string; short: string; phases: string; blurb: string }[] = [
  { id: "help-desk", label: "IT Support / Help Desk Technician", short: "IT support and help desk", phases: "Phase 1 and the Active Directory lab", blurb: "Accounts, access and sign-in problems, worked from tickets." },
  { id: "sysadmin", label: "Junior Systems Administrator", short: "Junior systems administrator", phases: "Phase 1 and the Active Directory lab", blurb: "Runs the directory, group policy and the servers behind it." },
  { id: "soc-analyst", label: "SOC Analyst (Tier 1)", short: "SOC analyst (Tier 1)", phases: "Phase 2", blurb: "Watches alerts, reads the logs and escalates what is real." },
  { id: "cyber-analyst", label: "Cybersecurity Analyst", short: "Cybersecurity analyst", phases: "Phases 2 and 3", blurb: "Finds weaknesses, tunes detections and reports risk." },
  { id: "ir-analyst", label: "Incident Response Analyst (Junior)", short: "Incident response analyst", phases: "Phase 3", blurb: "Contains an incident, keeps the evidence and writes it up." },
];
const ROLE_IDS = new Set<string>(ROLES.map((r) => r.id));
export const roleLabel = (id: RoleId) => ROLES.find((r) => r.id === id)?.label ?? id;
export const MAX_ROLES = 2;

export type StartLevel = "new" | "some" | "working";
export const START_LEVELS: { id: StartLevel; label: string; blurb: string }[] = [
  { id: "new", label: "New to IT", blurb: "No IT job yet. Starting from the basics." },
  { id: "some", label: "Early IT experience", blurb: "Classes, a home lab, or help at a past job." },
  { id: "working", label: "Working in IT", blurb: "In an IT role now and moving toward security." },
];

export const CERT_STATUSES: { id: CertStatus; label: string }[] = [
  { id: "earned", label: "Certified" },
  { id: "studying", label: "Actively preparing" },
  { id: "planning", label: "Planning to pursue" },
  { id: "none", label: "Not at this time" },
];

export type CertGoal = { status: CertStatus; /** YYYY-MM-DD, only when studying. */ examDate?: string; /** YYYY-MM-DD, only when earned. */ earnedDate?: string };

/** The intake's newer answers. All optional, so a profile saved before they
 *  existed is still complete. Coach reads them to pitch every answer. */
export type Timeline = "3m" | "6m" | "12m" | "open";
export type Hours = "lt3" | "3-6" | "6-10" | "10+";
export type Machine = "win" | "mac" | "chromebook" | "unsure";
export type HelpStyle = "hint" | "walk" | "example";
export const TIMELINES: { id: Timeline; label: string }[] = [
  { id: "3m", label: "Within 3 months" },
  { id: "6m", label: "In 3 to 6 months" },
  { id: "12m", label: "Within the year" },
  { id: "open", label: "No deadline, learning at my own pace" },
];
export const HOURS: { id: Hours; label: string }[] = [
  { id: "lt3", label: "Under 3 hours a week" },
  { id: "3-6", label: "3 to 6 hours a week" },
  { id: "6-10", label: "6 to 10 hours a week" },
  { id: "10+", label: "10 or more hours a week" },
];
/** Things a student has done in real life. More honest than rating yourself. */
export const DONE: { id: string; label: string }[] = [
  { id: "tickets", label: "Worked a ticket queue" },
  { id: "ad-reset", label: "Reset a password in Active Directory" },
  { id: "powershell", label: "Used PowerShell" },
  { id: "vm", label: "Built a virtual machine" },
  { id: "eventlogs", label: "Read Windows event logs" },
  { id: "wireshark", label: "Used Wireshark" },
];
export const MACHINES: { id: Machine; label: string }[] = [
  { id: "win", label: "A Windows PC with 16 GB of memory or more" },
  { id: "mac", label: "A Mac" },
  { id: "chromebook", label: "A Chromebook or tablet" },
  { id: "unsure", label: "Not sure" },
];
export const HELP_STYLES: { id: HelpStyle; label: string }[] = [
  { id: "hint", label: "Give me a hint so I can try again" },
  { id: "walk", label: "Walk me through it step by step" },
  { id: "example", label: "Show me a worked example" },
];
/** Four first-day tickets. Not graded: the misses tell Coach where to start. */
export const QUICK_CHECK: { id: string; topic: string; prompt: string; options: string[]; answer: number; why: string }[] = [
  {
    id: "cia",
    topic: "the CIA triad",
    prompt: "Payroll numbers changed overnight. Nothing leaked and everyone can still work. What failed?",
    options: ["Confidentiality, a leak", "Integrity, a lie", "Availability, a lockout"],
    answer: 1,
    why: "The data still looks normal but can't be trusted. That's integrity.",
  },
  {
    id: "ports",
    topic: "common ports",
    prompt: "A laptop is accepting connections on port 3389. What is that port for?",
    options: ["Web traffic", "Remote Desktop", "Email"],
    answer: 1,
    why: "3389 is RDP, which lets someone control the machine remotely.",
  },
  {
    id: "encoding",
    topic: "encoding versus encryption",
    prompt: "A vendor script says the password is encrypted: SGFyYm9yMjAyNg==. Is it?",
    options: ["Yes, it can't be read without a key", "No, it's Base64, so anyone can decode it", "It's a hash, so it can't be reversed"],
    answer: 1,
    why: "Letters, digits and a trailing = is Base64. Anyone can undo it in one step.",
  },
  {
    id: "groups",
    topic: "groups versus job titles",
    prompt: "Priya's job title is Help Desk Technician. Does that put her in the Helpdesk group?",
    options: ["Yes, the title sets her access", "No, only group membership grants access"],
    answer: 1,
    why: "A title is just a field on the account. Access comes from the groups it's in.",
  },
];
export type ProfileExtras = {
  timeline?: Timeline;
  hours?: Hours;
  done?: string[];
  /** Quick-check results, by question id: true when they got it right. */
  quick?: Record<string, boolean>;
  /** The option they picked on each quick-check question, so a miss names the mix-up. */
  quickPick?: Record<string, number>;
  machine?: Machine;
  help?: HelpStyle;
  notes?: string;
};

/** An empty list is a real answer ("none of these yet"). A list of nothing
 *  recognizable is not, so it counts as unanswered. */
function doneList(v: unknown, ids: Set<string>): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const kept = [...new Set(v.filter((x): x is string => typeof x === "string" && ids.has(x)))];
  return v.length > 0 && kept.length === 0 ? undefined : kept;
}

function quickPicks(v: unknown): Record<string, number> | undefined {
  if (!v || typeof v !== "object") return undefined;
  const out: Record<string, number> = {};
  for (const q of QUICK_CHECK) {
    const n = (v as Record<string, unknown>)[q.id];
    if (Number.isInteger(n) && (n as number) >= 0 && (n as number) < q.options.length) out[q.id] = n as number;
  }
  return Object.keys(out).length ? out : undefined;
}

export function sanitizeExtras(raw: unknown): ProfileExtras {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const pick = <T extends string>(v: unknown, list: { id: T }[]) => (list.some((x) => x.id === v) ? (v as T) : undefined);
  const doneIds = new Set(DONE.map((d) => d.id));
  const quickIds = new Set(QUICK_CHECK.map((q) => q.id));
  const quickIn = (r.quick && typeof r.quick === "object" ? r.quick : {}) as Record<string, unknown>;
  const quick = Object.fromEntries(Object.entries(quickIn).filter(([k, v]) => quickIds.has(k) && typeof v === "boolean")) as Record<string, boolean>;
  const out: ProfileExtras = {
    timeline: pick(r.timeline, TIMELINES),
    hours: pick(r.hours, HOURS),
    done: doneList(r.done, doneIds),
    quick: Object.keys(quick).length ? quick : undefined,
    quickPick: quickPicks(r.quickPick),
    machine: pick(r.machine, MACHINES),
    help: pick(r.help, HELP_STYLES),
    notes: typeof r.notes === "string" && r.notes.trim() ? r.notes.replace(/\s+/g, " ").trim().slice(0, 200) : undefined,
  };
  return Object.fromEntries(Object.entries(out).filter(([, v]) => v !== undefined)) as ProfileExtras;
}

export type StudentProfile = {
  certs: Record<CertId, CertGoal>;
  otherCerts: string;
  roles: RoleId[];
  start: StartLevel;
  background: string;
  /** What to call them. Range greets people by a name taken from the
   *  account they signed up with, and that is whatever the sign-up form or
   *  the email address happened to say -- nothing in the product could
   *  change it. Empty means keep using the account's. */
  callMe: string;
  extras: ProfileExtras;
  updatedAt: string;
};

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, n) : "");

/** Validates a profile from the browser or the database. Null when it is not complete.
 *  fillNewCerts: a saved profile from before a certification was added to the
 *  list counts that one as "not at this time" rather than as incomplete, so
 *  adding a cert never sends every student back through the questions. */
export function sanitizeProfile(raw: unknown, { fillNewCerts = false }: { fillNewCerts?: boolean } = {}): StudentProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const certsIn = (r.certs && typeof r.certs === "object" ? r.certs : {}) as Record<string, unknown>;
  const certs = {} as Record<CertId, CertGoal>;
  for (const id of CERT_IDS) {
    const row = (certsIn[id] && typeof certsIn[id] === "object" ? certsIn[id] : {}) as Record<string, unknown>;
    const status = CERT_STATUSES.some((s) => s.id === row.status) ? (row.status as CertStatus) : fillNewCerts && !(id in certsIn) ? "none" : null;
    if (!status) return null;
    const date = typeof row.examDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row.examDate) ? row.examDate : undefined;
    const earned = typeof row.earnedDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row.earnedDate) ? row.earnedDate : undefined;
    certs[id] =
      status === "studying" && date ? { status, examDate: date } : status === "earned" && earned ? { status, earnedDate: earned } : { status };
  }
  const roles = Array.isArray(r.roles) ? [...new Set(r.roles.filter((x): x is RoleId => typeof x === "string" && ROLE_IDS.has(x)))].slice(0, MAX_ROLES) : [];
  if (!roles.length) return null;
  const start = START_LEVELS.some((s) => s.id === r.start) ? (r.start as StartLevel) : null;
  if (!start) return null;
  return {
    certs,
    otherCerts: clip(r.otherCerts, 160),
    roles,
    start,
    background: clip(r.background, 280),
    callMe: clip(r.callMe, 40),
    extras: sanitizeExtras(r.extras),
    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt.slice(0, 40) : new Date().toISOString(),
  };
}

/** The certs the student is working toward, studying first. Earned and not-yet are left out. */
export function targetCerts(p: StudentProfile | null): CertId[] {
  if (!p) return CERT_IDS;
  const rank: Record<CertStatus, number> = { studying: 0, planning: 1, earned: 9, none: 9 };
  return CERT_IDS.filter((c) => rank[p.certs[c].status] < 9).sort((a, b) => rank[p.certs[a].status] - rank[p.certs[b].status]);
}

/** Exam areas to show on a mission or drill result: only for the certs the student is working toward. */
export function examLinks(ref: { job?: string; skill?: Skill; mission?: string }, p: StudentProfile | null): string[] {
  const certs = new Set(targetCerts(p));
  return domainsFor(ref)
    .filter((d) => certs.has(d.cert))
    .map((d) => `${CERTS[d.cert].label} · ${d.name}`);
}

// ---- where the student stands on each exam area -----------------------------

/** One graded question, as the drill log keeps it. */
export type AnsweredRow = { j?: string; s: Skill; c: 0 | 1 };

export type DomainStanding = { domain: ExamDomain; tried: number; right: number };

/** How much practice each exam area has had, from missions and drills. */
export function domainStanding(results: Results, rows: AnsweredRow[], cert?: CertId): DomainStanding[] {
  const map = new Map<string, DomainStanding>();
  for (const d of ALL_DOMAINS) if (!cert || d.cert === cert) map.set(d.id, { domain: d, tried: 0, right: 0 });
  const add = (ids: string[], ok: boolean) => {
    for (const id of ids) {
      const row = map.get(id);
      if (!row) continue;
      row.tried += 1;
      if (ok) row.right += 1;
    }
  };
  for (const [id, r] of Object.entries(results)) {
    if (!MISSION_DOMAINS[id] || (!r.solved && r.wrong === 0)) continue;
    add(MISSION_DOMAINS[id], r.solved && r.wrong === 0 && !r.hint);
  }
  for (const row of rows) add(domainsFor({ job: row.j, skill: row.s }).map((d) => d.id), row.c === 1);
  return [...map.values()];
}

/**
 * The exam area today's practice should lean on: the weakest, most heavily
 * weighted area of the cert the student is working toward first. Null when
 * they are not working toward either cert.
 */
export function examFocus(p: StudentProfile | null, results: Results, rows: AnsweredRow[]): ExamDomain | null {
  const cert = targetCerts(p)[0];
  if (!cert) return null;
  const scored = domainStanding(results, rows, cert).map((s) => {
    // Untried areas count as weak. Weight breaks ties toward what the exam asks most.
    const accuracy = s.tried ? s.right / s.tried : 0;
    const confidence = Math.min(1, s.tried / 6);
    return { d: s.domain, score: accuracy * confidence - s.domain.weight / 1000 };
  });
  scored.sort((a, b) => a.score - b.score);
  return scored[0]?.d ?? null;
}

/** Jobs that practice an exam area. */
export function jobsForDomain(domainId: string): string[] {
  return Object.entries(JOB_DOMAINS)
    .filter(([, ids]) => ids.includes(domainId))
    .map(([job]) => job);
}

// ---- what a target role involves ------------------------------------------

/** A role summarized from current job postings and public role guides. Shared by every student who picks the role. */
export type RoleBrief = {
  role: RoleId;
  summary: string;
  tasks: string[];
  tools: string[];
  requirements: string[];
  certs: string[];
  sources: { title: string; url: string }[];
  researchedAt: string;
};

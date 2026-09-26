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
  "tq-06": ["cy-ops", "sp-arch"],
  "tq-07": ["cy-ops", "sp-threats"],
  "tq-08": ["cy-ops", "sp-concepts"],
  "tq-09": ["cy-ir", "sp-threats"],
  "tq-10": ["cy-ir", "cy-report"],
};

/** Fallback when a question has no job tag. */
export const SKILL_DOMAINS: Record<Skill, string[]> = {
  accounts: ["sp-ops", "sp-concepts"],
  directory: ["sp-arch", "sp-ops"],
  troubleshooting: ["sp-threats", "sp-program"],
  security: ["cy-ops", "cy-ir"],
};

export function domainsFor(ref: { job?: string; skill?: Skill; mission?: string }): ExamDomain[] {
  const ids = (ref.mission && MISSION_DOMAINS[ref.mission]) || (ref.job && JOB_DOMAINS[ref.job]) || (ref.skill && SKILL_DOMAINS[ref.skill]) || [];
  return ids.map((id) => DOMAIN_BY_ID.get(id)).filter((d): d is ExamDomain => Boolean(d));
}

// ---- the student's goals ---------------------------------------------------

export type RoleId = "help-desk" | "sysadmin" | "soc-analyst" | "cyber-analyst" | "ir-analyst";

/** Entry-level roles the Academy phases prepare for. */
export const ROLES: { id: RoleId; label: string; phases: string; blurb: string }[] = [
  { id: "help-desk", label: "IT Support / Help Desk Technician", phases: "Phase 1 and the Active Directory lab", blurb: "Accounts, access and sign-in problems, worked from tickets." },
  { id: "sysadmin", label: "Junior Systems Administrator", phases: "Phase 1 and the Active Directory lab", blurb: "Runs the directory, group policy and the servers behind it." },
  { id: "soc-analyst", label: "SOC Analyst (Tier 1)", phases: "Phase 2", blurb: "Watches alerts, reads the logs and escalates what is real." },
  { id: "cyber-analyst", label: "Cybersecurity Analyst", phases: "Phases 2 and 3", blurb: "Finds weaknesses, tunes detections and reports risk." },
  { id: "ir-analyst", label: "Incident Response Analyst (Junior)", phases: "Phase 3", blurb: "Contains an incident, keeps the evidence and writes it up." },
];
const ROLE_IDS = new Set<string>(ROLES.map((r) => r.id));
export const roleLabel = (id: RoleId) => ROLES.find((r) => r.id === id)?.label ?? id;
export const MAX_ROLES = 2;

export type StartLevel = "new" | "some" | "working";
export const START_LEVELS: { id: StartLevel; label: string; blurb: string }[] = [
  { id: "new", label: "Brand new to IT", blurb: "No IT job yet. Starting from the basics." },
  { id: "some", label: "Some IT experience", blurb: "Classes, a home lab, or help at a past job." },
  { id: "working", label: "Already working in IT", blurb: "In an IT role now and moving toward security." },
];

export const CERT_STATUSES: { id: CertStatus; label: string }[] = [
  { id: "earned", label: "Earned" },
  { id: "studying", label: "Studying" },
  { id: "planning", label: "Planning" },
  { id: "none", label: "Not yet" },
];

export type CertGoal = { status: CertStatus; /** YYYY-MM-DD, only when studying. */ examDate?: string };

export type StudentProfile = {
  certs: Record<CertId, CertGoal>;
  otherCerts: string;
  roles: RoleId[];
  start: StartLevel;
  background: string;
  updatedAt: string;
};

const clip = (v: unknown, n: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, n) : "");

/** Validates a profile from the browser or the database. Null when it is not complete. */
export function sanitizeProfile(raw: unknown): StudentProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const certsIn = (r.certs && typeof r.certs === "object" ? r.certs : {}) as Record<string, unknown>;
  const certs = {} as Record<CertId, CertGoal>;
  for (const id of CERT_IDS) {
    const row = (certsIn[id] && typeof certsIn[id] === "object" ? certsIn[id] : {}) as Record<string, unknown>;
    const status = CERT_STATUSES.some((s) => s.id === row.status) ? (row.status as CertStatus) : null;
    if (!status) return null;
    const date = typeof row.examDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row.examDate) ? row.examDate : undefined;
    certs[id] = status === "studying" && date ? { status, examDate: date } : { status };
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

import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { BASELINE_GROUPS, BASELINE_USERS, type LabGroup, type LabSnapshot, type LabUser } from "@/lib/academy-lab";
import { MISSION_JOBS } from "@/lib/academy-missions";
import { SKILLS, summarize, type Results, type Skill } from "@/lib/academy-score";

// Daily and timed drills. Questions come from the student's own lab
// snapshot when they have one, and from the standard GovTech build when
// they do not. Answers never leave the server: the drill token carries
// them encrypted, so grading needs no database row.

export type DrillMode = "daily" | "timed" | "ctf";
/** Modes that can sit in the log: also results recorded by Coach or an MCP client. */
export type EntryMode = DrillMode | "coach";

export const TIMED_SIZE = 5;
export const TIMED_LIMIT_SECONDS = 180;
export const LEVEL_NAMES = ["Foundation", "Standard", "Hard", "Expert"] as const;
const TIMED_BY_LEVEL = [180, 165, 150, 120];
const LATE_GRACE_SECONDS = 10;

export type Item = {
  skill: Skill;
  title: string;
  story?: string;
  prompt: string;
  evidence?: string[];
  choices: string[];
  answer: string;
  explain: string;
  /** What this question is about. Used to keep drills from repeating. */
  theme?: string;
  /** Typed-answer question (the weekly CTF). No choices. */
  free?: boolean;
  accept?: string[];
  hint?: string;
  format?: string;
  /** How it is asked. Absent means a multiple-choice decision. */
  kind?: "decide" | "respond" | "change";
  /** Written answer (respond). Points a strong answer covers, graded by the model. */
  rubric?: string[];
  long?: boolean;
  /** A real change in the student's lab (change). */
  task?: Task;
  /** Which on-the-job task this practices. See JOBS. */
  job?: string;
  /** A typed-answer question that also needs a lab change to finish. The change unlocks after the answer. */
  gate?: boolean;
  /** The evidence is the real Security log in the student's lab, planted by a queued job. */
  live?: { jobId: string };
};

export type Check =
  | { t: "member"; sam: string; group: string; want: boolean }
  | { t: "exists"; sam: string; ou: string }
  | { t: "container"; sam: string; ou: string }
  | { t: "enabled"; sam: string; want: boolean }
  | { t: "noexpire"; sam: string; want: boolean }
  | { t: "desc"; sam: string; text: string }
  | { t: "flag"; sam: string; flag: "pwdNotRequired" | "noPreAuth" | "delegation" | "lockedOut" | "passwordExpired"; want: boolean }
  | { t: "group"; name: string; category?: "Security" | "Distribution"; scope?: string; container?: string; member?: string }
  | { t: "pso"; minLength: number; appliesTo: string; maxLockout?: number }
  | { t: "policy"; key: "minLength" | "complexity" | "history" | "lockoutThreshold" | "lockoutDurationMin" | "lockoutWindowMin"; min?: number; max?: number; bool?: boolean }
  | { t: "audit"; sub: string; need: "Success" | "Failure" | "Both" }
  | { t: "logsize"; minMB: number };

export type Task = {
  checks: { c: Check; label: string }[];
  guide: string[];
  /** The same change as PowerShell, shown after the task. */
  runbook?: string[];
  /** A script that plants a practice account for a break-and-fix ticket. */
  setup?: { sam: string; note: string; script: string };
};

export type PublicItem = Omit<Item, "answer" | "explain" | "accept" | "hint" | "rubric" | "task" | "job" | "gate" | "live"> & {
  gated?: boolean;
  live?: boolean;
  checklist?: string[];
  checkCount?: number;
  setup?: { note: string; script: string };
  job?: string;
};

/** One question. `x`, `a` and `e` are kept only for misses: what they picked, the best answer, and why. */
export type DrillDetail = { t: string; s: Skill; c: 0 | 1; p?: string; th?: string; x?: string; a?: string; e?: string; j?: string; k?: string };

export type DrillEntry = {
  id: string;
  day: string;
  mode: EntryMode;
  correct: number;
  total: number;
  seconds: number;
  misses: Skill[];
  at: string;
  level: number;
  /** One row per question, so weak spots can be measured later. */
  detail: DrillDetail[];
};

export type DrillReview = { title: string; skill: Skill; picked: string | null; answer: string; correct: boolean; explain: string; runbook?: string[] };

type Payload = { id: string; u: string; mode: DrillMode; day: string; iat: number; limit: number; source: "lab" | "standard"; ai: boolean; level: number; t0?: number; items: Item[] };

// ---- random helpers -------------------------------------------------------

type Rng = () => number;

function seeded(seed: string): Rng {
  let h = createHash("sha256").update(seed).digest().readUInt32LE(0);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(r: Rng, list: readonly T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const pick = <T,>(r: Rng, list: readonly T[]): T | null => (list.length ? list[Math.floor(r() * list.length)] : null);

function choicesOf(r: Rng, answer: string, wrong: string[], min = 3): string[] | null {
  const others = shuffle(r, [...new Set(wrong)].filter((w) => w && w !== answer)).slice(0, 3);
  if (others.length + 1 < min) return null;
  return shuffle(r, [answer, ...others]);
}

// ---- lab data -------------------------------------------------------------

const human = (s: string) => s.replace(/([a-z])([A-Z])/g, "$1 $2");
const nameOf = (u: LabUser) => u.name || u.sam;
const deptOf = (container: string) => /OU=([^,]+),OU=Departments$/i.exec(container)?.[1] ?? null;

// The lab a student gets when they have not synced one: the stock build.
export function standardSnapshot(): LabSnapshot {
  const users: LabUser[] = BASELINE_USERS.map((b) => ({
    sam: b.sam,
    name: b.sam.split(".").map((p) => p[0].toUpperCase() + p.slice(1)).join(" "),
    title: "",
    department: human(b.deptOu),
    description: "",
    container: `OU=Users,OU=${human(b.deptOu)},OU=Departments`,
    enabled: true,
    lockedOut: false,
    badLogonCount: 0,
    passwordNeverExpires: false,
    passwordExpired: false,
    lastLogon: null,
    memberOf: [b.group, ...(b.extra ?? [])],
  }));
  const groups: LabGroup[] = BASELINE_GROUPS.map((name) => ({
    name,
    scope: "Global",
    category: "Security",
    description: "",
    container: "OU=AccessLevels",
    members: users.filter((u) => u.memberOf.includes(name)).map((u) => u.name),
  }));
  return {
    capturedAt: new Date().toISOString(),
    domain: { dnsRoot: "", netbios: "" },
    ous: [],
    users,
    groups,
    computers: [{ name: "IT-WKS01", description: "", container: "OU=Workstations,OU=IT,OU=Departments", enabled: true, lastLogon: null }],
  };
}

/** A typed-answer investigation from the lab, used when the weekly writer does not return one. */
export function stockCtf(snapshot: LabSnapshot | null, week: string): Item {
  const s = snapshot && snapshot.users.length ? snapshot : standardSnapshot();
  const r = seeded(`ctf-stock:${week}`);
  const people = s.users.filter((u) => u.sam && !u.sam.startsWith("svc-"));
  const actor = people[Math.floor(r() * people.length)] ?? s.users[0];
  const other = people.find((u) => u.sam !== actor.sam) ?? actor;
  const host = s.computers.find((c) => c.enabled)?.name || s.computers[0]?.name || "WM-WKS07";
  const ip = "10.20.14.47";
  const otherIp = "10.20.8.12";
  return {
    skill: "security",
    title: "After hours sign-in",
    story: "A detection fired for a successful sign-in at 02:14. The alert names an address, not a person. Tie the address to a workstation, then the workstation to the account that actually signed in.",
    prompt: "Which account completed the 02:14 sign-in?",
    evidence: [
      `4625 Failure. Account ${other.sam}. Workstation ${host}. Source ${otherIp}. 02:11.`,
      `DHCP. ${otherIp} leased to IT-WKS01. 18:40.`,
      `4624 Success. Logon type 3. Account ${actor.sam}. Source ${ip}. 02:14.`,
      `DNS. ${ip} is ${host}.`,
      `4740 Account locked. ${other.sam}. 02:12.`,
      `4634 Logoff. ${actor.sam}. ${host}. 02:19.`,
      `4768 Kerberos TGT. ${other.sam}. 09:02.`,
    ],
    choices: [],
    answer: actor.sam,
    accept: actor.name && actor.name !== actor.sam ? [actor.name] : [],
    explain: `The 02:14 success is the 4624 from ${ip}. DNS says that address is ${host}. The account on that 4624 is ${actor.sam}. The failure and the lockout are ${other.sam}, from a different address, three minutes earlier.`,
    hint: "Start with the successful 4624 at 02:14, then match its source address in the DNS line.",
    format: "Account name, like first.last",
    free: true,
    theme: "CTF: After hours sign-in",
    job: "trace-logon",
  };
}

// ---- Active Directory questions -------------------------------------------

type Gen = (s: LabSnapshot, r: Rng) => Item | null;

const userGroups = (s: LabSnapshot) => s.groups.filter((g) => g.members.length > 0);

const groupCount: Gen = (s, r) => {
  const g = pick(r, userGroups(s).filter((x) => x.members.length >= 2));
  if (!g) return null;
  const n = g.members.length;
  const wrong = [n - 1, n + 1, n + 2, n - 2].filter((x) => x >= 0).map(String);
  const choices = choicesOf(r, String(n), wrong);
  if (!choices) return null;
  return {
    skill: "accounts",
    title: "Access audit",
    prompt: `HR is auditing access. How many members does ${g.name} have right now?`,
    choices,
    answer: String(n),
    explain: `Open ${g.name} in Active Directory Users and Computers and count the Members tab. It lists ${n}.`,
  };
};

const whoIsMember: Gen = (s, r) => {
  const g = pick(r, userGroups(s));
  if (!g) return null;
  const names = new Set(g.members);
  const inGroup = s.users.filter((u) => names.has(u.name));
  const outside = s.users.filter((u) => !names.has(u.name));
  const who = pick(r, inGroup);
  if (!who) return null;
  const choices = choicesOf(r, nameOf(who), outside.map(nameOf));
  if (!choices) return null;
  return {
    skill: "accounts",
    title: "Who has access",
    prompt: `Which of these people is a member of ${g.name}?`,
    choices,
    answer: nameOf(who),
    explain: `${nameOf(who)} is on the Members tab of ${g.name}. The others are not listed there.`,
  };
};

const whichGroup: Gen = (s, r) => {
  const deptGroups = s.groups.filter((g) => /users$/i.test(g.name)).map((g) => g.name);
  const u = pick(r, s.users.filter((x) => x.memberOf.some((m) => /users$/i.test(m))));
  if (!u) return null;
  const answer = u.memberOf.find((m) => /users$/i.test(m))!;
  const choices = choicesOf(r, answer, deptGroups);
  if (!choices) return null;
  return {
    skill: "accounts",
    title: "Department group",
    prompt: `Which department group is ${nameOf(u)} in?`,
    choices,
    answer,
    explain: `Open ${nameOf(u)} and read the Member Of tab. The department group is ${answer}.`,
  };
};

const byTitle: Gen = (s, r) => {
  const titled = s.users.filter((u) => u.title);
  const counts = new Map<string, number>();
  for (const u of titled) counts.set(u.title, (counts.get(u.title) ?? 0) + 1);
  const u = pick(r, titled.filter((x) => counts.get(x.title) === 1));
  if (!u) return null;
  const choices = choicesOf(r, nameOf(u), titled.map(nameOf));
  if (!choices) return null;
  return {
    skill: "accounts",
    title: "Caller lookup",
    prompt: `A caller asks for the ${u.title}. Which account is that?`,
    choices,
    answer: nameOf(u),
    explain: `Search the directory by title. ${nameOf(u)} is the ${u.title}.`,
  };
};

const whichDept: Gen = (s, r) => {
  const depts = [...new Set(s.users.map((u) => deptOf(u.container)).filter((d): d is string => !!d))].map(human);
  const u = pick(r, s.users.filter((x) => deptOf(x.container)));
  if (!u) return null;
  const answer = human(deptOf(u.container)!);
  const choices = choicesOf(r, answer, depts);
  if (!choices) return null;
  return {
    skill: "directory",
    title: "Find the OU",
    prompt: `Which department OU holds ${nameOf(u)}'s account?`,
    choices,
    answer,
    explain: `Accounts live under Departments, then the department, then Users. ${nameOf(u)} is in ${answer}.`,
  };
};

const computerHome: Gen = (s, r) => {
  const c = pick(r, s.computers.filter((x) => x.container));
  if (!c) return null;
  const places = s.computers.map((x) => x.container).concat(s.ous.map((o) => o.path).filter((p) => /workstations/i.test(p)));
  const choices = choicesOf(r, c.container, places);
  if (!choices) return null;
  return {
    skill: "directory",
    title: "Find the computer",
    prompt: `Where does the computer object ${c.name} live in the directory?`,
    choices,
    answer: c.container,
    explain: `Search for ${c.name}. Its container is ${c.container}.`,
  };
};

const accountState: Gen = (s, r) => {
  const u = pick(r, s.users);
  if (!u) return null;
  const state = u.lockedOut
    ? "Locked out"
    : !u.enabled
      ? "Disabled"
      : u.passwordExpired
        ? "Password expired"
        : "Enabled and not locked out";
  return {
    skill: "troubleshooting",
    title: "Check the claim",
    prompt: `${nameOf(u)} says they cannot sign in and the ticket blames a lockout. Check the account. What is true?`,
    choices: shuffle(r, ["Locked out", "Disabled", "Password expired", "Enabled and not locked out"]),
    answer: state,
    explain: `Open ${nameOf(u)}'s properties. The Account tab shows the state: ${state.toLowerCase()}. Check first, then act.`,
  };
};

const claimGroup: Gen = (s, r) => {
  const u = pick(r, s.users);
  const g = pick(r, userGroups(s));
  if (!u || !g) return null;
  const isMember = g.members.includes(u.name) || u.memberOf.includes(g.name);
  const yes = "Yes, they are missing, so add them";
  const no = "No, they are already a member, so the ticket is wrong";
  return {
    skill: "troubleshooting",
    title: "Check the claim",
    prompt: `A ticket says ${nameOf(u)} is missing from ${g.name}. Check the group before you change anything. Is the ticket right?`,
    choices: shuffle(r, [yes, no, "Cannot tell without resetting their password"]),
    answer: isMember ? no : yes,
    explain: isMember
      ? `${nameOf(u)} is already on the Members tab of ${g.name}. A ticket is a claim, not proof.`
      : `${nameOf(u)} is not on the Members tab of ${g.name}, so the ticket is right.`,
  };
};

const lockedNow: Gen = (s, r) => {
  const u = pick(r, s.users.filter((x) => x.lockedOut));
  if (!u) return null;
  const choices = choicesOf(r, nameOf(u), s.users.filter((x) => !x.lockedOut).map(nameOf));
  if (!choices) return null;
  return {
    skill: "troubleshooting",
    title: "Who is locked out",
    prompt: "A lockout alert came in without a name. Which account is locked out right now?",
    choices,
    answer: nameOf(u),
    explain: `${nameOf(u)} shows Account is locked out on the Account tab.`,
  };
};

// ---- alert questions ------------------------------------------------------

type Alert = { title: string; prompt: string; evidence: string[]; answer: string; wrong: string[]; explain: string };

const ALERTS: Alert[] = [
  {
    title: "Login after failures",
    prompt: "Finance account m.chen normally signs in from the office, 9 to 5. What is the first move?",
    evidence: [
      "02:03:11  4625  FAIL  m.chen  from 185.220.101.7  bad password",
      "02:03:19  4625  FAIL  m.chen  from 185.220.101.7  bad password",
      "02:03:26  4625  FAIL  m.chen  from 185.220.101.7  bad password",
      "02:03:41  4624  OK    m.chen  from 185.220.101.7  network logon",
    ],
    answer: "Contain the account and keep the log evidence",
    wrong: ["Delete the account so the attacker is gone", "Close it. The user mistyped a password", "Reboot the domain controller"],
    explain: "Three failures then a success from an outside address at 2 AM looks like a guessed password. Contain first, keep the evidence, then escalate. Deleting the account destroys the trail.",
  },
  {
    title: "Many accounts, one source",
    prompt: "One workstation tried five different accounts in three seconds. What does this look like?",
    evidence: [
      "09:14:02  4625  FAIL  a.rivera     from 10.4.8.22",
      "09:14:03  4625  FAIL  p.nair       from 10.4.8.22",
      "09:14:03  4625  FAIL  d.brooks     from 10.4.8.22",
      "09:14:04  4625  FAIL  m.lee        from 10.4.8.22",
      "09:14:04  4625  FAIL  s.whitfield  from 10.4.8.22",
    ],
    answer: "Password spraying from that host. Isolate it and escalate",
    wrong: ["Five people forgot their passwords at once", "A normal morning sign-in rush", "A broken keyboard on the workstation"],
    explain: "Real users fail on their own account, one at a time. One source hitting many accounts in seconds is a script guessing passwords.",
  },
  {
    title: "Expected 2 AM login",
    prompt: "A successful 2 AM login for an IT admin. What do you do?",
    evidence: ["02:07:40  4624  OK  a.rivera  from IT-WKS01 (VPN)", "Change ticket CHG-2207: a.rivera on-call patching window 02:00 to 03:00"],
    answer: "Match it to the change ticket and close it as expected",
    wrong: ["Disable the account right away", "Escalate it as a confirmed breach", "Ignore it. Admins are always fine"],
    explain: "Check the claim against the record before you act. The login falls inside an approved window on the admin's own workstation.",
  },
  {
    title: "Normal lockout",
    prompt: "Jamie is at her own desk at 8:40 AM and is locked out after five bad passwords. First step?",
    evidence: ["08:41:10  4625  FAIL  j.torres  from WM-WKS04  bad password (x5)", "08:42:02  4740  LOCKED  j.torres"],
    answer: "Verify who is calling, unlock the account, and reset the password if needed",
    wrong: ["Open a major incident", "Wipe her workstation", "Add her to IT Admins so it stops"],
    explain: "One user, her own machine, normal hours. This is a help desk fix, not an incident. Verify identity first.",
  },
  {
    title: "Service account at a keyboard",
    prompt: "A service account signed in interactively at a workstation it has never touched. What does that suggest?",
    evidence: ["03:22:15  4624  OK  svc-backup-job  logon type 2 (interactive)  from OPS-WKS03"],
    answer: "Someone is using the service account by hand. Escalate and contain",
    wrong: ["The backup job is running normally", "The service account became a person account", "The workstation clock is wrong"],
    explain: "Service accounts run jobs. They do not sit at keyboards. An interactive logon means a person has the password.",
  },
  {
    title: "Admin group change",
    prompt: "A help desk account added Taylor to IT Admins at 2 AM and there is no change ticket. What now?",
    evidence: ["02:10:44  4728  MEMBER ADDED  IT Admins  taylor.osei  by helpdesk-tmp", "Change ticket search: none found"],
    answer: "Treat it as unauthorized: remove the membership, keep the logs, escalate",
    wrong: ["Leave it. Help desk can add anyone", "Delete Taylor's account", "Wait until Monday and ask"],
    explain: "Privilege changes need a ticket. With none, undo the change, preserve the evidence, and escalate.",
  },
];

const alertGens: Gen[] = ALERTS.map((a) => (_s, r) => {
  const choices = choicesOf(r, a.answer, a.wrong, 4);
  return choices ? { skill: "security", title: a.title, prompt: a.prompt, evidence: a.evidence, choices, answer: a.answer, explain: a.explain } : null;
});

const GENERATORS: Record<Skill, Gen[]> = {
  accounts: [groupCount, whoIsMember, whichGroup, byTitle],
  directory: [whichDept, computerHome],
  troubleshooting: [accountState, claimGroup, lockedNow],
  security: alertGens,
};

// ---- building a drill -----------------------------------------------------

/** The skill to drill today: weak skills come up more often. */
export function pickSkill(seed: string, results: Results): Skill {
  const r = seeded(`skill:${seed}`);
  const scores = new Map(summarize(results).skills.map((k) => [k.key, k.score]));
  const skills = Object.keys(GENERATORS) as Skill[];
  const weights = skills.map((k) => 1 + (100 - (scores.get(k) ?? 40)) / 25);
  let roll = r() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < skills.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return skills[i];
  }
  return skills[skills.length - 1];
}

export { seeded, shuffle };

function pickItems(seed: string, snapshot: LabSnapshot, results: Results, mode: DrillMode, size: number, avoid: Set<string>): Item[] {
  const r = seeded(seed);
  const scores = new Map(summarize(results).skills.map((k) => [k.key, k.score]));
  // Weak skills get asked more. Timed runs lean on alerts and ticket checks.
  const bias: Record<Skill, number> =
    mode === "timed"
      ? { accounts: 1, directory: 0.6, troubleshooting: 1.4, security: 1.8 }
      : { accounts: 1, directory: 1, troubleshooting: 1, security: 1 };
  const skills = Object.keys(GENERATORS) as Skill[];
  const queues = new Map<Skill, Gen[]>(skills.map((k) => [k, shuffle(r, GENERATORS[k])]));
  const used = new Map<Skill, number>();
  const items: Item[] = [];
  const seen = new Set<string>();
  let guard = 0;

  while (items.length < size && guard++ < 80) {
    const live = skills.filter((k) => queues.get(k)!.length > 0);
    const open = live.filter((k) => (used.get(k) ?? 0) < 2);
    const pool = open.length ? open : live;
    if (!pool.length) break;
    const weights = pool.map((k) => bias[k] * (1 + (100 - (scores.get(k) ?? 40)) / 25));
    let roll = r() * weights.reduce((a, b) => a + b, 0);
    let skill = pool[pool.length - 1];
    for (let i = 0; i < pool.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        skill = pool[i];
        break;
      }
    }
    const made = queues.get(skill)!.shift()!(snapshot, r);
    const item = made ? { ...made, theme: made.theme ?? made.title } : null;
    if (!item || seen.has(item.prompt) || avoid.has(item.prompt)) continue;
    seen.add(item.prompt);
    used.set(skill, (used.get(skill) ?? 0) + 1);
    items.push(item);
  }
  return shuffle(r, items);
}

function key() {
  const base = process.env.ACADEMY_DRILL_SECRET || `${process.env.ACADEMY_PASSCODE || "dev"}:${process.env.ACADEMY_SESSION_SALT || "purvex-academy"}`;
  return createHash("sha256").update(`drill:${base}`).digest();
}

function seal(payload: Payload): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString("base64url");
}

function unseal(token: string): Payload | null {
  try {
    const raw = Buffer.from(token, "base64url");
    const decipher = createDecipheriv("aes-256-gcm", key(), raw.subarray(0, 12));
    decipher.setAuthTag(raw.subarray(12, 28));
    const text = Buffer.concat([decipher.update(raw.subarray(28)), decipher.final()]).toString("utf8");
    return JSON.parse(text) as Payload;
  } catch {
    return null;
  }
}

function publicItems(items: Item[], level: number): PublicItem[] {
  return items.map((item) => ({
    skill: item.skill,
    title: item.title,
    story: item.story,
    prompt: item.prompt,
    evidence: item.evidence,
    choices: item.choices,
    free: item.free,
    format: item.format,
    theme: item.theme,
    kind: item.kind ?? "decide",
    long: item.long,
    // Early levels say what to change. Later levels only say how it is checked.
    gated: item.gate ? true : undefined,
    live: item.live ? true : undefined,
    // A gated CTF keeps its task hidden until the answer is right.
    checklist: item.task && !item.gate && level <= 2 ? item.task.checks.map((c) => c.label) : undefined,
    checkCount: item.gate ? undefined : item.task?.checks.length,
    setup: item.task?.setup && !item.gate ? { note: item.task.setup.note, script: item.task.setup.script } : undefined,
    job: item.job ? JOBS.find((j) => j.id === item.job)?.label : undefined,
  }));
}

export type StartedDrill = {
  token: string;
  items: PublicItem[];
  limitSeconds: number;
  source: "lab" | "standard";
  ai: boolean;
  level: number;
};

export function startDrill(params: {
  userId: string;
  mode: DrillMode;
  day: string;
  snapshot: LabSnapshot | null;
  results: Results;
  level: number;
  /** Prompts asked recently. Stock questions skip these. */
  avoid?: string[];
  /** A ready-made scenario (from the AI writer) that replaces the stock questions. */
  items?: Item[];
  /** Overrides the drill id, e.g. one CTF per week. */
  id?: string;
}): StartedDrill {
  const source = params.snapshot ? "lab" : "standard";
  const snapshot = params.snapshot ?? standardSnapshot();
  const nonce = randomBytes(6).toString("hex");
  // The daily drill is the same all day; a timed run is fresh every time.
  const seed = params.mode === "daily" ? `${params.userId}:${params.day}` : `${params.userId}:${nonce}`;
  const ai = Boolean(params.items?.length);
  const size = params.mode === "timed" ? TIMED_SIZE : 1;
  const items = params.items?.length
    ? params.items
    : pickItems(seed, snapshot, params.results, params.mode, size, new Set(params.avoid ?? []));
  const level = Math.min(4, Math.max(1, Math.round(params.level)));
  const limit = params.mode === "timed" ? TIMED_BY_LEVEL[level - 1] : 0;
  const id = params.id ?? (params.mode === "daily" ? `daily-${params.day}` : `${params.mode}-${nonce}`);
  const now = Date.now();
  const token = seal({ id, u: params.userId, mode: params.mode, day: params.day, iat: now, t0: now, limit, source, ai, level, items });
  return { token, limitSeconds: limit, source, ai, level, items: publicItems(items, level) };
}

/** Reopen a saved scenario with a fresh clock. */
export function reissueDrill(userId: string, token: string): StartedDrill | null {
  const p = unseal(token);
  if (!p || p.u !== userId || p.mode === "timed") return null;
  const fresh = seal({ ...p, iat: Date.now() });
  const level = p.level ?? 1;
  return { token: fresh, limitSeconds: p.limit, source: p.source, ai: p.ai, level, items: publicItems(p.items, level) };
}

export function drillHint(userId: string, token: string): string | null {
  const p = unseal(token);
  if (!p || p.u !== userId) return null;
  return p.items[0]?.hint ?? null;
}

const flat = (v: string) =>
  v
    .trim()
    .toLowerCase()
    .replace(/^gtf\{|\}$/g, "")
    .replace(/[\s._]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Grades a written answer against the rubric. Returns null when it could not be graded. */
export type Grader = (item: Item, text: string) => Promise<{ hits: number; total: number; feedback: string } | null>;

export async function gradeDrill(
  userId: string,
  token: string,
  answers: unknown,
  opts: { grader?: Grader; changePassed?: boolean } = {}
): Promise<{ entry: DrillEntry; review: DrillReview[]; late: boolean } | null> {
  const p = unseal(token);
  if (!p || p.u !== userId) return null;
  const given = Array.isArray(answers) ? answers : [];
  const seconds = Math.max(0, Math.round((Date.now() - p.iat) / 1000));
  const late = p.limit > 0 && seconds > p.limit + LATE_GRACE_SECONDS;
  const review: DrillReview[] = [];
  for (let i = 0; i < p.items.length; i++) {
    const item = p.items[i];
    const raw = typeof given[i] === "string" ? (given[i] as string).slice(0, item.long ? 1200 : 200) : null;
    let picked: string | null;
    let right: boolean;
    let explain = item.explain;
    let answer = item.answer;
    if (item.kind === "change") {
      right = opts.changePassed === true;
      picked = right ? "Change made and checked in your lab" : "Gave up";
      if (!right) explain = `${item.explain} Steps: ${(item.task?.guide ?? []).join(" ")}`;
    } else if (item.kind === "respond") {
      picked = raw && raw.trim() ? raw.trim() : null;
      right = false;
      if (picked && opts.grader) {
        const g = await opts.grader(item, picked);
        if (!g) throw new Error("ungraded");
        right = g.hits >= Math.ceil(g.total * 0.6);
        explain = `${g.feedback} You covered ${g.hits} of ${g.total} points a strong answer hits.`;
      } else if (!picked) {
        explain = `You did not write an answer. ${item.explain}`;
      }
      answer = item.answer;
    } else if (item.free) {
      picked = raw && raw.trim() ? raw.trim() : null;
      const said = picked !== null && [item.answer, ...(item.accept ?? [])].some((a) => flat(a) === flat(picked!));
      // A gated CTF also needs the containment change seen in the lab.
      right = item.gate ? said && opts.changePassed === true : said;
      if (item.gate && !right) explain = `${item.explain} To finish: ${(item.task?.guide ?? []).join(" ")}`;
    } else {
      picked = raw !== null && item.choices.includes(raw) ? raw : null;
      right = picked === item.answer;
    }
    review.push({ title: item.title, skill: item.skill, picked, answer, correct: !late && right, explain, runbook: item.kind === "change" || item.gate ? item.task?.runbook : undefined });
  }
  const entry: DrillEntry = {
    id: p.id,
    day: p.day,
    mode: p.mode,
    correct: review.filter((x) => x.correct).length,
    total: review.length,
    seconds,
    misses: review.filter((x) => !x.correct).map((x) => x.skill),
    at: new Date().toISOString(),
    level: p.level ?? 1,
    detail: p.items.map((item, i) => ({
      t: item.title.slice(0, 80),
      s: item.skill,
      c: review[i].correct ? 1 : 0,
      p: item.prompt.slice(0, 200),
      th: (item.theme ?? item.title).slice(0, 80),
      ...(isJob(item.job) ? { j: item.job } : {}),
      k: item.kind ?? (item.free ? "ctf" : "decide"),
      ...(review[i].correct
        ? {}
        : {
            x: (review[i].picked ?? "no answer").slice(0, 300),
            a: review[i].answer.slice(0, 200),
            e: review[i].explain.slice(0, 400),
          }),
    })),
  };
  // A contained CTF also proves the containment job.
  p.items.forEach((item, i) => {
    if (item.gate && review[i].correct) {
      entry.detail.push({ t: `Contain: ${item.title}`.slice(0, 80), s: "security", c: 1, th: "contain-account", j: "contain-account", k: "change" });
    }
  });
  return { entry, review, late };
}

/** The typed answer to a gated CTF, and, if right, the lab task it unlocks. */
export function unlockGate(
  userId: string,
  token: string,
  answers: unknown
): { ok: boolean; setup?: { note: string; script: string }; checklist?: string[]; checkCount?: number } | null {
  const p = unseal(token);
  if (!p || p.u !== userId) return null;
  const item = p.items[0];
  if (!item?.gate || !item.task) return null;
  const given = Array.isArray(answers) && typeof answers[0] === "string" ? (answers[0] as string).slice(0, 200) : "";
  const ok = Boolean(given.trim()) && [item.answer, ...(item.accept ?? [])].some((a) => flat(a) === flat(given));
  if (!ok) return { ok: false };
  const setup = item.task.setup ? { note: item.task.setup.note, script: item.task.setup.script } : undefined;
  return {
    ok: true,
    setup,
    checklist: (p.level ?? 1) <= 2 ? item.task.checks.map((c) => c.label) : undefined,
    checkCount: item.task.checks.length,
  };
}

// ---- job tasks ------------------------------------------------------------
// What a Tier 1 help desk analyst or junior sysadmin is actually asked to do.
// A job is "proven" when the student did it in their own lab and it checked
// out, or, for judgement jobs, got it right three times.

export type JobDef = { id: string; label: string; skill: Skill; lab: boolean; /** Needs the security settings the updated lab script reports. */ security?: boolean };

export const JOBS: JobDef[] = [
  { id: "enable-account", label: "Restore a blocked account", skill: "troubleshooting", lab: true },
  { id: "group-access", label: "Grant access with a group, never admin rights", skill: "accounts", lab: true },
  { id: "create-user", label: "Create an account to the naming standard", skill: "accounts", lab: true },
  { id: "fix-ou", label: "Correct a misplaced account", skill: "directory", lab: true },
  { id: "least-privilege", label: "Remove access that should not be there", skill: "security", lab: true },
  { id: "offboard", label: "Offboard without deleting", skill: "security", lab: true },
  { id: "service-account", label: "Set up a service account safely", skill: "security", lab: true },
  { id: "reset-password", label: "Reset a password the safe way", skill: "troubleshooting", lab: true },
  { id: "password-hygiene", label: "Fix a password that never expires", skill: "security", lab: true },
  { id: "group-type", label: "Fix a group that cannot grant access", skill: "accounts", lab: true },
  { id: "role-based-access", label: "Build role-based access with groups", skill: "accounts", lab: true },
  { id: "contain-account", label: "Contain a compromised account, keep the evidence", skill: "security", lab: true },
  { id: "admin-password-policy", label: "Give admins a stricter password policy", skill: "security", lab: true, security: true },
  { id: "lockout-policy", label: "Set an account lockout policy", skill: "security", lab: true, security: true },
  { id: "password-policy", label: "Set a password policy that resists guessing", skill: "security", lab: true, security: true },
  { id: "enable-auditing", label: "Turn on the auditing a SOC needs", skill: "security", lab: true, security: true },
  { id: "log-retention", label: "Keep the Security log long enough to investigate", skill: "security", lab: true, security: true },
  { id: "harden-account", label: "Fix a roastable service account", skill: "security", lab: true, security: true },
  { id: "verify-claim", label: "Check a ticket before acting on it", skill: "troubleshooting", lab: false },
  { id: "triage-alert", label: "Triage a login alert: contain, preserve, escalate", skill: "security", lab: false },
  { id: "read-logs", label: "Read Windows security events", skill: "security", lab: false },
  { id: "escalate-note", label: "Write a clear escalation", skill: "security", lab: false },
  { id: "trace-logon", label: "Trace a logon across log sources", skill: "security", lab: false },
];

const JOB_IDS = new Set(JOBS.map((j) => j.id));
export const isJob = (id: unknown): id is string => typeof id === "string" && JOB_IDS.has(id);

export type JobStatus = "new" | "practiced" | "proven";
export type JobRow = { id: string; label: string; skill: Skill; lab: boolean; security: boolean; status: JobStatus; correct: number; asked: number; last: string | null };

export function jobProgress(entries: DrillEntry[], results?: Results): JobRow[] {
  return JOBS.map((job) => {
    let asked = 0;
    let correct = 0;
    let labProven = false;
    let last: string | null = null;
    // Lesson tickets and CTF missions count too. One seen in the lab is proof.
    for (const [id, r] of Object.entries(results ?? {})) {
      if (MISSION_JOBS[id] !== job.id) continue;
      if (!r.solved) continue;
      asked += 1;
      correct += 1;
      if (r.labOk) labProven = true;
      if (r.at && (!last || r.at > last)) last = r.at;
    }
    for (const e of entries) {
      for (const d of e.detail ?? []) {
        if (d.j !== job.id) continue;
        asked += 1;
        if (!last || e.at > last) last = e.at;
        if (d.c) {
          correct += 1;
          if (d.k === "change") labProven = true;
        }
      }
    }
    const status: JobStatus = job.lab
      ? labProven ? "proven" : correct > 0 ? "practiced" : "new"
      : correct >= 3 ? "proven" : correct > 0 ? "practiced" : "new";
    return { id: job.id, label: job.label, skill: job.skill, lab: job.lab, security: Boolean(job.security), status, correct, asked, last };
  });
}

/** The job to work on next: never-tried first, then half-done, then the one not seen for longest. */
export function pickTargetJob(entries: DrillEntry[], seed: string, hasLab: boolean, hasSecurity = false, results?: Results): JobRow | null {
  const rows = jobProgress(entries, results).filter((j) => (j.lab ? hasLab : true) && (j.security ? hasSecurity : true));
  if (!rows.length) return null;
  const rank = { new: 0, practiced: 1, proven: 2 } as const;
  const best = Math.min(...rows.map((j) => rank[j.status]));
  const pool = rows.filter((j) => rank[j.status] === best).sort((a, b) => (a.last ?? "").localeCompare(b.last ?? ""));
  // Among the least recent few, vary by day so it is not always the same one.
  return pool[Math.floor(seeded(`job:${seed}`)() * Math.min(3, pool.length))];
}

/** One line for Coach: how much of the job this student has shown they can do. */
export function jobLine(entries: DrillEntry[], results?: Results): string {
  const rows = jobProgress(entries, results);
  const proven = rows.filter((r) => r.status === "proven");
  const open = rows.filter((r) => r.status !== "proven").map((r) => r.label);
  return `Job tasks proven ${proven.length} of ${rows.length}.${proven.length ? ` Proven: ${proven.map((r) => r.label).join("; ")}.` : ""}${open.length ? ` Not yet: ${open.slice(0, 5).join("; ")}.` : ""}`;
}

// ---- lab change tasks -----------------------------------------------------
// The student makes a real change in their own lab. It is checked against
// the next snapshot their domain controller sends. Some tasks start with a
// short setup script that plants a broken account, so there is something
// real to fix.

const PROTECTED = new Set([
  "alex.rivera", "jamie.torres", "riley.kwan", "jordan.ellis", "taylor.osei", "casey.reed",
  "old.intern", "svc-backup-job", "devon.brooks", "morgan.lee",
]);
const ADMIN_GROUPS = ["IT Admins", "Server Admins", "Domain Admins"];
const CONTRACTORS = [
  "Nadia Farouk", "Elliot Marsh", "Priyanka Rao", "Tomas Vidal", "Hannah Osei", "Marcus Webb",
  "Yuki Tanaka", "Camila Ortiz", "Devin Okafor", "Sasha Petrov", "Lena Fischer", "Omar Haddad",
  "Ingrid Solberg", "Rafael Duarte", "Amara Nwosu", "Felix Brandt", "Zoe Alvarez", "Kenji Mori",
  "Bianca Rossi", "Idris Kamara", "Petra Novak", "Mateo Silva", "Ruth Adeyemi", "Callum Reid",
  "Farah Nasser", "Diego Herrera", "Anika Sharma", "Jonas Lindqvist", "Selin Aydin", "Noel Baptiste",
];
const APPS = ["payroll-sync", "report-runner", "print-queue", "scan-archive", "inventory-feed", "backup-verify"];
const samOf = (full: string) => full.toLowerCase().replace(/[^a-z ]/g, "").trim().split(/\s+/).join(".");

type Dept = { ou: string; label: string; group: string; users: LabUser[] };

function departments(s: LabSnapshot): Dept[] {
  const map = new Map<string, Dept>();
  for (const u of s.users) {
    const ou = deptOf(u.container);
    const group = u.memberOf.find((m) => /users$/i.test(m));
    if (!ou || !group) continue;
    const d = map.get(ou) ?? { ou, label: human(ou), group, users: [] };
    d.users.push(u);
    map.set(ou, d);
  }
  // Compliance is left alone: a Day One mission counts its group.
  return [...map.values()].filter((d) => !/compliance/i.test(d.ou));
}

export type ChangeBrief = {
  type: "access" | "hire" | "offboard" | "enable" | "wrongou" | "excess" | "service" | "lockout" | "password" | "audit" | "logsize" | "harden" | "reset" | "hygiene" | "grouptype" | "role" | "contain" | "pso";
  job: string;
  skill: Skill;
  theme: string;
  /** Plain facts for the story writer. */
  facts: string;
  temptation?: string;
  task: Task;
  summary: string;
  /** The account the task is about, when it is a planted practice account. */
  subject?: { sam: string; name: string };
  /** Where a planted practice account goes: its department folder and groups. */
  plant?: { dept: string; groups: string[] };
};

const hasGroup = (s: LabSnapshot, name: string) => s.groups.some((g) => g.name.toLowerCase() === name.toLowerCase());
const usersOu = (ou: string) => `OU=Users,OU=${ou},OU=Departments`;
const SYNC_STEP = "Wait for the lab to report (about 15 minutes) or run Build-Environment.ps1 -SyncOnly on the domain controller, then press Check my lab.";
const ADUC = "Open Active Directory Users and Computers (Win+R, dsa.msc).";

/** PowerShell that plants one practice account for a break-and-fix ticket. */
function setupScript(lines: string[]) {
  return [
    "Import-Module ActiveDirectory",
    "$dom = Get-ADDomain",
    "$dn = $dom.DistinguishedName",
    "$pw = ConvertTo-SecureString ('Tmp-' + (Get-Random -Minimum 100000 -Maximum 999999) + '-aA!') -AsPlainText -Force",
    ...lines,
  ].join("\n");
}

const newUserLine = (name: string, sam: string, ou: string, desc: string, opts: { change?: boolean; extra?: string } = {}) =>
  `New-ADUser -Name "${name}" -SamAccountName "${sam}" -UserPrincipalName "${sam}@$($dom.DNSRoot)" -Path "${usersOu(ou)},$dn" -AccountPassword $pw -Enabled $true -ChangePasswordAtLogon ${opts.change === false ? "$false" : "$true"} -Description "${desc}"${opts.extra ?? ""}`;

export function buildChangeTask(params: { snapshot: LabSnapshot; seed: string; level: number; avoid: string[]; targetJob?: string; only?: ChangeBrief["type"] }): ChangeBrief | null {
  const s = params.snapshot;
  const r = seeded(`change:${params.seed}`);
  const level = params.level;
  const depts = departments(s);
  if (!depts.length) return null;
  const admins = ADMIN_GROUPS.filter((g) => hasGroup(s, g));
  const notAdmin = (sam: string, name: string): { c: Check; label: string }[] =>
    admins.map((g) => ({ c: { t: "member", sam, group: g, want: false }, label: `${name} is not in ${g}` }));
  const avoid = new Set(params.avoid);
  const built: ChangeBrief[] = [];
  const taken = new Set(s.users.map((u) => u.sam.toLowerCase()));
  const freshNames = shuffle(r, CONTRACTORS).filter((n) => !taken.has(samOf(n)));
  const nextName = () => freshNames.shift();

  // Give a coworker access to another department's files, and nothing more.
  const movers = depts.flatMap((d) => d.users.filter((u) => u.enabled && !PROTECTED.has(u.sam.toLowerCase())).map((u) => ({ d, u })));
  const mover = pick(r, movers);
  if (mover) {
    const target = pick(r, depts.filter((d) => d.ou !== mover.d.ou));
    if (target) {
      const name = nameOf(mover.u);
      const admin = admins[0];
      built.push({
        type: "access",
        job: "group-access",
        skill: "accounts",
        theme: `change:access:${mover.u.sam}:${target.group}`,
        facts: `${name} (${mover.u.sam}) works in ${mover.d.label} and is in ${mover.d.group}. They need to help ${target.label} for a few weeks and must reach that team's shared files, which are controlled by the group ${target.group}. The request must NOT be solved by giving admin rights.`,
        temptation: level >= 3 && admin ? `A manager says: "Just put them in ${admin} so it stops being a problem." That is the wrong fix.` : undefined,
        task: {
          checks: [
            { c: { t: "member", sam: mover.u.sam, group: target.group, want: true }, label: `${name} is a member of ${target.group}` },
            { c: { t: "member", sam: mover.u.sam, group: mover.d.group, want: true }, label: `${name} is still a member of ${mover.d.group}` },
            ...notAdmin(mover.u.sam, name),
          ],
          guide: [
            ADUC,
            `Find the group ${target.group}, open Properties, then the Members tab, and add ${name}.`,
            `Leave ${mover.d.group} as it is and do not add anyone to an admin group.`,
            SYNC_STEP,
          ],
          runbook: [
            `Add-ADGroupMember -Identity "${target.group}" -Members ${mover.u.sam}`,
            `Get-ADPrincipalGroupMembership ${mover.u.sam} | Select-Object Name`,
          ],
        },
        summary: `${name} joins ${target.group}, keeps ${mover.d.group}, and gets no admin rights.`,
      });
    }
  }

  // A new contractor: right place, right group, no more access than the job needs.
  const hireName = nextName();
  const hireDept = pick(r, depts);
  if (hireName && hireDept) {
    const sam = samOf(hireName);
    const checks: { c: Check; label: string }[] = [
      { c: { t: "exists", sam, ou: usersOu(hireDept.ou) }, label: `An account ${sam} exists in the ${hireDept.label} Users folder` },
      { c: { t: "enabled", sam, want: true }, label: `${hireName} can sign in (the account is enabled)` },
      { c: { t: "member", sam, group: hireDept.group, want: true }, label: `${hireName} is a member of ${hireDept.group}` },
      ...notAdmin(sam, hireName),
    ];
    if (level >= 3) checks.push({ c: { t: "desc", sam, text: "contractor" }, label: `The Description says this is a contractor` });
    built.push({
      type: "hire",
      job: "create-user",
      skill: "accounts",
      theme: `change:hire:${sam}`,
      facts: `${hireName} is a contractor joining ${hireDept.label} for six months. They need a normal sign-in and the same access as the team, which comes from the group ${hireDept.group}. Follow the naming pattern first.last for the sign-in name${level >= 3 ? ", and mark the account as a contractor in its Description" : ""}.`,
      task: {
        checks,
        guide: [
          ADUC,
          `Right-click the Users folder under Departments, ${hireDept.label}, then New, then User.`,
          `Use ${sam} as the sign-in name, set a temporary password, and require a change at next logon.`,
          `Open the new account, Member Of tab, add ${hireDept.group}. Do not add admin groups.`,
          SYNC_STEP,
        ],
        runbook: [
          `New-ADUser -Name "${hireName}" -SamAccountName ${sam} -Path "${usersOu(hireDept.ou)},$((Get-ADDomain).DistinguishedName)" -AccountPassword (Read-Host -AsSecureString "Temp password") -ChangePasswordAtLogon $true -Enabled $true -Description "Contractor"`,
          `Add-ADGroupMember -Identity "${hireDept.group}" -Members ${sam}`,
        ],
      },
      summary: `${sam} exists in the ${hireDept.label} Users folder, is enabled, and is in ${hireDept.group} only.`,
    });
  }

  // Offboard a contractor this student created in an earlier drill.
  const contractorSams = new Set(CONTRACTORS.map(samOf));
  const leaver = s.users.find((u) => contractorSams.has(u.sam.toLowerCase()) && u.enabled && u.memberOf.length > 0);
  if (leaver) {
    const name = nameOf(leaver);
    built.push({
      type: "offboard",
      job: "offboard",
      skill: "security",
      theme: `change:offboard:${leaver.sam}`,
      facts: `${name} (${leaver.sam}), a contractor, finished today. Their access must end now, but HR wants the account kept for the audit trail, so it must not be deleted.`,
      task: {
        checks: [
          { c: { t: "enabled", sam: leaver.sam, want: false }, label: `${name}'s account is disabled` },
          ...leaver.memberOf.map((g) => ({ c: { t: "member", sam: leaver.sam, group: g, want: false } as Check, label: `${name} is no longer in ${g}` })),
        ],
        guide: [
          `${ADUC} Find the account.`,
          "Right-click it and choose Disable Account. Do not delete it.",
          "Open the Member Of tab and remove every group.",
          SYNC_STEP,
        ],
        runbook: [
          `Disable-ADAccount -Identity ${leaver.sam}`,
          `Get-ADPrincipalGroupMembership ${leaver.sam} | Where-Object Name -ne "Domain Users" | ForEach-Object { Remove-ADGroupMember -Identity $_ -Members ${leaver.sam} -Confirm:$false }`,
        ],
      },
      summary: `${leaver.sam} is disabled, removed from every group, and still exists.`,
    });
  }

  // Break and fix: a returning employee whose account is still disabled.
  const enableName = nextName();
  const enableDept = pick(r, depts);
  if (enableName && enableDept) {
    const sam = samOf(enableName);
    built.push({
      type: "enable",
      job: "enable-account",
      skill: "troubleshooting",
      theme: `change:enable:${sam}`,
      facts: `${enableName} is back from leave today and HR confirmed the return in writing. They cannot sign in. Their account is in ${enableDept.label} and was disabled while they were away.`,
      temptation: level >= 3 ? `The caller asks you to reset the password "to be safe". A reset would not fix a disabled account.` : undefined,
      task: {
        setup: {
          sam,
          note: "Run this once on the domain controller. It creates a practice account with the problem in this ticket.",
          script: setupScript([
            newUserLine(enableName, sam, enableDept.ou, "Returning from leave"),
            `Add-ADGroupMember -Identity "${enableDept.group}" -Members ${sam}`,
            `Disable-ADAccount -Identity ${sam}`,
          ]),
        },
        checks: [
          { c: { t: "enabled", sam, want: true }, label: `${enableName}'s account is enabled` },
          { c: { t: "member", sam, group: enableDept.group, want: true }, label: `${enableName} is still in ${enableDept.group}` },
          ...notAdmin(sam, enableName),
        ],
        guide: [
          ADUC,
          "Find the account and open its Properties, Account tab. Read the state before you change anything.",
          "Right-click the account and choose Enable Account. Do not reset the password and do not add groups.",
          SYNC_STEP,
        ],
        runbook: [
          `Get-ADUser ${sam} -Properties Enabled,LockedOut | Select-Object Name,Enabled,LockedOut`,
          `Enable-ADAccount -Identity ${sam}`,
          `Unlock-ADAccount -Identity ${sam}   # only if LockedOut is True`,
        ],
      },
      summary: `${sam} is enabled and keeps its group. Nothing else was changed.`,
    });
  }

  // Break and fix: provisioned into the wrong department.
  const wrongName = nextName();
  const pair = shuffle(r, depts).slice(0, 2);
  if (wrongName && pair.length === 2) {
    const [wrong, right] = pair;
    const sam = samOf(wrongName);
    built.push({
      type: "wrongou",
      job: "fix-ou",
      skill: "directory",
      theme: `change:wrongou:${sam}`,
      facts: `${wrongName} works in ${right.label}, but the account was created in the ${wrong.label} folder and put in ${wrong.group}. They cannot open the ${right.label} shared files and the audit flagged the account as misplaced.`,
      temptation: level >= 3 ? `A coworker suggests just adding ${wrongName} to ${right.group} and leaving the rest. That leaves them with access to ${wrong.label} they should not have.` : undefined,
      task: {
        setup: {
          sam,
          note: "Run this once on the domain controller. It creates a practice account that was set up in the wrong department.",
          script: setupScript([
            newUserLine(wrongName, sam, wrong.ou, `${right.label} analyst`),
            `Add-ADGroupMember -Identity "${wrong.group}" -Members ${sam}`,
          ]),
        },
        checks: [
          { c: { t: "container", sam, ou: usersOu(right.ou) }, label: `${wrongName} is in the ${right.label} Users folder` },
          { c: { t: "member", sam, group: right.group, want: true }, label: `${wrongName} is in ${right.group}` },
          { c: { t: "member", sam, group: wrong.group, want: false }, label: `${wrongName} is no longer in ${wrong.group}` },
          { c: { t: "enabled", sam, want: true }, label: `${wrongName}'s account is still enabled` },
          ...notAdmin(sam, wrongName),
        ],
        guide: [
          ADUC,
          `Find the account, right-click it, choose Move, and pick Departments, ${right.label}, Users.`,
          `On the Member Of tab, add ${right.group} and remove ${wrong.group}.`,
          SYNC_STEP,
        ],
        runbook: [
          `Move-ADObject -Identity (Get-ADUser ${sam}).DistinguishedName -TargetPath "${usersOu(right.ou)},$((Get-ADDomain).DistinguishedName)"`,
          `Add-ADGroupMember -Identity "${right.group}" -Members ${sam}`,
          `Remove-ADGroupMember -Identity "${wrong.group}" -Members ${sam} -Confirm:$false`,
        ],
      },
      summary: `${sam} sits in the ${right.label} Users folder, is in ${right.group}, and is out of ${wrong.group}.`,
    });
  }

  // Break and fix: a contractor copied from an admin's account and left with admin rights.
  const excessName = nextName();
  const excessDept = pick(r, depts);
  const adminGroup = admins[0];
  if (excessName && excessDept && adminGroup) {
    const sam = samOf(excessName);
    built.push({
      type: "excess",
      job: "least-privilege",
      skill: "security",
      theme: `change:excess:${sam}`,
      facts: `An access review found ${excessName}, a ${excessDept.label} contractor, in ${adminGroup}. The account was made by copying an administrator's account. They need only the normal ${excessDept.group} access.`,
      temptation: level >= 3 ? `The contractor's manager says removing it "might break something" and asks you to leave it until Friday. Extra admin rights do not wait for Friday.` : undefined,
      task: {
        setup: {
          sam,
          note: "Run this once on the domain controller. It creates a practice account that was copied from an admin.",
          script: setupScript([
            newUserLine(excessName, sam, excessDept.ou, "Contractor"),
            `Add-ADGroupMember -Identity "${excessDept.group}" -Members ${sam}`,
            `Add-ADGroupMember -Identity "${adminGroup}" -Members ${sam}`,
          ]),
        },
        checks: [
          ...admins.map((g) => ({ c: { t: "member", sam, group: g, want: false } as Check, label: `${excessName} is not in ${g}` })),
          { c: { t: "member", sam, group: excessDept.group, want: true }, label: `${excessName} is still in ${excessDept.group}` },
          { c: { t: "enabled", sam, want: true }, label: `${excessName}'s account is still enabled` },
        ],
        guide: [
          ADUC,
          "Find the account and read the Member Of tab. Note every group before you change anything.",
          `Remove ${adminGroup}. Keep ${excessDept.group}, and do not disable or delete the account.`,
          SYNC_STEP,
        ],
        runbook: [
          `Get-ADPrincipalGroupMembership ${sam} | Select-Object Name`,
          `Remove-ADGroupMember -Identity "${adminGroup}" -Members ${sam} -Confirm:$false`,
        ],
      },
      summary: `${sam} is out of every admin group, still in ${excessDept.group}, and still enabled.`,
    });
  }

  // A service account done the way an audit expects. Needs the ServiceAccounts folder from the CTF build.
  const svcApp = shuffle(r, APPS).find((a) => !taken.has(`svc-${a}`));
  const owner = pick(r, s.users.filter((u) => u.enabled));
  const hasSvcOu = s.ous.some((o) => o.path.toLowerCase() === "ou=serviceaccounts");
  if (svcApp && owner && hasSvcOu) {
    const sam = `svc-${svcApp}`;
    built.push({
      type: "service",
      job: "service-account",
      skill: "security",
      theme: `change:service:${sam}`,
      facts: `The ${svcApp.replace(/-/g, " ")} job needs an account to run under. ${nameOf(owner)} (${owner.sam}) owns it. Company standard: it lives in the ServiceAccounts folder, has no groups, is not an admin, its password does not expire (it is set once and stored in the vault), and the Description names the owner so someone can be asked about it later.`,
      task: {
        checks: [
          { c: { t: "exists", sam, ou: "OU=ServiceAccounts" }, label: `${sam} exists in the ServiceAccounts folder` },
          { c: { t: "noexpire", sam, want: true }, label: `${sam} has "Password never expires" set` },
          { c: { t: "desc", sam, text: owner.sam }, label: `The Description names the owner (${owner.sam})` },
          { c: { t: "enabled", sam, want: true }, label: `${sam} is enabled` },
          ...notAdmin(sam, sam),
        ],
        guide: [
          ADUC,
          `Right-click the ServiceAccounts folder, New, User. Use ${sam} as the sign-in name.`,
          "On the password page choose Password never expires. Clear the change-at-next-logon box.",
          `Open the account and put "Owner: ${owner.sam}" in the Description. Do not add any groups.`,
          SYNC_STEP,
        ],
        runbook: [
          `New-ADUser -Name ${sam} -SamAccountName ${sam} -Path "OU=ServiceAccounts,$((Get-ADDomain).DistinguishedName)" -AccountPassword (Read-Host -AsSecureString "Vault password") -PasswordNeverExpires $true -Enabled $true -Description "Owner: ${owner.sam}. ${svcApp}"`,
        ],
      },
      summary: `${sam} is in ServiceAccounts, has a non-expiring password, names ${owner.sam} as owner, and has no admin rights.`,
    });
  }

  // Passwords and access: reset one safely, fix one that never expires.
  const resetName = nextName();
  const resetDept = pick(r, depts);
  if (resetName && resetDept) {
    const sam = samOf(resetName);
    built.push({
      type: "reset",
      job: "reset-password",
      skill: "troubleshooting",
      theme: `change:reset:${sam}`,
      subject: { sam, name: resetName },
      facts: `${resetName} (${resetDept.label}) forgot their password and is on the phone. You already verified who they are with the questions on the verification card. Get them back in without you ever knowing their password.`,
      temptation: level >= 3 ? `They ask you to set it to something easy to remember, like Welcome1. A password you chose and said out loud is one you also know.` : undefined,
      task: {
        setup: {
          sam,
          note: "Run this once on the domain controller. It creates a practice account for this call.",
          script: setupScript([
            newUserLine(resetName, sam, resetDept.ou, "Forgot password", { change: false }),
            `Add-ADGroupMember -Identity "${resetDept.group}" -Members ${sam}`,
          ]),
        },
        checks: [
          { c: { t: "flag", sam, flag: "passwordExpired", want: true }, label: `${resetName} must change their password at next sign-in` },
          { c: { t: "enabled", sam, want: true }, label: `${resetName}'s account is enabled` },
          { c: { t: "flag", sam, flag: "lockedOut", want: false }, label: `${resetName}'s account is not locked` },
          { c: { t: "member", sam, group: resetDept.group, want: true }, label: `${resetName} is still in ${resetDept.group}` },
          ...notAdmin(sam, resetName),
        ],
        guide: [
          ADUC,
          "Find the account, right-click it, and choose Reset Password.",
          "Type a temporary password and tick User must change password at next logon. Tick Unlock the account if it is shown.",
          SYNC_STEP,
        ],
        runbook: [
          `Set-ADAccountPassword -Identity ${sam} -Reset -NewPassword (Read-Host -AsSecureString "Temporary password")`,
          `Set-ADUser -Identity ${sam} -ChangePasswordAtLogon $true`,
          `Unlock-ADAccount -Identity ${sam}   # only if the account is locked`,
        ],
      },
      summary: `${sam} has a temporary password and must change it at next sign-in. Nothing else changed.`,
    });
  }

  const hygName = nextName();
  const hygDept = pick(r, depts);
  if (hygName && hygDept) {
    const sam = samOf(hygName);
    built.push({
      type: "hygiene",
      job: "password-hygiene",
      skill: "security",
      theme: `change:hygiene:${sam}`,
      subject: { sam, name: hygName },
      facts: `A password audit found that ${hygName}, a ${hygDept.label} employee, has "Password never expires" set. Only service accounts may have that. A person's password that never expires stays valid forever if it leaks. The account itself is fine and must keep working.`,
      temptation: level >= 3 ? `${hygName} says they hate changing passwords and asks you to leave it. Preference is not a reason to skip the standard.` : undefined,
      task: {
        setup: {
          sam,
          note: "Run this once on the domain controller. It creates a practice account with the problem the audit found.",
          script: setupScript([
            newUserLine(hygName, sam, hygDept.ou, `${hygDept.label} analyst`, { change: false, extra: " -PasswordNeverExpires $true" }),
            `Add-ADGroupMember -Identity "${hygDept.group}" -Members ${sam}`,
          ]),
        },
        checks: [
          { c: { t: "noexpire", sam, want: false }, label: `${hygName}'s password can expire like everyone else's` },
          { c: { t: "enabled", sam, want: true }, label: `${hygName}'s account is still enabled` },
          { c: { t: "member", sam, group: hygDept.group, want: true }, label: `${hygName} is still in ${hygDept.group}` },
          ...notAdmin(sam, hygName),
        ],
        guide: [
          ADUC,
          "Find the account, open Properties, and go to the Account tab.",
          "Under Account options, clear Password never expires. Leave everything else alone.",
          SYNC_STEP,
        ],
        runbook: [
          `Get-ADUser ${sam} -Properties PasswordNeverExpires | Select-Object Name,PasswordNeverExpires`,
          `Set-ADUser -Identity ${sam} -PasswordNeverExpires $false`,
        ],
      },
      summary: `${sam}'s password can expire normally and the account is unchanged otherwise.`,
    });
  }

  // Access control done with groups. Needs the AccessLevels folder.
  const hasAccessOu = s.ous.some((o) => o.path.toLowerCase() === "ou=accesslevels");
  const people = shuffle(r, movers.map((m) => m.u)).slice(0, 2);
  const grpName = shuffle(r, ["Payments-Approvers", "Vendor-Onboarding", "Wire-Reviewers", "Client-Records-RO", "Audit-Readers", "Treasury-Ops"]).find((g) => !hasGroup(s, g));
  if (hasAccessOu && grpName && people.length === 2) {
    const [a, b] = people;
    built.push({
      type: "grouptype",
      job: "group-type",
      skill: "accounts",
      theme: `change:grouptype:${grpName}`,
      facts: `The group ${grpName} was created to give ${nameOf(a)} and ${nameOf(b)} access to a shared folder, but the folder permission does nothing. It was created as a Distribution group, which is for email and cannot be used to grant access. The members are right and must stay.`,
      task: {
        setup: {
          sam: grpName,
          note: "Run this once on the domain controller. It creates the group as it was first set up.",
          script: setupScript([
            `New-ADGroup -Name "${grpName}" -SamAccountName "${grpName}" -GroupScope Global -GroupCategory Distribution -Path "OU=AccessLevels,$dn" -Description "Folder access"`,
            `Add-ADGroupMember -Identity "${grpName}" -Members ${a.sam},${b.sam}`,
          ]),
        },
        checks: [
          { c: { t: "group", name: grpName, category: "Security", container: "OU=AccessLevels" }, label: `${grpName} is a Security group` },
          { c: { t: "group", name: grpName, member: nameOf(a) }, label: `${nameOf(a)} is still a member` },
          { c: { t: "group", name: grpName, member: nameOf(b) }, label: `${nameOf(b)} is still a member` },
        ],
        guide: [
          ADUC,
          `Open the AccessLevels folder, right-click ${grpName}, and choose Properties.`,
          "On the General tab, under Group type, choose Security. Leave the scope and the members alone.",
          SYNC_STEP,
        ],
        runbook: [
          `Get-ADGroup ${grpName} | Select-Object Name,GroupCategory,GroupScope`,
          `Set-ADGroup -Identity ${grpName} -GroupCategory Security`,
        ],
      },
      summary: `${grpName} is a Security group with the same two members.`,
    });
  }

  // Role-based access the way administrators build it: people, then a role group, then a resource group.
  const roleName = shuffle(r, ["Role-Finance-Reviewers", "Role-Wire-Approvers", "Role-Records-Clerks", "Role-Audit-Support"]).find((g) => !hasGroup(s, g));
  const resName = shuffle(r, ["ACL-FinanceShare-Read", "ACL-Payments-Modify", "ACL-Records-Read", "ACL-AuditLogs-Read"]).find((g) => !hasGroup(s, g));
  if (hasAccessOu && roleName && resName && people.length === 2) {
    const [a, b] = people;
    built.push({
      type: "role",
      job: "role-based-access",
      skill: "accounts",
      theme: `change:role:${roleName}`,
      facts: `A new team needs read access to a shared folder, and ${nameOf(a)} and ${nameOf(b)} are the first two members. Do not put people straight on the folder. Company standard for access: people go in a Global security group for the role, that role group goes in a Domain Local security group for the resource, and only the resource group is given the folder permission later. Both groups live in the AccessLevels folder.`,
      temptation: level >= 3 ? `Someone suggests skipping the second group "to save time". Then every future change means editing folder permissions by hand.` : undefined,
      task: {
        checks: [
          { c: { t: "group", name: roleName, category: "Security", scope: "Global", container: "OU=AccessLevels", member: nameOf(a) }, label: `${roleName} is a Global security group in AccessLevels with ${nameOf(a)}` },
          { c: { t: "group", name: roleName, member: nameOf(b) }, label: `${roleName} also contains ${nameOf(b)}` },
          { c: { t: "group", name: resName, category: "Security", scope: "DomainLocal", container: "OU=AccessLevels", member: roleName }, label: `${resName} is a Domain Local security group in AccessLevels that contains ${roleName}` },
        ],
        guide: [
          ADUC,
          `Right-click AccessLevels, New, Group. Name it ${roleName}, scope Global, type Security. Add ${nameOf(a)} and ${nameOf(b)}.`,
          `Make a second group named ${resName}, scope Domain local, type Security. Add ${roleName} as its only member.`,
          SYNC_STEP,
        ],
        runbook: [
          `New-ADGroup -Name "${roleName}" -GroupScope Global -GroupCategory Security -Path "OU=AccessLevels,$((Get-ADDomain).DistinguishedName)"`,
          `Add-ADGroupMember -Identity "${roleName}" -Members ${a.sam},${b.sam}`,
          `New-ADGroup -Name "${resName}" -GroupScope DomainLocal -GroupCategory Security -Path "OU=AccessLevels,$((Get-ADDomain).DistinguishedName)"`,
          `Add-ADGroupMember -Identity "${resName}" -Members "${roleName}"`,
        ],
      },
      summary: `${roleName} (Global) holds the two people and sits inside ${resName} (Domain Local).`,
    });
  }

  // Contain a compromised account without destroying the evidence.
  const conName = nextName();
  const conDept = pick(r, depts);
  const conAdmin = admins[0];
  if (conName && conDept && conAdmin) {
    const sam = samOf(conName);
    built.push({
      type: "contain",
      job: "contain-account",
      skill: "security",
      theme: `change:contain:${sam}`,
      subject: { sam, name: conName },
      plant: { dept: conDept.ou, groups: [conDept.group, conAdmin] },
      facts: `The SOC confirmed that ${conName}'s account signed in from an unknown host at 2 AM and was used to add someone to ${conAdmin}. The account is compromised. Stop the attacker now, but keep the account in the directory so investigators can read its history.`,
      temptation: level >= 3 ? `A manager says to just delete the account so it is gone. Deleting it destroys the evidence and cannot be undone.` : undefined,
      task: {
        setup: {
          sam,
          note: "Run this once on the domain controller. It creates the compromised account as the SOC found it.",
          script: setupScript([
            newUserLine(conName, sam, conDept.ou, "Contractor"),
            `Add-ADGroupMember -Identity "${conDept.group}" -Members ${sam}`,
            `Add-ADGroupMember -Identity "${conAdmin}" -Members ${sam}`,
          ]),
        },
        checks: [
          { c: { t: "enabled", sam, want: false }, label: `${conName}'s account is disabled` },
          ...admins.map((g) => ({ c: { t: "member", sam, group: g, want: false } as Check, label: `${conName} is not in ${g}` })),
          { c: { t: "container", sam, ou: usersOu(conDept.ou) }, label: `The account still exists in the ${conDept.label} Users folder` },
          ...(level >= 3 ? [{ c: { t: "desc", sam, text: "incident" } as Check, label: 'The Description records why (it mentions "incident")' }] : []),
        ],
        guide: [
          ADUC,
          "Find the account. Right-click it and choose Disable Account. Do not delete it and do not move it.",
          `On the Member Of tab, remove ${conAdmin}. Note every group first so the investigators know what it had.`,
          ...(level >= 3 ? ['Put "Incident" and the ticket number in the Description so the next person knows why it is disabled.'] : []),
          SYNC_STEP,
        ],
        runbook: [
          `Get-ADPrincipalGroupMembership ${sam} | Select-Object Name   # record this first`,
          `Disable-ADAccount -Identity ${sam}`,
          `Remove-ADGroupMember -Identity "${conAdmin}" -Members ${sam} -Confirm:$false`,
          `Set-ADUser -Identity ${sam} -Description "Incident: compromised, contained"`,
        ],
      },
      summary: `${sam} is disabled and out of every admin group, and still exists for the investigators.`,
    });
  }

  // Admins get a stricter password policy than everyone else.
  const psoTarget = admins.includes("IT Admins") ? "IT Admins" : admins[0];
  const psos = s.security?.psos;
  if (psos !== undefined && psoTarget && !psos.some((x) => x.minLength >= 16 && x.appliesTo.some((a) => a.toLowerCase() === psoTarget.toLowerCase()))) {
    built.push({
      type: "pso",
      job: "admin-password-policy",
      skill: "security",
      theme: "change:admin-password-policy",
      facts: `The domain password policy is fine for staff, but ${psoTarget} can change almost anything, so their accounts are the ones attackers want. Company standard: a separate, stricter password policy just for ${psoTarget}, with at least 16 characters and a lockout after at most 5 failed attempts. It must not change the rules for everyone else.`,
      temptation: level >= 3 ? `Someone suggests raising the length for the whole domain instead. That breaks account creation for staff and is not what was asked.` : undefined,
      task: {
        checks: [{ c: { t: "pso", minLength: 16, appliesTo: psoTarget, maxLockout: 5 }, label: `A password policy applies to ${psoTarget} with at least 16 characters and a lockout of 5 or fewer` }],
        guide: [
          "Open Active Directory Administrative Center (Win+R, dsac.exe).",
          "Go to your domain, System, Password Settings Container, then New, Password Settings.",
          `Give it a name and a precedence such as 10. Set Minimum password length to 16, enable the lockout with 5 failed attempts, and under Directly Applies To add ${psoTarget}.`,
          SYNC_STEP,
        ],
        runbook: [
          `New-ADFineGrainedPasswordPolicy -Name "PSO-${psoTarget.replace(/\s+/g, "-")}" -Precedence 10 -MinPasswordLength 16 -ComplexityEnabled $true -PasswordHistoryCount 24 -LockoutThreshold 5 -LockoutDuration 00:30:00 -LockoutObservationWindow 00:30:00`,
          `Add-ADFineGrainedPasswordPolicySubject -Identity "PSO-${psoTarget.replace(/\s+/g, "-")}" -Subjects "${psoTarget}"`,
        ],
      },
      summary: `A password policy applies to ${psoTarget} with 16 or more characters and a lockout of 5 or fewer.`,
    });
  }

  // Security configuration. These read the settings the updated lab script reports.
  const sec = s.security;
  const pp = sec?.passwordPolicy;
  const secStep = (where: string) => `${where} Then run gpupdate /force on the domain controller.`;
  const GPMC = "Open Group Policy Management (Win+R, gpmc.msc)";
  if (pp && (pp.lockoutThreshold === 0 || pp.lockoutThreshold > 10 || pp.lockoutDurationMin < 15)) {
    const max = level >= 3 ? 5 : 10;
    built.push({
      type: "lockout",
      job: "lockout-policy",
      skill: "security",
      theme: "change:lockout-policy",
      facts: `An audit found that GovTech Financial's domain never locks an account after failed sign-ins (the threshold is ${pp.lockoutThreshold === 0 ? "0, meaning never" : pp.lockoutThreshold}). An attacker can guess passwords forever, which is exactly how password spraying works. The company standard is to lock an account for at least 15 minutes after ${max} or fewer failed attempts.`,
      temptation: level >= 3 ? `The help desk lead asks for a threshold of 50 "so nobody calls us". That is too loose to stop guessing.` : undefined,
      task: {
        checks: [
          { c: { t: "policy", key: "lockoutThreshold", min: 1, max }, label: `Accounts lock after between 1 and ${max} failed attempts` },
          { c: { t: "policy", key: "lockoutDurationMin", min: 15 }, label: "A locked account stays locked for at least 15 minutes" },
          { c: { t: "policy", key: "lockoutWindowMin", min: 15 }, label: "The failed-attempt counter resets after at least 15 minutes" },
        ],
        guide: [
          `${GPMC}, then edit the Default Domain Policy.`,
          "Go to Computer Configuration, Policies, Windows Settings, Security Settings, Account Policies, Account Lockout Policy.",
          `Set Account lockout threshold to ${Math.min(max, 5)}, Account lockout duration to 15 minutes, and Reset account lockout counter after to 15 minutes.`,
          secStep("Save the policy."),
          SYNC_STEP,
        ],
        runbook: [
          `Get-ADDefaultDomainPasswordPolicy | Select-Object LockoutThreshold,LockoutDuration,LockoutObservationWindow`,
          `Set-ADDefaultDomainPasswordPolicy -Identity (Get-ADDomain).DNSRoot -LockoutThreshold ${Math.min(max, 5)} -LockoutDuration 00:15:00 -LockoutObservationWindow 00:15:00`,
        ],
      },
      summary: `The domain locks accounts after ${Math.min(max, 5)} failed attempts for 15 minutes.`,
    });
  }
  if (pp && (pp.minLength < 12 || !pp.complexity)) {
    built.push({
      type: "password",
      job: "password-policy",
      skill: "security",
      theme: "change:password-policy",
      facts: `The domain password policy requires only ${pp.minLength} characters${pp.complexity ? "" : " and does not require complexity"}. Short passwords fall quickly to guessing tools. The company standard is at least 12 characters with complexity on. Keep in mind that the temporary passwords used when creating accounts must be at least that long.`,
      temptation: level >= 3 ? `A manager objects that long passwords "cause tickets". You still have to set the standard, and tell the desk to expect the extra resets.` : undefined,
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
          `Get-ADDefaultDomainPasswordPolicy | Select-Object MinPasswordLength,ComplexityEnabled,PasswordHistoryCount`,
          `Set-ADDefaultDomainPasswordPolicy -Identity (Get-ADDomain).DNSRoot -MinPasswordLength 12 -ComplexityEnabled $true`,
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
  const audit = sec?.audit;
  const audMissing = audit
    ? AUDIT_GOALS.filter((g) => {
        const v = (audit[g.sub] ?? "").toLowerCase();
        if (!v) return false;
        const hasS = v.includes("success");
        const hasF = v.includes("failure");
        return g.need === "Both" ? !(hasS && hasF) : g.need === "Success" ? !hasS : !hasF;
      })
    : [];
  const goal = audMissing.length ? pick(r, audMissing) : null;
  if (goal) {
    const flags = goal.need === "Both" ? "/success:enable /failure:enable" : goal.need === "Success" ? "/success:enable" : "/failure:enable";
    built.push({
      type: "audit",
      job: "enable-auditing",
      skill: "security",
      theme: `change:audit:${goal.sub}`,
      facts: `The SOC asked why it cannot investigate an incident. On the domain controller, ${goal.why}. The events it needs are ${goal.event}. Turn on ${goal.need === "Both" ? "success and failure" : goal.need.toLowerCase()} auditing for the "${goal.sub}" setting.`,
      task: {
        checks: [{ c: { t: "audit", sub: goal.sub, need: goal.need }, label: `Auditing for "${goal.sub}" includes ${goal.need === "Both" ? "success and failure" : goal.need.toLowerCase()}` }],
        guide: [
          `${GPMC}, then edit the Default Domain Controllers Policy.`,
          `Go to Computer Configuration, Policies, Windows Settings, Security Settings, Advanced Audit Policy Configuration, Audit Policies, ${goal.category}, ${goal.sub}.`,
          `Tick Configure the following audit events and choose ${goal.need === "Both" ? "Success and Failure" : goal.need}.`,
          secStep("Save the policy."),
          SYNC_STEP,
        ],
        runbook: [
          `auditpol /get /subcategory:"${goal.sub}"`,
          `auditpol /set /subcategory:"${goal.sub}" ${flags}`,
        ],
      },
      summary: `"${goal.sub}" is audited for ${goal.need === "Both" ? "success and failure" : goal.need.toLowerCase()}.`,
    });
  }
  if (sec?.securityLogMaxMB !== undefined && sec.securityLogMaxMB < 512) {
    built.push({
      type: "logsize",
      job: "log-retention",
      skill: "security",
      theme: "change:log-retention",
      facts: `The Security event log on the domain controller is capped at ${sec.securityLogMaxMB} MB. On a busy domain that fills in hours and old events are overwritten, so by the time an incident is noticed the evidence is gone. The standard is at least 512 MB.`,
      task: {
        checks: [{ c: { t: "logsize", minMB: 512 }, label: "The Security log can grow to at least 512 MB" }],
        guide: [
          "Open Event Viewer (Win+R, eventvwr.msc) on the domain controller.",
          "Expand Windows Logs, right-click Security, and choose Properties.",
          "Set Maximum log size to 524288 KB or more and leave Overwrite events as needed. Do not clear the log.",
          SYNC_STEP,
        ],
        runbook: [
          `Get-WinEvent -ListLog Security | Select-Object LogName,MaximumSizeInBytes,RecordCount`,
          `wevtutil sl Security /ms:536870912`,
        ],
      },
      summary: "The Security log can grow to 512 MB or more.",
    });
  }
  // Break and fix: a service account an attacker could crack offline or log in to without a password.
  const hardenApp = shuffle(r, APPS).find((a) => !taken.has(`svc-${a}`));
  const hasSvcFolder = s.ous.some((o) => o.path.toLowerCase() === "ou=serviceaccounts");
  if (sec && hardenApp && hasSvcFolder) {
    const sam = `svc-${hardenApp}`;
    built.push({
      type: "harden",
      job: "harden-account",
      skill: "security",
      theme: `change:harden:${sam}`,
      facts: `A security scan flagged ${sam}, the account the ${hardenApp.replace(/-/g, " ")} job runs under. It does not require a password and does not require Kerberos pre-authentication, and it has a service principal name. Anyone on the network can request its password hash and crack it offline, or even use it with no password at all. The job still has to run, so the account must stay enabled.`,
      temptation: level >= 3 ? `The job owner says "just leave it, it has worked for years". A working weak account is still a finding.` : undefined,
      task: {
        setup: {
          sam,
          note: "Run this once on the domain controller. It creates a practice service account with the problems the scan found.",
          script: setupScript([
            `New-ADUser -Name "${sam}" -SamAccountName "${sam}" -Path "OU=ServiceAccounts,$dn" -AccountPassword $pw -Enabled $true -PasswordNotRequired $true -Description "Owner: ${nameOf(pick(r, s.users) ?? s.users[0])}. ${hardenApp}"`,
            `Set-ADAccountControl -Identity ${sam} -DoesNotRequirePreAuth $true`,
            `Set-ADUser -Identity ${sam} -ServicePrincipalNames @{Add="MSSQLSvc/sql01.$($dom.DNSRoot):1433"}`,
          ]),
        },
        checks: [
          { c: { t: "flag", sam, flag: "pwdNotRequired", want: false }, label: `${sam} requires a password` },
          { c: { t: "flag", sam, flag: "noPreAuth", want: false }, label: `${sam} requires Kerberos pre-authentication` },
          { c: { t: "enabled", sam, want: true }, label: `${sam} is still enabled so the job keeps running` },
          ...notAdmin(sam, sam),
        ],
        guide: [
          `${ADUC} Find the account in the ServiceAccounts folder and open its Properties.`,
          'On the Account tab, under Account options, clear "Do not require Kerberos preauthentication". Leave the account enabled.',
          `Turn off the no-password flag in PowerShell, because the console does not show it: Set-ADUser ${sam} -PasswordNotRequired $false, then set a real password with Set-ADAccountPassword.`,
          SYNC_STEP,
        ],
        runbook: [
          `Get-ADUser ${sam} -Properties PasswordNotRequired,DoesNotRequirePreAuth,ServicePrincipalNames | Select-Object Name,PasswordNotRequired,DoesNotRequirePreAuth,ServicePrincipalNames`,
          `Set-ADAccountControl -Identity ${sam} -DoesNotRequirePreAuth $false -PasswordNotRequired $false`,
          `Set-ADAccountPassword -Identity ${sam} -Reset -NewPassword (Read-Host -AsSecureString "New long random password")`,
        ],
      },
      summary: `${sam} requires a password and Kerberos pre-authentication, and is still enabled.`,
    });
  }

  const pool = params.only ? built.filter((b) => b.type === params.only) : built;
  if (!pool.length) return null;
  const order = shuffle(r, pool);
  // Closing access is the most time-sensitive change, then whatever job they have not shown yet.
  order.sort((a, b) => Number(b.type === "offboard") - Number(a.type === "offboard"));
  const wanted = params.targetJob ? order.find((b) => b.job === params.targetJob && !avoid.has(b.theme)) : undefined;
  return wanted ?? order.find((b) => !avoid.has(b.theme)) ?? order[0];
}

export function evalCheck(s: LabSnapshot, c: Check): boolean {
  if (c.t === "group") {
    const g = s.groups.find((x) => x.name.toLowerCase() === c.name.toLowerCase());
    if (!g) return false;
    if (c.category && g.category.toLowerCase() !== c.category.toLowerCase()) return false;
    if (c.scope && g.scope.toLowerCase() !== c.scope.toLowerCase()) return false;
    if (c.container && g.container.toLowerCase() !== c.container.toLowerCase()) return false;
    if (c.member && !g.members.some((m) => m.toLowerCase() === c.member!.toLowerCase())) return false;
    return true;
  }
  if (c.t === "pso") {
    return (s.security?.psos ?? []).some(
      (x) =>
        x.minLength >= c.minLength &&
        x.appliesTo.some((a) => a.toLowerCase() === c.appliesTo.toLowerCase()) &&
        (c.maxLockout === undefined || (x.lockoutThreshold >= 1 && x.lockoutThreshold <= c.maxLockout))
    );
  }
  if (c.t === "policy") {
    const v = s.security?.passwordPolicy?.[c.key];
    if (v === undefined) return false;
    if (typeof v === "boolean") return c.bool === undefined ? true : v === c.bool;
    return (c.min === undefined || v >= c.min) && (c.max === undefined || v <= c.max);
  }
  if (c.t === "audit") {
    const v = (s.security?.audit?.[c.sub] ?? "").toLowerCase();
    const hasS = v.includes("success");
    const hasF = v.includes("failure");
    return c.need === "Both" ? hasS && hasF : c.need === "Success" ? hasS : hasF;
  }
  if (c.t === "logsize") return (s.security?.securityLogMaxMB ?? 0) >= c.minMB;
  const user = s.users.find((u) => u.sam.toLowerCase() === c.sam.toLowerCase());
  if (c.t === "exists") return Boolean(user) && user!.container.toLowerCase() === c.ou.toLowerCase();
  if (!user) return c.t === "member" ? !c.want : false;
  if (c.t === "container") return user.container.toLowerCase() === c.ou.toLowerCase();
  if (c.t === "enabled") return user.enabled === c.want;
  if (c.t === "noexpire") return user.passwordNeverExpires === c.want;
  if (c.t === "flag") return (user[c.flag] ?? false) === c.want;
  if (c.t === "desc") return `${user.description} ${user.title}`.toLowerCase().includes(c.text.toLowerCase());
  const g = c.group.toLowerCase();
  const inGroup = user.memberOf.some((m) => m.toLowerCase() === g) || s.groups.some((x) => x.name.toLowerCase() === g && x.members.includes(user.name));
  return inGroup === c.want;
}

/** Checks a change task against the newest snapshot. It must have arrived after the drill started. */
export function checkChange(
  userId: string,
  token: string,
  lab: { snapshot: LabSnapshot; uploadedAt: string } | null,
  answers?: unknown
): { fresh: boolean; results: { label: string; ok: boolean }[]; passed: boolean; needsSetup: boolean; answerOk: boolean } | null {
  const p = unseal(token);
  if (!p || p.u !== userId) return null;
  const item = p.items[0];
  const task = item?.task;
  if (!task) return null;
  // A gated CTF also needs its typed answer to be right.
  const given = Array.isArray(answers) && typeof answers[0] === "string" ? (answers[0] as string).slice(0, 200) : "";
  const answerOk = item.gate ? Boolean(given.trim()) && [item.answer, ...(item.accept ?? [])].some((a) => flat(a) === flat(given)) : true;
  if (!lab) return { fresh: false, results: [], passed: false, needsSetup: false, answerOk };
  const fresh = new Date(lab.uploadedAt).getTime() >= (p.t0 ?? p.iat);
  // A break-and-fix ticket needs its practice account planted first.
  const needsSetup =
    fresh &&
    Boolean(task.setup) &&
    !lab.snapshot.users.some((u) => u.sam.toLowerCase() === task.setup!.sam.toLowerCase()) &&
    !lab.snapshot.groups.some((g) => g.name.toLowerCase() === task.setup!.sam.toLowerCase());
  const results = task.checks.map(({ c, label }) => ({ label, ok: evalCheck(lab.snapshot, c) }));
  return { fresh, results, passed: fresh && !needsSetup && answerOk && results.every((x) => x.ok), needsSetup, answerOk };
}

/** How the day's scenario is asked. Lab changes need a lab to check. */
export function pickFormat(seed: string, level: number, hasLab: boolean, targetsLab = false): "decide" | "respond" | "change" {
  const r = seeded(`format:${seed}`)();
  const lv = Math.min(4, Math.max(1, level));
  // When the job to practice can be done in the lab, usually make them do it there.
  const change = hasLab ? (targetsLab ? 0.8 : [0.4, 0.35, 0.35, 0.4][lv - 1]) : 0;
  const respond = [0.15, 0.3, 0.4, 0.45][lv - 1];
  if (r < change) return "change";
  if (r < change + respond) return "respond";
  return "decide";
}


// ---- live investigation ---------------------------------------------------
// The weekly CTF, built from the student's own Security log. A queued job
// makes their domain controller plant three practice accounts and produce
// real failed and successful sign-ins. The evidence is what they find in
// Event Viewer, not text on this page.

export type InvestigationAccount = { sam: string; name: string; dept: string; groups: string[]; failures: number; success: boolean };

/** Whether the student's lab can host a live investigation. */
export function liveReady(snapshot: LabSnapshot | null): { agent: boolean; audit: boolean } {
  const agent = Boolean(snapshot?.agent?.scenarios);
  const v = (snapshot?.security?.audit?.Logon ?? "").toLowerCase();
  return { agent, audit: v.includes("success") && v.includes("failure") };
}

export function buildInvestigation(params: { snapshot: LabSnapshot; seed: string; level: number }): { item: Item; accounts: InvestigationAccount[] } | null {
  const s = params.snapshot;
  const level = Math.min(4, Math.max(1, params.level));
  const brief = buildChangeTask({ snapshot: s, seed: `live:${params.seed}`, level, avoid: [], targetJob: "contain-account", only: "contain" });
  if (!brief?.subject || !brief.plant) return null;
  const r = seeded(`investigation:${params.seed}`);

  // A lockout policy would lock the accounts before the successes, so stay under it.
  const threshold = s.security?.passwordPolicy?.lockoutThreshold ?? 0;
  const cap = threshold > 0 ? threshold - 1 : 12;
  const target = Math.min([8, 7, 6, 6][level - 1], cap);
  if (target < 4) return null;
  const typo = Math.max(1, Math.min(target - 2, [1, 2, 3, 4][level - 1]));
  const never = Math.max(1, Math.min(target - 1, [2, 3, 4, 5][level - 1]));

  const depts = departments(s);
  const taken = new Set(s.users.map((u) => u.sam.toLowerCase()));
  taken.add(brief.subject.sam);
  const names = shuffle(r, CONTRACTORS).filter((n) => !taken.has(samOf(n)));
  const decoyDepts = shuffle(r, depts);
  if (names.length < 2 || !decoyDepts.length) return null;
  const decoy = (name: string, i: number, failures: number, success: boolean): InvestigationAccount => {
    const d = decoyDepts[i % decoyDepts.length];
    return { sam: samOf(name), name, dept: d.ou, groups: [d.group], failures, success };
  };
  const accounts: InvestigationAccount[] = [
    { sam: brief.subject.sam, name: brief.subject.name, dept: brief.plant.dept, groups: brief.plant.groups, failures: target, success: true },
    decoy(names[0], 0, never, false),
    decoy(names[1], 1, typo, true),
  ];
  const [a, b] = [accounts[1], accounts[2]];

  const titles = ["Guessed their way in", "One account, many failures", "The pattern in the log"];
  const item: Item = {
    skill: "security",
    title: titles[Math.floor(r() * titles.length)],
    story:
      "The domain controller's Security log shows a burst of failed sign-ins on a few contractor accounts, and some of them then got in. Most are people mistyping a password. One is someone guessing. The evidence is the real log on your own domain controller, from the last hour or so.",
    prompt: "Which account had the most failed sign-ins before a successful one?",
    evidence: [
      "Your evidence is the live Security log on your domain controller.",
      "Event Viewer, Windows Logs, Security, then Filter Current Log.",
      "Failures: event 4771 (Kerberos) or 4625 (NTLM). Successes: 4768 or 4624.",
      "PowerShell: Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4771,4625,4768,4624} -MaxEvents 200",
    ],
    choices: [],
    answer: brief.subject.sam,
    accept: [brief.subject.name],
    explain: `${brief.subject.sam} failed ${target} times and then signed in, which is what a password being guessed looks like. ${b.sam} failed ${b.failures} time${b.failures === 1 ? "" : "s"} and then signed in, an ordinary typing streak. ${a.sam} failed ${a.failures} times and never got in.`,
    hint: "Filter the Security log for failures and successes, then count the failures per account before that account's first success.",
    format: "Sign-in name, like first.last",
    free: true,
    gate: true,
    task: { ...brief.task, setup: undefined },
    job: "trace-logon",
    live: { jobId: "" },
    theme: "CTF: live sign-in investigation",
  };
  return { item, accounts };
}

export function liveJobId(userId: string, token: string): string | null {
  const p = unseal(token);
  if (!p || p.u !== userId) return null;
  return p.items[0]?.live?.jobId || null;
}

// ---- coach chats earned by drills -----------------------------------------

/** Extra Coach chats for today. Harder, longer work earns more. */
export function coachBonus(entries: DrillEntry[], utcDay: string): { bonus: number; parts: { label: string; n: number }[] } {
  const today = entries.filter((e) => e.at.startsWith(utcDay));
  const parts: { label: string; n: number }[] = [];
  const daily = today.find((e) => e.mode === "daily");
  if (daily) parts.push({ label: daily.correct ? "Daily scenario, solved" : "Daily scenario", n: 4 + daily.level + (daily.correct ? 3 : 0) });
  for (const t of today.filter((e) => e.mode === "timed").slice(0, 2)) {
    parts.push({ label: "Incident drill", n: 2 + (t.correct >= 4 ? 1 : 0) });
  }
  const ctf = today.find((e) => e.mode === "ctf");
  if (ctf) parts.push({ label: ctf.correct ? "Weekly CTF, flag captured" : "Weekly CTF", n: 8 + (ctf.correct ? 8 : 0) });
  return { bonus: parts.reduce((a, p) => a + p.n, 0), parts };
}

// ---- difficulty, streaks, and reports -------------------------------------

/** Newest first, every recorded question, up to `limit`. */
function recentQuestions(entries: DrillEntry[], limit: number): DrillDetail[] {
  const out: DrillDetail[] = [];
  for (const e of [...entries].sort((a, b) => b.at.localeCompare(a.at))) {
    for (const d of e.detail ?? []) {
      out.push(d);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

/** 1 to 4. Rises with recent accuracy and never on a handful of lucky answers. */
export function levelFor(entries: DrillEntry[]): number {
  const recent = recentQuestions(entries, 20);
  const n = recent.length;
  if (n < 5) return 1;
  const acc = recent.filter((q) => q.c).length / n;
  if (acc >= 0.85 && n >= 12) return 4;
  if (acc >= 0.7 && n >= 8) return 3;
  if (acc >= 0.5) return 2;
  return 1;
}

export type MissedQuestion = {
  day: string;
  mode: EntryMode;
  title: string;
  skill: Skill;
  prompt: string;
  picked: string;
  answer: string;
  explain: string;
};

/** The questions the student got wrong, newest first, with what they picked and the best answer. */
export function missedQuestions(entries: DrillEntry[], limit = 10): MissedQuestion[] {
  const out: MissedQuestion[] = [];
  for (const e of [...entries].sort((a, b) => b.at.localeCompare(a.at))) {
    for (const d of e.detail ?? []) {
      if (d.c) continue;
      out.push({
        day: e.day,
        mode: e.mode,
        title: d.t,
        skill: d.s,
        prompt: d.p ?? "",
        picked: d.x ?? "",
        answer: d.a ?? "",
        explain: d.e ?? "",
      });
      if (out.length >= limit) return out;
    }
  }
  return out;
}

/** What was asked lately, so a new drill can steer away from it. */
export function recentPrompts(entries: DrillEntry[], limit = 24): { t: string; p: string; th: string }[] {
  return recentQuestions(entries, limit).map((q) => ({ t: q.t, p: q.p ?? "", th: q.th ?? q.t }));
}

export type SkillRow = { skill: Skill; label: string; asked: number; correct: number; pct: number | null };

export function skillAccuracy(entries: DrillEntry[], sinceDay?: string): SkillRow[] {
  const rows = new Map<Skill, { asked: number; correct: number }>();
  for (const e of entries) {
    if (sinceDay && e.day < sinceDay) continue;
    for (const d of e.detail ?? []) {
      const r = rows.get(d.s) ?? { asked: 0, correct: 0 };
      r.asked += 1;
      r.correct += d.c;
      rows.set(d.s, r);
    }
  }
  return (Object.keys(SKILLS) as Skill[]).map((skill) => {
    const r = rows.get(skill) ?? { asked: 0, correct: 0 };
    return { skill, label: SKILLS[skill].label, asked: r.asked, correct: r.correct, pct: r.asked ? Math.round((r.correct / r.asked) * 100) : null };
  });
}

/** Themes the student keeps missing, most missed first. */
export function missedThemes(entries: DrillEntry[], limit = 5): { theme: string; skill: Skill; missed: number; asked: number }[] {
  const map = new Map<string, { skill: Skill; missed: number; asked: number }>();
  for (const e of entries) {
    for (const d of e.detail ?? []) {
      const key = d.th ?? d.t;
      const r = map.get(key) ?? { skill: d.s, missed: 0, asked: 0 };
      r.asked += 1;
      r.missed += d.c ? 0 : 1;
      map.set(key, r);
    }
  }
  return [...map.entries()]
    .filter(([, r]) => r.missed > 0)
    .map(([theme, r]) => ({ theme, ...r }))
    .sort((a, b) => b.missed - a.missed || b.missed / b.asked - a.missed / a.asked)
    .slice(0, limit);
}

export type DrillStats = {
  /** Days with a finished daily drill, newest first. */
  days: string[];
  streak: number;
  longest: number;
  total: number;
  today: DrillEntry | null;
  bestTimed: DrillEntry | null;
  lastDay: string | null;
};

function shiftDay(day: string, by: number) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + by);
  return d.toISOString().slice(0, 10);
}

/** Monday of the week a day falls in. The weekly CTF resets then. */
export function weekStart(day: string) {
  const dow = new Date(`${day}T00:00:00Z`).getUTCDay();
  return shiftDay(day, -((dow + 6) % 7));
}

export function drillStats(entries: DrillEntry[], today: string): DrillStats {
  const daily = entries.filter((e) => e.mode === "daily");
  const days = new Set(daily.map((e) => e.day));
  // A streak stays alive until a whole day is missed, so a drill still to
  // do today does not zero it.
  let cursor = days.has(today) ? today : shiftDay(today, -1);
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor = shiftDay(cursor, -1);
  }
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const d of [...days].sort()) {
    run = prev && shiftDay(prev, 1) === d ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = d;
  }
  const timed = entries
    .filter((e) => e.mode === "timed" && e.total > 0)
    .sort((a, b) => b.correct - a.correct || a.seconds - b.seconds);
  const latest = [...entries].sort((a, b) => b.at.localeCompare(a.at))[0];
  return {
    days: [...days].sort().reverse().slice(0, 60),
    streak,
    longest,
    total: entries.length,
    today: daily.find((e) => e.day === today) ?? null,
    bestTimed: timed[0] ?? null,
    lastDay: latest?.day ?? null,
  };
}

export type WeeklyReport = {
  from: string;
  to: string;
  drills: number;
  daysActive: number;
  asked: number;
  correct: number;
  accuracy: number | null;
  level: number;
  levelName: string;
  ctf: DrillEntry | null;
  skills: SkillRow[];
  weakest: SkillRow | null;
  strongest: SkillRow | null;
  themes: { theme: string; skill: Skill; missed: number; asked: number }[];
  next: string;
};

export function weeklyReport(entries: DrillEntry[], today: string): WeeklyReport {
  const from = shiftDay(today, -6);
  const inWeek = entries.filter((e) => e.day >= from && e.day <= today);
  const skills = skillAccuracy(inWeek);
  const asked = skills.reduce((a, r) => a + r.asked, 0);
  const correct = skills.reduce((a, r) => a + r.correct, 0);
  const measured = skills.filter((r) => r.asked >= 2 && r.pct !== null);
  const weakest = [...measured].sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0))[0] ?? null;
  const strongest = [...measured].sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0))[0] ?? null;
  const level = levelFor(entries);
  const ctf = entries.find((e) => e.mode === "ctf" && e.id === `ctf-${weekStart(today)}`) ?? null;
  let next = "Do today's scenario to start this week's record.";
  if (weakest && (weakest.pct ?? 100) < 70) next = `Spend this week on ${weakest.label}. You got ${weakest.pct}% of those right.`;
  else if (!ctf && asked > 0) next = "Try the weekly CTF. It is the hardest question of the week.";
  else if (asked > 0) next = "Steady week. The next level is harder, so keep the streak going.";
  return {
    from,
    to: today,
    drills: inWeek.length,
    daysActive: new Set(inWeek.filter((e) => e.mode === "daily").map((e) => e.day)).size,
    asked,
    correct,
    accuracy: asked ? Math.round((correct / asked) * 100) : null,
    level,
    levelName: LEVEL_NAMES[level - 1],
    ctf,
    skills,
    weakest,
    strongest,
    themes: missedThemes(inWeek, 3),
    next,
  };
}

/** One paragraph for the coach's brief: where drills say this student needs help. */
export function weaknessLine(entries: DrillEntry[], results?: Results): string {
  if (!entries.some((e) => e.detail?.length)) return "No drills on record yet.";
  const level = levelFor(entries);
  const skills = skillAccuracy(entries).filter((r) => r.asked > 0);
  const parts = skills.map((r) => `${r.label} ${r.pct}% of ${r.asked}`);
  const themes = missedThemes(entries, 3).map((t) => `${t.theme} (missed ${t.missed} of ${t.asked})`);
  const last = [...entries].sort((a, b) => b.at.localeCompare(a.at))[0];
  const recent = missedQuestions(entries, 4).map((m) => m.title);
  const jobs = jobLine(entries, results);
  return `Drill level ${level} (${LEVEL_NAMES[level - 1]}). Accuracy: ${parts.join("; ")}.${
    themes.length ? ` Keeps missing: ${themes.join("; ")}.` : ""
  }${recent.length ? ` Latest missed questions: ${recent.join("; ")}. Use get_drill_history for what they picked.` : ""} ${jobs} Last drill ${last.day}.`;
}

export function cleanDay(value: unknown): string {
  const utc = new Date().toISOString().slice(0, 10);
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return utc;
  // A student's local date can be a day off UTC, never more.
  return [shiftDay(utc, -1), utc, shiftDay(utc, 1)].includes(value) ? value : utc;
}

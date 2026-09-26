import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { BASELINE_GROUPS, BASELINE_USERS, type LabGroup, type LabSnapshot, type LabUser } from "@/lib/academy-lab";
import { MISSION_JOBS } from "@/lib/academy-missions";
import { SKILLS, summarize, type Results, type Skill } from "@/lib/academy-score";

// Daily and timed drills. Questions come from the student's own lab
// snapshot when they have one, and from the standard PurveX Financial build when
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
  /** The job the second half proves, when it is a real fix in the student's lab. */
  gateJob?: string;
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
  | { t: "computer"; name: string; enabled: boolean }
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

export type PublicItem = Omit<Item, "answer" | "explain" | "accept" | "hint" | "rubric" | "task" | "job" | "gate"> & {
  gated?: boolean;
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

export type DrillReview = {
  title: string;
  skill: Skill;
  picked: string | null;
  answer: string;
  correct: boolean;
  explain: string;
  runbook?: string[];
  /** The job task this question practiced, for the exam link on the result. */
  job?: string;
  /** Exam areas this question practiced. Added by the route from the student's goals. */
  exam?: string[];
};

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
    review.push({
      title: item.title,
      skill: item.skill,
      picked,
      answer,
      correct: !late && right,
      explain,
      runbook: item.kind === "change" || item.gate ? item.task?.runbook : undefined,
      job: isJob(item.job) ? item.job : undefined,
    });
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
  // A CTF with a real fix also proves the job that fix belongs to.
  p.items.forEach((item, i) => {
    if (item.gate && review[i].correct) {
      if (isJob(item.gateJob)) entry.detail.push({ t: `Fix: ${item.title}`.slice(0, 80), s: "security", c: 1, th: item.gateJob, j: item.gateJob, k: "change" });
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
  { id: "reset-password", label: "Reset a password the safe way", skill: "troubleshooting", lab: false },
  { id: "stale-objects", label: "Retire accounts and computers nobody uses", skill: "directory", lab: true },
  { id: "password-hygiene", label: "Fix a password that never expires", skill: "security", lab: true },
  { id: "group-type", label: "Fix a group that cannot grant access", skill: "accounts", lab: true },
  { id: "role-based-access", label: "Build role-based access with groups", skill: "accounts", lab: false },
  { id: "contain-account", label: "Contain a compromised account, keep the evidence", skill: "security", lab: false },
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

/** Jobs the lab snapshot already shows as done. Only a setting the script actually reported can count. */
function jobsSeenInLab(s: LabSnapshot | null | undefined): Set<string> {
  const proven = new Set<string>();
  if (!s) return proven;
  const member = (sam: string, group: string) => {
    const user = s.users.find((u) => u.sam.toLowerCase() === sam);
    if (!user) return false;
    const g = group.toLowerCase();
    return user.memberOf.some((m) => m.toLowerCase() === g) || s.groups.some((x) => x.name.toLowerCase() === g && x.members.includes(user.name));
  };
  const user = (sam: string) => s.users.find((u) => u.sam.toLowerCase() === sam);
  const ticket = (sam: string, id: string) => (user(sam)?.description ?? "").includes(id);
  const jamie = user("jamie.torres");
  if (jamie && ticket("jamie.torres", "CTF-TICKET-1041") && member("jamie.torres", "All Employees")) proven.add("group-access");
  const riley = user("riley.kwan");
  if (riley && ticket("riley.kwan", "CTF-TICKET-1042") && riley.enabled && !riley.lockedOut) proven.add("enable-account");
  const casey = user("casey.reed");
  // The hire ticket plants old.intern (and svc-backup-job). Missing intern is only
  // proof after that plant. A stock lab with no intern must not count Casey as done.
  const intern = user("old.intern");
  const internCleared = intern
    ? ticket("old.intern", "CTF-TICKET-1043") && !member("old.intern", "IT Users")
    : Boolean(user("svc-backup-job"));
  if (casey && member("casey.reed", "IT Users") && internCleared) proven.add("create-user");
  const svc = user("svc-backup-job");
  if (svc && `${svc.description} ${svc.title}`.toLowerCase().includes("01:00-03:00")) proven.add("service-account");
  const taylor = user("taylor.osei");
  if (
    taylor &&
    ticket("taylor.osei", "CTF-TICKET-1045") &&
    taylor.container.toLowerCase() === "ou=users,ou=compliance,ou=departments" &&
    member("taylor.osei", "Compliance Users") &&
    !member("taylor.osei", "Operations Users")
  ) {
    proven.add("fix-ou");
  }

  const pp = s.security?.passwordPolicy;
  if (pp && pp.lockoutThreshold >= 1 && pp.lockoutThreshold <= 10 && pp.lockoutDurationMin >= 15 && pp.lockoutWindowMin >= 15) proven.add("lockout-policy");
  if (pp && pp.minLength >= 12 && pp.complexity) proven.add("password-policy");
  const audit = s.security?.audit ?? {};
  const audited = (sub: string, need: "Success" | "Both") => {
    const v = (audit[sub] ?? "").toLowerCase();
    if (!v) return false;
    const okS = v.includes("success");
    const okF = v.includes("failure");
    return need === "Both" ? okS && okF : okS;
  };
  if (
    audited("Process Creation", "Success") &&
    audited("Logon", "Both") &&
    audited("Special Logon", "Success") &&
    audited("Security Group Management", "Success")
  ) {
    proven.add("enable-auditing");
  }
  if ((s.security?.securityLogMaxMB ?? 0) >= 512) proven.add("log-retention");
  const admins = ["IT Admins", "Server Admins", "Domain Admins"].filter((g) => s.groups.some((x) => x.name.toLowerCase() === g.toLowerCase()));
  const target = admins.includes("IT Admins") ? "IT Admins" : admins[0];
  if (
    s.security?.psos &&
    target &&
    s.security.psos.some((x) => x.minLength >= 16 && x.lockoutThreshold >= 1 && x.lockoutThreshold <= 5 && x.appliesTo.some((a) => a.toLowerCase() === target.toLowerCase()))
  ) {
    proven.add("admin-password-policy");
  }
  return proven;
}

export function jobProgress(entries: DrillEntry[], results?: Results, snapshot?: LabSnapshot | null): JobRow[] {
  const seen = jobsSeenInLab(snapshot);
  return JOBS.map((job) => {
    let asked = 0;
    let correct = 0;
    let labProven = seen.has(job.id);
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
export function pickTargetJob(
  entries: DrillEntry[],
  seed: string,
  labJobs: Set<string> | null,
  results?: Results,
  snapshot?: LabSnapshot | null,
  /** Jobs that practice the student's exam focus area. Used first while any are not proven yet. */
  prefer?: Set<string> | null
): JobRow | null {
  // A hands-on job is only offered when the student's real lab has something to do for it.
  const open = jobProgress(entries, results, snapshot).filter((j) => (j.lab ? Boolean(labJobs?.has(j.id)) : true));
  const aimed = prefer ? open.filter((j) => prefer.has(j.id) && j.status !== "proven") : [];
  const rows = aimed.length ? aimed : open;
  if (!rows.length) return null;
  const rank = { new: 0, practiced: 1, proven: 2 } as const;
  const best = Math.min(...rows.map((j) => rank[j.status]));
  const pool = rows.filter((j) => rank[j.status] === best).sort((a, b) => Number(b.lab) - Number(a.lab) || (a.last ?? "").localeCompare(b.last ?? ""));
  // Among the least recent few, vary by day so it is not always the same one.
  return pool[Math.floor(seeded(`job:${seed}`)() * Math.min(3, pool.length))];
}

/** One line for Coach: how much of the job this student has shown they can do. */
export function jobLine(entries: DrillEntry[], results?: Results, snapshot?: LabSnapshot | null): string {
  const rows = jobProgress(entries, results, snapshot);
  const done = rows.filter((r) => r.status === "proven" && r.lab);
  const open = rows.filter((r) => r.lab && r.status !== "proven").map((r) => r.label);
  return `Work their lab shows${done.length ? `: ${done.map((r) => r.label).join("; ")}` : ": nothing yet"}.${open.length ? ` Not in the lab yet: ${open.slice(0, 5).join("; ")}.` : ""}`;
}

// ---- lab change checks ----------------------------------------------------
// The tasks come from a real audit of the student's own lab (see academy-audit.ts).
// Checking a fix is a plain comparison against their next snapshot.

export function evalCheck(s: LabSnapshot, c: Check): boolean {
  if (c.t === "computer") {
    const pc = s.computers.find((x) => x.name.toLowerCase() === c.name.toLowerCase());
    return Boolean(pc) && pc!.enabled === c.enabled;
  }
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


// ---- coach chats earned by drills -----------------------------------------

/** Extra Coach chats for the student's local day. Harder, longer work earns more. */
export function coachBonus(entries: DrillEntry[], day: string): { bonus: number; parts: { label: string; n: number }[] } {
  const today = entries.filter((e) => e.day === day);
  const parts: { label: string; n: number }[] = [];
  const daily = today.find((e) => e.mode === "daily");
  // Chats are earned by getting it right, so giving up or guessing never pays.
  if (daily?.correct) parts.push({ label: "Daily scenario, solved", n: 3 });
  for (const t of today.filter((e) => e.mode === "timed").slice(0, 1)) {
    if (t.correct >= 3) parts.push({ label: "Incident drill", n: t.correct >= 4 ? 2 : 1 });
  }
  const ctf = today.find((e) => e.mode === "ctf");
  if (ctf?.correct) parts.push({ label: "Weekly CTF, flag captured", n: 5 });
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
  lastTimed: DrillEntry | null;
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

const INCIDENT_WAIT_MS = 24 * 60 * 60 * 1000;

/** The last incident drill, if it was finished less than 24 hours ago. */
export function incidentHold(entries: DrillEntry[], now = Date.now()): { until: string } | null {
  const last = entries
    .filter((e) => e.mode === "timed" && e.total > 0)
    .sort((a, b) => b.at.localeCompare(a.at))[0];
  if (!last) return null;
  const at = new Date(last.at).getTime();
  if (Number.isNaN(at)) return null;
  const until = at + INCIDENT_WAIT_MS;
  return now < until ? { until: new Date(until).toISOString() } : null;
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
  const lastTimed = entries
    .filter((e) => e.mode === "timed" && e.total > 0)
    .sort((a, b) => b.at.localeCompare(a.at))[0] ?? null;
  const latest = [...entries].sort((a, b) => b.at.localeCompare(a.at))[0];
  return {
    days: [...days].sort().reverse().slice(0, 60),
    streak,
    longest,
    // Practice recorded by Coach or an assistant is not a drill.
    total: entries.filter((e) => e.mode !== "coach").length,
    today: daily.find((e) => e.day === today) ?? null,
    bestTimed: timed[0] ?? null,
    lastTimed,
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
export function weaknessLine(entries: DrillEntry[], results?: Results, snapshot?: LabSnapshot | null): string {
  if (!entries.some((e) => e.detail?.length)) return "No drills on record yet.";
  const level = levelFor(entries);
  const skills = skillAccuracy(entries).filter((r) => r.asked > 0);
  const parts = skills.map((r) => `${r.label} ${r.pct}% of ${r.asked}`);
  const themes = missedThemes(entries, 3).map((t) => `${t.theme} (missed ${t.missed} of ${t.asked})`);
  const last = [...entries].sort((a, b) => b.at.localeCompare(a.at))[0];
  const recent = missedQuestions(entries, 4).map((m) => m.title);
  const jobs = jobLine(entries, results, snapshot);
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

import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { BASELINE_GROUPS, BASELINE_USERS, type LabGroup, type LabSnapshot, type LabUser } from "@/lib/academy-lab";
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
};

export type PublicItem = Omit<Item, "answer" | "explain" | "accept" | "hint">;

/** One question. `x`, `a` and `e` are kept only for misses: what they picked, the best answer, and why. */
export type DrillDetail = { t: string; s: Skill; c: 0 | 1; p?: string; th?: string; x?: string; a?: string; e?: string };

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

export type DrillReview = { title: string; skill: Skill; picked: string | null; answer: string; correct: boolean; explain: string };

type Payload = { id: string; u: string; mode: DrillMode; day: string; iat: number; limit: number; source: "lab" | "standard"; ai: boolean; level: number; items: Item[] };

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

function publicItems(items: Item[]): PublicItem[] {
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
  const token = seal({ id, u: params.userId, mode: params.mode, day: params.day, iat: Date.now(), limit, source, ai, level, items });
  return { token, limitSeconds: limit, source, ai, level, items: publicItems(items) };
}

/** Reopen a saved scenario with a fresh clock. */
export function reissueDrill(userId: string, token: string): StartedDrill | null {
  const p = unseal(token);
  if (!p || p.u !== userId || p.mode === "timed") return null;
  const fresh = seal({ ...p, iat: Date.now() });
  return { token: fresh, limitSeconds: p.limit, source: p.source, ai: p.ai, level: p.level ?? 1, items: publicItems(p.items) };
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

export function gradeDrill(
  userId: string,
  token: string,
  answers: unknown
): { entry: DrillEntry; review: DrillReview[]; late: boolean } | null {
  const p = unseal(token);
  if (!p || p.u !== userId) return null;
  const given = Array.isArray(answers) ? answers : [];
  const seconds = Math.max(0, Math.round((Date.now() - p.iat) / 1000));
  const late = p.limit > 0 && seconds > p.limit + LATE_GRACE_SECONDS;
  const review = p.items.map((item, i) => {
    const raw = typeof given[i] === "string" ? (given[i] as string).slice(0, 200) : null;
    let picked: string | null;
    let right: boolean;
    if (item.free) {
      picked = raw && raw.trim() ? raw.trim() : null;
      right = picked !== null && [item.answer, ...(item.accept ?? [])].some((a) => flat(a) === flat(picked!));
    } else {
      picked = raw !== null && item.choices.includes(raw) ? raw : null;
      right = picked === item.answer;
    }
    return {
      title: item.title,
      skill: item.skill,
      picked,
      answer: item.answer,
      correct: !late && right,
      explain: item.explain,
    };
  });
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
      ...(review[i].correct
        ? {}
        : {
            x: (review[i].picked ?? "no answer").slice(0, 160),
            a: item.answer.slice(0, 160),
            e: item.explain.slice(0, 320),
          }),
    })),
  };
  return { entry, review, late };
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
export function weaknessLine(entries: DrillEntry[]): string {
  if (!entries.some((e) => e.detail?.length)) return "No drills on record yet.";
  const level = levelFor(entries);
  const skills = skillAccuracy(entries).filter((r) => r.asked > 0);
  const parts = skills.map((r) => `${r.label} ${r.pct}% of ${r.asked}`);
  const themes = missedThemes(entries, 3).map((t) => `${t.theme} (missed ${t.missed} of ${t.asked})`);
  const last = [...entries].sort((a, b) => b.at.localeCompare(a.at))[0];
  const recent = missedQuestions(entries, 4).map((m) => m.title);
  return `Drill level ${level} (${LEVEL_NAMES[level - 1]}). Accuracy: ${parts.join("; ")}.${
    themes.length ? ` Keeps missing: ${themes.join("; ")}.` : ""
  }${recent.length ? ` Latest missed questions: ${recent.join("; ")}. Use get_drill_history for what they picked.` : ""} Last drill ${last.day}.`;
}

export function cleanDay(value: unknown): string {
  const utc = new Date().toISOString().slice(0, 10);
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return utc;
  // A student's local date can be a day off UTC, never more.
  return [shiftDay(utc, -1), utc, shiftDay(utc, 1)].includes(value) ? value : utc;
}

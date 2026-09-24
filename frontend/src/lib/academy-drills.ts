import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { BASELINE_GROUPS, BASELINE_USERS, type LabGroup, type LabSnapshot, type LabUser } from "@/lib/academy-lab";
import { summarize, type Results, type Skill } from "@/lib/academy-score";

// Daily and timed drills. Questions come from the student's own lab
// snapshot when they have one, and from the standard GovTech build when
// they do not. Answers never leave the server: the drill token carries
// them encrypted, so grading needs no database row.

export type DrillMode = "daily" | "timed";

export const DRILL_SIZE = 5;
export const TIMED_LIMIT_SECONDS = 180;
const LATE_GRACE_SECONDS = 10;

type Item = {
  skill: Skill;
  title: string;
  prompt: string;
  evidence?: string[];
  choices: string[];
  answer: string;
  explain: string;
};

export type PublicItem = Omit<Item, "answer" | "explain">;

export type DrillEntry = {
  id: string;
  day: string;
  mode: DrillMode;
  correct: number;
  total: number;
  seconds: number;
  misses: Skill[];
  at: string;
};

export type DrillReview = { title: string; skill: Skill; picked: string | null; answer: string; correct: boolean; explain: string };

type Payload = { id: string; u: string; mode: DrillMode; day: string; iat: number; limit: number; source: "lab" | "standard"; items: Item[] };

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

function pickItems(seed: string, snapshot: LabSnapshot, results: Results, mode: DrillMode): Item[] {
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

  while (items.length < DRILL_SIZE && guard++ < 80) {
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
    const item = queues.get(skill)!.shift()!(snapshot, r);
    if (!item || seen.has(item.prompt)) continue;
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

export function startDrill(params: {
  userId: string;
  mode: DrillMode;
  day: string;
  snapshot: LabSnapshot | null;
  results: Results;
}): { token: string; items: PublicItem[]; limitSeconds: number; source: "lab" | "standard" } {
  const source = params.snapshot ? "lab" : "standard";
  const snapshot = params.snapshot ?? standardSnapshot();
  const nonce = randomBytes(6).toString("hex");
  // The daily drill is the same all day; a timed run is fresh every time.
  const seed = params.mode === "daily" ? `${params.userId}:${params.day}` : `${params.userId}:${nonce}`;
  const items = pickItems(seed, snapshot, params.results, params.mode);
  const limit = params.mode === "timed" ? TIMED_LIMIT_SECONDS : 0;
  const id = params.mode === "daily" ? `daily-${params.day}` : `timed-${nonce}`;
  const token = seal({ id, u: params.userId, mode: params.mode, day: params.day, iat: Date.now(), limit, source, items });
  return {
    token,
    limitSeconds: limit,
    source,
    items: items.map((item) => ({
      skill: item.skill,
      title: item.title,
      prompt: item.prompt,
      evidence: item.evidence,
      choices: item.choices,
    })),
  };
}

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
    const picked = typeof given[i] === "string" && item.choices.includes(given[i]) ? (given[i] as string) : null;
    return { title: item.title, skill: item.skill, picked, answer: item.answer, correct: !late && picked === item.answer, explain: item.explain };
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
  };
  return { entry, review, late };
}

// ---- streaks and stats ----------------------------------------------------

export type DrillStats = {
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
    streak,
    longest,
    total: entries.length,
    today: daily.find((e) => e.day === today) ?? null,
    bestTimed: timed[0] ?? null,
    lastDay: latest?.day ?? null,
  };
}

export function cleanDay(value: unknown): string {
  const utc = new Date().toISOString().slice(0, 10);
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return utc;
  // A student's local date can be a day off UTC, never more.
  return [shiftDay(utc, -1), utc, shiftDay(utc, 1)].includes(value) ? value : utc;
}

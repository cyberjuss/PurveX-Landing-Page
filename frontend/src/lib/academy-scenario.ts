import "server-only";
import { COACH_SONNET_MODEL } from "@/lib/academy-coach";
import { LEVEL_NAMES, pickSkill, seeded, shuffle, standardSnapshot, type Item } from "@/lib/academy-drills";
import type { LabSnapshot } from "@/lib/academy-lab";
import { summarize, SKILLS, type Results, type Skill } from "@/lib/academy-score";

// The daily drill and the weekly CTF are written by the model from the
// student's own lab, their weak spots, and their level. The model only
// writes the story and the question. Grading stays a plain match against
// the answer it committed to. Recent drills are passed in so it does not
// repeat itself.

const THEMES: Record<Skill, string[]> = {
  accounts: [
    "a new hire needs the same access as a coworker",
    "someone asks who is allowed to reach a resource",
    "an auditor asks who holds a privileged group",
    "an employee moved departments and access is off",
    "a contractor account that should have expired",
    "a shared mailbox request that would widen access",
    "two people with the same job title but different groups",
  ],
  directory: [
    "find where an object lives before acting on it",
    "an account sits in the wrong place in the directory",
    "tell an OU from a plain container",
    "a computer object that no longer matches its department",
    "a group that lives in the wrong OU",
    "a nested group that grants access nobody expected",
  ],
  troubleshooting: [
    "a ticket makes a claim that may be wrong",
    "a person cannot sign in and there are several possible causes",
    "a request would give someone more access than the job needs",
    "a caller pressures the desk to skip verification",
    "a password reset that hides the real cause",
    "the fix works once and the problem comes back",
  ],
  security: [
    "a login pattern in Windows event logs 4624, 4625 and 4740",
    "a service account behaves like a person",
    "a privilege change with no ticket behind it",
    "an off-hours login that may be legitimate",
    "one source hitting many accounts",
    "an account that logs in from two places at once",
    "log evidence that must be kept before anything is changed",
  ],
};

const LEVEL_RULES = [
  "Level 1, Foundation: one clear fact to check and one obvious best action. The wrong choices are plainly wrong. Two evidence lines at most.",
  "Level 2, Standard: one detail must be verified before acting. Two choices sound reasonable. Two to three evidence lines.",
  "Level 3, Hard: the evidence contains a distracting or partly misleading detail. Two or three choices look reasonable and the best one depends on order of operations: verify, contain, preserve, escalate. Three to five evidence lines.",
  "Level 4, Expert: combine directory facts with log evidence. Include an ambiguity or a tempting shortcut, and a tradeoff a senior would weigh, such as business impact against containment. Four to six evidence lines and no obvious giveaway.",
];

// Objects the Ticket Queue and CTF use. The drill must not spoil them.
const OFF_LIMITS = "old.intern, svc-backup-job, WM-WKS07, OPS-WKS03, the All Employees group, INC-1041 to INC-1046";

export type Recent = { t: string; p: string; th: string };

function labFacts(s: LabSnapshot): string {
  const users = s.users.slice(0, 24).map((u) => {
    const dept = /OU=([^,]+),OU=Departments$/i.exec(u.container)?.[1] ?? u.container;
    const flags = [u.enabled ? "" : "disabled", u.lockedOut ? "locked out" : ""].filter(Boolean).join(", ");
    return `- ${u.name} (${u.sam})${u.title ? `, ${u.title}` : ""}; ${dept}; groups: ${u.memberOf.join(", ") || "none"}${flags ? `; ${flags}` : ""}`;
  });
  const groups = s.groups.slice(0, 16).map((g) => `- ${g.name}: ${g.members.length} members`);
  const computers = s.computers.slice(0, 10).map((c) => `- ${c.name}: ${c.container}`);
  return `Domain: ${s.domain.dnsRoot || "govtechfinancial.local"}\nUsers:\n${users.join("\n")}\nGroups:\n${groups.join("\n")}\nComputers:\n${computers.join("\n")}`;
}

function text(v: unknown, max: number): string {
  return typeof v === "string" ? v.replace(/[\u0000-\u001f]+/g, " ").trim().slice(0, max) : "";
}

function words(v: string) {
  return new Set(v.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((w) => w.length > 3));
}

/** True when a new scenario reads like one asked recently. */
function tooSimilar(item: Item, recent: Recent[]): boolean {
  const mine = words(`${item.title} ${item.prompt}`);
  return recent.some((r) => {
    if (r.t.toLowerCase() === item.title.toLowerCase()) return true;
    const theirs = words(`${r.t} ${r.p}`);
    if (!mine.size || !theirs.size) return false;
    let shared = 0;
    for (const w of mine) if (theirs.has(w)) shared += 1;
    return shared / Math.min(mine.size, theirs.size) > 0.6;
  });
}

function json(raw: string): Record<string, unknown> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

function skillOf(v: unknown, fallback: Skill): Skill {
  return (Object.keys(SKILLS) as Skill[]).includes(v as Skill) ? (v as Skill) : fallback;
}

function parseChoice(raw: string, fallback: Skill, seed: string, theme: string): Item | null {
  const j = json(raw);
  if (!j) {
    console.error("scenario: no JSON in reply", raw.slice(0, 200));
    return null;
  }
  const choices = Array.isArray(j.choices) ? j.choices.map((c) => text(c, 200)).filter(Boolean) : [];
  const idx = Number(j.answerIndex);
  if (choices.length !== 4 || new Set(choices).size !== 4 || !Number.isInteger(idx) || idx < 0 || idx > 3) {
    console.error("scenario: bad choices", { choices: choices.length, idx });
    return null;
  }
  const title = text(j.title, 60);
  const story = text(j.story, 700);
  const prompt = text(j.question, 300);
  const explain = text(j.explain, 700);
  if (!title || !story || !prompt || !explain) return null;
  const evidence = Array.isArray(j.evidence) ? j.evidence.map((e) => text(e, 160)).filter(Boolean).slice(0, 6) : [];
  return {
    skill: skillOf(j.skill, fallback),
    title,
    story,
    prompt,
    evidence: evidence.length ? evidence : undefined,
    // The model tends to park the right answer in one slot. Reshuffle.
    choices: shuffle(seeded(`${seed}:order`), choices),
    answer: choices[idx],
    explain,
    theme,
  };
}

function parseCtf(raw: string, fallback: Skill, theme: string): Item | null {
  const j = json(raw);
  if (!j) return null;
  const title = text(j.title, 60);
  const story = text(j.story, 900);
  const prompt = text(j.question, 300);
  const explain = text(j.explain, 900);
  const answer = text(j.answer, 80);
  const hint = text(j.hint, 300);
  const format = text(j.answerFormat, 100);
  const evidence = Array.isArray(j.evidence) ? j.evidence.map((e) => text(e, 180)).filter(Boolean).slice(0, 16) : [];
  const accept = Array.isArray(j.accept) ? j.accept.map((a) => text(a, 80)).filter(Boolean).slice(0, 6) : [];
  if (!title || !story || !prompt || !explain || !answer || evidence.length < 6) return null;
  return {
    skill: skillOf(j.skill, fallback),
    title,
    story,
    prompt,
    evidence,
    choices: [],
    answer,
    accept,
    explain,
    hint: hint || undefined,
    format: format || undefined,
    free: true,
    theme,
  };
}

async function ask(apiKey: string, system: string, user: string, maxTokens: number, timeoutMs: number): Promise<string | null> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({ model: COACH_SONNET_MODEL, max_tokens: maxTokens, system, messages: [{ role: "user", content: user }] }),
  });
  if (!res.ok) {
    console.error("scenario: model request failed", res.status);
    return null;
  }
  const body = (await res.json()) as { content?: { type: string; text?: string }[] };
  return (body.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n");
}

function context(params: { snapshot: LabSnapshot | null; results: Results }) {
  const lab = params.snapshot ?? standardSnapshot();
  const scores = summarize(params.results).skills.map((k) => `${k.label}: ${k.score === null ? "not started" : `${k.score}%`}`).join("; ");
  return { lab, scores };
}

function avoidBlock(recent: Recent[]) {
  if (!recent.length) return "";
  const lines = recent.slice(0, 16).map((r) => `- ${r.t}${r.th && r.th !== r.t ? ` (${r.th})` : ""}`);
  return `\n\nRecently asked. Do not repeat these scenarios, their situations, or their people and objects together:\n${lines.join("\n")}`;
}

const BASE_RULES = `- Use the real names, groups, departments and computers from the lab facts. Do not invent people or objects that are not listed, except log details such as times and IP addresses.
- Refer to people by name or as they/them. Never guess a gender from a name.
- Plain, direct language. No filler.
- Never use these objects: ${OFF_LIMITS}.`;

export async function generateScenario(params: {
  apiKey: string;
  userId: string;
  day: string;
  snapshot: LabSnapshot | null;
  results: Results;
  level: number;
  recent: Recent[];
}): Promise<Item | null> {
  const seed = `${params.userId}:${params.day}`;
  const skill = pickSkill(seed, params.results);
  const usedThemes = new Set(params.recent.map((r) => r.th));
  const pool = THEMES[skill].filter((t) => !usedThemes.has(t));
  const r = seeded(`theme:${seed}`);
  const themes = pool.length ? pool : THEMES[skill];
  const theme = themes[Math.floor(r() * themes.length)];
  const { lab, scores } = context(params);
  const level = Math.min(4, Math.max(1, params.level));

  const system = `You write one short, realistic daily practice scenario for a trainee at GovTech Financial's service desk who is learning to be a Tier 1 help desk and junior SOC analyst.

Rules:
${BASE_RULES}
- The scenario must be answerable from the story and evidence you show. Never require lab knowledge that is not on screen.
- One question, four choices, exactly one correct. The wrong choices must be mistakes a new hire really makes, such as acting before checking, deleting instead of containing, or trusting the ticket.
- Judgement over trivia: the best answer is the right first move, and why it matters.
- The story is two to four sentences.
- Difficulty: ${LEVEL_RULES[level - 1]}
Return only JSON, no other text:
{"title": "3 to 5 words", "skill": "accounts|directory|troubleshooting|security", "story": "...", "evidence": ["..."], "question": "...", "choices": ["...","...","...","..."], "answerIndex": 0, "explain": "two or three sentences: why the answer is right and what the trap was"}`;

  const user = `Lab facts:\n${labFacts(lab)}\n\nTrainee skill scores: ${scores}.\nTrainee level: ${level} (${LEVEL_NAMES[level - 1]}).\nToday's focus skill: ${SKILLS[skill].label}.\nScenario theme: ${theme}.${avoidBlock(params.recent)}`;

  // One retry if the first draft reads like something they already had.
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await ask(
      params.apiKey,
      system,
      attempt ? `${user}\n\nYour last draft was too close to a recent one. Use a different situation and different people.` : user,
      2400,
      28_000
    );
    const item = raw ? parseChoice(raw, skill, `${seed}:${attempt}`, theme) : null;
    if (item && (attempt === 1 || !tooSimilar(item, params.recent))) return item;
  }
  return null;
}

export async function generateCtf(params: {
  apiKey: string;
  userId: string;
  week: string;
  snapshot: LabSnapshot | null;
  results: Results;
  level: number;
  recent: Recent[];
}): Promise<Item | null> {
  const skill: Skill = "security";
  const { lab, scores } = context(params);
  // The weekly CTF is always a step above the student's level.
  const level = Math.min(4, params.level + 1);

  const system = `You write one weekly CTF-style investigation for a trainee at GovTech Financial's service desk who is learning to be a junior SOC analyst. The trainee reads the evidence, works out one fact, and types it in.

Rules:
${BASE_RULES}
- Give 8 to 14 evidence lines. Mix Windows security log lines (event IDs 4624, 4625, 4634, 4648, 4720, 4728, 4740, 4768, 4769) with directory facts and, if it helps, DNS or DHCP lines that tie an IP address to a host.
- The answer takes at least two evidence lines to find. For example, tie an address to a host in one place and that host to an account in another. Include two or three lines that look important and are not.
- Exactly one correct answer, a short exact token: an account name, a host name, an IP address, or an event ID. Walk through the evidence yourself before you answer and make sure it is unambiguous.
- Difficulty: ${LEVEL_RULES[level - 1]}
Return only JSON, no other text:
{"title": "3 to 5 words", "skill": "security", "story": "three to five sentences setting up the alert", "evidence": ["..."], "question": "one question with exactly one short answer", "answerFormat": "what to type, for example an account name like first.last", "answer": "the exact answer", "accept": ["other spellings that are also right"], "hint": "one sentence that points at the right evidence without giving the answer", "explain": "three or four sentences walking through how the evidence leads to the answer"}`;

  const user = `Lab facts:\n${labFacts(lab)}\n\nTrainee skill scores: ${scores}.\nCTF difficulty level: ${level} (${LEVEL_NAMES[level - 1]}).${avoidBlock(params.recent)}`;

  const began = Date.now();
  for (let attempt = 0; attempt < 2; attempt++) {
    // Leave room in a 60 second function for the second draft.
    if (attempt && Date.now() - began > 24_000) break;
    const raw = await ask(params.apiKey, system, user, 2200, attempt ? 30_000 : 40_000);
    const item = raw ? parseCtf(raw, skill, "Weekly CTF") : null;
    if (item && (attempt === 1 || !tooSimilar(item, params.recent))) return { ...item, theme: `CTF: ${item.title}` };
    if (item && attempt === 0) continue;
  }
  return null;
}

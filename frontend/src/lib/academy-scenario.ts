import "server-only";
import { COACH_SONNET_MODEL } from "@/lib/academy-coach";
import { pickSkill, seeded, shuffle, standardSnapshot, type Item } from "@/lib/academy-drills";
import type { LabSnapshot } from "@/lib/academy-lab";
import { summarize, SKILLS, type Results, type Skill } from "@/lib/academy-score";

// The daily drill: one scenario written by the model from the student's own
// lab and their weak spots. The model only writes the story and the
// question. Grading stays a plain match against the answer it committed to.

const THEMES: Record<Skill, string[]> = {
  accounts: [
    "a new hire needs the same access as a coworker",
    "someone asks who is allowed to reach a resource",
    "an auditor asks who holds a privileged group",
    "an employee moved departments and access is off",
  ],
  directory: [
    "find where an object lives before acting on it",
    "an account sits in the wrong place in the directory",
    "tell an OU from a plain container",
  ],
  troubleshooting: [
    "a ticket makes a claim that may be wrong",
    "a person cannot sign in and there are several possible causes",
    "a request would give someone more access than the job needs",
  ],
  security: [
    "a login pattern in Windows event logs 4624, 4625 and 4740",
    "a service account behaves like a person",
    "a privilege change with no ticket behind it",
    "an off-hours login that may be legitimate",
  ],
};

// Objects the Ticket Queue and CTF use. The drill must not spoil them.
const OFF_LIMITS = "old.intern, svc-backup-job, WM-WKS07, OPS-WKS03, the All Employees group, INC-1041 to INC-1046";

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

function parse(raw: string, skillFallback: Skill, seed: string): Item | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let j: Record<string, unknown>;
  try {
    j = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
  const choices = Array.isArray(j.choices) ? j.choices.map((c) => text(c, 200)).filter(Boolean) : [];
  const idx = Number(j.answerIndex);
  if (choices.length !== 4 || new Set(choices).size !== 4 || !Number.isInteger(idx) || idx < 0 || idx > 3) return null;
  const title = text(j.title, 60);
  const story = text(j.story, 700);
  const prompt = text(j.question, 300);
  const explain = text(j.explain, 700);
  if (!title || !story || !prompt || !explain) return null;
  const skill = (Object.keys(SKILLS) as Skill[]).includes(j.skill as Skill) ? (j.skill as Skill) : skillFallback;
  const evidence = Array.isArray(j.evidence) ? j.evidence.map((e) => text(e, 160)).filter(Boolean).slice(0, 6) : [];
  const answer = choices[idx];
  return {
    skill,
    title,
    story,
    prompt,
    evidence: evidence.length ? evidence : undefined,
    // The model tends to park the right answer in one slot. Reshuffle.
    choices: shuffle(seeded(`${seed}:order`), choices),
    answer,
    explain,
  };
}

export async function generateScenario(params: {
  apiKey: string;
  userId: string;
  day: string;
  snapshot: LabSnapshot | null;
  results: Results;
}): Promise<Item | null> {
  const seed = `${params.userId}:${params.day}`;
  const skill = pickSkill(seed, params.results);
  const r = seeded(`theme:${seed}`);
  const themes = THEMES[skill];
  const theme = themes[Math.floor(r() * themes.length)];
  const lab = params.snapshot ?? standardSnapshot();
  const summary = summarize(params.results);
  const scores = summary.skills.map((k) => `${k.label}: ${k.score === null ? "not started" : `${k.score}%`}`).join("; ");

  const system = `You write one short, realistic daily practice scenario for a trainee at GovTech Financial's service desk who is learning to be a Tier 1 help desk and junior SOC analyst.

Rules:
- Use the real names, groups, departments and computers from the lab facts. Do not invent people or objects that are not listed, except log details such as times and IP addresses.
- The scenario must be answerable from the story and evidence you show. Never require lab knowledge that is not on screen.
- One question, four choices, exactly one correct. The wrong choices must be mistakes a new hire really makes, such as acting before checking, deleting instead of containing, or trusting the ticket.
- Judgement over trivia: the best answer is the right first move, and why it matters.
- Refer to people by name or as they/them. Never guess a gender from a name.
- Plain, direct language. No filler. The story is two to four sentences. Evidence is up to five short lines of log output or directory facts, or none.
- Never use these objects: ${OFF_LIMITS}.
Return only JSON, no other text:
{"title": "3 to 5 words", "skill": "accounts|directory|troubleshooting|security", "story": "...", "evidence": ["..."], "question": "...", "choices": ["...","...","...","..."], "answerIndex": 0, "explain": "two or three sentences: why the answer is right and what the trap was"}`;

  const user = `Lab facts:\n${labFacts(lab)}\n\nTrainee skill scores: ${scores}.\nToday's focus skill: ${SKILLS[skill].label}.\nScenario theme: ${theme}.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal: AbortSignal.timeout(25_000),
    headers: {
      "content-type": "application/json",
      "x-api-key": params.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: COACH_SONNET_MODEL,
      max_tokens: 1200,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { content?: { type: string; text?: string }[] };
  const raw = (body.content ?? []).filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n");
  return parse(raw, skill, seed);
}

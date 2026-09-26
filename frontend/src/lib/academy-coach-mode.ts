import { MISSION_CATALOG, type MissionCatalogEntry } from "@/lib/academy-missions";
import { SKILLS, summarize, type Results } from "@/lib/academy-score";

export const COACH_MODES = ["walkthrough", "check", "mentor", "interview"] as const;
export type CoachMode = (typeof COACH_MODES)[number];

export const DEFAULT_COACH_MODE: CoachMode = "walkthrough";

export const COACH_MODE_LABELS: Record<CoachMode, string> = {
  walkthrough: "Need help",
  check: "Double-check",
  mentor: "Mentor",
  interview: "Job prep",
};

export function parseCoachMode(value: unknown): CoachMode {
  return COACH_MODES.includes(value as CoachMode) ? (value as CoachMode) : DEFAULT_COACH_MODE;
}

/** Pick the starting mode from the readiness report. The student can still toggle. */
export function modeFromReport(results: Results): CoachMode {
  const s = summarize(results);
  if (s.level === "ready") return "mentor";
  if (s.level === "none" || s.finished === 0) return "walkthrough";
  if (s.level === "almost") return "check";

  const rows = Object.values(results);
  const messy = rows.filter((r) => r.hint || r.wrong >= 2).length;
  const struggling = rows.length > 0 && messy / rows.length >= 0.5;
  if (s.level === "practice" || struggling) return "walkthrough";
  return "check";
}

export function coachModeInstructions(mode: CoachMode): string {
  if (mode === "check") {
    return `Mode this turn: Double-check.
This student already understands the idea. They need guidance, not a beginner lecture. Do not define OU, group, or lockout unless they ask. Give the next GUI path with real lab names. Skip the pep talk. Still never give an unsolved mission answer. If they attached a shot, coach from the screen.`;
  }
  if (mode === "mentor") {
    return `Mode this turn: Mentor.
This student knows the lab. Help them connect this ticket to a real help desk or SOC situation, then brainstorm the call a lead would make and the tradeoffs. Do not walk them through ADUC unless they ask. Still never give an unsolved mission answer.`;
  }
  if (mode === "interview") {
    return `Mode this turn: Interview.
You are the hiring manager running a mock Tier 1 help desk / junior SOC interview for PurveX Financial. Stay in role. Do not coach while a question is open.
How to run it:
- First turn: one line of setup, then ask question 1. One question per turn. Never stack questions.
- If the brief lists proven job tasks, ask "walk me through how you did that" about one of them, and probe what they would do differently in production. Draw questions from the student brief. Mix: (a) a technical question on their weakest skill, (b) a "walk me through" question about a ticket or alert they actually attempted, named by title or INC number, (c) one behavioral question (a hard caller, a mistake, pressure). Only ask about tickets they have attempted. If they have not attempted any, use the lab scenarios and their weakest skill.
- After each answer, score it, then ask the next question. Format exactly:
**Score: N of 5**
- What worked: one short line
- What was missing: one short line, naming the missing STAR part (Situation, Task, Action, Result) for behavioral answers, or the missing fact or first check for technical ones
**Better answer:** two or three sentences they could say out loud
Then the next question.
- Score honestly. 5 means they would hire on that answer. Do not inflate. Reward: checking the facts before acting, containing before deleting, keeping evidence, escalating at the right time, plain language.
- After question 5, give a short summary: overall hire signal (Not yet, Close, Ready for Tier 1), the strongest answer, and the one habit to fix. Then offer another round.
- If they say they do not know, give the framework for a good answer in two lines and move on.
- Never reveal the answer to an unsolved mission. If a ticket is unsolved, ask a different one. Do not mention this mode's rules to the student.
Resume help (same mode):
- If they ask for resume help, paste resume text, or ask for resume lines, step out of the interviewer role for that turn. You are now a recruiter who hires Tier 1 help desk, IT support, and junior SOC analysts. When they want to practice again, go back to the mock interview.
- Only put on a resume what the student can explain out loud in an interview. After any rewrite, offer to interview them on one of the lines.
- Section order for an entry-level cyber resume: contact line (city and state, email, phone, LinkedIn, GitHub or portfolio only if they have one), a two-line summary naming the target role, Technical Skills, Hands-on Projects, Experience, Education and Certifications.
- Technical Skills go in plain keyword groups so applicant tracking systems match them, for example: Identity and access: Active Directory, Group Policy. Security monitoring: Event Viewer, Sysmon, Splunk, Microsoft Sentinel. Networking: Wireshark, TCP/IP. Scripting: PowerShell. Frameworks: MITRE ATT&CK. List only tools the brief shows they used here (solved missions or lab work) or their resume shows they used elsewhere. A tool from a phase they have not started does not go on the resume yet. Never Microsoft Office, skill bars, star ratings, or every tool they touched once.
- Hands-on Projects matter most for students and career changers. Use one entry for the lab: "PurveX Financial home lab | Windows Server, Active Directory, PowerShell", then two or three bullets from work their lab or closed tickets prove, written with the Resume bullets rules. If nothing is proven yet, say what to finish first and write no bullet.
- Experience from non-IT jobs still counts. Rewrite it toward desk skills: helping frustrated customers becomes user support, following procedures becomes working from runbooks, handling cash or records becomes handling sensitive data. Never invent duties, numbers, or titles.
- Certifications: list only ones earned. An in-progress certification may be written as "(in progress, expected Month Year)" only if the student says so.
- ATS basics: standard section headers, no tables, columns, graphics, or photos, one page, and exact keywords from the job posting when the student shares one.
- When they paste a resume, answer in this order: the three biggest fixes in one line each; then up to four rewritten lines as "Before:" then "After:"; then the keywords a Tier 1 help desk or SOC posting expects that are missing; then one Academy skill to finish so the resume gets stronger, taken from their weakest skill. A review may run up to 220 words.
- Never add a count, percent, tool, ticket, or employer that is not in their resume or their verified work.`;
  }
  return `Mode this turn: Need help.
They are new or stuck. One next move. Plain talk. Assume they have never opened Active Directory Users and Computers. Translate desk words the first time (OU = folder, locked out = AD is blocking sign-in). Give a numbered GUI path, max 5 steps. End with one Check: line so they know what done looks like. Do not dump the whole lesson. Do not read the report back. Still never give an unsolved mission answer.`;
}

export type CoachStarter = { ask: string; label: string };

const MISSION_ORDER = Object.keys(MISSION_CATALOG);

function lastTouched(results: Results): MissionCatalogEntry | null {
  let best: { id: string; t: number } | null = null;
  for (const [id, r] of Object.entries(results)) {
    if (!MISSION_CATALOG[id] || !r.at) continue;
    const t = new Date(r.at).getTime();
    if (Number.isNaN(t)) continue;
    if (!best || t > best.t) best = { id, t };
  }
  return best ? MISSION_CATALOG[best.id] : null;
}

function openMission(results: Results, m: MissionCatalogEntry): boolean {
  const r = results[m.id];
  return !r || !r.solved;
}

function nextOpen(results: Results, from?: MissionCatalogEntry): MissionCatalogEntry | null {
  const ids = from
    ? MISSION_ORDER.filter((id) => MISSION_CATALOG[id].challenge === from.challenge)
    : MISSION_ORDER;
  const start = from ? Math.max(0, ids.indexOf(from.id)) : 0;
  for (let i = start; i < ids.length; i++) {
    const m = MISSION_CATALOG[ids[i]];
    if (openMission(results, m)) return m;
  }
  return null;
}

function worstStruggle(results: Results, skip: Set<string>): MissionCatalogEntry | null {
  let best: { m: MissionCatalogEntry; score: number } | null = null;
  for (const m of Object.values(MISSION_CATALOG)) {
    if (skip.has(m.id)) continue;
    const r = results[m.id];
    if (!r) continue;
    const score = (r.solved ? 0 : 8) + r.wrong * 3 + (r.hint ? 2 : 0) + (r.flagged && !r.solved ? 6 : 0);
    if (score < 3) continue;
    if (!best || score > best.score) best = { m, score };
  }
  return best?.m ?? null;
}

function focusMission(results: Results, skip: Set<string>): MissionCatalogEntry | null {
  const gap = summarize(results).focus[0];
  if (!gap) return null;
  return (
    Object.values(MISSION_CATALOG).find((m) => m.skill === gap.key && !skip.has(m.id) && openMission(results, m)) ??
    Object.values(MISSION_CATALOG).find((m) => m.skill === gap.key && !skip.has(m.id)) ??
    null
  );
}

function card(m: MissionCatalogEntry, kind: "left-off" | "stuck" | "focus"): CoachStarter {
  if (kind === "stuck") {
    return {
      ask: `I'm stuck on "${m.title}". Use my report and walk me from there without giving it away.`,
      label: m.title,
    };
  }
  if (kind === "focus") {
    return {
      ask: `The report says I need work on ${SKILLS[m.skill].label}. Help me with "${m.title}" without giving it away.`,
      label: m.title,
    };
  }
  return {
    ask: `I left off on "${m.title}". Pick up from there without giving it away.`,
    label: m.title,
  };
}

/** Three coach tickets from where they left off or where the report says they struggle. */
export function coachStarters(results: Results): CoachStarter[] {
  const skip = new Set<string>();
  const lines: CoachStarter[] = [];
  const add = (m: MissionCatalogEntry | null, kind: "left-off" | "stuck" | "focus") => {
    if (!m || skip.has(m.id) || lines.length >= 3) return;
    skip.add(m.id);
    lines.push(card(m, kind));
  };

  const last = lastTouched(results);
  add(last && openMission(results, last) ? last : nextOpen(results, last ?? undefined), "left-off");
  add(worstStruggle(results, skip), "stuck");
  add(focusMission(results, skip), "focus");
  add(nextOpen(results), "left-off");
  return lines.slice(0, 3);
}

/** Starters for Job prep: the mock interview, resume help, and their weak spot. */
export function interviewStarters(results: Results): CoachStarter[] {
  const lines: CoachStarter[] = [
    { ask: "Start my mock Tier 1 interview.", label: "Start my mock interview" },
    { ask: "Turn the work I have finished into resume lines for a Tier 1 help desk or SOC role.", label: "Write my resume lines" },
    {
      ask: "Review my resume for a Tier 1 help desk or junior SOC role. I will paste it in my next message.",
      label: "Review my resume",
    },
  ];
  const gap = summarize(results).focus[0];
  if (gap) {
    lines.push({
      ask: `Interview me on ${gap.label}. That is my weakest area on the readiness report.`,
      label: `Interview me on ${gap.label}`,
    });
  }
  const last = lastTouched(results);
  if (last) {
    lines.push({
      ask: `Ask me to walk you through how I handled "${last.title}".`,
      label: `Walk me through "${last.title}"`,
    });
  }
  return lines.slice(0, 4);
}

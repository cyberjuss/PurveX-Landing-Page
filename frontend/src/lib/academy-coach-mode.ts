import { MISSION_CATALOG, type MissionCatalogEntry } from "@/lib/academy-missions";
import { SKILLS, summarize, type Results } from "@/lib/academy-score";

export const COACH_MODES = ["walkthrough", "check", "mentor"] as const;
export type CoachMode = (typeof COACH_MODES)[number];

export const DEFAULT_COACH_MODE: CoachMode = "walkthrough";

export const COACH_MODE_LABELS: Record<CoachMode, string> = {
  walkthrough: "Need help",
  check: "Double-check",
  mentor: "Mentor",
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
  return `Mode this turn: Need help.
The readiness report put them here as a beginner: lost, new, or struggling. Start from the student brief / readiness report: name the lesson or ticket they are on, what the report already shows (tries, hint, last lab), then the single next click. Assume they have never opened Active Directory Users and Computers. Translate desk words the first time (OU = folder, locked out = AD is blocking sign-in). Give a numbered GUI path, max 5 steps. End with one Check: line so they know what "done" looks like. Do not dump the whole lesson. Still never give an unsolved mission answer.`;
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
    const score = (r.solved ? 0 : 8) + r.wrong * 3 + (r.hint ? 2 : 0);
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

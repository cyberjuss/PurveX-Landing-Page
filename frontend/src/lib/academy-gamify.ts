// XP, streaks, stars and analyst ranks for the challenges and the labs. Dev
// only for now: GAMIFY_ON is false in a production build unless
// NEXT_PUBLIC_GAMIFY=on, so nothing here reaches students until it is turned
// on deliberately.
//
// Challenge XP is worked out from the results the portal already keeps
// (solved, wrong guesses, hint, lab confirmed), so it needs no storage of its
// own and cannot drift from the readiness score. Lab XP comes from the
// "Check yourself" questions, which have no server record, so it is kept in
// this browser.

import { LAB_GATED_MISSIONS } from "@/lib/academy-missions";
import { loadResults, type MissionResult, type Results } from "@/lib/academy-score";

export const GAMIFY_ON = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_GAMIFY === "on";

/** Fired with an XpAward when XP is earned, for the toast. */
export const XP_EVENT = "academy-xp";
/** Fired when lab XP changes, so a HUD can re-read it. */
export const GAMIFY_CHANGED = "academy-gamify-changed";

export type XpLine = { label: string; xp: number };
export type XpAward = { title: string; lines: XpLine[]; stars?: number; big?: boolean };

// ---- Challenges ----------------------------------------------------------

const BASE = 100;
const FIRST_TRY = 25;
const HINT = -25;
const WRONG = -15;
const WRONG_CAP = 3;
const LAB_SEEN = 25;
const LAB_VERIFIED = 25;

const labGated = (id: string) => LAB_GATED_MISSIONS.includes(id);

/** What a solved ticket earned, line by line. An unsolved one earns nothing. */
export function missionLines(id: string, r: MissionResult | undefined): XpLine[] {
  if (!r?.solved) return [];
  const lines: XpLine[] = [{ label: "Solved", xp: BASE }];
  if (!r.wrong && !r.hint) lines.push({ label: "First try", xp: FIRST_TRY });
  if (r.hint) lines.push({ label: "Hint used", xp: HINT });
  if (r.wrong) lines.push({ label: `${Math.min(r.wrong, WRONG_CAP)} wrong ${r.wrong === 1 ? "guess" : "guesses"}`, xp: WRONG * Math.min(r.wrong, WRONG_CAP) });
  if (labGated(id) && r.labOk) lines.push({ label: "Lab change confirmed", xp: LAB_SEEN });
  if (labGated(id) && r.labVerified) lines.push({ label: "Verified by Range", xp: LAB_VERIFIED });
  return lines;
}

export const sumXp = (lines: XpLine[]) => Math.max(0, lines.reduce((n, l) => n + l.xp, 0));
export const missionXp = (id: string, r: MissionResult | undefined) => sumXp(missionLines(id, r));
export const missionMax = (id: string) => BASE + FIRST_TRY + (labGated(id) ? LAB_SEEN + LAB_VERIFIED : 0);

/** Stars for a share of the XP on offer: 3 at 90%, 2 at 60%, otherwise 1. */
export const starsFor = (earned: number, max: number) => (max <= 0 ? 0 : earned / max >= 0.9 ? 3 : earned / max >= 0.6 ? 2 : 1);

export type ChallengeStats = { earned: number; max: number; solved: number; total: number; streak: number; stars: number };

/** One challenge's tickets, in order: XP, how many solved, and the current first-try streak. */
export function challengeStats(ids: string[], results: Results = loadResults()): ChallengeStats {
  let earned = 0;
  let max = 0;
  let solved = 0;
  let streak = 0;
  for (const id of ids) {
    const r = results[id];
    earned += missionXp(id, r);
    max += missionMax(id);
    if (!r?.solved) continue;
    solved++;
    streak = !r.wrong && !r.hint ? streak + 1 : 0;
  }
  return { earned, max, solved, total: ids.length, streak, stars: solved === ids.length && ids.length ? starsFor(earned, max) : 0 };
}

// ---- Labs ----------------------------------------------------------------

const LAB_KEY = "academy-gamify-v1";
const CHECK_RIGHT = 40;
const CHECK_WRONG = 10;
const PREDICT = 10;
const LAB_CLEAR = 100;

type LabStore = { checks: Record<string, { graded: boolean; ok: boolean }>; cleared: Record<string, number> };

function loadLab(): LabStore {
  try {
    const raw = window.localStorage.getItem(LAB_KEY);
    const s = raw ? (JSON.parse(raw) as Partial<LabStore>) : {};
    return { checks: s.checks ?? {}, cleared: s.cleared ?? {} };
  } catch {
    return { checks: {}, cleared: {} };
  }
}

function saveLab(s: LabStore, notify = true) {
  try {
    window.localStorage.setItem(LAB_KEY, JSON.stringify(s));
  } catch {}
  if (notify) window.dispatchEvent(new Event(GAMIFY_CHANGED));
}

const award = (a: XpAward) => window.dispatchEvent(new CustomEvent<XpAward>(XP_EVENT, { detail: a }));

/** A lab's self-checks, read from its markdown: which are graded questions and which are predictions. */
export function labChecks(markdown: string): { id: string; graded: boolean }[] {
  return [...markdown.matchAll(/<div class="ad-check[^"]*"([^>]*)>/g)].flatMap((m) => {
    const id = /data-check="([^"]+)"/.exec(m[1])?.[1];
    return id ? [{ id, graded: /data-answer=/.test(m[1]) }] : [];
  });
}

/** Records a first answer to a self-check and pays its XP. Answers after the first are ignored. */
export function recordCheck(lab: string, id: string, graded: boolean, ok: boolean) {
  if (!GAMIFY_ON) return;
  const s = loadLab();
  const key = `${lab}:${id}`;
  if (s.checks[key]) return;
  s.checks[key] = { graded, ok };
  // Saved quietly first, so the toast counts this answer, then announced, so
  // a lab this answer clears says so after it and not before.
  saveLab(s, false);
  award(
    graded
      ? { title: ok ? "Correct" : "Not quite", lines: [{ label: ok ? "Check answered right" : "Check answered", xp: ok ? CHECK_RIGHT : CHECK_WRONG }] }
      : { title: "Prediction locked", lines: [{ label: "Committed before the lab", xp: PREDICT }] }
  );
  window.dispatchEvent(new Event(GAMIFY_CHANGED));
}

export type LabStats = { earned: number; max: number; answered: number; graded: number; right: number; stars: number; cleared: boolean };

export function labStats(lab: string, checks: { id: string; graded: boolean }[]): LabStats {
  const s = loadLab();
  let earned = 0;
  let max = LAB_CLEAR;
  let answered = 0;
  let graded = 0;
  let right = 0;
  for (const c of checks) {
    max += c.graded ? CHECK_RIGHT : PREDICT;
    if (c.graded) graded++;
    const got = s.checks[`${lab}:${c.id}`];
    if (!got) continue;
    if (c.graded) answered++;
    if (c.graded && got.ok) right++;
    earned += c.graded ? (got.ok ? CHECK_RIGHT : CHECK_WRONG) : PREDICT;
  }
  const cleared = lab in s.cleared;
  if (cleared) earned += LAB_CLEAR;
  return { earned, max, answered, graded, right, stars: cleared ? s.cleared[lab] : 0, cleared };
}

/** Clears a lab once every graded check is answered: pays the bonus and rates it. Returns true the first time. */
export function clearLab(lab: string, checks: { id: string; graded: boolean }[]): boolean {
  if (!GAMIFY_ON) return false;
  const st = labStats(lab, checks);
  if (st.cleared || !st.graded || st.answered < st.graded) return false;
  const stars = st.right === st.graded ? 3 : st.right / st.graded >= 0.6 ? 2 : 1;
  const s = loadLab();
  s.cleared[lab] = stars;
  saveLab(s);
  award({ title: "Lab cleared", lines: [{ label: `${st.right} of ${st.graded} checks right`, xp: LAB_CLEAR }], stars, big: true });
  return true;
}

// ---- Ranks ---------------------------------------------------------------

export const RANKS: { at: number; title: string }[] = [
  { at: 0, title: "Trainee" },
  { at: 400, title: "Tier 1 Analyst" },
  { at: 1200, title: "Tier 1 Senior" },
  { at: 2500, title: "Tier 2 Analyst" },
  { at: 4500, title: "Tier 2 Senior" },
  { at: 7000, title: "Incident Lead" },
];

/** Every XP earned so far: challenge tickets plus labs. */
export function totalXp(): number {
  const results = loadResults();
  let n = 0;
  for (const [id, r] of Object.entries(results)) n += missionXp(id, r);
  const s = loadLab();
  for (const c of Object.values(s.checks)) n += c.graded ? (c.ok ? CHECK_RIGHT : CHECK_WRONG) : PREDICT;
  n += Object.keys(s.cleared).length * LAB_CLEAR;
  return n;
}

/** The rank for an XP total, and how far it is to the next one. */
export function rankFor(xp: number) {
  let i = 0;
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1].at) i++;
  const next = RANKS[i + 1];
  return { index: i, title: RANKS[i].title, next: next?.title ?? null, pct: next ? (xp - RANKS[i].at) / (next.at - RANKS[i].at) : 1, toNext: next ? next.at - xp : 0 };
}

export function awardMission(id: string, r: MissionResult | undefined) {
  if (!GAMIFY_ON) return;
  const lines = missionLines(id, r);
  if (lines.length) award({ title: "Ticket closed", lines });
}

export function awardChallenge(stats: ChallengeStats) {
  if (!GAMIFY_ON) return;
  award({ title: "Challenge cleared", lines: [{ label: `${stats.earned} of ${stats.max} XP on offer`, xp: 0 }], stars: stats.stars, big: true });
}

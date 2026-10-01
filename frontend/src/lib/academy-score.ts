// Readiness score for Operation Day One, the Ticket Queue, and The 2 AM Login.
// Results are cached in the browser (localStorage) and saved to the account,
// keyed by the mission's data-id.

export type Skill = "accounts" | "directory" | "troubleshooting" | "security";

export const SKILLS: Record<Skill, { label: string; advice: string }> = {
  accounts: {
    label: "Accounts and Groups",
    advice: "Read the Member Of tab and count the members before changing a group.",
  },
  directory: {
    label: "Directory Navigation",
    advice: "Find objects under Departments and AccessLevels by browsing the tree instead of using Find.",
  },
  troubleshooting: {
    label: "Troubleshooting and Verification",
    advice: "Open the account first, and trust what the directory shows over what the caller says.",
  },
  security: {
    label: "Security Response",
    advice: "Read the log before changing anything, contain the problem first, and keep the evidence.",
  },
};

// mission id -> skill. d1 = Operation Day One, tq = Ticket Queue.
export const MISSION_SKILLS: Record<string, Skill> = {
  "d1-01": "accounts",
  "d1-02": "accounts",
  "d1-03": "directory",
  "d1-04": "directory",
  "d1-05": "accounts",
  "d1-06": "accounts",
  "d1-07": "accounts",
  "d1-08": "directory",
  "d1-09": "accounts",
  "d1-10": "directory",
  "tq-01": "accounts",
  "tq-02": "troubleshooting",
  "tq-03": "accounts",
  "tq-04": "troubleshooting",
  "tq-05": "troubleshooting",
  "tq-06": "security",
  "tq-07": "security",
  "tq-08": "security",
  "tq-09": "security",
  "tq-10": "security",
};

/** Browser labs passed with 70% or more, kept with mission results so the portfolio can read them. */
export const LAB_PASS_IDS = ["lab-risk-triage", "lab-hash-verify", "lab-password-table", "lab-signin-log", "lab-effective-access"] as const;
export type LabPassId = (typeof LAB_PASS_IDS)[number];
const isLabPass = (id: string) => (LAB_PASS_IDS as readonly string[]).includes(id);

/** Mission results only, without passed labs. */
export function missionResults(results: Results): Results {
  return Object.fromEntries(Object.entries(results).filter(([id]) => id in MISSION_SKILLS));
}

export type MissionResult = { solved: boolean; wrong: number; hint: boolean; flagged?: boolean; /** The change this ticket needs was seen in the student's lab. */ labOk?: boolean; at?: string };
export type Results = Record<string, MissionResult>;

export const RESULTS_STORAGE_KEY = "academy-results-v1";
const KEY = RESULTS_STORAGE_KEY;

export function loadResults(): Results {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Results) : {};
  } catch {
    return {};
  }
}

export function saveResults(r: Results) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(r));
  } catch {}
}

export function clearResults() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {}
}

// Points for one mission. null means it is still in progress.
export function missionPoints(r: MissionResult | undefined): number | null {
  if (!r) return null;
  if (r.solved) {
    const base = [100, 70, 40, 0][Math.min(r.wrong, 3)];
    return Math.max(0, base - (r.hint ? 10 : 0));
  }
  return r.wrong >= 3 ? 0 : null;
}

export type SkillRow = {
  key: Skill;
  label: string;
  /** Average points on this skill's finished missions. null until one is finished. */
  score: number | null;
  done: number;
  total: number;
  /** At least half its missions are finished, so the score is enough to call it solid or weak. */
  rated: boolean;
};

export type Summary = {
  /** Readiness: points earned out of points possible on every mission. Unfinished missions count as 0. */
  overall: number;
  /** Average points on the missions finished so far. null until one is finished. */
  accuracy: number | null;
  finished: number;
  total: number;
  level: "none" | "progress" | "ready" | "almost" | "practice";
  skills: SkillRow[];
  focus: { key: Skill; label: string; advice: string; score: number | null; rated: boolean }[];
};

/** Competent / Almost Ready. Coach focus and the report use the same cut. */
export const SCORE_SOLID = 65;
/** Ready: overall must hit this, and no skill may sit under SCORE_SOLID. */
export const SCORE_READY = 85;

export function skillSolid(score: number | null): boolean {
  return score !== null && score >= SCORE_SOLID;
}

export function skillNeedsWork(score: number | null): boolean {
  return !skillSolid(score);
}

/** Competent: enough missions finished to judge, and at the bar. */
export function skillCompetent(k: Pick<SkillRow, "score" | "rated">): boolean {
  return k.rated && skillSolid(k.score);
}

/** Weak: enough missions finished to judge, and under the bar. */
export function skillWeak(k: Pick<SkillRow, "score" | "rated">): boolean {
  return k.rated && !skillSolid(k.score);
}

export function scoreTone(score: number | null): "good" | "warn" | "bad" | "none" {
  if (score === null) return "none";
  return score >= SCORE_READY ? "good" : score >= SCORE_SOLID ? "warn" : "bad";
}

export function summarize(results: Results): Summary {
  const ids = Object.keys(MISSION_SKILLS);
  const total = ids.length;
  let sum = 0;
  let finished = 0;
  const per: Record<Skill, { sum: number; done: number; total: number }> = {
    accounts: { sum: 0, done: 0, total: 0 },
    directory: { sum: 0, done: 0, total: 0 },
    troubleshooting: { sum: 0, done: 0, total: 0 },
    security: { sum: 0, done: 0, total: 0 },
  };
  for (const id of ids) {
    const skill = MISSION_SKILLS[id];
    per[skill].total += 1;
    const p = missionPoints(results[id]);
    if (p !== null) {
      finished += 1;
      sum += p;
      per[skill].sum += p;
      per[skill].done += 1;
    }
  }
  // Readiness counts every mission, so it only reaches 100 when all are done cleanly.
  // Accuracy and skill scores average only what is finished.
  const overall = Math.round(sum / total);
  const accuracy = finished ? Math.round(sum / finished) : null;
  const skills: SkillRow[] = (Object.keys(per) as Skill[]).map((key) => ({
    key,
    label: SKILLS[key].label,
    score: per[key].done === 0 ? null : Math.round(per[key].sum / per[key].done),
    done: per[key].done,
    total: per[key].total,
    rated: per[key].done >= Math.ceil(per[key].total / 2),
  }));
  // Focus areas, at most two: weak skills first (weakest first), then skills with
  // too few missions to judge, then skills not started.
  const rank = (k: SkillRow) => (skillWeak(k) ? 0 : k.score !== null ? 1 : 2);
  const focus = skills
    .filter((k) => !skillCompetent(k))
    .sort((a, b) => rank(a) - rank(b) || (a.score ?? 0) - (b.score ?? 0))
    .slice(0, 2)
    .map((k) => ({ key: k.key, label: k.label, advice: SKILLS[k.key].advice, score: k.score, rated: k.rated }));
  let level: Summary["level"] = "none";
  if (finished > 0) level = "progress";
  if (finished === total) {
    // Ready needs a strong total and every skill at the same bar the verdict calls competent.
    const weakest = Math.min(...skills.map((k) => k.score ?? 0));
    level = overall >= SCORE_READY && weakest >= SCORE_SOLID ? "ready" : overall >= SCORE_SOLID ? "almost" : "practice";
  }
  return { overall, accuracy, finished, total, level, skills, focus };
}

/**
 * `labOk` says the server saw a ticket's change in the student's lab. Only the server may set it,
 * so it is dropped from anything a browser sends and kept only when reading what the server saved.
 */
export function sanitizeResults(raw: unknown, trustLabOk = false): Results {
  if (!raw || typeof raw !== "object") return {};
  const out: Results = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!(id in MISSION_SKILLS || isLabPass(id)) || !value || typeof value !== "object") continue;
    const v = value as Record<string, unknown>;
    const at = typeof v.at === "string" && !Number.isNaN(new Date(v.at).getTime()) ? new Date(v.at).toISOString() : undefined;
    const flagged = v.flagged === true && v.solved !== true;
    out[id] = {
      solved: v.solved === true,
      wrong: Math.min(3, Math.max(0, Math.floor(Number(v.wrong) || 0))),
      hint: v.hint === true,
      ...(flagged ? { flagged: true } : {}),
      ...(trustLabOk && v.labOk === true ? { labOk: true } : {}),
      ...(at ? { at } : {}),
    };
  }
  return out;
}

export const LEVELS: Record<Summary["level"], { label: string; note: string }> = {
  none: { label: "Not started", note: "Answer missions in Operation Day One, the Ticket Queue, and The 2 AM Login to build your score." },
  progress: { label: "In progress", note: "Readiness counts every mission, so it grows as you finish more. Accuracy shows how you did on the ones you finished." },
  ready: { label: "Ready", note: "You met the bar on every mission and every competency. Keep going as new labs open." },
  almost: { label: "Almost Ready", note: "Solid base. Tighten the focus areas below and retake the missions you missed." },
  practice: { label: "Keep Practicing", note: "You have the start. Work through the focus areas below, then retake the challenges." },
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Compact card at the top of each challenge. The full breakdown and the
// coach live on the Readiness page.
export function scorecardHtml(s: Summary): string {
  const lv = LEVELS[s.level];
  const gap = s.finished > 0 ? s.focus[0] : undefined;
  const line = !gap
    ? `${s.finished} of ${s.total} missions finished`
    : gap.rated
      ? `Biggest gap: ${esc(gap.label)}`
      : `Next up: ${esc(gap.label)}`;
  return `<div class="ad-score__top"><div class="ad-score__ring ad-score__ring--${s.level}"><span>${
    s.finished === 0 ? "––" : s.overall
  }</span></div><div class="ad-score__head"><span class="ad-score__eyebrow">Readiness</span><strong>${
    lv.label
  }</strong><small>${line}</small></div><a class="ad-score__link" href="/range/readiness">Open report →</a></div>`;
}

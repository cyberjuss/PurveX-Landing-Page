// Help desk readiness score for the two Home Lab challenges. Results live in
// the browser only (localStorage), keyed by the mission's data-id.

export type Skill = "accounts" | "directory" | "troubleshooting" | "security";

export const SKILLS: Record<Skill, { label: string; advice: string }> = {
  accounts: {
    label: "Accounts and Groups",
    advice: "Read the Member Of tab and count the members before you change a group.",
  },
  directory: {
    label: "Directory Navigation",
    advice: "Find objects under Departments and AccessLevels without using Find.",
  },
  troubleshooting: {
    label: "Troubleshooting and Verification",
    advice: "Open the account first. Believe the directory, not the caller.",
  },
  security: {
    label: "Security Response",
    advice: "Read the log before you change anything. Contain first. Keep the evidence.",
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

export type Summary = {
  overall: number;
  finished: number;
  total: number;
  level: "none" | "progress" | "ready" | "almost" | "practice";
  skills: { key: Skill; label: string; score: number | null; done: number; total: number }[];
  focus: { key: Skill; label: string; advice: string; score: number | null }[];
};

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
  const overall = Math.round(sum / total);
  const skills = (Object.keys(per) as Skill[]).map((key) => ({
    key,
    label: SKILLS[key].label,
    score: per[key].done === 0 ? null : Math.round(per[key].sum / per[key].total),
    done: per[key].done,
    total: per[key].total,
  }));
  // Focus areas: unfinished or below 80, weakest first, at most two.
  const focus = skills
    .filter((s) => s.score === null || s.score < 80)
    .sort((a, b) => (a.score ?? -1) - (b.score ?? -1))
    .slice(0, 2)
    .map((s) => ({ key: s.key, label: s.label, advice: SKILLS[s.key].advice, score: s.score }));
  let level: Summary["level"] = "none";
  if (finished > 0) level = "progress";
  if (finished === total) {
    // "Ready" needs a strong total and no weak skill, so one big gap cannot hide behind a good average.
    const weakest = Math.min(...skills.map((k) => k.score ?? 0));
    level = overall >= 85 && weakest >= 60 ? "ready" : overall >= 65 ? "almost" : "practice";
  }
  return { overall, finished, total, level, skills, focus };
}

/**
 * `labOk` says the server saw a ticket's change in the student's lab. Only the server may set it,
 * so it is dropped from anything a browser sends and kept only when reading what the server saved.
 */
export function sanitizeResults(raw: unknown, trustLabOk = false): Results {
  if (!raw || typeof raw !== "object") return {};
  const out: Results = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!(id in MISSION_SKILLS) || !value || typeof value !== "object") continue;
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
  none: { label: "Not started", note: "Answer missions in Operation Day One and the Ticket Queue to build your score." },
  progress: { label: "In progress", note: "Finish every mission to get your readiness rating." },
  ready: { label: "Ready", note: "You met the bar on the missions you have finished. Keep going as new labs open." },
  almost: { label: "Almost Ready", note: "Solid base. Tighten the focus areas below and retake the missions you missed." },
  practice: { label: "Keep Practicing", note: "You have the start. Work through the focus areas below, then retake the challenges." },
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Compact card at the top of each challenge. The full breakdown and the
// coach live on the Readiness page.
export function scorecardHtml(s: Summary): string {
  const lv = LEVELS[s.level];
  const gap = s.finished > 0 ? s.focus[0] : undefined;
  const line = gap ? `Biggest gap: ${esc(gap.label)}` : `${s.finished} of ${s.total} missions finished`;
  return `<div class="ad-score__top"><div class="ad-score__ring ad-score__ring--${s.level}"><span>${
    s.finished === 0 ? "––" : s.overall
  }</span></div><div class="ad-score__head"><span class="ad-score__eyebrow">Readiness</span><strong>${
    lv.label
  }</strong><small>${line}</small></div><a class="ad-score__link" href="/academy/readiness">Open report →</a></div>`;
}

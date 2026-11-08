// Readiness score for every "Challenge:" mission chain across the course.
// Results are cached in the browser (localStorage) and saved to the account,
// keyed by the mission's data-id.

import { CHALLENGE_PATHS, MISSION_CATALOG } from "@/lib/academy-missions";
import { isPhaseLocked } from "@/lib/academy-locks";

export type Skill = "accounts" | "directory" | "troubleshooting" | "security" | "logs" | "access" | "risk";

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
  logs: {
    label: "Log Analysis",
    advice: "Count the events and line up their times before you name a pattern.",
  },
  access: {
    label: "Access Control",
    advice: "Work out access from every group and both share and NTFS permissions, and remove what grants too much.",
  },
  risk: {
    label: "Risk Triage",
    advice: "Name which CIA property failed, then score likelihood and impact before you rank the fix.",
  },
};

// mission id -> skill. d1 = Operation Day One, tq = Ticket Queue.
export const MISSION_SKILLS: Record<string, Skill> = {
  // Weeks 1 to 4: one challenge each, set in the student's own PurveX lab.
  "w3-01": "troubleshooting",
  "w3-02": "security",
  "w3-03": "security",
  "w3-04": "security",
  "w3-05": "security",
  "w4-06": "logs",
  "w4-01": "access",
  "w4-02": "access",
  "w4-03": "access",
  "w4-04": "access",
  "w4-05": "access",
  "w2-01": "security",
  "w2-02": "security",
  "w2-03": "security",
  "w2-04": "accounts",
  "w2-05": "security",
  "w1-01": "security",
  "w1-02": "security",
  "w1-03": "troubleshooting",
  "w1-04": "risk",
  "w1-05": "risk",
  // Home Lab: Build Out the Directory and A New Hire's First Week, the two
  // reading sittings turned into graded challenges.
  "dr-01": "directory",
  "dr-02": "troubleshooting",
  "dr-03": "directory",
  "dr-04": "access",
  "dr-05": "accounts",
  "dr-06": "accounts",
  "dr-07": "access",
  "dr-08": "directory",
  "dr-09": "accounts",
  "dr-10": "security",
  "dr-11": "directory",
  "dr-12": "access",
  "dk-01": "directory",
  "dk-02": "troubleshooting",
  "dk-03": "troubleshooting",
  "dk-04": "accounts",
  "dk-05": "accounts",
  "dk-06": "directory",
  "dk-07": "troubleshooting",
  "dk-08": "directory",
  "dk-09": "troubleshooting",
  "dk-10": "accounts",
  // CIA Triad in Practice: the same client-only "Check Yourself" pattern
  // Week 3's Wireshark labs used before they were converted to real
  // ad-mission tickets so they counted toward readiness. Converted here too.
  // CVSS Vulnerability Scoring: same conversion.
  // Hashing and Encryption with CyberChef: same conversion.
  // Password Hashing and Salting: same conversion.
  // Broken Access Control (PortSwigger): had no graded check at all before,
  // relying entirely on the external platform's own completion state.
  // Authentication Log Analysis: same conversion.
  // Linux Privilege Management with sudo: same conversion.
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
  "tq-11": "accounts",
  "tq-12": "security",
  "tq-13": "security",
  "tq-14": "directory",
  "tq-15": "accounts",
  "tq-16": "troubleshooting",
  "tq-17": "security",
  "tq-18": "directory",
  "tq-19": "security",
  // sm-01/02, bt-01/02/03 and th-01 lived in three challenge files (Approved
  // Overnight, Baseline a Team, the lockout threshold) that were pulled from
  // the Phase 2 Challenges page's sections list. Unlisted means unreachable,
  // not just unlinked, so they are dropped here too -- counting a mission no
  // page can show kept readiness from ever reaching 100.
  "zt-01": "security",
  "zt-02": "security",
  "cp-03": "security",
  "cp-04": "security",
  // Week 3's two Wireshark labs: the Check Yourself questions used to be a
  // client-only self-quiz (academy's self-check.ts), never counted toward
  // readiness. Converted to real ad-mission/ad-guess tickets so they do.
  // No "networking" skill exists; "logs" fits closest -- reading a capture
  // to understand what happened is the same move as reading an event log.
  // Write a Detection: a real Suricata rule, written and run against the
  // same scan the last lab only read by hand.
  // Confirm the Map From the Command Line: Map Your Pod's companion lab,
  // reading the domain controller's own listening ports with PowerShell
  // instead of trusting the drag-and-drop diagram alone.
  "nm-01": "security",
  "nm-02": "security",
  "nm-03": "security",
  // soc-mindset's two labs: a real failed sign-in documented with the 5 W's,
  // and the domain controller's own real default firewall posture, read
  // straight from PowerShell instead of a slide.
  "sm2-01": "logs",
  "sm2-05": "security",
  "sm2-02": "security",
  "sm2-03": "security",
  "sm2-06": "security",
  "sm2-04": "security",
  // Malware week's two labs: a real EICAR test file for signature-based
  // detection, and a real Sysmon process tree for behavior-based detection,
  // matching the week's own Antivirus-then-EDR teaching order.
  "mw2-01": "logs",
  "mw2-06": "security",
  "mw2-07": "logs",
  "mw2-02": "security",
  "mw2-03": "security",
  "mw2-05": "security",
  "mw2-04": "security",
  // Log Analysis Fundamentals' two labs: one real sign-in correlated across
  // both machines' own logs, and PowerShell's own script-block logging
  // turned on and read.
  "la2-01": "logs",
  "la2-05": "logs",
  "la2-02": "logs",
  "la2-03": "logs",
  "la2-06": "logs",
  "la2-04": "logs",
  "tq-20": "troubleshooting",
  "tq-21": "security",
  "tq-22": "security",
  "tq-23": "security",
  "tq-24": "security",
  "tq-25": "directory",
  "tq-06": "security",
  "tq-07": "logs",
  "tq-08": "security",
  "tq-09": "security",
  "tq-10": "security",
  // Week 4's effective-access challenge, replacing the old browser-only
  // "Who Can Open This?" widget with a real audit against the lab's own
  // Compliance Users group.
  // The Nightly Settlement Push (hosted-lab Wireshark capture) and The
  // Mirror That Does Not Match (hash, crack, spot reuse). Real graded
  // challenges that were never added here, so finishing them never moved
  // readiness.
  // The Client Data Review: same gap as above, fixed the same way.
  "cd-01": "security",
  "cd-02": "security",
  "cd-03": "security",
  "cd-04": "security",
  "cd-05": "security",
  "cd-06": "security",
  "cd-07": "accounts",
  // Campaign 1, The Credential Campaign: real events read from the lab's
  // own Security log, plus a KQL detection-writing step and a final
  // Kill Chain mapping.
  "sl-01": "logs",
  "sl-02": "logs",
  "sl-03": "logs",
  "cc-11": "logs",
  "cc-12": "security",
  // Campaign 2, The Phishing Chain: a second real intrusion, this one with
  // a real Delivery artifact to hash against VirusTotal and a real beacon
  // to capture live in Wireshark.
  "rc-01": "logs",
  "dl-01": "security",
  "pc-03": "security",
  "pi-01": "security",
  "pc-05": "logs",
  "pi-02": "security",
  "ao-01": "security",
  "ao-02": "security",
  "pc-10": "security",
  // Campaign 3, The Open Door: the legacy SMB rule, proven in use before it
  // is closed, then the same Installation/C2/Actions-on-Objectives shape
  // behind a different entry point.
  "od-02": "logs",
  "od-04": "security",
  "od-05": "security",
  "od-06": "security",
  "od-07": "security",
  "od-08": "security",
  "od-09": "security",
  // Campaign 4, The Keys to the Domain: Kerberoasting and DCSync, the two
  // techniques CISA's own September 2024 AD-compromise guide names most,
  // plus a real Sysmon-based process-lineage step.
  "rk-01": "logs",
  "rk-02": "security",
  "rk-04": "security",
  "rk-03": "security",
  "rk-05": "security",
  "rk-06": "security",
  "rk-07": "security",
  "rk-08": "logs",
  "rk-09": "security",
  // Questions added to the course without a line here. An id missing from this
  // map is dropped every time progress is read back (sanitizeResults), so the
  // solve vanished on reload and its challenge could never complete.
  // check:range:challenges now fails if a challenge question is left out.
  "sm-01": "security",
  "sm-02": "security",
  "bt-01": "security",
  "bt-02": "security",
  "bt-03": "security",
  "th-01": "security",
  "tr-01": "logs",
  "tr-02": "logs",
  "tr-03": "logs",
  "tr-04": "logs",
  "tr-05": "logs",
  "tr-06": "logs",
  "tr-07": "logs",
  "tr-08": "logs",
};

/**
 * A marker, not a real lab: once a student ever reaches the "Ready" level,
 * this is written `solved: true` and never unwritten. The course keeps
 * growing (new challenges land in MISSION_SKILLS all the time), which moves
 * `total` in `summarize` below and would otherwise quietly pull a student
 * back out of "Ready" for no reason of their own -- new content shipping is
 * not something they did wrong. This id rides the exact same storage path
 * as a scored lab (sanitizeResults keeps it, the progress API's merge only
 * ever ORs `solved` forward, never back), so it is just as safe against the
 * same client-overwrite and sync-failure risks as everything else here,
 * with no new storage or schema of its own.
 */
export const READY_BADGE_ID = "readiness-badge-ready";

/**
 * The highest Readiness score this student has ever had, in pts. Readiness is
 * points earned out of every challenge in the course, so each new challenge
 * that ships lowers everyone's percentage though nobody did anything wrong.
 * The score a student sees never goes below this. Written by the server alone
 * (pinReadiness, on every progress save), never taken from a browser.
 */
export const READINESS_BEST_ID = "readiness-best";
/** Rows only the server writes. A browser's copy of these is ignored. */
export const SERVER_MARKER_IDS: readonly string[] = [READY_BADGE_ID, READINESS_BEST_ID];

/** Browser labs passed with 70% or more, kept with mission results so the portfolio can read them. */
export const LAB_PASS_IDS = [READY_BADGE_ID] as const;
export type LabPassId = (typeof LAB_PASS_IDS)[number];
const isLabPass = (id: string) => (LAB_PASS_IDS as readonly string[]).includes(id);

/** Browser labs that count toward readiness, scored by the points they earned the first time they were finished. */
export const LAB_SKILLS: Partial<Record<LabPassId, Skill>> = {};

/** The scored labs, for the readiness report. href opens the lab's tab. */
export const LAB_CATALOG: { id: LabPassId; title: string; skill: Skill; href: string }[] = [];

/** The phase a mission belongs to, read from where its challenge lives. */
export function missionPhase(id: string): string | undefined {
  const challenge = MISSION_CATALOG[id]?.challenge;
  return challenge ? CHALLENGE_PATHS[challenge]?.href.split("/")[2] : undefined;
}

/**
 * Everything readiness counts: missions and scored labs, minus anything in a
 * phase that is still coming soon. A student cannot do work that is locked,
 * so counting it would keep everyone short of 100 and of Ready.
 */
export const SCORED_SKILLS: Record<string, Skill> = Object.fromEntries(
  Object.entries({ ...MISSION_SKILLS, ...(LAB_SKILLS as Record<string, Skill>) }).filter(([id]) => {
    const phase = missionPhase(id);
    return !phase || !isPhaseLocked(phase);
  })
);

/** Mission results only, without passed labs. */
export function missionResults(results: Results): Results {
  return Object.fromEntries(Object.entries(results).filter(([id]) => id in MISSION_SKILLS));
}

export type MissionResult = {
  solved: boolean;
  wrong: number;
  hint: boolean;
  flagged?: boolean;
  /** The change this ticket needs was seen in the student's lab. */
  labOk?: boolean;
  /** And Range confirmed it by asking the lab directly, not from the lab's own report. */
  labVerified?: boolean;
  /** Browser labs only: percent of the lab's points the first time it was finished. */
  pts?: number;
  at?: string;
};
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

/** A lab pass saved before labs kept a score. 70% is the least a pass could be. */
export const LEGACY_LAB_PASS_POINTS = 70;

/** Points for a scored lab. null until it is finished. */
export function labPoints(r: MissionResult | undefined): number | null {
  if (!r) return null;
  if (typeof r.pts === "number") return r.pts;
  return r.solved ? LEGACY_LAB_PASS_POINTS : null;
}

/** Points for anything readiness counts, mission or lab. */
export function itemPoints(id: string, r: MissionResult | undefined): number | null {
  return id in LAB_SKILLS ? labPoints(r) : missionPoints(r);
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
  const ids = Object.keys(SCORED_SKILLS);
  const total = ids.length;
  let sum = 0;
  let finished = 0;
  const per = Object.fromEntries((Object.keys(SKILLS) as Skill[]).map((k) => [k, { sum: 0, done: 0, total: 0 }])) as Record<
    Skill,
    { sum: number; done: number; total: number }
  >;
  for (const id of ids) {
    const skill = SCORED_SKILLS[id];
    per[skill].total += 1;
    const p = itemPoints(id, results[id]);
    if (p !== null) {
      finished += 1;
      sum += p;
      per[skill].sum += p;
      per[skill].done += 1;
    }
  }
  // Readiness counts every mission, so it only reaches 100 when all are done cleanly.
  // Accuracy and skill scores average only what is finished.
  // Floored at the best this student has had, so new challenges never take points away.
  const overall = Math.max(Math.round(sum / total), readinessBest(results));
  const accuracy = finished ? Math.round(sum / finished) : null;
  // A skill with nothing open to practice yet is left out, so it can neither
  // block Ready nor be suggested as something to work on.
  const skills: SkillRow[] = (Object.keys(per) as Skill[]).filter((key) => per[key].total > 0).map((key) => ({
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
  // New challenges land in MISSION_SKILLS often, which grows `total` for
  // everyone the moment they ship. A student who already reached Ready
  // under a smaller course did not get worse; the course got bigger. Once
  // earned, Ready floors the level here for good -- see READY_BADGE_ID.
  if (level !== "ready" && hasReadyBadge(results)) level = "ready";
  return { overall, accuracy, finished, total, level, skills, focus };
}

/** The highest Readiness score on record for this student. See READINESS_BEST_ID. */
export function readinessBest(results: Results): number {
  const pts = results[READINESS_BEST_ID]?.pts;
  return typeof pts === "number" ? pts : 0;
}

/**
 * Before a save on the server: record the Readiness score and the Ready level
 * this student has now, so neither can drop later. Only ever raises them.
 */
export function pinReadiness(results: Results): Results {
  const s = summarize(results);
  const out = { ...results };
  if (s.finished > 0 && s.overall > readinessBest(results)) out[READINESS_BEST_ID] = { solved: true, wrong: 0, hint: false, pts: s.overall, at: new Date().toISOString() };
  if (s.level === "ready" && !hasReadyBadge(results)) out[READY_BADGE_ID] = { solved: true, wrong: 0, hint: false, pts: 100, at: new Date().toISOString() };
  return out;
}

/** Whether this student has ever reached Ready, regardless of what the live total says now. */
export function hasReadyBadge(results: Results): boolean {
  return Boolean(results[READY_BADGE_ID]?.solved);
}

/**
 * `labOk` says the server saw a ticket's change in the student's lab. Only the server may set it,
 * so it is dropped from anything a browser sends and kept only when reading what the server saved.
 */
export function sanitizeResults(raw: unknown, trustLabOk = false): Results {
  if (!raw || typeof raw !== "object") return {};
  const out: Results = {};
  for (const [id, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!(id in MISSION_SKILLS || isLabPass(id) || id === READINESS_BEST_ID) || !value || typeof value !== "object") continue;
    const v = value as Record<string, unknown>;
    const at = typeof v.at === "string" && !Number.isNaN(new Date(v.at).getTime()) ? new Date(v.at).toISOString() : undefined;
    const flagged = v.flagged === true && v.solved !== true;
    out[id] = {
      solved: v.solved === true,
      wrong: Math.min(3, Math.max(0, Math.floor(Number(v.wrong) || 0))),
      hint: v.hint === true,
      ...(flagged ? { flagged: true } : {}),
      ...(trustLabOk && v.labOk === true ? { labOk: true } : {}),
      ...(trustLabOk && v.labOk === true && v.labVerified === true ? { labVerified: true } : {}),
      ...((isLabPass(id) || id === READINESS_BEST_ID) && typeof v.pts === "number" && Number.isFinite(v.pts) ? { pts: Math.min(100, Math.max(0, Math.round(v.pts))) } : {}),
      ...(at ? { at } : {}),
    };
  }
  return out;
}

export const LEVELS: Record<Summary["level"], { label: string; note: string }> = {
  none: { label: "Not started", note: "Answer missions in Operation Day One, the Ticket Queue, and the Phase 2 campaigns to build your score." },
  progress: { label: "In progress", note: "Readiness counts every mission, so it grows as you finish more. Accuracy shows how you did on the ones you finished." },
  ready: { label: "Ready", note: "You met the bar on every mission and every competency, so keep going as new labs open." },
  almost: { label: "Almost Ready", note: "You have a solid base, so tighten the focus areas below and retake the missions you missed." },
  practice: { label: "Keep Practicing", note: "You have made a start, so work through the focus areas below and retake the challenges." },
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Compact card at the top of each challenge. The full breakdown and the
// coach live on the Readiness page.
export function scorecardHtml(s: Summary): string {
  const lv = LEVELS[s.level];
  const gap = s.finished > 0 ? s.focus[0] : undefined;
  const line = !gap
    ? `${s.finished} of ${s.total} missions and labs finished`
    : gap.rated
      ? `Biggest gap: ${esc(gap.label)}`
      : `Next up: ${esc(gap.label)}`;
  return `<div class="ad-score__top"><div class="ad-score__ring ad-score__ring--${s.level}"><span>${
    s.finished === 0 ? "––" : s.overall
  }</span></div><div class="ad-score__head"><span class="ad-score__eyebrow">Readiness</span><strong>${
    lv.label
  }</strong><small>${line}</small></div><a class="ad-score__link" href="/range/readiness">Open report →</a></div>`;
}

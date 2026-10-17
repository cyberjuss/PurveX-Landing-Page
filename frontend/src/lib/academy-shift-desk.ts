import "server-only";
import { seeded, shuffle } from "@/lib/academy-drills";
import { ROSTER, SHIFT_SECONDS, type IncidentRun, type Severity, type Staff } from "@/lib/academy-shift";

// The desk around the incidents. A real shift is not only alerts: people call,
// managers ask for status, and someone always has an "urgent" request that is
// not. These desk events arrive on the shift's clock, are answered in the
// console, and are graded here, deterministically, against reasoning that is
// written down with its source. Nothing in this file touches the lab.
//
// Sources the reasoning rests on:
// - CISA and FBI advisory AA23-320A (Scattered Spider): the actors "conduct
//   spearphishing calls to convince IT help desk personnel to reset passwords"
//   and "posed as employees". The MGM Resorts breach is the well-known case.
// - NIST SP 800-63B-4, Sec. 4.2 and 4.6: account recovery "SHALL confirm that
//   the claimant's identity is consistent with the previously established
//   account", and a recovery "SHALL cause a notification to be sent to the
//   subscriber" at the addresses already stored in the account.
// - The lessons themselves: Week 2 "verify the caller with a callback to the
//   number on file, never a number they give you"; Week 4 on resets and
//   escalation; the Shift rule that P1s are worked first.

export type DeskKind = "call" | "ping" | "noise";

type Choice = { id: string; text: string; correct: boolean; why: string };

export type DeskDef = {
  id: string;
  kind: DeskKind;
  /** Earliest drill level (1-4) this can appear at. */
  minLevel: number;
  /** Seconds from arrival to answer before it lapses (the caller hangs up). */
  windowSec: number;
  points: number;
  /** One line Coach says after it is answered, whatever the answer. */
  lesson: string;
  /** Where the reasoning comes from, shown with the feedback. */
  source: string;
  build: (who: Staff) => { from: string; title: string; body: string; choices?: Choice[]; prompt?: string };
};

export const DESK_EVENTS: DeskDef[] = [
  {
    id: "mfa-call",
    kind: "call",
    minLevel: 1,
    windowSec: 120,
    points: 15,
    lesson: "Urgency and inside details are what a social engineer brings. Verify through what the account already has on file, then reset, and the owner is told.",
    source: "CISA AA23-320A · NIST SP 800-63B-4 §4.2, §4.6 · Week 2, Storing Passwords",
    build: (who) => ({
      from: `Caller · says they are ${who.name}, ${who.dept}`,
      title: "Phone: an MFA reset, right now",
      body: `"Hi, it's ${who.name.split(" ")[0]} from ${who.dept}. I got a new phone and my authenticator didn't come across. I'm about to board a flight and I have to approve a payment before we take off. Can you reset my MFA so I can enroll the new phone? I can give you my employee number."`,
      choices: [
        {
          id: "reset",
          text: "Reset it now. They know their department and it is time-critical",
          correct: false,
          why: "Knowing a name and a department is exactly what an attacker gathers first, and the deadline is there to rush you. This is the call CISA describes help desks receiving.",
        },
        {
          id: "kba",
          text: "Take their employee number and date of birth, then reset it",
          correct: false,
          why: "Facts a caller can recite prove only that they found them. They do not show the person on the phone owns the account.",
        },
        {
          id: "their-number",
          text: "Ask for a number to call them back on, then call it and reset",
          correct: false,
          why: "A number the caller gives you is a number the caller controls. The callback has to go to contact details the account already holds.",
        },
        {
          id: "verify",
          text: "Change nothing on this call. Call back on the number already in the directory, reset only if that checks out, and make sure the owner is notified",
          correct: true,
          why: "Recovery has to confirm the caller matches the account as it was established, through details already on file, and the owner gets a notification on a channel separate from the request.",
        },
      ],
    }),
  },
  {
    id: "status-ping",
    kind: "ping",
    minLevel: 1,
    windowSec: 90,
    points: 10,
    lesson: "A good status is one line a manager can repeat: which incident, where it stands, and what you do next.",
    source: "Shift practice · Week 4 and Phase 2 escalation guidance",
    build: () => ({
      from: "Desk lead · Chat",
      title: "Quick status?",
      body: "\"Leadership is asking. One line: what are you on, where is it, what's next?\"",
      prompt: "Your one-line status",
    }),
  },
  {
    id: "urgent-ask",
    kind: "noise",
    minLevel: 2,
    windowSec: 120,
    points: 10,
    lesson: "Severity decides the order, not volume or rank. Acknowledge the person, give an honest time, log it, and go back to the P1.",
    source: "Shift rules: the queue is worked by severity, P1 first",
    build: (who) => ({
      from: `${who.name} · ${who.dept}`,
      title: "URGENT: the conference room screen won't connect",
      body: `"The client presentation starts in ten minutes and the screen in Room 4 won't connect to my laptop. This is URGENT, please come now."`,
      choices: [
        {
          id: "drop",
          text: "Leave the open P1 and go to Room 4 now",
          correct: false,
          why: "A P1 comes first because it can hurt the whole firm. A meeting room screen cannot. Walking away from the P1 is how a small breach becomes a big one.",
        },
        {
          id: "ignore",
          text: "Ignore it until the P1 is closed",
          correct: false,
          why: "Silence makes people escalate around you. A ten-second reply keeps their trust and costs the P1 nothing.",
        },
        {
          id: "ack-log",
          text: "Reply that you are on a priority incident, log a ticket for the screen with an honest time, and stay on the P1",
          correct: true,
          why: "It is real work, just not the most urgent. Acknowledged, logged and timed, it gets done without the P1 paying for it.",
        },
      ],
    }),
  },
];

const deskDef = (id: string) => DESK_EVENTS.find((d) => d.id === id) ?? null;

// ---- a desk event in a run ------------------------------------------------

export type DeskRun = {
  uid: string;
  defId: string;
  kind: DeskKind;
  arriveSec: number;
  windowSec: number;
  /** The staff member it is about, so the wording is fixed for the run. */
  who: string;
  /** Choice ids in the order the student sees them, shuffled per run. */
  order?: string[];
  answeredAtSec: number | null;
  choice?: string | null;
  text?: string;
  /** Filled when answered. */
  score?: number;
  hits?: string[];
  misses?: string[];
};

/**
 * Which desk events a shift gets and when. Level 1 and 2 get the call and the
 * status request; from level 2 the urgent ask lands right after a P1 arrives,
 * so it competes with it. The call comes while the queue is busy, the status
 * request about halfway. Deterministic per seed.
 */
export function planDesk(seed: string, level: number, incidents: Pick<IncidentRun, "uid" | "severity" | "arriveSec" | "bind">[]): DeskRun[] {
  const r = seeded(`${seed}:desk`);
  const taken = new Set(
    incidents
      .map((i) => (i.bind?.args && typeof i.bind.args === "object" ? Object.values(i.bind.args).map(String) : []))
      .flat()
      .map((v) => v.toLowerCase())
  );
  // A caller who is also an incident's victim would contradict the queue, so
  // they are picked from the people the shift is not already about.
  const people = shuffle(r, ROSTER.filter((s) => s.sam !== "alex.rivera" && !taken.has(s.sam)));
  const who = (k: number) => (people.length ? people[k % people.length] : ROSTER[1]);
  const at = (frac: number, jitter: number) => Math.round(SHIFT_SECONDS * frac + (r() - 0.5) * jitter);

  const out: DeskRun[] = [];
  const add = (defId: string, arriveSec: number, k: number) => {
    const def = deskDef(defId)!;
    const order = def.build(who(k)).choices?.map((c) => c.id);
    out.push({
      uid: `${defId}-${out.length}`,
      defId,
      kind: def.kind,
      arriveSec: Math.max(60, Math.min(SHIFT_SECONDS - def.windowSec - 30, arriveSec)),
      windowSec: def.windowSec,
      who: who(k).sam,
      order: order ? shuffle(r, order) : undefined,
      answeredAtSec: null,
    });
  };
  add("mfa-call", at(0.3, 120), 0);
  add("status-ping", at(0.55, 90), 1);
  if (level >= 2) {
    const p1 = incidents.filter((i) => i.severity === "P1").sort((a, b) => a.arriveSec - b.arriveSec)[0];
    add("urgent-ask", p1 ? p1.arriveSec + 25 : at(0.7, 60), 2);
  }
  return out.sort((a, b) => a.arriveSec - b.arriveSec);
}

const staff = (sam: string) => ROSTER.find((s) => s.sam === sam) ?? ROSTER[1];

// ---- what the console sees -------------------------------------------------

export type PublicDesk = {
  uid: string;
  kind: DeskKind;
  from: string;
  title: string;
  body: string;
  prompt: string | null;
  choices: { id: string; text: string }[];
  arriveSec: number;
  secondsLeft: number | null;
  lapsed: boolean;
  answered: boolean;
  /** Only once answered: what they chose, whether it was right, and why. */
  verdict: {
    choice: string | null;
    text: string | null;
    correct: boolean;
    score: number;
    max: number;
    feedback: { id: string; text: string; correct: boolean; why: string }[];
    hits: string[];
    misses: string[];
    lesson: string;
    source: string;
  } | null;
};

export function deskArrived(d: DeskRun, elapsed: number) {
  return elapsed >= d.arriveSec;
}
export function deskLapsed(d: DeskRun, elapsed: number) {
  return d.answeredAtSec === null && elapsed > d.arriveSec + d.windowSec;
}

export function toPublicDesk(d: DeskRun, elapsed: number): PublicDesk | null {
  const def = deskDef(d.defId);
  if (!def || !deskArrived(d, elapsed)) return null;
  const view = def.build(staff(d.who));
  const byId = new Map((view.choices ?? []).map((c) => [c.id, c]));
  const ordered = (d.order ?? []).map((id) => byId.get(id)).filter((c): c is Choice => Boolean(c));
  const answered = d.answeredAtSec !== null;
  const lapsed = deskLapsed(d, elapsed);
  return {
    uid: d.uid,
    kind: d.kind,
    from: view.from,
    title: view.title,
    body: view.body,
    prompt: view.prompt ?? null,
    choices: ordered.map((c) => ({ id: c.id, text: c.text })),
    arriveSec: d.arriveSec,
    secondsLeft: answered || lapsed ? null : Math.max(0, d.arriveSec + d.windowSec - elapsed),
    lapsed,
    answered,
    verdict:
      answered || lapsed
        ? {
            choice: d.choice ?? null,
            text: d.text ?? null,
            correct: (d.score ?? 0) >= def.points,
            score: d.score ?? 0,
            max: def.points,
            feedback: ordered.map((c) => ({ id: c.id, text: c.text, correct: c.correct, why: c.why })),
            hits: d.hits ?? [],
            misses: d.misses ?? (lapsed ? ["No answer before it lapsed"] : []),
            lesson: def.lesson,
            source: def.source,
          }
        : null,
  };
}

// ---- grading ---------------------------------------------------------------

/** A choice event: full points for the right call, none otherwise. */
export function gradeChoice(defId: string, who: string, choice: string): { score: number; correct: boolean } | null {
  const def = deskDef(defId);
  const c = def?.build(staff(who)).choices?.find((x) => x.id === choice);
  if (!def || !c) return null;
  return { score: c.correct ? def.points : 0, correct: c.correct };
}

const STATE = /\b(contain(ed|ing)?|investigat\w*|fix(ed|ing)?|resolv\w*|escalat\w*|working|disabl\w*|reset|unlock\w*|block\w*|clos\w*|monitor\w*|triag\w*|isolat\w*|remov\w*|confirm\w*|check\w*|look\w* into|on it)\b/i;
const NEXT = /\b(next|then|will|going to|eta|by \d|\d+\s*(m|min|mins|minutes?)\b|after (that|this)|once|shortly|soon)\b/i;

/**
 * A one-line status. Three things a lead can act on: which incident (it names
 * one on the queue, by a word from its title, its severity or its person),
 * where it stands, and what comes next. Each is a third of the points.
 */
export function gradeStatus(text: string, open: { title: string; severity: Severity; who?: string }[]): { score: number; hits: string[]; misses: string[] } {
  const t = text.trim();
  const words = new Set(
    open
      .flatMap((o) => [...o.title.toLowerCase().split(/[^a-z0-9]+/), o.severity.toLowerCase(), ...(o.who ? o.who.toLowerCase().split(/[^a-z]+/) : [])])
      .filter((w) => w.length >= 5 || /^p[123]$/.test(w))
  );
  const lower = t.toLowerCase();
  const namesIncident = [...words].some((w) => new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(lower));
  const checks: [boolean, string][] = [
    [namesIncident, "Names the incident"],
    [STATE.test(t), "Says where it stands"],
    [NEXT.test(t), "Says what happens next"],
  ];
  const hits = checks.filter(([ok]) => ok).map(([, l]) => l);
  const misses = checks.filter(([ok]) => !ok).map(([, l]) => l);
  return { score: Math.round((hits.length / 3) * (deskDef("status-ping")?.points ?? 10)), hits, misses };
}

// ---- triage, timing and the after-action timeline --------------------------

const RANK: Record<Severity, number> = { P1: 3, P2: 2, P3: 1 };
export const TRIAGE_POINTS = 15;

export type TriageMiss = { openedUid: string; opened: Severity; waitingUid: string; waiting: Severity; atSec: number };

/**
 * Severity order. Each time an incident is opened, was a more severe one
 * already waiting on the queue, unopened and unfinished? That is a triage miss:
 * the analyst picked up lower-priority work while a higher one sat. Five points
 * off per miss. A queue that never had two things waiting at once has nothing
 * to miss and keeps the full points.
 */
export function triage(incidents: IncidentRun[]): { misses: TriageMiss[]; score: number; max: number } {
  const misses: TriageMiss[] = [];
  const doneAt = (i: IncidentRun) => Math.min(i.resolvedAtSec ?? Infinity, i.escalatedAtSec ?? Infinity);
  for (const opened of incidents) {
    if (opened.ackedAtSec === null) continue;
    const t = opened.ackedAtSec;
    const waiting = incidents
      .filter(
        (o) =>
          o.uid !== opened.uid &&
          RANK[o.severity] > RANK[opened.severity] &&
          o.arriveSec <= t &&
          (o.ackedAtSec === null || o.ackedAtSec > t) &&
          doneAt(o) > t
      )
      .sort((a, b) => RANK[b.severity] - RANK[a.severity] || a.arriveSec - b.arriveSec)[0];
    if (waiting) misses.push({ openedUid: opened.uid, opened: opened.severity, waitingUid: waiting.uid, waiting: waiting.severity, atSec: t });
  }
  return { misses, score: Math.max(0, TRIAGE_POINTS - 5 * misses.length), max: TRIAGE_POINTS };
}

/**
 * Timing, defined here rather than borrowed: vendors disagree on where these
 * clocks start and stop. Time to acknowledge is arrival to first opening.
 * Time to resolve is arrival to the lab showing the fix (escalations excluded,
 * they are a handoff). There is one window, the shift: a breach is an
 * incident that arrived and was still open when the shift ended.
 */
export function shiftMetrics(incidents: IncidentRun[], elapsedEnd: number) {
  const arrived = incidents.filter((i) => i.arriveSec <= elapsedEnd);
  const acks = arrived.filter((i) => i.ackedAtSec !== null).map((i) => i.ackedAtSec! - i.arriveSec);
  const fixes = arrived.filter((i) => i.resolvedAtSec !== null).map((i) => i.resolvedAtSec! - i.arriveSec);
  const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
  const breaches = arrived.filter((i) => {
    const closedAt = Math.min(i.resolvedAtSec ?? Infinity, i.escalatedAtSec ?? Infinity);
    return closedAt - i.arriveSec > i.deadlineSec;
  }).length;
  return { timeToAckSec: avg(acks), timeToResolveSec: avg(fixes), breaches, arrived: arrived.length };
}

export type TimelineItem = { atSec: number; text: string; tone: "info" | "good" | "bad" };

/** Everything that happened, in order, for the after-action review. */
export function shiftTimeline(incidents: IncidentRun[], desk: DeskRun[], titleOf: (i: IncidentRun) => string, elapsedEnd: number): TimelineItem[] {
  const out: TimelineItem[] = [];
  for (const i of incidents) {
    if (i.arriveSec > elapsedEnd) continue;
    const name = `${i.severity} ${titleOf(i)}`;
    out.push({ atSec: i.arriveSec, text: `${name} arrived`, tone: "info" });
    if (i.ackedAtSec !== null) out.push({ atSec: i.ackedAtSec, text: `You opened ${name}`, tone: "info" });
    if (i.resolvedAtSec !== null) {
      out.push({ atSec: i.resolvedAtSec, text: `${name} fixed`, tone: "good" });
    } else if (i.escalatedAtSec != null) {
      out.push({ atSec: i.escalatedAtSec, text: `${name} handed to tier 2`, tone: "info" });
    } else {
      out.push({ atSec: Math.min(elapsedEnd, i.arriveSec + i.deadlineSec), text: `${name} was still open when the shift ended`, tone: "bad" });
    }
  }
  for (const d of desk) {
    if (d.arriveSec > elapsedEnd) continue;
    const def = deskDef(d.defId);
    if (!def) continue;
    const title = def.build(staff(d.who)).title;
    out.push({ atSec: d.arriveSec, text: title, tone: "info" });
    if (d.answeredAtSec !== null) {
      const ok = (d.score ?? 0) >= def.points;
      out.push({ atSec: d.answeredAtSec, text: ok ? "Handled it the right way" : "Answered, but not the way the desk should", tone: ok ? "good" : "bad" });
    } else {
      out.push({ atSec: Math.min(elapsedEnd, d.arriveSec + d.windowSec), text: "No answer before it lapsed", tone: "bad" });
    }
  }
  return out.sort((a, b) => a.atSec - b.atSec);
}

export const deskMax = (desk: DeskRun[]) => desk.reduce((s, d) => s + (deskDef(d.defId)?.points ?? 0), 0);
export const deskScore = (desk: DeskRun[]) => desk.reduce((s, d) => s + (d.score ?? 0), 0);
export { deskDef };

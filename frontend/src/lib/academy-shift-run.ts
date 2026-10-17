import "server-only";
import { HANDOFF_GRADES, handoffReviewer, responseGrader, shiftNarrator, type HandoffReview } from "@/lib/academy-scenario";
import { cleanupShiftLab, hostedLabStatus, injectIncident, requestLabSync } from "@/lib/academy-hosted";
import { roleLabel } from "@/lib/academy-certs";
import { levelFor, type DrillEntry, type Item } from "@/lib/academy-drills";
import type { Results, Skill } from "@/lib/academy-score";
import { loadDrills, loadLabState, loadProfile, loadProgress, loadShift, saveDrill, saveShift } from "@/lib/academy-store";
import { SHIFT_JOB } from "@/lib/academy-proof";
import {
  deskArrived,
  deskLapsed,
  deskMax,
  deskScore,
  gradeChoice,
  gradeStatus,
  planDesk,
  shiftMetrics,
  shiftTimeline,
  toPublicDesk,
  triage,
  type PublicDesk,
  type TimelineItem,
} from "@/lib/academy-shift-desk";
import {
  effectiveIncident,
  gradeIncidentLab,
  HINT_COST,
  incidentArrived,
  incidentDef,
  canAlternate,
  newShiftRun,
  resolvedOnTime,
  scoreIncident,
  shiftElapsed,
  shiftOver,
  SHIFT_SECONDS,
  type IncidentDef,
  type IncidentRun,
  type ShiftMix,
  type ShiftRun,
} from "@/lib/academy-shift";

// Runs a student's Shift: start it, inject each incident into their lab when it
// arrives, take acknowledgements, hints and responses, and grade at the end.
// All timing comes from the shift's start time, so no background timer is needed.

// ---- what the page and MCP see (never the answers) -------------------------

export type PublicIncident = {
  uid: string;
  defId: string;
  kind: "alert" | "ticket";
  severity: "P1" | "P2" | "P3";
  from: string;
  title: string;
  brief: string;
  why: string | null;
  attack: { id: string; name: string } | null;
  diagnosisPrompt: string;
  arriveSec: number;
  deadlineSec: number;
  acknowledged: boolean;
  resolved: boolean;
  /** Handed to tier 2. Closed, off the clock, and scored as a handoff not a fix. */
  escalated: boolean;
  /** Resolved before its deadline. Only meaningful when resolved. */
  onTime: boolean;
  overdue: boolean;
  secondsLeft: number | null;
  hintsUsed: number;
  hintsTotal: number;
  nextHintCostPct: number | null;
  shownHints: string[];
  diagnosis: string;
  responseSaved: boolean;
  /** They have pressed Submit and check at least once, which escalating needs. */
  submitted: boolean;
};

export type IncidentReport = {
  title: string;
  severity: string;
  resolved: boolean;
  escalated: boolean;
  /** They put a finding, a note, a fix or a handoff against it. */
  touched: boolean;
  onTime: boolean;
  noHarm: boolean;
  diagnosisRight: boolean;
  hintsUsed: number;
  score: number;
  max: number;
  /** Tier 2's review, on an escalated incident. */
  review: HandoffReview | null;
};

export type ShiftReport = {
  totalScore: number;
  maxScore: number;
  resolvedCount: number;
  escalatedCount: number;
  onTimeCount: number;
  incidents: IncidentReport[];
  headline: string;
  habit: string;
  /** The desk around the incidents, triage order, timing and the replay. */
  desk: { title: string; correct: boolean; score: number; max: number; lesson: string }[];
  triage: { score: number; max: number; misses: { opened: string; waiting: string; atSec: number }[] };
  metrics: { timeToAckSec: number | null; timeToResolveSec: number | null; breaches: number; arrived: number };
  timeline: TimelineItem[];
};

export type PublicShift = {
  id: string;
  startedAt: string;
  endsAt: string;
  secondsLeft: number;
  phase: number;
  level: number;
  mix: ShiftMix | null;
  status: "active" | "done";
  incidents: PublicIncident[];
  desk: PublicDesk[];
  report: ShiftReport | null;
};

// ---- context --------------------------------------------------------------

function phaseFor(results: Results): number {
  const p2 = ["lab-signin-log", "tq-06", "tq-07", "tq-08", "tq-09", "tq-10"].some((id) => results[id]?.solved);
  return p2 ? 2 : 1;
}

const skillOf = (def: IncidentDef): Skill => (def.kind === "ticket" ? "troubleshooting" : "security");

/** An incident is on the queue once its arrival time has passed and it is not overdue-and-untouched. */
function toPublic(run: ShiftRun, inc: IncidentRun, elapsed: number): PublicIncident | null {
  const def = incidentDef(inc.defId);
  if (!def || !incidentArrived(inc, elapsed)) return null;
  const deadlineAt = inc.arriveSec + inc.deadlineSec;
  const done = inc.resolvedAtSec !== null || inc.escalatedAtSec != null;
  const secondsLeft = done ? null : Math.max(0, deadlineAt - elapsed);
  const eff = effectiveIncident(def, inc);
  // Claude's fresh wording for this shift, when it wrote some; otherwise the bound template.
  const from = inc.text?.from ?? def.from;
  const title = inc.text?.title ?? def.title;
  const brief = inc.text?.brief ?? eff.brief;
  return {
    uid: inc.uid,
    defId: def.id,
    kind: def.kind,
    severity: def.severity,
    from,
    title,
    brief,
    why: def.why ?? null,
    attack: def.attack ?? null,
    diagnosisPrompt: eff.diagnosis.prompt,
    arriveSec: inc.arriveSec,
    deadlineSec: inc.deadlineSec,
    acknowledged: inc.ackedAtSec !== null,
    resolved: inc.resolvedAtSec !== null,
    escalated: inc.escalatedAtSec != null,
    onTime: resolvedOnTime(inc),
    overdue: !done && elapsed > deadlineAt,
    secondsLeft,
    hintsUsed: inc.hintsUsed,
    hintsTotal: def.hints.length,
    nextHintCostPct: inc.hintsUsed < def.hints.length ? Math.round(HINT_COST[inc.hintsUsed] * 100) : null,
    shownHints: def.hints.slice(0, inc.hintsUsed),
    diagnosis: inc.diagnosis,
    responseSaved: inc.response.trim().length > 0,
    submitted: (inc.submits ?? 0) > 0,
  };
}

function publicShift(run: ShiftRun, now = Date.now()): PublicShift {
  const elapsed = shiftElapsed(run, now);
  return {
    id: run.id,
    startedAt: run.startedAt,
    endsAt: run.endsAt,
    secondsLeft: Math.max(0, SHIFT_SECONDS - elapsed),
    phase: run.phase,
    level: run.level,
    mix: run.mix ?? null,
    status: run.status,
    incidents: run.incidents.map((inc) => toPublic(run, inc, elapsed)).filter((x): x is PublicIncident => x !== null),
    desk: (run.desk ?? []).map((d) => toPublicDesk(d, elapsed)).filter((x): x is PublicDesk => x !== null),
    report: run.status === "done" ? buildReport(run) : null,
  };
}

// ---- inject arrived incidents ---------------------------------------------

async function injectArrived(userId: string, run: ShiftRun, elapsed: number): Promise<boolean> {
  let changed = false;
  for (const inc of run.incidents) {
    if (inc.injected || !incidentArrived(inc, elapsed)) continue;
    const def = incidentDef(inc.defId);
    if (!def) continue;
    const ok = await injectIncident(userId, def.script, inc.bind?.args);
    if (ok) {
      inc.injected = true;
      changed = true;
    }
  }
  return changed;
}

// ---- read / start ---------------------------------------------------------

/** The student's shift, driving injection and auto-finishing when time is up. Null if none. */
export async function getShift(userId: string): Promise<PublicShift | null> {
  const run = await loadShift(userId);
  if (!run) return null;
  if (run.status === "done") return publicShift(run);
  const now = Date.now();
  if (shiftOver(run, now)) return finishAndReturn(userId, run);
  const changed = await injectArrived(userId, run, shiftElapsed(run, now));
  if (changed) await saveShift(userId, run);
  return publicShift(run, now);
}

/**
 * Have Claude rewrite each incident's sender, title and brief for this shift so
 * it reads differently every time and speaks to the student's target roles. The
 * facts stay in the template; only the wording is stored on the run. Best effort:
 * if the model is unavailable, the incidents keep their template wording.
 */
async function narrateShift(run: ShiftRun, roles: import("@/lib/academy-certs").RoleId[]): Promise<void> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return;
  // Feed the narrator the bound brief (with this shift's real victim), so the
  // wording it writes keeps the right person.
  const items = run.incidents.map((inc) => {
    const def = incidentDef(inc.defId);
    if (!def) return null;
    const eff = effectiveIncident(def, inc);
    return { id: def.id, kind: def.kind, severity: def.severity, from: def.from, title: def.title, brief: eff.brief };
  });
  if (items.some((x) => x === null)) return;
  const labels = roles.map((r) => roleLabel(r));
  const written = await shiftNarrator(
    apiKey,
    labels,
    items as { id: string; kind: "alert" | "ticket"; severity: string; from: string; title: string; brief: string }[]
  ).catch(() => null);
  if (!written) return;
  run.incidents.forEach((inc, n) => {
    const t = written[n];
    if (t) inc.text = t;
  });
}

export async function startShift(userId: string): Promise<{ shift?: PublicShift; error?: string }> {
  const existing = await loadShift(userId);
  if (existing && existing.status === "active" && !shiftOver(existing)) {
    return { shift: await getShift(userId) ?? undefined };
  }
  // The lab must be Online: running and linked, so incidents can be fired into it.
  const status = await hostedLabStatus(userId).catch(() => null);
  if (status?.state !== "ready") {
    return { error: "The lab is not Online yet. Start it and wait until it is running before you begin the shift." };
  }
  const [entries, results, profile] = await Promise.all([loadDrills(userId), loadProgress(userId), loadProfile(userId)]);
  const roles = profile?.roles ?? [];
  // Alternate the lean: the shift after a ticket night is an alert night, and
  // the other way round. A first shift leans on alerts. A beginner with too few
  // incidents of one kind gets a plain mixed shift instead.
  const phase = phaseFor(results);
  const level = levelFor(entries);
  const mix: ShiftMix | undefined = canAlternate(phase, level) ? (existing?.mix === "alerts" ? "tickets" : "alerts") : undefined;
  const run = newShiftRun(`${userId}:${Date.now()}`, phase, level, roles, Date.now(), mix);
  run.desk = planDesk(run.id, run.level, run.incidents);
  // Composing the shift (Claude's wording) takes a few seconds; don't let that
  // eat the clock. Stamp the start once setup is done, so the timer begins when
  // the student actually sees the queue.
  await narrateShift(run, roles);
  const startedMs = Date.now();
  run.startedAt = new Date(startedMs).toISOString();
  run.endsAt = new Date(startedMs + SHIFT_SECONDS * 1000).toISOString();
  await saveShift(userId, run);
  await injectArrived(userId, run, 0);
  await saveShift(userId, run);
  return { shift: publicShift(run) };
}

// ---- acknowledge / hint / submit ------------------------------------------

function activeIncident(run: ShiftRun | null, uid: string, now = Date.now()): { run: ShiftRun; inc: IncidentRun; def: IncidentDef; elapsed: number } | null {
  if (!run || run.status !== "active" || shiftOver(run, now)) return null;
  const inc = run.incidents.find((i) => i.uid === uid);
  const def = inc && incidentDef(inc.defId);
  const elapsed = shiftElapsed(run, now);
  if (!inc || !def || !incidentArrived(inc, elapsed)) return null;
  return { run, inc, def, elapsed };
}

export async function ackIncident(userId: string, uid: string): Promise<PublicShift | { error: string }> {
  const found = activeIncident(await loadShift(userId), uid);
  if (!found) return { error: "That incident is not open." };
  if (found.inc.ackedAtSec === null) {
    found.inc.ackedAtSec = found.elapsed;
    await saveShift(userId, found.run);
  }
  return publicShift(found.run);
}

export async function hintIncident(userId: string, uid: string): Promise<{ hint: string; hintsUsed: number; costPct: number } | { error: string }> {
  const found = activeIncident(await loadShift(userId), uid);
  if (!found) return { error: "That incident is not open." };
  const { inc, def, run } = found;
  if (inc.hintsUsed >= def.hints.length) return { error: "No more hints for this incident." };
  const rung = inc.hintsUsed;
  inc.hintsUsed += 1;
  await saveShift(userId, run);
  return { hint: def.hints[rung], hintsUsed: inc.hintsUsed, costPct: Math.round(HINT_COST[rung] * 100) };
}

export type SubmitOutcome = {
  resolved: boolean;
  escalated: boolean;
  onTime: boolean;
  results: { label: string; ok: boolean }[];
  waiting: boolean;
  needFinding: boolean;
  /** The fix may be in, but the attack has not reached the lab's Security log yet. */
  evidencePending?: boolean;
  /** Whether the finding answers the incident's question. Null on a handoff. */
  answerRight: boolean | null;
};

/**
 * Save the write-up and diagnosis, then check the lab for the fix. Marks the
 * incident resolved (with its time) the first moment the lab shows the change.
 *
 * Escalating is the other way to close an incident: it hands the work to tier 2
 * without touching the lab. It still needs a finding -- an analyst who cannot
 * say what they saw has nothing to hand up -- and it is scored as a handoff, so
 * it keeps the credit for the finding, the write-up and doing no harm but never
 * earns the points for resolving the incident or for being on time.
 */
export async function submitIncident(
  userId: string,
  uid: string,
  diagnosis: string,
  response: string,
  escalate = false
): Promise<SubmitOutcome | { error: string }> {
  const found = activeIncident(await loadShift(userId), uid);
  if (!found) return { error: "That incident is not open." };
  const { inc, def, run, elapsed } = found;
  inc.diagnosis = diagnosis.slice(0, 400);
  inc.response = response.slice(0, 4000);

  if (escalate) {
    // Tier 2 takes what tier 1 tried, not a first look: one Submit and check,
    // a finding and a closing note before it can go up.
    if (!(inc.submits ?? 0)) return { error: "Submit and check first. Tier 2 takes an incident after you have tried it." };
    if (!inc.diagnosis.trim()) return { error: "Answer the question before you hand this to tier 2." };
    if (!inc.response.trim()) return { error: "Write a closing note first. It is what tier 2 reads." };
    if (inc.escalatedAtSec == null && inc.resolvedAtSec === null) inc.escalatedAtSec = elapsed;
    await saveShift(userId, run);
    return { resolved: false, escalated: true, onTime: false, results: [], waiting: false, needFinding: false, answerRight: null };
  }

  inc.submits = (inc.submits ?? 0) + 1;

  // Push a fresh snapshot from the lab now and wait briefly for it, so a change
  // the student just made is graded on this click instead of the next one.
  const eff = effectiveIncident(def, inc);
  // An incident that proves itself from the Security log cannot be closed
  // until a digest arrives, and only a heavy sync carries one. Asking for a
  // light one and then grading told a student who had fixed the problem
  // correctly that it had not landed yet.
  const needsEvidence = Boolean(eff.evidence);
  const before = await loadLabState(userId);
  let seenAt = before ? Date.parse(before.uploadedAt) : 0;
  let lab = before;
  void requestLabSync(userId, true, needsEvidence);
  // The heavy sync reads the log, so give it longer than a nudge needs.
  // A light report usually lands in a few seconds, but SSM can take longer,
  // and grading the report from before the click told students who had just
  // made the fix that their lab did not show it.
  const deadline = Date.now() + (needsEvidence ? 25_000 : 15_000);
  let arrived = false;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 200));
    const next = await loadLabState(userId);
    if (!next || Date.parse(next.uploadedAt) <= seenAt) continue;
    lab = next;
    arrived = true;
    seenAt = Date.parse(next.uploadedAt);
    // The change-watch loop pushes its own snapshot within a fraction of a
    // second of the fix, and that one carries no digest. Taking the first
    // thing to arrive meant grading the fix against last minute's evidence,
    // so when evidence is what is missing, keep waiting for a snapshot that
    // actually shows the attack.
    if (!needsEvidence || eff.evidence!(next.snapshot.events)) break;
  }

  const graded = gradeIncidentLab(eff, lab?.snapshot ?? null, inc.diagnosis);
  const fresh = Boolean(lab && Date.parse(lab.uploadedAt) >= Date.parse(run.startedAt));
  // An incident closes only when the lab shows the fix AND the finding is answered
  // correctly. A correct fix with a wrong or blank finding stays open with a nudge.
  const needFinding = graded.resolved && !graded.diagnosisRight;
  const closed = graded.resolved && graded.diagnosisRight;
  if (closed && inc.resolvedAtSec === null) inc.resolvedAtSec = elapsed;
  await saveShift(userId, run);
  return {
    resolved: closed,
    escalated: false,
    onTime: inc.resolvedAtSec !== null && resolvedOnTime(inc),
    results: graded.results,
    // Not resolved and no report arrived after the click (or none since the
    // shift began): the lab was not read, so it is not "not fixed", it is
    // "not heard from yet".
    waiting: !graded.resolved && (!fresh || !arrived),
    needFinding,
    evidencePending: Boolean(eff.evidence) && !eff.evidence!(lab?.snapshot.events),
    answerRight: graded.diagnosisRight,
  };
}

// ---- the desk: calls, status requests, urgent asks -------------------------

/**
 * Answer a desk event. A call or an urgent ask takes a choice; a status
 * request takes a line of text, graded against the incidents open right now.
 * One answer each, and only while it is open: a caller who has hung up has
 * hung up. Returns the shift, whose desk entry now carries the verdict and the
 * reasoning behind every option.
 */
export async function answerDesk(userId: string, uid: string, choice: string, text: string): Promise<PublicShift | { error: string }> {
  const run = await loadShift(userId);
  if (!run || run.status !== "active" || shiftOver(run)) return { error: "Your shift is not running." };
  const d = (run.desk ?? []).find((x) => x.uid === uid);
  const elapsed = shiftElapsed(run);
  if (!d || !deskArrived(d, elapsed)) return { error: "That has not come in yet." };
  if (d.answeredAtSec !== null) return { error: "You already answered that." };
  if (deskLapsed(d, elapsed)) return { error: "Too late, they have moved on." };

  if (d.kind === "ping") {
    const line = text.replace(/\s+/g, " ").trim().slice(0, 280);
    if (!line) return { error: "Write your one-line status first." };
    const open = run.incidents
      .filter((i) => incidentArrived(i, elapsed) && i.resolvedAtSec === null && i.escalatedAtSec == null)
      .map((i) => {
        const def = incidentDef(i.defId);
        const who = i.bind?.args ? Object.values(i.bind.args).map(String).find((v) => v.includes(".")) : undefined;
        return { title: i.text?.title ?? def?.title ?? i.defId, severity: i.severity, who };
      });
    const g = gradeStatus(line, open);
    Object.assign(d, { text: line, score: g.score, hits: g.hits, misses: g.misses, answeredAtSec: elapsed });
  } else {
    const g = gradeChoice(d.defId, d.who, choice);
    if (!g) return { error: "Pick one of the options." };
    Object.assign(d, { choice, score: g.score, answeredAtSec: elapsed });
  }
  await saveShift(userId, run);
  return publicShift(run);
}

// ---- grading at the end ---------------------------------------------------

/**
 * Tier 2's review when Coach cannot be reached: graded from the facts alone.
 * A note that names the right finding and says what was tried is usable; the
 * fix is stated from the incident's own resolve checks and guidance.
 */
function factReview(c: { finding: string; note: string; fix: string[]; path: string[] }, findingRight: boolean): HandoffReview {
  const words = c.note.trim().split(/\s+/).filter(Boolean).length;
  const score = Math.min(3, (findingRight ? 1 : 0) + (words >= 15 ? 1 : 0) + (words >= 40 ? 1 : 0));
  return {
    score,
    grade: HANDOFF_GRADES[score],
    handoff: findingRight
      ? `Your finding was right${words < 15 ? ", but the note was too short for tier 2 to act on without calling you back" : ", and tier 2 had a note to work from"}.`
      : "Your finding did not answer the question, so tier 2 would start the investigation again.",
    couldHave: `What would have closed it at tier 1: ${c.fix.join("; ")}. ${c.path[c.path.length - 1] ?? ""}`.trim(),
    by: "facts",
  };
}

async function gradeRun(userId: string, run: ShiftRun): Promise<ShiftRun> {
  const lab = await loadLabState(userId);
  const snapshot = lab?.snapshot ?? null;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const grade = apiKey ? responseGrader(apiKey) : null;
  const review = apiKey ? handoffReviewer(apiKey) : null;

  for (const inc of run.incidents) {
    const def = incidentDef(inc.defId);
    if (!def) continue;
    const eff = effectiveIncident(def, inc);
    const lg = gradeIncidentLab(eff, snapshot, inc.diagnosis);
    // An incident is only closed when the lab shows the fix AND the finding is right.
    // Once it was closed during the shift it stays closed: a later incident (e.g. a
    // spray re-locking an account) must not strip credit the student already earned.
    // An escalation is final: once they handed it up, a fix the lab happens to
    // show later does not turn it back into their resolve.
    const escalated = inc.escalatedAtSec != null && inc.resolvedAtSec === null;
    const closed = !escalated && (inc.resolvedAtSec !== null || (lg.resolved && lg.diagnosisRight));
    if (closed && inc.resolvedAtSec === null) inc.resolvedAtSec = shiftElapsed(run, Date.parse(run.endsAt));
    const onTime = inc.resolvedAtSec !== null && resolvedOnTime(inc);

    let writeUp: number | null = null;
    if (escalated) {
      // Tier 2 reads the handoff, and its grade is the write-up score.
      const c = {
        title: inc.text?.title ?? def.title,
        brief: inc.text?.brief ?? eff.brief,
        question: eff.diagnosis.prompt,
        answer: eff.diagnosis.accept[0] ?? "",
        fix: eff.resolve.map((r) => r.label),
        path: def.hints,
        rubric: def.rubric,
        finding: inc.diagnosis,
        note: inc.response,
      };
      inc.review = (review ? await review(c).catch(() => null) : null) ?? factReview(c, lg.diagnosisRight);
      writeUp = inc.review.score / 3;
    } else if (grade && inc.response.trim()) {
      const item = { title: def.title, story: eff.brief, prompt: eff.diagnosis.prompt, rubric: def.rubric } as unknown as Item;
      const marked = await grade(item, inc.response).catch(() => null);
      if (marked) writeUp = marked.total ? marked.hits / marked.total : null;
    }

    // Worked means they put something in: a finding, a note, a fix or a handoff.
    // Opening the incident does not count -- selecting it acknowledges it on its
    // own, so an ack proves nothing but that the queue scrolled past.
    const touched = closed || escalated || inc.diagnosis.trim().length > 0 || inc.response.trim().length > 0;
    inc.touched = touched;
    inc.resolved = closed;
    inc.escalated = escalated;
    inc.noHarm = lg.noHarm;
    inc.diagnosisRight = lg.diagnosisRight;
    inc.onTime = onTime;
    inc.writeUp = writeUp;
    inc.score = scoreIncident(def, { resolved: closed, onTime, noHarm: lg.noHarm, diagnosisRight: lg.diagnosisRight, writeUp, touched }, inc.hintsUsed);
  }

  // The desk and the order of work count too: the call handled right, the
  // status given, and the P1 worked before the P3.
  const desk = run.desk ?? [];
  const order = triage(run.incidents);
  run.totalScore = run.incidents.reduce((s, i) => s + (i.score ?? 0), 0) + deskScore(desk) + (run.incidents.length ? order.score : 0);
  run.maxScore = run.incidents.reduce((s, i) => s + (incidentDef(i.defId)?.points ?? 0), 0) + deskMax(desk) + (run.incidents.length ? order.max : 0);
  run.status = "done";
  run.finishedAt = new Date().toISOString();
  return run;
}

function buildReport(run: ShiftRun): ShiftReport {
  const incidents: IncidentReport[] = run.incidents.map((inc) => {
    const def = incidentDef(inc.defId);
    return {
      title: def?.title ?? inc.defId,
      severity: inc.severity,
      resolved: Boolean(inc.resolved),
      escalated: Boolean(inc.escalated),
      touched: Boolean(inc.touched),
      onTime: Boolean(inc.onTime),
      noHarm: Boolean(inc.noHarm),
      diagnosisRight: Boolean(inc.diagnosisRight),
      hintsUsed: inc.hintsUsed,
      score: inc.score ?? 0,
      max: def?.points ?? 0,
      review: inc.escalated ? (inc.review ?? null) : null,
    };
  });
  const resolvedCount = incidents.filter((i) => i.resolved).length;
  const escalatedCount = incidents.filter((i) => i.escalated).length;
  const onTimeCount = incidents.filter((i) => i.onTime).length;
  const pct = run.maxScore ? (run.totalScore ?? 0) / run.maxScore : 0;
  const headline = pct >= 0.85 ? "Ready for the desk" : pct >= 0.6 ? "Solid shift" : resolvedCount ? "Getting there" : "Worth another shift";
  let habit = "Acknowledge each incident first, then investigate before you act.";
  if (incidents.some((i) => i.resolved && !i.onTime)) habit = "You fixed the right things, but watch the clock: acknowledge and work the P1s first.";
  else if (incidents.some((i) => !i.noHarm)) habit = "Contain the real problem without touching the accounts that were fine.";
  else if (incidents.some((i) => i.resolved && !i.diagnosisRight)) habit = "Name the evidence (event IDs, accounts, times), not just the fix.";
  else if (resolvedCount === incidents.length && incidents.length) habit = "Strong. Try a harder shift, or one with more incidents.";
  // Said last so it outranks the generic advice: escalating everything is the
  // habit that most needs naming, and it is invisible in the score alone.
  if (escalatedCount && escalatedCount >= resolvedCount) habit = "You handed up more than you fixed. Escalate what is above your access, and work the rest yourself.";
  // Last, so it outranks the rest: a queue nobody worked is the only thing worth
  // saying about that shift.
  const workedCount = incidents.filter((i) => i.touched).length;
  if (!workedCount && incidents.length) habit = "Nothing on the queue was worked. Open the top incident, find the evidence, and write what you found before the clock runs out.";
  else if (workedCount < incidents.length / 2) habit = "Most of the queue went untouched. Work them in severity order and put a finding against each one, even the ones you hand up.";
  const end = run.finishedAt ? shiftElapsed(run, Date.parse(run.finishedAt)) : SHIFT_SECONDS;
  const titleOf = (inc: IncidentRun) => inc.text?.title ?? incidentDef(inc.defId)?.title ?? inc.defId;
  const byUid = new Map(run.incidents.map((i) => [i.uid, i]));
  const order = triage(run.incidents);
  const deskRuns = run.desk ?? [];
  const desk = deskRuns.map((d) => {
    const pub = toPublicDesk(d, end);
    return { title: pub?.title ?? d.defId, correct: Boolean(pub?.verdict?.correct), score: d.score ?? 0, max: pub?.verdict?.max ?? 0, lesson: pub?.verdict?.lesson ?? "" };
  });
  // Said last, so a desk mistake outranks the generic advice: these are the
  // habits that cost most on a real desk and never show up in a lab check.
  const callWrong = deskRuns.find((d) => d.defId === "mfa-call" && d.answeredAtSec !== null && (d.score ?? 0) === 0);
  if (order.misses.length) habit = "You opened lower-severity work while a higher one waited. Scan the queue and open the P1 first, every time.";
  if (callWrong) habit = "A caller talked you into the wrong move. Never change MFA or a password on an inbound call: call back on the number already on file.";
  return {
    totalScore: run.totalScore ?? 0,
    maxScore: run.maxScore ?? 0,
    resolvedCount,
    escalatedCount,
    onTimeCount,
    incidents,
    headline,
    habit,
    desk,
    triage: {
      score: run.incidents.length ? order.score : 0,
      max: run.incidents.length ? order.max : 0,
      misses: order.misses.map((m) => ({
        opened: `${m.opened} ${titleOf(byUid.get(m.openedUid)!)}`,
        waiting: `${m.waiting} ${titleOf(byUid.get(m.waitingUid)!)}`,
        atSec: m.atSec,
      })),
    },
    metrics: shiftMetrics(run.incidents, end),
    timeline: shiftTimeline(run.incidents, deskRuns, titleOf, end),
  };
}

async function recordAndClose(userId: string, run: ShiftRun) {
  const detail = run.incidents.map((inc) => {
    const def = incidentDef(inc.defId);
    return {
      t: def?.title ?? inc.defId,
      s: def ? skillOf(def) : ("security" as Skill),
      // Resolved (even if late) counts as worked: it proves the task for the portfolio.
      c: (inc.resolved ? 1 : 0) as 0 | 1,
      th: `shift:${inc.defId}`,
      // The portfolio job this incident proves, so a resolved shift task joins the portfolio.
      j: inc.resolved ? SHIFT_JOB[inc.defId] : undefined,
    };
  });
  const entry: DrillEntry = {
    id: run.id,
    day: run.startedAt.slice(0, 10),
    mode: "shift",
    correct: run.incidents.filter((i) => i.resolved && i.onTime).length,
    total: run.incidents.length,
    seconds: SHIFT_SECONDS,
    misses: run.incidents.filter((i) => !i.resolved).map((i) => (incidentDef(i.defId) ? skillOf(incidentDef(i.defId)!) : "security")),
    at: run.finishedAt ?? new Date().toISOString(),
    level: run.level,
    detail,
  };
  if (!(await loadDrills(userId)).some((e) => e.id === entry.id)) await saveDrill(userId, entry);
  // Keep the finished run so the report survives a refresh; the next Start replaces it.
  await saveShift(userId, run);
  // Undo the planted incidents so the lab is clean for missions, targeting the
  // same rotated victims they hit. Best effort.
  await cleanupShiftLab(
    userId,
    run.incidents.map((i) => ({ script: incidentDef(i.defId)?.script ?? "", args: i.bind?.args }))
  ).catch(() => {});
}

async function finishAndReturn(userId: string, run: ShiftRun): Promise<PublicShift> {
  const graded = await gradeRun(userId, run);
  await recordAndClose(userId, graded);
  return publicShift(graded);
}

/** End the shift now (the student clicked End, or time ran out on the client). */
export async function finishShift(userId: string): Promise<PublicShift | { error: string }> {
  const run = await loadShift(userId);
  if (!run) return { error: "No shift to end." };
  if (run.status === "done") return publicShift(run);
  return finishAndReturn(userId, run);
}

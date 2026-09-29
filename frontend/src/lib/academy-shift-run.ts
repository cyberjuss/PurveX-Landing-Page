import "server-only";
import { responseGrader } from "@/lib/academy-scenario";
import { cleanupShiftLab, injectIncident } from "@/lib/academy-hosted";
import { levelFor, type DrillEntry, type Item } from "@/lib/academy-drills";
import type { Results, Skill } from "@/lib/academy-score";
import { loadDrills, loadLabState, loadProgress, loadShift, saveDrill, saveShift } from "@/lib/academy-store";
import {
  gradeIncidentLab,
  HINT_COST,
  incidentArrived,
  incidentDef,
  newShiftRun,
  resolvedOnTime,
  scoreIncident,
  shiftElapsed,
  shiftOver,
  SHIFT_SECONDS,
  type IncidentDef,
  type IncidentRun,
  type ShiftRun,
} from "@/lib/academy-shift";

// Runs a student's Shift: start it, inject each incident into their lab when it
// arrives, take acknowledgements, hints and responses, and grade at the end.
// All timing comes from the shift's start time, so no background timer is needed.

// ---- what the page and MCP see (never the answers) -------------------------

export type PublicIncident = {
  defId: string;
  kind: "alert" | "ticket";
  severity: "P1" | "P2" | "P3";
  from: string;
  title: string;
  brief: string;
  diagnosisPrompt: string;
  arriveSec: number;
  deadlineSec: number;
  acknowledged: boolean;
  resolved: boolean;
  overdue: boolean;
  secondsLeft: number | null;
  hintsUsed: number;
  hintsTotal: number;
  nextHintCostPct: number | null;
  shownHints: string[];
  diagnosis: string;
  responseSaved: boolean;
};

export type IncidentReport = {
  title: string;
  severity: string;
  resolved: boolean;
  onTime: boolean;
  noHarm: boolean;
  diagnosisRight: boolean;
  hintsUsed: number;
  score: number;
  max: number;
};

export type ShiftReport = {
  totalScore: number;
  maxScore: number;
  resolvedCount: number;
  onTimeCount: number;
  incidents: IncidentReport[];
  headline: string;
  habit: string;
};

export type PublicShift = {
  id: string;
  startedAt: string;
  endsAt: string;
  secondsLeft: number;
  phase: number;
  level: number;
  status: "active" | "done";
  incidents: PublicIncident[];
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
  const secondsLeft = inc.resolvedAtSec !== null ? null : Math.max(0, deadlineAt - elapsed);
  return {
    defId: def.id,
    kind: def.kind,
    severity: def.severity,
    from: def.from,
    title: def.title,
    brief: def.brief,
    diagnosisPrompt: def.diagnosis.prompt,
    arriveSec: inc.arriveSec,
    deadlineSec: inc.deadlineSec,
    acknowledged: inc.ackedAtSec !== null,
    resolved: inc.resolvedAtSec !== null,
    overdue: inc.resolvedAtSec === null && elapsed > deadlineAt,
    secondsLeft,
    hintsUsed: inc.hintsUsed,
    hintsTotal: def.hints.length,
    nextHintCostPct: inc.hintsUsed < def.hints.length ? Math.round(HINT_COST[inc.hintsUsed] * 100) : null,
    shownHints: def.hints.slice(0, inc.hintsUsed),
    diagnosis: inc.diagnosis,
    responseSaved: inc.response.trim().length > 0,
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
    status: run.status,
    incidents: run.incidents.map((inc) => toPublic(run, inc, elapsed)).filter((x): x is PublicIncident => x !== null),
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
    const ok = await injectIncident(userId, def.script);
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

export async function startShift(userId: string): Promise<{ shift?: PublicShift; error?: string }> {
  const existing = await loadShift(userId);
  if (existing && existing.status === "active" && !shiftOver(existing)) {
    return { shift: await getShift(userId) ?? undefined };
  }
  const lab = await loadLabState(userId);
  if (!lab) return { error: "Start your lab and wait until it is Online before you begin a shift." };
  const [entries, results] = await Promise.all([loadDrills(userId), loadProgress(userId)]);
  const run = newShiftRun(`${userId}:${Date.now()}`, phaseFor(results), levelFor(entries));
  await saveShift(userId, run);
  await injectArrived(userId, run, 0);
  await saveShift(userId, run);
  return { shift: publicShift(run) };
}

// ---- acknowledge / hint / submit ------------------------------------------

function activeIncident(run: ShiftRun | null, defId: string, now = Date.now()): { run: ShiftRun; inc: IncidentRun; def: IncidentDef; elapsed: number } | null {
  if (!run || run.status !== "active" || shiftOver(run, now)) return null;
  const inc = run.incidents.find((i) => i.defId === defId);
  const def = inc && incidentDef(defId);
  const elapsed = shiftElapsed(run, now);
  if (!inc || !def || !incidentArrived(inc, elapsed)) return null;
  return { run, inc, def, elapsed };
}

export async function ackIncident(userId: string, defId: string): Promise<PublicShift | { error: string }> {
  const found = activeIncident(await loadShift(userId), defId);
  if (!found) return { error: "That incident is not open." };
  if (found.inc.ackedAtSec === null) {
    found.inc.ackedAtSec = found.elapsed;
    await saveShift(userId, found.run);
  }
  return publicShift(found.run);
}

export async function hintIncident(userId: string, defId: string): Promise<{ hint: string; hintsUsed: number; costPct: number } | { error: string }> {
  const found = activeIncident(await loadShift(userId), defId);
  if (!found) return { error: "That incident is not open." };
  const { inc, def, run } = found;
  if (inc.hintsUsed >= def.hints.length) return { error: "No more hints for this incident." };
  const rung = inc.hintsUsed;
  inc.hintsUsed += 1;
  await saveShift(userId, run);
  return { hint: def.hints[rung], hintsUsed: inc.hintsUsed, costPct: Math.round(HINT_COST[rung] * 100) };
}

/**
 * Save the write-up and diagnosis, then check the lab for the fix. Marks the
 * incident resolved (with its time) the first moment the lab shows the change.
 */
export async function submitIncident(
  userId: string,
  defId: string,
  diagnosis: string,
  response: string
): Promise<{ resolved: boolean; onTime: boolean; results: { label: string; ok: boolean }[]; waiting: boolean } | { error: string }> {
  const found = activeIncident(await loadShift(userId), defId);
  if (!found) return { error: "That incident is not open." };
  const { inc, def, run, elapsed } = found;
  inc.diagnosis = diagnosis.slice(0, 400);
  inc.response = response.slice(0, 4000);

  const lab = await loadLabState(userId);
  const graded = gradeIncidentLab(def, lab?.snapshot ?? null, inc.diagnosis);
  const fresh = Boolean(lab && Date.parse(lab.uploadedAt) >= Date.parse(run.startedAt));
  if (graded.resolved && inc.resolvedAtSec === null) inc.resolvedAtSec = elapsed;
  await saveShift(userId, run);
  return {
    resolved: graded.resolved,
    onTime: inc.resolvedAtSec !== null && resolvedOnTime(inc),
    results: graded.results,
    // Not resolved and the lab has not reported since the shift began: the change may just be in flight.
    waiting: !graded.resolved && !fresh,
  };
}

// ---- grading at the end ---------------------------------------------------

async function gradeRun(userId: string, run: ShiftRun): Promise<ShiftRun> {
  const lab = await loadLabState(userId);
  const snapshot = lab?.snapshot ?? null;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const grade = apiKey ? responseGrader(apiKey) : null;

  for (const inc of run.incidents) {
    const def = incidentDef(inc.defId);
    if (!def) continue;
    const lg = gradeIncidentLab(def, snapshot, inc.diagnosis);
    if (lg.resolved && inc.resolvedAtSec === null) inc.resolvedAtSec = shiftElapsed(run, Date.parse(run.endsAt));
    const onTime = inc.resolvedAtSec !== null && resolvedOnTime(inc);

    let writeUp: number | null = null;
    if (grade && inc.response.trim()) {
      const item = { title: def.title, story: def.brief, prompt: def.diagnosis.prompt, rubric: def.rubric } as unknown as Item;
      const marked = await grade(item, inc.response).catch(() => null);
      if (marked) writeUp = marked.total ? marked.hits / marked.total : null;
    }

    inc.resolved = lg.resolved;
    inc.noHarm = lg.noHarm;
    inc.diagnosisRight = lg.diagnosisRight;
    inc.onTime = onTime;
    inc.writeUp = writeUp;
    inc.score = scoreIncident(def, { resolved: lg.resolved, onTime, noHarm: lg.noHarm, diagnosisRight: lg.diagnosisRight, writeUp }, inc.hintsUsed);
  }

  run.totalScore = run.incidents.reduce((s, i) => s + (i.score ?? 0), 0);
  run.maxScore = run.incidents.reduce((s, i) => s + (incidentDef(i.defId)?.points ?? 0), 0);
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
      onTime: Boolean(inc.onTime),
      noHarm: Boolean(inc.noHarm),
      diagnosisRight: Boolean(inc.diagnosisRight),
      hintsUsed: inc.hintsUsed,
      score: inc.score ?? 0,
      max: def?.points ?? 0,
    };
  });
  const resolvedCount = incidents.filter((i) => i.resolved).length;
  const onTimeCount = incidents.filter((i) => i.onTime).length;
  const pct = run.maxScore ? (run.totalScore ?? 0) / run.maxScore : 0;
  const headline = pct >= 0.85 ? "Ready for the desk" : pct >= 0.6 ? "Solid shift" : resolvedCount ? "Getting there" : "Worth another shift";
  let habit = "Acknowledge each incident first, then investigate before you act.";
  if (incidents.some((i) => i.resolved && !i.onTime)) habit = "You fixed the right things, but watch the clock: acknowledge and work the P1s first.";
  else if (incidents.some((i) => !i.noHarm)) habit = "Contain the real problem without touching the accounts that were fine.";
  else if (incidents.some((i) => i.resolved && !i.diagnosisRight)) habit = "Name the evidence (event IDs, accounts, times), not just the fix.";
  else if (resolvedCount === incidents.length && incidents.length) habit = "Strong. Try a harder shift, or one with more incidents.";
  return { totalScore: run.totalScore ?? 0, maxScore: run.maxScore ?? 0, resolvedCount, onTimeCount, incidents, headline, habit };
}

async function recordAndClose(userId: string, run: ShiftRun) {
  const detail = run.incidents.map((inc) => {
    const def = incidentDef(inc.defId);
    return {
      t: def?.title ?? inc.defId,
      s: def ? skillOf(def) : ("security" as Skill),
      c: (inc.resolved && inc.onTime ? 1 : 0) as 0 | 1,
      th: `shift:${inc.defId}`,
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
  // Undo the planted incidents so the lab is clean for missions. Best effort.
  await cleanupShiftLab(userId, run.incidents.map((i) => incidentDef(i.defId)?.script ?? "")).catch(() => {});
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

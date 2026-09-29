import "server-only";
import type { RoleId } from "@/lib/academy-certs";
import { evalCheck, seeded, shuffle, type Check } from "@/lib/academy-drills";
import type { LabEvents, LabSnapshot } from "@/lib/academy-lab";

// Shift: a 15-minute tour on the PurveX Financial desk. Real incidents fire
// inside the student's own hosted lab on a timer (see academy-hosted.ts, which
// runs the matching Incident-*.ps1 scripts through SSM). The student
// investigates in the lab, acts, and writes up each one before its deadline.
// Grading reads the lab the same way missions do: real end state, real events.
// Nothing here is faked. Difficulty rises with the student's phase and level.

export const SHIFT_MINUTES = 15;
export const SHIFT_SECONDS = SHIFT_MINUTES * 60;

export type Severity = "P1" | "P2" | "P3";
/** Response deadline from the moment an incident arrives. */
const DEADLINE_SEC: Record<Severity, number> = { P1: 300, P2: 480, P3: 720 };
/** What each hint rung costs, as a fraction of the incident's points. */
export const HINT_COST = [0.1, 0.2, 0.4];

export type IncidentDef = {
  id: string;
  kind: "alert" | "ticket";
  severity: Severity;
  /** Earliest phase and drill level (1-4) this incident can appear at. */
  minPhase: number;
  minLevel: number;
  /** Harder incidents are weighted up as the level rises. */
  weight?: number;
  falseAlarm?: boolean;
  /** Which target roles this incident is bread-and-butter for. Weighted up when the student picked one. */
  roles: RoleId[];
  /** The Incident-*.ps1 script baked into the lab image. */
  script: string;
  points: number;
  /** The alert or ticket the student sees. Claude varies the wording per shift; this is the fallback. */
  from: string;
  title: string;
  brief: string;
  /** The lab end state that means resolved. Read from the snapshot like a mission. */
  resolve: { c: Check; label: string }[];
  /** Must stay true, or the student broke something they should not have. */
  noHarm?: { c: Check; label: string }[];
  /** The one fact that proves they investigated: an account, a count, an event id. */
  diagnosis: { prompt: string; accept: string[] };
  /** What a strong write-up covers. Coach scores the free-text response against these. */
  rubric: string[];
  /** Three rungs, each more explicit, none giving the answer. */
  hints: string[];
};

// ---- the incident library -------------------------------------------------
// Each incident's reality is planted by its script; the checks below read what
// the student did about it. Keep resolve checks to the student's own actions.

export const INCIDENTS: IncidentDef[] = [
  {
    id: "lockout-ticket",
    kind: "ticket",
    severity: "P3",
    minPhase: 1,
    minLevel: 1,
    weight: 1,
    roles: ["help-desk", "sysadmin"],
    script: "Incident-Lockout.ps1",
    points: 100,
    from: "Riley Kwan, Operations",
    title: "I'm locked out again",
    brief: "Riley Kwan cannot sign in and thinks the account is locked. Confirm what is actually wrong before you act, then restore sign-in. Not every ticket is an attack.",
    resolve: [
      { c: { t: "enabled", sam: "riley.kwan", want: true }, label: "riley.kwan can sign in" },
      { c: { t: "flag", sam: "riley.kwan", flag: "lockedOut", want: false }, label: "riley.kwan is not locked out" },
    ],
    diagnosis: { prompt: "Was riley.kwan locked out or disabled?", accept: ["locked", "locked out", "lockout"] },
    rubric: ["What the account state actually was", "What you did to restore access", "Why no escalation was needed"],
    hints: [
      "Open riley.kwan in Active Directory Users and Computers and read the Account tab.",
      "Locked out and disabled are different boxes. Only one is checked here.",
      "Unlock the account (do not reset the password unless it is also expired), then confirm the lockout box is clear.",
    ],
  },
  {
    id: "spray",
    kind: "alert",
    severity: "P2",
    minPhase: 1,
    minLevel: 1,
    weight: 1.3,
    roles: ["soc-analyst", "cyber-analyst", "help-desk"],
    script: "Incident-Spray.ps1",
    points: 150,
    from: "SIEM · automated detection",
    title: "Burst of failed sign-ins across many accounts",
    brief: "A wave of failed sign-ins hit several accounts in under a minute, and some are now locked out. Work out whether this is a password spray, find who was targeted, and restore the real users without opening anything up.",
    resolve: [
      { c: { t: "flag", sam: "priya.nair", flag: "lockedOut", want: false }, label: "priya.nair is unlocked" },
      { c: { t: "flag", sam: "jordan.ellis", flag: "lockedOut", want: false }, label: "jordan.ellis is unlocked" },
    ],
    noHarm: [{ c: { t: "policy", key: "lockoutThreshold", min: 1 }, label: "Account lockout is still enforced" }],
    diagnosis: { prompt: "Which event ID marks the failed sign-ins?", accept: ["4625", "event 4625", "id 4625"] },
    rubric: ["Named the pattern (spray, not one user's typo)", "Named the event id and the affected accounts", "Restored the real users, kept lockout on", "Escalated with the evidence"],
    hints: [
      "Open Event Viewer, Windows Logs, Security, and filter for the failed sign-in event.",
      "One account failing many times is a typo. Many accounts failing once each in the same minute is a spray.",
      "Unlock the locked staff accounts. Do not lower the lockout policy to 'fix' it, and escalate with the account list.",
    ],
  },
  {
    id: "rogue-admin",
    kind: "alert",
    severity: "P1",
    minPhase: 1,
    minLevel: 2,
    weight: 1.6,
    roles: ["soc-analyst", "sysadmin", "ir-analyst"],
    script: "Incident-RogueAdmin.ps1",
    points: 200,
    from: "SIEM · automated detection",
    title: "New account added to IT Admins overnight",
    brief: "A member was added to IT Admins at an odd hour with no change ticket. Contain it without destroying the evidence, and find out how it got there.",
    resolve: [{ c: { t: "member", sam: "svc.helpdesk", group: "IT Admins", want: false }, label: "svc.helpdesk is out of IT Admins" }],
    noHarm: [{ c: { t: "member", sam: "alex.rivera", group: "IT Admins", want: true }, label: "The real admin alex.rivera is untouched" }],
    diagnosis: { prompt: "Which event ID records the group addition?", accept: ["4728", "event 4728", "id 4728"] },
    rubric: ["Named the account added and when", "Named the event id for the group add", "Removed it without deleting the account (kept evidence)", "Escalated as a possible compromise"],
    hints: [
      "Open Event Viewer, Security, and look for a member added to a security group.",
      "Compare who is in IT Admins now against who should be. One account does not belong.",
      "Remove the extra account from IT Admins. Do not delete the account itself yet; it is evidence. Then escalate.",
    ],
  },
  {
    id: "false-alarm",
    kind: "alert",
    severity: "P3",
    minPhase: 1,
    minLevel: 3,
    weight: 1.2,
    falseAlarm: true,
    roles: ["soc-analyst", "cyber-analyst"],
    script: "Incident-ApprovedChange.ps1",
    points: 120,
    from: "SIEM · automated detection",
    title: "After-hours group change flagged",
    brief: "An alert fired for a group change made after hours. There is a matching approved change ticket in the notes. Decide whether this is an incident at all, and close it correctly. Do not undo an approved change.",
    resolve: [{ c: { t: "member", sam: "morgan.lee", group: "Compliance Users", want: true }, label: "The approved change is left in place" }],
    diagnosis: { prompt: "Is this a real incident? Answer incident or approved.", accept: ["approved", "approved change", "not an incident", "false", "false alarm", "no"] },
    rubric: ["Checked the change against the approval", "Concluded it was approved, not an attack", "Closed it without reverting the change", "Noted the evidence that made it approved"],
    hints: [
      "Read the alert notes and the change ticket before you touch anything.",
      "An approved change with a ticket and the right approver is not an incident.",
      "Close it as a false alarm. Reverting an approved change would be the mistake here.",
    ],
  },
  {
    id: "compromised-account",
    kind: "alert",
    severity: "P1",
    minPhase: 2,
    minLevel: 3,
    weight: 1.8,
    roles: ["soc-analyst", "ir-analyst"],
    script: "Incident-Compromise.ps1",
    points: 220,
    from: "SIEM · automated detection",
    title: "Failed sign-ins then a success on one account",
    brief: "One account shows many failed sign-ins and then a success, off-hours, from a workstation it never uses. Treat it as compromised: contain the account and keep the evidence.",
    resolve: [{ c: { t: "enabled", sam: "jamie.torres", want: false }, label: "jamie.torres is disabled (contained)" }],
    noHarm: [{ c: { t: "enabled", sam: "sam.whitfield", want: true }, label: "Other Wealth Management staff are untouched" }],
    diagnosis: { prompt: "Which event ID is the successful sign-in?", accept: ["4624", "event 4624", "id 4624"] },
    rubric: ["Named the account and the failed-then-success pattern", "Named 4625 and 4624 and the odd host/time", "Disabled the account instead of only resetting it", "Preserved evidence and escalated"],
    hints: [
      "In the Security log, line up the failed sign-ins and the success on the same account.",
      "Failures then a success, off-hours, on a strange host, means the password was guessed and worked.",
      "Disable the account to contain it, do not delete it, then escalate. A reset alone does not stop an active session.",
    ],
  },
  {
    id: "weak-policy",
    kind: "alert",
    severity: "P2",
    minPhase: 2,
    minLevel: 4,
    weight: 1.7,
    roles: ["sysadmin", "cyber-analyst"],
    script: "Incident-WeakPolicy.ps1",
    points: 180,
    from: "SIEM · automated detection",
    title: "Domain password policy was weakened",
    brief: "The domain password policy was changed to allow short passwords and no lockout. Restore a safe policy and report who changed it.",
    resolve: [
      { c: { t: "policy", key: "minLength", min: 12 }, label: "Minimum password length is back to at least 12" },
      { c: { t: "policy", key: "lockoutThreshold", min: 1, max: 10 }, label: "Account lockout is enforced again" },
    ],
    diagnosis: { prompt: "Which event ID records a domain policy change?", accept: ["4739", "event 4739", "id 4739"] },
    rubric: ["Named what changed in the policy", "Named the event id for the policy change", "Restored length and lockout to safe values", "Reported who made the change"],
    hints: [
      "Check the Default Domain Policy password settings against what they should be.",
      "A safe baseline is at least 12 characters with lockout after a handful of tries.",
      "Set minimum length back to 12+ and turn lockout back on, then report the change with the event.",
    ],
  },
];

const byId = new Map(INCIDENTS.map((i) => [i.id, i]));
export const incidentDef = (id: string) => byId.get(id) ?? null;

// ---- picking a shift ------------------------------------------------------

export type ShiftIncident = {
  defId: string;
  severity: Severity;
  /** Seconds from shift start when it arrives, and the response deadline from arrival. */
  arriveSec: number;
  deadlineSec: number;
};

/** When incidents arrive across the 15 minutes, spread so the queue keeps
 *  filling the whole shift instead of front-loading. Keyed by how many there are. */
const ARRIVALS: Record<number, number[]> = {
  2: [20, 330],
  3: [20, 240, 510],
  4: [15, 195, 405, 630],
  5: [10, 165, 330, 510, 690],
  6: [0, 150, 300, 450, 600, 720],
};

/** How many incidents a shift has, from phase and level. More senior shifts run
 *  a busier queue. Capped by how many incidents are actually eligible. */
export function shiftSize(phase: number, level: number): number {
  const base = 2 + Math.max(0, level - 1) + (phase >= 2 ? 1 : 0);
  return Math.min(6, base);
}

/**
 * Choose the shift's incidents for this student. Only incidents at or below
 * their phase and level are eligible; harder ones are weighted up as the level
 * rises. A false alarm is included from Hard (level 3) up. Deterministic per seed.
 */
export function pickShift(seed: string, phase: number, level: number, roles: RoleId[] = []): ShiftIncident[] {
  const r = seeded(seed);
  const eligible = INCIDENTS.filter((i) => i.minPhase <= phase && i.minLevel <= level);
  const real = eligible.filter((i) => !i.falseAlarm);
  const alarms = eligible.filter((i) => i.falseAlarm);
  // Never ask for more incidents than are eligible at this phase and level.
  const size = Math.min(shiftSize(phase, level), eligible.length);

  // Incidents that match a target role are worth more, so the queue leans toward that job.
  const roleFit = (i: IncidentDef) => (roles.length && i.roles.some((x) => roles.includes(x)) ? 1.8 : 1);

  const chosen: IncidentDef[] = [];
  // From Hard up, one slot is a false alarm when one is eligible.
  if (level >= 3 && alarms.length) chosen.push(shuffle(r, alarms)[0]);

  const weighted = shuffle(r, real)
    .map((i) => ({ i, w: (i.weight ?? 1) * roleFit(i) * (0.6 + level * 0.2) + r() }))
    .sort((a, b) => b.w - a.w)
    .map((x) => x.i);
  for (const i of weighted) {
    if (chosen.length >= size) break;
    if (!chosen.includes(i)) chosen.push(i);
  }

  const arrivals = ARRIVALS[chosen.length] ?? ARRIVALS[2];
  const order = { P1: 0, P2: 1, P3: 2 };
  // Most urgent first, so a P1 does not arrive last with no time to work it.
  chosen.sort((a, b) => order[a.severity] - order[b.severity]);
  return chosen.map((def, n) => ({
    defId: def.id,
    severity: def.severity,
    arriveSec: arrivals[n],
    deadlineSec: DEADLINE_SEC[def.severity],
  }));
}

// ---- grading one incident -------------------------------------------------

/** The lab-and-diagnosis parts. Write-up and on-time are added by the caller. */
export function gradeIncidentLab(
  def: IncidentDef,
  snapshot: LabSnapshot | null,
  diagnosis: string
): { resolved: boolean; noHarm: boolean; diagnosisRight: boolean; results: { label: string; ok: boolean }[] } {
  const results: { label: string; ok: boolean }[] = [];
  let resolved = true;
  for (const { c, label } of def.resolve) {
    const ok = snapshot ? evalCheck(snapshot, c) : false;
    results.push({ label, ok });
    if (!ok) resolved = false;
  }
  let noHarm = true;
  if (def.noHarm && snapshot) {
    for (const { c, label } of def.noHarm) {
      const ok = evalCheck(snapshot, c);
      results.push({ label, ok });
      if (!ok) noHarm = false;
    }
  }
  const g = diagnosis.trim().toLowerCase();
  const diagnosisRight = def.diagnosis.accept.some((a) => g.includes(a.toLowerCase()));
  return { resolved, noHarm, diagnosisRight, results };
}

/**
 * Final points for one incident. Weights: resolve 45%, on-time 15%,
 * diagnosis 15%, no-harm 10%, write-up 15%. Hints are subtracted after.
 */
export function scoreIncident(
  def: IncidentDef,
  g: { resolved: boolean; onTime: boolean; noHarm: boolean; diagnosisRight: boolean; writeUp: number | null },
  hintsUsed: number
): number {
  let frac = 0;
  if (g.resolved) frac += 0.45;
  if (g.onTime) frac += 0.15;
  if (g.diagnosisRight) frac += 0.15;
  if (g.noHarm) frac += 0.1;
  frac += 0.15 * (g.writeUp ?? 0);
  // Never resolving the incident should cap the score, whatever the write-up.
  if (!g.resolved) frac = Math.min(frac, 0.4);
  const penalty = HINT_COST.slice(0, hintsUsed).reduce((a, b) => a + b, 0);
  return Math.max(0, Math.round(def.points * frac * (1 - penalty)));
}

/** A light read of the log digest, so the alert can quote a real number ("8 accounts hit"). */
export function logColor(events: LabEvents | undefined, def: IncidentDef): string | null {
  if (!events) return null;
  if (def.id === "spray") return events.failures.length ? `${events.failures.length} accounts show failed sign-ins.` : null;
  if (def.id === "rogue-admin") return events.groupAdds.length ? `${events.groupAdds.length} group change(s) in the window.` : null;
  return null;
}

// ---- a running shift ------------------------------------------------------
// Persisted per student while the shift is on (see academy-store). All timing
// is derived from startedAt and the fixed offsets, so the server never needs a
// background timer: the page and the grader both read the clock.

export type IncidentRun = {
  defId: string;
  severity: Severity;
  arriveSec: number;
  deadlineSec: number;
  /** Seconds from shift start when the student acknowledged and resolved it. */
  ackedAtSec: number | null;
  resolvedAtSec: number | null;
  /** The incident's script has been fired into the lab. */
  injected: boolean;
  /** Fresh wording Claude wrote for this shift, so no two read alike. Falls back to the template. */
  text?: { from: string; title: string; brief: string };
  hintsUsed: number;
  diagnosis: string;
  response: string;
  /** Filled in at grading time. */
  score?: number;
  writeUp?: number | null;
  onTime?: boolean;
  resolved?: boolean;
  noHarm?: boolean;
  diagnosisRight?: boolean;
};

export type ShiftRun = {
  id: string;
  startedAt: string;
  endsAt: string;
  phase: number;
  level: number;
  incidents: IncidentRun[];
  status: "active" | "done";
  finishedAt?: string;
  totalScore?: number;
  maxScore?: number;
};

/** Build a fresh shift for this student. The caller persists it and injects the incidents. */
export function newShiftRun(seed: string, phase: number, level: number, roles: RoleId[] = [], now = Date.now()): ShiftRun {
  const picked = pickShift(seed, phase, level, roles);
  return {
    id: `shift-${now.toString(36)}`,
    startedAt: new Date(now).toISOString(),
    endsAt: new Date(now + SHIFT_SECONDS * 1000).toISOString(),
    phase,
    level,
    status: "active",
    incidents: picked.map((p) => ({
      ...p,
      ackedAtSec: null,
      resolvedAtSec: null,
      injected: false,
      hintsUsed: 0,
      diagnosis: "",
      response: "",
    })),
  };
}

/** Seconds elapsed since the shift started. */
export const shiftElapsed = (run: ShiftRun, now = Date.now()) => Math.max(0, Math.floor((now - Date.parse(run.startedAt)) / 1000));

/** True once the 15 minutes are up. */
export const shiftOver = (run: ShiftRun, now = Date.now()) => now >= Date.parse(run.endsAt);

/** An incident is on the queue once its arrival time has passed. */
export const incidentArrived = (inc: IncidentRun, elapsedSec: number) => elapsedSec >= inc.arriveSec;

/** Was the incident resolved before its deadline (deadline measured from arrival)? */
export function resolvedOnTime(inc: IncidentRun): boolean {
  if (inc.resolvedAtSec === null) return false;
  return inc.resolvedAtSec - inc.arriveSec <= inc.deadlineSec;
}

/**
 * The Shift engine, fired at a real domain controller.
 *
 *   npm run check:shift:live -- <userId> [idFilter]
 *
 * check:shift reads the library and catches what can be read without a lab: a
 * script that is not published, an argument a script does not take, a
 * diagnosis nobody can answer. It fires nothing, so it cannot say whether an
 * incident actually happens when it is fired at a Windows domain.
 *
 * This fires each one at a real pod and reads the lab back, asking four
 * questions only a live run can answer:
 *
 *   1. Does the script run on a domain controller at all?
 *   2. Does the damage reach the snapshot, so the resolve checks fail? An
 *      incident whose checks already pass the moment it fires is handed to the
 *      student pre-solved and closes on their first click.
 *   3. Does evidence() ever see the attack, and how long does it take? The
 *      digest only rides a heavy snapshot, so this is the delay a student
 *      spends being told their correct fix has not landed.
 *   4. Does -Undo put the lab back? A shift that leaves its mess behind
 *      poisons the next shift and every mission reading the same objects.
 *
 * Needs a running pod and the lab's AWS credentials in the environment. It
 * does nothing a real shift does not do, and undoes each incident before the
 * next one fires.
 */
import { INCIDENTS, effectiveIncident, gradeIncidentLab, type IncidentDef } from "@/lib/academy-shift";
import { injectIncident, cleanupShiftLab, requestLabSync, hostedLabStatus } from "@/lib/academy-hosted";
import { loadLabState } from "@/lib/academy-store";

const userId = process.argv[2];
const only = process.argv[3];
if (!userId) {
  console.error("usage: npm run check:shift:live -- <userId> [idFilter]");
  process.exit(1);
}

const LAND_WAIT_MS = 120_000;
const UNDO_WAIT_MS = 120_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// A fixed picker, so a rerun fires the same victims and a failure can be
// reproduced. The real shift picks at random; the shape is identical.
const pick = <T,>(arr: T[]): T => arr[0];

type Row = {
  id: string;
  script: string;
  fired: boolean;
  landedSec: number | null;
  evidenceSec: number | null;
  undoneSec: number | null;
  notes: string[];
};

/**
 * Waits for the lab to satisfy `want`, nudging it along the way.
 *
 * A forced sync sends -Fast, which leaves the Security-log digest out on
 * purpose, so evidence() can only change on the sync loop's own heartbeat.
 * That is why this waits rather than polling harder: the number it returns is
 * the delay a student would sit through.
 */
async function waitFor(want: (snap: Awaited<ReturnType<typeof loadLabState>>) => boolean, budgetMs: number): Promise<number | null> {
  const began = Date.now();
  let nudged = 0;
  while (Date.now() - began < budgetMs) {
    const snap = await loadLabState(userId).catch(() => null);
    if (want(snap)) return Math.round((Date.now() - began) / 1000);
    // A nudge every 15s picks up directory changes the watch loop missed.
    if (Date.now() - began > nudged * 15_000) {
      nudged += 1;
      void requestLabSync(userId, true);
    }
    await sleep(2000);
  }
  return null;
}

async function main() {
  const status = await hostedLabStatus(userId);
  if (status.state !== "ready") {
    console.error(`The lab is ${status.state}. Start it before running this.`);
    process.exit(1);
  }

  const list: IncidentDef[] = only ? INCIDENTS.filter((i) => only.split(",").some((o) => i.id.includes(o.trim()))) : INCIDENTS;
  console.log(`Lab is ready. Firing ${list.length} incident(s) at it, one at a time.\n`);
  const rows: Row[] = [];

  for (const def of list) {
    const eff = effectiveIncident(def, { bind: def.bind?.(pick) });
    const args = eff.args;
    const row: Row = { id: def.id, script: def.script, fired: false, landedSec: null, evidenceSec: null, undoneSec: null, notes: [] };
    rows.push(row);
    process.stdout.write(`${def.id.padEnd(22)} `);

    // How the lab reads before anything is fired. The undo is judged against
    // this rather than against an assumption, and an incident whose checks
    // already fail here cannot tell us whether it landed.
    const answer = eff.diagnosis.accept[0] ?? "";
    const before = await loadLabState(userId).catch(() => null);
    const gradeBefore = before ? gradeIncidentLab({ ...eff, evidence: undefined }, before.snapshot, answer) : null;
    const wasResolved = gradeBefore?.resolved ?? false;
    const hadNoHarm = gradeBefore?.noHarm ?? true;

    row.fired = await injectIncident(userId, def.script, args);
    if (!row.fired) {
      row.notes.push("injectIncident returned false");
      console.log("FIRE FAILED");
      continue;
    }

    // Landed: the student has done nothing, so the resolve checks must fail.
    // The diagnosis is handed in correct on purpose; this is the lab half.
    const damaged = (s: Awaited<ReturnType<typeof loadLabState>>) =>
      Boolean(s) && gradeIncidentLab({ ...eff, evidence: undefined }, s!.snapshot, answer).resolved === false;
    if (!wasResolved) {
      row.notes.push("its checks already failed before it fired, so this run cannot say whether it landed");
    } else {
      row.landedSec = await waitFor(damaged, LAND_WAIT_MS);
      if (row.landedSec === null) row.notes.push("the damage never reached the snapshot, so the student is handed it already resolved");
    }

    // Evidence: only arrives on a heavy snapshot, so this is the real delay.
    if (eff.evidence) {
      row.evidenceSec = await waitFor((s) => Boolean(eff.evidence!(s?.snapshot.events)), LAND_WAIT_MS);
      if (row.evidenceSec === null) row.notes.push("evidence() never saw the attack, so the incident can never be closed");
    }

    // Undo: the lab goes back to how it was, which is not the same as the
    // resolve checks passing. Plenty of incidents are closed by work the
    // student does -- adding a member, disabling an account -- so their
    // checks read false before the incident fires and still read false after
    // it is undone. Asking for "resolved" here called seven good undos
    // failures. The question is whether the lab reads as it did before.
    await cleanupShiftLab(userId, [{ script: def.script, args }]);
    const sameAsBefore = (s: Awaited<ReturnType<typeof loadLabState>>) => {
      if (!s) return false;
      const g = gradeIncidentLab({ ...eff, evidence: undefined }, s.snapshot, answer);
      return g.resolved === wasResolved && g.noHarm === hadNoHarm;
    };
    row.undoneSec = await waitFor(sameAsBefore, UNDO_WAIT_MS);
    if (row.undoneSec === null) row.notes.push("-Undo left the lab different from how it found it, so the next shift starts dirty");

    const n = (v: number | null, skip = "  -") => (v === null ? "FAIL" : `${v}s`.padStart(4));
    console.log(`fired  landed ${n(row.landedSec)}  evidence ${eff.evidence ? n(row.evidenceSec) : "  - "}  undone ${n(row.undoneSec)}${row.notes.length ? "   <-- " + row.notes[0] : ""}`);
  }

  console.log("\n--- summary ---");
  const bad = rows.filter((r) => r.notes.length);
  console.log(`${rows.length} fired, ${rows.length - bad.length} clean, ${bad.length} with a problem`);
  for (const r of bad) console.log(`  ${r.id} (${r.script}): ${r.notes.join("; ")}`);
  const ev = rows.map((r) => r.evidenceSec).filter((v): v is number => v !== null);
  if (ev.length) console.log(`\nevidence delay: min ${Math.min(...ev)}s, max ${Math.max(...ev)}s, median ${ev.sort((a, b) => a - b)[Math.floor(ev.length / 2)]}s`);
  process.exit(bad.length ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

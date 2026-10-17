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
import { loadHostedLab, loadLabState } from "@/lib/academy-store";
import { remediate } from "./remediate";
import { SSMClient, SendCommandCommand, GetCommandInvocationCommand } from "@aws-sdk/client-ssm";

const userId = process.argv[2];
const only = process.argv[3];
if (!userId) {
  console.error("usage: npm run check:shift:live -- <userId> [idFilter]");
  process.exit(1);
}

const LAND_WAIT_MS = 120_000;
const UNDO_WAIT_MS = 120_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Deterministic, so a rerun fires the same victims and a failure can be
// reproduced, but rotated per incident rather than always taking the first.
// Always picking arr[0] pointed all seventeen rotating incidents at the same
// person, so each one inherited the state the last one's fix had left on her:
// half the run reported "its checks already failed before it fired" when the
// only thing wrong was that they were queueing for one account. The real
// shift picks at random and never sees this.
let victimOffset = 0;
const pick = <T,>(arr: T[]): T => arr[victimOffset % arr.length];

/**
 * Plays the student: runs the fix the resolve checks describe.
 *
 * Firing an incident proves the damage appears. It says nothing about whether
 * doing the right thing closes it, and that is the half a paying student
 * meets. It is also the only way to test the four ticket-kind incidents at
 * all, because they plant no damage -- they ask for work.
 */
const ssm = new SSMClient({
  region: process.env.HOSTED_LAB_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.HOSTED_LAB_AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.HOSTED_LAB_AWS_SECRET_ACCESS_KEY || "",
  },
});

async function runOnPod(instanceId: string, lines: string[]): Promise<string> {
  const out = await ssm.send(
    new SendCommandCommand({
      InstanceIds: [instanceId],
      DocumentName: "AWS-RunPowerShellScript",
      Comment: "Range live shift test: remediation",
      TimeoutSeconds: 240,
      Parameters: { commands: ["$ErrorActionPreference='Continue'", "$d = Get-ADDomain", ...lines] },
    })
  );
  const id = out.Command?.CommandId;
  if (!id) return "no command id";
  for (let i = 0; i < 40; i += 1) {
    await sleep(3000);
    const inv = await ssm.send(new GetCommandInvocationCommand({ CommandId: id, InstanceId: instanceId })).catch(() => null);
    if (inv && inv.Status !== "InProgress" && inv.Status !== "Pending") return `${inv.Status}: ${(inv.StandardErrorContent ?? "").slice(0, 200)}`;
  }
  return "timed out";
}

/**
 * Everything an incident could plausibly change, as one string.
 *
 * "Did it land" cannot be read from the resolve checks alone. A ticket-kind
 * incident plants no damage alarm -- it asks for work -- and an incident that
 * creates an account has a check that reads false both before it fires and
 * after, because a missing account is not a disabled one. Comparing the lab
 * to itself answers the question for every kind.
 */
function fingerprint(s: { snapshot: import("@/lib/academy-lab").LabSnapshot } | null): string {
  if (!s) return "";
  const u = s.snapshot.users
    .map((x) => [x.sam, x.enabled, x.lockedOut, x.passwordNeverExpires, x.passwordExpired, x.pwdNotRequired, x.noPreAuth, x.delegation, x.spns, x.container, x.description, (x.memberOf ?? []).join("|")].join(","))
    .sort();
  const g = s.snapshot.groups.map((x) => [x.name, x.category, (x.members ?? []).join("|")].join(",")).sort();
  const c = s.snapshot.computers.map((x) => [x.name, x.enabled, x.container].join(",")).sort();
  return JSON.stringify([u, g, c, s.snapshot.security?.passwordPolicy ?? null, s.snapshot.security?.audit ?? null, s.snapshot.security?.psos ?? null]);
}

type Row = {
  id: string;
  script: string;
  fired: boolean;
  landedSec: number | null;
  evidenceSec: number | null;
  solvedSec: number | null;
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

  // The pod to run the student's half on, read the same way the app reads it.
  const instanceId = (await loadHostedLab(userId))?.instanceId ?? null;
  if (!instanceId) console.log("No running pod found, so solvability will not be tested.");

  const list: IncidentDef[] = only ? INCIDENTS.filter((i) => only.split(",").some((o) => i.id.includes(o.trim()))) : INCIDENTS;
  console.log(`Lab is ready. Firing ${list.length} incident(s) at it, one at a time.\n`);
  const rows: Row[] = [];

  for (const [n, def] of list.entries()) {
    victimOffset = n;
    const eff = effectiveIncident(def, { bind: def.bind?.(pick) });
    const args = eff.args;
    const row: Row = { id: def.id, script: def.script, fired: false, landedSec: null, evidenceSec: null, solvedSec: null, undoneSec: null, notes: [] };
    rows.push(row);
    process.stdout.write(`${def.id.padEnd(22)} `);

    // How the lab reads before anything is fired. The undo is judged against
    // this rather than against an assumption, and an incident whose checks
    // already fail here cannot tell us whether it landed.
    const answer = eff.diagnosis.accept[0] ?? "";
    const beforeLab = await loadLabState(userId).catch(() => null);
    const gradeBefore = beforeLab ? gradeIncidentLab({ ...eff, evidence: undefined }, beforeLab.snapshot, answer) : null;
    const wasResolved = gradeBefore?.resolved ?? false;
    const hadNoHarm = gradeBefore?.noHarm ?? true;

    row.fired = await injectIncident(userId, def.script, args);
    if (!row.fired) {
      row.notes.push("injectIncident returned false");
      console.log("FIRE FAILED");
      continue;
    }

    // Landed: the lab is different from how it was. This has to be waited for
    // whatever else is measured, because the student's fix below goes out as
    // its own command: skipping the wait raced the two, and an incident whose
    // job is to remove somebody from a group simply removed them again after
    // the fix had put them back.
    const before = fingerprint(beforeLab);
    row.landedSec = await waitFor((sn) => fingerprint(sn) !== before, LAND_WAIT_MS);
    if (row.landedSec === null) {
      // A ticket is a request, not an attack. Its script only guarantees the
      // starting state -- access-request makes sure the person is out of the
      // group they are asking for -- so on a clean lab it has nothing to
      // change, and that is the design rather than a fault. Whether doing the
      // work closes it is the real test for these, and that is measured
      // below.
      if (def.kind !== "ticket") row.notes.push("firing it changed nothing in the lab at all");
    } else if (wasResolved) {
      // It also has to leave its own checks failing, or the student is handed
      // it already resolved and it closes on their first click.
      const damaged = (sn: Awaited<ReturnType<typeof loadLabState>>) =>
        Boolean(sn) && gradeIncidentLab({ ...eff, evidence: undefined }, sn!.snapshot, answer).resolved === false;
      if ((await waitFor(damaged, 30_000)) === null) {
        row.notes.push("the damage never reached its own checks, so the student is handed it already resolved");
      }
    }

    // Evidence: only arrives on a heavy snapshot, so this is the real delay.
    if (eff.evidence) {
      row.evidenceSec = await waitFor((s) => Boolean(eff.evidence!(s?.snapshot.events)), LAND_WAIT_MS);
      if (row.evidenceSec === null) row.notes.push("evidence() never saw the attack, so the incident can never be closed");
    }

    // Solved: play the student and do what the checks ask for. This is the
    // half that matters -- a student does not care that the damage appeared,
    // they care that fixing it closes the incident -- and it is the only way
    // to test an incident that plants no damage at all.
    const fixes = eff.resolve.map((r) => remediate(r.c));
    if (fixes.some((f) => f === null)) {
      row.notes.push(`no scripted fix for ${eff.resolve.filter((_, i) => fixes[i] === null).map((r) => r.c.t).join("/")}, so solvability is untested`);
    } else if (instanceId) {
      const ran = await runOnPod(instanceId, fixes as string[]);
      if (!ran.startsWith("Success")) row.notes.push(`the fix would not run on the pod (${ran})`);
      const solved = (sn: Awaited<ReturnType<typeof loadLabState>>) =>
        Boolean(sn) && gradeIncidentLab(eff, sn!.snapshot, answer).resolved;
      row.solvedSec = await waitFor(solved, LAND_WAIT_MS);
      if (row.solvedSec === null) row.notes.push("doing exactly what the checks ask for does not close it");
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

    const fmt = (v: number | null) => (v === null ? "FAIL" : `${v}s`.padStart(4));
    console.log(
      `fired  landed ${fmt(row.landedSec)}  evidence ${eff.evidence ? fmt(row.evidenceSec) : "  - "}  solved ${fmt(row.solvedSec)}  undone ${fmt(row.undoneSec)}` +
        (row.notes.length ? "   <-- " + row.notes[0] : "")
    );
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

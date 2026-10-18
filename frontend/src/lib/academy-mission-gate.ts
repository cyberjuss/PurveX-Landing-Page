import "server-only";
import { after } from "next/server";
import { repairHostedLab, requestLabSync } from "@/lib/academy-hosted";
import { formatLabAge, labIsLive } from "@/lib/academy-lab";
import { checkMission, hasMissionObjects, hasTicketObjects, missionGate } from "@/lib/academy-mission-lab";
import { loadLabState, loadProgress, saveProgress, touchLabLive } from "@/lib/academy-store";
import { LIVE_MINUTES } from "@/lib/academy-verify";
import { confirmOnLab } from "@/lib/academy-lab-pull";

/**
 * How old a snapshot has to be before the lab's own sync loop looks dead.
 *
 * That loop watches the directory's highest USN every 150ms and sends within a
 * quarter second of a change, and it sends a full heartbeat every minute even
 * when nothing moves. So anything fresher than a missed heartbeat is a lab that
 * is already reporting, and poking it over SSM only starts a second PowerShell
 * to re-read the same tree on two vCPUs.
 */
const LOOP_LOOKS_DEAD_MS = 75_000;

export type LabGate = {
  gated: boolean;
  passed: boolean;
  noLab?: boolean;
  stale?: boolean;
  noTicketObjects?: boolean;
  results?: { label: string; ok: boolean }[];
  syncedAgo?: string;
};

// Can the student answer this challenge? Every challenge is done in the
// student's own lab, so the lab must be connected and live (the green lab
// light). Hands-on tickets also stay open until the lab shows the change.
export async function labGate(student: { id: string; email: string | null }, id: string): Promise<LabGate> {
  const gated = Boolean(missionGate(id));
  const lab = await loadLabState(student.id);
  if (!lab) return { gated, passed: false, noLab: true, results: [] };
  // On a hosted lab whose sync loop has gone quiet, push a snapshot now. A
  // live loop needs no help, and this used to run on every poll: two AWS
  // describes every 2.5 seconds, plus a second PowerShell competing with the
  // loop for the domain controller. after() so the work survives the response,
  // which a bare void did not promise.
  if (Date.now() - Date.parse(lab.uploadedAt) > LOOP_LOOKS_DEAD_MS) {
    after(() => requestLabSync(student.id).then(() => undefined).catch(() => undefined));
  }
  const syncedAgo = formatLabAge(lab.uploadedAt).ago;
  if (!labIsLive(lab.uploadedAt)) {
    // Asks the lab script to sync every minute, so a running lab turns green soon.
    await touchLabLive(student.id, LIVE_MINUTES).catch(() => {});
    return { gated, passed: false, stale: true, syncedAgo, results: [] };
  }
  if (!gated) return { gated: false, passed: true, syncedAgo };

  // A lab built before this ticket shipped is missing its objects. Ask the pod
  // to replant what it is missing, so the student is not stuck on a reset, then
  // report it for this turn. The repair is throttled and only plants what is
  // absent, so it never touches a change the student already made.
  if (!hasTicketObjects(lab.snapshot) || !hasMissionObjects(id, lab.snapshot)) {
    void repairHostedLab(student.id);
    return { gated: true, passed: false, noTicketObjects: true, results: [] };
  }
  const checked = checkMission(id, lab.snapshot);
  if (!checked?.passed) await touchLabLive(student.id, LIVE_MINUTES).catch(() => {});
  // The server records that the change was seen. This is the only place labOk is ever set.
  if (checked?.passed) {
    const results = await loadProgress(student.id);
    // Once per ticket: the gate is polled while the page waits, and a command
    // to the lab on every poll would be one every few seconds.
    if (!results[id]?.labOk) {
      // The lab's own report says the change is there. On a hosted lab, ask
      // the domain controller directly before it counts: a report the lab
      // contradicts is not a pass, and one it confirms is Verified by Range.
      const pull = await confirmOnLab(student.id, missionGate(id)?.checks ?? []);
      if (pull.status === "contradicted") {
        console.warn("lab report contradicted by the lab itself", student.id, id);
        return { gated: true, passed: false, results: pull.results, syncedAgo };
      }
      results[id] = {
        ...(results[id] ?? { solved: false, wrong: 0, hint: false }),
        labOk: true,
        ...(pull.status === "confirmed" ? { labVerified: true } : {}),
        at: new Date().toISOString(),
      };
      await saveProgress(student.id, student.email, results);
    }
  }
  return { gated: true, passed: false, ...checked, syncedAgo };
}

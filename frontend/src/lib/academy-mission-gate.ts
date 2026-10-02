import "server-only";
import { requestLabSync } from "@/lib/academy-hosted";
import { formatLabAge, labIsLive } from "@/lib/academy-lab";
import { checkMission, hasMissionObjects, hasTicketObjects, missionGate } from "@/lib/academy-mission-lab";
import { loadLabState, loadProgress, saveProgress, touchLabLive } from "@/lib/academy-store";
import { LIVE_MINUTES } from "@/lib/academy-verify";

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
  // On a hosted lab, push a fresh snapshot now so a just-made change lands in
  // seconds instead of waiting for the sync loop's heartbeat. Best effort, throttled.
  void requestLabSync(student.id);
  const syncedAgo = formatLabAge(lab.uploadedAt).ago;
  if (!labIsLive(lab.uploadedAt)) {
    // Asks the lab script to sync every minute, so a running lab turns green soon.
    await touchLabLive(student.id, LIVE_MINUTES).catch(() => {});
    return { gated, passed: false, stale: true, syncedAgo, results: [] };
  }
  if (!gated) return { gated: false, passed: true, syncedAgo };

  // A lab built without -IncludeCTF has none of the ticket objects.
  if (!hasTicketObjects(lab.snapshot) || !hasMissionObjects(id, lab.snapshot)) return { gated: true, passed: false, noTicketObjects: true, results: [] };
  const checked = checkMission(id, lab.snapshot);
  if (!checked?.passed) await touchLabLive(student.id, LIVE_MINUTES).catch(() => {});
  // The server records that the change was seen. This is the only place labOk is ever set.
  if (checked?.passed) {
    const results = await loadProgress(student.id);
    if (!results[id]?.labOk) {
      results[id] = { ...(results[id] ?? { solved: false, wrong: 0, hint: false }), labOk: true, at: new Date().toISOString() };
      await saveProgress(student.id, student.email, results);
    }
  }
  return { gated: true, passed: false, ...checked, syncedAgo };
}

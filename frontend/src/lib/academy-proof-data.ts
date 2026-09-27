import "server-only";
import { roleLabel, type RoleId } from "@/lib/academy-certs";
import { buildSkills, buildWorkItems, SHOTS_PER_ITEM, TRACK_FOR_ROLE, type Track, type WorkItem } from "@/lib/academy-proof";
import { listShots, loadProofSettings, type ProofSettings, type ProofShot } from "@/lib/academy-proof-store";
import { loadDrills, loadLabState, loadProfile, loadProgress } from "@/lib/academy-store";

export type ProofData = {
  items: WorkItem[];
  skills: { group: string; items: string[] }[];
  role: RoleId | null;
  roleName: string | null;
  track: Track;
  lastLabCheck: string | null;
  settings: ProofSettings | null;
  shots: ProofShot[];
};

/** Everything the profile shows, read fresh from the student's own records. */
export async function loadProofData(userId: string): Promise<ProofData> {
  const [results, drills, lab, profile, settings, shots] = await Promise.all([
    loadProgress(userId),
    loadDrills(userId),
    loadLabState(userId),
    loadProfile(userId),
    loadProofSettings(userId),
    listShots(userId),
  ]);
  const items = buildWorkItems(results, drills);
  const role = profile?.roles[0] ?? null;
  return {
    items,
    skills: buildSkills(items, Boolean(lab), drills.some((d) => d.mode === "ctf")),
    role,
    roleName: role ? roleLabel(role) : null,
    track: role ? TRACK_FOR_ROLE[role] : "soc",
    lastLabCheck: lab?.uploadedAt ?? null,
    settings,
    shots,
  };
}

/** Why the profile cannot be shared yet. Empty means it can. */
export function shareBlockers(items: WorkItem[], shotsOn: string[], shots: ProofShot[]): string[] {
  const out: string[] = [];
  if (!items.length) out.push("Finish a lab task or Ticket Queue ticket first. Your profile shows confirmed lab work.");
  for (const it of items) {
    if (!shotsOn.includes(it.job)) continue;
    const n = shots.filter((s) => s.job === it.job).length;
    if (n < SHOTS_PER_ITEM) out.push(`Add ${SHOTS_PER_ITEM - n} more screenshot${SHOTS_PER_ITEM - n === 1 ? "" : "s"} to “${it.title}”, or turn its screenshots off.`);
  }
  return out;
}

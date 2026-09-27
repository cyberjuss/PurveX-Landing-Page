import "server-only";
import { CERT_IDS, CERTS, roleLabel, type RoleId, type StudentProfile } from "@/lib/academy-certs";
import { buildSkills, buildWorkItems, TRACK_FOR_ROLE, type Track, type WorkItem } from "@/lib/academy-proof";
import { listShots, loadProofSettings, type ProofSettings, type ProofShot } from "@/lib/academy-proof-store";
import { loadDrills, loadLabState, loadProfile, loadProgress } from "@/lib/academy-store";

export type ProofData = {
  items: WorkItem[];
  skills: { group: string; items: string[] }[];
  role: RoleId | null;
  roleName: string | null;
  /** Every target role the student picked in Goals. */
  roleNames: string[];
  /** Certifications worth showing an employer: earned, or being studied for. */
  certs: { name: string; status: string }[];
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
    roleNames: (profile?.roles ?? []).map(roleLabel),
    certs: certLines(profile),
    track: role ? TRACK_FOR_ROLE[role] : "soc",
    lastLabCheck: lab?.uploadedAt ?? null,
    settings,
    shots,
  };
}

/** Why the profile cannot be shared yet. Empty means it can. */
export function shareBlockers(items: WorkItem[]): string[] {
  const out: string[] = [];
  if (!items.length) out.push("Finish a lab task or Ticket Queue ticket first. Your portfolio shows confirmed lab work.");
  return out;
}

/** "Certified", "Exam booked Nov 18" or "Studying now", from the student's Goals. */
function certLines(profile: StudentProfile | null): { name: string; status: string }[] {
  if (!profile) return [];
  const out: { name: string; status: string }[] = [];
  for (const id of CERT_IDS) {
    const g = profile.certs[id];
    if (g.status === "earned") out.push({ name: CERTS[id].full, status: "Certified" });
    else if (g.status === "studying") {
      const booked = g.examDate ? new Date(`${g.examDate}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;
      out.push({ name: CERTS[id].full, status: booked ? `Exam booked ${booked}` : "Studying now" });
    }
  }
  return out;
}

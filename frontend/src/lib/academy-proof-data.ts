import "server-only";
import { CERT_IDS, CERTS, roleLabel, type RoleId, type StudentProfile } from "@/lib/academy-certs";
import { buildSkills, buildWorkItems, TRACK_FOR_ROLE, type Track, type WorkItem } from "@/lib/academy-proof";
import { listClips } from "@/lib/academy-clips";
import { competencyBadges, type CompetencyBadge } from "@/lib/academy-competencies";
import { jobProgress } from "@/lib/academy-drills";
import { currentRank } from "@/lib/academy-badges";
import { summarize } from "@/lib/academy-score";
import { CHALLENGE_LABELS } from "@/lib/academy-missions";
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
  /** Verified challenge recordings, live on the profile. No storage paths: the page links through /p/<slug>/clip/<id>. */
  clips: ProofClip[];
  /** The core job skills, rated from the same task status the work items come from. */
  competencies: CompetencyBadge[];
  /** The rank badge an employer sees, from Help Desk Analyst up. Trainee is not worth showing. */
  rank: { id: string; title: string } | null;
  /** At or above the Ready bar, which adds the gold rim. */
  ready: boolean;
};

export type ProofClip = { id: string; title: string; durationSec: number; solvedAt: string | null; recordedAt: string | null; hasPoster: boolean };

/** Everything the profile shows, read fresh from the student's own records. */
export async function loadProofData(userId: string): Promise<ProofData> {
  const [results, drills, lab, profile, settings, shots, clips] = await Promise.all([
    loadProgress(userId),
    loadDrills(userId),
    loadLabState(userId),
    loadProfile(userId),
    loadProofSettings(userId),
    listShots(userId),
    listClips(userId, true),
  ]);
  const items = buildWorkItems(results, drills);
  const jobRows = jobProgress(drills, results, lab?.snapshot).map((j) => ({ id: j.id, status: j.status }));
  // A confirmed portfolio item proves its task even when the task is not one the daily drill tracks.
  for (const it of items) if (!jobRows.some((j) => j.id === it.job)) jobRows.push({ id: it.job, status: "proven" as const });
  const competencies = competencyBadges(jobRows);
  const role = profile?.roles[0] ?? null;
  return {
    items,
    skills: buildSkills(items, Boolean(lab), drills.some((d) => d.mode === "ctf"), results),
    role,
    roleName: role ? roleLabel(role) : null,
    roleNames: (profile?.roles ?? []).map(roleLabel),
    certs: certLines(profile),
    track: role ? TRACK_FOR_ROLE[role] : "soc",
    lastLabCheck: lab?.uploadedAt ?? null,
    settings,
    shots,
    competencies,
    rank: rankShown(results),
    ready: summarize(results).level === "ready",
    clips: clips.map((c) => ({ id: c.id, title: CHALLENGE_LABELS[c.challenge], durationSec: c.durationSec, solvedAt: c.solvedAt, recordedAt: c.recordedAt, hasPoster: Boolean(c.posterPath) })),
  };
}

function rankShown(results: Parameters<typeof currentRank>[0]): ProofData["rank"] {
  const r = currentRank(results);
  return r && r.id !== "trainee" ? { id: r.id, title: r.title } : null;
}

/** Why the profile cannot be shared yet. Empty means it can. */
export function shareBlockers(items: WorkItem[]): string[] {
  const out: string[] = [];
  if (!items.length) out.push("Finish a lab task or Ticket Queue ticket first. The portfolio shows confirmed lab work.");
  return out;
}

/** "Certified", "Exam booked Nov 18" or "Studying now", from the student's Goals. */
function certLines(profile: StudentProfile | null): { name: string; status: string }[] {
  if (!profile) return [];
  const out: { name: string; status: string }[] = [];
  for (const id of CERT_IDS) {
    const g = profile.certs[id];
    if (g.status === "earned") {
      const on = g.earnedDate ? new Date(`${g.earnedDate}T00:00:00`).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : null;
      out.push({ name: CERTS[id].full, status: on ? `Certified · ${on}` : "Certified" });
    }
    else if (g.status === "studying") {
      const booked = g.examDate ? new Date(`${g.examDate}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : null;
      out.push({ name: CERTS[id].full, status: booked ? `Exam booked ${booked}` : "Studying now" });
    }
  }
  return out;
}

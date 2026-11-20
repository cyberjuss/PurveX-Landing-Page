import { LAB_GATED_MISSIONS, MISSION_CATALOG, type MissionCatalogEntry } from "@/lib/academy-missions";
import { MISSION_SKILLS, SCORE_SOLID, SKILLS, summarize, type Results, type Skill } from "@/lib/academy-score";

// Rank and skill badges, read from the same results readiness uses. Nothing
// here is stored: a rank or a badge is what the student's record shows today.

type ChallengeKey = MissionCatalogEntry["challenge"];

const missionsOf = (key: ChallengeKey) => Object.values(MISSION_CATALOG).filter((m) => m.challenge === key).map((m) => m.id);

/** Every mission in the challenge solved. */
export function challengeFinished(results: Results, key: ChallengeKey): boolean {
  const ids = missionsOf(key);
  return ids.length > 0 && ids.every((id) => results[id]?.solved);
}

export type Rank = {
  id: string;
  title: string;
  /** What earns it, in one line a student can act on. */
  earn: string;
  /** Opens with a phase that is not out yet. */
  soon?: boolean;
};

const HELP_DESK: ChallengeKey[] = ["day-one", "ticket-queue", "new-hire-week"];
const PHASE_ONE: ChallengeKey[] = [...HELP_DESK, "client-data", "weekend-incident-report", "tuesday-after-breach", "network-change", "access-review"];

export const RANKS: Rank[] = [
  { id: "trainee", title: "Trainee", earn: "Solve your first challenge question." },
  { id: "help-desk", title: "Help Desk Analyst", earn: "Finish Operation Day One, the Ticket Queue and A New Hire's First Week." },
  { id: "junior-soc", title: "Junior SOC Analyst", earn: "Finish every Phase 1 challenge and reach Ready." },
  { id: "soc-tier-2", title: "SOC Analyst, Tier 2", earn: "Opens with Phase 2.", soon: true },
  { id: "incident-responder", title: "Incident Responder", earn: "Opens with Phase 3.", soon: true },
];

/** How many ranks this record has earned, 0 for none yet. */
export function rankIndex(results: Results): number {
  const s = summarize(results);
  if (s.finished === 0) return 0;
  if (!HELP_DESK.every((k) => challengeFinished(results, k))) return 1;
  if (!(PHASE_ONE.every((k) => challengeFinished(results, k)) && s.level === "ready")) return 2;
  return 3;
}

/** The rank held now, or null before the first solve. */
export function currentRank(results: Results): Rank | null {
  const i = rankIndex(results);
  return i === 0 ? null : RANKS[i - 1];
}

export type BadgeTier = "practiced" | "proficient" | "verified";
export const TIER_LABEL: Record<BadgeTier, string> = { practiced: "Practiced", proficient: "Proficient", verified: "Verified" };

export type SkillBadge = {
  skill: Skill;
  title: string;
  tier: BadgeTier | null;
  /** What the next tier needs, or null at the top. */
  next: string | null;
  /** Solves the lab confirmed, against what Verified asks for. */
  labDone: number;
  labNeeded: number;
};

/** Lab-confirmed solves a skill needs for Verified: three, or every lab-checked mission it has if fewer. */
const VERIFIED_LAB_SOLVES = 3;

export function skillBadges(results: Results): SkillBadge[] {
  const s = summarize(results);
  const gated = new Set<string>(LAB_GATED_MISSIONS);
  return s.skills.map((k) => {
    const ids = Object.keys(MISSION_SKILLS).filter((id) => MISSION_SKILLS[id] === k.key);
    const labIds = ids.filter((id) => gated.has(id));
    const labNeeded = Math.min(VERIFIED_LAB_SOLVES, labIds.length);
    const labDone = labIds.filter((id) => results[id]?.solved && results[id]?.labOk).length;
    const proficient = k.rated && k.score !== null && k.score >= SCORE_SOLID;
    const verified = proficient && labNeeded > 0 && labDone >= labNeeded;
    const tier: BadgeTier | null = verified ? "verified" : proficient ? "proficient" : k.rated ? "practiced" : null;
    const half = Math.ceil(k.total / 2);
    const next =
      tier === null
        ? k.total === 1
          ? "Finish its one mission."
          : `Finish ${half - k.done} more of its ${k.total} missions.`
        : tier === "practiced"
          ? `Score ${SCORE_SOLID} or more on its missions.`
          : tier === "proficient"
            ? labNeeded > 0
              ? `Have your lab confirm ${labNeeded - labDone} more of its fixes.`
              : null
            : null;
    return { skill: k.key, title: SKILLS[k.key].label, tier, next, labDone, labNeeded };
  });
}

/** Two letters for a badge's seal: "Accounts and Groups" is AG, "Risk Triage" is RT. */
export function badgeInitials(title: string): string {
  return title
    .split(/\s+/)
    .filter((w) => w.toLowerCase() !== "and")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

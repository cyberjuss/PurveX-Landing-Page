import { MISSION_CATALOG, type MissionCatalogEntry } from "@/lib/academy-missions";
import { summarize, type Results } from "@/lib/academy-score";

// The rank, read from the same results readiness uses. Nothing here is
// stored: a rank is what the student's record shows today. The skill badges
// are the job competencies in academy-competencies.ts.

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

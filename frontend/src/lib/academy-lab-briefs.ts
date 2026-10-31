import type { RoleId } from "@/lib/academy-certs";

// There are no more browser-widget labs -- every "Lab:" section is now real
// markdown, and the skill that used to live in the risk-triage chat widget
// moved into the "Challenge: Monday Morning Risk Triage" mission chain
// instead. This module stays only because the coach (academy-coach.ts,
// academy-coach-mode.ts, academy-activity.ts) still imports isBrowserLab as
// a general "is this place a browser lab" check.

export interface LabBrief {
  problem: string;
  today: string;
  objective: Record<RoleId, string>;
  objectiveDefault: string;
  tools: string[];
  minutes: number;
}

export const LAB_BRIEFS: Record<string, LabBrief> = {};

export const BROWSER_LABS: string[] = [];
export const isBrowserLab = (_v: unknown): _v is never => false;

/** The objective for the student's first target role, or the general one. Never called: no id ever passes isBrowserLab. */
export function labObjective(lab: string, roles: RoleId[] | undefined): { text: string; role: RoleId | null } {
  const brief = LAB_BRIEFS[lab];
  const role = roles?.find((r) => brief.objective[r]) ?? null;
  return role ? { text: brief.objective[role], role } : { text: brief.objectiveDefault, role: null };
}

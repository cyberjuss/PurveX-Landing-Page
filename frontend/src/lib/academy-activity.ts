import { isBrowserLab } from "@/lib/academy-lab-briefs";
import type { LabWidget } from "@/lib/academy-content";

// Where a student is in the Academy: the page, the tab, and inside a browser
// lab the step. The page reports it so MCP clients, which cannot see the
// screen, know where the student left off.

export const ACTIVITY_KINDS = ["section", "quiz", "lab", "challenge", "troubleshooting"] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export type ActivityPlace = { phase: string; entry: string; tab: string; kind: ActivityKind; lab?: LabWidget; at?: string };
export type StudentActivity = { place: ActivityPlace; updatedAt: string };

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");

/** Shape check only. The route also checks the page exists. */
export function sanitizeActivityPlace(value: unknown): ActivityPlace | null {
  const v = (value ?? {}) as Record<string, unknown>;
  const phase = clean(v.phase, 40);
  const entry = clean(v.entry, 60);
  const tab = clean(v.tab, 120);
  const kind = ACTIVITY_KINDS.find((k) => k === v.kind);
  if (!phase || !entry || !tab || !kind) return null;
  const place: ActivityPlace = { phase, entry, tab, kind };
  if (kind === "lab" && isBrowserLab(v.lab)) place.lab = v.lab;
  const at = clean(v.at, 200);
  if (place.lab && at) place.at = at;
  return place;
}

// The Desk's live feed: the newest events from the student's own Security log,
// one line each, the way a SOC wall screen shows them.

import type { LabEvents } from "@/lib/academy-lab";

export type FeedTone = "bad" | "warn" | "info";
export type FeedRow = { at: string; id: number; what: string; who: string; tone: FeedTone; count?: number };

/** The newest events in the digest, newest first. Counted events use their last time. */
export function labFeed(e: LabEvents, limit = 12): FeedRow[] {
  const rows: FeedRow[] = [
    ...e.failures.filter((f) => f.last).map((f) => ({ at: f.last!, id: 4625, what: "Failed sign-in", who: f.account, tone: "warn" as const, count: f.count })),
    ...e.lockouts.filter((f) => f.last).map((f) => ({ at: f.last!, id: 4740, what: "Account locked out", who: f.account, tone: "bad" as const, count: f.count })),
    ...e.created.map((c) => ({ at: c.at, id: 4720, what: "Account created", who: by(c.account, c.by), tone: "info" as const })),
    ...e.disabled.map((c) => ({ at: c.at, id: 4725, what: "Account disabled", who: by(c.account, c.by), tone: "info" as const })),
    ...e.groupAdds.map((g) => ({ at: g.at, id: 4728, what: `Added to ${g.group}`, who: by(g.member, g.by), tone: (/admin/i.test(g.group) ? "bad" : "info") as FeedTone })),
    ...e.accountChanges.map((c) => ({ at: c.at, id: 4738, what: "Account changed", who: by(c.account, c.by), tone: "info" as const })),
    ...e.policyChanges.map((c) => ({ at: c.at, id: 4739, what: "Domain policy changed", who: c.by, tone: "warn" as const })),
    ...(e.auditChanges ?? []).map((c) => ({ at: c.at, id: 4719, what: "Audit policy changed", who: c.by, tone: "bad" as const })),
  ];
  return rows
    .filter((r) => !Number.isNaN(Date.parse(r.at)))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, limit);
}

function by(account: string, actor: string) {
  return actor && actor.toLowerCase() !== account.toLowerCase() ? `${account} by ${actor}` : account;
}

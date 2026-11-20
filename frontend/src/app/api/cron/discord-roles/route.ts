import { NextResponse } from "next/server";
import { hasCronSecret } from "@/lib/cron-auth";
import { allLinkedUserIds, discordLinkConfigured, syncDiscordRole, type SyncResult } from "@/lib/academy-discord-roles";

export const runtime = "nodejs";
export const maxDuration = 300;

// Vercel Cron, daily: puts every linked student's Pro role in the Discord
// right. Billing events already do this as they happen. This catches what no
// event announces: a class seat running out after its 12 weeks, a comped
// address added or removed, a webhook that failed, or a student who linked
// before they joined the server.
export async function GET(request: Request) {
  if (!hasCronSecret(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!discordLinkConfigured()) return NextResponse.json({ skipped: "Discord linking is not set up." });

  const counts: Partial<Record<SyncResult, number>> = {};
  // One at a time. Discord's role endpoints are rate limited per route, and a
  // few hundred students take well under the time limit this way.
  for (const userId of await allLinkedUserIds()) {
    const result = await syncDiscordRole(userId);
    counts[result] = (counts[result] ?? 0) + 1;
  }
  return NextResponse.json(counts);
}

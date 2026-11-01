import { hasCronSecret } from "@/lib/cron-auth";
import { NextResponse } from "next/server";
import {
  hostedLabsConfigured,
  reapIdleHostedLabs,
  stopDueHostedLabs,
  stopHostedLabsForLapsedPro,
  stopOrphanedHostedLabs,
} from "@/lib/academy-hosted";

export const runtime = "nodejs";
export const maxDuration = 60;

// Vercel Cron, daily overnight: stops hosted labs past their stop time. During
// the day the lab status route stops them as students check their labs.
// Vercel sends CRON_SECRET as a Bearer token.
export async function GET(request: Request) {
  if (!hasCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hostedLabsConfigured()) return NextResponse.json({ stopped: 0, reaped: 0, configured: false });
  // Stop first, reclaim second: a lab stopped on this run has just been touched
  // and will not look idle, which is what we want -- only labs that have been
  // quiet for weeks are worth their disks.
  const stopped = await stopDueHostedLabs();
  // And anything running that no session accounts for, which every other stop
  // is blind to because they all key off a stop time this kind of row has not
  // got.
  const orphans = await stopOrphanedHostedLabs().catch((err) => {
    console.error("orphan stop failed", err instanceof Error ? err.message : err);
    return 0;
  });
  const reaped = await reapIdleHostedLabs().catch((err) => {
    console.error("idle reclaim failed", err instanceof Error ? err.message : err);
    return 0;
  });
  // Belt to the webhook's suspenders: a cancelled subscription stops its lab
  // the moment Stripe says so, but a cohort seat running out is a clock no
  // webhook ever fires for, so this is the only thing that ever catches it.
  const lapsed = await stopHostedLabsForLapsedPro().catch((err) => {
    console.error("lapsed-pro sweep failed", err instanceof Error ? err.message : err);
    return 0;
  });
  return NextResponse.json({ stopped, orphans, reaped, lapsed });
}

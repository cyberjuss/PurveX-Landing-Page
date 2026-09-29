import { NextResponse } from "next/server";
import { hostedLabsConfigured, stopDueHostedLabs } from "@/lib/academy-hosted";

export const runtime = "nodejs";
export const maxDuration = 60;

// Vercel Cron, daily overnight: stops hosted labs past their stop time. During
// the day the lab status route stops them as students check their labs.
// Vercel sends CRON_SECRET as a Bearer token.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hostedLabsConfigured()) return NextResponse.json({ stopped: 0, configured: false });
  return NextResponse.json({ stopped: await stopDueHostedLabs() });
}

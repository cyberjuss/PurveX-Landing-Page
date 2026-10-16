import { NextResponse } from "next/server";
import { trialEndingEmail } from "@/lib/academy-emails";
import { markEmailOnce } from "@/lib/academy-email-log";
import { sendEmail } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const maxDuration = 60;

const DAY = 86_400_000;

type TrialRow = { user_id: string; email: string | null; current_period_end: string | null };

// Vercel Cron, daily: a Range Pro trial is 3 days and auto-charges $49 unless
// the student cancels first. One email, about a day before the card is
// charged, sent at most once per student -- so the charge that follows it is
// never the first they hear of it.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseAdmin) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  let origin = "https://purvex.io";
  try {
    origin = new URL(request.url).origin;
  } catch {
    /* keep the default */
  }

  const now = Date.now();
  // A day and a half of headroom either side of "tomorrow", so a trial that
  // started at any time of day is still caught by a once-a-day cron.
  const from = new Date(now).toISOString();
  const to = new Date(now + 1.5 * DAY).toISOString();

  const { data, error } = await supabaseAdmin
    .from("academy_subscriptions")
    .select("user_id, email, current_period_end")
    .eq("status", "trialing")
    .gte("current_period_end", from)
    .lte("current_period_end", to);

  if (error) {
    console.error("[trial-ending] Failed to read academy_subscriptions:", error);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }

  let sent = 0;
  for (const row of (data ?? []) as TrialRow[]) {
    if (!row.email || !row.current_period_end) continue;
    if (!(await markEmailOnce(row.user_id, "trial-ending"))) continue;
    const mail = trialEndingEmail({ name: null, email: row.email }, new Date(row.current_period_end), origin);
    if (await sendEmail(row.email, mail.subject, mail.html).catch(() => false)) sent++;
  }

  return NextResponse.json({ sent });
}

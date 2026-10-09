import { NextResponse } from "next/server";
import { allClassMembers, COHORT_ACCESS_WEEKS } from "@/lib/academy-classes";
import { cohortEndingEmail } from "@/lib/academy-emails";
import { markEmailOnce } from "@/lib/academy-email-log";
import { sendEmail } from "@/lib/email";
import { loadSubscription, subscriptionGrantsPro } from "@/lib/range-plan";

export const runtime = "nodejs";
export const maxDuration = 60;

const DAY = 86_400_000;
const WINDOW_MS = COHORT_ACCESS_WEEKS * 7 * DAY;

// Vercel Cron, daily: a cohort seat is free for 12 weeks, then the student is
// prompted by email to get Pro or stay free. One email about a week before it
// lapses, one once it has, each sent at most once per student. A student who
// already pays is never prompted.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let origin = "https://purvex.io";
  try {
    origin = new URL(request.url).origin;
  } catch {
    /* keep the default */
  }

  const now = Date.now();
  let soon = 0;
  let ended = 0;

  for (const m of await allClassMembers()) {
    if (!m.email) continue;
    const daysLeft = (new Date(m.joinedAt).getTime() + WINDOW_MS - now) / DAY;
    // Outside the two notification windows: nothing to do.
    if (daysLeft > 7 || daysLeft < -3) continue;
    // Already paying keeps Pro, so there is nothing to prompt them about.
    const paid = subscriptionGrantsPro(await loadSubscription(m.userId).catch(() => null));
    if (paid) continue;

    if (daysLeft > 0) {
      if (await markEmailOnce(m.userId, "cohort-ending-7d")) {
        const mail = cohortEndingEmail(m, false, origin);
        if (await sendEmail(m.email, mail.subject, mail.html).catch(() => false)) soon++;
      }
    } else if (await markEmailOnce(m.userId, "cohort-ended")) {
      const mail = cohortEndingEmail(m, true, origin);
      if (await sendEmail(m.email, mail.subject, mail.html).catch(() => false)) ended++;
    }
  }

  return NextResponse.json({ soon, ended });
}

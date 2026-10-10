import { NextResponse } from "next/server";
import { allClassMembers } from "@/lib/academy-classes";
import { dormantAccounts } from "@/lib/academy-dormant";
import { dormantNudgeEmail } from "@/lib/academy-emails";
import { markEmailOnce } from "@/lib/academy-email-log";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";
export const maxDuration = 60;

// Vercel Cron, daily: one email to an account that has not signed in or
// touched the portal for seven days. Daily rather than weekly so it lands on
// day seven instead of up to a week late.
//
// Two things stop it repeating. The ledger key carries the date of their last
// sign-in or activity, so each quiet spell earns exactly one email, and a
// student who comes back and lapses again later gets a fresh one. And the
// 7 to 28 day window keeps the first run from mailing every account that ever
// went quiet.
//
// Class students are skipped: the weekly class job (api/academy/retention)
// already nudges them, and two emails for the same silence is spam.
//
// ?dry=1 reports who would be mailed and sends nothing, so a run can be
// checked before it goes out. It claims no ledger keys either, so the real
// run afterwards still sends.

const MIN_DAYS = 7;
const MAX_DAYS = 28;

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

  const dry = new URL(request.url).searchParams.get("dry") === "1";
  const quiet = await dormantAccounts(MIN_DAYS, MAX_DAYS);
  const inClass = new Set((await allClassMembers()).map((m) => m.userId));

  if (dry) {
    const would = quiet.filter((a) => !inClass.has(a.userId));
    return NextResponse.json({
      dry: true,
      quiet: quiet.length,
      inClass: quiet.length - would.length,
      would: would.map((a) => ({ email: a.email, days: a.days, started: a.started })),
    });
  }

  let sent = 0;
  let skipped = 0;
  for (const account of quiet) {
    if (inClass.has(account.userId)) {
      skipped++;
      continue;
    }
    // One per quiet spell: the key is tied to when they were last seen.
    if (!(await markEmailOnce(account.userId, `dormant:${account.lastSeen.slice(0, 10)}`))) {
      skipped++;
      continue;
    }
    const mail = dormantNudgeEmail(account, account.started, origin);
    if (await sendEmail(account.email, mail.subject, mail.html).catch(() => false)) sent++;
  }

  return NextResponse.json({ quiet: quiet.length, sent, skipped });
}

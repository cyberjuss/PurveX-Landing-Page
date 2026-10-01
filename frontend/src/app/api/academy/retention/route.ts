import { NextResponse } from "next/server";
import { allClasses, classMembers } from "@/lib/academy-classes";
import { classReport, type RosterStudent } from "@/lib/academy-roster";
import { sendEmail } from "@/lib/email";
import { instructorDigestEmail, studentNudgeEmail, type DigestInput } from "@/lib/academy-emails";

export const runtime = "nodejs";
export const maxDuration = 60;

// Weekly retention job. Vercel Cron calls it (see vercel.json). It nudges
// students who have gone quiet and sends each instructor a class digest.
// Protected by CRON_SECRET: Vercel Cron sends it as a bearer token, and a manual
// run must pass the same. Without the secret set, the route does nothing.

const DAY = 24 * 60 * 60 * 1000;
const quietDays = (s: RosterStudent) => (s.lastActive ? Math.floor((Date.now() - Date.parse(s.lastActive)) / DAY) : null);

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const origin = new URL(request.url).origin;

  let nudged = 0;
  let digests = 0;
  const classes = await allClasses();

  for (const cls of classes) {
    const members = await classMembers(cls.id);
    if (!members.length) continue;
    const report = await classReport(cls, members);

    // Nudge students quiet 7 to 28 days. The window stops us pestering someone
    // who has clearly churned, and the weekly cadence caps it at one a week.
    for (const s of report.students) {
      const q = quietDays(s);
      if (!s.email || q === null || q < 7 || q > 28) continue;
      const mail = studentNudgeEmail(s, origin);
      if (await sendEmail(s.email, mail.subject, mail.html).catch(() => false)) nudged++;
    }

    // Digest for the instructor: counts plus who needs a look.
    const attention: DigestInput["attention"] = report.students
      .map((s) => {
        const q = quietDays(s);
        if (s.stuck.length) return { name: s.name || s.email?.split("@")[0] || "Student", reason: `Stuck on ${s.stuck[0].title}`, tone: "bad" as const };
        if (q === null) return { name: s.name || s.email?.split("@")[0] || "Student", reason: "Not started", tone: "none" as const };
        if (q >= 7) return { name: s.name || s.email?.split("@")[0] || "Student", reason: `Quiet ${q} days`, tone: "warn" as const };
        return null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);

    const digest: DigestInput = {
      className: cls.name,
      students: report.summary.students,
      active: report.summary.activeThisWeek,
      stuck: report.summary.stuck,
      avgReadiness: report.summary.avgReadiness,
      attention,
    };
    const mail = instructorDigestEmail(digest, origin);
    if (await sendEmail(cls.instructorEmail, mail.subject, mail.html).catch(() => false)) digests++;
  }

  return NextResponse.json({ ok: true, classes: classes.length, nudged, digests });
}

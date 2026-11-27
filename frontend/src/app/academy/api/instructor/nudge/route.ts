import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { classesFor, classMembers } from "@/lib/academy-classes";
import { markEmailOnce } from "@/lib/academy-email-log";
import { classReport, type RosterStudent } from "@/lib/academy-roster";
import { getAcademyStudent } from "@/lib/academy-student";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

// One click from the instructor dashboard sends a check-in. The server picks
// the recipients from the instructor's own class and writes the message from
// each student's own record, so this can never mail anyone else or say
// anything else. Replies go to the instructor. One per student per day.

const DAY = 24 * 60 * 60 * 1000;
const QUIET_DAYS = 7;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** The one thing worth asking about, most urgent first. Matches the dashboard's own read. */
function reason(s: RosterStudent): string | null {
  const quiet = s.lastActive ? Math.floor((Date.now() - Date.parse(s.lastActive)) / DAY) : null;
  if (quiet === null) return "you have not started yet";
  const stuck = s.stuck[0];
  if (stuck) return `you are stuck on ${stuck.title}`;
  if (quiet >= QUIET_DAYS) return `there has been no activity in ${quiet} days`;
  return null;
}

export async function POST(request: Request) {
  if (!(await isAcademyUnlocked())) return NextResponse.json({ error: "Locked" }, { status: 401 });
  const me = await getAcademyStudent(request);
  if (!me?.email) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  let body: { classId?: unknown; studentIds?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const classId = String(body.classId ?? "");
  const ids = new Set(Array.isArray(body.studentIds) ? body.studentIds.filter((v): v is string => typeof v === "string").slice(0, 100) : []);
  if (!ids.size) return NextResponse.json({ error: "Pick a student" }, { status: 400 });

  // Only a class this account teaches (an admin may use any).
  const cls = (await classesFor(me.email)).find((c) => c.id === classId);
  if (!cls) return NextResponse.json({ error: "Not your class" }, { status: 403 });

  const report = await classReport(cls, await classMembers(cls.id));
  const day = new Date().toISOString().slice(0, 10);
  const origin = new URL(request.url).origin;
  const from = me.name || me.email.split("@")[0];
  let sent = 0;
  let already = 0;
  let failed = 0;

  for (const s of report.students.filter((x) => ids.has(x.userId) && x.email)) {
    // A double click, or the group button after a single one, never mails twice in a day.
    if (!(await markEmailOnce(s.userId, `nudge:${cls.id}:${day}`))) {
      already++;
      continue;
    }
    const name = s.name || s.email!.split("@")[0];
    const why = reason(s);
    const html = `<p>Hi ${esc(name)},</p>
<p>${why ? `I noticed ${esc(why)}. Anything I can help unblock?` : "Checking in on how you are getting on."}</p>
<p>Reply to this email if anything is in your way.</p>
<p><a href="${origin}/range">Open PurveX Range</a></p>
<p>${esc(from)}<br>${esc(cls.name)}</p>`;
    const ok = await sendEmail(s.email!, `${cls.name}: checking in`, html, me.email).catch(() => false);
    if (ok) sent++;
    else failed++;
  }
  return NextResponse.json({ sent, already, failed });
}

import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { classesFor, classMembers, createClass, deleteClass, isAcademyAdmin, type AcademyClass } from "@/lib/academy-classes";
import { classReport } from "@/lib/academy-roster";
import { getAcademyStudent } from "@/lib/academy-student";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c] ?? c);

/** Email the instructor their class is ready: how to see it, and the link to share. */
async function emailInstructor(cls: AcademyClass, origin: string): Promise<boolean> {
  const joinLink = `${origin}/range/join?code=${encodeURIComponent(cls.code)}`;
  const dash = `${origin}/range/instructor`;
  const html = `
<h2 style="margin:0 0 12px;font-size:19px;color:#0f172a;">Your class ${esc(cls.name)} is live</h2>
<p style="margin:0 0 16px;">Two steps and you are running.</p>
<p style="margin:0 0 6px;"><strong>1. See your class.</strong> Open your dashboard and sign in with this email.</p>
<p style="margin:0 0 18px;"><a href="${dash}" style="display:inline-block;background:#6a5cff;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:9px;">Open your dashboard</a></p>
<p style="margin:0 0 6px;"><strong>2. Add students.</strong> Send them this link. They open it and sign in.</p>
<p style="margin:0 0 4px;color:#64748b;font-size:13px;word-break:break-all;">${joinLink}</p>
<p style="margin:14px 0 0;color:#64748b;font-size:13px;">Passcode fallback <strong>${esc(cls.code)}</strong>.</p>`;
  return sendEmail(cls.instructorEmail, `Your class ${cls.name} is live on PurveX Range`, html);
}

// The instructor view: each class the signed-in instructor teaches, with its
// students' progress. Admins see every class and can create new ones.

async function auth(request: Request) {
  if (!(await isAcademyUnlocked())) return null;
  return getAcademyStudent(request);
}

export async function GET(request: Request) {
  const me = await auth(request);
  if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const admin = isAcademyAdmin(me.email);
  const classes = await classesFor(me.email);
  // The account menu only needs to know whether to show the link.
  if (new URL(request.url).searchParams.get("check") === "1") {
    return NextResponse.json({ instructor: admin || classes.length > 0 });
  }
  if (!admin && !classes.length) return NextResponse.json({ error: "No classes for this account." }, { status: 403 });
  const reports = await Promise.all(classes.map(async (c) => classReport(c, await classMembers(c.id))));
  return NextResponse.json({ admin, classes: reports });
}

export async function POST(request: Request) {
  const me = await auth(request);
  if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!isAcademyAdmin(me.email)) return NextResponse.json({ error: "Only an admin can create a class." }, { status: 403 });
  let body: { name?: unknown; instructorEmail?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const name = String(body.name ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  const email = String(body.instructorEmail ?? "").trim().toLowerCase();
  if (name.length < 2) return NextResponse.json({ error: "Give the class a name." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Enter the instructor's email." }, { status: 400 });
  const cls = await createClass(name, email);
  if (!cls) return NextResponse.json({ error: "Could not create the class. Check that academy.sql has run." }, { status: 500 });
  const emailed = await emailInstructor(cls, new URL(request.url).origin).catch(() => false);
  return NextResponse.json({ class: cls, emailed });
}

export async function DELETE(request: Request) {
  const me = await auth(request);
  if (!me) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!isAcademyAdmin(me.email)) return NextResponse.json({ error: "Only an admin can delete a class." }, { status: 403 });
  const classId = new URL(request.url).searchParams.get("classId") ?? "";
  if (!classId) return NextResponse.json({ error: "Which class?" }, { status: 400 });
  const ok = await deleteClass(classId);
  if (!ok) return NextResponse.json({ error: "Could not delete the class." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

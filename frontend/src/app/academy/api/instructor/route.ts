import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { classesFor, classMembers, createClass, isAcademyAdmin } from "@/lib/academy-classes";
import { classReport } from "@/lib/academy-roster";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

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
  return NextResponse.json({ class: cls });
}

import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { sanitizeResults } from "@/lib/academy-score";
import { loadProgress, saveProgress } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAcademyUnlocked())) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }
  const student = await getAcademyStudent(request);
  if (!student) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  return NextResponse.json({ results: await loadProgress(student.id) });
}

export async function PUT(request: Request) {
  if (!(await isAcademyUnlocked())) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }
  const student = await getAcademyStudent(request);
  if (!student) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const results = sanitizeResults((payload as { results?: unknown }).results);
  await saveProgress(student.id, student.email, results);
  return NextResponse.json({ ok: true });
}

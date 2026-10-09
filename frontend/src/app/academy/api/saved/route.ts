import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { sanitizePatch } from "@/lib/academy-saved";
import { loadSaved, patchSaved } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// A student's work in progress (see academy-saved.ts). GET returns it; PUT
// applies a change. Each student only ever reads and writes their own.

async function auth(request: Request) {
  if (!(await isAcademyUnlocked())) return null;
  return getAcademyStudent(request);
}

export async function GET(request: Request) {
  const student = await auth(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const saved = await loadSaved(student.id);
  if (!saved) return NextResponse.json({ error: "Could not load your saved work." }, { status: 503 });
  return NextResponse.json({ saved });
}

export async function PUT(request: Request) {
  const student = await auth(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const saved = await patchSaved(student.id, sanitizePatch((body as { patch?: unknown })?.patch));
  if (!saved) return NextResponse.json({ error: "Could not save your work." }, { status: 503 });
  return NextResponse.json({ ok: true });
}

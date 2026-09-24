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
  // The browser cannot claim a ticket was seen in the lab. Keep only what the server already recorded.
  const results = sanitizeResults((payload as { results?: unknown }).results);
  const saved = await loadProgress(student.id);
  for (const [id, row] of Object.entries(saved)) {
    if (row.labOk) results[id] = { ...(results[id] ?? { solved: false, wrong: 0, hint: false }), labOk: true };
  }
  await saveProgress(student.id, student.email, results);
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { labGate } from "@/lib/academy-mission-gate";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// Can the student answer this challenge? The page asks before it sends an
// answer, and waits for a lab that is waking up or still syncing a change.
export async function POST(request: Request) {
  if (!(await isAcademyUnlocked())) return NextResponse.json({ error: "Locked" }, { status: 401 });
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let id = "";
  try {
    id = String(((await request.json()) as { id?: unknown }).id || "");
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  return NextResponse.json(await labGate(student, id));
}

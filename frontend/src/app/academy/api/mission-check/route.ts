import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { formatLabAge } from "@/lib/academy-lab";
import { checkMission, hasTicketObjects, missionGate } from "@/lib/academy-mission-lab";
import { loadLabState } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// Does the student's own lab show the change this ticket asks for? A student
// with no lab connected is not gated, so they can still answer.
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
  if (!missionGate(id)) return NextResponse.json({ gated: false });

  const lab = await loadLabState(student.id);
  if (!lab) return NextResponse.json({ gated: false, noLab: true });
  // A lab built without -IncludeCTF has none of the ticket objects, so there is nothing to check.
  if (!hasTicketObjects(lab.snapshot)) return NextResponse.json({ gated: false, noTicketObjects: true });
  const checked = checkMission(id, lab.snapshot);
  return NextResponse.json({ gated: true, ...checked, syncedAgo: formatLabAge(lab.uploadedAt).ago });
}

import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { formatLabAge, labIsLive } from "@/lib/academy-lab";
import { hasTicketObjects } from "@/lib/academy-mission-lab";
import { getAcademyStudent } from "@/lib/academy-student";
import { loadLabState } from "@/lib/academy-store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAcademyUnlocked())) return NextResponse.json({ error: "Locked" }, { status: 401 });
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const lab = await loadLabState(student.id);
  if (!lab) {
    return NextResponse.json({ connected: false, syncedAgo: null, stale: false, hasTicketObjects: false });
  }

  return NextResponse.json({
    connected: true,
    syncedAgo: formatLabAge(lab.uploadedAt).ago,
    stale: !labIsLive(lab.uploadedAt),
    hasTicketObjects: hasTicketObjects(lab.snapshot),
  });
}

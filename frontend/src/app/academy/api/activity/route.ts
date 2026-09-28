import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { sanitizeActivityPlace } from "@/lib/academy-activity";
import { findEntry } from "@/lib/academy-content";
import { saveActivity } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// The page reports which tab the student has open, and the step inside a
// browser lab, so Coach and MCP clients know where they are.

const tabName = (label: string) => label.replace(/^(Lab|Challenge|Troubleshooting):\s*/, "");

export async function POST(request: Request) {
  if (!(await isAcademyUnlocked())) return NextResponse.json({ error: "Locked" }, { status: 401 });
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const place = sanitizeActivityPlace((payload as { place?: unknown })?.place);
  const entry = place && findEntry(place.phase, place.entry);
  const known = entry && (place.kind === "quiz" || entry.sections.some((s) => tabName(s.label) === place.tab));
  if (!place || !known) return NextResponse.json({ error: "Unknown page." }, { status: 400 });

  await saveActivity(student.id, place);
  return NextResponse.json({ ok: true });
}

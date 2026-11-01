import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { sanitizeActivityPlace } from "@/lib/academy-activity";
import { findEntry } from "@/lib/academy-content";
import { loadActivity, saveActivity } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// The page reports which tab the student has open, and the step inside a
// browser lab, so Coach and MCP clients know where they are.

const tabName = (label: string) => label.replace(/^(Lab|Challenge|Troubleshooting):\s*/, "");

/**
 * Where this student last was, read back.
 *
 * The home page remembered the last lesson in localStorage, so it was lost
 * on another browser, another machine, or a cleared cache -- while every
 * other piece of their progress followed the account. This row is written
 * on every tab they open and already knew the answer; nothing read it.
 */
export async function GET(request: Request) {
  if (!(await isAcademyUnlocked())) return NextResponse.json({ place: null });
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ place: null });
  const activity = await loadActivity(student.id).catch(() => null);
  return NextResponse.json({ place: activity?.place ?? null, updatedAt: activity?.updatedAt ?? null });
}

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

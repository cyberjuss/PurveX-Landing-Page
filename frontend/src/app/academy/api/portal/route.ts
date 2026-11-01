import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { getAcademyStudent } from "@/lib/academy-student";
import { loadMovedPortal, loadPortal, sanitizePortal, savePortal, type PortalState } from "@/lib/academy-store";

export const runtime = "nodejs";

// Week completions, quiz passes, labs done, last stop, and one-time onboarding
// flags. Mission scores live in /academy/api/progress; this is everything the
// portal UI used to keep only in the browser, now on the account so a new
// browser or device restores it after sign-in.

export async function GET(request: Request) {
  if (!(await isAcademyUnlocked())) return NextResponse.json({ error: "Locked" }, { status: 401 });
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const [portal, moved] = await Promise.all([loadPortal(student.id), loadMovedPortal(student.id)]);
  // A briefly-live build saved progress to academy_saved instead. Folded in
  // here; the page's next save writes the union back to the portal column.
  return NextResponse.json({ portal: mergePortal(portal, moved) });
}

const union = (a: string[], b: string[], cap = 4000) => [...new Set([...a, ...b])].slice(0, cap);

function mergePortal(a: PortalState, b: PortalState): PortalState {
  return {
    completed: union(a.completed, b.completed),
    quizPasses: union(a.quizPasses, b.quizPasses),
    labsDone: union(a.labsDone, b.labsDone),
    lastStop: b.lastStop ?? a.lastStop,
    flags: { ...a.flags, ...b.flags },
  };
}

export async function PUT(request: Request) {
  if (!(await isAcademyUnlocked())) return NextResponse.json({ error: "Locked" }, { status: 401 });
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const incoming = sanitizePortal((payload as { portal?: unknown })?.portal);
  const saved = await loadPortal(student.id);

  // Progress only grows: union the sets so a second tab or device never erases
  // what another one recorded. Last stop takes the newest; flags OR together.
  const merged: PortalState = {
    completed: union(saved.completed, incoming.completed),
    quizPasses: union(saved.quizPasses, incoming.quizPasses),
    labsDone: union(saved.labsDone, incoming.labsDone),
    lastStop: incoming.lastStop ?? saved.lastStop,
    flags: { ...saved.flags, ...incoming.flags },
  };
  await savePortal(student.id, student.email, merged);
  return NextResponse.json({ ok: true, portal: merged });
}

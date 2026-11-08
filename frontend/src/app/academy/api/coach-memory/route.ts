import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { dropNotes, loadMemory, type CoachNote, type MemoryKind } from "@/lib/academy-coach-memory";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// What Coach remembers about the signed-in student, for the Goals panel.
// They can read every note and delete any of them, or all of them. Coach
// only ever adds notes through its own tools; nothing here writes one.

async function auth(request: Request) {
  if (!(await isAcademyUnlocked())) return { error: NextResponse.json({ error: "Locked" }, { status: 401 }) } as const;
  const student = await getAcademyStudent(request);
  if (!student) return { error: NextResponse.json({ error: "Sign in first." }, { status: 401 }) } as const;
  return { student } as const;
}

// Coach's own labels are written about the student ("what works when
// teaching them"). The student reads these instead.
const LABELS: Record<MemoryKind, string> = {
  misconception: "Still mixing up",
  strength: "You're solid on",
  works: "What helps you",
  avoid: "What doesn't help you",
  life: "About you",
  goal: "Your plans",
  thread: "Pick up next time",
};

const view = (notes: CoachNote[]) => notes.map((n) => ({ id: n.id, kind: n.kind, label: LABELS[n.kind], note: n.note, at: n.at }));

export async function GET(request: Request) {
  const a = await auth(request);
  if (a.error) return a.error;
  return NextResponse.json({ notes: view(await loadMemory(a.student.id)) });
}

export async function DELETE(request: Request) {
  const a = await auth(request);
  if (a.error) return a.error;
  const id = new URL(request.url).searchParams.get("id") ?? undefined;
  const next = await dropNotes(a.student.id, id ? id.slice(0, 16) : undefined);
  if (!next) return NextResponse.json({ error: "Couldn't update Coach's notes. Try again." }, { status: 503 });
  return NextResponse.json({ notes: view(next) });
}

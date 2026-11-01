import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { FEEDBACK_TAGS, saveFeedback } from "@/lib/academy-coach-feedback";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// A thumbs up or down on one Coach reply.
//
// No Range Pro check here, unlike the Coach route itself. Someone whose plan
// lapsed between the reply and the rating should still be able to tell us the
// reply was bad, and rating costs nothing to serve.

export async function GET() {
  // The reason chips, so the client never hardcodes a copy of them.
  return NextResponse.json({
    tags: Object.entries(FEEDBACK_TAGS).map(([key, t]) => ({ key, label: t.label })),
  });
}

export async function POST(request: Request) {
  if (!(await isAcademyUnlocked())) {
    return NextResponse.json({ error: "Unlock the academy first." }, { status: 401 });
  }
  const student = await getAcademyStudent(request);
  if (!student) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const saved = await saveFeedback(student.id, {
    receipt: body.receipt,
    rating: body.rating,
    tags: body.tags,
    note: body.note,
    turnId: body.turnId,
  });
  // The only way to get here is a receipt that will not open or belongs to
  // someone else. Both mean the rating is not about a reply we sent.
  if (!saved) return NextResponse.json({ error: "That reply could not be matched." }, { status: 400 });

  return NextResponse.json({ ok: true, rating: saved.rating });
}

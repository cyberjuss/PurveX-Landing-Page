import { NextResponse } from "next/server";
import { checkGuess, hasMissionKey, missFeedback, missionReveal, needsLabForAnswer } from "@/lib/academy-answers";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { labGate } from "@/lib/academy-mission-gate";
import type { MissionResult } from "@/lib/academy-score";
import { loadLabState, loadProgress, saveProgress } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// Challenge answers are checked and recorded here, never in the browser.
// The Answer/Problem/Solution box is sent only once it is earned.

const earned = (r: MissionResult | undefined) => Boolean(r && (r.solved || r.wrong >= 3));

async function auth(request: Request) {
  if (!(await isAcademyUnlocked())) return null;
  return getAcademyStudent(request);
}

export async function POST(request: Request) {
  const student = await auth(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let body: { id?: unknown; guess?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const id = String(body.id || "");
  const guess = String(body.guess || "").slice(0, 120);
  if (!hasMissionKey(id)) return NextResponse.json({ error: "Unknown mission." }, { status: 400 });
  if (!guess.trim()) return NextResponse.json({ error: "Type an answer first." }, { status: 400 });

  // The page waits for the lab first. This makes sure a solve always has it.
  const gate = await labGate(student, id);
  if (!gate.passed) return NextResponse.json({ blocked: true, gate });

  const results = await loadProgress(student.id);
  const cur: MissionResult = results[id] ?? { solved: false, wrong: 0, hint: false };
  if (cur.solved) return NextResponse.json({ correct: true, result: cur, reveal: missionReveal(id) });

  const lab = needsLabForAnswer(id) ? ((await loadLabState(student.id))?.snapshot ?? null) : null;
  const correct = checkGuess(id, guess, lab);
  const next: MissionResult = correct
    ? { ...cur, solved: true, at: new Date().toISOString() }
    : { ...cur, wrong: Math.min(3, cur.wrong + 1), at: new Date().toISOString() };
  if (next.solved) delete next.flagged;
  results[id] = next;
  await saveProgress(student.id, student.email, results);
  return NextResponse.json({
    correct,
    result: next,
    reveal: earned(next) ? missionReveal(id) : null,
    feedback: correct ? null : missFeedback(id, guess, lab),
  });
}

/** The boxes this student has earned, for missions restored on page load. */
export async function GET(request: Request) {
  const student = await auth(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const ids = (new URL(request.url).searchParams.get("ids") ?? "").split(",").filter(hasMissionKey).slice(0, 40);
  const results = await loadProgress(student.id);
  const reveals = Object.fromEntries(ids.filter((id) => earned(results[id])).map((id) => [id, missionReveal(id)]));
  return NextResponse.json({ reveals });
}

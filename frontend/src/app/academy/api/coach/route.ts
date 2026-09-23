import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { COACH_DAILY_LIMIT, runCoachTurn } from "@/lib/academy-coach";
import { sanitizeResults, type Results } from "@/lib/academy-score";
import { bumpUsage, loadLabState, loadProgress, readUsage } from "@/lib/academy-store";
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
  const used = await readUsage(student.id);
  return NextResponse.json({
    enabled: Boolean(process.env.ANTHROPIC_API_KEY),
    remaining: Math.max(0, COACH_DAILY_LIMIT - used),
    limit: COACH_DAILY_LIMIT,
  });
}

export async function POST(request: Request) {
  if (!(await isAcademyUnlocked())) {
    return NextResponse.json({ error: "Unlock the academy first." }, { status: 401 });
  }
  const student = await getAcademyStudent(request);
  if (!student) {
    return NextResponse.json({ error: "Sign in to use PurveX Coach." }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "PurveX Coach is not configured yet. Ask your instructor." },
      { status: 503 }
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const body = payload as {
    message?: unknown;
    history?: unknown;
    results?: unknown;
  };
  const message = String(body.message || "").trim().slice(0, 2000);
  if (!message) {
    return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
  }

  const history = Array.isArray(body.history)
    ? body.history
        .filter((m): m is { role: "user" | "assistant"; content: string } => {
          if (!m || typeof m !== "object") return false;
          const row = m as { role?: unknown; content?: unknown };
          return (row.role === "user" || row.role === "assistant") && typeof row.content === "string";
        })
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }))
    : [];

  // Saved progress wins; the browser's copy only fills in before the first save.
  const saved = await loadProgress(student.id);
  const results: Results = Object.keys(saved).length > 0 ? saved : sanitizeResults(body.results);

  const used = await readUsage(student.id);
  if (used >= COACH_DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Daily coach limit reached (${COACH_DAILY_LIMIT} questions). Try again tomorrow.`, remaining: 0 },
      { status: 429 }
    );
  }

  try {
    const { text, model } = await runCoachTurn({
      apiKey,
      history,
      userMessage: message,
      tools: { results, loadLabState: async () => (await loadLabState(student.id))?.snapshot ?? null },
    });
    const remaining = COACH_DAILY_LIMIT - (await bumpUsage(student.id, used));
    return NextResponse.json({ reply: text, remaining, model });
  } catch {
    return NextResponse.json({ error: "PurveX Coach is unavailable right now." }, { status: 502 });
  }
}

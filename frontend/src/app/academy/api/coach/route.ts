import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { COACH_DAILY_LIMIT, effectiveCoachBonus, runCoachTurn } from "@/lib/academy-coach";
import { modeFromReport, parseCoachMode } from "@/lib/academy-coach-mode";
import { COACH_SHOT_ASK, sanitizeCoachImages } from "@/lib/academy-coach-media";
import { sanitizeResults, type Results } from "@/lib/academy-score";
import { bumpUsage, loadDrills, loadLabState, loadProgress, readUsage, resetUsage } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";
import { coachBonus } from "@/lib/academy-drills";

export const runtime = "nodejs";
export const maxDuration = 60;

// Drills earn extra chats for the day: harder and longer work earns more.
async function allowance(userId: string) {
  const drills = await loadDrills(userId).catch(() => []);
  const chats = coachBonus(drills, new Date().toISOString().slice(0, 10));
  const bonus = effectiveCoachBonus(chats.bonus);
  return { drills, bonus, parts: chats.parts, limit: COACH_DAILY_LIMIT + bonus };
}

export async function GET(request: Request) {
  if (!(await isAcademyUnlocked())) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }
  const student = await getAcademyStudent(request);
  if (!student) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const wantReset = process.env.NODE_ENV !== "production" && new URL(request.url).searchParams.get("reset") === "1";
  if (wantReset) await resetUsage(student.id);
  const used = await readUsage(student.id);
  const { bonus, limit } = await allowance(student.id);
  return NextResponse.json({
    enabled: Boolean(process.env.ANTHROPIC_API_KEY),
    remaining: Math.max(0, Math.min(limit, limit - used)),
    limit,
    bonus,
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
    images?: unknown;
    mode?: unknown;
  };
  const rawImages = Array.isArray(body.images) ? body.images : [];
  const images = sanitizeCoachImages(rawImages);
  if (rawImages.length > 0 && images.length === 0) {
    return NextResponse.json({ error: "That screenshot could not be read. Paste or upload a PNG or JPG." }, { status: 400 });
  }
  const message = String(body.message || "").trim().slice(0, 2000) || (images.length ? COACH_SHOT_ASK : "");
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
  const { drills, bonus, limit } = await allowance(student.id);
  if (used >= limit) {
    return NextResponse.json(
      { error: `Daily coach limit reached (${limit} questions). A drill earns more, or try again tomorrow.`, remaining: 0, bonus },
      { status: 429 }
    );
  }

  try {
    const { text, model } = await runCoachTurn({
      apiKey,
      history,
      userMessage: message,
      images,
      mode: body.mode != null ? parseCoachMode(body.mode) : modeFromReport(results),
      drills,
      tools: { results, userId: student.id, loadLabState: async () => (await loadLabState(student.id))?.snapshot ?? null },
    });
    const remaining = Math.max(0, Math.min(limit, limit - (await bumpUsage(student.id, used))));
    return NextResponse.json({ reply: text, remaining, limit, model, bonus });
  } catch {
    return NextResponse.json({ error: "PurveX Coach is unavailable right now." }, { status: 502 });
  }
}

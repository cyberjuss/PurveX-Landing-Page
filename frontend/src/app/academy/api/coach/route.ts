import { after, NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { COACH_DAILY_LIMIT, effectiveCoachBonus, runCoachTurn } from "@/lib/academy-coach";
import { modeFromReport, parseCoachMode, parseCoachPlace } from "@/lib/academy-coach-mode";
import { COACH_SHOT_ASK, sanitizeCoachImages } from "@/lib/academy-coach-media";
import { sanitizeProfile } from "@/lib/academy-certs";
import { ensureRoleBrief } from "@/lib/academy-role-research";
import { sanitizeResults, type Results } from "@/lib/academy-score";
import { bumpLabCoachUsage, bumpUsage, loadDrills, loadLabState, loadProfile, loadProgress, readLabCoachUsage, readUsage, resetUsage } from "@/lib/academy-store";
import { LAB_COACH_PER_LAB, LAB_PAUSE_REPLY, runLabCoachTurn } from "@/lib/academy-lab-coach";
import { getAcademyStudent } from "@/lib/academy-student";
import { cleanDay, coachBonus } from "@/lib/academy-drills";
import { coachAllowance, isPaid, planFor, PRO_ONLY, type Plan } from "@/lib/academy-plan";

export const runtime = "nodejs";
export const maxDuration = 60;

// Drills earn extra chats for the student's local day on a paid plan. Harder work earns more.
async function allowance(userId: string, day: string, plan: Plan) {
  const drills = await loadDrills(userId).catch(() => []);
  const chats = coachBonus(drills, day);
  return { drills, ...coachAllowance(plan, COACH_DAILY_LIMIT, effectiveCoachBonus(chats.bonus)) };
}

export async function GET(request: Request) {
  if (!(await isAcademyUnlocked())) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }
  const student = await getAcademyStudent(request);
  if (!student) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const url = new URL(request.url);
  const day = cleanDay(url.searchParams.get("day"));
  const wantReset = process.env.NODE_ENV !== "production" && url.searchParams.get("reset") === "1";
  if (wantReset) await resetUsage(student.id, day);
  const used = await readUsage(student.id, day);
  const plan = await planFor(student.id, student.email);
  const { bonus, limit } = await allowance(student.id, day, plan);
  return NextResponse.json({
    enabled: Boolean(process.env.ANTHROPIC_API_KEY),
    plan,
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
    profile?: unknown;
    mode?: unknown;
    place?: unknown;
    day?: unknown;
  };
  const day = cleanDay(body.day);
  const plan = await planFor(student.id, student.email);
  const rawImages = Array.isArray(body.images) ? body.images : [];
  if (!isPaid(plan) && rawImages.length > 0) {
    return NextResponse.json({ error: PRO_ONLY.screenshots }, { status: 403 });
  }
  if (!isPaid(plan) && body.mode === "interview") {
    return NextResponse.json({ error: PRO_ONLY.interview }, { status: 403 });
  }
  const images = sanitizeCoachImages(rawImages);
  if (rawImages.length > 0 && images.length === 0) {
    return NextResponse.json({ error: "That screenshot could not be read. Paste or upload a PNG or JPG." }, { status: 400 });
  }
  // Long enough for a pasted resume in Job prep.
  const message = String(body.message || "").trim().slice(0, 6000) || (images.length ? COACH_SHOT_ASK : "");
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
        .map((m) => ({ role: m.role, content: m.content.slice(0, 6000) }))
    : [];

  // Saved progress wins; the browser's copy only fills in before the first save.
  const saved = await loadProgress(student.id);
  const results: Results = Object.keys(saved).length > 0 ? saved : sanitizeResults(body.results);

  // Same for the intake answers: the saved copy wins.
  const profile = (await loadProfile(student.id)) ?? sanitizeProfile(body.profile);
  // A role whose research failed or went stale is looked up again, after this reply.
  if (profile) after(() => Promise.all(profile.roles.map((role) => ensureRoleBrief(apiKey, role))).then(() => undefined));

  const used = await readUsage(student.id, day);
  const { drills, bonus, limit } = await allowance(student.id, day, plan);
  if (used >= limit) {
    const more = isPaid(plan) ? "A drill earns more, or try again tomorrow." : "Pro has more each day, or try again tomorrow.";
    return NextResponse.json(
      { error: `Daily coach limit reached (${limit} questions). ${more}`, remaining: 0, bonus },
      { status: 429 }
    );
  }

  // Inside a browser lab: a short, focused turn, and a cap per lab so one lab cannot use up the day.
  const place = parseCoachPlace(body.place);
  if (place?.lab) {
    const labUsed = await readLabCoachUsage(student.id, place.lab, day);
    if (labUsed >= LAB_COACH_PER_LAB) {
      return NextResponse.json({ reply: LAB_PAUSE_REPLY, remaining: Math.max(0, limit - used), limit, bonus });
    }
    try {
      const { text, model } = await runLabCoachTurn({ apiKey, lab: place.lab, at: place.at, roles: profile?.roles, history, userMessage: message, images });
      await bumpLabCoachUsage(student.id, place.lab, labUsed, day);
      const remaining = Math.max(0, Math.min(limit, limit - (await bumpUsage(student.id, used, day))));
      return NextResponse.json({ reply: text, remaining, limit, model, bonus });
    } catch {
      return NextResponse.json({ error: "PurveX Coach is unavailable right now." }, { status: 502 });
    }
  }

  try {
    const { text, model } = await runCoachTurn({
      apiKey,
      history,
      userMessage: message,
      images,
      mode: body.mode != null ? parseCoachMode(body.mode) : modeFromReport(results),
      place,
      drills,
      tools: { results, userId: student.id, profile, loadLabState: async () => (await loadLabState(student.id))?.snapshot ?? null },
    });
    const remaining = Math.max(0, Math.min(limit, limit - (await bumpUsage(student.id, used, day))));
    return NextResponse.json({ reply: text, remaining, limit, model, bonus });
  } catch {
    return NextResponse.json({ error: "PurveX Coach is unavailable right now." }, { status: 502 });
  }
}

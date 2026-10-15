import { after, NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { COACH_DAILY_LIMIT, effectiveCoachBonus, runCoachTurn } from "@/lib/academy-coach";
import { modeFromReport, parseCoachMode, parseCoachPlace } from "@/lib/academy-coach-mode";
import { COACH_SHOT_ASK, sanitizeCoachImages } from "@/lib/academy-coach-media";
import { sanitizeProfile } from "@/lib/academy-certs";
import { ensureRoleBrief } from "@/lib/academy-role-research";
import { sanitizeResults, type Results } from "@/lib/academy-score";
import {
  claimCoachQuestion,
  claimLabCoachQuestion,
  loadDrills,
  loadLabState,
  loadProfile,
  loadProgress,
  readUsage,
  releaseCoachQuestion,
  releaseLabCoachQuestion,
  resetUsage,
} from "@/lib/academy-store";
import { LAB_COACH_PER_LAB, LAB_PAUSE_REPLY, runLabCoachTurn } from "@/lib/academy-lab-coach";
import { isRangePro, proRequired } from "@/lib/range-plan";
import { getAcademyStudent } from "@/lib/academy-student";
import { cleanDay, coachBonus } from "@/lib/academy-drills";
import { sealReceipt } from "@/lib/academy-coach-feedback";

export const runtime = "nodejs";
export const maxDuration = 60;

// Drills earn extra chats for the student's local day. Harder work earns more.
async function allowance(userId: string, day: string) {
  const drills = await loadDrills(userId).catch(() => []);
  const chats = coachBonus(drills, day);
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
  // Coach is in the Pro column on the pricing page and not in Explore's, so
  // a free account is told what it costs instead of being told the feature
  // is broken. enabled stays false, which is what the chat UI already reads
  // to stay closed.
  if (!(await isRangePro(student))) {
    return NextResponse.json({ enabled: false, locked: true, remaining: 0, limit: 0, bonus: 0, upgrade: "/range/upgrade" });
  }
  const url = new URL(request.url);
  const day = cleanDay(url.searchParams.get("day"));
  const wantReset = process.env.NODE_ENV !== "production" && url.searchParams.get("reset") === "1";
  if (wantReset) await resetUsage(student.id, day);
  const used = await readUsage(student.id, day);
  const { bonus, limit } = await allowance(student.id, day);
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

  // Checked before the API key, before the body is read and before any
  // model call: the one thing a paywall must not do is run the expensive
  // part first and bill the answer to a free account.
  if (!(await isRangePro(student))) {
    return NextResponse.json(proRequired("PurveX Coach"), { status: 403 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "PurveX Coach is not switched on yet. Email support@purvex.io." },
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
  const rawImages = Array.isArray(body.images) ? body.images : [];
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

  const { drills, bonus, limit } = await allowance(student.id, day);
  // Claimed before the model is called, not counted after it. The old order
  // read the count, checked it, spent several seconds on the model and then
  // wrote count + 1, so every request sent at once read the same number and
  // every one passed. The claim is one statement in Postgres, and it answers
  // null at the cap. A failed turn hands the question back below.
  const used = await claimCoachQuestion(student.id, limit, day);
  if (used === null) {
    return NextResponse.json(
      { error: `Daily coach limit reached (${limit} questions). A drill earns more, or try again tomorrow.`, remaining: 0, bonus },
      { status: 429 }
    );
  }
  const left = Math.max(0, Math.min(limit, limit - used));

  // Inside a browser lab: a short, focused turn, and a cap per lab so one lab cannot use up the day.
  const place = parseCoachPlace(body.place);
  if (place?.lab) {
    // Hitting the per-lab cap is a nudge to go back to the lab, not an error,
    // so the day's question goes back before the pause reply.
    const labUsed = await claimLabCoachQuestion(student.id, place.lab, LAB_COACH_PER_LAB, day);
    if (labUsed === null) {
      await releaseCoachQuestion(student.id, day);
      return NextResponse.json({ reply: LAB_PAUSE_REPLY, remaining: Math.max(0, limit - used + 1), limit, bonus });
    }
    try {
      const { text, model } = await runLabCoachTurn({ apiKey, lab: place.lab, at: place.at, roles: profile?.roles, history, userMessage: message, images });
      // The receipt is what the student sends back to thumb this reply up or
      // down. It carries the exchange sealed, so the rating lands on what Coach
      // really said rather than whatever the browser claims it said.
      const receipt = sealReceipt({ userId: student.id, question: message, reply: text, model, mode: "lab", lab: place.lab });
      return NextResponse.json({ reply: text, remaining: left, limit, model, bonus, receipt });
    } catch {
      // Our outage, so it costs them nothing.
      await Promise.all([releaseCoachQuestion(student.id, day), releaseLabCoachQuestion(student.id, place.lab, day)]);
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
    const receipt = sealReceipt({ userId: student.id, question: message, reply: text, model, mode: String(body.mode ?? ""), lab: place?.lab ?? null });
    return NextResponse.json({ reply: text, remaining: left, limit, model, bonus, receipt });
  } catch {
    await releaseCoachQuestion(student.id, day);
    return NextResponse.json({ error: "PurveX Coach is unavailable right now." }, { status: 502 });
  }
}

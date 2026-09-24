import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { cleanDay, drillStats, gradeDrill, reissueDrill, startDrill, type DrillMode } from "@/lib/academy-drills";
import { generateScenario } from "@/lib/academy-scenario";
import { formatLabAge } from "@/lib/academy-lab";
import { summarize } from "@/lib/academy-score";
import { loadDailyDrill, loadDrills, loadLabState, loadProgress, saveDailyDrill, saveDrill } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";
export const maxDuration = 60;

async function auth(request: Request) {
  if (!(await isAcademyUnlocked())) return { error: NextResponse.json({ error: "Locked" }, { status: 401 }) };
  const student = await getAcademyStudent(request);
  if (!student) return { error: NextResponse.json({ error: "Sign in first." }, { status: 401 }) };
  return { student };
}

// What the student's own lab says about when they last worked in it.
async function labInfo(userId: string) {
  const lab = await loadLabState(userId);
  if (!lab) return { synced: false, syncedAt: null, ago: null, days: null };
  const age = formatLabAge(lab.uploadedAt);
  return {
    synced: true,
    syncedAt: lab.uploadedAt,
    ago: age.ago,
    days: Number.isNaN(age.hours) ? null : Math.floor(age.hours / 24),
  };
}

async function status(userId: string, day: string) {
  const [entries, lab, results] = await Promise.all([loadDrills(userId), labInfo(userId), loadProgress(userId)]);
  const gap = summarize(results).focus[0];
  return { stats: drillStats(entries, day), lab, focus: gap ? gap.label : null };
}

export async function GET(request: Request) {
  const a = await auth(request);
  if (a.error) return a.error;
  const day = cleanDay(new URL(request.url).searchParams.get("day"));
  return NextResponse.json(await status(a.student.id, day));
}

export async function POST(request: Request) {
  const a = await auth(request);
  if (a.error) return a.error;
  const userId = a.student.id;

  let body: { action?: unknown; mode?: unknown; day?: unknown; token?: unknown; answers?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const day = cleanDay(body.day);

  if (body.action === "start") {
    const mode: DrillMode = body.mode === "timed" ? "timed" : "daily";
    if (mode === "daily") {
      const stats = drillStats(await loadDrills(userId), day);
      if (stats.today) return NextResponse.json({ done: true, entry: stats.today, ...(await status(userId, day)) });
    }
    if (mode === "daily") {
      const saved = await loadDailyDrill(userId, day);
      const again = saved ? reissueDrill(userId, saved) : null;
      if (again) return NextResponse.json(again);
    }
    const [snapshot, results] = await Promise.all([
      loadLabState(userId).then((l) => l?.snapshot ?? null),
      loadProgress(userId),
    ]);
    // The daily drill is one scenario written for this student. If the
    // writer is unavailable it falls back to a stock question.
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const scenario =
      mode === "daily" && apiKey
        ? await generateScenario({ apiKey, userId, day, snapshot, results }).catch(() => null)
        : null;
    const drill = startDrill({ userId, mode, day, snapshot, results, items: scenario ? [scenario] : undefined });
    if (mode === "daily" && drill.ai) await saveDailyDrill(userId, day, drill.token);
    return NextResponse.json(drill);
  }

  if (body.action === "finish") {
    const graded = typeof body.token === "string" ? gradeDrill(userId, body.token, body.answers) : null;
    if (!graded) return NextResponse.json({ error: "That drill expired. Start a new one." }, { status: 400 });
    let entry = graded.entry;
    if (entry.mode === "daily") {
      // The first daily result of the day stands.
      const prior = drillStats(await loadDrills(userId), entry.day).today;
      if (prior) entry = prior;
      else await saveDrill(userId, entry);
    } else if (!graded.late) {
      await saveDrill(userId, entry);
    }
    return NextResponse.json({
      entry,
      review: graded.review,
      late: graded.late,
      counted: entry.id === graded.entry.id,
      ...(await status(userId, day)),
    });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

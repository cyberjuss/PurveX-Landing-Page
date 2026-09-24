import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { COACH_DAILY_LIMIT } from "@/lib/academy-coach";
import {
  checkChange,
  cleanDay,
  coachBonus,
  drillHint,
  drillStats,
  gradeDrill,
  LEVEL_NAMES,
  levelFor,
  missedQuestions,
  pickFormat,
  recentPrompts,
  reissueDrill,
  startDrill,
  weekStart,
  weeklyReport,
  type DrillEntry,
  type DrillMode,
} from "@/lib/academy-drills";
import { formatLabAge } from "@/lib/academy-lab";
import { generateCtf, generateDaily, responseGrader } from "@/lib/academy-scenario";
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

function ctfOf(entries: DrillEntry[], day: string) {
  return entries.find((e) => e.mode === "ctf" && e.id === `ctf-${weekStart(day)}`) ?? null;
}

async function status(userId: string, day: string) {
  const [entries, lab, results] = await Promise.all([loadDrills(userId), labInfo(userId), loadProgress(userId)]);
  const gap = summarize(results).focus[0];
  const level = levelFor(entries);
  const chats = coachBonus(entries, new Date().toISOString().slice(0, 10));
  return {
    stats: drillStats(entries, day),
    lab,
    focus: gap ? gap.label : null,
    level: { n: level, name: LEVEL_NAMES[level - 1] },
    ctf: { week: weekStart(day), entry: ctfOf(entries, day) },
    report: weeklyReport(entries, day),
    missed: missedQuestions(entries, 8),
    chats: { base: COACH_DAILY_LIMIT, ...chats },
  };
}

// First result stands: one daily drill a day, one CTF a week. Timed drills always count unless late.
async function record(userId: string, graded: NonNullable<Awaited<ReturnType<typeof gradeDrill>>>, day: string) {
  let entry = graded.entry;
  if (entry.mode === "daily" || entry.mode === "ctf") {
    const entries = await loadDrills(userId);
    const prior = entry.mode === "daily" ? drillStats(entries, entry.day).today : entries.find((e) => e.id === entry.id) ?? null;
    if (prior) entry = prior;
    else await saveDrill(userId, entry);
  } else if (!graded.late) {
    await saveDrill(userId, entry);
  }
  return {
    entry,
    review: graded.review,
    late: graded.late,
    counted: entry.id === graded.entry.id && entry.at === graded.entry.at,
    ...(await status(userId, day)),
  };
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

  let body: { action?: unknown; mode?: unknown; day?: unknown; token?: unknown; answers?: unknown; format?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const day = cleanDay(body.day);
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (body.action === "hint") {
    const hint = typeof body.token === "string" ? drillHint(userId, body.token) : null;
    return NextResponse.json({ hint: hint ?? "No hint for this one." });
  }

  if (body.action === "start") {
    const mode: DrillMode = body.mode === "timed" ? "timed" : body.mode === "ctf" ? "ctf" : "daily";
    const entries = await loadDrills(userId);

    if (mode === "daily" && drillStats(entries, day).today) {
      return NextResponse.json({ done: true, ...(await status(userId, day)) });
    }
    if (mode === "ctf" && ctfOf(entries, day)) {
      return NextResponse.json({ done: true, ...(await status(userId, day)) });
    }

    // Daily and CTF scenarios are written once and then kept, so a reload
    // brings back the same question. A student who cannot do a lab change
    // right now can swap today's for a written case.
    const swap = mode === "daily" && body.format === "respond";
    const kind = mode === "ctf" ? "ctf" : "daily";
    const keyDay = mode === "ctf" ? weekStart(day) : day;
    if (mode !== "timed" && !swap) {
      const saved = await loadDailyDrill(userId, keyDay, kind);
      const again = saved ? reissueDrill(userId, saved) : null;
      if (again) return NextResponse.json(again);
    }

    const [snapshot, results] = await Promise.all([
      loadLabState(userId).then((l) => l?.snapshot ?? null),
      loadProgress(userId),
    ]);
    const level = levelFor(entries);
    const recent = recentPrompts(entries);

    let item = null;
    if (apiKey && mode === "daily") {
      const format = swap ? "respond" : pickFormat(`${userId}:${day}`, level, Boolean(snapshot));
      item = await generateDaily({ apiKey, userId, day, snapshot, results, level, recent, format }).catch(() => null);
    } else if (apiKey && mode === "ctf") {
      item = await generateCtf({ apiKey, userId, week: keyDay, snapshot, results, level, recent }).catch(() => null);
    }
    if (mode === "ctf" && !item) {
      return NextResponse.json({ error: "Could not write this week's CTF. Try again in a minute." }, { status: 503 });
    }

    const drill = startDrill({
      userId,
      mode,
      day,
      snapshot,
      results,
      level: mode === "ctf" ? Math.min(4, level + 1) : level,
      avoid: recent.map((r) => r.p),
      items: item ? [item] : undefined,
      id: mode === "ctf" ? `ctf-${keyDay}` : undefined,
    });
    if (mode !== "timed" && drill.ai) await saveDailyDrill(userId, keyDay, drill.token, kind, swap);
    return NextResponse.json(drill);
  }

  // Check a lab change against the newest snapshot the student's domain controller sent.
  if (body.action === "check") {
    if (typeof body.token !== "string") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const lab = await loadLabState(userId);
    const checked = checkChange(userId, body.token, lab);
    if (!checked) return NextResponse.json({ error: "That drill expired. Start a new one." }, { status: 400 });
    const syncedAgo = lab ? formatLabAge(lab.uploadedAt).ago : null;
    if (!checked.passed) return NextResponse.json({ ...checked, syncedAgo });
    const graded = await gradeDrill(userId, body.token, [], { changePassed: true });
    if (!graded) return NextResponse.json({ error: "That drill expired. Start a new one." }, { status: 400 });
    return NextResponse.json({ ...checked, syncedAgo, ...(await record(userId, graded, day)) });
  }

  if (body.action === "finish") {
    if (typeof body.token !== "string") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    let graded;
    try {
      graded = await gradeDrill(userId, body.token, body.answers, { grader: apiKey ? responseGrader(apiKey) : undefined });
    } catch {
      return NextResponse.json({ error: "Could not mark your answer just now. Try again." }, { status: 503 });
    }
    if (!graded) return NextResponse.json({ error: "That drill expired. Start a new one." }, { status: 400 });
    return NextResponse.json(await record(userId, graded, day));
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

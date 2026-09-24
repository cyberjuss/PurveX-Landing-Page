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
  incidentHold,
  jobProgress,
  LEVEL_NAMES,
  levelFor,
  missedQuestions,
  pickFormat,
  pickTargetJob,
  recentPrompts,
  reissueDrill,
  startDrill,
  stockCtf,
  unlockGate,
  weekStart,
  weeklyReport,
  type DrillEntry,
  type DrillMode,
} from "@/lib/academy-drills";
import { formatLabAge } from "@/lib/academy-lab";
import { auditLab } from "@/lib/academy-audit";
import { createRealCtf } from "@/lib/academy-live";
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
function labInfo(lab: Awaited<ReturnType<typeof loadLabState>>) {
  if (!lab) return { synced: false, syncedAt: null, ago: null, days: null, security: false, events: false };
  const age = formatLabAge(lab.uploadedAt);
  return {
    synced: true,
    syncedAt: lab.uploadedAt,
    ago: age.ago,
    days: Number.isNaN(age.hours) ? null : Math.floor(age.hours / 24),
    // False until the student runs the updated lab script, which reports security settings.
    security: Boolean(lab.snapshot.security?.passwordPolicy || lab.snapshot.security?.audit),
    // Whether the lab sent a digest of its real Security log, which the weekly CTF asks about.
    events: Boolean(lab.snapshot.events),
  };
}

function ctfOf(entries: DrillEntry[], day: string) {
  return entries.find((e) => e.mode === "ctf" && e.id === `ctf-${weekStart(day)}`) ?? null;
}

async function status(userId: string, day: string) {
  const [entries, labState, results] = await Promise.all([loadDrills(userId), loadLabState(userId), loadProgress(userId)]);
  const lab = labInfo(labState);
  const gap = summarize(results).focus[0];
  const level = levelFor(entries);
  const chats = coachBonus(entries, new Date().toISOString().slice(0, 10));
  // Real findings from the student's own lab. Hands-on work only ever comes from these.
  const findings = labState ? auditLab(labState.snapshot) : [];
  const labJobs = labState ? new Set(findings.filter((f) => f.task).map((f) => f.job)) : null;
  return {
    stats: drillStats(entries, day),
    lab,
    focus: gap ? gap.label : null,
    level: { n: level, name: LEVEL_NAMES[level - 1] },
    ctf: { week: weekStart(day), entry: ctfOf(entries, day) },
    report: weeklyReport(entries, day),
    missed: missedQuestions(entries, 8),
    chats: { base: COACH_DAILY_LIMIT, ...chats },
    incidentUntil: incidentHold(entries)?.until ?? null,
    jobs: jobProgress(entries, results, labState?.snapshot),
    nextJob: pickTargetJob(entries, `${userId}:${day}`, labJobs, results, labState?.snapshot)?.id ?? null,
    findings: findings.slice(0, 12).map((f) => ({ id: f.id, severity: f.severity, title: f.title, facts: f.facts, fixable: Boolean(f.task), job: f.job })),
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
    if (entry.mode === "timed" && incidentHold(await loadDrills(userId))) {
      return {
        entry,
        review: graded.review,
        late: graded.late,
        counted: false,
        ...(await status(userId, day)),
      };
    }
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
    if (mode === "timed" && incidentHold(entries)) {
      return NextResponse.json({ done: true, ...(await status(userId, day)) });
    }
    if (mode === "ctf" && ctfOf(entries, day)) {
      return NextResponse.json({ done: true, ...(await status(userId, day)) });
    }

    // Daily and CTF scenarios are written once and then kept, so a reload
    // brings back the same question. A student who cannot do a lab change
    // right now can swap today's for a written case.
    const swap = mode === "daily" && body.format === "respond";
    let replaceSaved = false;
    const kind = mode === "ctf" ? "ctf" : "daily";
    const keyDay = mode === "ctf" ? weekStart(day) : day;
    if (mode !== "timed" && !swap) {
      const saved = await loadDailyDrill(userId, keyDay, kind);
      const reopened = saved ? reissueDrill(userId, saved) : null;
      // Tasks from an older version planted practice accounts. Those are gone, so start fresh.
      const stale = Boolean(reopened?.items.some((i) => i.setup));
      const again = stale ? null : reopened;
      if (again) return NextResponse.json(again);
      replaceSaved = stale;
    }

    // The weekly CTF is asked about the student's own Security log when it has one.
    if (mode === "ctf") {
      const real = await createRealCtf(userId, day).catch((err) => {
        console.error("ctf: real log question failed", err);
        return null;
      });
      if (real) return NextResponse.json(real);
    }

    const [snapshot, results] = await Promise.all([
      loadLabState(userId).then((l) => l?.snapshot ?? null),
      loadProgress(userId),
    ]);
    const level = levelFor(entries);
    const recent = recentPrompts(entries);

    let item = null;
    if (apiKey && mode === "daily") {
      // Aim at the on-the-job task they have shown the least, so the daily drill covers what the job needs.
      const fixable = snapshot ? auditLab(snapshot).filter((f) => f.task) : [];
      const labJobs = snapshot ? new Set(fixable.map((f) => f.job)) : null;
      const target = pickTargetJob(entries, `${userId}:${day}`, labJobs, results, snapshot);
      const format = swap ? "respond" : pickFormat(`${userId}:${day}`, level, fixable.length > 0, Boolean(target?.lab));
      const targetJob = target ? { id: target.id, label: target.label } : null;
      item = await generateDaily({ apiKey, userId, day, snapshot, results, level, recent, format, targetJob }).catch(() => null);
    } else if (apiKey && mode === "ctf") {
      item = await generateCtf({ apiKey, userId, week: keyDay, snapshot, results, level, recent }).catch((err) => {
        console.error("ctf: writer failed", err);
        return null;
      });
    }
    if (mode === "ctf" && !item) item = stockCtf(snapshot, keyDay);

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
    if (mode !== "timed" && drill.ai) await saveDailyDrill(userId, keyDay, drill.token, kind, swap || replaceSaved);
    return NextResponse.json(drill);
  }

  // A gated CTF: the typed answer unlocks the lab task.
  if (body.action === "unlock") {
    if (typeof body.token !== "string") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const unlocked = unlockGate(userId, body.token, body.answers);
    if (!unlocked) return NextResponse.json({ error: "That drill expired. Start a new one." }, { status: 400 });
    return NextResponse.json(unlocked);
  }

  // Check a lab change against the newest snapshot the student's domain controller sent.
  if (body.action === "check") {
    if (typeof body.token !== "string") return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const lab = await loadLabState(userId);
    const checked = checkChange(userId, body.token, lab, body.answers);
    if (!checked) return NextResponse.json({ error: "That drill expired. Start a new one." }, { status: 400 });
    const syncedAgo = lab ? formatLabAge(lab.uploadedAt).ago : null;
    if (!checked.passed) return NextResponse.json({ ...checked, syncedAgo });
    const graded = await gradeDrill(userId, body.token, body.answers ?? [], { changePassed: true });
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

"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  CircleDot,
  Compass,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Users,
  Wrench,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { CoachChat, CoachHeader } from "@/components/academy/coach-chat";
import { useCoach } from "@/components/academy/coach-context";
import { academyFetch, RESULTS_CHANGED_EVENT, useResults } from "@/lib/academy-client";
import { MISSION_CATALOG, type MissionCatalogEntry } from "@/lib/academy-missions";
import {
  clearResults,
  LEVELS,
  missionPoints,
  SKILLS,
  summarize,
  type MissionResult,
  type Skill,
  type Summary,
} from "@/lib/academy-score";

const HOME_LAB_PATH = "/academy/phase-1/home-lab-active-directory";

const LEVEL_COLOR: Record<Summary["level"], string> = {
  none: "#94a3b8",
  progress: "#5546e0",
  ready: "#16a34a",
  almost: "#d99a1a",
  practice: "#e5484d",
};

const SKILL_ICON: Record<Skill, LucideIcon> = {
  accounts: Users,
  directory: Compass,
  troubleshooting: Wrench,
  security: ShieldAlert,
};

const CHALLENGES: { key: MissionCatalogEntry["challenge"]; label: string }[] = [
  { key: "day-one", label: "Operation Day One" },
  { key: "ticket-queue", label: "Ticket Queue" },
];

function scoreColor(score: number | null) {
  if (score === null) return "#94a3b8";
  return score >= 85 ? "#16a34a" : score >= 65 ? "#d99a1a" : "#e5484d";
}

function ScoreRing({ value, color, size = 132 }: { value: number | null; color: string; size?: number }) {
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = value ?? 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--pvrx-border-light)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.16,1,.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-bold tracking-tight text-slate-900">{value === null ? "—" : value}</span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
          {value === null ? "no score" : "of 100"}
        </span>
      </div>
    </div>
  );
}

function missionStatus(r: MissionResult | undefined) {
  const points = missionPoints(r);
  if (!r) return { icon: Circle, tone: "text-slate-300", label: "Not started", points, needsHelp: false };
  if (r.solved) {
    const tries = r.wrong + 1;
    return {
      icon: CheckCircle2,
      tone: tries === 1 && !r.hint ? "text-emerald-600" : "text-amber-500",
      label: tries === 1 ? (r.hint ? "Solved with a hint" : "Solved first try") : `Solved in ${tries} tries`,
      points,
      needsHelp: tries > 1 || r.hint,
    };
  }
  if (r.wrong >= 3) return { icon: XCircle, tone: "text-red-500", label: "Missed", points, needsHelp: true };
  return {
    icon: CircleDot,
    tone: "text-[#5546e0]",
    label: `In progress · ${r.wrong} wrong ${r.wrong === 1 ? "try" : "tries"}`,
    points,
    needsHelp: r.wrong > 0,
  };
}

function coachTake(s: Summary) {
  if (s.finished === 0) {
    return "Start with Operation Day One. Every answer you give builds your score and shows me where to help.";
  }
  const gap = s.focus[0];
  if (s.level === "ready") return "You are Help Desk Ready. Keep your edge by redoing the tickets on your own lab without hints.";
  if (!gap) return "Strong work so far. Finish the remaining missions to get your full readiness rating.";
  const score = gap.score === null ? "not started yet" : `${gap.score}%`;
  return `Your biggest gap is ${gap.label} (${score}). ${gap.advice}`;
}

export function ReadinessDashboard() {
  const results = useResults();
  const { ask, registerInline } = useCoach();
  const s = summarize(results);
  const lv = LEVELS[s.level];
  const scored = s.skills.filter((k) => k.score !== null).sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const strongest = scored[0];
  const missed = Object.values(MISSION_CATALOG).filter((m) => missionStatus(results[m.id]).needsHelp);

  function reset() {
    if (!window.confirm("Reset your readiness score? This clears every mission result.")) return;
    clearResults();
    window.dispatchEvent(new Event(RESULTS_CHANGED_EVENT));
    academyFetch("/academy/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: {} }),
    }).catch(() => {});
  }

  return (
    <div>
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#5546e0]">Help Desk Readiness</p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Are you ready for the job?
      </h1>

      <div className="mt-8">
        <div className="flex min-w-0 flex-col gap-8">
          {/* Score */}
          <section className="rounded-2xl border border-[var(--pvrx-border-light)] bg-white p-6 sm:p-7">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <ScoreRing value={s.finished === 0 ? null : s.overall} color={LEVEL_COLOR[s.level]} />
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <span
                  className="inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.08em]"
                  style={{ color: LEVEL_COLOR[s.level], background: `${LEVEL_COLOR[s.level]}1a` }}
                >
                  {lv.label}
                </span>
                <p className="mt-3 text-sm leading-6 text-slate-600">{lv.note}</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Missions finished</span>
                    <span className="font-mono">
                      {s.finished} / {s.total}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#5546e0] transition-[width] duration-700"
                      style={{ width: `${(s.finished / s.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Coach's read on the score */}
            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-[rgba(85,70,224,0.2)] bg-[rgba(85,70,224,0.06)] p-4 sm:flex-row sm:items-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#5546e0] text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#5546e0]">Coach&apos;s take</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{coachTake(s)}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  ask(
                    s.finished === 0
                      ? "I'm just getting started. How should I approach Operation Day One?"
                      : "Look at my readiness score and skill gaps and give me a short study plan for this week. Don't give me any mission answers."
                  )
                }
                className="shrink-0 rounded-lg bg-[#5546e0] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#4a3cd0]"
              >
                {s.finished === 0 ? "How do I start?" : "Build my study plan"}
              </button>
            </div>
          </section>

          {/* Coach */}
          <section ref={registerInline} className="pc-panel pc-wide flex scroll-mt-24 flex-col overflow-hidden rounded-2xl">
            <CoachHeader />
            <CoachChat />
          </section>

          {/* Skills */}
          <section>
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-slate-900">Skills</h2>
              {strongest && (
                <p className="text-xs text-slate-500">
                  Strongest: <strong className="text-slate-700">{strongest.label}</strong>
                </p>
              )}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {s.skills.map((k) => {
                const Icon = SKILL_ICON[k.key];
                const color = scoreColor(k.score);
                const isGap = s.focus.some((f) => f.key === k.key) && s.finished > 0;
                return (
                  <div
                    key={k.key}
                    className={`flex flex-col rounded-2xl border bg-white p-4 ${
                      isGap ? "border-[rgba(229,72,77,0.35)]" : "border-[var(--pvrx-border-light)]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{k.label}</p>
                          <p className="text-xs text-slate-400">
                            {k.done} of {k.total} missions
                          </p>
                        </div>
                      </div>
                      <span className="font-display text-xl font-bold" style={{ color }}>
                        {k.score === null ? "—" : `${k.score}%`}
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${k.score ?? 0}%`, background: color }} />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        ask(
                          `Coach me on ${k.label}. My score there is ${k.score === null ? "not started" : `${k.score}%`}. What should I practice, without giving me mission answers?`
                        )
                      }
                      className="mt-3 inline-flex w-fit items-center gap-1 text-xs font-semibold text-[#5546e0] hover:underline"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Coach me on this
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Missions */}
          <section>
            <div className="flex items-end justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-slate-900">Mission history</h2>
              {missed.length > 0 && (
                <p className="text-xs text-slate-500">
                  {missed.length} to review with the coach
                </p>
              )}
            </div>
            <div className="mt-3 flex flex-col gap-4">
              {CHALLENGES.map((ch) => {
                const list = Object.values(MISSION_CATALOG).filter((m) => m.challenge === ch.key);
                const done = list.filter((m) => missionPoints(results[m.id]) !== null).length;
                return (
                  <div key={ch.key} className="overflow-hidden rounded-2xl border border-[var(--pvrx-border-light)] bg-white">
                    <div className="flex items-center justify-between gap-3 border-b border-[var(--pvrx-border-light)] px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">{ch.label}</p>
                      <Link href={HOME_LAB_PATH} className="inline-flex items-center gap-1 text-xs font-semibold text-[#5546e0] hover:underline">
                        {done === 0 ? "Start" : done === list.length ? "Review" : "Continue"} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <ul>
                      {list.map((m) => {
                        const st = missionStatus(results[m.id]);
                        const Icon = st.icon;
                        return (
                          <li
                            key={m.id}
                            className="flex items-center gap-3 border-b border-[var(--pvrx-border-light)] px-4 py-2.5 last:border-b-0"
                          >
                            <Icon className={`h-[18px] w-[18px] shrink-0 ${st.tone}`} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm text-slate-800">{m.title}</p>
                              <p className="text-xs text-slate-400">
                                {st.label} · {SKILLS[m.skill].label}
                              </p>
                            </div>
                            {st.points !== null && (
                              <span className="font-mono text-xs font-semibold text-slate-500">{st.points} pts</span>
                            )}
                            {st.needsHelp && (
                              <button
                                type="button"
                                onClick={() =>
                                  ask(
                                    `Help me understand where I went wrong on "${m.title}" (${m.id}). Guide me with questions, don't give me the answer.`
                                  )
                                }
                                className="shrink-0 rounded-md border border-[var(--pvrx-border-light)] px-2 py-1 text-xs font-semibold text-slate-600 transition hover:border-[rgba(106,92,255,0.35)] hover:text-[#5546e0]"
                              >
                                Ask why
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
            {s.finished > 0 && (
              <button
                type="button"
                onClick={reset}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-red-600"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset score
              </button>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

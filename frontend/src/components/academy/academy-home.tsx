"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Radar, Siren, type LucideIcon } from "lucide-react";
import type { PhaseDef } from "@/lib/academy-content";
import { useAcademyProgress } from "./academy-progress";

interface PhaseCardConfig {
  slug: string;
  href: string;
  icon: LucideIcon;
  tag: string;
  title: string;
  body: string;
  accent: string;
  accentSoft: string;
  phase?: PhaseDef;
}

const PHASE_CARDS: PhaseCardConfig[] = [
  {
    slug: "phase-1",
    href: "/academy/phase-1",
    icon: BookOpen,
    tag: "Phase 1",
    title: "Fundamentals",
    body: "CIA triad, networking, encryption & hashing, authentication and access control.",
    accent: "#5546e0",
    accentSoft: "rgba(106,92,255,0.1)",
  },
  {
    slug: "phase-2",
    href: "/academy/phase-2",
    icon: Radar,
    tag: "Phase 2",
    title: "Threat Detection & Log Analysis",
    body: "SIEM fundamentals, log analysis, and detection engineering.",
    accent: "#2563eb",
    accentSoft: "rgba(37,99,235,0.1)",
  },
  {
    slug: "phase-3",
    href: "/academy/phase-3",
    icon: Siren,
    tag: "Phase 3",
    title: "Incident Response",
    body: "Triage, investigation, containment, and writing it up.",
    accent: "#e2932a",
    accentSoft: "rgba(226,147,42,0.12)",
  },
];

function ProgressRing({ pct, size = 76, strokeWidth = 7 }: { pct: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, pct)) / 100) * circumference;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }} aria-hidden="true">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--pvrx-surface-alt-light)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#6a5cff"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset .6s cubic-bezier(.16,1,.3,1)" }}
      />
    </svg>
  );
}

export function AcademyHome({ phases }: { phases: PhaseDef[] }) {
  const { isComplete, completedCount, totalCount } = useAcademyProgress();
  const overallPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  function phaseProgress(phase: PhaseDef | undefined) {
    if (!phase) return null;
    const entries = [...phase.weeks, ...(phase.homeLab ? [phase.homeLab] : [])];
    const withContent = entries.filter((e) => e.sections.length > 0);
    if (withContent.length === 0) return null;
    const done = withContent.filter((e) => isComplete(phase.slug, e.slug)).length;
    return { done, total: withContent.length };
  }

  const cards = PHASE_CARDS.map((card) => ({
    ...card,
    phase: phases.find((p) => p.slug === card.slug),
  }));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#5546e0]">Course overview</p>
          <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Think Like a SOC Analyst 101
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
            A hands-on path from security fundamentals to incident response, built around real logs, real
            tools, and real labs.
          </p>
        </div>

        {totalCount > 0 && (
          <div className="flex shrink-0 items-center gap-4 rounded-md border border-[var(--pvrx-border-light)] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(16,25,46,0.04)]">
            <div className="relative flex h-[76px] w-[76px] items-center justify-center">
              <ProgressRing pct={overallPct} />
              <span className="absolute font-mono text-base font-bold text-slate-900">{overallPct}%</span>
            </div>
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">Your progress</p>
              <p className="mt-1 font-display text-lg font-semibold text-slate-900">
                {completedCount} <span className="text-sm font-medium text-slate-400">/ {totalCount} complete</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {cards.map((card) => {
          const progress = phaseProgress(card.phase);
          const isComingSoon = progress === null;
          return (
            <Link
              key={card.slug}
              href={card.href}
              className="group relative flex items-start gap-4 overflow-hidden rounded-md border border-[var(--pvrx-border-light)] bg-white p-5 shadow-[0_1px_2px_rgba(16,25,46,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_48px_-30px_rgba(15,23,42,0.25)]"
            >
              <span className="absolute inset-y-0 left-0 w-1" style={{ background: card.accent }} aria-hidden="true" />
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
                style={{ background: card.accentSoft, color: card.accent }}
              >
                <card.icon className="h-5 w-5" />
              </span>
              <span className="flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: card.accent }}>
                    {card.tag}
                  </span>
                  {isComingSoon ? (
                    <span className="rounded-sm bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Coming soon
                    </span>
                  ) : (
                    <span className="rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide" style={{ background: card.accentSoft, color: card.accent }}>
                      {progress.done} / {progress.total} done
                    </span>
                  )}
                </span>
                <span className="mt-1 block font-display text-base font-semibold text-slate-900">{card.title}</span>
                <span className="mt-1 block text-sm text-slate-500">{card.body}</span>
              </span>
              <ArrowRight className="mt-2 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

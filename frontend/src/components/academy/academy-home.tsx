"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PhaseDef, WeekDef } from "@/lib/academy-content";
import { READINESS_PATH, useResults } from "@/lib/academy-client";
import { LEVELS, summarize } from "@/lib/academy-score";
import { accountFirstName, useAcademyAccount } from "./academy-account";
import { useAcademyProgress } from "./academy-progress";

const PHASE_COPY: { slug: string; href: string; title: string; body: string }[] = [
  {
    slug: "phase-1",
    href: "/academy/phase-1",
    title: "Fundamentals",
    body: "The CIA triad through access control, then a home lab where you run an Active Directory domain yourself.",
  },
  {
    slug: "phase-2",
    href: "/academy/phase-2",
    title: "Threat Detection & Log Analysis",
    body: "SIEM fundamentals and log analysis, building toward detection engineering.",
  },
  {
    slug: "phase-3",
    href: "/academy/phase-3",
    title: "Incident Response",
    body: "Triage and investigation through containment and writing it up.",
  },
];

function entriesOf(phase: PhaseDef | undefined): WeekDef[] {
  if (!phase) return [];
  return [...phase.weeks, ...(phase.homeLab ? [phase.homeLab] : [])];
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function AcademyHome({ phases }: { phases: PhaseDef[] }) {
  const { isComplete, completedCount, lastStop } = useAcademyProgress();
  const readiness = summarize(useResults());
  const firstName = accountFirstName(useAcademyAccount());
  const returning = Boolean(lastStop || completedCount > 0 || readiness.finished > 0);
  const greeting = returning ? "Welcome back" : "Welcome";

  let firstOpen: { href: string; title: string; phaseSlug: string; entrySlug: string } | null = null;
  for (const copy of PHASE_COPY) {
    const phase = phases.find((p) => p.slug === copy.slug);
    for (const entry of entriesOf(phase)) {
      if (entry.sections.length > 0 && phase && !isComplete(phase.slug, entry.slug)) {
        firstOpen = { href: `/academy/${phase.slug}/${entry.slug}`, title: entry.title, phaseSlug: phase.slug, entrySlug: entry.slug };
        break;
      }
    }
    if (firstOpen) break;
  }

  const lastPhase = lastStop ? phases.find((p) => p.slug === lastStop.phaseSlug) : undefined;
  const lastEntry = lastPhase ? entriesOf(lastPhase).find((e) => e.slug === lastStop?.entrySlug && e.sections.length > 0) : undefined;
  const pin = lastEntry && lastPhase
    ? { href: `/academy/${lastPhase.slug}/${lastEntry.slug}`, title: lastEntry.title, phaseSlug: lastPhase.slug, entrySlug: lastEntry.slug, kind: "last" as const }
    : firstOpen
      ? { ...firstOpen, kind: "start" as const }
      : null;

  return (
    <div className="rd">
      <header className="rd-mast">
        <div className="ax-titleblock">
          <h1>{firstName ? `${greeting}, ${firstName}` : greeting}</h1>
          <p>A hands-on path from security fundamentals to incident response, using real logs and real tools in real labs.</p>
        </div>
        <div className="ax-status">
          {pin ? (
            <Link href={pin.href} className="ax-status__next">
              <span className="rd-kicker">{pin.kind === "last" ? "Last stop" : "Start here"}</span>
              <strong>
                {pin.title} <ArrowRight className="h-4 w-4" />
              </strong>
            </Link>
          ) : (
            <div className="ax-status__next">
              <span className="rd-kicker">Course</span>
              <strong>Published lessons complete</strong>
            </div>
          )}
          <Link href={READINESS_PATH} className="ax-status__score">
            <span className="rd-kicker">Readiness</span>
            <strong>{readiness.finished === 0 ? "––" : readiness.overall}</strong>
            <em>{LEVELS[readiness.level].label}</em>
          </Link>
        </div>
      </header>

      <ol className="ax-path">
        {PHASE_COPY.map((copy, i) => {
          const phase = phases.find((p) => p.slug === copy.slug);
          const entries = entriesOf(phase);
          const live = entries.filter((e) => e.sections.length > 0);
          const done = phase ? live.filter((e) => isComplete(phase.slug, e.slug)).length : 0;
          const soon = live.length === 0;
          const here = Boolean(pin && phase && pin.phaseSlug === phase.slug);
          const href = here ? pin!.href : copy.href;
          const row = (
            <>
              <span className="ax-path__n">{pad(i + 1)}</span>
              <span className="ax-path__main">
                <span className="ax-path__title">
                  {copy.title}
                  {soon ? (
                    <em className="ax-tag">In preparation</em>
                  ) : done === live.length ? (
                    <em className="ax-tag ax-tag--good">Complete</em>
                  ) : here ? (
                    <em className="ax-tag ax-tag--here">Here</em>
                  ) : null}
                </span>
                <span className="ax-path__body">{here && pin ? pin.title : copy.body}</span>
                {!soon && phase && (
                  <span className="ax-segs" aria-label={`${done} of ${live.length} lessons complete`}>
                    {live.map((e) => (
                      <i
                        key={e.slug}
                        className={
                          isComplete(phase.slug, e.slug)
                            ? "rd-tone-good"
                            : here && pin?.entrySlug === e.slug
                              ? "rd-tone-live"
                              : "rd-tone-none"
                        }
                        title={e.title}
                      />
                    ))}
                  </span>
                )}
              </span>
              <span className="ax-path__count">
                {soon ? "—" : `${done}/${live.length}`}
                {!soon && <ArrowRight className="h-4 w-4" />}
              </span>
            </>
          );
          return (
            <li key={copy.slug}>
              {soon ? (
                <div className="ax-path__row ax-path__row--soon">{row}</div>
              ) : (
                <Link href={href} className={`ax-path__row${here ? " ax-path__row--here" : ""}`}>
                  {row}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

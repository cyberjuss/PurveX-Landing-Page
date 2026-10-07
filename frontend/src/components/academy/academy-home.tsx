"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { type PhaseDef } from "@/lib/academy-content";
import { entriesOf } from "@/lib/academy-entries";
import { READINESS_PATH, useResults } from "@/lib/academy-client";
import { CHALLENGE_LABELS, challengeHref, lastTouchedMission } from "@/lib/academy-missions";
import { LEVELS, summarize } from "@/lib/academy-score";
import { DrillCard } from "./drill-card";
import { AcademyTour } from "./tour";
import { accountFirstName, useAcademyAccount } from "./academy-account";
import { useAcademyProgress } from "./academy-progress";
import { isLockedHref, isPhaseLocked } from "@/lib/academy-locks";

const PHASE_COPY: { slug: string; href: string; title: string; body: string }[] = [
  {
    slug: "phase-1",
    href: "/range/phase-1",
    title: "Fundamentals",
    body: "Name what failed then stand up PurveX Financial and work the directory yourself.",
  },
  {
    slug: "phase-2",
    href: "/range/phase-2",
    title: "Threat Detection & Log Analysis",
    body: "An alert fires. Read the host, the account, and the log before you decide what happened.",
  },
  {
    slug: "phase-3",
    href: "/range/phase-3",
    title: "Incident Response",
    body: "Triage, investigate, contain, and write it up.",
  },
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function AcademyHome({ phases }: { phases: PhaseDef[] }) {
  const { isComplete, isPhaseComplete, completedCount, lastStop } = useAcademyProgress();
  const results = useResults();
  const readiness = summarize(results);
  const firstName = accountFirstName(useAcademyAccount());
  const returning = Boolean(lastStop || completedCount > 0 || readiness.finished > 0);
  const greeting = returning ? "Welcome back" : "Welcome";
  const touched = lastTouchedMission(results);
  const lastMission = touched && !isLockedHref(challengeHref(touched.challenge, results)) ? touched : null;

  let firstOpen: { href: string; title: string; phaseSlug: string; entrySlug: string } | null = null;
  for (const copy of PHASE_COPY) {
    const phase = phases.find((p) => p.slug === copy.slug);
    if (isPhaseLocked(copy.slug)) continue;
    for (const entry of entriesOf(phase)) {
      if (entry.sections.length > 0 && phase && !isComplete(phase.slug, entry.slug)) {
        firstOpen = { href: `/range/${phase.slug}/${entry.slug}`, title: entry.title, phaseSlug: phase.slug, entrySlug: entry.slug };
        break;
      }
    }
    if (firstOpen) break;
  }

  const lastPhase = lastStop && !isPhaseLocked(lastStop.phaseSlug) ? phases.find((p) => p.slug === lastStop.phaseSlug) : undefined;
  const lastEntry = lastPhase ? entriesOf(lastPhase).find((e) => e.slug === lastStop?.entrySlug && e.sections.length > 0) : undefined;
  // Opening something is not the same as getting anywhere. Until a student has
  // finished an entry or a mission, the last place they clicked is not where
  // they "left off" -- someone who looked at the home lab once and bounced was
  // being sent back to it forever, with the course still reading 0/5 and week 1
  // never offered. Once there is real progress, the last stop wins again.
  const resumeEntry = completedCount > 0 || readiness.finished > 0 ? lastEntry : undefined;
  const pin = resumeEntry && lastPhase
    ? { href: `/range/${lastPhase.slug}/${resumeEntry.slug}`, title: resumeEntry.title, phaseSlug: lastPhase.slug, entrySlug: resumeEntry.slug, kind: "last" as const }
    : firstOpen
      ? { ...firstOpen, kind: "start" as const }
      : lastEntry && lastPhase
        ? { href: `/range/${lastPhase.slug}/${lastEntry.slug}`, title: lastEntry.title, phaseSlug: lastPhase.slug, entrySlug: lastEntry.slug, kind: "last" as const }
        : null;
  // The card names the place it links to: an open challenge wins over the last lesson tab.
  const resume = lastMission
    ? { href: challengeHref(lastMission.challenge, results), title: CHALLENGE_LABELS[lastMission.challenge], kind: "last" as const }
    : pin;

  return (
    <div className="rd ax-home">
      <header className="rd-mast">
        <div className="ax-welcome">
          <div className="ax-titleblock">
            <h1>{firstName ? `${greeting} ${firstName}` : greeting}</h1>
            <p>Work the same problems a new hire sees. Fundamentals first then a live directory then alerts and logs.</p>
          </div>
          <Link href={READINESS_PATH} className="ax-status__score" data-tour="readiness">
            <span className="rd-kicker">Readiness</span>
            <strong>
              {readiness.finished === 0 ? "––" : readiness.overall}
              <small>/100</small>
            </strong>
            <em>{LEVELS[readiness.level].label}</em>
          </Link>
        </div>
        <div className="ax-status ax-rise" style={{ ["--ax-i" as string]: 0 }}>
          {resume ? (
            <Link href={resume.href} className="ax-status__next" data-tour="next">
              <span className="rd-kicker">{resume.kind === "last" ? "Last stop" : "Start here"}</span>
              <strong>
                {resume.title} <ArrowRight className="h-4 w-4" />
              </strong>
            </Link>
          ) : (
            <div className="ax-status__next">
              <span className="rd-kicker">Course</span>
              <strong>Published lessons complete</strong>
            </div>
          )}
        </div>
      </header>

      <div className="ax-rise" style={{ ["--ax-i" as string]: 1 }} data-tour="drills">
        <DrillCard />
      </div>

      <ol className="ax-path" data-tour="path">
        {PHASE_COPY.map((copy, i) => {
          const phase = phases.find((p) => p.slug === copy.slug);
          const entries = entriesOf(phase);
          const live = entries.filter((e) => e.sections.length > 0);
          const done = phase ? live.filter((e) => isComplete(phase.slug, e.slug)).length : 0;
          const locked = isPhaseLocked(copy.slug);
          const soon = live.length === 0 || locked;
          const here = Boolean(pin && phase && pin.phaseSlug === phase.slug);
          const href = here ? pin!.href : copy.href;
          const row = (
            <>
              <span className="ax-path__n">{pad(i + 1)}</span>
              <span className="ax-path__main">
                <span className="ax-path__title">
                  {copy.title}
                  {locked ? (
                    <em className="ax-tag">Locked</em>
                  ) : soon ? (
                    <em className="ax-tag">In preparation</em>
                  ) : phase && isPhaseComplete(phase.slug) ? (
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
            <li key={copy.slug} className="ax-rise" style={{ ["--ax-i" as string]: i + 2 }}>
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

      <AcademyTour />
    </div>
  );
}

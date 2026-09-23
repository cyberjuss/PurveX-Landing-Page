"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PhaseDef } from "@/lib/academy-content";
import { READINESS_PATH, useResults } from "@/lib/academy-client";
import { LEVELS, summarize } from "@/lib/academy-score";
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

export function AcademyHome({ phases }: { phases: PhaseDef[] }) {
  const { isComplete, completedCount, totalCount } = useAcademyProgress();
  const readiness = summarize(useResults());

  return (
    <div className="rd">
      <header className="rd-mast">
        <div className="rd-meta">
          <span>PurveX Academy · Course file</span>
          <span>SOC Analyst track</span>
          <span>
            {completedCount}/{totalCount} lessons complete
          </span>
        </div>
        <div className="ax-titleblock">
          <p className="rd-kicker">Course 101</p>
          <h1>Think Like a SOC Analyst</h1>
          <p>A hands-on path from security fundamentals to incident response, using real logs and real tools in real labs.</p>
        </div>
        <Link href={READINESS_PATH} className="ax-readiness">
          <span className="rd-kicker">Help Desk Readiness</span>
          <span className="ax-readiness__num">{readiness.finished === 0 ? "––" : readiness.overall}</span>
          <span className="ax-readiness__label">{LEVELS[readiness.level].label}</span>
          <span className="ax-readiness__go">
            Open report <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </header>

      <section className="rd-sec">
        <div className="rd-sec__head">
          <span className="rd-sec__n">01</span>
          <h2>Curriculum</h2>
          <p>Three phases. Each one ends with work you can show a hiring manager.</p>
        </div>
        <ol className="ax-curriculum">
          {PHASE_COPY.map((copy, i) => {
            const phase = phases.find((p) => p.slug === copy.slug);
            const entries = phase ? [...phase.weeks, ...(phase.homeLab ? [phase.homeLab] : [])] : [];
            const live = entries.filter((e) => e.sections.length > 0);
            const done = phase ? live.filter((e) => isComplete(phase.slug, e.slug)).length : 0;
            const soon = live.length === 0;
            const body = (
              <>
                <span className="ax-curriculum__n">{String(i + 1).padStart(2, "0")}</span>
                <span className="ax-curriculum__main">
                  <span className="ax-curriculum__title">
                    {copy.title}
                    {soon ? <em className="ax-tag">In preparation</em> : done === live.length ? <em className="ax-tag ax-tag--good">Complete</em> : null}
                  </span>
                  <span className="ax-curriculum__body">{copy.body}</span>
                  {!soon && phase && (
                    <span className="ax-segs" aria-label={`${done} of ${live.length} lessons complete`}>
                      {live.map((e) => (
                        <i key={e.slug} className={isComplete(phase.slug, e.slug) ? "rd-tone-good" : "rd-tone-none"} title={e.title} />
                      ))}
                    </span>
                  )}
                </span>
                <span className="ax-curriculum__meta">
                  {soon ? "—" : `${done}/${live.length}`}
                  {!soon && <ArrowRight className="h-4 w-4" />}
                </span>
              </>
            );
            return (
              <li key={copy.slug}>
                {soon ? (
                  <div className="ax-curriculum__row ax-curriculum__row--soon">{body}</div>
                ) : (
                  <Link href={copy.href} className="ax-curriculum__row">
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}

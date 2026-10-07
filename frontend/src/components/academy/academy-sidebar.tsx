"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, Check, ChevronDown, FlaskConical, Lock } from "lucide-react";
import { type PhaseDef } from "@/lib/academy-content";
import { entriesOf } from "@/lib/academy-entries";
import { useAcademyProgress } from "./academy-progress";
import { isPhaseLocked } from "@/lib/academy-locks";

export function AcademySidebar({ phases, onNavigate }: { phases: PhaseDef[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { isComplete, isPhaseComplete, requirements, completedCount, totalCount } = useAcademyProgress();
  // Only the Home Lab group collapses now, so one Set of open slugs is enough.
  const [manualOpen, setManualOpen] = useState<Set<string>>(new Set());

  const toggleManualOpen = (slug: string) =>
    setManualOpen((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  return (
    <nav className="ax-scroll flex h-full flex-col gap-6 overflow-y-auto px-5 py-6">
      {/* One statement of the same number instead of three. The percentage, the
          segments and "0 of 8 lessons complete" all said it, and a 30px zero
          was the loudest thing in the rail. */}
      <div className="ax-prog">
        <p className="ax-prog__row">
          <span>Course progress</span>
          <em>
            {completedCount}
            <i>/{totalCount}</i>
          </em>
        </p>
        <span
          className="ax-prog__segs"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={totalCount}
          aria-valuenow={completedCount}
          aria-label={`${completedCount} of ${totalCount} lessons complete`}
        >
          {Array.from({ length: totalCount }, (_, i) => (
            <i key={i} className={i < completedCount ? "is-on" : ""} />
          ))}
        </span>
      </div>

      {phases.map((phase) => {
        const entries = entriesOf(phase);
        // /academy/${phase.slug} redirects straight into a week, so that
        // exact path is never actually the current pathname -- highlight
        // the phase header instead whenever any of its own weeks is active.
        const phaseActive = entries.some((entry) => pathname === `/range/${phase.slug}/${entry.slug}`);
        // A phase with weeks planned but none published yet (Phase 2) has
        // no real destination -- its route just redirects straight back to
        // wherever you already were. A phase with no week structure at all
        // (Phase 3) still has its own "still being written" page, so that
        // one stays a real link.
        const hasDestination = entries.some((e) => e.sections.length > 0) || phase.weeks.length === 0;
        // The chevron flips whichever default applies, so the phase you are in
        // can be closed and one you are not in can be opened. ORing the two
        // meant the phase you were reading could never be collapsed.
        const phaseOpen = manualOpen.has(phase.slug) ? !phaseActive : phaseActive;
        const phaseDone = isPhaseComplete(phase.slug);
        const headerContent = (
          <>
            <span className="flex min-w-0 items-center gap-1.5">
              {phaseDone && (
                <span className="ax-check ax-check--done" title={`${phase.label} complete`}>
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              )}
              <span className="truncate">{phase.label} — {phase.title}</span>
            </span>
            <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-300 ${phaseOpen ? "" : "-rotate-90"}`} />
          </>
        );
        if (isPhaseLocked(phase.slug)) {
          return (
            <div
              key={phase.slug}
              className="flex items-center justify-between gap-2 font-mono text-[15px] font-bold uppercase tracking-[0.08em] text-slate-400 opacity-70"
              title="Locked for now"
            >
              <span className="truncate">{phase.label} — {phase.title}</span>
              <Lock className="h-3 w-3 shrink-0" aria-label="Locked" />
            </div>
          );
        }
        const labs = phase.homeLabs ?? [];
        const labsKey = `${phase.slug}:labs`;
        // Open when you are inside one of them, or when you have opened it by
        // hand. Collapsed otherwise, so four sittings do not crowd the weeks.
        const labsOpen = manualOpen.has(labsKey)
          ? !labs.some((l) => pathname === `/range/${phase.slug}/${l.slug}`)
          : labs.some((l) => pathname === `/range/${phase.slug}/${l.slug}`);
        const row = (entry: PhaseDef["weeks"][number]) => {
          const href = `/range/${phase.slug}/${entry.slug}`;
          // Each sitting is titled "Home Lab — X". The group heading carries
          // the prefix so the row keeps only the part that differs.
          const label = entry.title.replace(/^Home Lab\s*[—-]\s*/, "");
          const active = pathname === href;
          const done = isComplete(phase.slug, entry.slug);
          // What the week actually asks of you: its quiz, labs and challenges.
          // A count of reading tabs would say eleven and mean nothing.
          const reqs = requirements(phase.slug, entry.slug);
          const met = reqs.filter((q) => q.done).length;
          const soon = entry.sections.length === 0;
          return (
            <li key={entry.slug}>
              {soon ? (
                <span className="ax-week ax-week--soon">
                  <span className="ax-week__name truncate">{label}</span>
                  <em className="ax-week__tag">Soon</em>
                </span>
              ) : (
                <Link
                  href={href}
                  onClick={onNavigate}
                  className={`ax-week${active ? " ax-week--on" : ""}${done ? " ax-week--done" : ""}`}
                >
                  <span className="ax-week__name truncate">{label}</span>
                  {done ? (
                    <Check className="ax-week__tick h-4 w-4" strokeWidth={2.5} aria-label="Complete" />
                  ) : reqs.length > 0 ? (
                    <em className="ax-week__count">
                      {met}<span>/{reqs.length}</span>
                    </em>
                  ) : null}
                </Link>
              )}
            </li>
          );
        };
        const labSection = labs.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => toggleManualOpen(labsKey)}
              aria-expanded={labsOpen}
              className={`flex w-full items-center justify-between gap-2 font-mono text-[15px] font-bold uppercase tracking-[0.08em] transition ${
                labsOpen ? "text-[#5546e0]" : "text-slate-400 hover:text-[#5546e0]"
              }`}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <FlaskConical className="h-3 w-3 shrink-0" aria-hidden />
                <span className="truncate">Home Lab</span>
              </span>
              <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-300 ${labsOpen ? "" : "-rotate-90"}`} />
            </button>
            <div
              className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${
                labsOpen ? "mt-2.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <ul className="ax-list flex flex-col overflow-hidden">
                {labs.map(row)}
              </ul>
            </div>
          </div>
        );
        return (
          <Fragment key={phase.slug}>
          <div>
            {hasDestination ? (
              <Link
                href={`/range/${phase.slug}`}
                onClick={onNavigate}
                className={`flex items-center justify-between gap-2 font-mono text-[15px] font-bold uppercase tracking-[0.08em] transition ${
                  phaseActive ? "text-[#5546e0]" : "text-slate-400 hover:text-[#5546e0]"
                }`}
              >
                {headerContent}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => toggleManualOpen(phase.slug)}
                aria-expanded={phaseOpen}
                className="flex w-full items-center justify-between gap-2 font-mono text-[15px] font-bold uppercase tracking-[0.08em] text-slate-400 transition hover:text-slate-600"
              >
                {headerContent}
              </button>
            )}
            {/* Week lists stay collapsed for every phase you're not
                currently in (or haven't manually opened) -- otherwise the
                sidebar dumps all four phases' weeks on screen at once
                before you've picked one. */}
            <div
              className={`grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(.16,1,.3,1)] ${
                phaseOpen ? "mt-2.5 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <ul className="ax-list flex flex-col overflow-hidden">
                {phase.weeks.map(row)}
              </ul>
            </div>
          </div>
          {labSection}
          </Fragment>
        );
      })}

      <Link
        href="/range/labs"
        onClick={onNavigate}
        className={`flex items-center gap-2 font-mono text-[15px] font-bold uppercase tracking-[0.08em] transition ${
          pathname.startsWith("/range/labs") ? "text-[#5546e0]" : "text-slate-400 hover:text-[#5546e0]"
        }`}
      >
        <FlaskConical className="h-3 w-3 shrink-0" />
        <span className="truncate">Labs — Hands-On</span>
      </Link>

      <Link
        href="/range/reference"
        onClick={onNavigate}
        className={`flex items-center gap-2 font-mono text-[15px] font-bold uppercase tracking-[0.08em] transition ${
          pathname === "/range/reference" ? "text-[#5546e0]" : "text-slate-400 hover:text-[#5546e0]"
        }`}
      >
        <BookMarked className="h-3 w-3 shrink-0" />
        <span className="truncate">Reference — Cheat Sheet</span>
      </Link>
    </nav>
  );
}

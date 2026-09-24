"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookMarked, Check, ChevronDown } from "lucide-react";
import type { PhaseDef } from "@/lib/academy-content";
import { useAcademyProgress } from "./academy-progress";

export function AcademySidebar({ phases, onNavigate }: { phases: PhaseDef[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { isComplete, completedCount, totalCount } = useAcademyProgress();
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  // A phase with no destination page (see hasDestination below) has no
  // route to open it via, so its expanded state has to live here instead
  // -- otherwise there's no way to even preview what's inside it.
  const [manualOpen, setManualOpen] = useState<Set<string>>(new Set());
  const toggleManualOpen = (slug: string) =>
    setManualOpen((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  return (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-5 py-6">
      <div className="ax-sideprog">
        <div className="ax-sideprog__row">
          <span className="rd-kicker">Course progress</span>
          <strong>
            {progressPct}
            <small>%</small>
          </strong>
        </div>
        <span className="ax-segs ax-segs--tight" aria-hidden>
          {Array.from({ length: totalCount }, (_, i) => (
            <i key={i} className={i < completedCount ? "ax-sideprog__on" : "rd-tone-none"} />
          ))}
        </span>
        <p>
          {completedCount} of {totalCount} lessons complete
        </p>
      </div>

      {phases.map((phase) => {
        const entries = [...phase.weeks, ...(phase.homeLab ? [phase.homeLab] : [])];
        // /academy/${phase.slug} redirects straight into a week, so that
        // exact path is never actually the current pathname -- highlight
        // the phase header instead whenever any of its own weeks is active.
        const phaseActive = entries.some((entry) => pathname === `/academy/${phase.slug}/${entry.slug}`);
        // A phase with weeks planned but none published yet (Phase 2) has
        // no real destination -- its route just redirects straight back to
        // wherever you already were. A phase with no week structure at all
        // (Phase 3) still has its own "still being written" page, so that
        // one stays a real link.
        const hasDestination = entries.some((e) => e.sections.length > 0) || phase.weeks.length === 0;
        // A phase you're not currently in still opens if you've toggled it
        // manually -- without this, a phase with nothing published yet
        // (no destination to navigate to and auto-open it) could never be
        // previewed at all.
        const phaseOpen = phaseActive || manualOpen.has(phase.slug);
        const headerContent = (
          <>
            <span className="truncate">{phase.label} — {phase.title}</span>
            <ChevronDown className={`h-3 w-3 shrink-0 transition-transform duration-300 ${phaseOpen ? "" : "-rotate-90"}`} />
          </>
        );
        return (
          <div key={phase.slug}>
            {hasDestination ? (
              <Link
                href={`/academy/${phase.slug}`}
                onClick={onNavigate}
                className={`flex items-center justify-between gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] transition ${
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
                className="flex w-full items-center justify-between gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 transition hover:text-slate-600"
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
              <ul className="flex flex-col gap-0.5 overflow-hidden border-l border-[var(--pvrx-border-light)] pl-3">
                {entries.map((entry) => {
                  const href = `/academy/${phase.slug}/${entry.slug}`;
                  const active = pathname === href;
                  const done = isComplete(phase.slug, entry.slug);
                  const hasContent = entry.sections.length > 0;
                  return (
                    <li key={entry.slug} className="relative">
                      <span aria-hidden className={`ax-sidemark${active ? " ax-sidemark--on" : ""}`} />
                      {hasContent ? (
                        <Link
                          href={href}
                          onClick={onNavigate}
                          className={`ax-sidelink ${active ? "ax-sidelink--on" : ""}`}
                        >
                          <span
                            className={`ax-check ${done ? "ax-check--done" : ""}`}
                          >
                            {done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                          </span>
                          <span className="truncate">{entry.title}</span>
                        </Link>
                      ) : (
                        <span className="ax-soon-row">
                          <span className="ax-check" />
                          <span className="truncate">{entry.title}</span>
                          <em>Soon</em>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}

      <Link
        href="/academy/reference"
        onClick={onNavigate}
        className={`flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.1em] transition ${
          pathname === "/academy/reference" ? "text-[#5546e0]" : "text-slate-400 hover:text-[#5546e0]"
        }`}
      >
        <BookMarked className="h-3 w-3 shrink-0" />
        <span className="truncate">Reference — Cheat Sheet</span>
      </Link>
    </nav>
  );
}

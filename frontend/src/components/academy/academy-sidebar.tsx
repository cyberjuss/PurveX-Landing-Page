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
  const { isComplete, isPhaseComplete, completedCount, totalCount } = useAcademyProgress();
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
        // A phase you're not currently in still opens if you've toggled it
        // manually -- without this, a phase with nothing published yet
        // (no destination to navigate to and auto-open it) could never be
        // previewed at all.
        const phaseOpen = phaseActive || manualOpen.has(phase.slug);
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
              className="flex items-center justify-between gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-slate-400 opacity-70"
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
        const labsOpen =
          labs.some((l) => pathname === `/range/${phase.slug}/${l.slug}`) || manualOpen.has(labsKey);
        const row = (entry: PhaseDef["weeks"][number]) => {
          const href = `/range/${phase.slug}/${entry.slug}`;
          // Each sitting is titled "Home Lab — X". The group heading carries
          // the prefix so the row keeps only the part that differs.
          const label = entry.title.replace(/^Home Lab\s*[—-]\s*/, "");
          const active = pathname === href;
          const done = isComplete(phase.slug, entry.slug);
          return (
            <li key={entry.slug} className="relative">
              <span aria-hidden className={`ax-sidemark${active ? " ax-sidemark--on" : ""}`} />
              {entry.sections.length > 0 ? (
                <Link href={href} onClick={onNavigate} className={`ax-sidelink ${active ? "ax-sidelink--on" : ""}`}>
                  <span className={`ax-check ${done ? "ax-check--done" : ""}`}>
                    {done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                  </span>
                  <span className="truncate">{label}</span>
                </Link>
              ) : (
                <span className="ax-soon-row">
                  <span className="ax-check" />
                  <span className="truncate">{label}</span>
                  <em>Soon</em>
                </span>
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
              className={`flex w-full items-center justify-between gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.1em] transition ${
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
              <ul className="flex flex-col gap-0.5 overflow-hidden border-l border-[var(--pvrx-border-light)] pl-3">
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
                className={`flex items-center justify-between gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.1em] transition ${
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
                className="flex w-full items-center justify-between gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.1em] text-slate-400 transition hover:text-slate-600"
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
        className={`flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.1em] transition ${
          pathname.startsWith("/range/labs") ? "text-[#5546e0]" : "text-slate-400 hover:text-[#5546e0]"
        }`}
      >
        <FlaskConical className="h-3 w-3 shrink-0" />
        <span className="truncate">Labs — Hands-On</span>
      </Link>

      <Link
        href="/range/reference"
        onClick={onNavigate}
        className={`flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[0.1em] transition ${
          pathname === "/range/reference" ? "text-[#5546e0]" : "text-slate-400 hover:text-[#5546e0]"
        }`}
      >
        <BookMarked className="h-3 w-3 shrink-0" />
        <span className="truncate">Reference — Cheat Sheet</span>
      </Link>
    </nav>
  );
}

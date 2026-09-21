"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import type { PhaseDef } from "@/lib/academy-content";
import { useAcademyProgress } from "./academy-progress";

export function AcademySidebar({ phases, onNavigate }: { phases: PhaseDef[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { isComplete, completedCount, totalCount } = useAcademyProgress();
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <nav className="flex h-full flex-col gap-6 overflow-y-auto px-5 py-6">
      <div className="rounded-md border border-[var(--pvrx-border-light)] bg-white p-4 shadow-[0_1px_2px_rgba(16,25,46,0.04)]">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span className="font-mono uppercase tracking-wide">Progress</span>
          <span className="font-mono font-bold text-[#5546e0]">{progressPct}%</span>
        </div>
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-sm bg-slate-100">
          <div className="h-full rounded-sm bg-[#5546e0] transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="mt-1.5 font-mono text-[11px] text-slate-400">{completedCount}/{totalCount} lessons complete</p>
      </div>

      {phases.map((phase) => {
        const entries = [...phase.weeks, ...(phase.homeLab ? [phase.homeLab] : [])];
        const phaseActive = pathname === `/academy/${phase.slug}`;
        return (
          <div key={phase.slug}>
            <Link
              href={`/academy/${phase.slug}`}
              onClick={onNavigate}
              className={`block font-mono text-[11px] font-bold uppercase tracking-[0.1em] transition ${
                phaseActive ? "text-[#5546e0]" : "text-slate-400 hover:text-[#5546e0]"
              }`}
            >
              {phase.label} — {phase.title}
            </Link>
            <ul className="mt-2.5 flex flex-col gap-0.5 border-l border-[var(--pvrx-border-light)] pl-3">
              {entries.map((entry) => {
                const href = `/academy/${phase.slug}/${entry.slug}`;
                const active = pathname === href;
                const done = isComplete(phase.slug, entry.slug);
                const hasContent = entry.sections.length > 0;
                return (
                  <li key={entry.slug} className="relative">
                    {active && (
                      <span
                        aria-hidden
                        className="absolute -left-3 top-1/2 h-4 w-[2px] -translate-y-1/2 bg-[#5546e0]"
                      />
                    )}
                    {hasContent ? (
                      <Link
                        href={href}
                        onClick={onNavigate}
                        className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors duration-150 ${
                          active ? "bg-[rgba(106,92,255,0.1)] font-semibold text-[#5546e0]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors duration-150 ${
                            done ? "border-[#5546e0] bg-[#5546e0] text-white" : "border-slate-300"
                          }`}
                        >
                          {done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                        </span>
                        <span className="truncate">{entry.title}</span>
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-slate-400">
                        <span className="h-4 w-4 shrink-0 rounded-sm border border-slate-200" />
                        <span className="truncate">{entry.title}</span>
                        <span className="ml-auto shrink-0 rounded-sm bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Soon
                        </span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

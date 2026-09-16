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
      <div>
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Your progress</span>
          <span>{completedCount} / {totalCount}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-[#6a5cff] transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {phases.map((phase) => {
        const entries = [...phase.weeks, ...(phase.homeLab ? [phase.homeLab] : [])];
        return (
          <div key={phase.slug}>
            <Link
              href={`/academy/${phase.slug}`}
              onClick={onNavigate}
              className={`block text-[11px] font-bold uppercase tracking-[0.1em] transition ${
                pathname === `/academy/${phase.slug}` ? "text-[#5546e0]" : "text-slate-400 hover:text-[#5546e0]"
              }`}
            >
              {phase.label} — {phase.title}
            </Link>
            <ul className="mt-2 flex flex-col gap-0.5">
              {entries.map((entry) => {
                const href = `/academy/${phase.slug}/${entry.slug}`;
                const active = pathname === href;
                const done = isComplete(phase.slug, entry.slug);
                const hasContent = entry.sections.length > 0;
                return (
                  <li key={entry.slug}>
                    {hasContent ? (
                      <Link
                        href={href}
                        onClick={onNavigate}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition ${
                          active ? "bg-[rgba(106,92,255,0.1)] font-semibold text-[#5546e0]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                            done ? "border-[#6a5cff] bg-[#6a5cff] text-white" : "border-slate-300"
                          }`}
                        >
                          {done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                        </span>
                        <span className="truncate">{entry.title}</span>
                      </Link>
                    ) : (
                      <span className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-slate-400">
                        <span className="h-4 w-4 shrink-0 rounded-full border border-slate-200" />
                        <span className="truncate">{entry.title}</span>
                        <span className="ml-auto shrink-0 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
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

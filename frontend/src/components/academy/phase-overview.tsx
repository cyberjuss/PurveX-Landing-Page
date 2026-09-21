import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PhaseDef } from "@/lib/academy-content";

export function PhaseOverview({ phase, tagline }: { phase: PhaseDef; tagline: string }) {
  const entries = [...phase.weeks, ...(phase.homeLab ? [phase.homeLab] : [])];

  return (
    <div>
      <Link href="/academy" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> All phases
      </Link>

      <p className="mt-5 font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#5546e0]">{phase.label}</p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {phase.title}
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">{tagline}</p>

      <div className="mt-8 flex flex-col gap-3">
        {entries.map((entry) => {
          const hasContent = entry.sections.length > 0;
          const card = (
            <>
              <span className="flex-1">
                <span className="block font-display text-base font-semibold text-slate-900">{entry.title}</span>
                <span className="mt-1 block text-sm text-slate-500">{entry.summary}</span>
              </span>
              {hasContent ? (
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#5546e0]" />
              ) : (
                <span className="mt-1 shrink-0 rounded-sm bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Coming soon
                </span>
              )}
            </>
          );
          return hasContent ? (
            <Link
              key={entry.slug}
              href={`/academy/${phase.slug}/${entry.slug}`}
              className="group flex items-start gap-4 rounded-md border border-[var(--pvrx-border-light)] bg-white p-5 shadow-[0_1px_2px_rgba(16,25,46,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_48px_-30px_rgba(15,23,42,0.25)]"
            >
              {card}
            </Link>
          ) : (
            <div key={entry.slug} className="flex items-start gap-4 rounded-md border border-[var(--pvrx-border-light)] bg-slate-50/60 p-5 opacity-70">
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { phase1Weeks, phase1HomeLab } from "@/lib/academy-content";

export default function Phase1Page() {
  return (
    <div>
      <Link href="/academy" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> All phases
      </Link>

      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5546e0]">Phase 1</p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Fundamentals
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
        The groundwork every analyst needs before touching a real alert queue.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {phase1Weeks.map((week) => {
          const hasContent = week.sections.length > 0;
          const card = (
            <>
              <span className="flex-1">
                <span className="block font-display text-base font-semibold text-slate-900">{week.title}</span>
                <span className="mt-1 block text-sm text-slate-500">{week.summary}</span>
              </span>
              {hasContent ? (
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#5546e0]" />
              ) : (
                <span className="mt-1 shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Coming soon
                </span>
              )}
            </>
          );
          return hasContent ? (
            <Link
              key={week.slug}
              href={`/academy/phase-1/${week.slug}`}
              className="group flex items-start gap-4 rounded-2xl border border-[var(--pvrx-border-light)] bg-white p-5 transition hover:border-slate-300 hover:shadow-[0_18px_48px_-30px_rgba(15,23,42,0.25)]"
            >
              {card}
            </Link>
          ) : (
            <div key={week.slug} className="flex items-start gap-4 rounded-2xl border border-[var(--pvrx-border-light)] bg-slate-50/60 p-5 opacity-70">
              {card}
            </div>
          );
        })}

        <Link
          href={`/academy/phase-1/${phase1HomeLab.slug}`}
          className="group flex items-start gap-4 rounded-2xl border border-[var(--pvrx-border-light)] bg-white p-5 transition hover:border-slate-300 hover:shadow-[0_18px_48px_-30px_rgba(15,23,42,0.25)]"
        >
          <span className="flex-1">
            <span className="block font-display text-base font-semibold text-slate-900">{phase1HomeLab.title}</span>
            <span className="mt-1 block text-sm text-slate-500">{phase1HomeLab.summary}</span>
          </span>
          <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#5546e0]" />
        </Link>
      </div>
    </div>
  );
}

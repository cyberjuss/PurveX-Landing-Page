import Link from "next/link";
import { ArrowLeft, Siren } from "lucide-react";

export default function Phase3Page() {
  return (
    <div>
      <Link href="/academy" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> All phases
      </Link>

      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#5546e0]">Phase 3</p>
      <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Incident Response
      </h1>

      <div className="mt-8 flex items-start gap-4 rounded-2xl border border-[var(--pvrx-border-light)] bg-slate-50/60 p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(106,92,255,0.1)] text-[#5546e0]">
          <Siren className="h-5 w-5" />
        </span>
        <p className="text-sm leading-6 text-slate-500">
          This phase's material is still being written. It'll land here as soon as it's ready.
          No need to check anywhere else.
        </p>
      </div>
    </div>
  );
}

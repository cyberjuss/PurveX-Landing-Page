"use client";

import { Check } from "lucide-react";
import { useAcademyProgress } from "./academy-progress";

export function MarkCompleteButton({ phaseSlug, entrySlug }: { phaseSlug: string; entrySlug: string }) {
  const { isComplete, toggleComplete } = useAcademyProgress();
  const done = isComplete(phaseSlug, entrySlug);

  return (
    <button
      type="button"
      onClick={() => toggleComplete(phaseSlug, entrySlug)}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
        done
          ? "border-[#6a5cff] bg-[rgba(106,92,255,0.1)] text-[#5546e0]"
          : "border-[var(--pvrx-border-light)] text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${done ? "border-[#6a5cff] bg-[#6a5cff] text-white" : "border-slate-300"}`}>
        {done && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      </span>
      {done ? "Marked complete" : "Mark as complete"}
    </button>
  );
}

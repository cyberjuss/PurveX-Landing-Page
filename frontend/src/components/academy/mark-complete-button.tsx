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
      className={`ax-complete ${done ? "ax-complete--done" : ""}`}
      title={done ? "Click to mark as not complete" : undefined}
    >
      <span className="ax-complete__box">{done && <Check className="h-3 w-3" strokeWidth={3} />}</span>
      {done ? "Complete" : "Mark as complete"}
    </button>
  );
}

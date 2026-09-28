"use client";

import { Check } from "lucide-react";
import { useAcademyProgress } from "./academy-progress";

// A week with a quiz, labs or challenges completes itself once they are all
// done, so it shows progress instead of a button. A week with none of them
// keeps the manual toggle.
export function MarkCompleteButton({ phaseSlug, entrySlug }: { phaseSlug: string; entrySlug: string }) {
  const { isComplete, requirements, toggleComplete } = useAcademyProgress();
  const done = isComplete(phaseSlug, entrySlug);
  const reqs = requirements(phaseSlug, entrySlug);

  if (reqs.length > 0) {
    const finished = reqs.filter((r) => r.done).length;
    const left = reqs.filter((r) => !r.done).map((r) => r.label);
    const hint = done ? "Complete" : `Still to do: ${left.join(", ")}`;
    return (
      <span className={`ax-complete ax-complete--auto ${done ? "ax-complete--done" : ""}`} title={hint} aria-label={hint}>
        <span className="ax-complete__box">{done && <Check className="h-3 w-3" strokeWidth={3} />}</span>
        {done ? "Complete" : `${finished} of ${reqs.length} done`}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleComplete(phaseSlug, entrySlug)}
      className={`ax-complete ${done ? "ax-complete--done" : ""}`}
      title={done ? "Click to mark as not complete" : undefined}
    >
      <span className="ax-complete__box">{done && <Check className="h-3 w-3" strokeWidth={3} />}</span>
      {done ? "Complete" : "Mark complete"}
    </button>
  );
}

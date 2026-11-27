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
    // Says what is counted, so ticked section tabs above never read as the week being done.
    const challenges = reqs.filter((r) => r.label !== "Quiz").length;
    const parts = [challenges ? (challenges === 1 ? "Challenge" : "Challenges") : "", reqs.some((r) => r.label === "Quiz") ? "quiz" : ""].filter(Boolean);
    const what = parts.join(" and ").replace(/^quiz/, "Quiz");
    return (
      <span className={`ax-complete ax-complete--auto ${done ? "ax-complete--done" : ""}`} title={hint} aria-label={hint}>
        <span className="ax-complete__box">{done && <Check className="h-3 w-3" strokeWidth={3} />}</span>
        {done ? "Complete" : `${what} ${finished} of ${reqs.length}`}
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

"use client";

import { Check } from "lucide-react";
import { findQuiz } from "@/content/academy/quizzes";
import { useAcademyProgress } from "./academy-progress";

export function MarkCompleteButton({ phaseSlug, entrySlug }: { phaseSlug: string; entrySlug: string }) {
  const { isComplete, hasPassedQuiz, toggleComplete } = useAcademyProgress();
  const done = isComplete(phaseSlug, entrySlug);
  const hasQuiz = Boolean(findQuiz(phaseSlug, entrySlug));
  const passed = hasPassedQuiz(phaseSlug, entrySlug);
  const locked = hasQuiz && !passed && !done;

  return (
    <button
      type="button"
      onClick={() => toggleComplete(phaseSlug, entrySlug)}
      disabled={locked}
      className={`ax-complete ${done ? "ax-complete--done" : ""} ${locked ? "ax-complete--locked" : ""}`}
      title={
        locked
          ? "Pass the quiz with 70% or better to mark this complete"
          : done
            ? "Click to mark as not complete"
            : undefined
      }
    >
      <span className="ax-complete__box">{done && <Check className="h-3 w-3" strokeWidth={3} />}</span>
      {done ? "Complete" : locked ? "Pass the quiz to complete" : "Mark as complete"}
    </button>
  );
}

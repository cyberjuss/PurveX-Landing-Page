"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { QUIZ_PASS_PERCENT, quizPassed, type Quiz } from "@/content/academy/quizzes";
import { useAcademyProgress } from "./academy-progress";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

type Beyond = { label: string; go: () => void };

export function QuizBlock({
  quiz,
  actionHost,
  prevBeyond,
  nextBeyond,
}: {
  quiz: Quiz;
  actionHost?: HTMLElement | null;
  prevBeyond?: Beyond | null;
  nextBeyond?: Beyond | null;
}) {
  const { recordQuizPass } = useAcademyProgress();
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [at, setAt] = useState(0);

  const total = quiz.questions.length;
  const q = quiz.questions[at];
  const selected = answers[at];
  const isLast = at === total - 1;
  const allAnswered = answers.every((a) => a !== null);
  const score = submitted ? answers.filter((a, i) => a === quiz.questions[i].correctIndex).length : 0;
  const passed = quizPassed(score, total);
  const passMark = Math.ceil((QUIZ_PASS_PERCENT / 100) * total);
  const isCorrect = selected === q.correctIndex;
  const foot = submitted ? (passed ? "Passed." : `Need ${passMark} of ${total} to pass.`) : "";

  function submit() {
    setSubmitted(true);
    const correct = answers.filter((a, i) => a === quiz.questions[i].correctIndex).length;
    if (quizPassed(correct, total)) recordQuizPass(quiz.phaseSlug, quiz.weekSlug);
  }

  function selectOption(optionIndex: number) {
    if (submitted) return;
    setAnswers((prev) => prev.map((a, i) => (i === at ? optionIndex : a)));
  }

  function reset() {
    setAnswers(quiz.questions.map(() => null));
    setSubmitted(false);
    setAt(0);
  }

  const action = submitted ? (
    <button type="button" onClick={reset} className="rd-link">
      Try again
    </button>
  ) : isLast ? (
    <button type="button" onClick={submit} disabled={!allAnswered} className="rd-cta">
      Check answers
    </button>
  ) : (
    <span className="ax-panel__count">
      {String(at + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </span>
  );

  const trail = (
    <>
      <button
        type="button"
        onClick={() => (at > 0 ? setAt(at - 1) : prevBeyond?.go())}
        disabled={at === 0 && !prevBeyond}
        aria-label="Previous"
        className="ax-step"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden sm:inline">{at === 0 && prevBeyond ? prevBeyond.label : "Previous"}</span>
      </button>
      {action}
      <button
        type="button"
        onClick={() => (isLast ? nextBeyond?.go() : setAt(at + 1))}
        disabled={(!isLast && !submitted && selected === null) || (isLast && !nextBeyond)}
        aria-label="Next"
        className="ax-step ax-step--next"
      >
        <span className="hidden sm:inline">{isLast && nextBeyond ? nextBeyond.label : "Next"}</span>
        <ChevronRight className="h-4 w-4" />
      </button>
    </>
  );

  return (
    <div className="ax-quiz">
      <div className="ax-quiz__head">
        <p className="rd-kicker">Knowledge check</p>
        <p className="font-mono text-xs font-semibold text-[var(--rd-ink-3)]">
          {submitted ? `${score}/${total}` : `${String(at + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}
        </p>
      </div>

      <div className="overflow-hidden">
      <div key={at} className="ax-quiz__q ax-enter">
        <div className="ax-quiz__qhead">
          <span className="ax-quiz__n">{String(at + 1).padStart(2, "0")}</span>
          <p>{q.question}</p>
        </div>
        <div className="ax-quiz__opts">
          {q.options.map((option, oi) => {
            const isSelected = selected === oi;
            const showCorrect = submitted && oi === q.correctIndex;
            const showWrong = submitted && isSelected && oi !== q.correctIndex;
            return (
              <button
                key={oi}
                type="button"
                onClick={() => selectOption(oi)}
                disabled={submitted}
                className={`ax-quiz__opt ${
                  showCorrect ? "ax-quiz__opt--ok" : showWrong ? "ax-quiz__opt--bad" : isSelected ? "ax-quiz__opt--on" : ""
                }`}
              >
                <span className="ax-quiz__letter">{LETTERS[oi]}</span>
                <span>{option}</span>
              </button>
            );
          })}
        </div>
        {submitted && (
          <div className="ax-quiz__note">
            <strong className={isCorrect ? "rd-text-good" : ""}>{isCorrect ? "Correct" : "Explanation"}</strong>
            {q.explanation}
          </div>
        )}
      </div>
      </div>

      {foot && <p className="ax-quiz__mark">{foot}</p>}
      {actionHost ? createPortal(trail, actionHost) : <div className="ax-panel__foot">{trail}</div>}
    </div>
  );
}

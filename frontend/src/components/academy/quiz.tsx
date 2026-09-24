"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { QUIZ_PASS_PERCENT, quizPassed, type Quiz } from "@/content/academy/quizzes";
import { useAcademyProgress } from "./academy-progress";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuizBlock({ quiz, actionHost }: { quiz: Quiz; actionHost?: HTMLElement | null }) {
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

  const next = !isLast ? (
    <button type="button" className="ad-pager__btn ad-pager__btn--next" disabled={!submitted && selected === null} onClick={() => setAt(at + 1)}>
      Next <ArrowRight className="h-4 w-4" />
    </button>
  ) : null;

  const action = submitted ? (
    <button type="button" onClick={reset} className="rd-link">
      Try again
    </button>
  ) : isLast ? (
    <button type="button" onClick={submit} disabled={!allAnswered} className="rd-cta">
      Check answers
    </button>
  ) : null;

  return (
    <div className="ax-quiz">
      <div className="ax-quiz__head">
        <p className="rd-kicker">Knowledge check</p>
        <p className="font-mono text-xs font-semibold text-[var(--rd-ink-3)]">
          {submitted ? `${score}/${total}` : `${String(at + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`}
        </p>
      </div>

      <div className="ax-quiz__q">
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

      <div className="ax-quiz__foot">
        {at > 0 ? (
          <button type="button" className="ad-pager__btn" onClick={() => setAt(at - 1)}>
            <ArrowLeft className="h-4 w-4" /> Previous
          </button>
        ) : (
          <span />
        )}
        <p>{foot}</p>
        {action && actionHost ? createPortal(action, actionHost) : action}
        {next}
      </div>
    </div>
  );
}

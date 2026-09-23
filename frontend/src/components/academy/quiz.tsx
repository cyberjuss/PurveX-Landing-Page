"use client";

import { useState } from "react";
import { QUIZ_PASS_PERCENT, quizPassed, type Quiz } from "@/content/academy/quizzes";
import { useAcademyProgress } from "./academy-progress";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuizBlock({ quiz }: { quiz: Quiz }) {
  const { recordQuizPass } = useAcademyProgress();
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const total = quiz.questions.length;
  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === total;
  const score = submitted ? answers.filter((a, i) => a === quiz.questions[i].correctIndex).length : 0;
  const passed = quizPassed(score, total);
  const passMark = Math.ceil((QUIZ_PASS_PERCENT / 100) * total);
  const foot = submitted ? (passed ? "Passed." : `Need ${passMark} of ${total} to pass.`) : "";

  function submit() {
    setSubmitted(true);
    const correct = answers.filter((a, i) => a === quiz.questions[i].correctIndex).length;
    if (quizPassed(correct, total)) recordQuizPass(quiz.phaseSlug, quiz.weekSlug);
  }

  function selectOption(questionIndex: number, optionIndex: number) {
    if (submitted) return;
    setAnswers((prev) => prev.map((a, i) => (i === questionIndex ? optionIndex : a)));
  }

  function reset() {
    setAnswers(quiz.questions.map(() => null));
    setSubmitted(false);
  }

  return (
    <div className="ax-quiz">
      <div className="ax-quiz__head">
        <p className="rd-kicker">Knowledge check</p>
        <p className="font-mono text-xs font-semibold text-[var(--rd-ink-3)]">
          {submitted ? `${score}/${total}` : `${answeredCount}/${total}`}
        </p>
      </div>

      {quiz.questions.map((q, qi) => {
        const selected = answers[qi];
        const isCorrect = selected === q.correctIndex;
        return (
          <div key={qi} className="ax-quiz__q">
            <div className="ax-quiz__qhead">
              <span className="ax-quiz__n">{String(qi + 1).padStart(2, "0")}</span>
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
                    onClick={() => selectOption(qi, oi)}
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
        );
      })}

      <div className="ax-quiz__foot">
        <p>{foot}</p>
        {submitted ? (
          <button type="button" onClick={reset} className="rd-link">
            Try again
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={!allAnswered} className="rd-cta">
            Check answers
          </button>
        )}
      </div>
    </div>
  );
}

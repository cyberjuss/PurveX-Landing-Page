"use client";

import { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import type { Quiz } from "@/content/academy/quizzes";

export function QuizBlock({ quiz }: { quiz: Quiz }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = answers.every((a) => a !== null);
  const score = submitted ? answers.filter((a, i) => a === quiz.questions[i].correctIndex).length : 0;

  function selectOption(questionIndex: number, optionIndex: number) {
    if (submitted) return;
    setAnswers((prev) => prev.map((a, i) => (i === questionIndex ? optionIndex : a)));
  }

  function reset() {
    setAnswers(quiz.questions.map(() => null));
    setSubmitted(false);
  }

  return (
    <section className="rounded-2xl border border-[var(--pvrx-border-light)] bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-slate-900">Test yourself</h2>
        {submitted && (
          <span className="rounded-full bg-[rgba(106,92,255,0.1)] px-3 py-1 text-sm font-semibold text-[#5546e0]">
            {score} / {quiz.questions.length}
          </span>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-7">
        {quiz.questions.map((q, qi) => {
          const selected = answers[qi];
          const isCorrect = selected === q.correctIndex;
          return (
            <div key={qi}>
              <p className="text-sm font-semibold text-slate-800">
                {qi + 1}. {q.question}
              </p>
              <div className="mt-3 flex flex-col gap-2">
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
                      className={`flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-left text-sm transition disabled:cursor-default ${
                        showCorrect
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : showWrong
                            ? "border-red-300 bg-red-50 text-red-700"
                            : isSelected
                              ? "border-[rgba(106,92,255,0.6)] bg-[rgba(106,92,255,0.06)] text-slate-900"
                              : "border-[var(--pvrx-border-light)] text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {showCorrect ? (
                        <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : showWrong ? (
                        <X className="h-4 w-4 shrink-0 text-red-600" />
                      ) : (
                        <span className="h-4 w-4 shrink-0" />
                      )}
                      {option}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <p className={`mt-2.5 rounded-xl px-4 py-2.5 text-sm leading-6 ${isCorrect ? "bg-emerald-50 text-emerald-800" : "bg-slate-50 text-slate-600"}`}>
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        {submitted ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-2xl border border-[var(--pvrx-border-light)] px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!allAnswered}
            className="rounded-2xl border-0 bg-[#6a5cff] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(106,92,255,0.3)] transition hover:bg-[#5546e0] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            Check my answers
          </button>
        )}
      </div>
    </section>
  );
}

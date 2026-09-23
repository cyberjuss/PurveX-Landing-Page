"use client";

import { useState } from "react";
import { Check, Circle, PartyPopper, RotateCcw, Target, X } from "lucide-react";
import type { Quiz } from "@/content/academy/quizzes";

export function QuizBlock({ quiz }: { quiz: Quiz }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = answers.every((a) => a !== null);
  const score = submitted ? answers.filter((a, i) => a === quiz.questions[i].correctIndex).length : 0;
  const pct = quiz.questions.length === 0 ? 0 : Math.round((score / quiz.questions.length) * 100);

  function selectOption(questionIndex: number, optionIndex: number) {
    if (submitted) return;
    setAnswers((prev) => prev.map((a, i) => (i === questionIndex ? optionIndex : a)));
  }

  function reset() {
    setAnswers(quiz.questions.map(() => null));
    setSubmitted(false);
  }

  return (
    <div className="rounded-lg border border-[var(--pvrx-border-light)] bg-white shadow-[0_1px_2px_rgba(16,25,46,0.04),0_18px_42px_-32px_rgba(16,25,46,0.28)]">
      <div className="border-b border-[var(--pvrx-border-light)] px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#5546e0]">Knowledge Check</p>
            <h3 className="mt-1 font-display text-lg font-semibold text-slate-950">Quiz</h3>
          </div>
          <div className="flex items-center gap-2">
            {quiz.questions.map((_, i) => {
              const answered = answers[i] !== null;
              const correct = submitted && answers[i] === quiz.questions[i].correctIndex;
              const wrong = submitted && answered && !correct;
              return (
                <span
                  key={i}
                  className={`flex h-7 w-7 items-center justify-center rounded-md border font-mono text-[0.68rem] font-bold ${
                    correct
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : wrong
                        ? "border-red-200 bg-red-50 text-red-700"
                        : answered
                          ? "border-[rgba(85,70,224,0.35)] bg-[rgba(85,70,224,0.08)] text-[#5546e0]"
                          : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  {i + 1}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {submitted && (
        <div className="mx-5 mt-5 flex items-center gap-3 rounded-md border border-[var(--pvrx-border-light)] border-l-[3px] border-l-[#5546e0] bg-[var(--pvrx-surface-alt-light)] px-4 py-3 sm:mx-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-[#5546e0] shadow-[0_1px_2px_rgba(16,25,46,0.06)]">
            {pct >= 70 ? <PartyPopper className="h-5 w-5" /> : <Target className="h-5 w-5" />}
          </span>
          <div>
            <p className="font-display text-sm font-semibold text-slate-900">
              <span className="font-mono">{score}/{quiz.questions.length}</span> correct
            </p>
            <p className="text-xs text-slate-500">
              {pct >= 70 ? "Solid grasp of this week's material." : "Worth another pass. The explanations below show the baseline to use."}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 p-5 sm:p-6">
        {quiz.questions.map((q, qi) => {
          const selected = answers[qi];
          const isCorrect = selected === q.correctIndex;
          return (
            <div key={qi} className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-sm font-semibold leading-6 text-slate-900">
                <span className="mr-2 rounded bg-white px-1.5 py-0.5 font-mono text-[0.68rem] font-bold text-slate-500 ring-1 ring-slate-200">
                  Q{String(qi + 1).padStart(2, "0")}
                </span>
                {q.question}
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
                      className={`flex min-h-11 items-center gap-3 rounded-md border bg-white px-3.5 py-2.5 text-left text-sm leading-5 transition-all duration-150 disabled:cursor-default ${
                        showCorrect
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                          : showWrong
                            ? "border-red-300 bg-red-50 text-red-700"
                            : isSelected
                              ? "border-[rgba(106,92,255,0.6)] text-slate-900 shadow-[0_1px_2px_rgba(16,25,46,0.04)]"
                              : "border-[var(--pvrx-border-light)] text-slate-700 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_4px_12px_-4px_rgba(16,25,46,0.12)]"
                      }`}
                    >
                      {showCorrect ? (
                        <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                      ) : showWrong ? (
                        <X className="h-4 w-4 shrink-0 text-red-600" />
                      ) : isSelected ? (
                        <Check className="h-4 w-4 shrink-0 text-[#5546e0]" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0 text-slate-300" />
                      )}
                      {option}
                    </button>
                  );
                })}
              </div>
              {submitted && (
                <div className={`mt-3 rounded-md border px-4 py-3 text-sm leading-6 ${isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600"}`}>
                  <span className="mb-1 block font-mono text-[0.68rem] font-bold uppercase tracking-[0.08em] text-slate-400">Explanation</span>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--pvrx-border-light)] px-5 py-4 sm:px-6">
        <p className="text-xs text-slate-500">
          {submitted ? "Review the explanations, then reset when you want another pass." : `${answers.filter((a) => a !== null).length}/${quiz.questions.length} answered`}
        </p>
        {submitted ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md border border-[var(--pvrx-border-light)] px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!allAnswered}
            className="rounded-md border-0 bg-[#5546e0] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(16,25,46,0.06)] transition hover:bg-[#4636c9] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            Check my answers
          </button>
        )}
      </div>
    </div>
  );
}

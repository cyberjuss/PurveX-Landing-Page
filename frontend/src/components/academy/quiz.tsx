"use client";

import { useState } from "react";
import { Check, PartyPopper, RotateCcw, Target, X } from "lucide-react";
import type { Quiz } from "@/content/academy/quizzes";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuizBlock({ quiz }: { quiz: Quiz }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);

  const total = quiz.questions.length;
  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === total;
  const score = submitted ? answers.filter((a, i) => a === quiz.questions[i].correctIndex).length : 0;
  const pct = total === 0 ? 0 : Math.round((score / total) * 100);
  const passed = pct >= 70;

  function selectOption(questionIndex: number, optionIndex: number) {
    if (submitted) return;
    setAnswers((prev) => prev.map((a, i) => (i === questionIndex ? optionIndex : a)));
  }

  function reset() {
    setAnswers(quiz.questions.map(() => null));
    setSubmitted(false);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--pvrx-border-light)] bg-white shadow-[0_1px_2px_rgba(16,25,46,0.04),0_28px_56px_-34px_rgba(16,25,46,0.3)]">
      <div className="border-b border-[var(--pvrx-border-light)] bg-[var(--pvrx-surface-alt-light)] px-5 py-5 sm:px-7">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#5546e0]">Knowledge Check</p>
            <h3 className="mt-1 font-display text-xl font-semibold text-slate-950">Test what you just learned</h3>
          </div>
          <p className="shrink-0 font-mono text-xs font-semibold text-slate-500">
            {submitted ? `${score}/${total} correct` : `${answeredCount}/${total} answered`}
          </p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200/80">
          <div
            className={`h-full rounded-full transition-all duration-500 ${submitted ? (passed ? "bg-emerald-500" : "bg-amber-500") : "bg-[#5546e0]"}`}
            style={{ width: `${submitted ? pct : total === 0 ? 0 : (answeredCount / total) * 100}%` }}
          />
        </div>
      </div>

      {submitted && (
        <div className="mx-5 mt-6 flex items-center gap-4 rounded-2xl border border-[var(--pvrx-border-light)] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(16,25,46,0.05),0_18px_36px_-26px_rgba(85,70,224,0.35)] sm:mx-7">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-[0_8px_18px_-8px_rgba(16,25,46,0.5)] ${
              passed ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : "bg-gradient-to-br from-amber-400 to-amber-600"
            }`}
          >
            {passed ? <PartyPopper className="h-5 w-5" /> : <Target className="h-5 w-5" />}
          </span>
          <div>
            <p className="font-display text-base font-semibold text-slate-900">
              <span className="font-mono">{score}/{total}</span> correct
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              {passed ? "Solid grasp of this week's material." : "Worth another pass. The explanations below show the baseline to use."}
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 p-5 sm:p-7">
        {quiz.questions.map((q, qi) => {
          const selected = answers[qi];
          const isCorrect = selected === q.correctIndex;
          return (
            <div
              key={qi}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,25,46,0.04),0_14px_30px_-24px_rgba(16,25,46,0.25)] sm:p-6"
            >
              <div className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#6a5cff] to-[#4636c9] font-mono text-sm font-bold text-white shadow-[0_6px_14px_-6px_rgba(85,70,224,0.6)]">
                  {qi + 1}
                </span>
                <p className="pt-1.5 text-[0.97rem] font-semibold leading-7 text-slate-900">{q.question}</p>
              </div>

              <div className="mt-5 flex flex-col gap-3">
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
                      className={`group flex min-h-[3.25rem] items-center gap-4 rounded-xl border px-4 py-3 text-left text-sm leading-6 transition-all duration-150 disabled:cursor-default ${
                        showCorrect
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : showWrong
                            ? "border-red-300 bg-red-50 text-red-800"
                            : isSelected
                              ? "border-[#5546e0] bg-[rgba(85,70,224,0.06)] text-slate-900 shadow-[0_8px_20px_-14px_rgba(85,70,224,0.6)]"
                              : "border-[var(--pvrx-border-light)] bg-white text-slate-700 hover:-translate-y-0.5 hover:border-[rgba(85,70,224,0.4)] hover:shadow-[0_10px_22px_-14px_rgba(16,25,46,0.25)]"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold transition-colors ${
                          showCorrect
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : showWrong
                              ? "border-red-500 bg-red-500 text-white"
                              : isSelected
                                ? "border-[#5546e0] bg-[#5546e0] text-white"
                                : "border-slate-300 bg-slate-50 text-slate-500 group-hover:border-[#5546e0] group-hover:text-[#5546e0]"
                        }`}
                      >
                        {showCorrect ? <Check className="h-4 w-4" /> : showWrong ? <X className="h-4 w-4" /> : LETTERS[oi]}
                      </span>
                      <span className="flex-1">{option}</span>
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div
                  className={`mt-5 rounded-xl border px-5 py-4 text-sm leading-6 ${
                    isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  <span className="mb-1.5 block font-mono text-[0.68rem] font-bold uppercase tracking-[0.08em] text-slate-400">
                    {isCorrect ? "Correct" : "Explanation"}
                  </span>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--pvrx-border-light)] bg-[var(--pvrx-surface-alt-light)] px-5 py-4 sm:px-7">
        <p className="text-xs text-slate-500">
          {submitted ? "Review the explanations, then reset when you want another pass." : "Answer every question to check your work."}
        </p>
        {submitted ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--pvrx-border-light)] bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-[0_1px_2px_rgba(16,25,46,0.05)] transition hover:border-slate-300 hover:shadow-[0_8px_18px_-12px_rgba(16,25,46,0.3)]"
          >
            <RotateCcw className="h-4 w-4" /> Try again
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSubmitted(true)}
            disabled={!allAnswered}
            className="rounded-full border-0 bg-[#5546e0] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_22px_-10px_rgba(85,70,224,0.7)] transition hover:bg-[#4636c9] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
          >
            Check my answers
          </button>
        )}
      </div>
    </div>
  );
}

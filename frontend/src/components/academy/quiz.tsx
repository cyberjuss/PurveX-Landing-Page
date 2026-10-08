"use client";

import Link from "next/link";
import { useState } from "react";
import { createPortal } from "react-dom";
import { QUIZ_PASS_PERCENT, quizPassed, type Quiz } from "@/content/academy/quizzes";
import { confetti } from "@/lib/confetti";
import { useAcademyProgress } from "./academy-progress";
import { TrailDock, type TrailLink } from "./trail-dock";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuizBlock({
  quiz,
  actionHost,
  prevBeyond,
  nextBeyond,
  weekLabs,
}: {
  quiz: Quiz;
  actionHost?: HTMLElement | null;
  prevBeyond?: TrailLink | null;
  nextBeyond?: TrailLink | null;
  /** This week's labs. Pages of their own, so the hand-off is a link out. */
  weekLabs?: { slug: string; title: string }[];
}) {
  const { recordQuizPass, requirements } = useAcademyProgress();
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.questions.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [at, setAt] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const total = quiz.questions.length;
  const q = quiz.questions[at];
  const selected = answers[at];
  const isLast = at === total - 1;
  const allAnswered = answers.every((a) => a !== null);
  const score = submitted ? answers.filter((a, i) => a === quiz.questions[i].correctIndex).length : 0;
  const passed = quizPassed(score, total);
  const passMark = Math.ceil((QUIZ_PASS_PERCENT / 100) * total);
  const isCorrect = selected === q.correctIndex;

  // What the week still wants after the quiz. The week marks itself complete
  // once every one of these is done, so passing the quiz is the middle of the
  // week rather than the end of it, and the pass screen is the one place a
  // student is certain to be looking when that needs saying.
  const left = submitted && passed
    ? requirements(quiz.phaseSlug, quiz.weekSlug).filter((r) => r.label !== "Quiz" && !r.done)
    : [];
  const plain = (label: string) => label.replace(/^(Lab|Challenge|Troubleshooting):\s*/, "");
  // The first lab they have not finished, matched by title because that is what
  // the requirement list carries. Falls back to the week's first lab, so a
  // student who somehow has no match is still handed somewhere real.
  const undone = new Set(left.map((r) => plain(r.label)));
  const nextLab = (weekLabs ?? []).find((l) => undone.has(l.title)) ?? (weekLabs ?? [])[0] ?? null;

  function submit() {
    setSubmitted(true);
    const correct = answers.filter((a, i) => a === quiz.questions[i].correctIndex).length;
    if (quizPassed(correct, total)) {
      recordQuizPass(quiz.phaseSlug, quiz.weekSlug);
      confetti();
    }
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
    <TrailDock
      wide
      back={prevBeyond}
      prev={{ go: () => { setDir(-1); setAt(at - 1); }, disabled: at === 0 }}
      next={{ go: () => { setDir(1); setAt(at + 1); }, disabled: isLast || (!submitted && selected === null) }}
      forward={nextBeyond}
      center={action}
    />
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
      <div key={at} className={`ax-quiz__q ${dir === 1 ? "ax-enter-fwd" : "ax-enter-back"}`}>
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

      {submitted && !passed && <p className="ax-quiz__mark">Need {passMark} of {total} to pass.</p>}
      {submitted && passed && (
        <div className="ax-quiz__after">
          <p className="ax-quiz__mark">Passed.</p>
          {left.length > 0 ? (
            <>
              <p className="ax-quiz__left">
                {left.length === 1 ? "One more to finish the week." : `${left.length} more to finish the week.`}
              </p>
              {nextLab ? (
                <Link href={`/range/labs/${nextLab.slug}`} className="ax-quiz__go">
                  {nextLab.title}
                </Link>
              ) : (
                nextBeyond && (
                  <button type="button" className="ax-quiz__go" onClick={nextBeyond.go}>
                    {plain(nextBeyond.label)}
                  </button>
                )
              )}
            </>
          ) : (
            <p className="ax-quiz__left">That finishes the week.</p>
          )}
        </div>
      )}
      {actionHost ? createPortal(trail, actionHost) : <div className="ax-panel__foot">{trail}</div>}
    </div>
  );
}

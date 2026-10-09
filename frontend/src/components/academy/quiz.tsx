"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { QUIZ_PASS_PERCENT, quizPassed, type Quiz } from "@/content/academy/quizzes";
import { confetti } from "@/lib/confetti";
import { getSaved, subscribeSaved, updateSaved } from "@/lib/academy-saved-client";
import { useAcademyProgress } from "./academy-progress";
import { TrailDock, type TrailLink } from "./trail-dock";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuizBlock({
  quiz,
  actionHost,
  nextBeyond,
  weekLabs,
}: {
  quiz: Quiz;
  actionHost?: HTMLElement | null;
  /** Where the week goes next, offered on the pass screen once nothing is left. */
  nextBeyond?: TrailLink | null;
  /** This week's labs. Pages of their own, so the hand-off is a link out. */
  weekLabs?: { slug: string; title: string }[];
}) {
  const { recordQuizPass, requirements } = useAcademyProgress();
  // Picks are saved to the account as they are made, so leaving mid-quiz and
  // coming back, here or on another device, picks up where the student was.
  // A saved quiz whose question count no longer matches is ignored.
  const quizKey = `${quiz.phaseSlug}:${quiz.weekSlug}`;
  const savedQuiz = () => {
    const s = getSaved().quizzes[quizKey];
    return s && s.answers.length === quiz.questions.length ? s : null;
  };
  const [answers, setAnswers] = useState<(number | null)[]>(() => savedQuiz()?.answers ?? quiz.questions.map(() => null));
  const [submitted, setSubmitted] = useState(() => savedQuiz()?.submitted ?? false);
  const [at, setAt] = useState(() => savedQuiz()?.at ?? 0);
  // Set once the student does anything here. From then on this screen is the newer copy.
  const touched = useRef(false);
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

  // The account's copy can arrive after the quiz is on screen. Use it, unless the student has started.
  useEffect(
    () =>
      subscribeSaved(() => {
        const s = savedQuiz();
        if (touched.current || !s) return;
        setAnswers(s.answers);
        setSubmitted(s.submitted);
        setAt(s.at);
      }),
    // savedQuiz reads only quizKey and the question count.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quizKey, quiz.questions.length]
  );

  useEffect(() => {
    if (!touched.current) return;
    const empty = !submitted && answers.every((a) => a === null);
    updateSaved({ quizzes: { [quizKey]: empty ? null : { answers, submitted, at } } });
  }, [answers, submitted, at, quizKey]);

  function go(next: number) {
    touched.current = true;
    setDir(next > at ? 1 : -1);
    setAt(next);
  }

  function submit() {
    touched.current = true;
    setSubmitted(true);
    const correct = answers.filter((a, i) => a === quiz.questions[i].correctIndex).length;
    if (quizPassed(correct, total)) {
      recordQuizPass(quiz.phaseSlug, quiz.weekSlug);
      confetti();
    }
  }

  function selectOption(optionIndex: number) {
    if (submitted) return;
    touched.current = true;
    setAnswers((prev) => prev.map((a, i) => (i === at ? optionIndex : a)));
  }

  function reset() {
    touched.current = true;
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

  // Previous and Next move through the questions and nothing else. The wide
  // dock also carried "To Resources" and "To <the next thing>", so four
  // controls competed for one row and the two that matter while answering a
  // question were the two in the middle. Where to go afterwards is the pass
  // screen's job, and it only has to be said once.
  const trail = (
    <TrailDock
      prev={{ go: () => go(at - 1), disabled: at === 0 }}
      next={{ go: () => go(at + 1), disabled: isLast || (!submitted && selected === null) }}
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
            <>
              <p className="ax-quiz__left">That finishes the week.</p>
              {nextBeyond && (
                <button type="button" className="ax-quiz__go" onClick={nextBeyond.go}>
                  {plain(nextBeyond.label)}
                </button>
              )}
            </>
          )}
        </div>
      )}
      {actionHost ? createPortal(trail, actionHost) : <div className="ax-panel__foot">{trail}</div>}
    </div>
  );
}

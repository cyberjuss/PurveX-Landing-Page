"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { marked } from "marked";
import { Brain, Check, RotateCcw, X } from "lucide-react";
import { deckStats, dueNow, gapDays, grade, loadDeck, REVIEW_EVENT, type Concept } from "@/lib/concept-review";
import { confettiFrom } from "@/lib/confetti";
import "./review-card.css";

type Stats = ReturnType<typeof deckStats>;

function inDays(at: number | null) {
  if (at === null) return null;
  const days = Math.max(1, Math.round((at - Date.now()) / (24 * 60 * 60 * 1000)));
  return days === 1 ? "tomorrow" : `in ${days} days`;
}

// The home page's review card. Concepts a student turned over on a recap come
// back here when they are due, so there is always a short, specific reason to
// return: a handful of ideas to recall before they fade. Hidden until the
// student has collected anything.
export function ReviewCard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const read = () => setStats(deckStats());
    // Storage is only readable in the browser, so the card fills in after the first paint.
    read();
    window.addEventListener(REVIEW_EVENT, read);
    window.addEventListener("focus", read);
    return () => {
      window.removeEventListener(REVIEW_EVENT, read);
      window.removeEventListener("focus", read);
    };
  }, []);

  if (!stats || stats.total === 0) return null;
  const pct = Math.round((stats.strong / stats.total) * 100);

  return (
    <>
      <button
        type="button"
        className={`rv-card${stats.due ? " is-due" : ""}`}
        onClick={() => stats.due && setOpen(true)}
        disabled={!stats.due}
      >
        <span className="rv-card__ring" style={{ ["--pct" as string]: pct }} aria-hidden>
          <Brain />
        </span>
        <span className="rv-card__main">
          <span className="rd-kicker">Daily review</span>
          <strong>
            {stats.due ? (
              <>
                <b key={stats.due} className="rv-card__num">
                  {stats.due}
                </b>{" "}
                {stats.due === 1 ? "concept is" : "concepts are"} ready to recall
              </>
            ) : (
              "All caught up"
            )}
          </strong>
          <span className="rv-card__sub">
            {stats.due
              ? "Two minutes now keeps them from fading."
              : `Next review ${inDays(stats.next) ?? "soon"}.`}{" "}
            {stats.strong} of {stats.total} known well.
          </span>
        </span>
        {stats.due > 0 && <span className="rv-card__go">Start</span>}
      </button>
      {open && createPortal(<ReviewSession onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

// One concept at a time: recall it, turn it over, say honestly whether you
// knew it. Known ones go further out; missed ones come back tomorrow.
function ReviewSession({ onClose }: { onClose: () => void }) {
  const [queue] = useState<Concept[]>(() => dueNow().slice(0, 12));
  const [at, setAt] = useState(0);
  const [shown, setShown] = useState(false);
  const [known, setKnown] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const done = at >= queue.length;
  const card = queue[at];

  const answer = useCallback(
    (knew: boolean) => {
      if (!card) return;
      grade(card.term, knew);
      if (knew) setKnown((k) => k + 1);
      setShown(false);
      setAt((i) => i + 1);
    },
    [card]
  );

  useEffect(() => {
    if (done && known > 0) window.setTimeout(() => confettiFrom(panelRef.current, 70), 200);
  }, [done, known]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (!done && !shown && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setShown(true);
      } else if (!done && shown && (e.key === "1" || e.key === "ArrowLeft")) answer(false);
      else if (!done && shown && (e.key === "2" || e.key === "ArrowRight")) answer(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, shown, answer, onClose]);

  const box = card ? loadDeck()[card.term.toLowerCase()]?.box ?? 0 : 0;

  return (
    <div className="rv-modal" role="dialog" aria-modal="true" aria-label="Daily review">
      <div className="rv-scrim" onClick={onClose} />
      <div className="rv-panel" ref={panelRef}>
        <div className="rv-head">
          <span className="rd-kicker">Daily review</span>
          <div className="rv-pips" aria-hidden>
            {queue.map((_, i) => (
              <i key={i} className={i < at ? "is-done" : i === at ? "is-here" : undefined} />
            ))}
          </div>
          <button type="button" className="rv-x" onClick={onClose} aria-label="Close review">
            <X />
          </button>
        </div>

        {done ? (
          <div className="rv-done">
            <span className="rv-done__ring" aria-hidden>
              <Check />
            </span>
            <strong>
              {known} of {queue.length} recalled
            </strong>
            <p>
              {known === queue.length
                ? "Every one. They move further out, so the next review is spaced wider."
                : "The ones you missed come back tomorrow. That is how they stick."}
            </p>
            <button type="button" className="rd-cta" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <div key={at} className="rv-stage">
            <button
              type="button"
              className={`rv-flip${shown ? " is-open" : ""}`}
              onClick={() => setShown(true)}
              aria-label={shown ? card.sentence : `${card.term}. Recall what it means, then turn the card.`}
            >
              <span className="rv-face rv-front">
                <span className="rv-from">{card.where}</span>
                <strong>{card.term}</strong>
                <span className="rv-hint">What does this mean? Tap or press Space to check.</span>
              </span>
              <span className="rv-face rv-back">
                <strong>{card.term}</strong>
                <span dangerouslySetInnerHTML={{ __html: marked.parseInline(card.sentence, { async: false }) as string }} />
              </span>
            </button>
            <div className={`rv-answer${shown ? " is-on" : ""}`}>
              <button type="button" className="rv-btn rv-btn--miss" onClick={() => answer(false)} disabled={!shown}>
                <RotateCcw aria-hidden /> Not yet <kbd>1</kbd>
              </button>
              <button type="button" className="rv-btn rv-btn--knew" onClick={() => answer(true)} disabled={!shown}>
                <Check aria-hidden /> Knew it <kbd>2</kbd>
                <em>next in {gapDays(box + 1)} days</em>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

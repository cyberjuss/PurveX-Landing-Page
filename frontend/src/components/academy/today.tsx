"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Brain } from "lucide-react";
import { deckStats, REVIEW_EVENT } from "@/lib/concept-review";
import { ReviewSession } from "./review-card";
import "./today.css";

type Stats = ReturnType<typeof deckStats>;

function inDays(at: number | null) {
  if (at === null) return null;
  const days = Math.max(1, Math.round((at - Date.now()) / 86_400_000));
  return days === 1 ? "tomorrow" : `in ${days} days`;
}

// The home page's daily review card: how many collected concepts are due, and
// a two-minute session to recall them. It changes from one visit to the next.
export function Today() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    const read = () => setStats(deckStats());
    read();
    window.addEventListener(REVIEW_EVENT, read);
    window.addEventListener("focus", read);
    return () => {
      window.removeEventListener(REVIEW_EVENT, read);
      window.removeEventListener("focus", read);
    };
  }, []);

  return (
    <section className="td" aria-label="Today">
      <button
        type="button"
        className={`td-card td-card--review${stats?.due ? " is-due" : ""}`}
        onClick={() => stats?.due && setReviewing(true)}
        disabled={!stats?.due}
      >
        <span className="td-icon" aria-hidden>
          <Brain />
        </span>
        <span className="td-card__main">
          <span className="rd-kicker">Daily review</span>
          <strong>
            {!stats || stats.total === 0 ? (
              "Your deck starts on a recap"
            ) : stats.due ? (
              <>
                <b className="td-num">{stats.due}</b> to recall today
              </>
            ) : (
              "All caught up"
            )}
          </strong>
          <span className="td-card__sub">
            {!stats || stats.total === 0
              ? "Flip the cards at the end of a section to collect them"
              : stats.due
                ? "Two minutes keeps them from fading"
                : `Next review ${inDays(stats.next) ?? "soon"}`}
          </span>
        </span>
        {Boolean(stats?.due) && <span className="td-go td-go--small">Start</span>}
      </button>

      {reviewing && createPortal(<ReviewSession onClose={() => setReviewing(false)} />, document.body)}
    </section>
  );
}

/** Morning, afternoon or evening, by the reader's own clock. */
export function partOfDay(d = new Date()) {
  const h = d.getHours();
  return h < 5 ? "evening" : h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
}

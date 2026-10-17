"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, Brain, Sparkles } from "lucide-react";
import { deckStats, REVIEW_EVENT } from "@/lib/concept-review";
import { ReviewSession } from "./review-card";
import "./today.css";

export type TodayPin = {
  href: string;
  title: string;
  kind: "last" | "start";
  phaseLabel: string;
  /** Slide tabs in that week, and how many have been read to the end. */
  tabs: string[];
  doneKey: string;
};

type Stats = ReturnType<typeof deckStats> & { sections: number; weekDone: number };

/** Sections read to the end, across every week, from the tab strip's record. */
function countFinished(): number {
  let n = 0;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (k?.startsWith("academy-tabs-done:")) n += (JSON.parse(window.localStorage.getItem(k) || "[]") as string[]).length;
    }
  } catch {}
  return n;
}

function weekFinished(pin: TodayPin | null): number {
  if (!pin) return 0;
  try {
    const done = new Set(JSON.parse(window.localStorage.getItem(pin.doneKey) || "[]") as string[]);
    return pin.tabs.filter((t) => done.has(t)).length;
  } catch {
    return 0;
  }
}

function inDays(at: number | null) {
  if (at === null) return null;
  const days = Math.max(1, Math.round((at - Date.now()) / 86_400_000));
  return days === 1 ? "tomorrow" : `in ${days} days`;
}

/** A number that counts up when it first appears. */
function Count({ to }: { to: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = reduce ? 1 : Math.min(1, (t - start) / 800);
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{n}</>;
}

// The home page's "Today" row: the three reasons to be here right now. Where
// they left off, what is due for review, and what they have built up so far.
// Everything in it changes from one visit to the next, so the page is never
// the same list of phases twice.
export function Today({ pin }: { pin: TodayPin | null }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    const read = () => setStats({ ...deckStats(), sections: countFinished(), weekDone: weekFinished(pin) });
    read();
    window.addEventListener(REVIEW_EVENT, read);
    window.addEventListener("focus", read);
    return () => {
      window.removeEventListener(REVIEW_EVENT, read);
      window.removeEventListener("focus", read);
    };
  }, [pin]);

  const weekPct = pin && pin.tabs.length && stats ? Math.round((stats.weekDone / pin.tabs.length) * 100) : 0;

  return (
    <section className="td" aria-label="Today">
      {pin && (
        <Link href={pin.href} className="td-card td-card--go">
          <span className="td-ring" style={{ ["--pct" as string]: weekPct }} aria-hidden>
            <b>{weekPct}%</b>
          </span>
          <span className="td-card__main">
            <span className="rd-kicker">{pin.kind === "last" ? "Pick up where you left off" : "Start here"}</span>
            <strong>{pin.title}</strong>
            <span className="td-card__sub">
              {pin.phaseLabel} · {stats ? `${stats.weekDone} of ${pin.tabs.length} sections read` : `${pin.tabs.length} sections`}
            </span>
          </span>
          <span className="td-go">
            {pin.kind === "last" ? "Continue" : "Begin"} <ArrowRight aria-hidden />
          </span>
        </Link>
      )}

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

      <div className="td-card td-card--stats">
        <span className="rd-kicker">
          <Sparkles aria-hidden /> What you have built
        </span>
        <dl>
          <div>
            <dt>Concepts kept</dt>
            <dd>{stats ? <Count to={stats.total} /> : 0}</dd>
          </div>
          <div>
            <dt>Sections read</dt>
            <dd>{stats ? <Count to={stats.sections} /> : 0}</dd>
          </div>
          <div>
            <dt>Known well</dt>
            <dd>{stats ? <Count to={stats.strong} /> : 0}</dd>
          </div>
        </dl>
      </div>

      {reviewing && createPortal(<ReviewSession onClose={() => setReviewing(false)} />, document.body)}
    </section>
  );
}

/** Morning, afternoon or evening, by the reader's own clock. */
export function partOfDay(d = new Date()) {
  const h = d.getHours();
  return h < 5 ? "evening" : h < 12 ? "morning" : h < 18 ? "afternoon" : "evening";
}

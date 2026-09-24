"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Flame, Timer, X } from "lucide-react";
import { useCoach } from "@/components/academy/coach-context";
import { academyFetch } from "@/lib/academy-client";
import { SKILLS, type Skill } from "@/lib/academy-score";

export type DrillStatus = {
  stats: {
    streak: number;
    longest: number;
    total: number;
    today: DrillEntry | null;
    bestTimed: DrillEntry | null;
    lastDay: string | null;
  };
  lab: { synced: boolean; syncedAt: string | null; ago: string | null; days: number | null };
  focus: string | null;
};

type DrillEntry = { id: string; day: string; mode: "daily" | "timed"; correct: number; total: number; seconds: number };
type Item = { skill: Skill; title: string; prompt: string; evidence?: string[]; choices: string[] };
type Review = { title: string; skill: Skill; picked: string | null; answer: string; correct: boolean; explain: string };
type Run = { mode: "daily" | "timed"; token: string; items: Item[]; limit: number; source: "lab" | "standard"; startedAt: number };
type Result = { entry: DrillEntry; review: Review[]; late: boolean; counted: boolean } & DrillStatus;

export const localDay = () => new Date().toLocaleDateString("sv-SE");

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function labLine(lab: DrillStatus["lab"]) {
  if (!lab.synced) return "Using the standard GovTech directory. Connect your lab to drill on your own.";
  const stale = lab.days !== null && lab.days >= 7;
  return `Using your lab. It last checked in ${lab.ago}.${stale ? " Turn your domain controller on to refresh it." : ""}`;
}

export function streakLine(s: DrillStatus["stats"]) {
  if (s.today) return s.streak > 1 ? `${s.streak} days in a row. See you tomorrow.` : "Done for today. Come back tomorrow to start a streak.";
  if (s.streak > 0) return `${s.streak}-day streak. Do today's drill to keep it.`;
  if (s.total > 0) return "Your streak reset. Start a new one today.";
  return "Five questions. Under five minutes. Do one a day.";
}

export function DrillRunner() {
  const { ask } = useCoach();
  const [status, setStatus] = useState<DrillStatus | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [idx, setIdx] = useState(0);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finishing = useRef(false);

  const load = useCallback(() => {
    academyFetch(`/academy/api/drill?day=${localDay()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStatus(d))
      .catch(() => {});
  }, []);

  useEffect(load, [load]);

  async function start(mode: "daily" | "timed") {
    setBusy(true);
    setError(null);
    try {
      const res = await academyFetch("/academy/api/drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", mode, day: localDay() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start the drill.");
      if (data.done) {
        setStatus(data);
        return;
      }
      finishing.current = false;
      setResult(null);
      setIdx(0);
      setAnswers(data.items.map(() => null));
      setNow(Date.now());
      setRun({ mode, token: data.token, items: data.items, limit: data.limitSeconds, source: data.source, startedAt: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the drill.");
    } finally {
      setBusy(false);
    }
  }

  const finish = useCallback(
    async (current: Run, given: (string | null)[]) => {
      if (finishing.current) return;
      finishing.current = true;
      setBusy(true);
      try {
        const res = await academyFetch("/academy/api/drill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "finish", token: current.token, answers: given, day: localDay() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Could not score the drill.");
        setResult(data);
        setStatus(data);
        setRun(null);
      } catch (err) {
        finishing.current = false;
        setError(err instanceof Error ? err.message : "Could not score the drill.");
      } finally {
        setBusy(false);
      }
    },
    []
  );

  // The clock ticks while a drill is running. A timed drill ends itself.
  useEffect(() => {
    if (!run) return;
    const t = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(t);
  }, [run]);

  const elapsed = run ? Math.max(0, Math.floor((now - run.startedAt) / 1000)) : 0;
  const left = run && run.limit > 0 ? Math.max(0, run.limit - elapsed) : null;

  useEffect(() => {
    if (run && left === 0) void finish(run, answers);
  }, [run, left, answers, finish]);

  if (run) {
    const item = run.items[idx];
    const last = idx === run.items.length - 1;
    const picked = answers[idx];
    return (
      <div className="rd dr">
        <div className="dr-bar">
          <span className="rd-kicker">
            {run.mode === "timed" ? "Timed drill" : "Daily drill"} · {idx + 1} of {run.items.length}
          </span>
          <span className={`dr-clock${left !== null && left <= 30 ? " dr-clock--low" : ""}`}>
            <Timer className="h-4 w-4" />
            {clock(left ?? elapsed)}
          </span>
        </div>
        <div className="dr-segs" aria-hidden>
          {run.items.map((_, i) => (
            <i key={i} className={i < idx ? "rd-tone-good" : i === idx ? "rd-tone-live" : "rd-tone-none"} />
          ))}
        </div>

        <div className="dr-card">
          <span className="rd-kicker">{item.title} · {SKILLS[item.skill].label}</span>
          <h2>{item.prompt}</h2>
          {item.evidence && (
            <pre className="dr-log" aria-label="Log evidence">
              {item.evidence.join("\n")}
            </pre>
          )}
          <div className="dr-choices" role="radiogroup">
            {item.choices.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={picked === c}
                className={`dr-choice${picked === c ? " dr-choice--on" : ""}`}
                onClick={() => setAnswers((a) => a.map((v, i) => (i === idx ? c : v)))}
              >
                <span>{c}</span>
              </button>
            ))}
          </div>
          <div className="dr-actions">
            {idx > 0 ? (
              <button type="button" className="dr-link" onClick={() => setIdx(idx - 1)}>
                Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="rd-cta"
              disabled={busy || !picked}
              onClick={() => (last ? void finish(run, answers) : setIdx(idx + 1))}
            >
              {last ? "Finish" : "Next"} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {error && <p className="dr-error">{error}</p>}
        </div>
      </div>
    );
  }

  if (result) {
    const { entry, review } = result;
    const misses = [...new Set(review.filter((r) => !r.correct).map((r) => SKILLS[r.skill].label))];
    return (
      <div className="rd dr">
        <span className="rd-kicker">{entry.mode === "timed" ? "Timed drill" : "Daily drill"} · Results</span>
        <div className="dr-score">
          <strong>
            {entry.correct}
            <small>/{entry.total}</small>
          </strong>
          <span>
            {clock(entry.seconds)}
            {result.late ? " · over the clock, not recorded" : ""}
          </span>
        </div>
        {entry.mode === "daily" && <p className="dr-note">{streakLine(result.stats)}</p>}
        {!result.counted && entry.mode === "daily" && <p className="dr-note">Today&apos;s first result stands. This is your score for the day.</p>}
        <ol className="dr-review">
          {review.map((r, i) => (
            <li key={i} className={r.correct ? "is-right" : "is-wrong"}>
              <span className="dr-review__mark">{r.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}</span>
              <div>
                <strong>{r.title}</strong>
                {!r.correct && (
                  <p>
                    You picked: {r.picked ?? "nothing"}. Answer: <b>{r.answer}</b>
                  </p>
                )}
                <p>{r.explain}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="dr-actions">
          <button type="button" className="rd-cta" disabled={busy} onClick={() => void start("timed")}>
            Try a timed drill <ArrowRight className="h-4 w-4" />
          </button>
          {misses.length > 0 && (
            <button
              type="button"
              className="dr-link"
              onClick={() => ask(`I just missed drill questions on ${misses.join(" and ")}. Coach me on those without giving away mission answers.`)}
            >
              Ask Coach about my misses
            </button>
          )}
          <button type="button" className="dr-link" onClick={() => setResult(null)}>
            Done
          </button>
        </div>
      </div>
    );
  }

  const s = status?.stats;
  return (
    <div className="rd dr">
      <header className="ax-titleblock">
        <h1>Drills</h1>
        <p>Short, real work on your own directory. One a day keeps the skills sharp.</p>
      </header>

      {status && s ? (
        <>
          <div className="dr-stats">
            <div>
              <span className="rd-kicker">Streak</span>
              <strong>
                <Flame className="h-6 w-6" />
                {s.streak}
                <small>{s.streak === 1 ? "day" : "days"}</small>
              </strong>
            </div>
            <div>
              <span className="rd-kicker">Best streak</span>
              <strong>{s.longest}</strong>
            </div>
            <div>
              <span className="rd-kicker">Drills done</span>
              <strong>{s.total}</strong>
            </div>
          </div>
          <p className="dr-note">{streakLine(s)}</p>
          <p className="dr-note dr-note--lab">{labLine(status.lab)}</p>

          <div className="dr-modes">
            <div className="dr-mode">
              <span className="rd-kicker">Daily drill</span>
              <h3>Five questions from your directory</h3>
              <p>
                {status.focus ? `Built around your gap in ${status.focus}. ` : ""}Same drill all day, one result per day. It keeps your streak.
              </p>
              {s.today ? (
                <p className="dr-done">
                  Done today: {s.today.correct}/{s.today.total} in {clock(s.today.seconds)}
                </p>
              ) : (
                <button type="button" className="rd-cta" disabled={busy} onClick={() => void start("daily")}>
                  Start daily drill <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="dr-mode">
              <span className="rd-kicker">Incident drill</span>
              <h3>Five alerts and tickets, three minutes</h3>
              <p>A random mix with a clock. Practice choosing well under pressure.</p>
              <button type="button" className="rd-cta" disabled={busy} onClick={() => void start("timed")}>
                Start timed drill <ArrowRight className="h-4 w-4" />
              </button>
              {s.bestTimed && (
                <p className="dr-note">
                  Best: {s.bestTimed.correct}/{s.bestTimed.total} in {clock(s.bestTimed.seconds)}
                </p>
              )}
            </div>
          </div>
          {error && <p className="dr-error">{error}</p>}
          <p className="dr-note">
            <Link href="/academy/readiness" className="dr-link">
              Back to readiness
            </Link>
          </p>
        </>
      ) : (
        <p className="dr-note">Loading your drills…</p>
      )}
    </div>
  );
}

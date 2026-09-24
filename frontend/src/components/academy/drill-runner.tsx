"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Flame, Sparkles, Timer, X } from "lucide-react";
import { useCoach } from "@/components/academy/coach-context";
import { academyFetch } from "@/lib/academy-client";
import { SKILLS, type Skill } from "@/lib/academy-score";

export type DrillStatus = {
  stats: {
    days: string[];
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
type Item = { skill: Skill; title: string; story?: string; prompt: string; evidence?: string[]; choices: string[] };
type Review = { title: string; skill: Skill; picked: string | null; answer: string; correct: boolean; explain: string };
type Run = { mode: "daily" | "timed"; token: string; items: Item[]; limit: number; ai: boolean; startedAt: number };
type Result = { entry: DrillEntry; review: Review[]; late: boolean; counted: boolean; items: Item[] } & DrillStatus;

export const localDay = (d = new Date()) => d.toLocaleDateString("sv-SE");

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const LETTERS = ["A", "B", "C", "D"];

export function scoreLabel(e: DrillEntry) {
  return e.total === 1 ? (e.correct ? "Correct" : "Missed") : `${e.correct}/${e.total}`;
}

export function labLine(lab: DrillStatus["lab"]) {
  if (!lab.synced) return "Using the standard GovTech directory. Connect your lab to drill on your own.";
  const stale = lab.days !== null && lab.days >= 7;
  return `Written from your lab. It last checked in ${lab.ago}.${stale ? " Turn your domain controller on to refresh it." : ""}`;
}

export function streakLine(s: DrillStatus["stats"]) {
  if (s.today) return s.streak > 1 ? `${s.streak} days in a row. See you tomorrow.` : "Done for today. Come back tomorrow to start a streak.";
  if (s.streak > 0) return `${s.streak}-day streak. Do today's scenario to keep it.`;
  if (s.total > 0) return "Your streak reset. Start a new one today.";
  return "One scenario a day. About two minutes.";
}

function lastSeven() {
  const out: { day: string; label: string; date: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({
      day: localDay(d),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: String(d.getDate()),
    });
  }
  return out;
}

function Scenario({ item, picked, onPick }: { item: Item; picked: string | null; onPick: (c: string) => void }) {
  return (
    <div className="dr-card">
      <span className="rd-kicker">{SKILLS[item.skill].label}</span>
      <h2 className="dr-card__title">{item.title}</h2>
      {item.story && <p className="dr-story">{item.story}</p>}
      {item.evidence && (
        <div className="dr-term" aria-label="Evidence">
          <div className="dr-term__bar">
            <i />
            <i />
            <i />
            <span>Evidence</span>
          </div>
          <pre>{item.evidence.join("\n")}</pre>
        </div>
      )}
      <h3 className="dr-question">{item.prompt}</h3>
      <div className="dr-choices" role="radiogroup">
        {item.choices.map((c, i) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={picked === c}
            className={`dr-choice${picked === c ? " dr-choice--on" : ""}`}
            onClick={() => onPick(c)}
          >
            <b>{LETTERS[i]}</b>
            <span>{c}</span>
          </button>
        ))}
      </div>
    </div>
  );
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
  const [leaving, setLeaving] = useState(false);
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
      setRun({ mode, token: data.token, items: data.items, limit: data.limitSeconds, ai: Boolean(data.ai), startedAt: Date.now() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start the drill.");
    } finally {
      setBusy(false);
    }
  }

  function exitDrill() {
    finishing.current = false;
    setLeaving(false);
    setRun(null);
    setAnswers([]);
    setIdx(0);
    setError(null);
  }

  const finish = useCallback(async (current: Run, given: (string | null)[]) => {
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
      setResult({ ...data, items: current.items });
      setStatus(data);
      setRun(null);
    } catch (err) {
      finishing.current = false;
      setError(err instanceof Error ? err.message : "Could not score the drill.");
    } finally {
      setBusy(false);
    }
  }, []);

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
    const single = run.items.length === 1;
    const item = run.items[idx];
    const last = idx === run.items.length - 1;
    const picked = answers[idx];
    const pick = (c: string) => setAnswers((a) => a.map((v, i) => (i === idx ? c : v)));
    return (
      <div className="rd dr dr--play">
        <div className="dr-bar">
          <span className="rd-kicker">
            {run.mode === "timed"
              ? `Incident drill · ${idx + 1} of ${run.items.length}`
              : run.ai
                ? "Daily scenario · written for you"
                : "Daily scenario"}
          </span>
          <span className="dr-bar__end">
            {leaving ? (
              <span className="dr-leave">
                Leave this drill?
                <button type="button" className="dr-link" onClick={() => setLeaving(false)}>
                  Stay
                </button>
                <button type="button" className="dr-link dr-link--bad" onClick={exitDrill}>
                  Leave
                </button>
              </span>
            ) : (
              <button type="button" className="dr-exit" onClick={() => setLeaving(true)}>
                <X className="h-4 w-4" /> Exit
              </button>
            )}
            <span className={`dr-clock${left !== null && left <= 30 ? " dr-clock--low" : ""}`}>
              <Timer className="h-4 w-4" />
              {clock(left ?? elapsed)}
            </span>
          </span>
        </div>
        {!single && (
          <div className="dr-segs" aria-hidden>
            {run.items.map((_, i) => (
              <i key={i} className={i < idx ? "rd-tone-good" : i === idx ? "rd-tone-live" : "rd-tone-none"} />
            ))}
          </div>
        )}

        <Scenario item={item} picked={picked} onPick={pick} />

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
            {last ? (single ? "Submit answer" : "Finish") : "Next"} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {error && <p className="dr-error">{error}</p>}
      </div>
    );
  }

  if (result) {
    const { entry, review, items } = result;
    const single = review.length === 1;
    const first = review[0];
    const misses = [...new Set(review.filter((r) => !r.correct).map((r) => SKILLS[r.skill].label))];
    return (
      <div className="rd dr dr--play">
        <span className="rd-kicker">{entry.mode === "timed" ? "Incident drill" : "Daily scenario"} · Result</span>

        {single ? (
          <div className={`dr-verdict ${first.correct ? "is-right" : "is-wrong"}`}>
            <span className="dr-verdict__mark">{first.correct ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}</span>
            <div>
              <strong>{first.correct ? "Correct" : "Not quite"}</strong>
              <span>{clock(entry.seconds)}</span>
            </div>
          </div>
        ) : (
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
        )}

        {entry.mode === "daily" && <p className="dr-note">{streakLine(result.stats)}</p>}
        {!result.counted && entry.mode === "daily" && <p className="dr-note">Today&apos;s first result stands. This is your score for the day.</p>}

        <ol className="dr-review">
          {review.map((r, i) => (
            <li key={i} className={r.correct ? "is-right" : "is-wrong"}>
              <span className="dr-review__mark">{r.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}</span>
              <div>
                <strong>{r.title}</strong>
                {single && items[i]?.story && <p className="dr-review__story">{items[i].story}</p>}
                {!r.correct && <p>You picked: {r.picked ?? "nothing"}.</p>}
                <p>
                  Best answer: <b>{r.answer}</b>
                </p>
                <p>{r.explain}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="dr-actions">
          <button type="button" className="rd-cta" disabled={busy} onClick={() => void start("timed")}>
            Try an incident drill <ArrowRight className="h-4 w-4" />
          </button>
          {misses.length > 0 && (
            <button
              type="button"
              className="dr-link"
              onClick={() =>
                ask(
                  single
                    ? `I just missed today's drill scenario "${first.title}" (${misses[0]}). Coach me on the thinking behind it without quizzing me on mission answers.`
                    : `I just missed drill questions on ${misses.join(" and ")}. Coach me on those without giving away mission answers.`
                )
              }
            >
              Ask Coach about it
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
  const week = lastSeven();
  const today = localDay();
  const todayDone = Boolean(s?.today);
  return (
    <div className="rd dr dr--floor">
      <header className="dr-mast">
        <div>
          <span className="rd-kicker">Practice floor</span>
          <h1>Drills</h1>
        </div>
        <p>Practice on your own directory. One scenario a day. A timed drill when you want pressure.</p>
      </header>

      {status && s ? (
        <>
          <div className="dr-board">
            <section className={`dr-assign${todayDone ? " is-done" : ""}`}>
              <div className="dr-assign__meta">
                <span className="dr-assign__n">01</span>
                <span className="rd-kicker">
                  <Sparkles className="h-3.5 w-3.5" /> Today&apos;s scenario
                </span>
                {status.focus && <em className="dr-assign__gap">Gap · {status.focus}</em>}
              </div>
              <h2>
                {s.today
                  ? s.today.correct
                    ? "Nice work. You got it."
                    : "Missed today. Read the why and try again tomorrow."
                  : "One real problem, built from your lab"}
              </h2>
              <p>
                {s.today ? streakLine(s) : "Read the situation, pick the right first move, and see why."}
              </p>
              <ol className="dr-steps" aria-label="How a daily scenario works">
                <li>
                  <b>01</b>
                  <strong>Read</strong>
                  <span>The ticket and the evidence.</span>
                </li>
                <li>
                  <b>02</b>
                  <strong>Choose</strong>
                  <span>The first move. Not a guess.</span>
                </li>
                <li>
                  <b>03</b>
                  <strong>See why</strong>
                  <span>What a desk lead would do.</span>
                </li>
              </ol>
              <div className="dr-assign__act">
                {s.today ? (
                  <span className={`dr-chip ${s.today.correct ? "is-right" : "is-wrong"}`}>
                    {scoreLabel(s.today)} · {clock(s.today.seconds)}
                  </span>
                ) : (
                  <button type="button" className="rd-cta" disabled={busy} onClick={() => void start("daily")}>
                    {busy ? "Writing your scenario…" : "Start today's scenario"} <ArrowRight className="h-4 w-4" />
                  </button>
                )}
                <small>{labLine(status.lab)}</small>
              </div>
            </section>

            <aside className="dr-logboard">
              <div className="dr-streak">
                <strong>
                  <Flame className="h-8 w-8" />
                  {s.streak}
                </strong>
                <span>day streak</span>
              </div>
              <ol className="dr-roster" aria-label="Last seven days">
                {week.map((d) => {
                  const done = s.days.includes(d.day);
                  const isToday = d.day === today;
                  return (
                    <li
                      key={d.day}
                      className={`dr-roster__day${done ? " is-done" : ""}${isToday ? " is-today" : ""}`}
                    >
                      <b>{d.label}</b>
                      <em>{d.date}</em>
                      <i>{done ? <Check className="h-3 w-3" /> : isToday ? "now" : ""}</i>
                    </li>
                  );
                })}
              </ol>
              <div className="dr-meters">
                <div>
                  <span className="rd-kicker">Best streak</span>
                  <strong>{s.longest}</strong>
                </div>
                <div>
                  <span className="rd-kicker">Drills done</span>
                  <strong>{s.total}</strong>
                </div>
                <div>
                  <span className="rd-kicker">Best incident</span>
                  <strong>{s.bestTimed ? `${s.bestTimed.correct}/${s.bestTimed.total}` : "—"}</strong>
                </div>
              </div>
            </aside>

            <section className="dr-pressure">
              <div className="dr-pressure__copy">
                <div className="dr-assign__meta">
                  <span className="dr-assign__n">02</span>
                  <span className="rd-kicker">
                    <Timer className="h-3.5 w-3.5" /> Incident drill
                  </span>
                </div>
                <h3>Five alerts and tickets, three minutes</h3>
                <p>A random mix with a clock. Practice choosing well under pressure.</p>
              </div>
              <div className="dr-pressure__clock" aria-hidden>
                <b>3:00</b>
                <span>clock</span>
              </div>
              <button type="button" className="rd-cta" disabled={busy} onClick={() => void start("timed")}>
                Start <ArrowRight className="h-4 w-4" />
              </button>
            </section>
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

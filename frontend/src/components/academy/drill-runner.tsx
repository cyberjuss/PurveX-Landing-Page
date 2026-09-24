"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Copy, Flag, Flame, Sparkles, Timer, X } from "lucide-react";
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
  level: { n: number; name: string };
  ctf: { week: string; entry: DrillEntry | null };
  report: Report;
};

type Report = {
  from: string;
  to: string;
  drills: number;
  daysActive: number;
  asked: number;
  correct: number;
  accuracy: number | null;
  levelName: string;
  skills: { skill: Skill; label: string; asked: number; correct: number; pct: number | null }[];
  weakest: { label: string; pct: number | null } | null;
  themes: { theme: string; missed: number; asked: number }[];
  next: string;
};

type Mode = "daily" | "timed" | "ctf";
const MODE_LABEL: Record<string, string> = { daily: "Daily scenario", timed: "Incident drill", ctf: "Weekly CTF", coach: "Practice" };

type DrillEntry = { id: string; day: string; mode: string; correct: number; total: number; seconds: number };
type Item = { skill: Skill; title: string; story?: string; prompt: string; evidence?: string[]; choices: string[]; free?: boolean; format?: string };
type Review = { title: string; skill: Skill; picked: string | null; answer: string; correct: boolean; explain: string };
type Run = { mode: Mode; token: string; items: Item[]; limit: number; ai: boolean; startedAt: number };
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

function Scenario({
  item,
  picked,
  onPick,
  hint,
  onHint,
}: {
  item: Item;
  picked: string | null;
  onPick: (c: string) => void;
  hint: string | null;
  onHint: () => void;
}) {
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
      {item.free ? (
        <div className="dr-free">
          <label htmlFor="dr-answer">{item.format || "Type your answer"}</label>
          <input
            id="dr-answer"
            type="text"
            value={picked ?? ""}
            onChange={(e) => onPick(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="answer"
          />
          {hint ? (
            <p className="dr-hint">Hint: {hint}</p>
          ) : (
            <button type="button" className="dr-link" onClick={onHint}>
              Need a hint?
            </button>
          )}
        </div>
      ) : (
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
      )}
    </div>
  );
}

function reportText(r: Report) {
  const lines = [
    `PurveX drill report, ${r.from} to ${r.to}`,
    `Accuracy: ${r.accuracy === null ? "no drills yet" : `${r.accuracy}% (${r.correct} of ${r.asked})`}. Days active: ${r.daysActive}. Level: ${r.levelName}.`,
    ...r.skills.filter((k) => k.asked > 0).map((k) => `${k.label}: ${k.pct}% of ${k.asked}`),
    r.themes.length ? `Keeps missing: ${r.themes.map((t) => t.theme).join("; ")}.` : "",
    r.next,
  ];
  return lines.filter(Boolean).join("\n");
}

function WeekReport({ r }: { r: Report }) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="dr-report">
      <div className="dr-report__head">
        <span className="rd-kicker">This week</span>
        <button
          type="button"
          className="dr-link"
          onClick={() => {
            navigator.clipboard?.writeText(reportText(r)).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }).catch(() => {});
          }}
        >
          <Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy report"}
        </button>
      </div>
      <div className="dr-report__top">
        <strong>{r.accuracy === null ? "–" : `${r.accuracy}%`}</strong>
        <span>
          {r.asked === 0 ? "No questions yet this week." : `${r.correct} of ${r.asked} right · ${r.daysActive} ${r.daysActive === 1 ? "day" : "days"} active · ${r.levelName}`}
        </span>
      </div>
      {r.asked > 0 && (
        <ul className="dr-bars">
          {r.skills.map((k) => (
            <li key={k.skill}>
              <span>{k.label}</span>
              <i>
                <b style={{ width: `${k.pct ?? 0}%` }} className={k.pct === null ? "" : k.pct >= 70 ? "is-good" : "is-low"} />
              </i>
              <em>{k.pct === null ? "–" : `${k.pct}%`}</em>
            </li>
          ))}
        </ul>
      )}
      <p className="dr-report__next">{r.next}</p>
    </section>
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
  const [hint, setHint] = useState<string | null>(null);
  const finishing = useRef(false);

  const load = useCallback(() => {
    academyFetch(`/academy/api/drill?day=${localDay()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStatus(d))
      .catch(() => {});
  }, []);

  useEffect(load, [load]);

  async function getHint(token: string) {
    try {
      const res = await academyFetch("/academy/api/drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hint", token }),
      });
      const data = await res.json();
      setHint(typeof data.hint === "string" ? data.hint : "No hint for this one.");
    } catch {
      setHint("Could not load a hint.");
    }
  }

  async function start(mode: Mode) {
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
      setHint(null);
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
    setHint(null);
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
              : run.mode === "ctf"
                ? "Weekly CTF · type your answer"
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

        <Scenario item={item} picked={picked} onPick={pick} hint={hint} onHint={() => void getHint(run.token)} />

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
            disabled={busy || !picked || !picked.trim()}
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
        <span className="rd-kicker">{MODE_LABEL[entry.mode] ?? "Drill"} · Result</span>

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
        {entry.mode === "ctf" && <p className="dr-note">One CTF a week. A new one opens on Monday.</p>}
        {!result.counted && entry.mode === "daily" && <p className="dr-note">Today&apos;s first result stands. This is your score for the day.</p>}

        <ol className="dr-review">
          {review.map((r, i) => (
            <li key={i} className={r.correct ? "is-right" : "is-wrong"}>
              <span className="dr-review__mark">{r.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}</span>
              <div>
                <strong>{r.title}</strong>
                {single && items[i]?.story && <p className="dr-review__story">{items[i].story}</p>}
                {!r.correct && <p>{items[i]?.free ? "You typed" : "You picked"}: {r.picked ?? "nothing"}.</p>}
                <p>
                  {items[i]?.free ? "Flag" : "Best answer"}: <b>{items[i]?.free ? `gtf{${r.answer}}` : r.answer}</b>
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
  return (
    <div className="rd dr dr--floor">
      <header className="dr-mast">
        <h1>Drills</h1>
        <p>Practice on your own directory. One scenario a day.</p>
      </header>

      {status && s ? (
        <>
          <div className="dr-grid">
            <section className="dr-today">
              <span className="rd-kicker">
                <Sparkles className="h-3.5 w-3.5" /> Today&apos;s scenario
              </span>
              <h2>
                {s.today
                  ? s.today.correct
                    ? "Nice work. You got it."
                    : "Missed today. Try again tomorrow."
                  : "One real problem from your lab"}
              </h2>
              <p>{s.today ? streakLine(s) : "Read the situation and pick the right first move."}</p>
              {s.today ? (
                <span className={`dr-chip ${s.today.correct ? "is-right" : "is-wrong"}`}>
                  {scoreLabel(s.today)} · {clock(s.today.seconds)}
                </span>
              ) : (
                <button type="button" className="rd-cta" disabled={busy} onClick={() => void start("daily")}>
                  {busy ? "Writing your scenario…" : "Start"} <ArrowRight className="h-4 w-4" />
                </button>
              )}
              <div className="dr-today__foot">
                <span className="dr-streakline">
                  <Flame className="h-4 w-4" />
                  {s.streak} day streak
                </span>
                <span className="dr-level">
                  Level {status.level.n} · {status.level.name}
                </span>
                <span className="dr-days" aria-label="Last seven days">
                  {week.map((d) => (
                    <i
                      key={d.day}
                      title={d.day}
                      className={`${s.days.includes(d.day) ? "is-done" : ""}${d.day === today ? " is-today" : ""}`}
                    />
                  ))}
                </span>
              </div>
            </section>

            <div className="dr-side">
              <section className="dr-quick">
                <span className="rd-kicker">
                  <Timer className="h-3.5 w-3.5" /> Incident drill
                </span>
                <h3>Five questions, a clock</h3>
                <p>{s.bestTimed ? `Best: ${s.bestTimed.correct}/${s.bestTimed.total}` : "Alerts and tickets against time."}</p>
                <button type="button" className="dr-outline" disabled={busy} onClick={() => void start("timed")}>
                  Start <ArrowRight className="h-4 w-4" />
                </button>
              </section>
              <section className="dr-quick">
                <span className="rd-kicker">
                  <Flag className="h-3.5 w-3.5" /> Weekly CTF
                </span>
                <h3>{status.ctf.entry ? (status.ctf.entry.correct ? "Flag captured" : "Not this week") : "One hard investigation"}</h3>
                <p>{status.ctf.entry ? "A new one opens Monday." : "Read the evidence, find the flag. One a week."}</p>
                {!status.ctf.entry && (
                  <button type="button" className="dr-outline" disabled={busy} onClick={() => void start("ctf")}>
                    {busy ? "Writing…" : "Start"} <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </section>
            </div>
          </div>
          <WeekReport r={status.report} />
          <p className="dr-lab">{labLine(status.lab)}</p>
          {error && <p className="dr-error">{error}</p>}
        </>
      ) : (
        <p className="dr-note">Loading your drills…</p>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Copy, Flame, Timer, X } from "lucide-react";
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
  missed: Missed[];
  chats: { base: number; bonus: number; parts: { label: string; n: number }[] };
};

type Missed = { day: string; mode: string; title: string; skill: Skill; prompt: string; picked: string; answer: string; explain: string };

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

type DrillEntry = { id: string; day: string; mode: string; correct: number; total: number; seconds: number; detail?: { t: string }[] };
type Item = { skill: Skill; title: string; story?: string; prompt: string; evidence?: string[]; choices: string[]; free?: boolean; format?: string; kind?: "decide" | "respond" | "change"; long?: boolean; checklist?: string[]; checkCount?: number };
type CheckRes = { fresh: boolean; results: { label: string; ok: boolean }[]; syncedAgo: string | null; passed: boolean };
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
  caseNo,
  item,
  picked,
  onPick,
  hint,
  onHint,
  checkRes,
}: {
  caseNo: string;
  item: Item;
  picked: string | null;
  onPick: (c: string) => void;
  hint: string | null;
  onHint: () => void;
  checkRes: CheckRes | null;
}) {
  return (
    <div className="dr-card">
      <span className="rd-kicker">
        Case {caseNo} · {SKILLS[item.skill].label}
      </span>
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
      {item.kind === "change" ? (
        <div className="dr-task">
          <span className="rd-kicker">Make this change in your lab</span>
          {item.checklist ? (
            <ul className="dr-task__list">
              {item.checklist.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ) : (
            <p>
              You are checked on the result: {item.checkCount} things must be true when you are done. Work out what the job needs.
            </p>
          )}
          <p className="dr-task__sync">
            Your lab reports about every 15 minutes. To check right away, run <code>.\Build-Environment.ps1 -SyncOnly</code> on the domain controller.
          </p>
          {checkRes && (
            <div className="dr-checks">
              {!checkRes.fresh && (
                <p className="dr-checks__stale">
                  Your lab has not reported since you started{checkRes.syncedAgo ? ` (last report ${checkRes.syncedAgo})` : ""}. Make the change, sync, then check again.
                </p>
              )}
              {checkRes.fresh && (
                <ul>
                  {checkRes.results.map((r) => (
                    <li key={r.label} className={r.ok ? "is-ok" : "is-bad"}>
                      <span>{r.ok ? "✓" : "✗"}</span>
                      {r.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : item.kind === "respond" ? (
        <div className="dr-free">
          <label htmlFor="dr-answer">{item.format || "Write your answer"}</label>
          <textarea
            id="dr-answer"
            rows={6}
            value={picked ?? ""}
            onChange={(e) => onPick(e.target.value)}
            maxLength={1200}
            placeholder="First I would… because… Before that I would check…"
          />
          <span className="dr-free__count">{(picked ?? "").length} / 1200</span>
        </div>
      ) : item.free ? (
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

function MissedList({ items, n }: { items: Missed[]; n: string }) {
  const { ask } = useCoach();
  return (
    <section className="rd-sec dr-missed">
      <div className="rd-sec__head">
        <span className="rd-sec__n">{n}</span>
        <h2>Missed questions</h2>
        <p>Saved so you can study them. The newest is first.</p>
      </div>
      <ol className="dr-missed__list">
        {items.map((m, i) => (
          <li key={`${m.day}-${i}`}>
            <div className="dr-missed__meta">
              <span className="rd-kicker">{SKILLS[m.skill].label}</span>
              <em>{m.day}</em>
            </div>
            <strong>{m.title}</strong>
            {m.prompt && <p>{m.prompt}</p>}
            {m.picked && (
              <p className="dr-missed__you">
                You: {m.picked}
              </p>
            )}
            {m.answer && (
              <p>
                Best answer: <b>{m.mode === "ctf" ? `gtf{${m.answer}}` : m.answer}</b>
              </p>
            )}
            {m.explain && <p className="dr-missed__why">{m.explain}</p>}
            <button
              type="button"
              className="dr-link"
              onClick={() => ask(`I missed this drill question: "${m.title}" (${SKILLS[m.skill].label}). Coach me on the thinking behind it, then give me a fresh one like it.`)}
            >
              Ask Coach about this
            </button>
          </li>
        ))}
      </ol>
    </section>
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

function WeekReport({ r, n }: { r: Report; n: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <section className="rd-sec dr-report">
      <div className="rd-sec__head">
        <span className="rd-sec__n">{n}</span>
        <h2>This week</h2>
        <button
          type="button"
          className="dr-link dr-report__copy"
          onClick={() => {
            navigator.clipboard?.writeText(reportText(r)).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }).catch(() => {});
          }}
        >
          <Copy className="h-3.5 w-3.5" /> {copied ? "Copied" : "Copy report"}
        </button>
        <p>
          {r.asked === 0
            ? "No questions yet this week."
            : `${r.accuracy}% right · ${r.correct} of ${r.asked} · ${r.daysActive} ${r.daysActive === 1 ? "day" : "days"} active · ${r.levelName}`}
        </p>
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

  const [checkRes, setCheckRes] = useState<CheckRes | null>(null);

  async function checkLab(current: Run) {
    setBusy(true);
    setError(null);
    try {
      const res = await academyFetch("/academy/api/drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check", token: current.token, day: localDay() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not check your lab.");
      if (data.passed && data.entry) {
        setResult({ ...data, items: current.items });
        setStatus(data);
        setRun(null);
        return;
      }
      setCheckRes({ fresh: Boolean(data.fresh), results: data.results ?? [], syncedAgo: data.syncedAgo ?? null, passed: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check your lab.");
    } finally {
      setBusy(false);
    }
  }

  async function start(mode: Mode, format?: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await academyFetch("/academy/api/drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", mode, day: localDay(), format }),
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
      setCheckRes(null);
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
                : run.items[0]?.kind === "change"
                  ? "Daily lab task · make the change"
                  : run.items[0]?.kind === "respond"
                    ? "Daily written case"
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

        <Scenario caseNo={String((status?.stats.total ?? 0) + 1).padStart(2, "0")} item={item} picked={picked} onPick={pick} hint={hint} onHint={() => void getHint(run.token)} checkRes={checkRes} />

        <div className="dr-actions">
          {item.kind === "change" ? (
            <>
              <span className="dr-actions__side">
                <button type="button" className="dr-link" disabled={busy} onClick={() => void finish(run, [""])}>
                  Give up and see the steps
                </button>
                {run.mode === "daily" && (
                  <button type="button" className="dr-link" disabled={busy} onClick={() => void start("daily", "respond")}>
                    Can&apos;t reach your lab? Do a written case instead
                  </button>
                )}
              </span>
              <button type="button" className="rd-cta" disabled={busy} onClick={() => void checkLab(run)}>
                {busy ? "Checking…" : "Check my lab"} <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
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
                disabled={busy || !picked || !picked.trim() || (item.kind === "respond" && picked.trim().length < 40)}
                onClick={() => (last ? void finish(run, answers) : setIdx(idx + 1))}
              >
                {busy && item.kind === "respond" ? "Marking…" : last ? (single ? "Submit answer" : "Finish") : "Next"} <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
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
                {!r.correct && items[i]?.kind !== "change" && <p>{items[i]?.free ? "You wrote" : "You picked"}: {r.picked ?? "nothing"}.</p>}
                <p>
                  {items[i]?.kind === "respond"
                    ? "A strong answer"
                    : items[i]?.kind === "change"
                      ? "Outcome"
                      : items[i]?.free
                        ? "Flag"
                        : "Best answer"}
                  : <b>{items[i]?.free && items[i]?.kind !== "respond" ? `gtf{${r.answer}}` : r.answer}</b>
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
  const caseNo = String((s?.total ?? 0) + 1).padStart(2, "0");
  const nameOf = (e: DrillEntry | null | undefined) => e?.detail?.[0]?.t ?? null;
  return (
    <div className="rd dr dr--floor">
      <header className="ax-titleblock">
        <h1>Drills</h1>
        <p>Practice on your own directory. One named case a day.</p>
      </header>

      {status && s ? (
        <>
          <div className="dr-strip">
            <span className="dr-streakline">
              <Flame className="h-4 w-4" />
              {s.streak} day streak
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
            <span className="dr-level">
              Level {status.level.n} · {status.level.name}
            </span>
            {status.chats.bonus > 0 && <span className="dr-earned">+{status.chats.bonus} Coach chats earned today</span>}
          </div>

          <ol className="ax-path dr-rows">
            <li>
              <div className="ax-path__row">
                <span className="ax-path__n">01</span>
                <span className="ax-path__main">
                  <span className="ax-path__title">
                    {s.today ? (nameOf(s.today) ?? "Daily scenario") : `Case ${caseNo}`}
                    {s.today && <em className={`ax-tag ${s.today.correct ? "ax-tag--good" : ""}`}>{scoreLabel(s.today)}</em>}
                  </span>
                  <span className="ax-path__body">
                    {s.today
                      ? `Daily scenario · ${clock(s.today.seconds)}. ${streakLine(s)}`
                      : `A decision, a written case, or a real change in your lab${status.focus ? `, aimed at ${status.focus}` : ""}. It gets a name when you open it. Earns +${4 + status.level.n} to +${7 + status.level.n} Coach chats.`}
                  </span>
                </span>
                <span className="ax-path__count">
                  {!s.today && (
                    <button type="button" className="rd-cta" disabled={busy} onClick={() => void start("daily")}>
                      {busy ? "Writing…" : "Open case"} <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </span>
              </div>
            </li>
            <li>
              <div className="ax-path__row">
                <span className="ax-path__n">02</span>
                <span className="ax-path__main">
                  <span className="ax-path__title">Incident drill</span>
                  <span className="ax-path__body">
                    Five alerts and tickets against a clock. Earns +2 Coach chats. {s.bestTimed ? `Best ${s.bestTimed.correct}/${s.bestTimed.total}.` : ""}
                  </span>
                </span>
                <span className="ax-path__count">
                  <button type="button" className="dr-outline" disabled={busy} onClick={() => void start("timed")}>
                    Start <ArrowRight className="h-4 w-4" />
                  </button>
                </span>
              </div>
            </li>
            <li>
              <div className="ax-path__row">
                <span className="ax-path__n">03</span>
                <span className="ax-path__main">
                  <span className="ax-path__title">
                    {status.ctf.entry ? (nameOf(status.ctf.entry) ?? "Weekly CTF") : "Weekly CTF"}
                    {status.ctf.entry && <em className={`ax-tag ${status.ctf.entry.correct ? "ax-tag--good" : ""}`}>{status.ctf.entry.correct ? "Flag captured" : "Missed"}</em>}
                  </span>
                  <span className="ax-path__body">
                    {status.ctf.entry ? "A new investigation opens Monday." : "One hard investigation a week. Read the evidence, type the flag. Earns +8 Coach chats, +16 with the flag."}
                  </span>
                </span>
                <span className="ax-path__count">
                  {!status.ctf.entry && (
                    <button type="button" className="dr-outline" disabled={busy} onClick={() => void start("ctf")}>
                      {busy ? "Writing…" : "Start"} <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </span>
              </div>
            </li>
          </ol>

          <WeekReport r={status.report} n="04" />
          {status.missed.length > 0 && <MissedList items={status.missed} n="05" />}
          <p className="dr-lab">{labLine(status.lab)}</p>
          {error && <p className="dr-error">{error}</p>}
        </>
      ) : (
        <p className="dr-note">Loading your drills…</p>
      )}
    </div>
  );
}

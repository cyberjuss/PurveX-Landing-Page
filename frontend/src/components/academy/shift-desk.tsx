"use client";

import { useEffect, useState } from "react";
import { Check, LifeBuoy, Loader2, Mail, X } from "lucide-react";
import { useCoach } from "./coach-context";
import "./shift-desk.css";

// The desk around the incidents, in the console: one email a shift, from a
// pool (phishing, a request to skip the process, a status ask). It slides in
// over the work and waits there until it is answered; it has no clock of its own.
// Once answered it turns into Coach's feedback: what each option would have
// done, the principle, and where that principle comes from. Grading is all on
// the server (academy-shift-desk.ts); this only shows it.

export type DeskEvent = {
  uid: string;
  kind: "email" | "reply";
  from: string;
  title: string;
  body: string;
  prompt: string | null;
  choices: { id: string; text: string }[];
  arriveSec: number;
  secondsLeft: number | null;
  lapsed: boolean;
  answered: boolean;
  verdict: {
    choice: string | null;
    text: string | null;
    correct: boolean;
    score: number;
    max: number;
    feedback: { id: string; text: string; correct: boolean; why: string }[];
    hits: string[];
    misses: string[];
    lesson: string;
    source: string;
  } | null;
};

type Post = (p: Record<string, unknown>, opts?: { silent?: boolean }) => Promise<Record<string, unknown> | null>;

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const ICON = { email: Mail, reply: Mail } as const;
const KIND = { email: "New email", reply: "New email" } as const;

/** Shows the oldest desk event that still wants something from the student. */
export function DeskLayer({ desk, now, busy, post, inline = false }: { desk: DeskEvent[]; now: number; busy: boolean; post: Post; inline?: boolean }) {
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  // The list holds only what has arrived, oldest first. One that lapsed before
  // the student saw it still shows, as Coach's note on what it was.
  const live = desk.find((d) => !seen.has(d.uid));
  if (!live) return null;
  return <DeskCard key={live.uid} ev={live} now={now} busy={busy} post={post} inline={inline} onDone={() => setSeen((s) => new Set(s).add(live.uid))} />;
}

function DeskCard({ ev, now, busy, post, inline, onDone }: { ev: DeskEvent; now: number; busy: boolean; post: Post; inline: boolean; onDone: () => void }) {
  const [text, setText] = useState("");
  const [pick, setPick] = useState<string | null>(null);
  const { ask } = useCoach();
  const Icon = ICON[ev.kind];
  // The clock runs on the page between polls: the server said how long was
  // left when the card arrived, and the page counts down from there.
  const [deadline] = useState(() => (ev.secondsLeft !== null ? Date.now() + ev.secondsLeft * 1000 : null));
  const left = deadline !== null ? Math.max(0, Math.round((deadline - now) / 1000)) : null;

  // A short chime-free ring: the card shakes once when it lands, so it is
  // noticed without a sound the student did not ask for.
  const [fresh, setFresh] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setFresh(false), 900);
    return () => window.clearTimeout(t);
  }, []);

  const v = ev.verdict;
  const answer = (choice: string) => {
    setPick(choice);
    void post({ action: "desk", uid: ev.uid, choice });
  };

  return (
    <aside className={`sdk sdk--${ev.kind}${inline ? " sdk--inline" : ""}${fresh && !v ? " is-ringing" : ""}${v ? (v.correct ? " is-right" : " is-wrong") : ""}`} role="dialog" aria-label={ev.title}>
      <header className="sdk__head">
        <span className="sdk__icon" aria-hidden>
          <Icon />
        </span>
        <span className="sdk__meta">
          <span className="sdk__kind">{KIND[ev.kind]}</span>
          <span className="sdk__from">{ev.from}</span>
        </span>
        {!v && left !== null && <span className={`sdk__clock${left <= 20 ? " is-low" : ""}`}>{clock(left)}</span>}
        {v && (
          <button type="button" className="sdk__x" onClick={onDone} aria-label="Close">
            <X />
          </button>
        )}
      </header>
      <p className="sdk__title">{ev.title}</p>

      {!v ? (
        <>
          <p className="sdk__body">{ev.body}</p>
          {ev.kind === "reply" ? (
            <form
              className="sdk__reply"
              onSubmit={(e) => {
                e.preventDefault();
                if (text.trim()) void post({ action: "desk", uid: ev.uid, text });
              }}
            >
              <input
                className="sdk__input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={ev.prompt ?? "Your reply"}
                maxLength={280}
                aria-label={ev.prompt ?? "Your reply"}
              />
              <button type="submit" className="sdk__send" disabled={busy || !text.trim()}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
              </button>
            </form>
          ) : (
            <div className="sdk__choices">
              {ev.choices.map((c) => (
                <button key={c.id} type="button" className={`sdk__choice${pick === c.id ? " is-picked" : ""}`} disabled={busy} onClick={() => answer(c.id)}>
                  {c.text}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="sdk__verdict">
          <p className="sdk__result">
            {v.correct ? <Check aria-hidden /> : <X aria-hidden />}
            {ev.lapsed && !ev.answered ? "No answer in time" : v.correct ? "The right call" : v.score > 0 ? "Part of it" : "Not the right call"}
            <b>
              {v.score}/{v.max}
            </b>
          </p>
          {ev.kind === "reply" ? (
            <>
              {v.text && <p className="sdk__said">“{v.text}”</p>}
              <ul className="sdk__checks">
                {[...v.hits.map((h) => ({ h, ok: true })), ...v.misses.map((h) => ({ h, ok: false }))].map(({ h, ok }) => (
                  <li key={h} className={ok ? "is-ok" : "is-no"}>
                    {ok ? <Check aria-hidden /> : <X aria-hidden />} {h}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            // The right call and, if it differs, the one they made, in full.
            // The other options fold away so the card stays short.
            <>
              <ul className="sdk__why">
                {v.feedback
                  .filter((f) => f.correct || f.id === v.choice)
                  .map((f) => (
                    <li key={f.id} className={`${f.correct ? "is-ok" : ""}${f.id === v.choice ? " is-mine" : ""}`}>
                      <span className="sdk__tag">{f.correct ? (f.id === v.choice ? "Your answer · right" : "The right call") : "Your answer"}</span>
                      <strong>{f.text}</strong>
                      <span>{f.why}</span>
                    </li>
                  ))}
              </ul>
              {v.feedback.some((f) => !f.correct && f.id !== v.choice) && (
                <details className="sdk__more">
                  <summary>Why the other options miss</summary>
                  <ul className="sdk__why">
                    {v.feedback
                      .filter((f) => !f.correct && f.id !== v.choice)
                      .map((f) => (
                        <li key={f.id}>
                          <strong>{f.text}</strong>
                          <span>{f.why}</span>
                        </li>
                      ))}
                  </ul>
                </details>
              )}
            </>
          )}
          <p className="sdk__lesson">
            <LifeBuoy aria-hidden /> <span>{v.lesson}</span>
          </p>
          <div className="sdk__foot">
            <p className="sdk__source">Source: {v.source}</p>
            <button
              type="button"
              className="sdk__coach"
              onClick={() =>
                ask(
                  `On my shift I got this: "${ev.title}". ${ev.body} I ${v.choice ? `chose: "${v.feedback.find((f) => f.id === v.choice)?.text ?? v.choice}"` : v.text ? `replied: "${v.text}"` : "did not answer in time"}. Walk me through how a senior analyst handles this and why.`
                )
              }
            >
              Think it through with Coach
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

// ---- report -----------------------------------------------------------------

export type DeskReport = {
  desk: { title: string; correct: boolean; score: number; max: number; lesson: string }[];
  triage: { score: number; max: number; misses: { opened: string; waiting: string; atSec: number }[] };
  metrics: { timeToAckSec: number | null; timeToResolveSec: number | null; breaches: number; arrived: number };
  timeline: { atSec: number; text: string; tone: "info" | "good" | "bad" }[];
};

const dur = (s: number | null) => (s === null ? "–" : s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`);

/** The after-action review: the desk's numbers, the order of work, the replay, and a debrief. */
export function DeskSummary({ r, headline, totals }: { r: DeskReport; headline: string; totals: string }) {
  const { ask } = useCoach();
  if (!r.metrics) return null;
  return (
    <section className="sdr">
      <div className="sdr__metrics">
        <div>
          <b>{dur(r.metrics.timeToAckSec)}</b>
          <span>Average time to open</span>
          <small>Arrival to first opening</small>
        </div>
        <div>
          <b>{dur(r.metrics.timeToResolveSec)}</b>
          <span>Average time to fix</span>
          <small>Arrival to the fix in the lab</small>
        </div>
        <div>
          <b className={r.metrics.breaches ? "is-bad" : ""}>{r.metrics.breaches}</b>
          <span>Deadlines missed</span>
          <small>of {r.metrics.arrived} that arrived</small>
        </div>
        <div>
          <b className={r.triage.misses.length ? "is-bad" : ""}>
            {r.triage.score}/{r.triage.max}
          </b>
          <span>Severity order</span>
          <small>{r.triage.misses.length ? `${r.triage.misses.length} time${r.triage.misses.length === 1 ? "" : "s"} a higher one waited` : "Highest first, every time"}</small>
        </div>
      </div>

      {r.triage.misses.length > 0 && (
        <ul className="sdr__misses">
          {r.triage.misses.map((m, i) => (
            <li key={i}>
              At {dur(m.atSec)} you opened <strong>{m.opened}</strong> while <strong>{m.waiting}</strong> was waiting
            </li>
          ))}
        </ul>
      )}

      {r.desk.length > 0 && (
        <div className="sdr__desk">
          {r.desk.map((d, i) => (
            <div key={i} className={d.correct ? "is-ok" : "is-no"}>
              {d.correct ? <Check aria-hidden /> : <X aria-hidden />}
              <span>{d.title}</span>
              <b>
                {d.score}/{d.max}
              </b>
            </div>
          ))}
        </div>
      )}

      <details className="sdr__replay">
        <summary>Replay the shift</summary>
        <ol>
          {r.timeline.map((t, i) => (
            <li key={i} className={`is-${t.tone}`}>
              <time>{dur(t.atSec)}</time>
              <span>{t.text}</span>
            </li>
          ))}
        </ol>
      </details>

      <button
        type="button"
        className="sdr__coach"
        onClick={() =>
          ask(
            `Debrief my shift like a senior analyst would. ${headline}. ${totals}. Average time to open ${dur(r.metrics.timeToAckSec)}, to fix ${dur(r.metrics.timeToResolveSec)}, ${r.metrics.breaches} deadlines missed. ${
              r.triage.misses.length ? `I opened lower-severity work while a higher one waited ${r.triage.misses.length} time(s): ${r.triage.misses.map((m) => `${m.opened} before ${m.waiting}`).join("; ")}.` : "I worked the queue in severity order."
            } Desk: ${r.desk.map((d) => `${d.title} ${d.correct ? "handled right" : "handled wrong"}`).join("; ")}. What is the one thing I should change on my next shift, and why?`
          )
        }
      >
        <LifeBuoy aria-hidden /> Debrief with Coach
      </button>
    </section>
  );
}

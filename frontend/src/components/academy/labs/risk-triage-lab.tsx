"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Check, RotateCcw, X } from "lucide-react";
import "./risk-triage-lab.css";

type Cia = "c" | "i" | "a";
type Level = 1 | 2 | 3;

interface Ticket {
  id: string;
  tag: string;
  title: string;
  from: string;
  report: string;
  cia: Cia;
  ciaWhy: string;
  likelihood: Level;
  likelihoodWhy: string;
  impact: Level;
  impactWhy: string;
}

// Listed in the order the queue shows them. The right fix order is by
// likelihood times impact, which is deliberately not this order.
const TICKETS: Ticket[] = [
  {
    id: "printer",
    tag: "A",
    title: "Lobby printer drops offline",
    from: "Riley Kwan, Operations",
    report: "The lobby printer goes offline most afternoons. Visitors cannot print their forms, so the front desk walks them to the printer upstairs.",
    cia: "a",
    ciaWhy: "Nothing leaked and nothing changed. The printer is not there when people need it. That is a lockout.",
    likelihood: 3,
    likelihoodWhy: "It already fails most afternoons. This one is close to certain.",
    impact: 1,
    impactWhy: "There is a working printer upstairs, and no client data or money is involved. It is an annoyance, not a business problem.",
  },
  {
    id: "backup",
    tag: "B",
    title: "File server backup failing for three weeks",
    from: "Alex Rivera, IT",
    report: "The nightly backup of the file server has failed every night for three weeks. The server itself runs fine. Nobody noticed until this morning.",
    cia: "a",
    ciaWhy: "No one can see or change anything they should not. If the server fails, the files cannot come back. That is a lockout waiting to happen.",
    likelihood: 2,
    likelihoodWhy: "The server is healthy today. A disk failure or ransomware is not certain, but every night without a good copy keeps the window open.",
    impact: 3,
    impactWhy: "Every department saves its work on that server. One failure without a backup loses client files for good.",
  },
  {
    id: "folder",
    tag: "C",
    title: "Client balances folder open to the whole firm",
    from: "Devon Brooks, Compliance",
    report: "During a review I opened the Wealth Management share from an intern's account. The client balances spreadsheet opened without a prompt. Every account at the firm can read that folder.",
    cia: "c",
    ciaWhy: "The numbers are still right and the file still opens. The wrong people can see it. That is a leak.",
    likelihood: 3,
    likelihoodWhy: "Every account at the firm can already open it. No skill is needed, only a curious user or one stolen password.",
    impact: 3,
    impactWhy: "Client balances are regulated client data. A leak means telling clients and regulators, and Wealth Management is one of the firm's critical departments.",
  },
  {
    id: "fees",
    tag: "D",
    title: "Operations can edit the fee schedule",
    from: "Jordan Ellis, Finance",
    report: "The fee schedule that sets what clients are billed can be edited by everyone in Operations. Only Finance should change it. I check invoices against it once a month.",
    cia: "i",
    ciaWhy: "The file is not exposed outside the firm and it stays available. The danger is a silent change to the numbers clients are billed on. That is a lie.",
    likelihood: 2,
    likelihoodWhy: "Only one department has the extra access, and a bad change needs a mistake or bad intent from someone inside it.",
    impact: 2,
    impactWhy: "A wrong fee bills clients incorrectly, but Jordan's monthly invoice check limits how long an error runs before someone catches it.",
  },
];

const BY_ID = Object.fromEntries(TICKETS.map((t) => [t.id, t])) as Record<string, Ticket>;
const ANSWER_ORDER = [...TICKETS].sort((a, b) => b.likelihood * b.impact - a.likelihood * a.impact).map((t) => t.id);

const CIA: { key: Cia; label: string; hint: string }[] = [
  { key: "c", label: "Confidentiality", hint: "A leak" },
  { key: "i", label: "Integrity", hint: "A lie" },
  { key: "a", label: "Availability", hint: "A lockout" },
];
const CIA_NAME: Record<Cia, string> = { c: "Confidentiality", i: "Integrity", a: "Availability" };
const LEVELS: { key: Level; label: string }[] = [
  { key: 1, label: "Low" },
  { key: 2, label: "Medium" },
  { key: 3, label: "High" },
];
const LEVEL_NAME: Record<Level, string> = { 1: "Low", 2: "Medium", 3: "High" };
const STEPS = ["Name the failure", "Score the risk", "Rank the fixes", "Debrief"];

interface State {
  step: number;
  cia: Record<string, Cia>;
  likelihood: Record<string, Level>;
  impact: Record<string, Level>;
  order: string[];
  checked: [boolean, boolean, boolean];
}

const START: State = { step: 0, cia: {}, likelihood: {}, impact: {}, order: TICKETS.map((t) => t.id), checked: [false, false, false] };
const STORE = "academy-lab-risk-triage-v1";

const band = (score: number) => (score >= 6 ? "high" : score >= 3 ? "medium" : "low");

function loadSaved(): State {
  if (typeof window === "undefined") return START;
  try {
    const saved = JSON.parse(localStorage.getItem(STORE) ?? "null") as State | null;
    if (saved && Array.isArray(saved.order) && saved.order.length === TICKETS.length && saved.order.every((id) => BY_ID[id])) return saved;
  } catch {}
  return START;
}

// Mounted only once the student opens the lab tab, never in the server
// render, so reading saved progress while initialising state is safe.
export function RiskTriageLab() {
  const [s, setS] = useState<State>(loadSaved);

  useEffect(() => {
    localStorage.setItem(STORE, JSON.stringify(s));
  }, [s]);

  const patch = (p: Partial<State>) => setS((prev) => ({ ...prev, ...p }));
  const check = (i: 0 | 1 | 2) => setS((prev) => ({ ...prev, checked: prev.checked.map((c, j) => (j === i ? true : c)) as State["checked"] }));
  const go = (step: number) => {
    setS((prev) => ({ ...prev, step }));
    document.querySelector(".rt")?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const score = useMemo(() => {
    const cia = TICKETS.filter((t) => s.cia[t.id] === t.cia).length;
    const lik = TICKETS.filter((t) => s.likelihood[t.id] === t.likelihood).length;
    const imp = TICKETS.filter((t) => s.impact[t.id] === t.impact).length;
    const rank = s.order.filter((id, i) => ANSWER_ORDER[i] === id).length;
    return { cia, scoring: lik + imp, rank, total: cia + lik + imp + rank };
  }, [s]);

  const allCia = TICKETS.every((t) => s.cia[t.id]);
  const allScored = TICKETS.every((t) => s.likelihood[t.id] && s.impact[t.id]);
  const reached = [true, s.checked[0], s.checked[1], s.checked[2]];

  return (
    <section className="rt" aria-label="Monday Morning Risk Triage lab">
      <ol className="rt-steps">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              className={`rt-step${s.step === i ? " is-on" : ""}${i < 3 && s.checked[i] ? " is-done" : ""}`}
              disabled={!reached[i]}
              aria-current={s.step === i ? "step" : undefined}
              onClick={() => go(i)}
            >
              <span className="rt-step__n">{i < 3 && s.checked[i] ? <Check aria-hidden="true" /> : i + 1}</span>
              <span className="rt-step__label">{label}</span>
            </button>
          </li>
        ))}
      </ol>

      {s.step === 0 && (
        <div className="rt-body">
          <header className="rt-head">
            <h3>Which job broke?</h3>
            <p>Read each report and pick the part of the CIA triad that failed, or is about to.</p>
          </header>
          <ul className="rt-tickets">
            {TICKETS.map((t) => {
              const pick = s.cia[t.id];
              const done = s.checked[0];
              const right = pick === t.cia;
              return (
                <li key={t.id} className={`rt-ticket${done ? (right ? " is-right" : " is-wrong") : ""}`}>
                  <TicketHead t={t} />
                  <div className="rt-choice rt-choice--cia" role="radiogroup" aria-label={`Which job broke: ${t.title}`}>
                    {CIA.map((c) => (
                      <button
                        key={c.key}
                        type="button"
                        role="radio"
                        aria-checked={pick === c.key}
                        disabled={done}
                        className={done && c.key === t.cia ? "is-answer" : ""}
                        onClick={() => patch({ cia: { ...s.cia, [t.id]: c.key } })}
                      >
                        <b>{c.label}</b>
                        <small>{c.hint}</small>
                      </button>
                    ))}
                  </div>
                  {done && <Verdict right={right} text={right ? t.ciaWhy : `It is ${CIA_NAME[t.cia].toLowerCase()}. ${t.ciaWhy}`} />}
                </li>
              );
            })}
          </ul>
          <footer className="rt-foot">
            {s.checked[0] ? (
              <>
                <p className="rt-tally">
                  <b>{score.cia} of 4</b> named correctly
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(1)}>
                  Continue to scoring
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{TICKETS.filter((t) => s.cia[t.id]).length} of 4 answered</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={!allCia} onClick={() => check(0)}>
                  Check answers
                </button>
              </>
            )}
          </footer>
        </div>
      )}

      {s.step === 1 && (
        <div className="rt-body">
          <header className="rt-head">
            <h3>How likely, and how bad?</h3>
            <p>Rate each ticket. Likelihood is how likely it is to hurt the firm. Impact is how much it costs when it does. Watch where it lands on the matrix.</p>
          </header>
          <div className="rt-score">
            <ul className="rt-tickets">
              {TICKETS.map((t) => {
                const done = s.checked[1];
                const l = s.likelihood[t.id];
                const im = s.impact[t.id];
                const lRight = l === t.likelihood;
                const iRight = im === t.impact;
                return (
                  <li key={t.id} className={`rt-ticket${done ? (lRight && iRight ? " is-right" : " is-wrong") : ""}`}>
                    <TicketHead t={t} compact />
                    <LevelRow
                      label="Likelihood"
                      value={l}
                      answer={done ? t.likelihood : undefined}
                      disabled={done}
                      onPick={(v) => patch({ likelihood: { ...s.likelihood, [t.id]: v } })}
                      name={t.title}
                    />
                    <LevelRow
                      label="Impact"
                      value={im}
                      answer={done ? t.impact : undefined}
                      disabled={done}
                      onPick={(v) => patch({ impact: { ...s.impact, [t.id]: v } })}
                      name={t.title}
                    />
                    {l && im && (
                      <p className={`rt-risk rt-risk--${band(l * im)}`}>
                        Risk score <b>{l * im}</b> of 9
                      </p>
                    )}
                    {done && (
                      <div className="rt-why">
                        <Verdict right={lRight} text={`Likelihood ${LEVEL_NAME[t.likelihood]}. ${t.likelihoodWhy}`} />
                        <Verdict right={iRight} text={`Impact ${LEVEL_NAME[t.impact]}. ${t.impactWhy}`} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <Matrix s={s} showAnswer={s.checked[1]} />
          </div>
          <footer className="rt-foot">
            {s.checked[1] ? (
              <>
                <p className="rt-tally">
                  <b>{score.scoring} of 8</b> ratings match
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(2)}>
                  Continue to ranking
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">{TICKETS.filter((t) => s.likelihood[t.id] && s.impact[t.id]).length} of 4 scored</p>
                <button type="button" className="rt-btn rt-btn--primary" disabled={!allScored} onClick={() => check(1)}>
                  Check ratings
                </button>
              </>
            )}
          </footer>
        </div>
      )}

      {s.step === 2 && (
        <div className="rt-body">
          <header className="rt-head">
            <h3>What do you fix first?</h3>
            <p>Put the tickets in the order you would work them, first at the top. Your own risk scores are shown to help.</p>
          </header>
          <ol className="rt-rank">
            {s.order.map((id, i) => {
              const t = BY_ID[id];
              const mine = (s.likelihood[id] ?? 0) * (s.impact[id] ?? 0);
              const done = s.checked[2];
              const right = ANSWER_ORDER[i] === id;
              const move = (d: -1 | 1) => {
                const next = [...s.order];
                [next[i], next[i + d]] = [next[i + d], next[i]];
                patch({ order: next });
              };
              return (
                <li key={id} className={`rt-rank__row${done ? (right ? " is-right" : " is-wrong") : ""}`}>
                  <span className="rt-rank__pos">{i + 1}</span>
                  <span className="rt-tag">{t.tag}</span>
                  <span className="rt-rank__title">
                    {t.title}
                    {done && !right && <small>Belongs at number {ANSWER_ORDER.indexOf(id) + 1}</small>}
                  </span>
                  <span className={`rt-risk rt-risk--${band(mine)}`}>
                    <b>{mine}</b>
                  </span>
                  <span className="rt-rank__move">
                    <button type="button" aria-label={`Move ${t.title} up`} disabled={done || i === 0} onClick={() => move(-1)}>
                      <ArrowUp aria-hidden="true" />
                    </button>
                    <button type="button" aria-label={`Move ${t.title} down`} disabled={done || i === s.order.length - 1} onClick={() => move(1)}>
                      <ArrowDown aria-hidden="true" />
                    </button>
                  </span>
                </li>
              );
            })}
          </ol>
          {s.checked[2] && (
            <p className="rt-lesson">
              The printer fails more often than anything else in the queue and still ranks last. How often something breaks does not set priority. Likelihood and impact together do.
            </p>
          )}
          <footer className="rt-foot">
            {s.checked[2] ? (
              <>
                <p className="rt-tally">
                  <b>{score.rank} of 4</b> in the right place
                </p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => go(3)}>
                  See the debrief
                </button>
              </>
            ) : (
              <>
                <p className="rt-tally">Use the arrows to reorder</p>
                <button type="button" className="rt-btn rt-btn--primary" onClick={() => check(2)}>
                  Check ranking
                </button>
              </>
            )}
          </footer>
        </div>
      )}

      {s.step === 3 && (
        <div className="rt-body">
          <header className="rt-head rt-head--result">
            <div className={`rt-grade rt-grade--${score.total >= 13 ? "high" : score.total >= 9 ? "medium" : "low"}`}>
              <b>{score.total}</b>
              <small>of 16</small>
            </div>
            <div>
              <h3>{score.total >= 13 ? "Ready for the queue" : score.total >= 9 ? "Solid start" : "Worth another pass"}</h3>
              <p>
                Named {score.cia} of 4 · Rated {score.scoring} of 8 · Ranked {score.rank} of 4
              </p>
            </div>
          </header>
          <ol className="rt-debrief">
            {ANSWER_ORDER.map((id, i) => {
              const t = BY_ID[id];
              const lik = s.likelihood[id];
              const imp = s.impact[id];
              return (
                <li key={id}>
                  <div className="rt-debrief__top">
                    <span className="rt-rank__pos">{i + 1}</span>
                    <span className="rt-tag">{t.tag}</span>
                    <b>{t.title}</b>
                    <span className={`rt-risk rt-risk--${band(t.likelihood * t.impact)}`}>
                      <b>{t.likelihood * t.impact}</b>
                    </span>
                  </div>
                  <dl>
                    <Row label="Failure" yours={s.cia[id] ? CIA_NAME[s.cia[id]] : "None"} answer={CIA_NAME[t.cia]} />
                    <Row label="Likelihood" yours={lik ? LEVEL_NAME[lik] : "None"} answer={LEVEL_NAME[t.likelihood]} />
                    <Row label="Impact" yours={imp ? LEVEL_NAME[imp] : "None"} answer={LEVEL_NAME[t.impact]} />
                    <Row label="Fix order" yours={String(s.order.indexOf(id) + 1)} answer={String(i + 1)} />
                  </dl>
                  <p>{t.ciaWhy}</p>
                </li>
              );
            })}
          </ol>
          <footer className="rt-foot">
            <p className="rt-tally">Start this morning with the client balances folder, then fix the backup.</p>
            <button type="button" className="rt-btn" onClick={() => setS(START)}>
              <RotateCcw aria-hidden="true" /> Try again
            </button>
          </footer>
        </div>
      )}
    </section>
  );
}

function TicketHead({ t, compact }: { t: Ticket; compact?: boolean }) {
  return (
    <div className="rt-ticket__head">
      <span className="rt-tag">{t.tag}</span>
      <div>
        <b>{t.title}</b>
        <small>From {t.from}</small>
        {!compact && <p>{t.report}</p>}
      </div>
    </div>
  );
}

function LevelRow({ label, value, answer, disabled, onPick, name }: { label: string; value?: Level; answer?: Level; disabled: boolean; onPick: (v: Level) => void; name: string }) {
  return (
    <div className="rt-level">
      <span>{label}</span>
      <div className="rt-choice" role="radiogroup" aria-label={`${label}: ${name}`}>
        {LEVELS.map((l) => (
          <button
            key={l.key}
            type="button"
            role="radio"
            aria-checked={value === l.key}
            disabled={disabled}
            className={answer === l.key ? "is-answer" : ""}
            onClick={() => onPick(l.key)}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Verdict({ right, text }: { right: boolean; text: string }) {
  return (
    <p className={`rt-verdict${right ? " is-right" : " is-wrong"}`}>
      {right ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}
      <span>{text}</span>
    </p>
  );
}

function Row({ label, yours, answer }: { label: string; yours: string; answer: string }) {
  const right = yours === answer;
  return (
    <div className={right ? "is-right" : "is-wrong"}>
      <dt>{label}</dt>
      <dd>
        {right ? (
          <>
            <Check aria-hidden="true" /> {answer}
          </>
        ) : (
          <>
            <s>{yours}</s> {answer}
          </>
        )}
      </dd>
    </div>
  );
}

// Likelihood across, impact up. Each ticket lands where the student put it,
// with a ring where it belongs once the ratings are checked.
function Matrix({ s, showAnswer }: { s: State; showAnswer: boolean }) {
  const rows: Level[] = [3, 2, 1];
  const cols: Level[] = [1, 2, 3];
  return (
    <figure className="rt-matrix" aria-label="Risk matrix">
      <div className="rt-matrix__grid">
        <span className="rt-matrix__axis rt-matrix__axis--y">Impact</span>
        {rows.map((imp) => (
          <div key={imp} className="rt-matrix__row">
            <span className="rt-matrix__lab">{LEVEL_NAME[imp]}</span>
            {cols.map((lik) => {
              const here = TICKETS.filter((t) => s.likelihood[t.id] === lik && s.impact[t.id] === imp);
              const ghosts = showAnswer ? TICKETS.filter((t) => t.likelihood === lik && t.impact === imp) : [];
              return (
                <div key={lik} className={`rt-cell rt-cell--${band(lik * imp)}`}>
                  <span className="rt-cell__n">{lik * imp}</span>
                  <div className="rt-cell__dots">
                    {here.map((t) => (
                      <span key={t.id} className="rt-dot">
                        {t.tag}
                      </span>
                    ))}
                    {ghosts
                      .filter((t) => !here.includes(t))
                      .map((t) => (
                        <span key={`g-${t.id}`} className="rt-dot rt-dot--ghost" title="Where it belongs">
                          {t.tag}
                        </span>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div className="rt-matrix__row rt-matrix__row--foot">
          <span className="rt-matrix__lab" />
          {cols.map((c) => (
            <span key={c} className="rt-matrix__lab">
              {LEVEL_NAME[c]}
            </span>
          ))}
        </div>
        <span className="rt-matrix__axis rt-matrix__axis--x">Likelihood</span>
      </div>
      {showAnswer && <figcaption>Dashed rings show where a ticket belongs when your rating differs.</figcaption>}
    </figure>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useCoach } from "@/components/academy/coach-context";
import { academyFetch, RESULTS_CHANGED_EVENT, useResults } from "@/lib/academy-client";
import { challengeHref, missionHref, MISSION_CATALOG, type MissionCatalogEntry } from "@/lib/academy-missions";
import {
  clearResults,
  LEVELS,
  missionPoints,
  SKILLS,
  scoreTone,
  skillNeedsWork,
  skillSolid,
  summarize,
  type MissionResult,
  type Results,
  type Summary,
} from "@/lib/academy-score";

const CHALLENGES: { key: MissionCatalogEntry["challenge"]; label: string; blurb: string }[] = [
  { key: "day-one", label: "Operation Day One", blurb: "Find the facts in the directory." },
  { key: "ticket-queue", label: "Ticket Queue", blurb: "Help desk tickets you change in the directory." },
  { key: "alert-queue", label: "The 2 AM Login", blurb: "SIEM alert and log analysis." },
];

type Tone = "good" | "warn" | "bad" | "live" | "none";

function toneOfScore(score: number | null): Tone {
  return scoreTone(score);
}

function missionStatus(r: MissionResult | undefined): { tone: Tone; label: string; points: number | null; needsHelp: boolean } {
  const points = missionPoints(r);
  if (!r) return { tone: "none", label: "Not started", points, needsHelp: false };
  if (r.solved) {
    const tries = r.wrong + 1;
    const clean = tries === 1 && !r.hint;
    return {
      tone: clean ? "good" : "warn",
      label: tries === 1 ? (r.hint ? "Solved with hint" : "First try") : `${tries} tries`,
      points,
      needsHelp: !clean,
    };
  }
  if (r.flagged) {
    if (r.wrong >= 3) return { tone: "bad", label: "Flagged · missed", points, needsHelp: true };
    return { tone: "warn", label: r.wrong ? `Flagged · ${r.wrong} wrong` : "Flagged", points, needsHelp: true };
  }
  if (r.wrong >= 3) return { tone: "bad", label: "Missed", points, needsHelp: true };
  return { tone: "live", label: `Open · ${r.wrong} wrong`, points, needsHelp: r.wrong > 0 };
}

function joinNames(names: string[]) {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

const CAN: Record<Summary["skills"][number]["key"], string> = {
  accounts: "look up who is in a group and what access that group actually grants",
  directory: "find an account or computer in the right folder",
  troubleshooting: "check the directory before you take the action a ticket names",
  security: "read an alert and decide the first response without wiping evidence",
};

const WORK: Record<Summary["skills"][number]["key"], string> = {
  accounts: "open Member Of and count before you add or remove anyone",
  directory: "walk Departments and AccessLevels until you can find an object without searching",
  troubleshooting: "open the account first and see if the caller is actually right",
  security: "start The 2 AM Login and read the log before you change anything",
};

function verdict(s: Summary) {
  if (s.finished === 0) {
    return "None of the competencies have work on them yet. Start Operation Day One. Look people up in the directory and we will see what you can already do.";
  }
  const strong = s.skills.filter((k) => skillSolid(k.score));
  const weak = s.skills.filter((k) => skillNeedsWork(k.score));
  const strongNames = joinNames(strong.map((k) => k.label));
  const weakNames = joinNames(weak.map((k) => k.label));
  const can = strong.slice(0, 2).map((k) => CAN[k.key]);
  const next = weak[0] ? WORK[weak[0].key] : null;
  if (s.level === "ready" && weak.length === 0) {
    return `You are competent in ${strongNames}. You can ${joinNames(can)}. Redo one ticket on your own lab with the hint closed.`;
  }
  if (strong.length === 0) {
    return `You have started, but none of the competencies are solid yet. ${weakNames} still need work. ${next ? `Next, ${next}.` : ""}`.trim();
  }
  if (weak.length === 0) {
    return `You are competent in ${strongNames}. You can ${joinNames(can)}. Finish the remaining missions so this is a full rating.`;
  }
  return `You are competent in ${strongNames}. You can ${joinNames(can)}. ${weakNames} still need${weak.length === 1 ? "s" : ""} work. ${next ? `Next, ${next}.` : ""}`;
}

function ticketOf(title: string) {
  const m = title.match(/^(.*?)\s*\((INC-\d+)\)$/);
  return m ? { name: m[1], ticket: m[2] } : { name: title, ticket: null };
}

function MissionStrip({ results }: { results: Results }) {
  return (
    <div className="rd-strip" aria-label="Mission results">
      {CHALLENGES.map((ch) => (
        <div key={ch.key} className="rd-strip__group">
          {Object.values(MISSION_CATALOG)
            .filter((m) => m.challenge === ch.key)
            .map((m) => (
              <span key={m.id} className={`rd-strip__cell rd-tone-${missionStatus(results[m.id]).tone}`} title={m.title} />
            ))}
        </div>
      ))}
    </div>
  );
}

export function ReadinessDashboard() {
  const results = useResults();
  const { ask } = useCoach();
  const s = summarize(results);
  const lv = LEVELS[s.level];
  const scoreTone: Tone = s.finished === 0 ? "none" : s.level === "ready" ? "good" : s.level === "almost" ? "warn" : s.level === "practice" ? "bad" : "live";
  const focusKey = s.finished > 0 ? s.focus[0]?.key : undefined;

  function reset() {
    if (!window.confirm("Reset your readiness score? This clears every mission result.")) return;
    clearResults();
    window.dispatchEvent(new Event(RESULTS_CHANGED_EVENT));
    academyFetch("/academy/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: {} }),
    }).catch(() => {});
  }

  return (
    <div className="rd">
      {/* Masthead */}
      <header className="rd-mast">
        <div className="rd-hero">
          <div className="rd-hero__score">
            <p className="rd-kicker">Readiness</p>
            <p className={`rd-bignum rd-text-${scoreTone}`}>
              {s.finished === 0 ? "––" : s.overall}
              <span>/100</span>
            </p>
            <p className={`rd-stamp rd-text-${scoreTone}`}>{lv.label}</p>
          </div>

          <div className="rd-hero__verdict">
            <h1>Are you ready for the job?</h1>
            <blockquote>{verdict(s)}</blockquote>
            <div className="rd-sign">
              <span>PurveX Coach, senior help desk lead</span>
              <button
                type="button"
                className="rd-cta"
                onClick={() =>
                  ask(
                    s.finished === 0
                      ? "I'm just getting started. How should I start Operation Day One?"
                      : "What should I work on next. Say why. Do not read my report back to me."
                  )
                }
              >
                {s.finished === 0 ? "Brief me on day one" : "Build my study plan"} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="rd-evidence">
          <div className="rd-evidence__head">
            <span>
              <strong>{s.finished}</strong> of {s.total} missions on record
            </span>
            <span className="rd-legend">
              <span><i className="rd-tone-good" />Clean</span>
              <span><i className="rd-tone-warn" />Struggled</span>
              <span><i className="rd-tone-bad" />Missed</span>
              <span><i className="rd-tone-live" />Open</span>
            </span>
          </div>
          <MissionStrip results={results} />
        </div>
      </header>

      {/* Competencies */}
      <section className="rd-sec">
        <div className="rd-sec__head">
          <span className="rd-sec__n">01</span>
          <h2>Competencies</h2>
          <p>Measured against the bar for a Tier 1 hire.</p>
        </div>
        <div className="rd-ledger">
          {s.skills.map((k) => {
            const tone = toneOfScore(k.score);
            return (
              <div key={k.key} className={`rd-row ${focusKey === k.key ? "rd-row--focus" : ""}`}>
                <div className="rd-row__name">
                  <strong>
                    {k.label}
                    {focusKey === k.key && <em>Focus</em>}
                  </strong>
                  <span>
                    {k.done} of {k.total} missions
                  </span>
                </div>
                <div className="rd-scale">
                  <div className={`rd-scale__fill rd-bg-${tone}`} style={{ width: `${k.score ?? 0}%` }} />
                  <i style={{ left: "65%" }} data-mark="Almost · 65" />
                  <i style={{ left: "85%" }} data-mark="Ready · 85" />
                </div>
                <p className={`rd-row__score rd-text-${tone}`}>
                  {k.score === null ? "—" : k.score}
                  {k.score !== null && <small>%</small>}
                </p>
                <button
                  type="button"
                  className="rd-link"
                  onClick={() =>
                    ask(
                      `Help me get better at ${k.label} in my own lab. Do not read a score back. Do not give mission answers.`
                    )
                  }
                >
                  Discuss <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Mission log */}
      <section className="rd-sec">
        <div className="rd-sec__head">
          <span className="rd-sec__n">02</span>
          <h2>Mission log</h2>
          <p>Every attempt, as it will look to a hiring manager.</p>
        </div>
        {CHALLENGES.map((ch) => {
          const list = Object.values(MISSION_CATALOG).filter((m) => m.challenge === ch.key);
          const done = list.filter((m) => missionPoints(results[m.id]) !== null).length;
          return (
            <div key={ch.key} className="rd-log">
              <div className="rd-log__head">
                <div>
                  <h3>{ch.label}</h3>
                  <p>{ch.blurb}</p>
                </div>
                <span className="rd-log__count">
                  {done}/{list.length}
                </span>
                <Link href={challengeHref(ch.key, results)} className="rd-link">
                  {done === 0 ? "Start" : done === list.length ? "Review" : "Continue"} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <ol>
                {list.map((m, i) => {
                  const st = missionStatus(results[m.id]);
                  const { name, ticket } = ticketOf(m.title);
                  return (
                    <li key={m.id} className="rd-log__row">
                      <span className="rd-log__i">{String(i + 1).padStart(2, "0")}</span>
                      <span className={`rd-dot rd-tone-${st.tone}`} />
                      <Link href={missionHref(m.id)} className="rd-log__title">
                        {name}
                        {ticket && <code>{ticket}</code>}
                      </Link>
                      <span className="rd-log__skill">{SKILLS[m.skill].label}</span>
                      <span className={`rd-log__result rd-text-${st.tone}`}>{st.label}</span>
                      <span className="rd-log__pts">{st.points === null ? "" : st.points}</span>
                      <span className="rd-log__act">
                        {st.needsHelp && (
                          <button
                            type="button"
                            className="rd-link"
                            onClick={() =>
                              ask(`Help me understand where I went wrong on "${m.title}". Guide me with questions, don't give me the answer.`)
                            }
                          >
                            Ask why
                          </button>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          );
        })}
      </section>

      <footer className="rd-foot">
        <span>Scores update the moment you submit a mission.</span>
        {s.finished > 0 && (
          <button type="button" onClick={reset}>
            Reset evaluation
          </button>
        )}
      </footer>
    </div>
  );
}

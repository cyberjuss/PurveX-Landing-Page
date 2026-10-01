"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useCoach } from "@/components/academy/coach-context";
import { academyFetch, RESULTS_CHANGED_EVENT, useResults } from "@/lib/academy-client";
import { challengeHref, challengeTabHref, missionHref, MISSION_CATALOG, type MissionCatalogEntry } from "@/lib/academy-missions";
import { isLockedHref } from "@/lib/academy-locks";
import {
  clearResults,
  LAB_CATALOG,
  labPoints,
  LEGACY_LAB_PASS_POINTS,
  LEVELS,
  missionPoints,
  SCORE_READY,
  SKILLS,
  scoreTone,
  skillCompetent,
  skillWeak,
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
    // Flagged but not finished: still open, and not counted in the score.
    return { tone: "live", label: r.wrong ? `Flagged · ${r.wrong} wrong` : "Flagged", points, needsHelp: true };
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
  logs: "count and time-line sign-in events to name the pattern behind them",
  access: "work out what a person can open from their groups and the folder's permissions",
  risk: "name what failed and rank fixes by likelihood and impact",
};

const WORK: Record<Summary["skills"][number]["key"], string> = {
  accounts: "open Member Of and count before you add or remove anyone",
  directory: "walk Departments and AccessLevels until you can find an object without searching",
  troubleshooting: "open the account first and see if the caller is actually right",
  security: "start The 2 AM Login and read the log before you change anything",
  logs: "open the Read the Sign-In Log lab and count before you name a pattern",
  access: "open the Who Can Open This? lab and check both share and NTFS permissions",
  risk: "open the Monday Morning Risk Triage lab and score likelihood and impact before you rank",
};

function verdict(s: Summary) {
  if (s.finished === 0) {
    return "None of the competencies have work on them yet. Start Operation Day One. Look people up in the directory and we will see what you can already do.";
  }
  // A skill is only called competent or weak once half its missions are finished.
  const strong = s.skills.filter(skillCompetent);
  const weak = s.skills.filter(skillWeak);
  const early = s.skills.filter((k) => k.score !== null && !k.rated);
  const untouched = s.skills.filter((k) => k.score === null);
  const strongNames = joinNames(strong.map((k) => k.label));
  const weakNames = joinNames(weak.map((k) => k.label));
  const can = strong.slice(0, 2).map((k) => CAN[k.key]);
  const nextSkill = weak[0] ?? early[0] ?? untouched[0];
  const next = nextSkill ? ` Next, ${WORK[nextSkill.key]}.` : "";
  if (s.level === "ready" && weak.length === 0) {
    return `You are competent in ${strongNames}. You can ${joinNames(can)}. Redo one ticket on your own lab with the hint closed.`;
  }
  if (strong.length === 0 && weak.length === 0) {
    return `You have started, but no competency has enough work finished to rate yet. Finish at least half the missions and labs in one to get a rating.${next}`;
  }
  const parts: string[] = [];
  if (strong.length) parts.push(`You are competent in ${strongNames}. You can ${joinNames(can)}.`);
  if (weak.length) parts.push(`${weakNames} still need${weak.length === 1 ? "s" : ""} work.`);
  if (!weak.length) parts.push("Finish the remaining missions and labs so this is a full rating.");
  return parts.join(" ") + next;
}

/** A scored browser lab: its first finished score, or open. */
function labStatus(r: MissionResult | undefined): { tone: Tone; label: string; points: number | null } {
  const points = labPoints(r);
  if (points === null) return { tone: "none", label: "Not started", points };
  const legacy = typeof r?.pts !== "number";
  const label = legacy ? "Passed · score not saved" : r?.solved ? "Passed" : "Not passed";
  return { tone: points >= SCORE_READY ? "good" : points >= LEGACY_LAB_PASS_POINTS ? "warn" : "bad", label, points };
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
      <div className="rd-strip__group">
        {LAB_CATALOG.map((l) => (
          <span key={l.id} className={`rd-strip__cell rd-tone-${labStatus(results[l.id]).tone}`} title={l.title} />
        ))}
      </div>
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
      body: JSON.stringify({ results: {}, reset: "all" }),
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
            {s.accuracy !== null && (
              <p className="rd-acc">
                Accuracy <strong>{s.accuracy}%</strong> on what you have finished, {s.finished} of {s.total}
              </p>
            )}
          </div>

          <div className="rd-hero__verdict">
            <h1>Are you ready for the job?</h1>
            <blockquote>{verdict(s)}</blockquote>
            <div className="rd-sign">
              <span>PurveX Coach, Senior Help Desk Lead</span>
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
              <strong>{s.finished}</strong> of {s.total} missions and labs on record
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
                    {k.done} of {k.total} done
                    {k.done > 0 && !k.rated && " · too early to rate"}
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
          const locked = isLockedHref(challengeTabHref(ch.key));
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
                {locked ? (
                  <span className="rd-link">Locked</span>
                ) : (
                  <Link href={challengeHref(ch.key, results)} className="rd-link">
                    {done === 0 ? "Start" : done === list.length ? "Review" : "Continue"} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
              <ol>
                {list.map((m, i) => {
                  const st = missionStatus(results[m.id]);
                  const { name, ticket } = ticketOf(m.title);
                  return (
                    <li key={m.id} className="rd-log__row">
                      <span className="rd-log__i">{String(i + 1).padStart(2, "0")}</span>
                      <span className={`rd-dot rd-tone-${st.tone}`} />
                      {locked ? (
                        <span className="rd-log__title">
                          {name}
                          {ticket && <code>{ticket}</code>}
                        </span>
                      ) : (
                        <Link href={missionHref(m.id)} className="rd-log__title">
                          {name}
                          {ticket && <code>{ticket}</code>}
                        </Link>
                      )}
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
        <div className="rd-log">
          <div className="rd-log__head">
            <div>
              <h3>Scored labs</h3>
              <p>Your first finished score counts. Replays do not change it.</p>
            </div>
            <span className="rd-log__count">
              {LAB_CATALOG.filter((l) => labPoints(results[l.id]) !== null).length}/{LAB_CATALOG.length}
            </span>
          </div>
          <ol>
            {LAB_CATALOG.map((l, i) => {
              const st = labStatus(results[l.id]);
              const locked = isLockedHref(l.href);
              return (
                <li key={l.id} className="rd-log__row">
                  <span className="rd-log__i">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`rd-dot rd-tone-${st.tone}`} />
                  {locked ? (
                    <span className="rd-log__title">{l.title}</span>
                  ) : (
                    <Link href={l.href} className="rd-log__title">
                      {l.title}
                    </Link>
                  )}
                  <span className="rd-log__skill">{SKILLS[l.skill].label}</span>
                  <span className={`rd-log__result rd-text-${st.tone}`}>{st.label}</span>
                  <span className="rd-log__pts">{st.points === null ? "" : st.points}</span>
                  <span className="rd-log__act" />
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <footer className="rd-foot">
        <span>Scores update the moment you submit a mission or finish a lab.</span>
        {s.finished > 0 && (
          <button type="button" onClick={reset}>
            Reset evaluation
          </button>
        )}
      </footer>
    </div>
  );
}

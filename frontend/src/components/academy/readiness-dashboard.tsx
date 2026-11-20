"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useCoach } from "@/components/academy/coach-context";
import { academyFetch, RESULTS_CHANGED_EVENT, useResults } from "@/lib/academy-client";
import { challengeHref, challengeTabHref, missionHref, MISSION_CATALOG, type MissionCatalogEntry } from "@/lib/academy-missions";
import { isLockedHref } from "@/lib/academy-locks";
import { RankEmblem } from "@/components/academy/rank-emblem";
import { currentRank, rankIndex, RANKS } from "@/lib/academy-badges";
import { badgeInitials, competencyBadges, TIER_LABEL, type CompetencyBadge } from "@/lib/academy-competencies";
import {
  clearResults,
  LAB_CATALOG,
  labPoints,
  LEGACY_LAB_PASS_POINTS,
  LEVELS,
  missionPoints,
  SCORE_READY,
  summarize,
  type MissionResult,
  type Results,
  type Summary,
} from "@/lib/academy-score";

// Every challenge a student can actually reach, in the order they meet them.
// This used to list only three groups from before Phase 2 existed, so every
// mission added since (Wire, Crypto, the Client Data Review, Who Can Open the
// Compliance Case Files, and all four Phase 2 campaigns) never got its own
// row here even though it already counted toward the overall score.
const CHALLENGES: { key: MissionCatalogEntry["challenge"]; label: string; blurb: string }[] = [
  { key: "weekend-incident-report", label: "The Weekend Incident Report", blurb: "Find and fix a confidentiality, integrity and availability failure." },
  { key: "tuesday-after-breach", label: "Tuesday After the Breach", blurb: "Decode, hash, crack and contain on a real IT desk morning." },
  { key: "network-change", label: "The Three-Minute Job", blurb: "Trace a cron job leaking a password, and shut it down the right way." },
  { key: "access-review", label: "The Quarterly Access Review", blurb: "Find and remove access that should not exist." },
  { key: "day-one", label: "Operation Day One", blurb: "Find the facts in the directory." },
  { key: "ticket-queue", label: "Ticket Queue", blurb: "Help desk tickets you change in the directory." },
  { key: "client-data", label: "The Client Data Review", blurb: "Review what your own shares hold on real clients." },
  { key: "credential-campaign", label: "The Credential Campaign", blurb: "A password-spray intrusion, start to finish." },
  { key: "phishing-chain", label: "The Phishing Chain", blurb: "A phishing attachment, start to finish." },
  { key: "open-door", label: "The Open Door", blurb: "A forgotten firewall rule, exploited and closed." },
  { key: "keys-to-the-domain", label: "The Keys to the Domain", blurb: "Kerberoasting and DCSync, the two techniques CISA names most." },
];

type Tone = "good" | "warn" | "bad" | "live" | "none";

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

function verdict(s: Summary, badges: CompetencyBadge[]) {
  if (s.finished === 0) {
    return "Nothing is on record yet. Start Operation Day One and look people up in the directory to see what you can already do.";
  }
  const strong = badges.filter((b) => b.tier === "proficient" || b.tier === "verified");
  // The competency closest to its next tier is the quickest win.
  const next = badges.filter((b) => b.tier !== "verified" && b.next).sort((a, b) => b.proven / b.total - a.proven / a.total)[0];
  const nextLine = next?.next ? ` Next, ${next.title}: ${next.next.charAt(0).toLowerCase()}${next.next.slice(1)}` : "";
  if (s.level === "ready" && strong.length === badges.length) {
    return `You are proficient in all ${badges.length} competencies. Redo one ticket on your own lab with the hint closed.`;
  }
  if (!strong.length) return `You have started, but no competency is proficient yet.${nextLine}`;
  return `You are proficient in ${joinNames(strong.map((b) => b.title))}.${nextLine}`;
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

function RankAndBadges({ results, badges }: { results: Results; badges: CompetencyBadge[] }) {
  const held = rankIndex(results);
  const rank = currentRank(results);
  const earned = badges.filter((b) => b.tier).length;
  return (
    <>
    <section className="rd-sec" id="rank">
      <div className="rd-sec__head">
        <span className="rd-sec__n">01</span>
        <h2>Rank</h2>
        <p>Your title on the job ladder.</p>
      </div>
      <div className="rb-rank">
        <div className="rb-rank__now">
          <span className="rd-kicker">Current rank</span>
          <strong>
            {rank && <RankEmblem rank={rank} ready={summarize(results).level === "ready"} size={30} />}
            {rank ? rank.title : "Not ranked yet"}
          </strong>
          <span>{RANKS[held]?.soon ? "The next rank opens with the next phase." : RANKS[held] ? `Next: ${RANKS[held].title}. ${RANKS[held].earn}` : "You hold the top rank open today."}</span>
        </div>
        <ol className="rb-ladder" aria-label="Rank ladder">
          {RANKS.map((r, i) => (
            <li key={r.id} className={i < held ? "is-held" : r.soon ? "is-soon" : ""} aria-current={i === held - 1 ? "step" : undefined}>
              <i aria-hidden />
              <span>{r.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <section className="rd-sec" id="competencies">
      <div className="rd-sec__head">
        <span className="rd-sec__n">02</span>
        <h2>Competencies</h2>
        <p>
          The core skills a help desk or SOC job asks for, rated from the work you prove in your lab. {earned} of {badges.length} earned. Proficient
          and Verified ones show on your portfolio.
        </p>
      </div>
      <ul className="rb-grid">
        {badges.map((b) => {
          const status = b.tier ? TIER_LABEL[b.tier] : b.proven > 0 ? "In progress" : "Not started";
          return (
            <li key={b.id} className={`rb-badge${b.tier ? ` is-${b.tier}` : ""}`}>
              <div className="rb-badge__top">
                <span className="rb-badge__seal" aria-hidden>
                  {badgeInitials(b.title)}
                </span>
                <div>
                  <strong>{b.title}</strong>
                  <em>{status}</em>
                </div>
              </div>
              <p className="rb-badge__why">{b.why}</p>
              <div
                className="rb-meter"
                role="img"
                aria-label={`${b.proven} of ${b.total} tasks proven`}
                style={{ ["--pct" as string]: `${Math.round((b.proven / b.total) * 100)}%` }}
              >
                <i />
                <b style={{ left: `${(Math.ceil(b.total / 2) / b.total) * 100}%` }} title="Proficient" />
              </div>
              <p className="rb-badge__foot">
                <span>
                  {b.proven} of {b.total} tasks proven
                </span>
                {b.next && <small>{b.next}</small>}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
    </>
  );
}

export function ReadinessDashboard() {
  const results = useResults();
  // Rated on the server from the portfolio's own task status, so a badge here
  // is the same badge an employer sees. Every skill starts unearned until it loads.
  const [badges, setBadges] = useState<CompetencyBadge[]>(() => competencyBadges([]));
  useEffect(() => {
    let live = true;
    academyFetch("/academy/api/proof")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { competencies?: CompetencyBadge[] } | null) => {
        if (live && d?.competencies?.length) setBadges(d.competencies);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  const { ask } = useCoach();
  const s = summarize(results);
  const lv = LEVELS[s.level];
  const scoreTone: Tone = s.finished === 0 ? "none" : s.level === "ready" ? "good" : s.level === "almost" ? "warn" : s.level === "practice" ? "bad" : "live";
  // The mission log used to show every row of every challenge at once, which
  // read fine back when there were three challenges and unreadable once
  // readiness started counting every real one. Each group opens on its own
  // now, collapsed until asked for, so the page is thirteen compact lines to
  // scan instead of a hundred rows to scroll past.
  const [openLog, setOpenLog] = useState<Record<string, boolean>>({});
  const logOpen = (key: string) => openLog[key] === true;
  const toggleLog = (key: string) => setOpenLog((prev) => ({ ...prev, [key]: !prev[key] }));

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
            <blockquote>{verdict(s, badges)}</blockquote>
            <div className="rd-sign">
              <span>PurveX Coach, Senior Help Desk Lead</span>
              <button
                type="button"
                className="rd-cta"
                onClick={() =>
                  ask(
                    s.finished === 0
                      ? "I'm just getting started. How should I start Operation Day One?"
                      : "What should I work on next, and why? Do not read my report back to me."
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

      {/* Rank and competencies */}
      <RankAndBadges results={results} badges={badges} />

      {/* Mission log */}
      <section className="rd-sec">
        <div className="rd-sec__head">
          <span className="rd-sec__n">03</span>
          <h2>Mission log</h2>
          <p>Every attempt, as it will look to a hiring manager.</p>
        </div>
        {CHALLENGES.map((ch) => {
          const list = Object.values(MISSION_CATALOG).filter((m) => m.challenge === ch.key);
          const done = list.filter((m) => missionPoints(results[m.id]) !== null).length;
          const locked = isLockedHref(challengeTabHref(ch.key));
          const open = logOpen(ch.key);
          return (
            <div key={ch.key} className="rd-log">
              <div className="rd-log__head">
                {/* The heading holds the button, not the other way round: a button
                    may only contain inline content, and a heading inside one is lost
                    to screen readers. */}
                <h3 className="rd-log__h">
                  <button type="button" className="rd-log__toggle" onClick={() => toggleLog(ch.key)} aria-expanded={open}>
                    <ChevronDown className={`rd-log__chevron h-4 w-4 ${open ? "" : "-rotate-90"}`} aria-hidden />
                    <span>
                      <span className="rd-log__title">{ch.label}</span>
                      <span className="rd-log__blurb">{ch.blurb}</span>
                    </span>
                  </button>
                </h3>
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
              {open && (
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
              )}
            </div>
          );
        })}
        {LAB_CATALOG.length > 0 && (
        <div className="rd-log">
          <div className="rd-log__head">
            <h3 className="rd-log__h">
              <button type="button" className="rd-log__toggle" onClick={() => toggleLog("labs")} aria-expanded={logOpen("labs")}>
                <ChevronDown className={`rd-log__chevron h-4 w-4 ${logOpen("labs") ? "" : "-rotate-90"}`} aria-hidden />
                <span>
                  <span className="rd-log__title">Scored labs</span>
                  <span className="rd-log__blurb">Your first finished score counts, so later replays do not change it.</span>
                </span>
              </button>
            </h3>
            <span className="rd-log__count">
              {LAB_CATALOG.filter((l) => labPoints(results[l.id]) !== null).length}/{LAB_CATALOG.length}
            </span>
          </div>
          {logOpen("labs") && (
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
                  <span className={`rd-log__result rd-text-${st.tone}`}>{st.label}</span>
                  <span className="rd-log__pts">{st.points === null ? "" : st.points}</span>
                  <span className="rd-log__act" />
                </li>
              );
            })}
          </ol>
          )}
        </div>
        )}
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

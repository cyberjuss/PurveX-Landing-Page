"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { HoldCard } from "./hold-card";
import { CoachShowcase, COACH_CSS } from "./coach-showcase";
import { PG_CSS } from "./page-skin";
import { TrainingHero } from "./training-hero";

/* Cybersecurity Training. Same skin as the home page (page-skin.ts).
   The syllabus is passed in by the route from the Academy portal's own
   content, and the skills, thresholds and coach modes come from the same
   modules the portal runs on, so this page describes the course that exists. */

export type CourseOutline = {
  label: string;
  title: string;
  entries: { title: string; summary: string; live: boolean; lessons: string[] }[];
}[];

const LAB_LINES = [
  "Password policy checked",
  "PurveX Financial built",
  "Users, OUs, and groups are in",
  "Ticket queue planted",
  "Snapshot sent",
];

const TICKET_BEATS = [
  { status: "Open", line: "Open the account before you change anything." },
  { status: "Waiting", line: "The portal is reading the latest snapshot." },
  { status: "Proven", line: "The directory shows the unlock." },
];

function LabCard() {
  const [n, setN] = useState(LAB_LINES.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Starts full, so the first tick restarts the build from the top.
    const id = window.setInterval(() => {
      setN((v) => (v >= LAB_LINES.length ? 0 : v + 1));
    }, 800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <article className="tr-card" aria-hidden="true">
      <header><span>Build this lab</span><em>Linked</em></header>
      <p className="tr-card__file">Build-Environment.ps1</p>
      <ol>
        {LAB_LINES.map((line, i) => (
          <li key={line} data-on={i < n ? "1" : "0"}>{line}</li>
        ))}
      </ol>
      <footer>
        <b data-on={n >= LAB_LINES.length ? "1" : "0"}>{n >= LAB_LINES.length ? "Coach is syncing" : "Building"}</b>
        <span>{n >= LAB_LINES.length ? "12s ago" : ""}</span>
        {n >= LAB_LINES.length ? <em>Verified</em> : null}
      </footer>
    </article>
  );
}

function TicketLive() {
  const [i, setI] = useState(0);
  const beat = TICKET_BEATS[i];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % TICKET_BEATS.length), 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <article className="tr-card" aria-hidden="true">
      <header><span>INC-1042</span><em key={beat.status}>{beat.status}</em></header>
      <h3>Locked out</h3>
      <dl>
        <div><dt>Account</dt><dd>riley.kwan</dd></div>
        <div><dt>Host</dt><dd>OPS-WKS03</dd></div>
        <div><dt>Event</dt><dd>4740</dd></div>
        <div><dt>Queue</dt><dd>Ticket queue</dd></div>
      </dl>
      <p>{beat.line}</p>
    </article>
  );
}

function AlertCard() {
  return (
    <article className="tr-card" aria-hidden="true">
      <header><span>INC-1046</span><em>Crit</em></header>
      <h3>The 2 AM login</h3>
      <ol className="tr-log">
        <li><b>02:11</b><span>4624</span><span>alex.rivera</span><span>DC01</span></li>
        <li><b>02:11</b><span>4624</span><span>Type</span><span>Interactive</span></li>
        <li><b>02:12</b><span>4672</span><span>Privileges</span><span>Assigned</span></li>
      </ol>
      <p>Five missions on this alert. The log is theirs.</p>
    </article>
  );
}

function DrillCard() {
  return (
    <article className="tr-card" aria-hidden="true">
      <header><span>Daily drill</span><em>Standard</em></header>
      <p className="tr-card__file">From their own lab</p>
      <div className="tr-timer">
        <b>2:14</b>
        <span>of 3:00 · question 2 of 5</span>
        <i />
      </div>
      <ol className="tr-levels">
        <li>Foundation</li>
        <li data-on="1">Standard</li>
        <li>Hard</li>
        <li>Expert</li>
      </ol>
      <footer>
        <b>Weekly CTF</b>
        <span>Their Security log</span>
      </footer>
    </article>
  );
}

function ScoreCard() {
  const bars = [
    ["Accounts and groups", 92],
    ["Directory navigation", 78],
    ["Troubleshooting", 88],
    ["Security", 61],
  ] as const;
  return (
    <article className="tr-card" aria-hidden="true">
      <header><span>Readiness</span><em>Almost</em></header>
      <p className="tr-score">72</p>
      <ol className="tr-bars">
        {bars.map(([name, value]) => (
          <li key={name}>
            <span>{name}</span>
            <b>{value}</b>
            <i style={{ width: `${value}%` }} />
          </li>
        ))}
      </ol>
      <footer>
        <span>Reset asks before it clears anything</span>
      </footer>
    </article>
  );
}

function PhaseMap({ outline }: { outline: CourseOutline }) {
  const [i, setI] = useState(0);
  const phase = outline[i];

  return (
    <div className="tr-map">
      <div className="tr-map__nav" role="tablist" aria-label="Course phases">
        {outline.map((item, n) => (
          <button
            key={item.label}
            type="button"
            role="tab"
            aria-selected={n === i}
            data-on={n === i ? "1" : "0"}
            onClick={() => setI(n)}
          >
            <i>{String(n + 1).padStart(2, "0")}</i>
            <span>
              <strong>{item.label}</strong>
              <em>{item.title}</em>
            </span>
          </button>
        ))}
      </div>
      <div className="tr-map__sheet" role="tabpanel">
        <header>
          <span>{phase.label}</span>
          <h2>{phase.title}</h2>
        </header>
        {phase.entries.length === 0 ? (
          <p className="tr-map__empty">Still being written.</p>
        ) : (
          <ol>
            {phase.entries.map((entry) => (
              <li key={entry.title} data-live={entry.live ? "1" : "0"}>
                <div>
                  <strong>{entry.title}</strong>
                  <p>{entry.summary}</p>
                  {entry.lessons.length > 0 && (
                    <ul>
                      {entry.lessons.map((lesson) => (
                        <li key={lesson}>{lesson}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <em>{entry.live ? "Live" : "Soon"}</em>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

const WORK = [
  { id: "lab", label: "Lab", title: "Build it. The portal watches.", body: "The script is tied to their account. The password check runs first. Then the domain, the snapshot, and a one-time code that proves the lab is theirs." },
  { id: "ticket", label: "Ticket", title: "The directory is the grade.", body: "Operation Day One, then the ticket queue. They change the object. Submit says pass, or the exact miss. One challenge can be reset on its own." },
  { id: "alert", label: "Alert", title: "The 2 AM login.", body: "One alert, five missions. They investigate in the lab and in the log. Each answer is recorded." },
  { id: "drill", label: "Drill", title: "The drill comes from their lab.", body: "Five questions in three minutes, at four levels. A finding becomes a task. Once a week, a question comes from their Security log." },
  { id: "score", label: "Score", title: "What they can do, and what needs work.", body: "Four skills, one level. Coach starts from the gaps. A reset asks before it clears anything." },
] as const;

function WorkStage() {
  const [i, setI] = useState(0);
  const item = WORK[i];

  return (
    <div className="tr-work">
      <div className="tr-work__side" role="tablist" aria-label="How the portal is used">
        {WORK.map((tab, n) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={n === i}
            data-on={n === i ? "1" : "0"}
            onClick={() => setI(n)}
          >
            <i>{String(n + 1).padStart(2, "0")}</i>
            {tab.label}
          </button>
        ))}
        <div className="tr-work__copy">
          <h2>{item.title}</h2>
          <p>{item.body}</p>
        </div>
      </div>
      <div className="tr-work__stage" role="tabpanel">
        {item.id === "lab" && <LabCard />}
        {item.id === "ticket" && <TicketLive />}
        {item.id === "alert" && <AlertCard />}
        {item.id === "drill" && <DrillCard />}
        {item.id === "score" && <ScoreCard />}
      </div>
    </div>
  );
}

export default function TrainingPage({ outline }: { outline: CourseOutline }) {
  return (
    <SiteChrome active="training">
      <TrainingHero />

      <section className="pg-section" id="phases">
        <div className="pg-head">
          <h2>Passing and working are not the same thing</h2>
          <p>Three phases. Open one. The weeks inside are the course.</p>
        </div>
        <PhaseMap outline={outline} />
      </section>

      <section className="pg-section" id="portal">
        <WorkStage />
      </section>

      <section className="pg-section" id="coach">
        <div className="pg-dark">
          <CoachShowcase />
        </div>
      </section>

      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <h2>Open a cohort</h2>
          <p className="pg-close__sub">Or sign in if the seat is already yours.</p>
          <div className="pg-close__row">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="pg-close__book">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <Link href="/academy" className="pg-close__more">
              Academy portal <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <HoldCard source="training" />
      </section>

      <style>{PG_CSS}</style>
      <style>{COACH_CSS}</style>
      <style>{`
        .tr-map { display: grid; grid-template-columns: 280px minmax(0, 1fr); min-height: 520px; background: #fff; border-top: 1.5px solid var(--ink) }
        .tr-map__nav { display: flex; flex-direction: column; border-right: 1px solid var(--border) }
        .tr-map__nav button {
          display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: center;
          min-height: 44px; padding: 22px 18px 22px 0; text-align: left; background: none; border: 0;
          border-bottom: 1px solid var(--border); cursor: pointer; color: var(--ink);
        }
        .tr-map__nav button:focus-visible { outline: 3px solid var(--accent); outline-offset: -3px }
        .tr-map__nav i {
          font-style: normal; font-family: var(--font-display); font-weight: 700;
          font-size: clamp(2.4rem, 4vw, 3.4rem); line-height: .8; letter-spacing: -.06em;
          color: transparent; -webkit-text-stroke: 1.25px rgba(106,92,255,.45);
          transition: color .2s var(--ease), -webkit-text-stroke .2s var(--ease);
        }
        .tr-map__nav button[data-on="1"] { background: var(--accent-soft) }
        .tr-map__nav button[data-on="1"] i { color: var(--accent-deep); -webkit-text-stroke: 0 }
        .tr-map__nav strong { display: block; font-family: var(--font-mono); font-size: .66rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep) }
        .tr-map__nav em { display: block; margin-top: 4px; font-style: normal; font-family: var(--font-display); font-weight: 500; font-size: 1.05rem; letter-spacing: -.02em; line-height: 1.2 }
        .tr-map__sheet { padding: 8px 8px 8px 36px }
        .tr-map__sheet header span { font-family: var(--font-mono); font-size: .66rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep) }
        .tr-map__sheet h2 { margin: 8px 0 0; font-family: var(--font-display); font-weight: 500; font-size: clamp(2rem, 3.5vw, 3rem); letter-spacing: -.045em; line-height: 1 }
        .tr-map__empty { margin: 28px 0 0; color: var(--muted); font-size: 1.05rem }
        .tr-map__sheet ol { list-style: none; margin: 28px 0 0; padding: 0 }
        .tr-map__sheet ol > li { display: grid; grid-template-columns: 1fr auto; gap: 8px 20px; padding: 18px 0; border-top: 1px solid var(--border) }
        .tr-map__sheet ol > li strong { display: block; font-family: var(--font-display); font-weight: 500; font-size: 1.2rem; letter-spacing: -.02em }
        .tr-map__sheet ol > li p { margin: 6px 0 0; max-width: 62ch; color: var(--ink-soft); font-size: .95rem; line-height: 1.45 }
        .tr-map__sheet ol > li > em { font-style: normal; font-family: var(--font-mono); font-size: .66rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep) }
        .tr-map__sheet ol > li[data-live="0"] strong, .tr-map__sheet ol > li[data-live="0"] p, .tr-map__sheet ol > li[data-live="0"] > em { color: var(--muted) }
        .tr-map__sheet ul { display: flex; flex-wrap: wrap; gap: 6px 8px; list-style: none; margin: 12px 0 0; padding: 0 }
        .tr-map__sheet ul li { padding: 4px 8px; background: var(--accent-soft); color: var(--accent-deep); font-family: var(--font-mono); font-size: .68rem; font-weight: 700; letter-spacing: .04em }
        .tr-work { display: grid; grid-template-columns: minmax(240px, 340px) minmax(0, 1fr); gap: 36px; align-items: start; padding: 28px; background: var(--accent-soft) }
        .tr-work__side { display: flex; flex-direction: column; gap: 8px }
        .tr-work__side button {
          display: flex; align-items: center; gap: 12px; min-height: 44px; padding: 8px 12px; text-align: left;
          background: transparent; border: 0; border-left: 3px solid transparent; cursor: pointer;
          font-family: var(--font-display); font-weight: 500; font-size: 1.15rem; letter-spacing: -.02em; color: var(--ink-soft);
        }
        .tr-work__side button i { font-style: normal; font-family: var(--font-mono); font-size: .68rem; font-weight: 700; letter-spacing: .08em; color: var(--accent-deep) }
        .tr-work__side button[data-on="1"] { border-left-color: var(--accent); color: var(--ink); background: #fff }
        .tr-work__side button:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px }
        .tr-work__copy { padding: 18px 8px 0 }
        .tr-work__copy h2 { margin: 0; font-family: var(--font-display); font-weight: 500; font-size: clamp(1.6rem, 2.4vw, 2.1rem); letter-spacing: -.03em; line-height: 1.1 }
        .tr-work__copy p { margin: 10px 0 0; color: var(--ink-soft); font-size: .98rem; line-height: 1.5 }
        .tr-work__stage { min-width: 0 }
        .tr-card { background: #fff; border: 1px solid rgba(85,70,224,.22); border-left: 4px solid var(--accent); clip-path: polygon(0 0, calc(100% - 22px) 0, 100% 22px, 100% 100%, 0 100%); box-shadow: var(--highlight), var(--shadow-lg); padding: 22px 24px 18px }
        .tr-card header { display: flex; align-items: center; justify-content: space-between; gap: 12px }
        .tr-card header span, .tr-card header em { font-style: normal; font-family: var(--font-mono); font-size: .66rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep) }
        .tr-card h3 { margin: 14px 0 0; font-family: var(--font-display); font-weight: 500; font-size: 1.7rem; letter-spacing: -.04em }
        .tr-card__file { margin: 14px 0 0; font-family: var(--font-mono); font-size: .92rem; color: var(--ink) }
        .tr-card ol { list-style: none; margin: 16px 0 0; padding: 0 }
        .tr-card li { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-top: 1px solid var(--border); color: var(--muted); font-size: .95rem }
        .tr-card li[data-on="1"] { color: var(--ink) }
        .tr-card li[data-on="1"]::before { content: ""; width: 8px; height: 8px; background: var(--green); flex: none }
        .tr-card li[data-on="0"]::before { content: ""; width: 8px; height: 8px; border: 1px solid var(--border-strong); flex: none }
        .tr-card footer { display: flex; align-items: center; gap: 12px; margin-top: 8px; padding-top: 12px; border-top: 1px solid var(--border); font-size: .9rem; color: var(--ink-soft) }
        .tr-card footer b { font-weight: 500; color: var(--muted) }
        .tr-card footer b[data-on="1"] { color: var(--green) }
        .tr-card footer em { margin-left: auto; font-style: normal; font-family: var(--font-mono); font-size: .66rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep) }
        .tr-card dl { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 16px; margin: 16px 0 0; padding-top: 14px; border-top: 1px solid var(--border) }
        .tr-card dt { font-family: var(--font-mono); font-size: .62rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted) }
        .tr-card dd { margin: 3px 0 0; font-family: var(--font-mono); font-size: .88rem }
        .tr-card > p { margin: 16px 0 0; padding-top: 12px; border-top: 1px solid var(--border); color: var(--ink); font-size: 1rem; line-height: 1.45 }
        .tr-card > p.tr-card__file { margin: 14px 0 0; padding: 0; border: 0 }
        .tr-log { margin-top: 16px }
        .tr-log li::before { content: none }
        .tr-log li { display: grid; grid-template-columns: 3.2rem 3.4rem 1fr auto; gap: 10px; font-family: var(--font-mono); font-size: .82rem; color: var(--ink) }
        .tr-log b { font-weight: 500; color: var(--accent-deep) }
        .tr-timer { margin-top: 18px }
        .tr-timer b { font-family: var(--font-display); font-weight: 500; font-size: 2.6rem; letter-spacing: -.04em; line-height: 1 }
        .tr-timer span { display: block; margin-top: 4px; color: var(--ink-soft); font-size: .9rem }
        .tr-timer i { display: block; height: 3px; margin-top: 12px; background: linear-gradient(90deg, var(--accent) 62%, var(--border) 62%) }
        .tr-levels { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; padding: 0; border: 0 }
        .tr-levels li { border: 1px solid var(--border); padding: 6px 10px; color: var(--ink-soft); font-size: .82rem }
        .tr-levels li[data-on="1"] { border-color: var(--accent); color: var(--accent-deep); background: var(--accent-soft) }
        .tr-levels li::before { display: none }
        .tr-score { margin: 8px 0 0; font-family: var(--font-display); font-weight: 500; font-size: 4rem; letter-spacing: -.06em; line-height: .9; color: var(--accent-deep) }
        .tr-bars { margin-top: 8px }
        .tr-bars li { display: grid; grid-template-columns: 1fr auto; gap: 4px 10px; border: 0; padding: 8px 0 0; color: var(--ink-soft); font-size: .88rem }
        .tr-bars li::before { display: none }
        .tr-bars b { font-family: var(--font-mono); font-weight: 500; font-size: .78rem; color: var(--ink) }
        .tr-bars i { grid-column: 1 / -1; display: block; height: 3px; background: var(--accent); }
        @media (max-width: 980px) {
          .tr-map, .tr-work { grid-template-columns: 1fr }
          .tr-map__nav { flex-direction: row; overflow-x: auto; border-right: 0; border-bottom: 1px solid var(--border) }
          .tr-map__nav button { min-width: 180px; border-bottom: 0; border-right: 1px solid var(--border) }
          .tr-map__sheet { padding: 22px 0 0 }
          .tr-work { padding: 18px }
        }
      `}</style>
    </SiteChrome>
  );
}

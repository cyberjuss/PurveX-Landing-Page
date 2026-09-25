"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { CaseFloor, type FloorAlert, type FloorCase } from "./case-floor";
import { HoldCard } from "./hold-card";
import { CoachShowcase, COACH_CSS } from "./coach-showcase";
import { TrainingAudiences, AUDIENCE_CSS } from "./training-audiences";
import { PG_CSS } from "./page-skin";

/* Cybersecurity Training. Same skin as the home page (page-skin.ts).
   The syllabus is passed in by the route from the Academy portal's own
   content, and the skills, thresholds and coach modes come from the same
   modules the portal runs on, so this page describes the course that exists. */

export type CourseOutline = {
  label: string;
  title: string;
  entries: { title: string; summary: string; live: boolean }[];
}[];

const TRAINING_CASES: FloorCase[] = [
  {
    id: "INC-1042",
    sev: "High",
    status: "Open",
    title: "Locked out",
    fields: [
      { k: "Account", v: "riley.kwan" },
      { k: "Host", v: "OPS-WKS03" },
      { k: "Seen", v: "07:14" },
      { k: "Event", v: "4740" },
    ],
    body: "A user cannot sign in and believes the account is locked.",
    ask: "Open the account before you change anything.",
  },
  {
    id: "INC-1045",
    sev: "High",
    status: "Open",
    title: "The transfer that did not happen",
    fields: [
      { k: "Account", v: "taylor.osei" },
      { k: "From", v: "Operations" },
      { k: "To", v: "Compliance" },
      { k: "Groups", v: "Not switched" },
    ],
    body: "HR moved the user, but the directory still shows the old department.",
    ask: "Fix the directory, then prove that it held.",
  },
  {
    id: "INC-1046",
    sev: "Crit",
    status: "Alert",
    title: "The 2 AM login",
    fields: [
      { k: "Account", v: "alex.rivera" },
      { k: "Host", v: "DC01" },
      { k: "Seen", v: "02:11" },
      { k: "Event", v: "4624" },
    ],
    body: "An admin account signed in at 2 AM from a workstation.",
    ask: "Decide whether this is a mistake or an attack.",
  },
];

const TRAINING_ALERTS: FloorAlert[] = [
  { title: "Log Analysis Fundamentals", sev: "High", time: "Week 2", id: "Phase 2", acct: "Next", host: "Portal" },
  { title: "Home Lab: Active Directory", sev: "High", time: "Phase 1", id: "Build", acct: "Lab", host: "Portal" },
  { title: "Networking and Wireshark", sev: "Med", time: "Week 3", id: "Phase 1", acct: "Lesson", host: "Portal" },
  { title: "Readiness report", sev: "High", time: "Score", id: "72", acct: "Almost", host: "Portal" },
]
;

const STAGES = ["Open", "Coached", "Proven"];

function StageBoard() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % STAGES.length), 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <ol className="tr-board" aria-hidden="true">
      {STAGES.map((s, n) => (
        <li key={s} data-on={n === i ? "1" : "0"}>{s}</li>
      ))}
    </ol>
  );
}

export default function TrainingPage({ outline }: { outline: CourseOutline }) {
  return (
    <SiteChrome active="training">
      <section className="pg-hero tr-hero">
        <StageBoard />
        <div className="pg-hero__copy">
          <span className="sp-tag">Training</span>
          <h1 className="pg-hero__h1">The ticket does not close itself</h1>
          <p className="pg-hero__sub">
            Students work a real directory. Coach reads that lab and withholds the answer.
          </p>
          <div className="pg-hero__actions">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
              Book a cohort <ArrowRight size={16} />
            </a>
            <Link href="/academy" className="sp-btn sp-btn--ghost sp-btn--lg">
              Sign in
            </Link>
          </div>
        </div>

        <CaseFloor cases={TRAINING_CASES} alerts={TRAINING_ALERTS} label="Portal" />
      </section>

      <section className="pg-section" id="benefits">
        <div className="pg-head" data-r>
          <h2>Three seats at the same desk</h2>
        </div>
        <TrainingAudiences outline={outline} />
      </section>

      <section className="pg-section">
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
      <style>{AUDIENCE_CSS}</style>
      <style>{`
        .tr-hero { position: relative; overflow: visible; align-items: center }
        .tr-board {
          grid-column: 1 / -1; list-style: none; display: grid; grid-template-columns: repeat(3, 1fr);
          margin: 8px 0 0; padding: 0; border-bottom: 1px solid var(--border);
        }
        .tr-board li {
          margin: 0; padding: 6px 12px 16px 0;
          font-family: var(--font-display); font-weight: 700;
          font-size: clamp(2.2rem, 5vw, 4.2rem); line-height: .85; letter-spacing: -.05em;
          color: transparent; -webkit-text-stroke: 1.25px rgba(106,92,255,.34);
          transition: color .35s var(--ease);
        }
        .tr-board li { position: relative }
        .tr-board li[data-on="1"] { color: var(--ink); -webkit-text-stroke: 0 }
        .tr-board li[data-on="1"]::after {
          content: ""; position: absolute; left: 0; bottom: -1px; width: 36%; height: 2px; background: var(--accent);
        }
        .tr-hero .pg-hero__copy, .tr-hero .cf-floor { position: relative; z-index: 1 }
        .tr-hero .pg-hero__h1 { font-size: clamp(2rem, 3.4vw, 2.8rem) }
        @media (prefers-reduced-motion: no-preference) {
          .tr-hero .cf-ticket { animation: tr-slip .6s var(--ease) both; }
        }
        @keyframes tr-slip { from { opacity: 0; transform: translateY(14px) rotate(-0.6deg); } to { opacity: 1; transform: none; } }
        @keyframes tr-word { from { opacity: 0; transform: translateY(18px) } to { opacity: 1; transform: none; } }
        @media (max-width: 980px) {
          .tr-hero { overflow: visible }
          .tr-word { position: relative; top: 0; font-size: clamp(3.4rem, 18vw, 5rem); margin-bottom: -12px }
        }
      `}</style>
    </SiteChrome>
  );
}

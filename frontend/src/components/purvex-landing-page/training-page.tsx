"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { CaseFloor, type FloorAlert, type FloorCase } from "./case-floor";
import { HoldCard } from "./hold-card";
import { CoachShowcase, COACH_CSS } from "./coach-showcase";
import { TrainingBenefits, BENEFITS_CSS } from "./training-benefits";
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

const pad = (n: number) => String(n).padStart(2, "0");

const audiences = [
  { title: "Students", body: "Leave with tasks proven in a real directory and resume lines that they can defend." },
  { title: "Schools and academies", body: "See every student's readiness and weakest skill without grading by hand." },
  { title: "Government and workforce programs", body: "Measure progress into IT and security roles on one consistent curriculum." },
  { title: "Employers and business teams", body: "Hire or upskill on proof that ends in a spoken interview and a hire signal." },
];

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

export default function TrainingPage({ outline }: { outline: CourseOutline }) {
  return (
    <SiteChrome active="training">
      <section className="pg-hero">
        <div className="pg-hero__copy">
          <span className="sp-tag">Cybersecurity training</span>
          <h1 className="pg-hero__h1">Think Like a SOC Analyst 101</h1>
          <p className="pg-hero__sub">
            Students work a real directory, and PurveX Coach reads that same lab to guide them without giving away the answer.
          </p>
          <div className="pg-hero__actions">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
              Bring it to your program <ArrowRight size={16} />
            </a>
            <Link href="/academy" className="sp-btn sp-btn--ghost sp-btn--lg">
              Student sign in
            </Link>
          </div>
        </div>

        <CaseFloor cases={TRAINING_CASES} alerts={TRAINING_ALERTS} label="Portal" />
      </section>

      <section className="pg-section" id="syllabus">
        <div className="pg-head" data-r>
          <span className="sp-tag">Why it works</span>
          <h2>Follow one ticket to see what students gain</h2>
        </div>
        <TrainingBenefits outline={outline} />
      </section>

      <section className="pg-section">
        <div className="pg-dark">
          <CoachShowcase />
        </div>
      </section>

      <section className="pg-section">
        <div className="pg-head" data-r>
          <span className="sp-tag">Who it serves</span>
          <h2>What each group takes away</h2>
        </div>
        <ol className="pg-grid pg-grid--4" data-r>
          {audiences.map((a, i) => (
            <li key={a.title}>
              <span>{pad(i + 1)}</span>
              <strong>{a.title}</strong>
              <p>{a.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <p className="pg-close__kicker">Next step</p>
          <h2>Start with your cohort</h2>
          <p className="pg-close__sub">The synced lab, the drills, and Coach are inside the portal. Book a cohort for your program, or sign in if you already have a seat.</p>
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
      <style>{BENEFITS_CSS}</style>
    </SiteChrome>
  );
}

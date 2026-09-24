"use client";

import Link from "next/link";
import { ArrowRight, Check, Server } from "lucide-react";
import {
  IconAudit, IconBook, IconBriefcase, IconCampus, IconChain, IconCivic, IconCoverage, IconEvidence,
  IconGraduate, IconHeadset, IconKey, IconSchedule, IconSignal, IconValidate,
} from "./brand-icons";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { CaseFloor, type FloorAlert, type FloorCase } from "./case-floor";
import { HoldCard } from "./hold-card";
import { CoachShowcase, COACH_CSS } from "./coach-showcase";
import { PG_CSS } from "./page-skin";
import { MISSION_CATALOG } from "@/lib/academy-missions";
import { SKILLS, type Skill } from "@/lib/academy-score";

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

const TOTAL_MISSIONS = Object.keys(MISSION_CATALOG).length;

// Illustrative student, for the report preview only.
const SAMPLE_SCORES: Record<Skill, number> = { accounts: 92, directory: 78, troubleshooting: 88, security: 61 };

const steps = [
  {
    n: "01", title: "Learn", Icon: IconBook,
    body: "Short weekly lessons, each opened by one guiding question.",
    points: ["Security fundamentals through incident response", "A quiz before each week is complete"],
  },
  {
    n: "02", title: "Work", Icon: IconChain,
    body: "Daily drills and a weekly CTF run on the company they built, and Coach can read that lab because it syncs.",
    points: ["Tickets checked against a live directory", "A daily drill and a weekly CTF"],
  },
  {
    n: "03", title: "Prove", Icon: IconEvidence,
    body: "Every attempt is measured instead of only being submitted.",
    points: ["A readiness score out of 100", "Resume lines drawn from closed tickets"],
  },
];

const proofs = [
  { ok: true, text: "Account is restored" },
  { ok: true, text: "Group membership holds" },
  { ok: true, text: "Service account is documented" },
  { ok: false, text: "A transfer is still open" },
  { ok: true, text: "Weekly CTF is scored on the Security log" },
];

const roles = [
  { title: "Help desk technician", body: "Confirms what is true in the directory before changing anything.", Icon: IconHeadset },
  { title: "Security analyst", body: "Decides whether an alert is a mistake or an attack, and explains the call.", Icon: IconSignal },
  { title: "Systems administrator", body: "Keeps access accurate as people join, move, and leave.", Icon: IconKey },
  { title: "Audit and compliance support", body: "Turns policy into settings that an auditor can verify.", Icon: IconAudit },
];

const cohort = [
  { n: "01", title: "Book", body: "Thirty minutes on your program and your tools.", Icon: IconSchedule },
  { n: "02", title: "Build the lab", body: "Each student builds the PurveX Financial company with one script.", Icon: IconChain },
  { n: "03", title: "Work the queue", body: "Tickets, drills, and a weekly investigation run against that lab.", Icon: IconValidate },
  { n: "04", title: "Review readiness", body: "You read every student's report without grading by hand.", Icon: IconCoverage },
];

const audiences = [
  { title: "Students", body: "Leave with tasks proven in a real directory and resume lines that they can defend.", Icon: IconGraduate },
  { title: "Schools and academies", body: "See every student's readiness and weakest skill without grading by hand.", Icon: IconCampus },
  { title: "Government and workforce programs", body: "Measure progress into IT and security roles on one consistent curriculum.", Icon: IconCivic },
  { title: "Employers and business teams", body: "Hire or upskill on proof that ends in a spoken interview and a hire signal.", Icon: IconBriefcase },
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
  const lessonCount = outline.reduce((n, p) => n + p.entries.filter((e) => e.live).length, 0);
  const skillKeys = Object.keys(SKILLS) as Skill[];

  return (
    <SiteChrome active="training">
      <section className="pg-hero">
        <div className="pg-hero__copy">
          <span className="sp-tag">Cybersecurity training</span>
          <h1 className="pg-hero__h1">Think Like a SOC Analyst 101</h1>
          <p className="pg-hero__sub">
            Daily drills and a weekly CTF are scored on a lab that syncs from each student&apos;s machine. PurveX Coach can read that lab and assess the work, so the help it gives is about their directory, not a generic walkthrough.
          </p>
          <div className="pg-hero__actions">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
              Bring it to your program <ArrowRight size={16} />
            </a>
            <Link href="/academy" className="sp-btn sp-btn--ghost sp-btn--lg">
              Student sign in
            </Link>
          </div>
          <ul className="pg-facts">
            <li><strong>{pad(outline.length)}</strong><span>Phases</span></li>
            <li><strong>{pad(lessonCount)}</strong><span>Lessons live</span></li>
            <li><strong>{pad(TOTAL_MISSIONS)}</strong><span>Graded missions</span></li>
          </ul>
        </div>

        <CaseFloor cases={TRAINING_CASES} alerts={TRAINING_ALERTS} label="Portal" />
      </section>

      <section className="pg-section">
        <div className="pg-head" data-r>
          <span className="sp-tag">How it works</span>
          <h2>Where learning turns into proof</h2>
        </div>
        <ol className="ox-flow ox-flow--3" data-r>
          {steps.map((s) => (
            <li key={s.n}>
              <i className="pg-ico"><s.Icon size={28} /></i>
              <span>{s.n}</span>
              <strong>{s.title}</strong>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pg-section">
        <div className="pg-split" data-r>
          <div className="pg-head">
            <span className="sp-tag">The lab</span>
            <h2>Coach reads their lab because it syncs</h2>
            <p>Each student builds a company on their own machine, and that lab syncs so Coach can read it and assess the work. Daily drills and a weekly CTF are graded on the live directory and Security log, not on a self-report.</p>
            <ul className="pg-bullets">
              <li>The lab syncs, so every check reads live data</li>
              <li>Coach knows their lab, and that is how it helps</li>
              <li>Daily drills and a weekly CTF are scored on those live results</li>
            </ul>
            <Link href="/academy" className="pg-more">
              Sign in to open the first ticket <ArrowRight size={15} />
            </Link>
          </div>
          <div className="pg-proof" aria-hidden="true">
            <header>
              <span><Server size={14} /> purvexfinancial.local</span>
              <em><i /> Synced</em>
            </header>
            <ul>
              {proofs.map((p) => (
                <li key={p.text} data-ok={p.ok}>
                  <span>{p.ok ? <Check size={13} /> : "!"}</span>
                  {p.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="pg-section">
        <div className="pg-head" data-r>
          <span className="sp-tag">Beyond the help desk</span>
          <h2>One lab for four careers</h2>
          <p>The lab starts at the help desk and supports three more career paths from the same directory.</p>
        </div>
        <ol className="pg-rows" data-r>
          {roles.map((r) => (
            <li key={r.title}>
              <i className="pg-ico"><r.Icon size={21} /></i>
              <div>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="pg-section" id="syllabus">
        <div className="pg-head" data-r>
          <span className="sp-tag">The syllabus</span>
          <h2>From fundamentals to incident response</h2>
          <p>Students open the same three phases in the portal, and weeks unlock as they are published.</p>
        </div>
        <ol className="pg-phases" data-r>
          {outline.map((p, i) => {
            const live = p.entries.filter((e) => e.live).length;
            return (
              <li key={p.title}>
                <header>
                  <span>Phase {pad(i + 1)}</span>
                </header>
                <h3>{p.title}</h3>
                <footer>{p.entries.length ? `${live} of ${p.entries.length} live` : "In preparation"}</footer>
              </li>
            );
          })}
        </ol>
        <Link href="/academy" className="pg-more">
          Sign in to see the weeks <ArrowRight size={15} />
        </Link>
      </section>

      <section className="pg-section">
        <div className="pg-split" data-r>
          <div className="pg-head">
            <span className="sp-tag">The readiness report</span>
            <h2>A score a hiring manager can read</h2>
            <p>Four competencies are measured against the bar for a Tier 1 hire, so a score means the same thing for every student.</p>
            <ul className="pg-bullets">
              <li>Scores update as students finish tickets, drills, and the weekly CTF</li>
              <li>The full report opens in the portal</li>
            </ul>
          </div>
          <div className="pg-report" aria-label="Example readiness report">
            <header>
              <span>Competencies</span>
              <span>Example student</span>
            </header>
            <ul className="pg-bars">
              {skillKeys.map((k) => (
                <li key={k}>
                  <span>{SKILLS[k].label}</span>
                  <b>{SAMPLE_SCORES[k]}</b>
                  <i style={{ ["--w" as string]: `${SAMPLE_SCORES[k]}%` }} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="pg-section">
        <div className="pg-dark">
          <CoachShowcase />
        </div>
      </section>

      <section className="pg-section">
        <div className="ab-split">
          <div className="pg-head" data-r>
            <span className="sp-tag">Who it serves</span>
            <h2>What each group takes away</h2>
            <p>One readiness record, read four different ways.</p>
          </div>
          <ol className="ab-rows" data-r>
            {audiences.map((a) => (
              <li key={a.title}>
                <i className="pg-ico"><a.Icon size={22} /></i>
                <div>
                  <h3>{a.title}</h3>
                  <p>{a.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pg-section">
        <div className="ox-split">
          <div className="pg-head" data-r>
            <span className="sp-tag">How a cohort runs</span>
            <h2>From first call to a full queue</h2>
            <p>You know where the cohort stands at every step.</p>
          </div>
          <ol className="ox-steps" data-r>
            {cohort.map((s) => (
              <li key={s.n}>
                <span className="ox-steps__n">{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
                <i className="pg-ico"><s.Icon size={24} /></i>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <p className="pg-close__kicker">Next step</p>
          <h2>Start with your cohort</h2>
          <p className="pg-close__sub">The synced lab, the drills, the weekly CTF, and a Coach that can read them are inside the portal. Book a cohort for your program, or sign in if you already have a seat.</p>
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
    </SiteChrome>
  );
}

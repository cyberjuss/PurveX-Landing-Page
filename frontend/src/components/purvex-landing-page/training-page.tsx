"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Check,
  CheckCheck,
  ClipboardCheck,
  Compass,
  GraduationCap,
  Headset,
  KeyRound,
  Landmark,
  LifeBuoy,
  Mic,
  School,
  Server,
  ShieldAlert,
} from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";
import { MISSION_CATALOG } from "@/lib/academy-missions";
import { SCORE_READY, SCORE_SOLID, SKILLS, type Skill } from "@/lib/academy-score";
import { COACH_MODE_LABELS } from "@/lib/academy-coach-mode";

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
  { n: "01", title: "Learn", body: "Weekly lessons and a short quiz.", Icon: BookOpen },
  { n: "02", title: "Work", body: "A live directory, a ticket queue, and a 2 AM alert.", Icon: Server },
  { n: "03", title: "Prove", body: "Every attempt feeds a readiness score.", Icon: BadgeCheck },
];

const proofs = [
  { ok: true, text: "jamie.torres is a member of the announcement group" },
  { ok: true, text: "riley.kwan is enabled and no longer locked out" },
  { ok: true, text: "svc-backup-job Description holds the run window" },
  { ok: false, text: "taylor.osei is still in Operations Users" },
];

const roles = [
  {
    title: "Help desk technician",
    body: "Confirms what is true before changing anything.",
    tasks: ["Restore a blocked account", "Create an account to standard", "Check a ticket first"],
    Icon: Headset,
  },
  {
    title: "Security analyst",
    body: "Decides whether an alert is a mistake or an attack.",
    tasks: ["Read Windows security events", "Triage a login alert", "Write an escalation"],
    Icon: ShieldAlert,
  },
  {
    title: "Systems administrator",
    body: "Keeps access accurate as people join, move, and leave.",
    tasks: ["Build role-based access", "Offboard without deleting", "Retire unused accounts"],
    Icon: KeyRound,
  },
  {
    title: "Audit and compliance support",
    body: "Turns policy into settings that an auditor can verify.",
    tasks: ["Turn on auditing", "Keep the log long enough", "Set password and lockout policy"],
    Icon: ClipboardCheck,
  },
];

const modes: Record<keyof typeof COACH_MODE_LABELS, { body: string; Icon: typeof LifeBuoy }> = {
  walkthrough: { body: "For students who are new or stuck. One next step and a way to check it.", Icon: LifeBuoy },
  check: { body: "For students who understand the idea. It tests their reasoning.", Icon: CheckCheck },
  mentor: { body: "For students who know the lab. It discusses the call a team lead would make.", Icon: Compass },
  interview: { body: "It plays the hiring manager with five scored questions and a hire signal.", Icon: Mic },
};

const audiences = [
  { title: "Students", body: "Leave with tasks proven in a real directory and resume lines they can defend.", Icon: GraduationCap },
  { title: "Schools and academies", body: "See every student's readiness and weakest skill without grading by hand.", Icon: School },
  { title: "Government and workforce programs", body: "Measure progress into IT and security roles with one consistent curriculum.", Icon: Landmark },
  { title: "Employers and business teams", body: "Hire or upskill on proof, ending in a spoken interview and a hire signal.", Icon: Briefcase },
];

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
            Students work a live Active Directory lab and a ticket queue, and they finish with a
            readiness score that a hiring manager can read at a glance.
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

        <aside className="pg-floor" aria-hidden="true">
          <div className="pg-floor__wash" />
          <article className="pg-case">
            <header>
              <span>STU-0142</span>
              <span data-sev="High">Almost ready</span>
              <span>Cohort</span>
            </header>
            <h2>Readiness</h2>
            <div className="pg-score">
              <strong>72<small>/100</small></strong>
              <em>Tier 1 track</em>
            </div>
            <ul className="pg-bars">
              {skillKeys.map((k) => (
                <li key={k}>
                  <span>{SKILLS[k].label}</span>
                  <b>{SAMPLE_SCORES[k]}</b>
                  <i style={{ ["--w" as string]: `${SAMPLE_SCORES[k]}%` }} />
                </li>
              ))}
            </ul>
            <p>Next: prove the 2 AM login before the interview round.</p>
          </article>
          <div className="pg-dock">
            <p><span className="pg-live" /> Portal</p>
            <div className="pg-dock__row">
              <strong>Log Analysis Fundamentals</strong>
              <em data-sev="High">Next</em>
              <span>Week 2</span>
              <span>Phase 2</span>
            </div>
            <div className="pg-dock__row">
              <strong>The 2 AM Login</strong>
              <em data-sev="High">Open</em>
              <span>INC-1046</span>
              <span>Alert</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="pg-section">
        <div className="pg-head" data-r>
          <span className="sp-tag">How it works</span>
          <h2>Learn it. Work it. Prove it.</h2>
        </div>
        <ol className="pg-grid pg-grid--3 pg-grid--icons" data-r>
          {steps.map((s) => (
            <li key={s.n}>
              <span>{s.n}</span>
              <i className="pg-ico"><s.Icon size={21} /></i>
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
            <h2>A ticket closes only when the directory shows the change</h2>
            <p>Each student builds the PurveX Financial company on their own machine, and every check reads that live directory.</p>
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
          <h2>One lab, four roles</h2>
          <p>The lab starts at the help desk, and the same directory supports every role below.</p>
        </div>
        <ol className="pg-rows" data-r>
          {roles.map((r) => (
            <li key={r.title}>
              <i className="pg-ico"><r.Icon size={21} /></i>
              <div>
                <h3>{r.title}</h3>
                <p>{r.body}</p>
              </div>
              <ul className="pg-chips">
                {r.tasks.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="pg-section" id="syllabus">
        <div className="pg-head" data-r>
          <span className="sp-tag">The syllabus</span>
          <h2>Three phases</h2>
          <p>The same phases students open in the portal, updated as weeks are published.</p>
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
                {p.entries.length > 0 && (
                  <ul>
                    {p.entries.map((e) => (
                      <li key={e.title} className={e.live ? "" : "is-soon"}>
                        {e.title}
                      </li>
                    ))}
                  </ul>
                )}
                <footer>{p.entries.length ? `${live} of ${p.entries.length} live` : "In preparation"}</footer>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="pg-section">
        <div className="pg-split" data-r>
          <div className="pg-head">
            <span className="sp-tag">The readiness report</span>
            <h2>A score a hiring manager can read</h2>
            <p>Four competencies are measured against the bar for a Tier 1 hire.</p>
            <ul className="pg-levels">
              <li><i /> Keep practicing <span>under {SCORE_SOLID}</span></li>
              <li><i /> Almost ready <span>{SCORE_SOLID}+</span></li>
              <li><i /> Ready <span>{SCORE_READY}+</span></li>
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
        <div className="pg-dark" data-r>
          <span className="pg-dark__kicker">PurveX Coach</span>
          <h2>A coach that never hands over the answer</h2>
          <p className="pg-dark__lead">It reads the student&apos;s own lab and results, and it teaches the method without revealing the flag.</p>
          <ul className="pg-modes">
            {(Object.keys(COACH_MODE_LABELS) as (keyof typeof COACH_MODE_LABELS)[]).map((m) => {
              const { Icon, body } = modes[m];
              return (
                <li key={m}>
                  <i className="pg-ico"><Icon size={19} /></i>
                  <strong>{COACH_MODE_LABELS[m]}</strong>
                  <p>{body}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="pg-section">
        <div className="pg-head" data-r>
          <span className="sp-tag">Who it serves</span>
          <h2>One record for every stakeholder</h2>
        </div>
        <ul className="pg-grid pg-grid--4 pg-grid--icons" data-r>
          {audiences.map((a, i) => (
            <li key={a.title}>
              <span>{pad(i + 1)}</span>
              <i className="pg-ico"><a.Icon size={21} /></i>
              <strong>{a.title}</strong>
              <p>{a.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <p className="pg-close__kicker">Next step</p>
          <h2>Talk about a cohort</h2>
          <p className="pg-close__sub">Thirty minutes on your program, your tools, and the desk.</p>
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
    </SiteChrome>
  );
}

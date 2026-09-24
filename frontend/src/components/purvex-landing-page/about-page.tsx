"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IconEvidence, IconIdentity, IconLog, IconSchedule, IconShield } from "./brand-icons";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { CaseFloor, type FloorAlert, type FloorCase } from "./case-floor";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";

const notes = [
  { n: "01", title: "How we think", body: "You defend better when you know how the other side moves.", Icon: IconShield },
  { n: "02", title: "The work", body: "The person on your operations is the same person teaching the desk.", Icon: IconIdentity },
  { n: "03", title: "What is next", body: "Labs is the product that keeps the evidence. Still in development.", Icon: IconSchedule },
];

const ABOUT_CASES: FloorCase[] = [
  {
    id: "PX-01",
    sev: "High",
    status: "Open",
    title: "Two offers",
    fields: [
      { k: "Operations", v: "SIEM work" },
      { k: "Training", v: "The desk" },
      { k: "Labs", v: "In development" },
      { k: "Hold", v: "30 min" },
    ],
    body: "No account manager sits between you and the work.",
    ask: "Book thirty minutes and pick the offer that fits.",
  },
  {
    id: "PX-02",
    sev: "High",
    status: "Live",
    title: "Detections",
    fields: [
      { k: "Focus", v: "SIEM" },
      { k: "Method", v: "Validate" },
      { k: "Owner", v: "Founder" },
      { k: "Hold", v: "30 min" },
    ],
    body: "The person on your operations is the same person teaching the desk.",
    ask: "Ask what fires and what does not.",
  },
];

const ABOUT_ALERTS: FloorAlert[] = [
  { title: "Security operations", sev: "High", time: "Live", id: "SIEM", acct: "Validate", host: "PurveX" },
  { title: "Cybersecurity training", sev: "High", time: "Live", id: "Labs", acct: "Portal", host: "PurveX" },
  { title: "PurveX Labs", sev: "Med", time: "Soon", id: "Early", acct: "Access", host: "PurveX" },
];

const workflow = [
  { n: "01", title: "Book", body: "Thirty minutes to describe your SIEM or your program.", Icon: IconSchedule },
  { n: "02", title: "Walk through", body: "We review what fires and what does not, or where a cohort should start.", Icon: IconLog },
  { n: "03", title: "Agree the scope", body: "A short engagement, with one named person on every step.", Icon: IconEvidence },
];

export default function AboutPage() {
  return (
    <SiteChrome active="about">
      <section className="pg-hero">
        <div className="pg-hero__copy">
          <span className="sp-tag">About</span>
          <h1 className="pg-hero__h1">The desk and the classroom</h1>
          <p className="pg-hero__sub">We strengthen security operations, and we train the people who run them, from the same desk. Book thirty minutes if you want to see how that work actually looks.</p>
          <div className="pg-hero__actions">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <Link href="/about/founder" className="sp-btn sp-btn--ghost sp-btn--lg">
              Meet the founder
            </Link>
          </div>
        </div>
        <CaseFloor cases={ABOUT_CASES} alerts={ABOUT_ALERTS} label="On the books" />
      </section>

      <section className="pg-section">
        <div className="ab-split">
          <div className="ab-venn" data-r role="img" aria-label="Operations and training overlap in one person">
            <svg viewBox="0 0 460 340">
              <defs>
                <clipPath id="ab-clip">
                  <circle cx="168" cy="170" r="122" />
                </clipPath>
                <linearGradient id="ab-a" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#8b7fff" stopOpacity=".22" />
                  <stop offset="1" stopColor="#6a5cff" stopOpacity=".1" />
                </linearGradient>
              </defs>
              <circle cx="168" cy="170" r="122" className="ab-c ab-c--a" />
              <circle cx="292" cy="170" r="122" className="ab-c ab-c--b" />
              <circle cx="292" cy="170" r="122" clipPath="url(#ab-clip)" className="ab-lens" />
              <g className="ab-label">
                <text x="108" y="166" className="ab-t1" textAnchor="middle">Operations</text>
                <text x="108" y="188" className="ab-t2" textAnchor="middle">SIEM work</text>
                <text x="356" y="166" className="ab-t1" textAnchor="middle">Training</text>
                <text x="356" y="188" className="ab-t2" textAnchor="middle">The desk</text>
              </g>
              <g className="ab-core">
                <circle cx="230" cy="150" r="5" />
                <text x="230" y="184" textAnchor="middle" className="ab-t3">One person</text>
              </g>
            </svg>
          </div>
          <div>
            <div className="pg-head" data-r>
              <span className="sp-tag">How we run</span>
              <h2>The same person on every engagement</h2>
              <p>Short engagements, and no account manager between you and the work.</p>
            </div>
            <ol className="ab-rows" data-r>
              {notes.map((n) => (
                <li key={n.n}>
                  <i className="pg-ico"><n.Icon size={22} /></i>
                  <div>
                    <h3>{n.title}</h3>
                    <p>{n.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="pg-section">
        <div className="ab-statement" data-r>
          <span className="sp-tag">What we believe</span>
          <h2>
            You defend better when you know <mark>how the other side moves</mark>.
          </h2>
          <p>
            That belief shapes both offers: operations that test detections the way an attacker would, and training that
            teaches analysts to think the same way.
          </p>
        </div>
      </section>

      <section className="pg-section">
        <div className="ox-split">
          <div className="pg-head" data-r>
            <span className="sp-tag">Working together</span>
            <h2>From first call to agreed scope</h2>
            <p>No long sales process, and no hand-off to someone new.</p>
          </div>
          <ol className="ox-steps" data-r>
            {workflow.map((s) => (
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

      <section className="pg-section">
        <div className="ab-links" data-r>
          <Link href="/about/founder">
            <span>People</span>
            <strong>Meet the founder</strong>
            <p>The person doing the work talks with you directly, not through a relay.</p>
            <i><ArrowRight size={20} /></i>
          </Link>
          <Link href="/platform">
            <span>In development</span>
            <strong>PurveX Labs</strong>
            <p>Scheduled detection tests, with the evidence kept, while the product is in private development.</p>
            <i><ArrowRight size={20} /></i>
          </Link>
        </div>
      </section>

      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <p className="pg-close__kicker">Next step</p>
          <h2>Start with a conversation</h2>
          <p className="pg-close__sub">Thirty minutes covers operations, training, or Labs, and that is where we walk through the rest.</p>
          <div className="pg-close__row">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="pg-close__book">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <Link href="/" className="pg-close__more">
              Back home <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <HoldCard source="about" />
      </section>

      <style>{PG_CSS}</style>
    </SiteChrome>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Lightbulb, Rocket, Users } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { CaseFloor, type FloorAlert, type FloorCase } from "./case-floor";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";

const notes = [
  { n: "01", title: "How we think", body: "You defend better when you know how the other side moves.", Icon: Lightbulb },
  { n: "02", title: "The work", body: "The person on your operations is the same person teaching the desk.", Icon: Users },
  { n: "03", title: "What is next", body: "Labs is the product that keeps the evidence. Still in development.", Icon: Rocket },
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
        <div className="pg-head" data-r>
          <span className="sp-tag">Notes</span>
          <h2>How we run</h2>
          <p>Short engagements, and the same person on every one.</p>
        </div>
        <ol className="pg-grid pg-grid--3 pg-grid--icons" data-r>
          {notes.map((n) => (
            <li key={n.n}>
              <span>{n.n}</span>
              <i className="pg-ico"><n.Icon size={21} /></i>
              <strong>{n.title}</strong>
              <p>{n.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pg-section">
        <div className="pg-deck" data-r>
          <article className="pg-tile">
            <div className="pg-tile__stub">
              <span>01</span>
              <span>People</span>
            </div>
            <h3>Meet the founder</h3>
            <p>The person doing the work talks with you directly, not through a relay.</p>
            <Link href="/about/founder" className="pg-tile__link">
              Read more <ArrowRight size={14} />
            </Link>
          </article>
          <article className="pg-tile pg-tile--dark">
            <div className="pg-tile__stub">
              <span>02</span>
              <span>In development</span>
            </div>
            <h3>PurveX Labs</h3>
            <p>Scheduled detection tests, with the evidence kept, while the product is still in private development.</p>
            <Link href="/platform" className="pg-tile__link pg-tile__link--light">
              Request early access <ArrowRight size={14} />
            </Link>
          </article>
        </div>
      </section>

      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <p className="pg-close__kicker">Next step</p>
          <h2>Talk with us</h2>
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

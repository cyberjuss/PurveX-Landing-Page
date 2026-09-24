"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";

const notes = [
  { n: "01", title: "How we think", body: "You defend better when you know how the other side moves." },
  { n: "02", title: "The work", body: "The person on your operations is the same person teaching the desk." },
  { n: "03", title: "What is next", body: "Labs is the product that keeps the evidence. Still in development." },
];

export default function AboutPage() {
  return (
    <SiteChrome active="about">
      <section className="pg-hero">
        <div className="pg-hero__copy">
          <span className="sp-tag">About</span>
          <h1 className="pg-hero__h1">The desk and the classroom</h1>
          <p className="pg-hero__sub">We strengthen operations, and we train the people who run them.</p>
          <div className="pg-hero__actions">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <Link href="/about/founder" className="sp-btn sp-btn--ghost sp-btn--lg">
              Meet the founder
            </Link>
          </div>
        </div>
        <aside className="pg-floor" aria-hidden="true">
          <div className="pg-floor__wash" />
          <article className="pg-case">
            <header>
              <span>PurveX</span>
              <span data-sev="High">Now</span>
              <span>Open</span>
            </header>
            <h2>Two offers</h2>
            <dl>
              <div><dt>Operations</dt><dd>SIEM work</dd></div>
              <div><dt>Training</dt><dd>The desk</dd></div>
              <div><dt>Labs</dt><dd>In development</dd></div>
              <div><dt>Hold</dt><dd>30 min</dd></div>
            </dl>
            <p>No account manager in the middle. The work and the person stay together.</p>
          </article>
          <div className="pg-dock">
            <p><span className="pg-live" /> On the books</p>
            <div className="pg-dock__row">
              <strong>Security operations</strong>
              <em data-sev="High">Live</em>
              <span>SIEM</span>
              <span>Validate</span>
            </div>
            <div className="pg-dock__row">
              <strong>Cybersecurity training</strong>
              <em data-sev="High">Live</em>
              <span>Labs</span>
              <span>Portal</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="pg-section">
        <div className="pg-head" data-r>
          <span className="sp-tag">Notes</span>
          <h2>How we run</h2>
          <p>Short, and the same on every engagement.</p>
        </div>
        <ol className="pg-grid pg-grid--3" data-r>
          {notes.map((n) => (
            <li key={n.n}>
              <span>{n.n}</span>
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
            <p>The person doing the work. Not a relay.</p>
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
            <p>Scheduled tests. Evidence kept.</p>
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
          <p className="pg-close__sub">30 minutes. Operations, training, or Labs.</p>
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

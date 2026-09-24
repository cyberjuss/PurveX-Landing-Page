"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Braces, ClipboardList, Search, ShieldCheck, SlidersHorizontal, Wrench } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";

const services = [
  { n: "01", title: "Detection engineering", body: "Rules built around your environment, not a vendor template.", Icon: Braces },
  { n: "02", title: "Optimization", body: "Noisy rules get cut. Real alerts stop getting buried.", Icon: SlidersHorizontal },
  { n: "03", title: "Assessment", body: "What the SIEM sees, and what it misses.", Icon: Search },
  { n: "04", title: "Validation", body: "A clear answer. Fires, or does not.", Icon: ShieldCheck },
];

const steps = [
  { n: "01", title: "Assess", body: "Coverage, tools, and the gaps.", Icon: ClipboardList },
  { n: "02", title: "Improve", body: "Tune and write what matters first.", Icon: Wrench },
  { n: "03", title: "Validate", body: "Test it. Keep the evidence.", Icon: BadgeCheck },
];

export default function SecurityOperationsPage() {
  return (
    <SiteChrome active="security-operations">
      <section className="pg-hero pg-hero--flip">
        <div className="pg-hero__copy">
          <span className="sp-tag">Operations</span>
          <h1 className="pg-hero__h1">Prove your detections</h1>
          <p className="pg-hero__sub">We tune the SIEM, write what is missing, and test whether it fires.</p>
          <div className="pg-hero__actions">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <a href="#work" className="sp-btn sp-btn--ghost sp-btn--lg">
              See the work
            </a>
          </div>
        </div>
        <aside className="pg-floor" aria-hidden="true">
          <div className="pg-floor__wash" />
          <article className="pg-case">
            <header>
              <span>RUN-14</span>
              <span data-sev="Crit">Missed</span>
              <span>Open</span>
            </header>
            <h2>LSASS memory access</h2>
            <dl>
              <div><dt>Technique</dt><dd>T1003.001</dd></div>
              <div><dt>Host</dt><dd>WIN-DC02</dd></div>
              <div><dt>Rule</dt><dd>Exists</dd></div>
              <div><dt>Alert</dt><dd>None</dd></div>
            </dl>
            <p>The rule is in. The ingest path is not. That is the miss.</p>
          </article>
          <div className="pg-dock">
            <p><span className="pg-live" /> Last run</p>
            <div className="pg-dock__row">
              <strong>PowerShell execution</strong>
              <em data-sev="High">Fired</em>
              <span>T1059.001</span>
              <span>WIN-APP08</span>
            </div>
            <div className="pg-dock__row">
              <strong>LSASS memory access</strong>
              <em>Missed</em>
              <span>T1003.001</span>
              <span>WIN-DC02</span>
            </div>
          </div>
        </aside>
      </section>

      <section className="pg-section" id="work">
        <div className="pg-head" data-r>
          <span className="sp-tag">What we do</span>
          <h2>Four ways we help</h2>
          <p>Engineering, cleanup, a map of coverage, and a test.</p>
        </div>
        <ol className="pg-grid pg-grid--4 pg-grid--icons" data-r>
          {services.map((s) => (
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
        <div className="pg-head" data-r>
          <span className="sp-tag">How we work</span>
          <h2>Three steps</h2>
          <p>You always know where the work stands.</p>
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

      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <p className="pg-close__kicker">Next step</p>
          <h2>Walk the queue with us</h2>
          <p className="pg-close__sub">30 minutes on your SIEM. What fires, and what does not.</p>
          <div className="pg-close__row">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="pg-close__book">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <Link href="/about" className="pg-close__more">
              About PurveX <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <HoldCard source="operations" />
      </section>

      <style>{PG_CSS}</style>
    </SiteChrome>
  );
}
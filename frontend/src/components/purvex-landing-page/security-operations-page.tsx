"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IconCoverage, IconLog, IconShield, IconSignal, IconTune, IconValidate } from "./brand-icons";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { CaseFloor, DETECTION_ALERTS, DETECTION_CASES } from "./case-floor";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";

const services = [
  { n: "01", title: "Detection engineering", body: "Rules built around your environment, not a vendor template.", Icon: IconSignal },
  { n: "02", title: "Optimization", body: "Noisy rules get cut. Real alerts stop getting buried.", Icon: IconTune },
  { n: "03", title: "Assessment", body: "What the SIEM sees, and what it misses.", Icon: IconCoverage },
  { n: "04", title: "Validation", body: "A clear answer on whether it fires or does not.", Icon: IconValidate },
];

const steps = [
  { n: "01", title: "Assess", body: "Coverage, tools, and the gaps.", Icon: IconLog },
  { n: "02", title: "Improve", body: "Tune and write what matters first.", Icon: IconSignal },
  { n: "03", title: "Validate", body: "Test it, and keep the evidence.", Icon: IconShield },
];

export default function SecurityOperationsPage() {
  return (
    <SiteChrome active="security-operations">
      <section className="pg-hero pg-hero--flip">
        <div className="pg-hero__copy">
          <span className="sp-tag">Operations</span>
          <h1 className="pg-hero__h1">Prove your detections</h1>
          <p className="pg-hero__sub">We tune the SIEM, write what is missing, and test whether it fires on your stack. Book thirty minutes to walk the misses we would start with.</p>
          <div className="pg-hero__actions">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <a href="#work" className="sp-btn sp-btn--ghost sp-btn--lg">
              See the work
            </a>
          </div>
        </div>
        <CaseFloor cases={DETECTION_CASES} alerts={DETECTION_ALERTS} label="Last run" />
      </section>

      <section className="pg-section" id="work">
        <div className="pg-head" data-r>
          <span className="sp-tag">What we do</span>
          <h2>Four ways we help</h2>
          <p>Engineering, cleanup, a map of coverage, and a test that shows what actually fires.</p>
        </div>
        <ol className="ox-flow" data-r>
          {services.map((s) => (
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
        <div className="ox-split">
          <div className="pg-head" data-r>
            <span className="sp-tag">How we work</span>
            <h2>Three steps</h2>
            <p>You always know where the work stands.</p>
          </div>
          <ol className="ox-steps" data-r>
            {steps.map((s) => (
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
          <h2>Walk the queue with us</h2>
          <p className="pg-close__sub">Bring one detection you already trust, and we will tell you whether it actually fires. Thirty minutes is enough to see how the rest of the work would run.</p>
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
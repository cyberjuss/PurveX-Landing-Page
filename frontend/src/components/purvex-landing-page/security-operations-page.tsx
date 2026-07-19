"use client";

import { ArrowRight, Radar, Sliders, Target, Waypoints } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";

const services = [
  {
    icon: Waypoints,
    title: "SIEM & Detection Engineering",
    body: "Build and improve security detections designed around your environment and threat landscape.",
  },
  {
    icon: Sliders,
    title: "SIEM Optimization",
    body: "Improve alert quality, reduce unnecessary noise, and help security teams focus on what matters.",
  },
  {
    icon: Target,
    title: "Security Operations Assessment",
    body: "Evaluate your current security operations and identify opportunities to improve visibility, workflows, and detection coverage.",
  },
  {
    icon: Radar,
    title: "Detection Validation",
    body: "Test whether security controls and detections respond as expected through controlled security simulations.",
  },
];

export default function SecurityOperationsPage() {
  return (
    <SiteChrome active="security-operations">
      {/* ═══════════ HERO ═══════════ */}
      <section className="sp-hero">
        <span className="sp-hero__badge">
          <Target size={13} /> Security Operations
        </span>
        <h1 className="sp-hero__h1">Strengthen Your Security Operations</h1>
        <p className="sp-hero__sub">
          Security tools are only effective when they are properly configured, monitored, and
          continuously improved. PurveX helps organizations improve their ability to identify
          threats and strengthen their detection capabilities.
        </p>
      </section>

      {/* ═══════════ SERVICES ═══════════ */}
      <section className="sp-section">
        <div className="sp-cards sp-cards--4" data-r>
          {services.map((s) => (
            <article key={s.title} className="sp-card">
              <div className="sp-card__icon">
                <s.icon size={22} />
              </div>
              <h3 className="sp-card__title">{s.title}</h3>
              <p className="sp-card__body">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="sp-section">
        <div className="sp-cta" data-r>
          <span className="sp-tag">Not sure where your security gaps are?</span>
          <h2>Let&apos;s discuss your current security environment.</h2>
          <p>We&apos;ll talk through where things stand today and identify where PurveX can help.</p>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Schedule a Conversation <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </SiteChrome>
  );
}

"use client";

import { ArrowRight, Radar, Search, ShieldCheck, Sliders, Target, Waypoints } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";

const services = [
  {
    id: "siem-detection-engineering",
    icon: Waypoints,
    title: "SIEM & Detection Engineering",
    body: "Build and improve security detections designed around your environment and threat landscape.",
  },
  {
    id: "siem-optimization",
    icon: Sliders,
    title: "SIEM Optimization",
    body: "Improve alert quality, reduce unnecessary noise, and help security teams focus on what matters.",
  },
  {
    id: "assessment",
    icon: Target,
    title: "Security Operations Assessment",
    body: "Evaluate your current security operations and identify opportunities to improve visibility, workflows, and detection coverage.",
  },
  {
    id: "detection-validation",
    icon: Radar,
    title: "Detection Validation",
    body: "Test whether security controls and detections respond as expected through controlled security simulations.",
  },
];

const process = [
  {
    n: "01",
    icon: Search,
    title: "Assess",
    body: "We start by understanding your current environment, tools, and detection coverage, so we know exactly where the gaps are.",
  },
  {
    n: "02",
    icon: Sliders,
    title: "Improve",
    body: "We tune, build, and strengthen detections and workflows based on what we find, prioritized by what matters most.",
  },
  {
    n: "03",
    icon: ShieldCheck,
    title: "Validate",
    body: "We test the changes so you know your detections fire the way they are supposed to, not just that they exist.",
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
        <div className="sp-head" data-r>
          <span className="sp-tag">What we do</span>
          <h2>Four ways we strengthen your operations.</h2>
        </div>
        <div className="sp-cards sp-cards--4" data-r>
          {services.map((s) => (
            <article key={s.title} id={s.id} className="sp-card">
              <div className="sp-card__icon">
                <s.icon size={22} />
              </div>
              <h3 className="sp-card__title">{s.title}</h3>
              <p className="sp-card__body">{s.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════ HOW WE WORK ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">How we work</span>
          <h2>A simple, repeatable process.</h2>
          <p>Every engagement moves through the same three stages, so you always know where things stand.</p>
        </div>
        <div className="sp-process" data-r>
          {process.map((p) => (
            <div key={p.title} className="sp-process__step">
              <span className="sp-process__num">{p.n}</span>
              <div className="sp-process__icon">
                <p.icon size={18} />
              </div>
              <h3 className="sp-process__title">{p.title}</h3>
              <p className="sp-process__body">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="sp-section">
        <div className="sp-cta" data-r>
          <span className="sp-tag">Not sure where your security gaps are?</span>
          <h2>Talk through your current security environment.</h2>
          <p>We will walk through where things stand today and identify where PurveX can help.</p>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Schedule a Conversation <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <style>{`
.sp-process { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; counter-reset: step }
.sp-process__step { position: relative; padding: 30px; border-radius: calc(var(--radius) + 2px); border: 1px solid var(--border); background: var(--surface); box-shadow: 0 18px 44px -40px rgba(16,25,46,.28) }
.sp-process__num { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; letter-spacing: -.03em; color: var(--accent) }
.sp-process__icon { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 11px; background: var(--accent-soft); color: var(--accent-deep); margin-top: 14px }
.sp-process__title { margin: 16px 0 0; font-family: var(--font-display); font-size: 1.08rem; font-weight: 650; letter-spacing: -.015em; color: var(--ink) }
.sp-process__body { margin: 8px 0 0; color: var(--muted); font-size: .9rem; line-height: 1.65 }
@media (max-width: 940px) { .sp-process { grid-template-columns: 1fr } }
      `}</style>
    </SiteChrome>
  );
}

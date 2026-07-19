"use client";

import Link from "next/link";
import { ArrowRight, Radar, ShieldCheck } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";

const pillars = [
  {
    icon: ShieldCheck,
    title: "Security Operations",
    lead: "Strengthen your ability to detect and respond to threats.",
    body: "We help organizations improve their security operations through SIEM optimization, detection engineering, security assessments, and detection validation.",
    cta: "Explore Security Operations",
    href: "/security-operations",
  },
  {
    icon: Radar,
    title: "Cybersecurity Training",
    lead: "Develop practical, job-ready cybersecurity talent.",
    body: "We partner with academies and workforce development programs to deliver hands-on cybersecurity instruction built around real-world security operations.",
    cta: "Explore Cybersecurity Training",
    href: "/cybersecurity-training",
  },
];

export default function HomePage() {
  return (
    <SiteChrome active="home">
      {/* ═══════════ HERO ═══════════ */}
      <section className="sp-hero">
        <h1 className="sp-hero__h1">Building Stronger Security Operations.</h1>
        <p className="sp-hero__sub">
          PurveX helps organizations strengthen their security capabilities through security
          operations consulting and hands-on cybersecurity training.
        </p>
        <div className="sp-hero__actions">
          <a href="#how-we-help" className="sp-btn sp-btn--prim sp-btn--lg">
            Explore Our Services <ArrowRight size={16} />
          </a>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--ghost sp-btn--lg">
            Work With PurveX
          </a>
        </div>
        <p className="sp-hero__strip">Security Operations • Detection Engineering • Cybersecurity Training</p>
      </section>

      {/* ═══════════ HOW WE HELP ═══════════ */}
      <section className="sp-section" id="how-we-help">
        <div className="sp-head" data-r>
          <span className="sp-tag">How PurveX helps</span>
          <h2>Two ways we strengthen your security posture.</h2>
        </div>
        <div className="sp-cards sp-cards--2" data-r>
          {pillars.map((p) => (
            <Link key={p.title} href={p.href} className="sp-card">
              <div className="sp-card__icon">
                <p.icon size={22} />
              </div>
              <h3 className="sp-card__title">{p.title}</h3>
              <p className="sp-card__body">
                <strong>{p.lead}</strong> {p.body}
              </p>
              <span className="sp-card__link">
                {p.cta} <ArrowRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="sp-section">
        <div className="sp-cta" data-r>
          <span className="sp-tag">Not sure where to start?</span>
          <h2>Let&apos;s talk about what your organization needs.</h2>
          <p>A short conversation is the fastest way to find out where PurveX can help.</p>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Schedule a Conversation <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </SiteChrome>
  );
}

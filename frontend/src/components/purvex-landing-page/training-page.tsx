"use client";

import { ArrowRight, FlaskConical, GraduationCap, Layers } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";

const services = [
  {
    icon: GraduationCap,
    title: "Cybersecurity Instruction",
    body: "Instructor support for cybersecurity, SOC operations, SIEM, threat detection, and incident response programs.",
  },
  {
    icon: FlaskConical,
    title: "Hands-On Security Labs",
    body: "Practical exercises designed to help learners investigate alerts, analyze threats, and understand modern security operations.",
  },
  {
    icon: Layers,
    title: "Curriculum Support",
    body: "Help developing or improving cybersecurity training content based on practical industry skills.",
  },
];

const tools = ["Microsoft Sentinel", "Splunk", "KQL / SPL", "Security+", "CySA+"];

export default function TrainingPage() {
  return (
    <SiteChrome active="training">
      {/* ═══════════ HERO ═══════════ */}
      <section className="sp-hero">
        <span className="sp-hero__badge">
          <GraduationCap size={13} /> Cybersecurity Training
        </span>
        <h1 className="sp-hero__h1">
          Practical Cybersecurity Training for the Next Generation of Security Professionals
        </h1>
        <p className="sp-hero__sub">
          PurveX partners with cybersecurity academies, workforce development programs, and
          educational organizations to provide hands-on instruction built around real-world
          security operations.
        </p>
      </section>

      {/* ═══════════ WE SUPPORT YOUR PROGRAM ═══════════ */}
      <section className="sp-section sp-section--tight">
        <div className="sp-panel" data-r>
          <span className="sp-tag">We support your existing program</span>
          <h2>You don&apos;t need to compete with your program. We work alongside it.</h2>
          <p>
            PurveX works alongside your organization to strengthen your cybersecurity curriculum
            with experienced instruction, practical labs, and real-world security scenarios.
          </p>
        </div>
      </section>

      {/* ═══════════ SERVICES ═══════════ */}
      <section className="sp-section">
        <div className="sp-cards sp-cards--3" data-r>
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
        <div className="sp-tools" data-r>
          <span className="sp-tools__label">Tools &amp; certs</span>
          <div className="sp-tools__chips">
            {tools.map((t) => (
              <span key={t} className="sp-tagchip">
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="sp-section">
        <div className="sp-cta" data-r>
          <span className="sp-tag">Looking for an instructor or training partner?</span>
          <h2>Partner With PurveX</h2>
          <p>Tell us about your program and we&apos;ll find the format that fits it best.</p>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Partner With PurveX <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <style>{`
.sp-tools { display: flex; align-items: center; gap: 12px 18px; flex-wrap: wrap; margin-top: 24px; padding: 18px 24px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface-alt) }
.sp-tools__label { font-family: var(--font-mono); font-size: .7rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--muted-dim) }
.sp-tools__chips { display: flex; flex-wrap: wrap; gap: 8px; flex: 1 }
.sp-tagchip { font-size: .74rem; font-weight: 550; color: var(--accent-deep); background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); border-radius: 999px; padding: 5px 11px }
      `}</style>
    </SiteChrome>
  );
}

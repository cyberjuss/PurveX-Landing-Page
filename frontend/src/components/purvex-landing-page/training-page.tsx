"use client";

import { ArrowRight, FlaskConical, GraduationCap, Layers, Users } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";

const courseArc = [
  { n: "01", title: "Fundamentals", body: "The groundwork every analyst needs to start strong." },
  { n: "02", title: "Threat detection", body: "Spotting suspicious activity and acting on it early." },
  { n: "03", title: "Log analysis projects", body: "Real log data, and finding what matters in the noise." },
  { n: "04", title: "Incident response", body: "An incident end to end: triage, investigate, contain, document." },
];

const formats = [
  { icon: Users, title: "1:1 & small-group instruction", body: "Live sessions, paced to the learner or cohort." },
  { icon: FlaskConical, title: "Hands-on lab projects", body: "Real scenarios, worked at your own pace." },
  { icon: GraduationCap, title: "Embedded in your program", body: "We teach inside your existing curriculum." },
];

const services = [
  {
    id: "instruction",
    icon: GraduationCap,
    title: "Cybersecurity Instruction",
    body: "Instructor support for cybersecurity, SOC operations, SIEM, threat detection, and incident response programs.",
  },
  {
    id: "labs",
    icon: FlaskConical,
    title: "Hands-On Security Labs",
    body: "Practical exercises designed to help learners investigate alerts, analyze threats, and understand modern security operations.",
  },
  {
    id: "curriculum",
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

      {/* ═══════════ COURSE ARC ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">SOC analyst readiness</span>
          <h2>A hands-on path from fundamentals to incident response.</h2>
        </div>
        <div className="sp-arc" data-r>
          {courseArc.map((s) => (
            <div key={s.title} className="sp-arc__step">
              <span className="sp-arc__num">{s.n}</span>
              <h3 className="sp-arc__title">{s.title}</h3>
              <p className="sp-arc__body">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ DELIVERY FORMATS ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">Delivery formats</span>
          <h2>Fits the way your program already runs.</h2>
        </div>
        <div className="sp-formats" data-r>
          {formats.map((f) => (
            <div key={f.title} className="sp-formats__item">
              <div className="sp-formats__icon">
                <f.icon size={18} />
              </div>
              <div>
                <h3 className="sp-formats__title">{f.title}</h3>
                <p className="sp-formats__body">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ SERVICES ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">What we offer</span>
          <h2>Three ways we support your training program.</h2>
        </div>
        <div className="sp-cards sp-cards--3" data-r>
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
.sp-arc { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px }
.sp-arc__step { position: relative; padding: 24px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface); box-shadow: 0 18px 44px -40px rgba(16,25,46,.24); transition: transform .3s var(--ease), border-color .3s }
.sp-arc__step:hover { transform: translateY(-3px); border-color: var(--border-strong) }
.sp-arc__step:not(:last-child)::after { content: ""; position: absolute; top: 33px; right: -10px; width: 9px; height: 9px; border-top: 1.5px solid var(--border-strong); border-right: 1.5px solid var(--border-strong); transform: rotate(45deg); z-index: 1 }
.sp-arc__num { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; letter-spacing: -.04em; color: var(--accent) }
.sp-arc__title { margin: 10px 0 0; font-family: var(--font-display); font-size: 1.02rem; font-weight: 650; letter-spacing: -.015em; color: var(--ink) }
.sp-arc__body { margin: 8px 0 0; color: var(--muted); font-size: .86rem; line-height: 1.6 }

.sp-formats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px }
.sp-formats__item { display: flex; align-items: flex-start; gap: 14px; padding: 22px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface-alt) }
.sp-formats__icon { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 10px; background: var(--surface); border: 1px solid var(--border-strong); color: var(--accent-deep); flex-shrink: 0 }
.sp-formats__title { margin: 0; font-family: var(--font-display); font-size: .96rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink) }
.sp-formats__body { margin: 6px 0 0; color: var(--muted); font-size: .86rem; line-height: 1.55 }

.sp-tools { display: flex; align-items: center; gap: 12px 18px; flex-wrap: wrap; margin-top: 24px; padding: 18px 24px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface-alt) }
.sp-tools__label { font-family: var(--font-mono); font-size: .7rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--muted-dim) }
.sp-tools__chips { display: flex; flex-wrap: wrap; gap: 8px; flex: 1 }
.sp-tagchip { font-size: .74rem; font-weight: 550; color: var(--accent-deep); background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); border-radius: 999px; padding: 5px 11px }

@media (max-width: 940px) {
  .sp-arc { grid-template-columns: 1fr 1fr }
  .sp-arc__step:not(:last-child)::after { display: none }
  .sp-formats { grid-template-columns: 1fr }
}
@media (max-width: 680px) { .sp-arc { grid-template-columns: 1fr } }
      `}</style>
    </SiteChrome>
  );
}

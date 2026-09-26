"use client";

import Image from "next/image";
import { ArrowRight, Linkedin } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { IconAudit, IconTune, IconValidate, IconRule, type BrandIcon } from "./brand-icons";

const bioSections = [
  {
    label: "Where I started",
    body: "Before this was a company it was three jobs, tuning Microsoft Sentinel for a federal agency, automating response in Splunk SOAR, and teaching SOC fundamentals at Ellington Cyber Academy. That work taught the same lesson, that real growth comes from hands-on repetition, not from watching someone else do the work.",
  },
  {
    label: "What actually matters",
    body: "Hands-on work is not enough once AI can write the query and summarize the alert. What still matters is knowing how to think, how to read what a system is telling you, when to trust it, and when to push back, which is the judgment I teach instead of a shortcut to a flag.",
  },
  {
    label: "Why PurveX exists",
    body: "I kept running into the same gap, that smaller security teams need stronger coverage and do not have the headcount to build and maintain it by hand. AI agents can close that gap when they are paired with someone who still understands what is happening underneath them, because no team should need to be enterprise-sized to be secure.",
  },
];

// Consulting: hands-on SIEM and detection work, booked directly with Justin.
const services: { title: string; body: string; Icon: BrandIcon }[] = [
  { title: "Detection engineering", body: "Rules written for your logs and your environment, not a vendor template.", Icon: IconRule },
  { title: "Noise reduction", body: "Tune out false alarms so a real alert is not buried under them.", Icon: IconTune },
  { title: "Coverage review", body: "Map what your SIEM can see against MITRE ATT&CK and find the gaps.", Icon: IconAudit },
  { title: "Detection validation", body: "Test that each alert actually fires, and keep the evidence.", Icon: IconValidate },
];

const steps = [
  { title: "Book 30 minutes", body: "Tell me about your SIEM, your team, and what worries you." },
  { title: "Review together", body: "We look at what fires, what does not, and where the gaps are." },
  { title: "Agree a scope", body: "A short, focused engagement with a clear result." },
];

const quickFacts = [
  { label: "Background", value: "SOC Analyst → Security Instructor" },
  { label: "Core tools", value: "Microsoft Sentinel, Splunk SOAR" },
  { label: "Certifications", value: "CySA+, Security+" },
  { label: "Currently teaching at", value: "Ellington Cyber Academy" },
];

export default function FounderPage() {
  return (
    <SiteChrome active="about">
      <section className="sp-hero sp-hero--split">
        <div className="sp-hero__copy">
          <span className="sp-hero__badge">Founder</span>
          <h1 className="sp-hero__h1">Justin Duru</h1>
          <p className="sp-hero__sub">Founder &amp; Lead Security Consultant, PurveX</p>
          <div className="sp-founder-page__links">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--sm">
              Book 30 minutes <ArrowRight size={14} />
            </a>
            <a href="#consulting" className="sp-btn sp-btn--ghost sp-btn--sm">Consulting</a>
            <a
              href="https://linkedin.com/in/jduru"
              target="_blank"
              rel="noreferrer"
              className="sp-btn sp-btn--ghost sp-btn--sm"
            >
              <Linkedin size={16} /> LinkedIn
            </a>
          </div>
        </div>
        <div className="sp-hero__preview">
          <Image
            src="/Justin.jpg"
            alt="Justin Duru"
            width={280}
            height={280}
            className="sp-founder-page__photo"
          />
        </div>
      </section>

      <section className="sp-section sp-section--tight">
        <div className="sp-founder-page__grid" data-r>
          <div className="sp-founder-page__bio">
            <p className="sp-founder-page__quote">I lead by serving the work, not standing above it.</p>
            {bioSections.map((s) => (
              <div key={s.label} className="sp-founder-page__section">
                <span className="sp-founder-page__section-label">{s.label}</span>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
          <aside className="sp-founder-page__facts">
            <h3>At a Glance</h3>
            {quickFacts.map((f) => (
              <div key={f.label} className="sp-founder-page__fact">
                <span>{f.label}</span>
                <strong>{f.value}</strong>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <section className="sp-section fc" id="consulting">
        <div className="fc__head">
          <span className="sp-founder-page__section-label">Consulting</span>
          <h2>Hands-on help with your SIEM and detections</h2>
          <p>
            I work with security teams on Microsoft Sentinel, Splunk, and the detections inside them, so the alerts you
            count on actually fire.
          </p>
        </div>
        <ul className="fc__services" data-r>
          {services.map(({ title, body, Icon }) => (
            <li key={title}>
              <i><Icon size={22} /></i>
              <strong>{title}</strong>
              <p>{body}</p>
            </li>
          ))}
        </ul>
        <div className="fc__how">
          <ol>
            {steps.map((s, n) => (
              <li key={s.title}>
                <b>{n + 1}</b>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Book 30 minutes <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <style>{`
.sp-hero.sp-hero--split { text-align: left; max-width: 1140px; display: grid; grid-template-columns: 1.05fr .95fr; gap: 56px; align-items: center }
.sp-hero--split .sp-hero__badge { margin-bottom: 22px }
.sp-hero--split .sp-hero__h1 { text-align: left }
.sp-hero--split .sp-hero__sub { margin: 22px 0 0; max-width: 480px; text-align: left }
.sp-hero__preview { display: flex; justify-content: center }
@media (max-width: 940px) {
  .sp-hero.sp-hero--split { grid-template-columns: 1fr; text-align: center; gap: 40px }
  .sp-hero--split .sp-hero__h1, .sp-hero--split .sp-hero__badge { text-align: center }
  .sp-hero--split .sp-hero__sub { margin-left: auto; margin-right: auto; text-align: center }
  .sp-founder-page__chips, .sp-founder-page__links { justify-content: center }
}

.sp-founder-page__links { display: flex; gap: 12px; margin-top: 26px }
.sp-founder-page__photo { width: 280px; height: 280px; border-radius: 50%; object-fit: cover; object-position: center 12%; box-shadow: 0 24px 48px -16px rgba(85,70,224,.4) }

/* ── Bio + facts sidebar: the old version was one undifferentiated
   680px column of prose. Labeled sections give it scannable structure;
   the facts card pulls the credentials out of the paragraphs entirely
   so the prose can stay about the story, not the resume line items. ── */
.sp-founder-page__grid { display: grid; grid-template-columns: 1fr 260px; gap: 56px; align-items: start; max-width: 940px; margin: 0 auto }
.sp-founder-page__bio .sp-founder-page__quote {
  margin: 0 0 32px; padding-left: 20px; border-left: 3px solid var(--accent);
  font-family: var(--font-display); font-size: clamp(1.2rem, 2.4vw, 1.5rem); font-weight: 650;
  letter-spacing: -.015em; line-height: 1.4; color: var(--ink);
}
.sp-founder-page__section { margin-top: 28px; padding-top: 28px; border-top: 1px solid var(--border) }
.sp-founder-page__section:first-of-type { margin-top: 0; padding-top: 0; border-top: none }
.sp-founder-page__section-label {
  display: block; margin-bottom: 10px; font-size: .74rem; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep);
}
.sp-founder-page__section p { margin: 0; font-size: 1.03rem; line-height: 1.75; color: var(--ink-soft); text-wrap: pretty }

.sp-founder-page__facts { position: sticky; top: 100px; border: 1px solid var(--border); border-radius: 20px; padding: 24px; background: var(--surface) }
.sp-founder-page__facts h3 { margin: 0 0 18px; font-size: .74rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted-dim) }
.sp-founder-page__fact { padding: 13px 0; border-top: 1px solid var(--border) }
.sp-founder-page__fact:first-of-type { padding-top: 0; border-top: none }
.sp-founder-page__fact span { display: block; font-size: .72rem; color: var(--muted); margin-bottom: 3px }
.sp-founder-page__fact strong { display: block; font-size: .88rem; font-weight: 620; color: var(--ink); line-height: 1.4 }

/* consulting */
.fc { max-width: 940px; margin: 0 auto; scroll-margin-top: 90px }
.fc__head h2 { margin: 0; font-family: var(--font-display); font-size: clamp(1.6rem, 2.8vw, 2.2rem); font-weight: 700; letter-spacing: -.025em; line-height: 1.15; color: var(--ink) }
.fc__head p { margin: 12px 0 0; max-width: 58ch; font-size: 1.03rem; line-height: 1.65; color: var(--ink-soft) }
.fc__services { list-style: none; margin: 32px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px }
.fc__services[data-r] { opacity: 1; transform: none; filter: none }
.fc__services li { padding: 22px; background: #fff; border: 1px solid var(--border); border-radius: 16px; box-shadow: 0 18px 36px -30px rgba(42,34,128,.4) }
.fc__services i { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 12px; background: var(--accent-soft); color: var(--accent-deep) }
.fc__services i svg { position: static }
.fc__services strong { display: block; margin-top: 14px; font-size: 1.05rem; font-weight: 650; color: var(--ink) }
.fc__services p { margin: 6px 0 0; font-size: .95rem; line-height: 1.55; color: var(--muted) }
.fc__how { display: flex; align-items: center; justify-content: space-between; gap: 24px 40px; margin-top: 18px; padding: 24px; border-radius: 16px; background: var(--accent-soft) }
.fc__how ol { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; flex: 1 }
.fc__how li { display: grid; grid-template-columns: auto 1fr; gap: 12px; align-items: start }
.fc__how b { display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; font-size: .82rem; color: #fff; background: var(--accent-deep) }
.fc__how strong { display: block; font-size: .96rem; font-weight: 650; color: var(--ink) }
.fc__how p { margin: 3px 0 0; font-size: .88rem; line-height: 1.45; color: var(--ink-soft) }
.fc__how .sp-btn { flex: none }

@media (max-width: 900px) {
  .fc__how { flex-direction: column; align-items: stretch }
  .fc__how ol { grid-template-columns: 1fr }
}
@media (max-width: 780px) {
  .sp-founder-page__grid { grid-template-columns: 1fr; gap: 32px }
  .sp-founder-page__facts { position: static }
}
@media (max-width: 640px) {
  .sp-founder-page__photo { width: 200px; height: 200px }
  .sp-founder-page__links { flex-wrap: wrap }
  .fc__services { grid-template-columns: 1fr }
}
      `}</style>
    </SiteChrome>
  );
}

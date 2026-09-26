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
const services: { title: string; body: string; get: string; Icon: BrandIcon }[] = [
  {
    title: "Detection engineering",
    body: "Rules written for your logs and your environment, not a vendor template.",
    get: "Tested detections, ready to run in your SIEM",
    Icon: IconRule,
  },
  {
    title: "Noise reduction",
    body: "Tune out false alarms so a real alert is not buried under them.",
    get: "A shorter, cleaner alert queue",
    Icon: IconTune,
  },
  {
    title: "Coverage review",
    body: "Map what your SIEM can see against MITRE ATT&CK and find the gaps.",
    get: "A coverage map with the gaps marked and ranked",
    Icon: IconAudit,
  },
  {
    title: "Detection validation",
    body: "Test that each alert actually fires, and keep the evidence.",
    get: "A report of which alerts fired, with evidence",
    Icon: IconValidate,
  },
];

const platforms = ["Microsoft Sentinel", "Splunk", "Splunk SOAR", "MITRE ATT&CK"];

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
        <div className="fc__panel">
          <div className="fc__intro">
            <span className="fc__label">Consulting</span>
            <h2>Hands-on help with your SIEM and detections</h2>
            <p>
              I work with security teams on the detections inside their SIEM, so the alerts they count on actually fire.
            </p>
            <ul className="fc__tags" aria-label="Platforms">
              {platforms.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg fc__cta">
              Book 30 minutes <ArrowRight size={16} />
            </a>
          </div>

          <ol className="fc__services" data-r>
            {services.map(({ title, body, get, Icon }, n) => (
              <li key={title}>
                <i><Icon size={22} /></i>
                <div>
                  <span className="fc__n">{String(n + 1).padStart(2, "0")}</span>
                  <strong>{title}</strong>
                  <p>{body}</p>
                  <em>You get: {get}</em>
                </div>
              </li>
            ))}
          </ol>

          <div className="fc__how">
            <span className="fc__label">How it works</span>
            <ol>
              {steps.map((st, n) => (
                <li key={st.title}>
                  <b>{n + 1}</b>
                  <strong>{st.title}</strong>
                  <p>{st.body}</p>
                </li>
              ))}
            </ol>
          </div>
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
.fc { max-width: 1080px; margin: 0 auto; scroll-margin-top: 90px }
.fc__panel {
  display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); gap: 40px 56px; padding: clamp(28px, 4vw, 48px);
  border-radius: 24px; background: linear-gradient(160deg, #f4f3ff 0%, #fbfbff 55%, #fff 100%); border: 1px solid rgba(106,92,255,.18);
  box-shadow: 0 40px 80px -60px rgba(42,34,128,.45);
}
.fc__label { display: block; font-size: .74rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep) }
.fc__intro { align-self: start; position: sticky; top: 104px }
.fc__intro h2 { margin: 12px 0 0; font-family: var(--font-display); font-size: clamp(1.7rem, 3vw, 2.35rem); font-weight: 700; letter-spacing: -.03em; line-height: 1.12; color: var(--ink); text-wrap: balance }
.fc__intro > p { margin: 14px 0 0; max-width: 40ch; font-size: 1.03rem; line-height: 1.65; color: var(--ink-soft) }
.fc__tags { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; margin: 20px 0 0; padding: 0 }
.fc__tags li { padding: 6px 12px; border-radius: 999px; background: #fff; border: 1px solid rgba(106,92,255,.22); font-size: .82rem; font-weight: 600; color: var(--ink-soft) }
.fc__cta { margin-top: 28px }

.fc__services { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px }
.fc__services[data-r] { opacity: 1; transform: none; filter: none }
.fc__services li {
  display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 18px; padding: 20px 22px; border-radius: 18px;
  background: #fff; border: 1px solid #ebebf5; box-shadow: 0 14px 30px -26px rgba(42,34,128,.5);
  opacity: 0; transform: translateY(12px);
  transition: opacity .6s var(--ease), transform .6s var(--ease), border-color .25s, box-shadow .25s;
}
.fc__services.in li { opacity: 1; transform: none }
.fc__services.in li:nth-child(2) { transition-delay: .08s, .08s, 0s, 0s }
.fc__services.in li:nth-child(3) { transition-delay: .16s, .16s, 0s, 0s }
.fc__services.in li:nth-child(4) { transition-delay: .24s, .24s, 0s, 0s }
.fc__services li:hover { border-color: rgba(106,92,255,.4); box-shadow: 0 20px 40px -26px rgba(85,70,224,.55) }
.fc__services i { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 14px; background: var(--accent-soft); color: var(--accent-deep); transition: background .25s, color .25s }
.fc__services li:hover i { background: var(--accent-deep); color: #fff }
.fc__services i svg { position: static }
.fc__n { display: block; font-family: var(--font-mono); font-size: .72rem; font-weight: 700; color: var(--muted-dim, #9a9cb8) }
.fc__services strong { display: block; margin-top: 2px; font-size: 1.1rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink) }
.fc__services p { margin: 5px 0 0; font-size: .95rem; line-height: 1.55; color: var(--ink-soft) }
.fc__services em {
  display: inline-block; margin-top: 12px; padding: 5px 10px; border-radius: 8px; font-style: normal;
  font-size: .82rem; font-weight: 600; color: #166534; background: #ecfdf3;
}

.fc__how { grid-column: 1 / -1; padding-top: 28px; border-top: 1px solid rgba(106,92,255,.16) }
.fc__how ol { position: relative; list-style: none; margin: 18px 0 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px }
.fc__how ol::before { content: ""; position: absolute; left: 18px; right: calc((100% - 48px) / 3 - 18px); top: 18px; height: 2px; background: linear-gradient(90deg, var(--accent), rgba(106,92,255,.2)) }
.fc__how li { position: relative }
.fc__how b {
  position: relative; display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%;
  font-size: .9rem; color: #fff; background: var(--accent-deep); box-shadow: 0 0 0 5px #f7f6ff;
}
.fc__how strong { display: block; margin-top: 14px; font-size: 1rem; font-weight: 650; color: var(--ink) }
.fc__how p { margin: 4px 0 0; max-width: 30ch; font-size: .9rem; line-height: 1.5; color: var(--ink-soft) }

@media (prefers-reduced-motion: reduce) {
  .fc__services li { opacity: 1; transform: none; transition: none }
}
@media (max-width: 900px) {
  .fc__panel { grid-template-columns: minmax(0, 1fr) }
  .fc__intro { position: static }
  .fc__how ol { grid-template-columns: minmax(0, 1fr); gap: 20px }
  .fc__how ol::before { left: 17px; right: auto; top: 18px; bottom: 18px; width: 2px; height: auto }
  .fc__how li { padding-left: 52px }
  .fc__how b { position: absolute; left: 0; top: 0 }
  .fc__how strong { margin-top: 6px }
}
@media (max-width: 780px) {
  .sp-founder-page__grid { grid-template-columns: 1fr; gap: 32px }
  .sp-founder-page__facts { position: static }
}
@media (max-width: 640px) {
  .sp-founder-page__photo { width: 200px; height: 200px }
  .sp-founder-page__links { flex-wrap: wrap }
  .fc__services li { grid-template-columns: minmax(0, 1fr); gap: 12px; padding: 18px }
  .fc__panel { padding: 22px 16px; border-radius: 20px }
}
      `}</style>
    </SiteChrome>
  );
}

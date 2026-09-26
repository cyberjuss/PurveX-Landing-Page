"use client";

import Image from "next/image";
import { ArrowRight, Linkedin } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";
import { IconAudit, IconTune, IconValidate, IconRule, type BrandIcon } from "./brand-icons";

/* Founder. Who Justin is, the story behind PurveX, and the consulting he
   offers, in the same skin as the About page. */

const facts = [
  { label: "Background", value: "SOC analyst to security instructor" },
  { label: "Core tools", value: "Microsoft Sentinel, Splunk SOAR" },
  { label: "Certifications", value: "CySA+, Security+" },
  { label: "Teaching at", value: "Ellington Cyber Academy" },
];

const story = [
  {
    title: "Where I started",
    body: "Before this was a company it was three jobs: tuning Microsoft Sentinel for a federal agency, automating response in Splunk SOAR, and teaching SOC fundamentals at Ellington Cyber Academy. All three taught the same lesson. Real growth comes from hands-on repetition, not from watching someone else do the work.",
  },
  {
    title: "What actually matters",
    body: "Hands-on work is not enough once AI can write the query and summarize the alert. What still matters is knowing how to think: how to read what a system is telling you, when to trust it, and when to push back. That judgment is what I teach, instead of a shortcut to a flag.",
  },
  {
    title: "Why PurveX exists",
    body: "I kept running into the same gap. Smaller security teams need stronger coverage and do not have the headcount to build and maintain it by hand. AI agents can close that gap when they are paired with someone who understands what is happening underneath them, because no team should need to be enterprise-sized to be secure.",
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

export default function FounderPage() {
  return (
    <SiteChrome active="about">
      <section className="fd-hero">
        <div className="fd-hero__copy">
          <span className="sp-tag">Founder</span>
          <h1>Justin Duru</h1>
          <p className="fd-hero__role">Founder and Lead Security Consultant, PurveX</p>
          <p className="fd-hero__sub">
            I help security teams make sure their alerts actually fire, and I train the analysts who will run them.
          </p>
          <div className="fd-hero__actions">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <a href="https://linkedin.com/in/jduru" target="_blank" rel="noreferrer" className="sp-btn sp-btn--ghost sp-btn--lg">
              <Linkedin size={16} /> LinkedIn
            </a>
          </div>
        </div>
        <div className="fd-hero__photo">
          <Image src="/Justin.jpg" alt="Justin Duru" width={440} height={520} priority />
        </div>
      </section>

      <ul className="fd-facts">
        {facts.map((f) => (
          <li key={f.label}>
            <span>{f.label}</span>
            <strong>{f.value}</strong>
          </li>
        ))}
      </ul>

      <section className="pg-section" id="story">
        <div className="fd-story">
          <div className="fd-story__side">
            <h2>My story</h2>
            <blockquote>I lead by serving the work, not standing above it.</blockquote>
          </div>
          <ol data-r>
            {story.map((s, n) => (
              <li key={s.title}>
                <b>{n + 1}</b>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pg-section fd-consult" id="consulting">
        <div className="fd-consult__head">
          <div>
            <span className="fd-label">Consulting</span>
            <h2>Hands-on help with your SIEM and detections</h2>
            <p>I work with security teams on the detections inside their SIEM, so the alerts they count on actually fire.</p>
          </div>
          <ul className="fd-tags" aria-label="Platforms">
            {platforms.map((t) => <li key={t}>{t}</li>)}
          </ul>
        </div>

        <ul className="fd-services" data-r>
          {services.map(({ title, body, get, Icon }) => (
            <li key={title}>
              <i><Icon size={22} /></i>
              <strong>{title}</strong>
              <p>{body}</p>
              <em>You get: {get}</em>
            </li>
          ))}
        </ul>

        <div className="fd-how">
          <ol>
            {steps.map((st, n) => (
              <li key={st.title}>
                <b>{n + 1}</b>
                <div>
                  <strong>{st.title}</strong>
                  <p>{st.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Book 30 minutes <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <h2>Let&apos;s talk</h2>
          <p className="pg-close__sub">Thirty minutes about your SIEM, your team, or your training program.</p>
          <div className="pg-close__row">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="pg-close__book">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <a href="https://linkedin.com/in/jduru" target="_blank" rel="noreferrer" className="pg-close__more">
              Connect on LinkedIn <ArrowRight size={14} />
            </a>
          </div>
        </div>
        <HoldCard source="founder" />
      </section>

      <style>{PG_CSS}</style>
      <style>{FD_CSS}</style>
    </SiteChrome>
  );
}

const FD_CSS = `
/* hero */
.fd-hero { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); gap: 40px 72px; align-items: center; padding: clamp(40px, 6vw, 80px) 0 0 }
.fd-hero h1 { margin: 18px 0 0; font-family: var(--font-display); font-weight: 500; font-size: clamp(2.8rem, 6vw, 4.6rem); line-height: 1; letter-spacing: -.05em; color: var(--ink) }
.fd-hero__role { margin: 14px 0 0; font-size: 1.05rem; font-weight: 600; color: var(--accent-deep) }
.fd-hero__sub { margin: 18px 0 0; max-width: 44ch; font-size: 1.12rem; line-height: 1.6; color: var(--ink-soft) }
.fd-hero__actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 30px }
.fd-hero__actions .sp-btn svg { position: static }
.fd-hero__photo { position: relative; justify-self: end; width: min(100%, 400px) }
.fd-hero__photo::before { content: ""; position: absolute; inset: 22px -22px -22px 22px; background: var(--accent-soft); border: 1px solid rgba(106,92,255,.25) }
.fd-hero__photo img {
  position: relative; display: block; width: 100%; height: auto; aspect-ratio: 440 / 520; object-fit: cover; object-position: center 18%;
  box-shadow: 0 40px 80px -40px rgba(42,34,128,.5);
}

/* facts */
.fd-facts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); list-style: none; margin: clamp(48px, 6vw, 72px) 0 0; padding: 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border) }
.fd-facts li { padding: 20px 24px 20px 0 }
.fd-facts li + li { padding-left: 24px; border-left: 1px solid var(--border) }
.fd-facts span { display: block; font-size: .8rem; font-weight: 600; color: var(--muted) }
.fd-facts strong { display: block; margin-top: 4px; font-size: 1rem; font-weight: 650; line-height: 1.35; color: var(--ink) }

/* story */
.fd-story { display: grid; grid-template-columns: minmax(0, 320px) minmax(0, 1fr); gap: 32px 72px; align-items: start }
.fd-story__side { position: sticky; top: 104px }
.fd-story h2 { margin: 0; font-family: var(--font-display); font-weight: 700; letter-spacing: -.022em; line-height: 1.15; font-size: clamp(1.6rem, 2.6vw, 2.1rem); color: var(--ink) }
.fd-story blockquote {
  margin: 20px 0 0; padding-left: 18px; border-left: 3px solid var(--accent);
  font-family: var(--font-display); font-size: 1.25rem; font-weight: 500; line-height: 1.4; letter-spacing: -.015em; color: var(--ink);
}
.fd-story ol { position: relative; list-style: none; margin: 0; padding: 0; display: grid; gap: 32px }
.fd-story ol[data-r] { opacity: 1; transform: none; filter: none }
.fd-story ol::before { content: ""; position: absolute; left: 17px; top: 36px; bottom: 36px; width: 2px; background: rgba(106,92,255,.2) }
.fd-story li { position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 20px; opacity: 0; transform: translateY(12px); transition: opacity .6s var(--ease), transform .6s var(--ease) }
.fd-story ol.in li { opacity: 1; transform: none }
.fd-story ol.in li:nth-child(2) { transition-delay: .1s }
.fd-story ol.in li:nth-child(3) { transition-delay: .2s }
.fd-story li b { display: grid; place-items: center; width: 36px; height: 36px; font-size: .9rem; color: #fff; background: var(--accent-deep); box-shadow: 0 0 0 6px #fbfcfe }
.fd-story li strong { display: block; margin-top: 6px; font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; letter-spacing: -.02em; color: var(--ink) }
.fd-story li p { margin: 10px 0 0; max-width: 62ch; font-size: 1.02rem; line-height: 1.7; color: var(--ink-soft); text-wrap: pretty }

/* consulting */
.fd-consult { scroll-margin-top: 84px }
.fd-label { display: block; font-size: .82rem; font-weight: 700; color: var(--accent-deep) }
.fd-consult__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px 48px; margin-bottom: 32px }
.fd-consult__head h2 { margin: 10px 0 0; max-width: 20ch; font-family: var(--font-display); font-weight: 700; letter-spacing: -.025em; line-height: 1.12; font-size: clamp(1.7rem, 3vw, 2.35rem); color: var(--ink) }
.fd-consult__head p { margin: 12px 0 0; max-width: 52ch; font-size: 1.02rem; line-height: 1.6; color: var(--ink-soft) }
.fd-tags { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; max-width: 360px; list-style: none; margin: 0; padding: 0 }
.fd-tags li { padding: 6px 12px; background: #fff; border: 1px solid var(--border-strong); font-size: .82rem; font-weight: 600; color: var(--ink-soft) }

.fd-services { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px }
.fd-services[data-r] { opacity: 1; transform: none; filter: none }
.fd-services li {
  display: flex; flex-direction: column; padding: 24px 22px; background: #fff; border: 1px solid var(--border-strong); border-top: 3px solid var(--accent);
  box-shadow: 0 22px 44px -34px rgba(42,34,128,.4);
  opacity: 0; transform: translateY(14px); transition: opacity .6s var(--ease), transform .6s var(--ease), box-shadow .25s;
}
.fd-services.in li { opacity: 1; transform: none }
.fd-services.in li:nth-child(2) { transition-delay: .08s, .08s, 0s }
.fd-services.in li:nth-child(3) { transition-delay: .16s, .16s, 0s }
.fd-services.in li:nth-child(4) { transition-delay: .24s, .24s, 0s }
.fd-services li:hover { box-shadow: 0 28px 52px -32px rgba(85,70,224,.55) }
.fd-services i { display: grid; place-items: center; width: 44px; height: 44px; background: var(--accent-soft); color: var(--accent-deep) }
.fd-services i svg { position: static }
.fd-services strong { display: block; margin-top: 18px; font-size: 1.08rem; font-weight: 650; color: var(--ink) }
.fd-services p { margin: 6px 0 0; font-size: .93rem; line-height: 1.55; color: var(--ink-soft) }
.fd-services em { margin-top: auto; padding-top: 16px; font-style: normal; font-size: .84rem; font-weight: 650; line-height: 1.4; color: #166534 }

.fd-how { display: flex; align-items: center; gap: 24px 40px; margin-top: 16px; padding: 24px 28px; background: var(--accent-soft); border: 1px solid rgba(106,92,255,.16) }
.fd-how ol { flex: 1; list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px }
.fd-how li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 12px }
.fd-how b { display: grid; place-items: center; width: 28px; height: 28px; font-size: .82rem; color: #fff; background: var(--accent-deep) }
.fd-how strong { display: block; font-size: .98rem; font-weight: 650; color: var(--ink) }
.fd-how p { margin: 3px 0 0; font-size: .88rem; line-height: 1.45; color: var(--ink-soft) }
.fd-how .sp-btn { flex: none }
.fd-how .sp-btn svg { position: static }

@media (prefers-reduced-motion: reduce) {
  .fd-story li, .fd-services li { opacity: 1; transform: none; transition: none }
}
@media (max-width: 1080px) {
  .fd-services { grid-template-columns: repeat(2, minmax(0, 1fr)) }
  .fd-how { flex-direction: column; align-items: stretch }
}
@media (max-width: 900px) {
  .fd-hero { grid-template-columns: minmax(0, 1fr) }
  .fd-hero__photo { justify-self: start; width: min(100%, 340px); margin-right: 22px }
  .fd-facts { grid-template-columns: repeat(2, minmax(0, 1fr)) }
  .fd-facts li:nth-child(3) { padding-left: 0; border-left: 0 }
  .fd-facts li:nth-child(n+3) { border-top: 1px solid var(--border) }
  .fd-story { grid-template-columns: minmax(0, 1fr) }
  .fd-story__side { position: static }
  .fd-consult__head { flex-direction: column; align-items: flex-start }
  .fd-tags { justify-content: flex-start }
  .fd-how ol { grid-template-columns: minmax(0, 1fr) }
}
@media (max-width: 600px) {
  .fd-facts { grid-template-columns: minmax(0, 1fr) }
  .fd-facts li, .fd-facts li + li { padding: 16px 0; border-left: 0 }
  .fd-facts li + li { border-top: 1px solid var(--border) }
  .fd-services { grid-template-columns: minmax(0, 1fr) }
  .fd-how { padding: 20px 16px }
}
`;

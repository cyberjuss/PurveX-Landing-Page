"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { ArrowRight, Check, Linkedin } from "lucide-react";
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
const services: { title: string; short: string; body: string; problem: string; does: string[]; get: string; Icon: BrandIcon }[] = [
  {
    title: "Detection engineering",
    short: "New rules for your logs",
    body: "Rules written for your logs and your environment, not a vendor template.",
    problem: "Your SIEM runs vendor rules that were never written for your logs, so real attacks slip past without an alert.",
    does: [
      "Review the logs you already collect",
      "Write rules mapped to MITRE ATT&CK techniques",
      "Test each rule against real attack behavior before handing it over",
    ],
    get: "Tested detections, ready to run in your SIEM",
    Icon: IconRule,
  },
  {
    title: "Noise reduction",
    short: "Fewer false alarms",
    body: "Tune out false alarms so a real alert is not buried under them.",
    problem: "Your analysts spend the day closing false alarms, and the one real alert gets lost in the pile.",
    does: [
      "Find the rules that fire most without a real threat behind them",
      "Tune the logic, thresholds, and exclusions",
      "Record every change and the reason for it",
    ],
    get: "A shorter, cleaner alert queue",
    Icon: IconTune,
  },
  {
    title: "Coverage review",
    short: "Know where the gaps are",
    body: "Map what your SIEM can see against MITRE ATT&CK and find the gaps.",
    problem: "Nobody can say which attacks your SIEM would catch, so leadership is guessing and the gaps stay hidden.",
    does: [
      "List your data sources and the detections you already have",
      "Map both to MITRE ATT&CK",
      "Rank the gaps by the risk they pose to your environment",
    ],
    get: "A coverage map with the gaps marked and ranked",
    Icon: IconAudit,
  },
  {
    title: "Detection validation",
    short: "Proof your alerts fire",
    body: "Test that each alert actually fires, and keep the evidence.",
    problem: "Your rules look fine on paper, but nobody has checked that they fire when an attack actually happens.",
    does: [
      "Run safe attack simulations with Atomic Red Team",
      "Check which alerts fired and where the rest broke",
      "Hand over evidence you can show leadership or auditors",
    ],
    get: "A report of which alerts fired, with evidence",
    Icon: IconValidate,
  },
];


function ServiceExplorer() {
  const [on, setOn] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const s = services[on];

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (on + d + services.length) % services.length;
    setOn(n);
    tabs.current[n]?.focus();
  }

  return (
    <div className="fx">
      <div className="fx__list" role="tablist" aria-label="Consulting services" aria-orientation="vertical" onKeyDown={onKey}>
        {services.map((x, n) => (
          <button
            key={x.title}
            ref={(el) => { tabs.current[n] = el; }}
            type="button"
            role="tab"
            id={`fx-tab-${n}`}
            aria-selected={n === on}
            aria-controls="fx-panel"
            tabIndex={n === on ? 0 : -1}
            onClick={() => setOn(n)}
          >
            <i><x.Icon size={20} /></i>
            <span>
              <strong>{x.title}</strong>
              <small>{x.short}</small>
            </span>
            <ArrowRight size={16} className="fx__arrow" />
          </button>
        ))}
      </div>

      <div className="fx__panel" role="tabpanel" id="fx-panel" aria-labelledby={`fx-tab-${on}`} key={s.title}>
        <div className="fx__top">
          <i><s.Icon size={26} /></i>
          <div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </div>
        </div>
        <div className="fx__problem">
          <span>The problem</span>
          <p>{s.problem}</p>
        </div>
        <div className="fx__does">
          <span>What I do</span>
          <ul>
            {s.does.map((d) => (
              <li key={d}><b><Check size={12} strokeWidth={3} /></b>{d}</li>
            ))}
          </ul>
        </div>
        <div className="fx__get">
          <div>
            <span>You get</span>
            <strong>{s.get}</strong>
          </div>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Book a call about this <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

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
          <span className="fd-label">Consulting</span>
          <h2>Hands-on help with your SIEM and detections</h2>
          <p>
            I work with security teams on the detections inside their SIEM, so the alerts they count on actually fire. It is
            built for small teams that need senior detection help without hiring for it.
          </p>
          <p className="fd-works">
            <span>Works in</span>
            Microsoft Sentinel, Splunk, and Splunk SOAR
          </p>
        </div>

        <ServiceExplorer />

        <div className="fd-how">
          <span className="fd-label">How it works</span>
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
.fd-consult__head { max-width: 640px; margin-bottom: 44px }
.fd-consult__head h2 { margin: 10px 0 0; font-family: var(--font-display); font-weight: 700; letter-spacing: -.025em; line-height: 1.12; font-size: clamp(1.7rem, 3vw, 2.35rem); color: var(--ink); text-wrap: balance }
.fd-consult__head p { margin: 12px 0 0; max-width: 52ch; font-size: 1.02rem; line-height: 1.6; color: var(--ink-soft) }
.fd-works { font-size: .92rem !important; color: var(--ink) !important; font-weight: 600 }
.fd-works span { margin-right: 8px; font-weight: 600; color: var(--muted) }

/* service explorer */
.fx { display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); background: #fff; border: 1px solid var(--border-strong); box-shadow: 0 40px 80px -56px rgba(42,34,128,.45) }
.fx__list { display: flex; flex-direction: column; padding: 10px; background: #f8f8fd; border-right: 1px solid var(--border) }
.fx__list button {
  position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 14px;
  width: 100%; padding: 16px 14px; text-align: left; background: transparent; border: 1px solid transparent; cursor: pointer; color: var(--ink);
  transition: background .2s, border-color .2s, box-shadow .2s;
}
.fx__list button + button { margin-top: 4px }
.fx__list button:hover { background: #fff }
.fx__list button[aria-selected="true"] { background: #fff; border-color: var(--border); box-shadow: 0 12px 26px -20px rgba(42,34,128,.5) }
.fx__list button[aria-selected="true"]::before { content: ""; position: absolute; left: -1px; top: -1px; bottom: -1px; width: 3px; background: var(--accent) }
.fx__list button:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px }
.fx__list i { display: grid; place-items: center; width: 40px; height: 40px; background: var(--accent-soft); color: var(--accent-deep); transition: background .2s, color .2s }
.fx__list i svg { position: static }
.fx__list button[aria-selected="true"] i { background: var(--accent-deep); color: #fff }
.fx__list strong { display: block; font-size: 1rem; font-weight: 650 }
.fx__list small { display: block; margin-top: 2px; font-size: .84rem; color: var(--muted) }
.fx__arrow { position: static; color: var(--accent-deep); opacity: 0; transform: translateX(-4px); transition: opacity .2s, transform .2s }
.fx__list button[aria-selected="true"] .fx__arrow { opacity: 1; transform: none }

.fx__panel { display: flex; flex-direction: column; gap: 22px; padding: clamp(24px, 3.5vw, 40px); animation: fx-in .35s cubic-bezier(.16,1,.3,1) both }
.fx__top { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 18px; align-items: start }
.fx__top i { display: grid; place-items: center; width: 56px; height: 56px; background: var(--accent); color: #fff; box-shadow: 0 16px 30px -16px rgba(85,70,224,.8) }
.fx__top i svg { position: static }
.fx__top h3 { margin: 4px 0 0; font-family: var(--font-display); font-size: 1.6rem; font-weight: 600; letter-spacing: -.03em; color: var(--ink) }
.fx__top p { margin: 6px 0 0; max-width: 52ch; font-size: 1.02rem; line-height: 1.55; color: var(--ink-soft) }
.fx__problem { padding: 14px 16px; background: #fef6f5; border-left: 3px solid #e5484d }
.fx__problem span { display: block; font-size: .8rem; font-weight: 700; color: #b42318 }
.fx__problem p { margin: 4px 0 0; max-width: 60ch; font-size: .98rem; line-height: 1.5; color: var(--ink) }
.fx__does span, .fx__get span { display: block; font-size: .8rem; font-weight: 700; color: var(--muted) }
.fx__does ul { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 12px }
.fx__does li { display: flex; align-items: flex-start; gap: 12px; font-size: .98rem; line-height: 1.45; color: var(--ink) }
.fx__does li b { display: grid; place-items: center; width: 22px; height: 22px; flex: none; margin-top: 1px; color: #fff; background: var(--accent-deep) }
.fx__does li b svg { position: static }
.fx__get { display: flex; align-items: center; justify-content: space-between; gap: 16px 24px; margin-top: auto; padding: 18px 20px; background: #f0fdf4; border: 1px solid rgba(22,163,74,.25) }
.fx__get span { color: #15803d }
.fx__get strong { display: block; margin-top: 3px; font-size: 1.05rem; font-weight: 650; color: #14532d }
.fx__get .sp-btn { flex: none }
.fx__get .sp-btn svg { position: static }
@keyframes fx-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }

/* how it works */
.fd-how { margin-top: clamp(64px, 8vw, 96px); padding-top: clamp(40px, 5vw, 56px); border-top: 1px solid var(--border) }
.fd-how ol { position: relative; list-style: none; margin: 24px 0 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px }
.fd-how ol::before { content: ""; position: absolute; left: 18px; right: calc((100% - 48px) / 3 - 18px); top: 18px; height: 2px; background: linear-gradient(90deg, var(--accent), rgba(106,92,255,.2)) }
.fd-how li { position: relative }
.fd-how b { position: relative; display: grid; place-items: center; width: 36px; height: 36px; font-size: .9rem; color: #fff; background: var(--accent-deep); box-shadow: 0 0 0 6px #fbfcfe }
.fd-how strong { display: block; margin-top: 14px; font-size: 1.02rem; font-weight: 650; color: var(--ink) }
.fd-how p { margin: 4px 0 0; max-width: 30ch; font-size: .92rem; line-height: 1.5; color: var(--ink-soft) }

@media (prefers-reduced-motion: reduce) {
  .fd-story li { opacity: 1; transform: none; transition: none }
  .fx__panel { animation: none }
}
@media (max-width: 1080px) {
  .fx { grid-template-columns: minmax(0, 280px) minmax(0, 1fr) }
  .fx__get { flex-direction: column; align-items: stretch }
}
@media (max-width: 900px) {
  .fd-hero { grid-template-columns: minmax(0, 1fr) }
  .fd-hero__photo { justify-self: start; width: min(100%, 340px); margin-right: 22px }
  .fd-facts { grid-template-columns: repeat(2, minmax(0, 1fr)) }
  .fd-facts li:nth-child(3) { padding-left: 0; border-left: 0 }
  .fd-facts li:nth-child(n+3) { border-top: 1px solid var(--border) }
  .fd-story { grid-template-columns: minmax(0, 1fr) }
  .fd-story__side { position: static }
  .fx { grid-template-columns: minmax(0, 1fr) }
  .fx__list { flex-direction: row; overflow-x: auto; gap: 6px; border-right: 0; border-bottom: 1px solid var(--border); scroll-snap-type: x mandatory }
  .fx__list button { flex: none; width: 230px; scroll-snap-align: start }
  .fx__list button + button { margin-top: 0 }
  .fx__arrow { display: none }
  .fd-how ol { grid-template-columns: minmax(0, 1fr); gap: 20px }
  .fd-how ol::before { left: 17px; right: auto; top: 18px; bottom: 18px; width: 2px; height: auto }
  .fd-how li { padding-left: 54px }
  .fd-how b { position: absolute; left: 0; top: 0 }
  .fd-how strong { margin-top: 6px }
}
@media (max-width: 600px) {
  .fd-facts { grid-template-columns: minmax(0, 1fr) }
  .fd-facts li, .fd-facts li + li { padding: 16px 0; border-left: 0 }
  .fd-facts li + li { border-top: 1px solid var(--border) }
  .fx__panel { padding: 22px 16px }
  .fx__top { grid-template-columns: minmax(0, 1fr) }
}
`;

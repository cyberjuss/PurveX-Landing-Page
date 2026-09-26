"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Image from "next/image";
import { ArrowRight, CalendarClock, Check, Database, Linkedin, Users } from "lucide-react";
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
    body: "I kept running into two gaps. Smaller security teams need stronger coverage and do not have the headcount to build and maintain it by hand. And new analysts finish their training knowing the terms but not the work, because they never practiced on a real network. PurveX takes on both. AI agents can close the coverage gap when they are paired with someone who understands what is happening underneath, and hands-on training builds the analysts who will be that someone. No team should need to be enterprise-sized to be secure.",
  },
];

// Consulting: hands-on SIEM and detection work, booked directly with Justin.
const services: { pain: string; title: string; short: string; body: string; problem: string; does: string[]; get: string; Icon: BrandIcon }[] = [
  {
    pain: "Real attacks slip past our alerts",
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
    pain: "We drown in false alarms",
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
    pain: "We can't see where the gaps are",
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
    pain: "We're not sure our alerts fire",
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


const steps = [
  { title: "Book 30 minutes", body: "Tell me about your SIEM, your team, and what worries you." },
  { title: "Review together", body: "We look at what fires, what does not, and where the gaps are." },
  { title: "Agree a scope", body: "A short, focused engagement with a clear result." },
];

// Consulting told from the buyer's side: pick what is going wrong, and see
// the service that fixes it, what I do, and what you get.
function ProblemPicker() {
  const [on, setOn] = useState(0);
  const opts = useRef<(HTMLButtonElement | null)[]>([]);
  const x = services[on];

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (on + d + services.length) % services.length;
    setOn(n);
    opts.current[n]?.focus();
  }

  return (
    <div className="pp">
      <p className="pp__ask" id="pp-ask">What is going wrong on your team?</p>
      <div className="pp__opts" role="radiogroup" aria-labelledby="pp-ask" onKeyDown={onKey}>
        {services.map((o, n) => (
          <button
            key={o.title}
            ref={(el) => { opts.current[n] = el; }}
            type="button"
            role="radio"
            aria-checked={n === on}
            tabIndex={n === on ? 0 : -1}
            onClick={() => setOn(n)}
          >
            <i aria-hidden="true">{n === on ? <Check size={14} strokeWidth={3} /> : null}</i>
            <span>&ldquo;{o.pain}&rdquo;</span>
          </button>
        ))}
      </div>

      <div className="pp__answer" key={x.title} aria-live="polite">
        <div className="pp__col pp__col--why">
          <span className="pp__tag">The fix</span>
          <div className="pp__svc">
            <i><x.Icon size={22} /></i>
            <h3>{x.title}</h3>
          </div>
          <p className="pp__problem">{x.problem}</p>
        </div>
        <div className="pp__col">
          <span className="pp__tag">What&apos;s included</span>
          <ul>
            {x.does.map((d) => (
              <li key={d}><b><Check size={12} strokeWidth={3} /></b>{d}</li>
            ))}
          </ul>
        </div>
        <div className="pp__col pp__col--get">
          <span className="pp__tag">You get</span>
          <strong>{x.get}</strong>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Book a call <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

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
          <div className="fd-consult__intro">
            <span className="fd-label">Consulting</span>
            <h2>Hands-on help with your SIEM and detections</h2>
            <p>Senior detection help for security teams, so the alerts they count on actually fire.</p>
          </div>
          <dl className="fd-glance">
            <div>
              <dt><Users size={16} /> Built for</dt>
              <dd>Small security teams without a full-time detection engineer</dd>
            </div>
            <div>
              <dt><Database size={16} /> Works in</dt>
              <dd className="fd-glance__chips">
                <span>Microsoft Sentinel</span>
                <span>Splunk</span>
                <span>Splunk SOAR</span>
              </dd>
            </div>
            <div>
              <dt><CalendarClock size={16} /> Starts with</dt>
              <dd>A 30-minute call about your SIEM and your team</dd>
            </div>
          </dl>
        </div>

        <ProblemPicker />

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
.fd-consult__head { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, .9fr); gap: 32px 56px; align-items: end; margin-bottom: 48px }
.fd-consult__head h2 { margin: 10px 0 0; font-family: var(--font-display); font-weight: 700; letter-spacing: -.025em; line-height: 1.12; font-size: clamp(1.7rem, 3vw, 2.35rem); color: var(--ink); text-wrap: balance }
.fd-consult__head p { margin: 12px 0 0; max-width: 52ch; font-size: 1.02rem; line-height: 1.6; color: var(--ink-soft) }
.fd-glance { margin: 0; background: #fff; border: 1px solid var(--border-strong); box-shadow: 0 24px 48px -38px rgba(42,34,128,.45) }
.fd-glance > div { display: grid; grid-template-columns: 124px minmax(0, 1fr); gap: 16px; align-items: center; padding: 14px 18px }
.fd-glance > div + div { border-top: 1px solid var(--border) }
.fd-glance dt { display: flex; align-items: center; gap: 8px; font-size: .82rem; font-weight: 700; color: var(--accent-deep) }
.fd-glance dt svg { position: static; flex: none }
.fd-glance dd { margin: 0; font-size: .94rem; font-weight: 550; line-height: 1.45; color: var(--ink) }
.fd-glance__chips { display: flex; flex-wrap: wrap; gap: 6px }
.fd-glance__chips span { padding: 3px 9px; background: var(--accent-soft); font-size: .82rem; font-weight: 650; color: var(--accent-deep) }

/* problem picker */
.pp__ask { margin: 0; font-family: var(--font-display); font-size: clamp(1.25rem, 2vw, 1.5rem); font-weight: 600; letter-spacing: -.02em; color: var(--ink) }
.pp__opts { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 18px }
.pp__opts button {
  display: flex; align-items: center; gap: 12px; min-height: 72px; padding: 14px 16px; text-align: left; cursor: pointer;
  background: #fff; border: 1px solid var(--border-strong); color: var(--ink); font-size: .98rem; font-weight: 600; line-height: 1.35;
  transition: border-color .2s, background .2s, box-shadow .2s, transform .2s;
}
.pp__opts button:hover { border-color: rgba(106,92,255,.45); transform: translateY(-2px) }
.pp__opts button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
.pp__opts button[aria-checked="true"] { background: var(--accent-soft); border-color: var(--accent); box-shadow: 0 16px 32px -24px rgba(85,70,224,.7); transform: none }
.pp__opts i { display: grid; place-items: center; width: 22px; height: 22px; flex: none; border: 2px solid var(--border-strong); color: #fff; transition: background .2s, border-color .2s }
.pp__opts i svg { position: static }
.pp__opts button[aria-checked="true"] i { background: var(--accent-deep); border-color: var(--accent-deep) }

.pp__answer {
  position: relative; display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr) minmax(0, .85fr); margin-top: 16px;
  background: #fff; border: 1px solid var(--border-strong); box-shadow: 0 40px 80px -56px rgba(42,34,128,.45);
  animation: pp-in .4s cubic-bezier(.16,1,.3,1) both;
}
.pp__answer::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px; background: linear-gradient(90deg, var(--accent-deep), var(--accent)) }
.pp__col { padding: clamp(22px, 3vw, 32px) }
.pp__col + .pp__col { border-left: 1px solid var(--border) }
.pp__tag { display: block; font-size: .8rem; font-weight: 700; color: var(--muted) }
.pp__svc { display: flex; align-items: center; gap: 14px; margin-top: 12px }
.pp__svc i { display: grid; place-items: center; width: 46px; height: 46px; flex: none; background: var(--accent); color: #fff; box-shadow: 0 14px 28px -14px rgba(85,70,224,.8) }
.pp__svc i svg { position: static }
.pp__svc h3 { margin: 0; font-family: var(--font-display); font-size: 1.45rem; font-weight: 600; letter-spacing: -.03em; color: var(--ink) }
.pp__problem { margin: 16px 0 0; padding-left: 14px; border-left: 3px solid #e5484d; font-size: .98rem; line-height: 1.55; color: var(--ink-soft) }
.pp__col ul { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 12px }
.pp__col li { display: flex; align-items: flex-start; gap: 12px; font-size: .96rem; line-height: 1.45; color: var(--ink) }
.pp__col li b { display: grid; place-items: center; width: 22px; height: 22px; flex: none; margin-top: 1px; color: #fff; background: var(--accent-deep) }
.pp__col li b svg { position: static }
.pp__col--get { display: flex; flex-direction: column; background: #f3fbf6 }
.pp__col--get .pp__tag { color: #15803d }
.pp__col--get strong { display: block; margin-top: 10px; font-family: var(--font-display); font-size: 1.2rem; font-weight: 600; line-height: 1.3; letter-spacing: -.015em; color: #14532d }
.pp__col--get .sp-btn { margin-top: auto; justify-content: center }
.pp__col--get .sp-btn svg { position: static }
.pp__col--get strong + .sp-btn { margin-top: 24px }
@keyframes pp-in { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }

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
  .pp__answer { animation: none }
}
@media (max-width: 1080px) {
  .pp__opts { grid-template-columns: repeat(2, minmax(0, 1fr)) }
  .pp__answer { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) }
  .pp__col--get { grid-column: 1 / -1; border-left: 0 !important; border-top: 1px solid var(--border) }
}
@media (max-width: 900px) {
  .fd-consult__head { grid-template-columns: minmax(0, 1fr); align-items: start }
  .fd-hero { grid-template-columns: minmax(0, 1fr) }
  .fd-hero__photo { justify-self: start; width: min(100%, 340px); margin-right: 22px }
  .fd-facts { grid-template-columns: repeat(2, minmax(0, 1fr)) }
  .fd-facts li:nth-child(3) { padding-left: 0; border-left: 0 }
  .fd-facts li:nth-child(n+3) { border-top: 1px solid var(--border) }
  .fd-story { grid-template-columns: minmax(0, 1fr) }
  .fd-story__side { position: static }
  .pp__answer { grid-template-columns: minmax(0, 1fr) }
  .pp__col + .pp__col { border-left: 0; border-top: 1px solid var(--border) }
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
  .pp__opts { grid-template-columns: minmax(0, 1fr) }
  .fd-glance > div { grid-template-columns: minmax(0, 1fr); gap: 6px }
  .pp__opts button { min-height: 0 }
  .pp__col { padding: 20px 16px }
}
`;

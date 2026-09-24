"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Linkedin,
  Quote,
  Radar,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";
import { SiteChrome } from "./chrome";

// Rotates through the hero's decorative "Alert queue" card so it reads like
// a live SOC console instead of two frozen rows. Purely decorative
// (aria-hidden on the wrapper), so it never competes with real content.
const ALERT_FEED = [
  { sev: "crit", label: "Critical", text: "T1055 · Process Injection" },
  { sev: "med", label: "Medium", text: "T1059 · Command Exec" },
  { sev: "crit", label: "Critical", text: "T1003 · Credential Dumping" },
  { sev: "low", label: "Low", text: "T1087 · Account Discovery" },
  { sev: "med", label: "Medium", text: "T1071 · App Layer Protocol" },
  { sev: "crit", label: "Critical", text: "T1486 · Data Encrypted for Impact" },
];

function AlertQueueCard() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setI((n) => n + 1), 2800);
    return () => clearInterval(id);
  }, []);

  const rows = [ALERT_FEED[i % ALERT_FEED.length], ALERT_FEED[(i + 1) % ALERT_FEED.length]];

  return (
    <div className="sp-deco-card sp-deco-card--queue">
      <p className="sp-deco-card__queuehead">
        <span className="sp-deco-card__pulse" /> Alert queue
      </p>
      {rows.map((a, idx) => (
        <div className="sp-deco-card__queuerow sp-deco-card__queuerow--in" key={`${i}-${idx}`}>
          <span className={`sp-deco-card__sev sp-deco-card__sev--${a.sev}`}>{a.label}</span>
          <span className="sp-deco-card__queuetext">{a.text}</span>
        </div>
      ))}
    </div>
  );
}

const problems = [
  {
    icon: ShieldCheck,
    title: "Alerts without answers",
    body: "Your tools are running, but nobody can say for sure they'd catch a real attack.",
  },
  {
    icon: Users,
    title: "Training that stops at theory",
    body: "Most programs teach the concepts well. They cannot teach the instinct that comes from working a real queue.",
  },
  {
    icon: Radar,
    title: "Coverage nobody has tested",
    body: "A detection that's never fired is just a guess.",
  },
];

const offers = [
  {
    key: "security-operations",
    icon: ShieldCheck,
    tag: "For lean security teams",
    title: "Security Operations",
    body: "Your SIEM generates alerts. Nobody has time to tune them, build new detections, or prove the ones you have actually fire. We do that work, as part of your team.",
    bullets: ["SIEM & detection engineering", "SIEM optimization", "Security operations assessments", "Detection validation"],
    cta: "See how we help",
    href: "/security-operations",
    external: false,
  },
  {
    key: "training",
    icon: Users,
    tag: "For academies & programs",
    title: "Cybersecurity Training",
    body: "Most programs teach concepts a classroom can grade. Employers want people who've already worked a queue. We teach that, and the instructor still works one today.",
    bullets: ["Cybersecurity instruction", "Hands-on security labs", "Curriculum support", "Instructor partnerships"],
    cta: "See the curriculum",
    href: "/cybersecurity-training",
    external: false,
  },
  {
    key: "labs",
    icon: Radar,
    tag: "In development",
    title: "PurveX Labs",
    body: "Claiming a detection exists is easy. Proving it works is harder. Labs tests it continuously, and shows you the evidence.",
    bullets: ["Continuous detection validation", "Measurable coverage over time", "Private beta, in development"],
    cta: "Get early access",
    href: "/platform",
    external: false,
  },
];

// Drop a headshot in /public and set `photo` (e.g. "/kenneth-ellington.jpg"), or set
// `logo` to a company logo path — either renders in place of the
// initial. `role` should be "Founder, Company" once confirmed.
// `services` lists which PurveX offering(s) they used, shown as tags.
const testimonials = [
  {
    quote:
      "Hands down one of the best services. Our students now work in tech, running their own SOC projects thanks to real hands-on experience.",
    name: "Kenneth Ellington",
    role: "Cybersecurity Coach + Instructor, Ellington Cyber Academy",
    linkedin: "https://www.linkedin.com/in/kenneth-ellington/",
    photo: "/kenneth.jpg",
    logo: "",
    services: ["Cybersecurity Training"],
  },
  // Symone: pulled for now, ask for a quote once she's ~6 months in.
];

export default function HomePage() {
  return (
    <SiteChrome active="home">
      {/* ═══════════ HERO ═══════════ */}
      <section className="sp-hero">
        <div className="sp-hero__deco sp-hero__deco--left" aria-hidden="true">
          <div className="sp-deco-float">
            <div className="sp-deco-card sp-deco-card--ring">
              <div className="sp-deco-card__ringwrap">
                <svg viewBox="0 0 72 72" width="72" height="72">
                  <circle cx="36" cy="36" r="30" fill="none" stroke="var(--border)" strokeWidth="7" />
                  <circle
                    cx="36" cy="36" r="30" fill="none" stroke="var(--accent-deep)" strokeWidth="7"
                    strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset="34"
                    transform="rotate(-90 36 36)"
                  />
                </svg>
                <span className="sp-deco-card__ringpct">82%</span>
              </div>
              <p className="sp-deco-card__ringlabel">ATT&amp;CK techniques mapped to detections</p>
            </div>
          </div>
        </div>
        <div className="sp-hero__deco sp-hero__deco--right" aria-hidden="true">
          <div className="sp-deco-float sp-deco-float--alt">
            <AlertQueueCard />
          </div>
        </div>

        <span className="sp-hero__badge">Detection engineering · Analyst training</span>
        <h1 className="sp-hero__h1">Prove it works</h1>
        <p className="sp-hero__sub">
          We tune your detections. We train your analysts. Then we test both against a
          real attack.
        </p>
        <div className="sp-hero__actions">
          <a href="#how-we-help" className="sp-btn sp-btn--prim sp-btn--lg">
            Get Started <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* ═══════════ PROBLEMS WE SOLVE ═══════════ */}
      <section className="sp-section sp-section--tight">
        <div className="sp-head" data-r>
          <span className="sp-tag">Sound familiar?</span>
          <h2>The problems we solve</h2>
        </div>
        <div className="sp-problems" data-r>
          {problems.map((p) => (
            <article key={p.title} className="sp-problem">
              <div className="sp-problem__icon">
                <p.icon size={19} />
              </div>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════ HOW WE HELP ═══════════ */}
      <section className="sp-section" id="how-we-help">
        <div className="sp-head" data-r>
          <span className="sp-tag">How PurveX helps</span>
          <h2>Three ways we help</h2>
        </div>

        <div className="sp-offers" data-r>
          {offers.map((o) => (
            <article className="sp-offer" key={o.key}>
              <div className="sp-offer__panel">
                <o.icon size={20} />
              </div>
              <div className="sp-offer__body">
                <span className="sp-tag">{o.tag}</span>
                <h3>{o.title}</h3>
                <p>{o.body}</p>
                <ul className="sp-offer__list">
                  {o.bullets.map((b) => (
                    <li key={b}>
                      <Check size={14} /> {b}
                    </li>
                  ))}
                </ul>
                {o.external ? (
                  <a href={o.href} target="_blank" rel="noreferrer" className="sp-btn sp-btn--ghost sp-btn--sm">
                    {o.cta} <ArrowRight size={15} />
                  </a>
                ) : (
                  <Link href={o.href} className="sp-btn sp-btn--ghost sp-btn--sm">
                    {o.cta} <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════ WHY PURVEX ═══════════ */}
      <section className="sp-section sp-section--tight">
        <div className="sp-statement" data-r>
          <span className="sp-tag">Why PurveX</span>
          <h2>The work gets tested</h2>
          <p>
            Tuning a detection or training an analyst isn&apos;t a finished task. It&apos;s a claim.
            A detection has to survive someone trying to get past it. An analyst has to prove
            they can work a real queue. Until then, it&apos;s just an assumption.
          </p>
          <Link href="/about" className="sp-statement__link">
            Read how we think <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ═══════════ TESTIMONIAL ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">What people say</span>
          <h2>Feedback from the field</h2>
        </div>
        <div className="sp-feature-quotes">
          {testimonials.map((t) => (
            <div key={t.name} className="sp-feature-quote" data-r>
              <div className="sp-feature-quote__person">
                {t.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo} alt={t.name} className="sp-feature-quote__photo" />
                ) : t.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.logo} alt="" className="sp-feature-quote__photo" />
                ) : (
                  <span className="sp-feature-quote__avatar">{t.name.charAt(0)}</span>
                )}
                <strong className="sp-feature-quote__name">{t.name}</strong>
                {t.role && <span className="sp-feature-quote__role">{t.role}</span>}
                <span className="sp-feature-quote__stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} />
                  ))}
                </span>
                <a href={t.linkedin} target="_blank" rel="noreferrer" className="sp-feature-quote__linkedin">
                  <Linkedin size={13} /> LinkedIn
                </a>
              </div>
              <div className="sp-feature-quote__body">
                <Quote size={30} className="sp-feature-quote__mark" />
                <p className="sp-feature-quote__text">{t.quote}</p>
                {t.services.length > 0 && (
                  <div className="sp-feature-quote__tags">
                    {t.services.map((s) => (
                      <span key={s} className="sp-tagchip">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <style>{`
/* ── Hero deco cards (desktop only -- there's no room to bleed past the
   hero column below ~1300px without overlapping the headline) ── */
.sp-hero__deco { position: absolute; top: 0; z-index: 2; pointer-events: none; display: none }
@media (min-width: 1300px) {
  .sp-hero__deco { display: block; opacity: 0; animation: sp-deco-in .8s var(--ease) both }
  .sp-hero__deco--left { left: -264px; top: 76px; animation-name: sp-deco-in-left; animation-delay: .35s }
  .sp-hero__deco--right { right: -264px; top: 204px; animation-name: sp-deco-in-right; animation-delay: .55s }
}
@keyframes sp-deco-in-left { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
@keyframes sp-deco-in-right { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
.sp-deco-float { animation: sp-deco-float 6.5s ease-in-out infinite }
.sp-deco-float--alt { animation-duration: 7.5s; animation-delay: -3s }
@keyframes sp-deco-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }

.sp-deco-card {
  width: 218px; border-radius: 0; padding: 16px;
  background: var(--surface); border: 1px solid var(--border); border-top: 2px solid var(--accent-deep);
  box-shadow: 0 24px 48px -28px rgba(16,25,46,.22);
}
.sp-deco-card__pulse { position: relative; width: 7px; height: 7px; border-radius: 50%; background: var(--green) }
.sp-deco-card__pulse::after { content: ""; position: absolute; inset: -5px; border-radius: 50%; border: 1.5px solid var(--green); opacity: .55; animation: sp-pulse-ring 2s ease-out infinite }
@keyframes sp-pulse-ring { from { transform: scale(.5); opacity: .6 } to { transform: scale(1.6); opacity: 0 } }

/* Left card: ATT&CK coverage gauge */
.sp-deco-card--ring { width: 264px; display: flex; align-items: center; gap: 14px }
.sp-deco-card__ringwrap { position: relative; flex-shrink: 0; width: 72px; height: 72px }
.sp-deco-card__ringpct { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.05rem; font-weight: 600; letter-spacing: -.03em; color: var(--ink) }
.sp-deco-card__ringlabel { margin: 0; text-align: left; font-family: var(--font-mono); font-size: .62rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; line-height: 1.6; color: var(--muted-dim) }

/* Right card: live alert queue */
.sp-deco-card--queue { width: 240px }
.sp-deco-card__queuehead { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font-family: var(--font-mono); font-size: .62rem; font-weight: 700; text-transform: uppercase; letter-spacing: .16em; color: var(--muted-dim) }
.sp-deco-card__queuerow { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-top: 1px solid var(--border) }
.sp-deco-card__queuerow:first-of-type { border-top: none; padding-top: 0 }
.sp-deco-card__queuerow--in { animation: sp-queue-row-in .45s var(--ease) both }
@keyframes sp-queue-row-in { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
.sp-deco-card__sev { flex-shrink: 0; font-family: var(--font-mono); font-size: .58rem; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; padding: 2px 6px; border-radius: 0; border: 1px solid currentColor }
.sp-deco-card__sev--crit { color: var(--red) }
.sp-deco-card__sev--med { color: #c4820e }
.sp-deco-card__sev--low { color: var(--accent-deep) }
@media (prefers-reduced-motion: reduce) {
  .sp-deco-card__queuerow--in { animation: none }
}
.sp-deco-card__queuetext { font-size: .74rem; color: var(--ink-soft); white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
@media (prefers-reduced-motion: reduce) {
  .sp-hero__deco { animation: none; opacity: 1; transform: none }
  .sp-deco-float { animation: none }
  .sp-deco-card__pulse::after { animation: none; display: none }
}

/* ── Problems strip ── */
.sp-problems { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--border); text-align: left }
.sp-problem { padding: 40px 32px 44px; position: relative; transition: background .35s var(--ease) }
.sp-problem:hover { background: var(--surface-alt) }
.sp-problem:not(:first-child) { border-left: 1px solid var(--border) }
.sp-problem__icon { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius); border: 1px solid var(--border-strong); color: var(--accent-deep); transition: background .35s var(--ease), border-color .35s var(--ease), color .35s var(--ease) }
.sp-problem:hover .sp-problem__icon { background: var(--accent-deep); border-color: var(--accent-deep); color: #fff }
.sp-problem h3 { margin: 24px 0 0; font-family: var(--font-display); font-size: 1.2rem; font-weight: 600; letter-spacing: -.025em; color: var(--ink) }
.sp-problem p { margin: 14px 0 0; color: var(--muted); font-size: .92rem; line-height: 1.65; text-wrap: pretty }
@media (prefers-reduced-motion: reduce) {
  .sp-problem, .sp-problem__icon { transition: none }
}
.sp-problems[data-r] { opacity: 1; transform: none; transition: none }
.sp-problems[data-r] > * { opacity: 0; transform: translateY(16px); transition: opacity .6s var(--ease), transform .6s var(--ease) }
.sp-problems[data-r].in > * { opacity: 1; transform: none }
.sp-problems[data-r] > *:nth-child(1) { transition-delay: .03s }
.sp-problems[data-r] > *:nth-child(2) { transition-delay: .1s }
.sp-problems[data-r] > *:nth-child(3) { transition-delay: .17s }
/* Phones: the three problems become a swipeable row that peeks the next
   card, instead of three tall stacked boxes the reader scrolls past. */
@media (max-width: 680px) {
  .sp-problems {
    grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: 82%; gap: 12px;
    margin: 0 -16px; padding: 4px 16px 8px; overflow-x: auto; scroll-snap-type: x mandatory;
    scroll-padding-inline: 16px; overscroll-behavior-x: contain; scrollbar-width: none;
  }
  .sp-problems::-webkit-scrollbar { display: none }
  .sp-problems { border: 0 }
  .sp-problem { padding: 26px 20px; scroll-snap-align: start; border: 1px solid var(--border) !important; border-top: 2px solid var(--accent-deep) !important; background: var(--surface) }
  .sp-problem h3 { margin-top: 18px }
  .sp-problem p { margin-top: 8px }
}

/* ── Offers (static, replaces the old auto-rotating carousel) ── */
.sp-offers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border-top: 1px solid var(--ink); border-bottom: 1px solid var(--border) }
.sp-offer { display: flex; flex-direction: column; padding: 40px 32px 44px; transition: background .35s var(--ease) }
.sp-offer:hover { background: var(--surface-alt) }
.sp-offer:not(:first-child) { border-left: 1px solid var(--border) }
.sp-offer__panel {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 44px; height: 44px; border-radius: var(--radius);
  border: 1px solid var(--border-strong); color: var(--accent-deep);
  transition: background .35s var(--ease), border-color .35s var(--ease), color .35s var(--ease);
}
.sp-offer:hover .sp-offer__panel { background: var(--accent-deep); border-color: var(--accent-deep); color: #fff }
.sp-offer__body { padding: 0; margin-top: 26px; display: flex; flex-direction: column; flex: 1 }
.sp-offer__body h3 { margin: 12px 0 0; font-family: var(--font-display); font-size: 1.45rem; font-weight: 600; letter-spacing: -.03em; color: var(--ink) }
.sp-offer__body p { margin: 14px 0 0; color: var(--muted); font-size: .88rem; line-height: 1.6; text-wrap: pretty }
@media (prefers-reduced-motion: reduce) {
  .sp-offer, .sp-offer__panel { transition: none }
}
.sp-offer__list { list-style: none; margin: 24px 0 28px; padding: 0; display: flex; flex-direction: column; gap: 11px }
.sp-offer__list li { display: flex; align-items: center; gap: 7px; font-size: .82rem; color: var(--ink-soft); font-weight: 500 }
.sp-offer__list li svg { color: var(--accent-deep); flex-shrink: 0 }
.sp-offer .sp-btn { margin-top: auto }
.sp-offers[data-r] { opacity: 1; transform: none; transition: none }
.sp-offers[data-r] > * { opacity: 0; transform: translateY(16px); transition: opacity .6s var(--ease), transform .6s var(--ease) }
.sp-offers[data-r].in > * { opacity: 1; transform: none }
.sp-offers[data-r] > *:nth-child(1) { transition-delay: .03s }
.sp-offers[data-r] > *:nth-child(2) { transition-delay: .1s }
.sp-offers[data-r] > *:nth-child(3) { transition-delay: .17s }
@media (max-width: 940px) {
  .sp-offers { grid-template-columns: 1fr }
  .sp-offer:not(:first-child) { border-left: 0; border-top: 1px solid var(--border) }
}
@media (max-width: 680px) {
  .sp-offer { padding: 30px 0 32px }
  .sp-offer:hover { background: none }
  .sp-offer__body { margin-top: 20px }
  .sp-offer__list { margin: 20px 0 24px }
}
@media (prefers-reduced-motion: reduce) {
  .sp-problems[data-r] > *, .sp-offers[data-r] > * { opacity: 1; transform: none; filter: none; transition: none }
}

/* ── Feature quote: a squared-off card, photo stacked above the quote,
   instead of a full-bleed horizontal strip ── */
.sp-feature-quotes { display: flex; flex-direction: column; gap: 32px; align-items: center }
.sp-feature-quote {
  max-width: 460px; width: 100%;
  display: flex; flex-direction: column; align-items: center; text-align: center;
  padding: 52px 40px 48px;
  border: 1px solid var(--border); border-top: 2px solid var(--accent-deep); border-radius: 0;
  background: var(--surface);
}
.sp-feature-quote__person { display: flex; flex-direction: column; align-items: center; gap: 8px }
.sp-feature-quote__photo { width: 84px; height: 84px; border-radius: 50%; object-fit: cover; box-shadow: 0 10px 24px -10px rgba(16,25,46,.3) }
.sp-feature-quote__avatar { display: flex; align-items: center; justify-content: center; width: 84px; height: 84px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-deep)); color: #fff; font-family: var(--font-display); font-weight: 700; font-size: 1.8rem }
.sp-feature-quote__name { font-size: .98rem; font-weight: 650; color: var(--ink); margin-top: 4px }
.sp-feature-quote__role { color: var(--muted); font-size: .82rem; line-height: 1.4 }
.sp-feature-quote__stars { display: flex; gap: 3px; color: #f4b740; margin-top: 2px }
.sp-feature-quote__stars svg { fill: currentColor }
.sp-feature-quote__linkedin { display: inline-flex; align-items: center; gap: 6px; color: var(--muted-dim); font-size: .8rem; text-decoration: none; transition: color .2s; margin-top: 4px }
.sp-feature-quote__linkedin:hover { color: var(--accent-deep) }
.sp-feature-quote__body { display: flex; flex-direction: column; align-items: center; margin-top: 22px; padding-top: 22px; border-top: 1px solid var(--border) }
.sp-feature-quote__mark { color: var(--accent); opacity: .3 }
.sp-feature-quote__text { margin: 10px 0 0; font-family: var(--font-display); font-size: 1.2rem; font-weight: 500; line-height: 1.5; letter-spacing: -.02em; color: var(--ink) }
.sp-feature-quote__tags { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 18px }
.sp-tagchip { font-family: var(--font-mono); font-size: .62rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--accent-deep); border: 1px solid var(--accent-deep); border-radius: 0; padding: 4px 8px }
@media (max-width: 560px) {
  .sp-feature-quote { padding: 44px 24px }
}
      `}</style>
    </SiteChrome>
  );
}

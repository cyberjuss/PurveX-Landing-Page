"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Linkedin } from "lucide-react";
import { IconGraduate, IconTune, IconValidate, type BrandIcon } from "./brand-icons";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";

/* About. Plain on purpose: why PurveX exists, the problems it takes on,
   what it offers for each, what it believes, and who is behind it. Facts
   about the founder match the founder page. */

const FIXES: { problem: string; detail: string; name: string; answer: string; href: string; Icon: BrandIcon }[] = [
  {
    problem: "Alerts are assumed to work",
    detail: "Most teams find out a detection is broken during a real attack.",
    name: "Platform",
    answer: "Runs real attack tests and shows which alerts fired, which missed, and why.",
    href: "/platform",
    Icon: IconValidate,
  },
  {
    problem: "Small teams are stretched thin",
    detail: "They need strong coverage without the headcount to build and maintain it.",
    name: "Consulting",
    answer: "Our founder writes, tests, and tunes the detections in your SIEM, working with your team.",
    href: "/about/founder#consulting",
    Icon: IconTune,
  },
  {
    problem: "New analysts learn by watching",
    detail: "Real skill comes from hands-on repetition, and most training skips it.",
    name: "Training",
    answer: "Students work real tickets in their own company network, with a coach that never gives the answer.",
    href: "/cybersecurity-training",
    Icon: IconGraduate,
  },
];

const BELIEFS = [
  { title: "Prove it, don't assume it", body: "Every detection and every student skill is checked, not claimed." },
  { title: "Judgment over shortcuts", body: "AI can write the query. We build for the person who knows when to trust it." },
  { title: "Security for every team size", body: "Small teams get the same rigor and tools as large ones." },
];

const FACTS = [
  "Tuned Microsoft Sentinel for a federal agency",
  "Automated response in Splunk SOAR",
  "Teaches SOC fundamentals at Ellington Cyber Academy",
  "CySA+ and Security+ certified",
];

export default function AboutPage() {
  return (
    <SiteChrome active="about">
      <section className="abx-hero">
        <div className="abx-hero__copy">
          <span className="sp-tag">About</span>
          <h1>No team should need to be enterprise‑sized to be secure.</h1>
          <p>
            PurveX helps security teams prove their defenses work, and trains the people who run them.
          </p>
          <div className="abx-hero__actions">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <Link href="/about/founder" className="sp-btn sp-btn--ghost sp-btn--lg">
              Meet the founder
            </Link>
          </div>
        </div>
        <figure className="abx-card">
          <Image src="/Justin.jpg" alt="Justin Duru" width={120} height={120} className="abx-card__photo" priority />
          <blockquote>
            I kept seeing small security teams asked to do enterprise work without enterprise headcount. PurveX exists to
            close that gap.
          </blockquote>
          <figcaption>
            <strong>Justin Duru</strong>
            <span>Founder, PurveX</span>
          </figcaption>
        </figure>
      </section>

      <section className="pg-section" id="problem">
        <div className="pg-head">
          <h2>The problems we solve</h2>
          <p>Three gaps we kept seeing on real security teams, and what PurveX does about each one.</p>
        </div>
        <div className="abx-fix" data-r>
          <div className="abx-fix__labels" aria-hidden="true">
            <span>The problem</span>
            <span>What we do</span>
          </div>
          {FIXES.map((f) => (
            <div key={f.name} className="abx-fix__row">
              <div className="abx-fix__problem">
                <strong>{f.problem}</strong>
                <p>{f.detail}</p>
              </div>
              <Link href={f.href} className="abx-fix__answer">
                <i><f.Icon size={22} /></i>
                <div>
                  <strong>{f.name}</strong>
                  <p>{f.answer}</p>
                </div>
                <ArrowRight size={18} className="abx-fix__go" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="pg-section" id="beliefs">
        <div className="abx-beliefs">
          <h2>What we believe</h2>
          <ol data-r>
            {BELIEFS.map((b) => (
              <li key={b.title}>
                <strong>{b.title}</strong>
                <p>{b.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pg-section" id="trust">
        <div className="pg-head">
          <h2>Built from real experience</h2>
          <p>PurveX comes from years on the SOC floor and in the classroom, not from a slide deck.</p>
        </div>
        <div className="abx-trust">
          <div className="abx-founder">
            <Image src="/Justin.jpg" alt="" width={72} height={72} className="abx-founder__photo" />
            <div>
              <strong>Justin Duru</strong>
              <span>Founder and Lead Security Consultant</span>
            </div>
            <ul>
              {FACTS.map((f) => <li key={f}>{f}</li>)}
            </ul>
            <div className="abx-founder__links">
              <Link href="/about/founder" className="abx-link">Read the full story <ArrowRight size={14} /></Link>
              <a href="https://linkedin.com/in/jduru" target="_blank" rel="noreferrer" className="abx-link">
                <Linkedin size={14} /> LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <h2>Let&apos;s talk about your team</h2>
          <p className="pg-close__sub">Thirty minutes to talk through your team, your SIEM, or your training program.</p>
          <div className="pg-close__row">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="pg-close__book">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <Link href="/platform" className="pg-close__more">
              Try the Platform free <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <HoldCard source="about" />
      </section>

      <style>{PG_CSS}</style>
      <style>{ABX_CSS}</style>
    </SiteChrome>
  );
}

const ABX_CSS = `
/* hero */
.abx-hero { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, .8fr); gap: 40px 64px; align-items: center; padding: clamp(48px, 7vw, 96px) 0 0 }
.abx-hero h1 {
  margin: 18px 0 0; max-width: 18ch; font-family: var(--font-display); font-weight: 500;
  font-size: clamp(2.3rem, 4.6vw, 3.6rem); line-height: 1.06; letter-spacing: -.045em; color: var(--ink); text-wrap: balance;
}
.abx-hero__copy > p { margin: 22px 0 0; max-width: 44ch; color: var(--ink-soft); font-size: 1.12rem; line-height: 1.6 }
.abx-hero__actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px }
.abx-card { margin: 0; padding: 28px; background: #fff; border: 1px solid var(--border-strong); box-shadow: 0 30px 60px -40px rgba(42,34,128,.4) }
.abx-card__photo { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; object-position: center 12% }
.abx-card blockquote { margin: 18px 0 0; font-family: var(--font-display); font-size: 1.2rem; font-weight: 500; line-height: 1.45; letter-spacing: -.015em; color: var(--ink) }
.abx-card figcaption { margin-top: 18px; padding-top: 16px; border-top: 1px solid var(--border) }
.abx-card figcaption strong { display: block; font-size: .95rem; color: var(--ink) }
.abx-card figcaption span { display: block; margin-top: 2px; font-size: .86rem; color: var(--muted) }

/* problem to solution */
.abx-fix[data-r] { opacity: 1; transform: none; filter: none }
.abx-fix { border-top: 1px solid var(--border) }
.abx-fix__labels { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); gap: 32px; padding: 14px 0; border-bottom: 1px solid var(--border) }
.abx-fix__labels span { font-size: .82rem; font-weight: 650; color: var(--muted) }
.abx-fix__row {
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr); gap: 32px; align-items: center; padding: 22px 0; border-bottom: 1px solid var(--border);
  opacity: 0; transform: translateY(12px); transition: opacity .6s var(--ease), transform .6s var(--ease);
}
.abx-fix.in .abx-fix__row { opacity: 1; transform: none }
.abx-fix.in .abx-fix__row:nth-of-type(3) { transition-delay: .1s }
.abx-fix.in .abx-fix__row:nth-of-type(4) { transition-delay: .2s }
.abx-fix__problem strong { display: block; font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; letter-spacing: -.02em; color: var(--ink) }
.abx-fix__problem p { margin: 6px 0 0; max-width: 40ch; font-size: .95rem; line-height: 1.5; color: var(--muted) }
.abx-fix__answer {
  display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 16px; padding: 18px 20px;
  background: #fff; border: 1px solid var(--border-strong); text-decoration: none; color: inherit;
  transition: border-color .25s var(--ease), box-shadow .25s var(--ease), transform .25s var(--ease);
}
.abx-fix__answer:hover { border-color: rgba(106,92,255,.45); box-shadow: 0 18px 36px -26px rgba(42,34,128,.5); transform: translateY(-2px) }
.abx-fix__answer:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
.abx-fix__answer i { display: grid; place-items: center; width: 44px; height: 44px; background: var(--accent-soft); color: var(--accent-deep) }
.abx-fix__answer i svg { position: static }
.abx-fix__answer strong { display: block; font-size: 1rem; font-weight: 700; color: var(--accent-deep) }
.abx-fix__answer p { margin: 3px 0 0; font-size: .93rem; line-height: 1.5; color: var(--ink-soft) }
.abx-fix__go { color: var(--accent-deep); transition: transform .25s var(--ease) }
.abx-fix__answer:hover .abx-fix__go { transform: translateX(4px) }

/* beliefs */
.abx-beliefs { display: grid; grid-template-columns: minmax(0, 280px) minmax(0, 1fr); gap: 32px 64px; padding: clamp(28px, 4vw, 44px); background: var(--accent-soft); border: 1px solid rgba(106,92,255,.16) }
.abx-beliefs h2 { margin: 0; font-family: var(--font-display); font-weight: 700; letter-spacing: -.022em; line-height: 1.15; font-size: clamp(1.6rem, 2.6vw, 2.1rem); color: var(--ink) }
.abx-beliefs ol { list-style: none; margin: 0; padding: 0; display: grid; gap: 22px; counter-reset: belief }
.abx-beliefs ol[data-r] { opacity: 1; transform: none; filter: none }
.abx-beliefs li { display: grid; grid-template-columns: auto 1fr; gap: 4px 16px; counter-increment: belief }
.abx-beliefs li::before {
  content: counter(belief); grid-row: span 2; display: grid; place-items: center; width: 32px; height: 32px;
  font-size: .86rem; font-weight: 700; color: #fff; background: var(--accent-deep);
}
.abx-beliefs strong { font-size: 1.1rem; font-weight: 650; color: var(--ink) }
.abx-beliefs p { margin: 0; font-size: .96rem; line-height: 1.5; color: var(--ink-soft) }

/* trust */
.abx-trust { display: grid; grid-template-columns: minmax(0, 1fr) }
.abx-founder { margin: 0; padding: 28px; background: #fff; border: 1px solid var(--border-strong); box-shadow: 0 22px 44px -36px rgba(42,34,128,.4) }
.abx-founder { display: grid; grid-template-columns: auto 1fr; gap: 16px; align-content: start; align-items: center }
.abx-founder__photo { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; object-position: center 12% }
.abx-founder strong { display: block; font-size: 1.05rem; color: var(--ink) }
.abx-founder span { display: block; margin-top: 2px; font-size: .88rem; color: var(--muted) }
.abx-founder ul { grid-column: 1 / -1; list-style: none; margin: 6px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 32px }
.abx-founder li { position: relative; padding-left: 20px; font-size: .95rem; line-height: 1.45; color: var(--ink) }
.abx-founder li::before { content: ""; position: absolute; left: 0; top: .5em; width: 8px; height: 8px; background: var(--accent) }
.abx-founder__links { grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 20px; margin-top: 8px; padding-top: 16px; border-top: 1px solid var(--border) }
.abx-link { display: inline-flex; align-items: center; gap: 6px; font-size: .9rem; font-weight: 650; color: var(--accent-deep); text-decoration: none }
.abx-link:hover { text-decoration: underline; text-underline-offset: 3px }
.abx-link svg { position: static }

@media (prefers-reduced-motion: reduce) {
  .abx-fix__row { opacity: 1; transform: none; transition: none }
}
@media (max-width: 980px) {
  .abx-hero { grid-template-columns: minmax(0, 1fr) }
  .abx-card { max-width: 520px }
  .abx-beliefs { grid-template-columns: minmax(0, 1fr) }
  .abx-trust { grid-template-columns: minmax(0, 1fr) }
}
@media (max-width: 720px) {
  .abx-fix__labels { display: none }
  .abx-fix__row { grid-template-columns: minmax(0, 1fr); gap: 14px }
  .abx-card, .abx-founder { padding: 22px 18px }
  .abx-founder ul { grid-template-columns: minmax(0, 1fr) }
}
`;

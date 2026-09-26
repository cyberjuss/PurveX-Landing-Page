"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Linkedin, X } from "lucide-react";
import { IconGraduate, IconTune, IconValidate, type BrandIcon } from "./brand-icons";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";

/* About. Why PurveX exists, told in five beats: the manifesto, what changes
   with PurveX (a Without / With switch), how the three offers fit together
   as one loop, what we believe, and who is behind it. Founder facts match
   the founder page. */

const CHANGES: { area: string; without: string; with: string }[] = [
  {
    area: "Your alerts",
    without: "Assumed to work. You find out one is broken during a real attack.",
    with: "Tested against real attack behavior. Misses are found and fixed first.",
  },
  {
    area: "Your team",
    without: "Stretched thin, writing and tuning every rule by hand.",
    with: "Detections written, tuned, and proven with expert help.",
  },
  {
    area: "Your analysts",
    without: "Learned by watching, then freeze on their first real ticket.",
    with: "Practiced real tickets in their own lab before day one.",
  },
];

const LOOP: { verb: string; name: string; body: string; href: string; Icon: BrandIcon }[] = [
  { verb: "Prove", name: "Platform", body: "Run real attack tests and see which alerts fired and which missed.", href: "/platform", Icon: IconValidate },
  { verb: "Fix", name: "Consulting", body: "Write, tune, and validate the detections that missed.", href: "/about/founder#consulting", Icon: IconTune },
  { verb: "Train", name: "Training", body: "Build analysts who can run those detections and know when to trust them.", href: "/cybersecurity-training", Icon: IconGraduate },
];

const BELIEFS = [
  { title: "Prove it, don't assume it.", body: "Every detection and every student skill is checked, not claimed." },
  { title: "Judgment over shortcuts.", body: "AI can write the query. We build for the person who knows when to trust it." },
  { title: "Security for every team size.", body: "Small teams deserve the same rigor and tools as large ones." },
];

const FACTS = [
  "Tuned Microsoft Sentinel for a federal agency",
  "Automated response in Splunk SOAR",
  "Teaches SOC fundamentals at Ellington Cyber Academy",
  "CySA+ and Security+ certified",
];

// Background coverage grid: f = covered, m = gap. Fills in as the page loads.
const GRID = "ffmffffmfffffmffmfffffffmfffffffmffffmfffffffffmfffffmffffffmffffffmffff".split("");

function Changes() {
  const [on, setOn] = useState(false);
  return (
    <div className="ab-change" data-on={on ? "1" : "0"}>
      <div className="ab-change__switch" role="group" aria-label="Compare">
        <button type="button" aria-pressed={!on} onClick={() => setOn(false)}>Without PurveX</button>
        <button type="button" aria-pressed={on} onClick={() => setOn(true)}>With PurveX</button>
        <i aria-hidden="true" />
      </div>
      <ul aria-live="polite">
        {CHANGES.map((c) => (
          <li key={c.area}>
            <span className="ab-change__area">{c.area}</span>
            <p key={on ? "w" : "o"}>
              <b>{on ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}</b>
              {on ? c.with : c.without}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AboutPage() {
  return (
    <SiteChrome active="about">
      <section className="ab-hero">
        <div className="ab-hero__grid" aria-hidden="true">
          {GRID.map((c, n) => <i key={n} data-c={c} style={{ ["--n" as string]: n }} />)}
        </div>
        <div className="ab-hero__copy">
          <span className="sp-tag">About</span>
          <h1>
            No team should need to be <s>enterprise‑sized</s> to be secure.
          </h1>
          <p>PurveX helps security teams prove their defenses work, and trains the people who run them.</p>
          <div className="ab-hero__actions">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <Link href="/about/founder" className="sp-btn sp-btn--ghost sp-btn--lg">
              Meet the founder
            </Link>
          </div>
        </div>
      </section>

      <section className="pg-section" id="change">
        <div className="ab-change__wrap">
          <div className="ab-change__head">
            <h2>What changes with PurveX</h2>
            <p>Three problems we kept seeing on real security teams. Flip the switch to see the difference.</p>
          </div>
          <Changes />
        </div>
      </section>

      <section className="pg-section" id="loop">
        <div className="pg-head">
          <h2>How it fits together</h2>
          <p>Three offers, one loop. Each one makes the next one stronger.</p>
        </div>
        <div className="ab-loop" data-r>
          <ol>
            {LOOP.map((l, n) => (
              <li key={l.name}>
                <Link href={l.href}>
                  <span className="ab-loop__step">{n + 1}</span>
                  <i><l.Icon size={24} /></i>
                  <strong>{l.verb}</strong>
                  <em>{l.name}</em>
                  <p>{l.body}</p>
                  <span className="ab-loop__go">See {l.name} <ArrowRight size={14} /></span>
                </Link>
              </li>
            ))}
          </ol>
          <div className="ab-loop__return" aria-hidden="true">
            <span>Trained analysts write better detections, so the next test proves more.</span>
          </div>
        </div>
      </section>

      <section className="pg-section" id="beliefs">
        <div className="ab-beliefs">
          <h2>What we believe</h2>
          <ol data-r>
            {BELIEFS.map((b, n) => (
              <li key={b.title}>
                <span>0{n + 1}</span>
                <strong>{b.title}</strong>
                <p>{b.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pg-section" id="founder">
        <div className="ab-founder">
          <div className="ab-founder__photo">
            <Image src="/Justin.jpg" alt="Justin Duru" width={360} height={420} />
          </div>
          <div className="ab-founder__copy">
            <span className="ab-label">Built from real experience</span>
            <blockquote>
              I kept seeing small security teams asked to do enterprise work without enterprise headcount. PurveX exists to
              close that gap.
            </blockquote>
            <p className="ab-founder__name"><strong>Justin Duru</strong>Founder and Lead Security Consultant</p>
            <ul>
              {FACTS.map((f) => <li key={f}><Check size={14} strokeWidth={3} />{f}</li>)}
            </ul>
            <div className="ab-founder__links">
              <Link href="/about/founder" className="ab-link">Read the full story <ArrowRight size={14} /></Link>
              <a href="https://linkedin.com/in/jduru" target="_blank" rel="noreferrer" className="ab-link">
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
      <style>{AB_CSS}</style>
    </SiteChrome>
  );
}

const AB_CSS = `
/* hero: manifesto over a coverage grid */
.ab-hero { position: relative; padding: clamp(56px, 8vw, 112px) 0 clamp(24px, 3vw, 40px); overflow: hidden }
.ab-hero__grid {
  position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: min(38%, 460px);
  display: grid; grid-template-columns: repeat(12, 1fr); gap: 6px; pointer-events: none;
  -webkit-mask-image: radial-gradient(ellipse at 70% 50%, #000 30%, transparent 72%);
  mask-image: radial-gradient(ellipse at 70% 50%, #000 30%, transparent 72%);
}
.ab-hero__grid i { aspect-ratio: 1; background: #fff; border: 1px solid rgba(106,92,255,.16) }
.ab-hero__grid i[data-c="f"] { animation: ab-fill .5s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--n) * 28ms + .6s) }
.ab-hero__grid i[data-c="m"] { animation: ab-gap .5s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--n) * 28ms + .6s) }
@keyframes ab-fill { from { background: #fff } to { background: rgba(106,92,255,.55); border-color: transparent } }
@keyframes ab-gap { from { background: #fff } to { background: rgba(248,113,113,.4); border-color: transparent } }
.ab-hero__copy { position: relative; z-index: 1; max-width: 680px }
.ab-hero h1 {
  margin: 20px 0 0; font-family: var(--font-display); font-weight: 500;
  font-size: clamp(2.1rem, 4vw, 3.4rem); line-height: 1.08; letter-spacing: -.04em; color: var(--ink); text-wrap: balance;
}
.ab-hero s { position: relative; display: inline-block; white-space: nowrap; text-decoration: none; color: var(--muted) }
.ab-hero s::after {
  content: ""; position: absolute; left: 0; right: 0; top: 55%; height: .08em; background: var(--accent);
  transform: scaleX(0); transform-origin: left; animation: ab-strike .7s .5s cubic-bezier(.16,1,.3,1) forwards;
}
@keyframes ab-strike { to { transform: scaleX(1) } }
.ab-hero__copy > p { margin: 26px 0 0; max-width: 46ch; font-size: 1.15rem; line-height: 1.6; color: var(--ink-soft) }
.ab-hero__actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px }

/* what changes */
.ab-change__wrap { display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); gap: 32px 64px; align-items: start }
.ab-change__head { position: sticky; top: 104px }
.ab-change__head h2 { margin: 0; font-family: var(--font-display); font-weight: 700; letter-spacing: -.022em; line-height: 1.15; font-size: clamp(1.6rem, 2.6vw, 2.1rem); color: var(--ink) }
.ab-change__head p { margin: 12px 0 0; font-size: 1rem; line-height: 1.6; color: var(--muted) }
.ab-change { background: #fff; border: 1px solid var(--border-strong); box-shadow: 0 40px 80px -56px rgba(42,34,128,.45) }
.ab-change__switch { position: relative; display: grid; grid-template-columns: 1fr 1fr; margin: 16px; padding: 4px; background: #f3f3f9; border: 1px solid var(--border) }
.ab-change__switch button { position: relative; z-index: 1; min-height: 42px; border: 0; background: none; cursor: pointer; font-size: .92rem; font-weight: 650; color: var(--muted); transition: color .3s }
.ab-change__switch button[aria-pressed="true"] { color: #fff }
.ab-change__switch button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
.ab-change__switch i {
  position: absolute; top: 4px; bottom: 4px; left: 4px; width: calc(50% - 4px); background: #b42318;
  transition: transform .45s cubic-bezier(.16,1,.3,1), background .45s;
}
.ab-change[data-on="1"] .ab-change__switch i { transform: translateX(100%); background: var(--accent-deep) }
.ab-change ul { list-style: none; margin: 0; padding: 0 }
.ab-change li { display: grid; grid-template-columns: minmax(0, 150px) minmax(0, 1fr); gap: 20px; align-items: center; padding: 22px 24px; border-top: 1px solid var(--border) }
.ab-change__area { font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; letter-spacing: -.02em; color: var(--ink) }
.ab-change li p { display: flex; align-items: flex-start; gap: 12px; margin: 0; font-size: 1.02rem; line-height: 1.5; color: var(--ink); animation: ab-flip .4s cubic-bezier(.16,1,.3,1) both }
.ab-change li p b { display: grid; place-items: center; width: 24px; height: 24px; flex: none; margin-top: 1px; color: #fff; background: #dc2626 }
.ab-change[data-on="1"] li p b { background: #16a34a }
.ab-change li p b svg { position: static }
.ab-change li:nth-child(2) p { animation-delay: .06s }
.ab-change li:nth-child(3) p { animation-delay: .12s }
@keyframes ab-flip { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }

/* loop */
.ab-loop[data-r] { opacity: 1; transform: none; filter: none }
.ab-loop ol { position: relative; list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 40px }
.ab-loop li { position: relative; opacity: 0; transform: translateY(14px); transition: opacity .6s var(--ease), transform .6s var(--ease) }
.ab-loop.in li { opacity: 1; transform: none }
.ab-loop.in li:nth-child(2) { transition-delay: .12s }
.ab-loop.in li:nth-child(3) { transition-delay: .24s }
.ab-loop li + li::before {
  content: ""; position: absolute; left: -32px; top: 64px; width: 24px; height: 2px; background: var(--accent);
}
.ab-loop li + li::after {
  content: ""; position: absolute; left: -12px; top: 60px; border: 5px solid transparent; border-left-color: var(--accent); border-right: 0;
}
.ab-loop a {
  display: flex; flex-direction: column; height: 100%; padding: 26px 24px; background: #fff; border: 1px solid var(--border-strong);
  text-decoration: none; color: inherit; box-shadow: 0 22px 44px -36px rgba(42,34,128,.45);
  transition: border-color .25s, box-shadow .25s, transform .25s;
}
.ab-loop a:hover { border-color: rgba(106,92,255,.5); box-shadow: 0 30px 56px -34px rgba(85,70,224,.55); transform: translateY(-3px) }
.ab-loop a:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
.ab-loop__step { font-family: var(--font-mono); font-size: .74rem; font-weight: 700; color: var(--muted) }
.ab-loop i { display: grid; place-items: center; width: 52px; height: 52px; margin-top: 12px; background: var(--accent); color: #fff; box-shadow: 0 14px 28px -14px rgba(85,70,224,.8) }
.ab-loop i svg { position: static }
.ab-loop strong { display: block; margin-top: 18px; font-family: var(--font-display); font-size: 2rem; font-weight: 600; letter-spacing: -.04em; line-height: 1; color: var(--ink) }
.ab-loop em { display: block; margin-top: 6px; font-style: normal; font-size: .9rem; font-weight: 650; color: var(--accent-deep) }
.ab-loop p { margin: 12px 0 0; font-size: .96rem; line-height: 1.55; color: var(--ink-soft) }
.ab-loop__go { display: inline-flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 18px; font-size: .88rem; font-weight: 650; color: var(--accent-deep) }
.ab-loop__go svg { position: static; transition: transform .25s }
.ab-loop a:hover .ab-loop__go svg { transform: translateX(4px) }
.ab-loop__return {
  position: relative; height: 56px; margin: 0 calc(100% / 6) ; border: 2px solid rgba(106,92,255,.4); border-top: 0;
  display: grid; place-items: end center;
}
.ab-loop__return::before { content: ""; position: absolute; left: -7px; top: -2px; border: 6px solid transparent; border-bottom-color: rgba(106,92,255,.7); border-top: 0 }
.ab-loop__return span { transform: translateY(50%); padding: 4px 14px; background: #fbfcfe; font-size: .88rem; font-weight: 600; color: var(--accent-deep); text-align: center }

/* beliefs */
.ab-beliefs h2 { margin: 0 0 8px; font-family: var(--font-display); font-weight: 700; letter-spacing: -.022em; line-height: 1.15; font-size: clamp(1.6rem, 2.6vw, 2.1rem); color: var(--ink) }
.ab-beliefs ol { list-style: none; margin: 0; padding: 0 }
.ab-beliefs ol[data-r] { opacity: 1; transform: none; filter: none }
.ab-beliefs li {
  display: grid; grid-template-columns: 64px minmax(0, 1.2fr) minmax(0, 1fr); gap: 24px; align-items: baseline; padding: 28px 0; border-bottom: 1px solid var(--border);
  opacity: 0; transform: translateY(12px); transition: opacity .6s var(--ease), transform .6s var(--ease);
}
.ab-beliefs li:first-child { border-top: 1px solid var(--border) }
.ab-beliefs ol.in li { opacity: 1; transform: none }
.ab-beliefs ol.in li:nth-child(2) { transition-delay: .1s }
.ab-beliefs ol.in li:nth-child(3) { transition-delay: .2s }
.ab-beliefs li span { font-family: var(--font-mono); font-size: .86rem; font-weight: 700; color: var(--accent-deep) }
.ab-beliefs li strong { font-family: var(--font-display); font-size: clamp(1.5rem, 2.6vw, 2.1rem); font-weight: 500; letter-spacing: -.035em; line-height: 1.1; color: var(--ink) }
.ab-beliefs li p { margin: 0; font-size: 1.02rem; line-height: 1.55; color: var(--ink-soft) }

/* founder */
.ab-founder { display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); gap: 40px 72px; align-items: center }
.ab-founder__photo { position: relative; margin: 0 22px 22px 0 }
.ab-founder__photo::before { content: ""; position: absolute; inset: 22px -22px -22px 22px; background: var(--accent-soft); border: 1px solid rgba(106,92,255,.25) }
.ab-founder__photo img { position: relative; display: block; width: 100%; height: auto; aspect-ratio: 360 / 420; object-fit: cover; object-position: center 18%; box-shadow: 0 40px 80px -40px rgba(42,34,128,.5) }
.ab-label { display: block; font-size: .82rem; font-weight: 700; color: var(--accent-deep) }
.ab-founder blockquote { margin: 14px 0 0; font-family: var(--font-display); font-size: clamp(1.4rem, 2.4vw, 1.9rem); font-weight: 500; line-height: 1.3; letter-spacing: -.025em; color: var(--ink) }
.ab-founder__name { margin: 18px 0 0; font-size: .92rem; color: var(--muted) }
.ab-founder__name strong { margin-right: 8px; color: var(--ink) }
.ab-founder ul { list-style: none; margin: 22px 0 0; padding: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 28px }
.ab-founder li { display: flex; align-items: flex-start; gap: 10px; font-size: .95rem; line-height: 1.45; color: var(--ink) }
.ab-founder li svg { position: static; flex: none; margin-top: 3px; color: var(--accent-deep) }
.ab-founder__links { display: flex; flex-wrap: wrap; gap: 22px; margin-top: 24px; padding-top: 18px; border-top: 1px solid var(--border) }
.ab-link { display: inline-flex; align-items: center; gap: 6px; font-size: .92rem; font-weight: 650; color: var(--accent-deep); text-decoration: none }
.ab-link:hover { text-decoration: underline; text-underline-offset: 3px }
.ab-link svg { position: static }

@media (prefers-reduced-motion: reduce) {
  .ab-hero__grid i { animation: none !important }
  .ab-hero__grid i[data-c="f"] { background: rgba(106,92,255,.55); border-color: transparent }
  .ab-hero__grid i[data-c="m"] { background: rgba(248,113,113,.4); border-color: transparent }
  .ab-hero s::after { animation: none; transform: scaleX(1) }
  .ab-change li p { animation: none }
  .ab-change__switch i { transition: none }
  .ab-loop li, .ab-beliefs li { opacity: 1; transform: none; transition: none }
}
@media (max-width: 980px) {
  .ab-hero__grid { width: 70%; opacity: .45 }
  .ab-change__wrap { grid-template-columns: minmax(0, 1fr) }
  .ab-change__head { position: static }
  .ab-loop ol { grid-template-columns: minmax(0, 1fr); gap: 32px }
  .ab-loop li + li::before { left: 40px; top: -24px; width: 2px; height: 16px }
  .ab-loop li + li::after { left: 36px; top: -10px; border: 5px solid transparent; border-top-color: var(--accent); border-bottom: 0 }
  .ab-loop__return { height: auto; margin: 24px 0 0; border: 0; place-items: start }
  .ab-loop__return::before { display: none }
  .ab-loop__return span { transform: none; padding: 12px 14px; background: var(--accent-soft); text-align: left }
  .ab-beliefs li { grid-template-columns: 48px minmax(0, 1fr); gap: 8px 16px }
  .ab-beliefs li p { grid-column: 2 }
  .ab-founder { grid-template-columns: minmax(0, 1fr) }
  .ab-founder__photo { max-width: 320px }
}
@media (max-width: 640px) {
  .ab-change li { grid-template-columns: minmax(0, 1fr); gap: 8px; padding: 18px 16px }
  .ab-founder ul { grid-template-columns: minmax(0, 1fr) }
}
`;

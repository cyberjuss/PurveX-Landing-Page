"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Crosshair, Eye, Linkedin, Terminal, X, type LucideIcon } from "lucide-react";
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

const BELIEFS: { title: string; body: string; from: string; to: string; Icon: LucideIcon }[] = [
  { title: "Tested, not trusted.", body: "An alert is not coverage until it has fired against a real attack.", from: "Assumed", to: "Proven", Icon: Crosshair },
  { title: "Learn by doing.", body: "Skills come from working real problems, not from watching someone else.", from: "Watched", to: "Practiced", Icon: Terminal },
  { title: "Clear over clever.", body: "A finding nobody understands never gets fixed.", from: "Clever", to: "Fixed", Icon: Eye },
];

// Resume-style: action, tool, and the result it bought the team.
const FACTS: { tag: string; tool: string; before: string; after: string }[] = [
  { tag: "Detection", before: "Tuned ", tool: "Microsoft Sentinel", after: " detections for a federal agency SOC, so real threats stood out from the noise." },
  { tag: "Automation", before: "Automated incident response in ", tool: "Splunk SOAR", after: ", cutting manual triage for analysts." },
  { tag: "Teaching", before: "Taught SOC fundamentals at ", tool: "Ellington Cyber Academy", after: ", preparing new analysts for real tickets." },
  { tag: "Certified", before: "Certified in ", tool: "CySA+ and Security+", after: "." },
];

// Background coverage grid: f = covered, m = gap. Fills in as the page loads.
const GRID = "ffmffffmfffffmffmfffffffmfffffffmffffmfffffffffmfffffmffffffmffffffmffff".split("");
const FIRED = GRID.filter((c) => c === "f").length;

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
        <figure className="ab-cov" aria-label={`Coverage test: ${FIRED} of ${GRID.length} alerts fired`}>
          <header>
            <span><i className="pg-live" /> Coverage test</span>
            <strong>{FIRED}/{GRID.length} fired</strong>
          </header>
          <div className="ab-cov__grid" aria-hidden="true">
            {GRID.map((c, n) => <i key={n} data-c={c} style={{ ["--n" as string]: n }} />)}
          </div>
          <figcaption>
            <span data-c="f">Fired</span>
            <span data-c="m">Missed</span>
            <em>{GRID.length - FIRED} gaps to fix</em>
          </figcaption>
        </figure>
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
          <div className="pg-head">
            <h2>What we believe</h2>
            <p>Three rules behind every test, fix, and lesson.</p>
          </div>
          <ol data-r>
            {BELIEFS.map(({ title, body, from, to, Icon }, n) => (
              <li key={title}>
                <header>
                  <i><Icon size={22} strokeWidth={1.9} /></i>
                  <span>0{n + 1}</span>
                </header>
                <strong>{title}</strong>
                <p>{body}</p>
                <div className="ab-beliefs__shift">
                  <s>{from}</s>
                  <ArrowRight size={14} aria-hidden="true" />
                  <b><Check size={13} strokeWidth={3} aria-hidden="true" />{to}</b>
                </div>
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
            <span className="sp-tag">Built from real experience</span>
            <figure className="ab-quote">
              <blockquote>
                I kept seeing small security teams asked to do enterprise work without enterprise headcount.{" "}
                <mark>PurveX exists to close that gap.</mark>
              </blockquote>
              <figcaption>
                <strong>Justin Duru</strong>
                <span>Founder and Lead Security Consultant</span>
              </figcaption>
            </figure>
            <div className="ab-creds">
              <span className="ab-creds__head">Track record</span>
              <ul>
                {FACTS.map((f) => (
                  <li key={f.tool}>
                    <em>{f.tag}</em>
                    <p>{f.before}<b>{f.tool}</b>{f.after}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="ab-founder__links">
              <Link href="/about/founder" className="sp-btn sp-btn--ghost sp-btn--lg">
                Read the full story <ArrowRight size={16} />
              </Link>
              <a href="https://linkedin.com/in/jduru" target="_blank" rel="noreferrer" className="ab-link">
                <Linkedin size={15} /> LinkedIn
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
/* hero: manifesto beside a coverage test */
.ab-hero {
  display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, .8fr); gap: 40px 72px; align-items: center;
  padding: clamp(56px, 8vw, 112px) 0 clamp(24px, 3vw, 40px);
}
.ab-cov { margin: 0; padding: 20px; background: #fff; border: 1px solid var(--border-strong); box-shadow: 0 40px 80px -56px rgba(42,34,128,.5) }
.ab-cov header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; font-family: var(--font-mono); font-size: .74rem }
.ab-cov header span { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep) }
.ab-cov header strong { color: var(--ink) }
.ab-cov__grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 5px }
.ab-cov__grid i { aspect-ratio: 1; background: #f3f3f9 }
.ab-cov__grid i[data-c="f"] { animation: ab-fill .5s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--n) * 22ms + .5s) }
.ab-cov__grid i[data-c="m"] { animation: ab-gap .5s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--n) * 22ms + .5s) }
@keyframes ab-fill { from { background: #f3f3f9 } to { background: rgba(106,92,255,.6) } }
@keyframes ab-gap { from { background: #f3f3f9 } to { background: #f87171 } }
.ab-cov figcaption { display: flex; align-items: center; gap: 16px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border); font-size: .8rem; font-weight: 600; color: var(--muted) }
.ab-cov figcaption span { display: inline-flex; align-items: center; gap: 6px }
.ab-cov figcaption span::before { content: ""; width: 10px; height: 10px; background: rgba(106,92,255,.6) }
.ab-cov figcaption span[data-c="m"]::before { background: #f87171 }
.ab-cov figcaption em { margin-left: auto; font-style: normal; font-weight: 700; color: #b42318 }
.ab-hero__copy { max-width: 680px }
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
.ab-beliefs ol { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px }
.ab-beliefs ol[data-r] { opacity: 1; transform: none; filter: none }
.ab-beliefs li {
  position: relative; display: flex; flex-direction: column; padding: 28px 26px 24px; overflow: hidden;
  background: #fff; border: 1px solid var(--border-strong); box-shadow: 0 22px 44px -36px rgba(42,34,128,.45);
  opacity: 0; transform: translateY(14px);
  transition: opacity .6s var(--ease), transform .6s var(--ease), border-color .25s, box-shadow .25s;
}
.ab-beliefs li::before {
  content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px; background: var(--accent);
  transform: scaleX(0); transform-origin: left; transition: transform .45s cubic-bezier(.16,1,.3,1);
}
.ab-beliefs ol.in li { opacity: 1; transform: none }
.ab-beliefs ol.in li:nth-child(2) { transition-delay: .12s }
.ab-beliefs ol.in li:nth-child(3) { transition-delay: .24s }
.ab-beliefs ol.in li:hover { border-color: rgba(106,92,255,.5); box-shadow: 0 30px 56px -34px rgba(85,70,224,.55); transform: translateY(-3px); transition-delay: 0s }
.ab-beliefs li:hover::before { transform: scaleX(1) }
.ab-beliefs header { display: flex; align-items: flex-start; justify-content: space-between }
.ab-beliefs header i { display: grid; place-items: center; width: 48px; height: 48px; background: var(--accent-soft); color: var(--accent-deep); transition: background .25s, color .25s }
.ab-beliefs li:hover header i { background: var(--accent); color: #fff }
.ab-beliefs header i svg { position: static }
.ab-beliefs header span { font-family: var(--font-mono); font-size: 2.6rem; font-weight: 700; line-height: 1; letter-spacing: -.04em; color: rgba(106,92,255,.16) }
.ab-beliefs li strong { display: block; margin-top: 26px; font-family: var(--font-display); font-size: clamp(1.45rem, 2.2vw, 1.8rem); font-weight: 600; letter-spacing: -.035em; line-height: 1.1; color: var(--ink) }
.ab-beliefs li p { margin: 12px 0 22px; font-size: .98rem; line-height: 1.6; color: var(--ink-soft) }
.ab-beliefs__shift {
  display: flex; align-items: center; gap: 10px; margin-top: auto; padding-top: 18px; border-top: 1px dashed var(--border-strong);
  font-family: var(--font-mono); font-size: .78rem; font-weight: 700;
}
.ab-beliefs__shift s { color: var(--muted); text-decoration-color: #dc2626; text-decoration-thickness: 2px }
.ab-beliefs__shift svg { position: static; flex: none; color: var(--muted) }
.ab-beliefs__shift b { display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; background: var(--accent-soft); color: var(--accent-deep) }

/* founder */
.ab-founder { display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); gap: 40px 72px; align-items: center }
.ab-founder__photo { position: relative; margin: 0 22px 22px 0 }
.ab-founder__photo::before { content: ""; position: absolute; inset: 22px -22px -22px 22px; background: var(--accent-soft); border: 1px solid rgba(106,92,255,.25) }
.ab-founder__photo img { position: relative; display: block; width: 100%; height: auto; aspect-ratio: 360 / 420; object-fit: cover; object-position: center 18%; box-shadow: 0 40px 80px -40px rgba(42,34,128,.5) }
.ab-quote { margin: 24px 0 0; padding-left: 24px; border-left: 3px solid var(--accent) }
.ab-quote blockquote { margin: 0; font-family: var(--font-display); font-size: clamp(1.35rem, 2.2vw, 1.75rem); font-weight: 500; line-height: 1.35; letter-spacing: -.022em; color: var(--ink-soft); text-wrap: pretty }
.ab-quote mark { background: linear-gradient(transparent 62%, rgba(106,92,255,.2) 62%); color: var(--ink); font-weight: 600 }
.ab-quote figcaption { display: flex; flex-direction: column; gap: 2px; margin-top: 20px }
.ab-quote figcaption strong { font-size: .95rem; color: var(--ink) }
.ab-quote figcaption span { font-size: .88rem; color: var(--muted) }
.ab-creds { margin-top: 32px; background: #fff; border: 1px solid var(--border-strong); border-left: 4px solid var(--accent); box-shadow: 0 24px 48px -38px rgba(42,34,128,.45) }
.ab-creds__head { display: block; padding: 14px 20px; border-bottom: 1px solid var(--border); font-family: var(--font-mono); font-size: .72rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--accent-deep) }
.ab-creds ul { list-style: none; margin: 0; padding: 0 }
.ab-creds li { display: grid; grid-template-columns: 104px minmax(0, 1fr); gap: 16px; align-items: baseline; padding: 14px 20px }
.ab-creds li + li { border-top: 1px solid var(--border) }
.ab-creds em { font-style: normal; font-size: .8rem; font-weight: 700; color: var(--accent-deep) }
.ab-creds p { margin: 0; font-size: .96rem; line-height: 1.55; color: var(--ink-soft) }
.ab-creds b { font-weight: 650; color: var(--ink) }
.ab-founder__links { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; margin-top: 28px }
.ab-founder__links .sp-btn svg { position: static }
.ab-link { display: inline-flex; align-items: center; gap: 6px; font-size: .92rem; font-weight: 650; color: var(--accent-deep); text-decoration: none }
.ab-link:hover { text-decoration: underline; text-underline-offset: 3px }
.ab-link svg { position: static }

@media (prefers-reduced-motion: reduce) {
  .ab-cov__grid i { animation: none !important }
  .ab-cov__grid i[data-c="f"] { background: rgba(106,92,255,.6) }
  .ab-cov__grid i[data-c="m"] { background: #f87171 }
  .ab-hero s::after { animation: none; transform: scaleX(1) }
  .ab-change li p { animation: none }
  .ab-change__switch i { transition: none }
  .ab-loop li, .ab-beliefs li { opacity: 1; transform: none; transition: none }
  .ab-beliefs li::before { transition: none }
}
@media (max-width: 980px) {
  .ab-hero { grid-template-columns: minmax(0, 1fr) }
  .ab-cov { max-width: 460px }
  .ab-change__wrap { grid-template-columns: minmax(0, 1fr) }
  .ab-change__head { position: static }
  .ab-loop ol { grid-template-columns: minmax(0, 1fr); gap: 32px }
  .ab-loop li + li::before { left: 40px; top: -24px; width: 2px; height: 16px }
  .ab-loop li + li::after { left: 36px; top: -10px; border: 5px solid transparent; border-top-color: var(--accent); border-bottom: 0 }
  .ab-loop__return { height: auto; margin: 24px 0 0; border: 0; place-items: start }
  .ab-loop__return::before { display: none }
  .ab-loop__return span { transform: none; padding: 12px 14px; background: var(--accent-soft); text-align: left }
  .ab-beliefs ol { grid-template-columns: minmax(0, 1fr); gap: 16px }
  .ab-founder { grid-template-columns: minmax(0, 1fr) }
  .ab-founder__photo { max-width: 320px }
}
@media (max-width: 640px) {
  .ab-creds li { grid-template-columns: minmax(0, 1fr); gap: 4px }
  .ab-change li { grid-template-columns: minmax(0, 1fr); gap: 8px; padding: 18px 16px }
}
`;

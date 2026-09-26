"use client";

import Link from "next/link";
import { ArrowRight, Check, Crosshair, Database, Eye, FileLock2, FlaskConical, Lock, Monitor, Server, ShieldCheck, ToggleRight, type LucideIcon } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";
import { PlatformHero } from "./platform-hero";
import { IconAudit, IconChain, IconCompass, IconEvidence, IconLog, IconShield, IconValidate, type BrandIcon } from "./brand-icons";

/* PurveX Platform. Written for security teams in plain words: what it
   proves, how a test works, who uses it, why it is safe to run, and what
   it costs. Plan details match the pricing page. */

const WORKS_WITH: { name: string; Icon: LucideIcon }[] = [
  { name: "Splunk", Icon: Database },
  { name: "Elastic", Icon: Database },
  { name: "Microsoft Sentinel", Icon: ShieldCheck },
  { name: "Atomic Red Team", Icon: FlaskConical },
  { name: "MITRE ATT&CK", Icon: Crosshair },
];

const REASONS = [
  "The log never reached your SIEM",
  "The log arrived but was not read",
  "No rule matched it",
  "The alert never reached anyone",
];

// A small example coverage grid: f = fired, m = missed, u = not tested yet.
const GRID = "ffmfuffmfuufffmfufffmuffufmffuffmfufff".split("");

const STEPS: { title: string; body: string; Icon: BrandIcon }[] = [
  { title: "Connect your SIEM", body: "Read-only access to Splunk, Elastic, or Microsoft Sentinel.", Icon: IconLog },
  { title: "Pick an attack", body: "Choose from the Atomic Red Team library, mapped to MITRE ATT&CK.", Icon: IconValidate },
  { title: "Run the test", body: "A test runner you control plays the attack in your environment.", Icon: IconChain },
  { title: "Read and fix", body: "See what fired, where a miss broke, and how to fix it.", Icon: IconEvidence },
];

const ROLES: { title: string; body: string; Icon: BrandIcon }[] = [
  { title: "Detection engineers", body: "See exactly which stage failed and fix the rule with confidence.", Icon: IconValidate },
  { title: "SOC managers", body: "Know which alerts your analysts can trust, and which need work.", Icon: IconShield },
  { title: "Security leaders", body: "Show real coverage and progress to the board, backed by evidence.", Icon: IconCompass },
];

const SAFE: { title: string; body: string; Icon: LucideIcon }[] = [
  { title: "Read-only on your SIEM", body: "PurveX only checks whether an alert fired. It never changes your rules.", Icon: Eye },
  { title: "Your logs stay put", body: "No raw logs, personal data, or case notes are copied out of your SIEM.", Icon: Lock },
  { title: "Production is opt-in", body: "Tests only run on production machines when you turn that on.", Icon: ToggleRight },
  { title: "Every run is recorded", body: "A full audit trail shows who ran what, where, and when.", Icon: FileLock2 },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    note: "self-hosted",
    items: [
      "Full Atomic Red Team library, mapped to ATT&CK",
      "Splunk, Elastic, or Microsoft Sentinel",
      "Coverage heatmap",
      "Up to 3 team members",
      "1 test runner, 3 runs a day",
      "30 days of audit history",
    ],
    href: "/account/signup?plan=free",
    cta: "Get started free",
    paid: false,
  },
  {
    name: "Paid",
    price: "$99",
    note: "per month",
    items: [
      "Everything in Free",
      "Unlimited team members",
      "Multiple runners, unlimited runs",
      "Scheduled, recurring tests",
      "Detection-as-code, synced from git",
      "Unlimited audit history",
    ],
    href: "/account/signup?plan=paid",
    cta: "Start with Paid",
    paid: true,
  },
];

function Benefits() {
  return (
    <div className="pxb" data-r>
      <article className="pxb-cell pxb-cell--fire">
        <div className="pxb-head">
          <i><IconValidate size={22} /></i>
          <h3>Know which alerts fire</h3>
          <p>Test your detections against real attack behavior instead of assuming they work.</p>
        </div>
        <ul className="pxb-runs">
          <li><span>PowerShell run by a user</span><em data-s="fired">Fired</em></li>
          <li><span>Password theft from memory</span><em data-s="missed">Missed</em></li>
          <li><span>Scheduled task created</span><em data-s="fired">Fired</em></li>
        </ul>
      </article>

      <article className="pxb-cell pxb-cell--why">
        <div className="pxb-head">
          <i><IconChain size={22} /></i>
          <h3>See exactly where it broke</h3>
          <p>A miss is traced to the stage that failed, with a suggested fix.</p>
        </div>
        <ol className="pxb-why">
          {REASONS.map((r, n) => (
            <li key={r} data-on={n === 2 ? "1" : "0"} style={{ ["--n" as string]: n }}>{r}</li>
          ))}
        </ol>
      </article>

      <article className="pxb-cell pxb-cell--map">
        <div className="pxb-head">
          <i><IconAudit size={22} /></i>
          <h3>See your coverage</h3>
          <p>A heatmap across MITRE ATT&amp;CK shows what is covered, what is missed, and what is untested.</p>
        </div>
        <div className="pxb-grid" aria-hidden="true">
          {GRID.map((c, n) => <i key={n} data-c={c} style={{ ["--n" as string]: n }} />)}
        </div>
        <ul className="pxb-legend">
          <li><i data-c="f" /> Fired</li>
          <li><i data-c="m" /> Missed</li>
          <li><i data-c="u" /> Not tested</li>
        </ul>
      </article>

      <article className="pxb-cell pxb-cell--proof">
        <div className="pxb-head">
          <i><IconEvidence size={22} /></i>
          <h3>Prove progress</h3>
          <p>Every run is scored and kept, so reports show improvement with evidence behind it.</p>
        </div>
        <div className="pxb-trend" aria-hidden="true">
          <div>
            <strong>84</strong>
            <span>Detection health, example</span>
          </div>
          <svg viewBox="0 0 200 60" preserveAspectRatio="none">
            <polyline points="0,50 30,46 60,40 90,42 120,30 150,24 180,16 200,10" />
          </svg>
        </div>
      </article>
    </div>
  );
}

export default function PlatformPage() {
  return (
    <SiteChrome active="platform">
      <PlatformHero />

      <div className="px-with">
        <span>Works with</span>
        <ul>
          {WORKS_WITH.map(({ name, Icon }) => (
            <li key={name}><Icon size={16} strokeWidth={1.9} />{name}</li>
          ))}
        </ul>
      </div>

      <section className="pg-section" id="benefits">
        <div className="pg-head">
          <h2>Stop guessing whether your alerts work</h2>
          <p>Most teams find out a detection is broken during a real attack. PurveX tells you first.</p>
        </div>
        <Benefits />
      </section>

      <section className="pg-section" id="how">
        <div className="pg-head">
          <h2>How a test works</h2>
          <p>Four steps from install to a result you can act on.</p>
        </div>
        <ol className="px-steps" data-r>
          {STEPS.map(({ title, body, Icon }, n) => (
            <li key={title}>
              <i><Icon size={22} /><b>{n + 1}</b></i>
              <strong>{title}</strong>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pg-section" id="who">
        <div className="px-who">
          <div className="pg-head">
            <h2>Built for the whole security team</h2>
            <p>Everyone reads the same result, from the person writing rules to the person reporting risk.</p>
          </div>
          <ul data-r>
            {ROLES.map(({ title, body, Icon }) => (
              <li key={title}>
                <i><Icon size={22} /></i>
                <div>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pg-section" id="safe">
        <div className="px-safe">
          <div className="px-safe__copy">
            <h2>Safe to run in your environment</h2>
            <p>PurveX runs on your own server and only asks your SIEM one question: did the alert fire?</p>
            <ul>
              {SAFE.map(({ title, body, Icon }) => (
                <li key={title}>
                  <i><Icon size={18} strokeWidth={1.9} /></i>
                  <div>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <figure className="px-flow" data-r>
            <figcaption>Your environment</figcaption>
            <div className="px-flow__grid">
              <div className="px-node px-node--main">
                <i><Server size={18} /></i>
                <strong>PurveX</strong>
                <span>Self-hosted on your server</span>
                <small><FileLock2 size={12} /> Every run recorded</small>
              </div>

              <div className="px-link" aria-hidden="true">
                <span>Read-only query</span>
                <i className="px-link__out"><b /></i>
                <i className="px-link__back"><b /></i>
                <span>Fired: yes or no</span>
              </div>

              <div className="px-node px-node--siem">
                <i><Database size={18} /></i>
                <strong>Your SIEM</strong>
                <span>Splunk, Elastic, or Sentinel</span>
              </div>

              <div className="px-down" aria-hidden="true">
                <i><b /></i>
                <span>Runs the test. Production only if you opt in.</span>
              </div>

              <div className="px-node px-node--test">
                <i><Monitor size={18} /></i>
                <strong>Test machine</strong>
                <span>A runner you choose</span>
              </div>

              <div className="px-keep">
                <Lock size={16} />
                <p><strong>Stays in your SIEM</strong>Raw logs, personal data, and case notes are never copied out.</p>
              </div>
            </div>
          </figure>
        </div>
      </section>

      <section className="pg-section" id="pricing">
        <div className="pg-head">
          <h2>Start free. Upgrade when your team grows.</h2>
          <p>Same software on both plans. Paid removes the limits.</p>
        </div>
        <div className="px-plans">
          {PLANS.map((p) => (
            <article key={p.name} data-paid={p.paid ? "1" : "0"}>
              <span className="px-plans__name">{p.name}</span>
              <p className="px-plans__price">{p.price}<small>{p.note}</small></p>
              <ul>
                {p.items.map((item) => (
                  <li key={item}><Check size={15} strokeWidth={3} />{item}</li>
                ))}
              </ul>
              <Link href={p.href} className={`sp-btn sp-btn--lg ${p.paid ? "sp-btn--prim" : "sp-btn--ghost"}`}>
                {p.cta} <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <h2>Find out what your alerts miss</h2>
          <p className="pg-close__sub">Install free with one command, or book a call and we will walk you through it.</p>
          <div className="pg-close__row">
            <Link href="/account/signup?plan=free" className="pg-close__book">
              Get started free <ArrowRight size={16} />
            </Link>
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="pg-close__more">
              Book a demo <ArrowRight size={14} />
            </a>
          </div>
        </div>
        <HoldCard source="labs" />
      </section>

      <style>{PG_CSS}</style>
      <style>{PX_CSS}</style>
    </SiteChrome>
  );
}

const PX_CSS = `
/* works with */
.px-with { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px 20px; margin: clamp(36px, 5vw, 60px) 0 0; padding: 22px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border) }
.px-with > span { font-size: .86rem; font-weight: 650; color: var(--muted) }
.px-with ul { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; list-style: none; margin: 0; padding: 0 }
.px-with li { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; background: #fff; border: 1px solid var(--border); font-size: .9rem; font-weight: 600; color: var(--ink-soft) }
.px-with li svg { position: static; color: var(--accent-deep) }

/* benefits */
.pxb[data-r] { opacity: 1; transform: none; filter: none }
.pxb { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px }
.pxb-cell {
  display: flex; flex-direction: column; justify-content: space-between; gap: 24px; padding: 28px;
  background: #fff; border: 1px solid var(--border-strong); box-shadow: 0 22px 44px -34px rgba(42,34,128,.4);
  opacity: 0; transform: translateY(18px); transition: opacity .7s var(--ease), transform .7s var(--ease), border-color .3s, box-shadow .3s;
}
.pxb.in .pxb-cell { opacity: 1; transform: none }
.pxb.in .pxb-cell:nth-child(2) { transition-delay: .08s, .08s, 0s, 0s }
.pxb.in .pxb-cell:nth-child(3) { transition-delay: .16s, .16s, 0s, 0s }
.pxb.in .pxb-cell:nth-child(4) { transition-delay: .24s, .24s, 0s, 0s }
.pxb-cell:hover { border-color: rgba(106,92,255,.4); box-shadow: 0 30px 60px -34px rgba(42,34,128,.5) }
.pxb-cell--fire { grid-column: span 7; background: linear-gradient(150deg, #2a2280, #3d32b0 60%, #4a3fd0); border-color: #2a2280; color: #fff }
.pxb-cell--why { grid-column: span 5 }
.pxb-cell--map { grid-column: span 5; background: repeating-linear-gradient(135deg, rgba(106,92,255,.08) 0 1px, transparent 1px 10px), var(--accent-soft); border-color: rgba(106,92,255,.22) }
.pxb-cell--proof { grid-column: span 7 }
.pxb-head i { display: grid; place-items: center; width: 44px; height: 44px; background: var(--accent-soft); color: var(--accent-deep) }
.pxb-head i svg { position: static }
.pxb-head h3 { margin: 18px 0 0; font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; letter-spacing: -.025em; line-height: 1.15; color: var(--ink) }
.pxb-head p { margin: 8px 0 0; max-width: 44ch; color: var(--ink-soft); font-size: .98rem; line-height: 1.55 }
.pxb-cell--fire .pxb-head i { background: rgba(238,240,255,.14); color: #fff }
.pxb-cell--fire .pxb-head h3 { color: #fff }
.pxb-cell--fire .pxb-head p { color: rgba(238,240,255,.82) }
.pxb-cell--map .pxb-head i { background: #fff }

.pxb-runs { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px }
.pxb-runs li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 14px; background: #fff; color: var(--ink); font-size: .92rem; font-weight: 550; opacity: 0 }
.pxb.in .pxb-runs li { animation: pxb-in .45s cubic-bezier(.16,1,.3,1) forwards }
.pxb.in .pxb-runs li:nth-child(1) { animation-delay: .45s }
.pxb.in .pxb-runs li:nth-child(2) { animation-delay: .6s }
.pxb.in .pxb-runs li:nth-child(3) { animation-delay: .75s }
.pxb-runs em { padding: 3px 9px; font-style: normal; font-size: .74rem; font-weight: 700; color: #fff; background: var(--green) }
.pxb-runs em[data-s="missed"] { background: #e5484d }

.pxb-why { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; counter-reset: why }
.pxb-why li {
  display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 1px solid var(--border); background: #fbfbff;
  font-size: .9rem; color: var(--ink-soft); counter-increment: why; transition: background .4s, border-color .4s, color .4s;
}
.pxb-why li::before { content: counter(why); display: grid; place-items: center; width: 22px; height: 22px; flex: none; font-size: .74rem; font-weight: 700; color: var(--muted); border: 1px solid var(--border-strong) }
.pxb.in .pxb-why li[data-on="1"] { animation: pxb-flag .01s 1.1s forwards }
@keyframes pxb-flag { to { background: #fef3f2; border-color: rgba(229,72,77,.35); color: #b42318 } }

.pxb-grid { display: grid; grid-template-columns: repeat(13, 1fr); gap: 4px }
.pxb-grid i { aspect-ratio: 1; background: #fff; border: 1px solid rgba(106,92,255,.18); opacity: 0 }
.pxb-grid i[data-c="f"] { background: var(--accent); border-color: var(--accent) }
.pxb-grid i[data-c="m"] { background: #f87171; border-color: #f87171 }
.pxb.in .pxb-grid i { animation: pxb-in .35s cubic-bezier(.16,1,.3,1) forwards; animation-delay: calc(var(--n) * 18ms + .4s) }
.pxb-legend { display: flex; flex-wrap: wrap; gap: 14px; list-style: none; margin: -10px 0 0; padding: 0; font-size: .8rem; font-weight: 600; color: var(--ink-soft) }
.pxb-legend li { display: inline-flex; align-items: center; gap: 6px }
.pxb-legend i { width: 10px; height: 10px; background: #fff; border: 1px solid rgba(106,92,255,.3) }
.pxb-legend i[data-c="f"] { background: var(--accent); border-color: var(--accent) }
.pxb-legend i[data-c="m"] { background: #f87171; border-color: #f87171 }

.pxb-trend { display: grid; grid-template-columns: auto 1fr; align-items: end; gap: 24px; padding: 18px 20px; background: #fbfbff; border: 1px solid var(--border) }
.pxb-trend strong { display: block; font-family: var(--font-display); font-size: 2.6rem; font-weight: 600; letter-spacing: -.05em; line-height: 1; color: var(--accent-deep) }
.pxb-trend span { display: block; margin-top: 4px; font-size: .8rem; font-weight: 600; color: var(--muted) }
.pxb-trend svg { width: 100%; height: 64px; overflow: visible }
.pxb-trend polyline { fill: none; stroke: var(--accent); stroke-width: 3; vector-effect: non-scaling-stroke; stroke-dasharray: 400; stroke-dashoffset: 400 }
.pxb.in .pxb-trend polyline { animation: pxb-draw 1.4s .5s cubic-bezier(.16,1,.3,1) forwards }
@keyframes pxb-draw { to { stroke-dashoffset: 0 } }
@keyframes pxb-in { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }

/* steps */
.px-steps { position: relative; list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin: 0; padding: 0 }
.px-steps::before { content: ""; position: absolute; left: 28px; right: calc((100% - 72px) / 4 - 28px); top: 28px; height: 2px; background: linear-gradient(90deg, rgba(106,92,255,.45), rgba(106,92,255,.15)) }
.px-steps li { position: relative }
.px-steps i {
  position: relative; z-index: 1; display: grid; place-items: center; width: 56px; height: 56px; margin-bottom: 18px;
  background: var(--accent); color: #fff; box-shadow: 0 0 0 6px #fbfcfe, 0 16px 30px -16px rgba(85,70,224,.7);
}
.px-steps i svg { position: static }
.px-steps i b { position: absolute; top: -8px; right: -8px; display: grid; place-items: center; width: 22px; height: 22px; font-style: normal; font-size: .72rem; font-weight: 700; background: #fff; color: var(--accent-deep); border: 1px solid rgba(106,92,255,.35) }
.px-steps strong { display: block; font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink) }
.px-steps p { margin: 6px 0 0; max-width: 28ch; color: var(--ink-soft); font-size: .94rem; line-height: 1.5 }

/* roles */
.px-who { display: grid; grid-template-columns: minmax(0, 360px) minmax(0, 1fr); gap: 32px 64px; align-items: center }
.px-who .pg-head { margin: 0 }
.px-who ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px }
.px-who li { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 16px; padding: 18px 20px; background: #fff; border: 1px solid var(--border); border-left: 3px solid var(--accent); box-shadow: 0 18px 36px -30px rgba(42,34,128,.45) }
.px-who li i { display: grid; place-items: center; width: 44px; height: 44px; background: var(--accent-soft); color: var(--accent-deep) }
.px-who li i svg { position: static }
.px-who strong { display: block; font-size: 1.05rem; font-weight: 650; color: var(--ink) }
.px-who p { margin: 3px 0 0; font-size: .93rem; line-height: 1.5; color: var(--muted) }

/* safe */
.px-safe { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); gap: 40px 56px; align-items: center }
.px-safe__copy h2 { margin: 0; font-family: var(--font-display); font-weight: 700; letter-spacing: -.025em; line-height: 1.15; font-size: clamp(1.6rem, 2.6vw, 2.1rem); color: var(--ink); text-wrap: balance }
.px-safe__copy > p { margin: 12px 0 0; max-width: 44ch; color: var(--muted); font-size: 1rem; line-height: 1.6 }
.px-safe__copy ul { list-style: none; margin: 28px 0 0; padding: 0; display: grid; gap: 18px }
.px-safe__copy li { display: grid; grid-template-columns: auto 1fr; gap: 14px; align-items: start }
.px-safe__copy li i { display: grid; place-items: center; width: 36px; height: 36px; background: var(--accent-soft); color: var(--accent-deep) }
.px-safe__copy li i svg { position: static }
.px-safe__copy li strong { display: block; font-size: 1rem; font-weight: 650; color: var(--ink) }
.px-safe__copy li p { margin: 3px 0 0; font-size: .92rem; line-height: 1.5; color: var(--muted) }

.px-flow {
  position: relative; margin: 0; padding: 40px 24px 24px;
  background: radial-gradient(rgba(85,70,224,.12) 1px, transparent 1.2px) 0 0 / 16px 16px, #fbfbff;
  border: 1.5px dashed rgba(85,70,224,.35);
}
.px-flow[data-r] { opacity: 1; transform: none; filter: none }
.px-flow figcaption {
  position: absolute; left: 20px; top: -12px; padding: 3px 10px; background: #fff; border: 1px solid rgba(85,70,224,.3);
  font-size: .78rem; font-weight: 700; color: var(--accent-deep);
}
.px-flow__grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(120px, 1fr) minmax(0, 1fr); grid-template-rows: auto auto auto; gap: 0 }
.px-node {
  position: relative; z-index: 1; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 16px;
  background: #fff; border: 1px solid #e3e4f0; box-shadow: 0 16px 32px -24px rgba(42,34,128,.45);
}
.px-node i { display: grid; place-items: center; width: 34px; height: 34px; margin-bottom: 8px; background: var(--accent-soft); color: var(--accent-deep) }
.px-node i svg { position: static }
.px-node strong { font-size: .98rem; font-weight: 700; color: var(--ink) }
.px-node span { font-size: .8rem; color: var(--muted) }
.px-node small { display: inline-flex; align-items: center; gap: 5px; margin-top: 10px; padding: 3px 8px; font-size: .72rem; font-weight: 650; color: var(--accent-deep); background: var(--accent-soft) }
.px-node small svg { position: static }
.px-flow .px-node--main { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(106,92,255,.1), 0 18px 36px -22px rgba(85,70,224,.6) }
.px-node--main i { background: var(--accent); color: #fff }
.px-node--main { grid-column: 1; grid-row: 1 }
.px-node--siem { grid-column: 3; grid-row: 1; align-self: start }
.px-node--test { grid-column: 1; grid-row: 3 }

.px-link { grid-column: 2; grid-row: 1; display: flex; flex-direction: column; justify-content: center; gap: 6px; padding: 0 6px; text-align: center }
.px-link span { font-size: .72rem; font-weight: 650; color: var(--accent-deep) }
.px-link i { position: relative; display: block; height: 2px; background: rgba(106,92,255,.45) }
.px-link i::after { content: ""; position: absolute; top: -4px; border: 5px solid transparent }
.px-link__out::after { right: -2px; border-left-color: var(--accent); border-right: 0 }
.px-link__back { background: rgba(22,163,74,.45) !important }
.px-link__back::after { left: -2px; border-right-color: var(--q-ok, #16a34a); border-left: 0 }
.px-link b { position: absolute; top: -3px; width: 8px; height: 8px; border-radius: 50%; opacity: 0 }
.px-link__out b { background: var(--accent) }
.px-link__back b { background: #16a34a }

.px-down { grid-column: 1; grid-row: 2; display: grid; grid-template-columns: 2px 1fr; gap: 12px; align-items: center; min-height: 86px; padding-left: 32px }
.px-down i { position: relative; display: block; align-self: stretch; background: rgba(106,92,255,.45) }
.px-down i::after { content: ""; position: absolute; left: -4px; bottom: -2px; border: 5px solid transparent; border-top-color: var(--accent); border-bottom: 0 }
.px-down b { position: absolute; left: -3px; width: 8px; height: 8px; border-radius: 50%; background: var(--accent); opacity: 0 }
.px-down span { font-size: .76rem; font-weight: 600; line-height: 1.35; color: var(--ink-soft) }

.px-keep {
  grid-column: 3; grid-row: 2 / span 2; align-self: end; display: flex; gap: 10px; margin-top: 18px; padding: 14px;
  background: #fff; border: 1px solid rgba(22,163,74,.3); box-shadow: 0 14px 28px -22px rgba(22,101,52,.5);
}
.px-keep svg { position: static; flex: none; margin-top: 2px; color: #16a34a }
.px-keep p { margin: 0; font-size: .8rem; line-height: 1.45; color: var(--ink-soft) }
.px-keep strong { display: block; margin-bottom: 2px; font-size: .86rem; color: #166534 }

@media (prefers-reduced-motion: no-preference) {
  .px-flow.in .px-link__out b { animation: px-right 2.4s .3s ease-in-out infinite }
  .px-flow.in .px-link__back b { animation: px-left 2.4s 1.5s ease-in-out infinite }
  .px-flow.in .px-down b { animation: px-drop 2.4s .9s ease-in-out infinite }
}
@keyframes px-right { 0% { left: 0; opacity: 0 } 10%, 40% { opacity: 1 } 50%, 100% { left: calc(100% - 8px); opacity: 0 } }
@keyframes px-left { 0% { left: calc(100% - 8px); opacity: 0 } 10%, 40% { opacity: 1 } 50%, 100% { left: 0; opacity: 0 } }
@keyframes px-drop { 0% { top: 0; opacity: 0 } 10%, 40% { opacity: 1 } 50%, 100% { top: calc(100% - 8px); opacity: 0 } }

/* plans */
.px-plans { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 920px }
.px-plans article { display: flex; flex-direction: column; padding: 30px; background: #fff; border: 1px solid var(--border-strong); box-shadow: 0 22px 44px -34px rgba(42,34,128,.4) }
.px-plans article[data-paid="1"] { border: 2px solid var(--accent); box-shadow: 0 30px 60px -34px rgba(85,70,224,.5) }
.px-plans__name { font-size: .9rem; font-weight: 700; color: var(--accent-deep) }
.px-plans__price { margin: 8px 0 0; font-family: var(--font-display); font-size: 3rem; font-weight: 600; letter-spacing: -.05em; line-height: 1; color: var(--ink) }
.px-plans__price small { margin-left: 8px; font-family: inherit; font-size: .95rem; font-weight: 500; letter-spacing: 0; color: var(--muted) }
.px-plans ul { list-style: none; margin: 24px 0 28px; padding: 0; display: grid; gap: 10px }
.px-plans li { display: flex; align-items: flex-start; gap: 10px; font-size: .95rem; line-height: 1.4; color: var(--ink) }
.px-plans li svg { position: static; flex: none; margin-top: 2px; color: var(--green) }
.px-plans .sp-btn { margin-top: auto; justify-content: center }

/* reduced motion: finished states */
@media (prefers-reduced-motion: reduce) {
  .pxb-cell, .pxb.in .pxb-cell { opacity: 1; transform: none; transition: none }
  .pxb .pxb-runs li, .pxb .pxb-grid i { opacity: 1 !important; animation: none !important }
  .pxb .pxb-trend polyline { stroke-dashoffset: 0; animation: none !important }
  .pxb .pxb-why li[data-on="1"] { background: #fef3f2; border-color: rgba(229,72,77,.35); color: #b42318; animation: none !important }
}

@media (max-width: 1020px) {
  .pxb-cell--fire, .pxb-cell--why, .pxb-cell--map, .pxb-cell--proof { grid-column: span 12 }
  .px-steps { grid-template-columns: 1fr 1fr; row-gap: 32px }
  .px-steps::before { display: none }
  .px-who { grid-template-columns: minmax(0, 1fr) }
  .px-safe { grid-template-columns: minmax(0, 1fr) }
}
@media (max-width: 640px) {
  .pxb-cell { padding: 22px 18px }
  .px-steps { grid-template-columns: 1fr }
  .px-flow { padding: 32px 14px 16px }
  .px-flow__grid { grid-template-columns: minmax(0, 1fr); grid-template-rows: none }
  .px-flow__grid > * { grid-column: 1 !important; grid-row: auto !important }
  .px-node--siem { order: 1 }
  .px-keep { order: 2; margin-top: 0 !important; border-top: 0 }
  .px-link { order: 3 }
  .px-flow .px-node--main { order: 4 }
  .px-down { order: 5 }
  .px-node--test { order: 6 }
  .px-link { padding: 10px 0; gap: 4px }
  .px-link i { display: none }
  .px-down { min-height: 64px }
  .px-keep { margin-top: 10px }
  .px-plans { grid-template-columns: 1fr }
  .px-plans article { padding: 24px 20px }
  .px-with > span { width: 100%; text-align: center }
}
`;

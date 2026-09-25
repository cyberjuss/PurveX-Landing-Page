"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CoverageMatrix, COVERAGE_PERCENT, LAB_CSS } from "./lab-visuals";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { CaseFloor, DETECTION_ALERTS, DETECTION_CASES } from "./case-floor";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";

const VERDICTS = ["Missed", "Fired", "Noisy"];

function LiveVerdict() {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % VERDICTS.length), 4200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <p className="ox-live" data-s={VERDICTS[i]} key={VERDICTS[i]}>
      {VERDICTS[i]}
    </p>
  );
}

export default function SecurityOperationsPage() {
  return (
    <SiteChrome active="security-operations">
      <section className="pg-hero ox-hero">
        <LiveVerdict />
        <div className="pg-hero__copy">
          <span className="sp-tag">Operations</span>
          <h1 className="pg-hero__h1">Make it fire</h1>
          <p className="pg-hero__sub">We write the detection for your logs, then we run it. You keep the miss and the evidence.</p>
          <div className="pg-hero__actions">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <a href="#work" className="sp-btn sp-btn--ghost sp-btn--lg">
              See the work
            </a>
          </div>
        </div>
        <CaseFloor cases={DETECTION_CASES} alerts={DETECTION_ALERTS} label="Last run" />
      </section>

      <section className="pg-section" id="work">
        <div className="pg-head">
          <h2>Did it fire</h2>
          <p>The rule is in. The alert is not.</p>
        </div>
        <div className="ox-keep">
          <div>
            <header><i>01</i><span>The rule</span></header>
            <p>Written for your logs, not a vendor template.</p>
          </div>
          <div>
            <header><i>02</i><span>The noise</span></header>
            <p>Cut, so a real alert is not buried under it.</p>
          </div>
          <div>
            <header><i>03</i><span>The map</span></header>
            <p>What the SIEM sees, and the technique it never fired.</p>
          </div>
          <div>
            <header><i>04</i><span>The run</span></header>
            <p>Fired, missed, or noisy. The evidence stays with you.</p>
          </div>
          <p className="ox-keep__close"><span>You leave with the run</span><em>the miss, and the evidence.</em></p>
        </div>
      </section>

      <section className="pg-section">
        <div className="pg-dark" data-r>
          <div className="lb-band">
            <div>
              <span className="pg-dark__kicker">Example</span>
              <h2>A miss you can point at</h2>
              <ul className="lb-legend">
                <li><i data-s="fired" /> Fired</li>
                <li><i data-s="missed" /> Missed</li>
                <li><i data-s="untested" /> Not yet tested</li>
              </ul>
            </div>
            <div className="lb-big">
              <strong>{COVERAGE_PERCENT}%</strong>
              <span>of tested techniques fired<br />Example matrix</span>
            </div>
          </div>
          <CoverageMatrix />
        </div>
      </section>

      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <h2>Bring one rule you trust</h2>
          <p className="pg-close__sub">We will tell you if it fires.</p>
          <div className="pg-close__row">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="pg-close__book">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <Link href="/about" className="pg-close__more">
              About PurveX <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <HoldCard source="operations" />
      </section>

      <style>{PG_CSS}</style>
      <style>{LAB_CSS}</style>
      <style>{`
        .ox-hero { position: relative; overflow: visible; align-items: center }
        .ox-live {
          grid-column: 1 / -1; margin: 8px 0 -12px;
          font-family: var(--font-display); font-weight: 700;
          font-size: clamp(4.8rem, 12vw, 8.8rem); line-height: .78; letter-spacing: -.065em;
          color: transparent; -webkit-text-stroke: 1.5px rgba(106,92,255,.45);
          pointer-events: none; user-select: none;
        }
        .ox-live[data-s="Missed"] { -webkit-text-stroke-color: rgba(229,72,77,.62) }
        .ox-live[data-s="Fired"] { -webkit-text-stroke-color: rgba(22,163,74,.62) }
        .ox-hero .pg-hero__h1 { font-size: clamp(2.4rem, 4vw, 3.4rem) }
        .ox-hero .pg-hero__copy { position: relative; z-index: 2 }
        .ox-hero .cf-stamp { display: none }
        .ox-hero .cf-stamp-off {
          display: block; position: absolute; z-index: 0; right: 112%; left: auto; top: -6%;
          width: max-content; white-space: nowrap; margin: 0;
          font-family: var(--font-display); font-weight: 700;
          font-size: clamp(4.2rem, 7vw, 6.4rem); line-height: .85; letter-spacing: -.06em;
          color: transparent; -webkit-text-stroke: 1.5px rgba(106,92,255,.4);
          pointer-events: none; user-select: none;
        }
        .ox-hero .cf-stamp[data-s="Missed"] { -webkit-text-stroke-color: rgba(229,72,77,.55) }
        .ox-hero .cf-stamp[data-s="Fired"] { -webkit-text-stroke-color: rgba(22,163,74,.55) }
        .ox-hero .cf-ticket { position: relative; z-index: 1 }
        .ox-hero .cf-floor { margin-top: -28px }
        .ox-keep {
          display: grid; grid-template-columns: 1fr 1fr;
          background: #fff; border: 1px solid rgba(85,70,224,.22); border-left: 4px solid var(--accent);
          clip-path: polygon(0 0, calc(100% - 28px) 0, 100% 28px, 100% 100%, 0 100%);
          box-shadow: var(--highlight), var(--shadow-lg);
        }
        .ox-keep > div { padding: 28px 32px 26px }
        .ox-keep > div:nth-child(odd) { border-right: 1px solid var(--border) }
        .ox-keep > div:nth-child(-n+2) { border-bottom: 1px solid var(--border) }
        .ox-keep header { display: flex; align-items: baseline; gap: 12px }
        .ox-keep header i {
          font-style: normal; font-family: var(--font-display); font-weight: 700; font-size: 1.35rem;
          line-height: 1; letter-spacing: -.04em; color: transparent;
          -webkit-text-stroke: 1.25px rgba(106,92,255,.65);
          transition: color .2s var(--ease), -webkit-text-stroke .2s var(--ease);
        }
        .ox-keep > div:hover header i { color: var(--accent); -webkit-text-stroke: 0 }
        .ox-keep header span {
          font-family: var(--font-mono); font-size: .68rem; font-weight: 700;
          letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep);
        }
        .ox-keep > div > p {
          margin: 12px 0 0; max-width: 36ch; color: var(--ink);
          font-size: 1.12rem; line-height: 1.45; font-weight: 400;
        }
        .ox-keep__close {
          grid-column: 1 / -1; display: flex; flex-direction: column; gap: 6px;
          margin: 0; padding: 20px 32px 24px; border-top: 1px solid var(--border); background: #fff;
        }
        .ox-keep__close span {
          font-family: var(--font-display); font-weight: 500;
          font-size: clamp(1.05rem, 1.5vw, 1.25rem); letter-spacing: -.02em; color: var(--ink-soft);
        }
        .ox-keep__close em {
          font-style: normal; font-family: var(--font-display); font-weight: 500; width: fit-content;
          font-size: clamp(1.7rem, 3vw, 2.4rem); letter-spacing: -.04em; line-height: 1.05; color: var(--accent-deep);
        }
        @media (max-width: 760px) {
          .ox-keep { grid-template-columns: 1fr }
          .ox-keep > div:nth-child(odd) { border-right: 0 }
          .ox-keep > div:nth-child(-n+3) { border-bottom: 1px solid var(--border) }
        }
        @media (prefers-reduced-motion: reduce) {
          .ox-keep header i { transition: none }
        }
        @media (prefers-reduced-motion: no-preference) {
          .ox-live { animation: ox-stamp .55s var(--ease) both; }
          .ox-hero .cf-ticket__ask { animation: ox-ask .65s var(--ease) .4s both; }
          .ox-hero .cf-stamp { animation: ox-stamp .55s var(--ease) both; }
        }
        @keyframes ox-ask { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: none; } }
        @keyframes ox-stamp {
          0% { opacity: 0; transform: translateY(10px) }
          100% { opacity: 1; transform: none }
        }
        @media (max-width: 980px) {
          .ox-hero .cf-stamp { position: relative; right: auto; top: 0; display: block; margin: 0 0 -8px; font-size: 3.4rem }
        }
      `}</style>
    </SiteChrome>
  );
}
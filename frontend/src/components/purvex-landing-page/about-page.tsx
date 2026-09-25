"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IconEvidence, IconIdentity, IconLog, IconSchedule, IconShield } from "./brand-icons";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";

const notes = [
  { n: "01", title: "The standard", body: "A detection and a student ticket get the same care.", Icon: IconShield },
  { n: "02", title: "The person", body: "One person. No account manager in between.", Icon: IconIdentity },
  { n: "03", title: "What is next", body: "Labs keeps the evidence. It is not public yet.", Icon: IconSchedule },
];

const workflow = [
  { n: "01", title: "Book", body: "Thirty minutes to describe your SIEM or your program.", Icon: IconSchedule },
  { n: "02", title: "Walk through", body: "We review what fires and what does not, or where a cohort should start.", Icon: IconLog },
  { n: "03", title: "Agree the scope", body: "A short engagement, with one named person on every step.", Icon: IconEvidence },
];

export default function AboutPage() {
  return (
    <SiteChrome active="about">
      <section className="pg-hero ab-hero">
        <div className="pg-hero__copy">
          <span className="sp-tag">About</span>
          <h1 className="pg-hero__h1">How you do anything is how you do everything</h1>
          <p className="pg-hero__sub">The person on your SIEM is the person at the desk. Same standard. No one in between.</p>
          <div className="pg-hero__actions">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <Link href="/about/founder" className="sp-btn sp-btn--ghost sp-btn--lg">
              Meet the founder
            </Link>
          </div>
        </div>
        <div className="ab-hero__rings" aria-hidden="true">
          <svg viewBox="0 0 460 340">
            <circle cx="168" cy="170" r="122" className="ab-c ab-c--a" />
            <circle cx="292" cy="170" r="122" className="ab-c ab-c--b" />
          </svg>
          <span>One person</span>
        </div>
      </section>

      <section className="pg-section">
        <div className="ab-split">
          <div>
            <div className="pg-head" data-r>
              <h2>One person. Both jobs.</h2>
              <p>Short engagements. The person doing the work is the person you talk to.</p>
            </div>
            <ol className="ab-rows" data-r>
              {notes.map((n) => (
                <li key={n.n}>
                  <i className="pg-ico"><n.Icon size={22} /></i>
                  <div>
                    <h3>{n.title}</h3>
                    <p>{n.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="pg-section">
        <div className="ab-statement" data-r>
          <h2>
            You defend better when you know <mark>how the other side moves</mark>.
          </h2>
          <p>
            Operations tests the way an attacker would. Training teaches the analyst to think the same way.
          </p>
        </div>
      </section>

      <section className="pg-section">
        <div className="ox-split">
          <div className="pg-head" data-r>
            <h2>Book. Walk. Agree.</h2>
            <p>No hand-off to someone new.</p>
          </div>
          <ol className="ox-steps" data-r>
            {workflow.map((s) => (
              <li key={s.n}>
                <span className="ox-steps__n">{s.n}</span>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
                <i className="pg-ico"><s.Icon size={24} /></i>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="pg-section">
        <div className="ab-links" data-r>
          <Link href="/about/founder">
            <span>People</span>
            <strong>Meet the founder</strong>
            <p>The person doing the work is the person you talk to.</p>
            <i><ArrowRight size={20} /></i>
          </Link>
          <Link href="/platform">
            <span>In development</span>
            <strong>PurveX Platform</strong>
            <p>A scheduled test that names the broken stage. Still private.</p>
            <i><ArrowRight size={20} /></i>
          </Link>
        </div>
      </section>

      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <h2>Bring the work</h2>
          <p className="pg-close__sub">Thirty minutes. Operations, a cohort, or Labs.</p>
          <div className="pg-close__row">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="pg-close__book">
              Book 30 minutes <ArrowRight size={16} />
            </a>
            <Link href="/" className="pg-close__more">
              Back home <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <HoldCard source="about" />
      </section>

      <style>{PG_CSS}</style>
      <style>{`
        .ab-hero { position: relative; align-items: center; overflow: visible }
        .ab-split { grid-template-columns: minmax(0, 640px) }
        .ab-hero .pg-hero__copy { position: relative; z-index: 1; max-width: 16ch }
        .ab-hero .pg-hero__h1 { font-size: clamp(3.4rem, 6.2vw, 6rem); line-height: .92; letter-spacing: -.055em }
        .ab-hero .pg-hero__sub { max-width: 34ch }
        .ab-hero__rings { position: relative; align-self: center; z-index: 0 }
        .ab-hero__rings svg { width: min(100%, 520px); height: auto; display: block }
        .ab-hero .ab-c--a { fill: rgba(106,92,255,.14); stroke: rgba(106,92,255,.5); stroke-width: 1.5 }
        .ab-hero .ab-c--b { fill: rgba(16,25,46,.03); stroke: rgba(16,25,46,.28); stroke-width: 1.5 }
        .ab-hero__rings span {
          position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
          font-family: var(--font-display); font-weight: 700; font-size: 1.15rem; letter-spacing: -.03em;
          color: var(--accent-deep);
        }
        @media (prefers-reduced-motion: no-preference) {
          .ab-hero .ab-c--a { animation: ab-meet-a .9s var(--ease) .1s both }
          .ab-hero .ab-c--b { animation: ab-meet-b .9s var(--ease) .1s both }
          .ab-statement mark {
            background-image: linear-gradient(transparent 62%, rgba(106,92,255,.28) 62%);
            background-repeat: no-repeat;
            background-size: 0 100%;
            animation: ab-mark 1s var(--ease) .2s forwards;
          }
        }
        @keyframes ab-meet-a { from { transform: translateX(-28px); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes ab-meet-b { from { transform: translateX(28px); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes ab-mark { to { background-size: 100% 100% } }
        @media (max-width: 980px) {
          .ab-hero { min-height: 0; overflow: visible }
          .ab-hero .pg-hero__copy { max-width: none }
          .ab-hero .pg-hero__h1 { font-size: clamp(2.6rem, 10vw, 3.6rem) }
        }
      `}</style>
    </SiteChrome>
  );
}

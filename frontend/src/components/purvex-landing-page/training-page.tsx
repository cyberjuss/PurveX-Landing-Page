"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";
import { TrainingHero } from "./training-hero";
import {
  IconAlert, IconBook, IconBriefcase, IconCampus, IconChecks, IconCivic, IconEvidence, IconGraduate,
  IconLifebuoy, IconLog, IconMic, IconSchedule, IconShield, IconTicket, IconValidate,
  type BrandIcon,
} from "./brand-icons";

/* Cybersecurity Training. Same skin as the home page (page-skin.ts).
   Written for buyers and students, not engineers: what they get, what is
   inside, and how the course runs. The course section reads the Academy
   portal's own content, so it cannot drift from what students see. */

export type CourseOutline = {
  label: string;
  title: string;
  entries: { title: string; summary: string; live: boolean; lessons: string[] }[];
}[];

type Item = { title: string; body: string; Icon: BrandIcon };

const BENEFITS: Item[] = [
  { Icon: IconLog, title: "Learn by doing", body: "Every student builds a small company network on their own computer and fixes real problems in it." },
  { Icon: IconLifebuoy, title: "Help that teaches", body: "An AI coach gives the next step when they are stuck. It never hands over the answer." },
  { Icon: IconValidate, title: "Skills that are checked", body: "Work passes only when their lab shows the fix. There is no credit for guessing." },
  { Icon: IconBriefcase, title: "Proof for hiring", body: "They finish with a readiness score and a record of real work a hiring manager can read." },
];

const FEATURES: Item[] = [
  { Icon: IconBook, title: "Guided course", body: "Weekly lessons from security basics to incident response." },
  { Icon: IconShield, title: "Personal lab", body: "Their own company network, built on their own machine." },
  { Icon: IconTicket, title: "Real tickets", body: "Help desk tasks that are checked automatically." },
  { Icon: IconAlert, title: "Security alerts", body: "Investigate a suspicious login one step at a time." },
  { Icon: IconSchedule, title: "Daily drills", body: "Five quick questions in three minutes, at four levels." },
  { Icon: IconChecks, title: "Weekly challenge", body: "A capture the flag puzzle built from their own lab." },
  { Icon: IconMic, title: "Mock interviews", body: "Scored practice answers with notes on how to improve." },
  { Icon: IconEvidence, title: "Readiness report", body: "Four job skills scored, with what to work on next." },
];

const AUDIENCES: Item[] = [
  { Icon: IconGraduate, title: "Students and career changers", body: "Get hands-on experience before the first job asks for it." },
  { Icon: IconCampus, title: "Schools and workforce programs", body: "One course for the whole class. A passcode opens it and each student gets a report." },
  { Icon: IconCivic, title: "Employers and public agencies", body: "Train new hires or upskill a team, and see who is ready." },
];


function plainWeek(title: string) {
  return title.replace(/^Week \d+:\s*/, "");
}

function Course({ outline }: { outline: CourseOutline }) {
  return (
    <ol className="tp-course" data-r>
      {outline.map((phase, n) => {
        const live = phase.entries.some((e) => e.live);
        return (
          <li key={phase.label} data-live={live ? "1" : "0"}>
            <i>{n + 1}</i>
            <span>{live ? phase.label : `${phase.label}, coming soon`}</span>
            <strong>{phase.title}</strong>
            {phase.entries.length > 0 && (
              <ul>
                {phase.entries.map((e) => (
                  <li key={e.title}>{plainWeek(e.title)}</li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function TrainingPage({ outline }: { outline: CourseOutline }) {
  return (
    <SiteChrome active="training">
      <TrainingHero />

      <section className="pg-section" id="benefits">
        <div className="pg-head">
          <h2>What students walk away with</h2>
        </div>
        <ul className="tp-benefits" data-r>
          {BENEFITS.map(({ Icon, title, body }) => (
            <li key={title}>
              <i><Icon size={24} /></i>
              <strong>{title}</strong>
              <p>{body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="pg-section tp-features" id="features">
        <div className="tp-features__head">
          <h2>Everything in the Academy</h2>
          <p>One portal for learning, practice, and proof. Students sign in and everything is there.</p>
          <Link href="/academy" className="tp-link">
            Open the portal <ArrowRight size={14} />
          </Link>
        </div>
        <ul className="tp-feature-list" data-r>
          {FEATURES.map(({ Icon, title, body }) => (
            <li key={title}>
              <i><Icon size={20} /></i>
              <div>
                <strong>{title}</strong>
                <p>{body}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="pg-section" id="course">
        <div className="pg-head">
          <h2>The course, from basics to response</h2>
          <p>Three phases. Each one pairs short lessons with hands-on work in the lab.</p>
        </div>
        <Course outline={outline} />
      </section>

      <section className="pg-section" id="who">
        <div className="tp-who">
          <h2>Built for learners and the teams that train them</h2>
          <ul data-r>
            {AUDIENCES.map(({ Icon, title, body }) => (
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


      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <h2>Start a cohort</h2>
          <p className="pg-close__sub">A short call to plan your class. Already enrolled? Sign in to the portal.</p>
          <div className="pg-close__row">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="pg-close__book">
              Book a cohort <ArrowRight size={16} />
            </a>
            <Link href="/academy" className="pg-close__more">
              Sign in <ArrowRight size={14} />
            </Link>
          </div>
        </div>
        <HoldCard source="training" />
      </section>

      <style>{PG_CSS}</style>
      <style>{`
        .tp-benefits { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px }
        .tp-benefits li {
          display: flex; flex-direction: column; padding: 26px 24px 28px; background: #fff;
          border: 1px solid var(--border-strong); border-top: 3px solid var(--accent);
          box-shadow: 0 22px 44px -32px rgba(42,34,128,.35);
        }
        .tp-benefits li:first-child { background: #3d32b0; border-color: #3d32b0; color: #fff }
        .tp-benefits i {
          display: grid; place-items: center; width: 48px; height: 48px; margin-bottom: 22px;
          background: var(--accent-soft); color: var(--accent-deep);
        }
        .tp-benefits li:first-child i { background: rgba(238,240,255,.14); color: #fff }
        .tp-benefits strong { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; letter-spacing: -.02em; line-height: 1.2 }
        .tp-benefits p { margin: 10px 0 0; color: var(--ink-soft); font-size: .95rem; line-height: 1.55 }
        .tp-benefits li:first-child p { color: rgba(238,240,255,.82) }

        .tp-features { display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); gap: 32px 72px; align-items: start }
        .tp-features__head { position: sticky; top: 104px }
        .tp-features__head h2 {
          margin: 0; font-family: var(--font-display); font-weight: 700; letter-spacing: -.022em; line-height: 1.15;
          font-size: clamp(1.6rem, 2.6vw, 2.1rem); color: var(--ink); text-wrap: balance;
        }
        .tp-features__head p { margin: 12px 0 0; color: var(--muted); font-size: 1rem; line-height: 1.6; max-width: 34ch }
        .tp-link {
          display: inline-flex; align-items: center; gap: 7px; margin-top: 20px;
          font-size: .92rem; font-weight: 650; color: var(--accent-deep); text-decoration: none;
          transition: gap .25s var(--ease);
        }
        .tp-link:hover { gap: 11px }
        .tp-feature-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 0 40px }
        .tp-feature-list li { display: grid; grid-template-columns: auto 1fr; gap: 16px; align-items: start; padding: 22px 0; border-top: 1px solid var(--border) }
        .tp-feature-list i {
          display: grid; place-items: center; width: 42px; height: 42px;
          background: var(--accent-soft); color: var(--accent-deep); border: 1px solid rgba(106,92,255,.18);
        }
        .tp-feature-list strong { display: block; font-size: 1.05rem; font-weight: 650; letter-spacing: -.014em; color: var(--ink) }
        .tp-feature-list p { margin: 4px 0 0; color: var(--muted); font-size: .92rem; line-height: 1.5 }

        .tp-course { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); position: relative }
        .tp-course::before { content: ""; position: absolute; left: 24px; right: 24px; top: 24px; height: 2px; background: rgba(106,92,255,.2) }
        .tp-course > li { position: relative; padding: 0 28px 8px 0 }
        .tp-course > li + li { padding-left: 28px }
        .tp-course > li > i {
          position: relative; z-index: 1; display: grid; place-items: center; width: 48px; height: 48px; margin-bottom: 20px;
          font-style: normal; font-family: var(--font-display); font-size: 1.3rem; font-weight: 700;
          background: var(--accent); color: #fff;
        }
        .tp-course > li[data-live="0"] > i { background: #fff; color: var(--accent-deep); border: 1px solid rgba(106,92,255,.3) }
        .tp-course > li > span { display: block; font-size: .85rem; font-weight: 600; color: var(--accent-deep) }
        .tp-course > li > strong { display: block; margin-top: 6px; font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; letter-spacing: -.02em; line-height: 1.2; color: var(--ink) }
        .tp-course ul { list-style: none; margin: 16px 0 0; padding: 0; display: flex; flex-direction: column; gap: 8px }
        .tp-course ul li { position: relative; padding-left: 16px; color: var(--ink-soft); font-size: .93rem; line-height: 1.4 }
        .tp-course ul li::before { content: ""; position: absolute; left: 0; top: .5em; width: 6px; height: 6px; background: var(--accent) }
        .tp-course > li[data-live="0"] > strong, .tp-course > li[data-live="0"] > span { color: var(--muted) }

        .tp-who {
          display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 32px 64px; align-items: center;
          padding: clamp(32px, 5vw, 64px); background: var(--accent-soft); border: 1px solid rgba(106,92,255,.16);
        }
        .tp-who h2 {
          margin: 0; font-family: var(--font-display); font-weight: 700; letter-spacing: -.028em; line-height: 1.1;
          font-size: clamp(1.8rem, 3.2vw, 2.5rem); color: var(--ink); text-wrap: balance;
        }
        .tp-who ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px }
        .tp-who li {
          display: grid; grid-template-columns: auto 1fr; gap: 16px; align-items: center; padding: 18px 20px; background: #fff;
          border-left: 4px solid var(--accent); box-shadow: 0 18px 40px -30px rgba(42,34,128,.4);
        }
        .tp-who li i { display: grid; place-items: center; width: 44px; height: 44px; color: var(--accent-deep); background: var(--accent-soft) }
        .tp-who strong { display: block; font-size: 1.05rem; font-weight: 650; letter-spacing: -.014em; color: var(--ink) }
        .tp-who p { margin: 4px 0 0; color: var(--muted); font-size: .92rem; line-height: 1.5 }


        .tp-benefits[data-r], .tp-feature-list[data-r], .tp-course[data-r], .tp-who ul[data-r] { opacity: 1; transform: none; filter: none }
        .tp-benefits[data-r] > li, .tp-feature-list[data-r] > li, .tp-course[data-r] > li, .tp-who ul[data-r] > li {
          opacity: 0; transform: translateY(16px); transition: opacity .6s var(--ease), transform .6s var(--ease);
          transition-delay: calc(var(--n, 0) * 70ms);
        }
        .tp-benefits[data-r].in > li, .tp-feature-list[data-r].in > li, .tp-course[data-r].in > li, .tp-who ul[data-r].in > li { opacity: 1; transform: none }
        .tp-benefits > li:nth-child(2), .tp-feature-list > li:nth-child(2), .tp-course > li:nth-child(2), .tp-who li:nth-child(2) { --n: 1 }
        .tp-benefits > li:nth-child(3), .tp-feature-list > li:nth-child(3), .tp-course > li:nth-child(3), .tp-who li:nth-child(3) { --n: 2 }
        .tp-benefits > li:nth-child(4), .tp-feature-list > li:nth-child(4) { --n: 3 }
        .tp-feature-list > li:nth-child(5) { --n: 4 }
        .tp-feature-list > li:nth-child(6) { --n: 5 }
        .tp-feature-list > li:nth-child(7) { --n: 6 }
        .tp-feature-list > li:nth-child(8) { --n: 7 }
        @media (prefers-reduced-motion: reduce) {
          .tp-benefits[data-r] > li, .tp-feature-list[data-r] > li, .tp-course[data-r] > li, .tp-who ul[data-r] > li { opacity: 1; transform: none; transition: none }
        }

        @media (max-width: 1080px) {
          .tp-benefits { grid-template-columns: 1fr 1fr }
        }
        @media (max-width: 860px) {
          .tp-features, .tp-who { grid-template-columns: minmax(0, 1fr) }
          .tp-features__head { position: static }
          .tp-course { grid-template-columns: 1fr; gap: 32px }
          .tp-course::before { left: 23px; right: auto; top: 24px; bottom: 24px; width: 2px; height: auto }
          .tp-course > li, .tp-course > li + li { padding: 0 0 0 68px }
          .tp-course > li > i { position: absolute; left: 0; top: 0; margin: 0 }
        }
        @media (max-width: 640px) {
          .tp-benefits, .tp-feature-list { grid-template-columns: 1fr }
          .tp-who { padding: 24px 16px }
          .tp-who li { padding: 16px }
        }
      `}</style>
    </SiteChrome>
  );
}

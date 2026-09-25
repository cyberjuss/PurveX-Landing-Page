"use client";

import Link from "next/link";
import {
  ArrowRight, BookOpen, Bug, FileSearch, Fingerprint, KeyRound, MonitorDot, Network, Radar, ScanSearch,
  Server, ShieldCheck, ShieldHalf, Siren, type LucideIcon,
} from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";
import { TrainingHero } from "./training-hero";
import { TrainingAudiences } from "./training-audiences";
import { TrainingBenefits } from "./training-benefits";
import {
  IconAlert, IconBook, IconChecks, IconEvidence, IconMic, IconSchedule, IconShield, IconTicket,
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



function plainWeek(title: string) {
  return title.replace(/^Week \d+:\s*/, "");
}

const PHASE_ICONS: LucideIcon[] = [ShieldCheck, Radar, Siren];

// Week icons are matched on the topic name, so new weeks in the portal
// pick up a fitting icon without touching this page.
const WEEK_ICONS: [RegExp, LucideIcon][] = [
  [/cia|triad/i, ShieldHalf],
  [/encrypt|hash/i, KeyRound],
  [/network/i, Network],
  [/active directory|home lab/i, Server],
  [/auth|access/i, Fingerprint],
  [/malware/i, Bug],
  [/siem/i, MonitorDot],
  [/detection/i, ScanSearch],
  [/log/i, FileSearch],
];

function weekIcon(title: string): LucideIcon {
  return WEEK_ICONS.find(([re]) => re.test(title))?.[1] ?? BookOpen;
}

function Course({ outline }: { outline: CourseOutline }) {
  return (
    <ol className="tp-course" data-r>
      {outline.map((phase, n) => {
        const live = phase.entries.some((e) => e.live);
        return (
          <li key={phase.label} data-live={live ? "1" : "0"}>
            <i>
              {(() => {
                const Icon = PHASE_ICONS[n] ?? BookOpen;
                return <Icon size={24} strokeWidth={1.75} />;
              })()}
              <b>{n + 1}</b>
            </i>
            <span>{live ? phase.label : `${phase.label}, coming soon`}</span>
            <strong>{phase.title}</strong>
            {phase.entries.length > 0 && (
              <ul>
                {phase.entries.map((e) => {
                  const Icon = weekIcon(e.title);
                  return (
                    <li key={e.title}>
                      <em><Icon size={15} strokeWidth={1.9} /></em>
                      {plainWeek(e.title)}
                    </li>
                  );
                })}
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
          <p>Real practice, help when they need it, and proof they can show an employer.</p>
        </div>
        <TrainingBenefits />
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
        <TrainingAudiences />
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
          display: flex; flex-direction: column; padding: 26px 24px 28px; background: #fff;
          border: 1px solid var(--border-strong); border-top: 3px solid var(--accent);
          box-shadow: 0 22px 44px -32px rgba(42,34,128,.35);
        }
          display: grid; place-items: center; width: 48px; height: 48px; margin-bottom: 22px;
          background: var(--accent-soft); color: var(--accent-deep);
        }

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
        .tp-course::before { content: ""; position: absolute; left: 28px; right: 28px; top: 28px; height: 2px; background: linear-gradient(90deg, rgba(106,92,255,.45), rgba(106,92,255,.12)) }
        .tp-course > li { position: relative; padding: 0 28px 8px 0 }
        .tp-course > li + li { padding-left: 28px }
        .tp-course > li > i {
          position: relative; z-index: 1; display: grid; place-items: center; width: 56px; height: 56px; margin-bottom: 20px;
          background: var(--accent); color: #fff; box-shadow: 0 0 0 6px #fbfcfe, 0 16px 30px -16px rgba(85,70,224,.7);
        }
        .tp-course > li > i svg { position: static }
        .tp-course > li > i b {
          position: absolute; top: -8px; right: -8px; display: grid; place-items: center; width: 22px; height: 22px;
          font-style: normal; font-size: .72rem; font-weight: 700; background: #fff; color: var(--accent-deep); border: 1px solid rgba(106,92,255,.35);
        }
        .tp-course > li[data-live="0"] > i { background: #fff; color: var(--muted); border: 1.5px dashed rgba(106,92,255,.45); box-shadow: 0 0 0 6px #fbfcfe }
        .tp-course > li > span { display: block; font-size: .85rem; font-weight: 600; color: var(--accent-deep) }
        .tp-course > li > strong { display: block; margin-top: 6px; font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; letter-spacing: -.02em; line-height: 1.2; color: var(--ink) }
        .tp-course ul { list-style: none; margin: 18px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px }
        .tp-course ul li { display: flex; align-items: center; gap: 12px; color: var(--ink-soft); font-size: .93rem; line-height: 1.35 }
        .tp-course ul li em {
          display: grid; place-items: center; width: 30px; height: 30px; flex: none;
          background: var(--accent-soft); color: var(--accent-deep); transition: background .25s var(--ease), color .25s var(--ease);
        }
        .tp-course ul li em svg { position: static }
        .tp-course ul li:hover em { background: var(--accent); color: #fff }
        .tp-course > li[data-live="0"] > strong, .tp-course > li[data-live="0"] > span { color: var(--muted) }

          display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 32px 64px; align-items: center;
          padding: clamp(32px, 5vw, 64px); background: var(--accent-soft); border: 1px solid rgba(106,92,255,.16);
        }
          margin: 0; font-family: var(--font-display); font-weight: 700; letter-spacing: -.028em; line-height: 1.1;
          font-size: clamp(1.8rem, 3.2vw, 2.5rem); color: var(--ink); text-wrap: balance;
        }
          display: grid; grid-template-columns: auto 1fr; gap: 16px; align-items: center; padding: 18px 20px; background: #fff;
          border-left: 4px solid var(--accent); box-shadow: 0 18px 40px -30px rgba(42,34,128,.4);
        }


          opacity: 0; transform: translateY(16px); transition: opacity .6s var(--ease), transform .6s var(--ease);
          transition-delay: calc(var(--n, 0) * 70ms);
        }
        .tp-feature-list > li:nth-child(5) { --n: 4 }
        .tp-feature-list > li:nth-child(6) { --n: 5 }
        .tp-feature-list > li:nth-child(7) { --n: 6 }
        .tp-feature-list > li:nth-child(8) { --n: 7 }
        @media (prefers-reduced-motion: reduce) {
        }

        @media (max-width: 860px) {
          .tp-features { grid-template-columns: minmax(0, 1fr) }
          .tp-features__head { position: static }
          .tp-course { grid-template-columns: 1fr; gap: 32px }
          .tp-course::before { left: 27px; right: auto; top: 28px; bottom: 28px; width: 2px; height: auto; background: rgba(106,92,255,.25) }
          .tp-course > li, .tp-course > li + li { padding: 0 0 0 80px }
          .tp-course > li > i { position: absolute; left: 0; top: 0; margin: 0 }
        }
        @media (max-width: 640px) {
          .tp-feature-list { grid-template-columns: 1fr }
        }
      `}</style>
    </SiteChrome>
  );
}

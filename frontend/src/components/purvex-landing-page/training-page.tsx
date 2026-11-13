"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BookOpen, Bug, Check, Eye, FileSearch, Fingerprint, Flag, Gauge, KeyRound, Link2, MonitorDot, Network, Radar,
  ScanSearch, Server, ShieldCheck, ShieldHalf, Siren, type LucideIcon,
} from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { DiscordLogo } from "./discord-logo";
import { HoldCard } from "./hold-card";
import { PG_CSS } from "./page-skin";
import { TrainingHero } from "./training-hero";
import { TrainingAudiences } from "./training-audiences";
import { TrainingBenefits } from "./training-benefits";
import {
  IconAlert, IconBook, IconChecks, IconEvidence, IconGraduate, IconKey, IconLifebuoy, IconMic, IconSchedule, IconShield, IconTicket,
  type BrandIcon,
} from "./brand-icons";

/* Cybersecurity Training. Same skin as the home page (page-skin.ts).
   Written for buyers and students, not engineers: what they get, what is
   inside, and how the course runs. The course section reads the Academy
   portal's own content, so it cannot drift from what students see. */

export type CourseOutline = {
  label: string;
  title: string;
  /** open: students can take it now. soon: written, not open yet. planned: not written yet. */
  status: "open" | "soon" | "planned";
  summary: string;
  /** What a phase with nothing written yet will cover. */
  points: string[];
  weeks: { no: number; title: string; summary: string }[];
  homeLab: { parts: string[]; summary: string } | null;
  capstones: { title: string; summary: string }[];
}[];

type Item = { title: string; body: string; Icon: BrandIcon };

// The Range's Discord. The invite is inlined at build time; until it is set,
// the button sends people to sign up instead, which is where the portal's own
// Discord link lives.
const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL;

// What the Discord is for, matching the channels scripts/discord/setup.ts builds.
const COMMUNITY: Item[] = [
  { Icon: IconLifebuoy, title: "Hints, never answers", body: "Stuck on a ticket? Ask in #ticket-help and get pointed the right way." },
  { Icon: IconShield, title: "Lab setup help", body: "Get the home lab built or the cloud lab connected, with people who have done it." },
  { Icon: IconSchedule, title: "Ticket of the week", body: "A new ticket every Friday. Work it, then compare how you got there." },
  { Icon: IconChecks, title: "Wins", body: "Finished challenges, passed certs and job offers, shared with people who know what it took." },
  { Icon: IconGraduate, title: "Career and cert study", body: "Resumes, interview questions and Security+ study partners." },
  { Icon: IconKey, title: "Private Pro channels", body: "Pro members get a private lounge, cloud lab help and Proof Profile reviews with mentors." },
];


const FEATURES: Item[] = [
  { Icon: IconBook, title: "Guided course", body: "Weekly lessons on IT and security fundamentals, with security phases on the way." },
  { Icon: IconShield, title: "Personal lab", body: "Their own company network, built on their own machine." },
  { Icon: IconTicket, title: "Real tickets", body: "Help desk tasks that are checked automatically." },
  { Icon: IconAlert, title: "Security alerts", body: "Investigate a suspicious login one step at a time." },
  { Icon: IconSchedule, title: "Daily drills", body: "One question a day from their lab, plus a timed round of five." },
  { Icon: IconChecks, title: "Weekly challenge", body: "A capture the flag puzzle built from their own lab." },
  { Icon: IconMic, title: "Interview and resume prep", body: "Scored mock interviews, plus resume lines built from proven work." },
  { Icon: IconEvidence, title: "Readiness report", body: "Four job skills scored, with what to work on next." },
];



const PHASE_ICONS: LucideIcon[] = [ShieldCheck, Radar, Siren];

const STATUS_LABEL: Record<CourseOutline[number]["status"], string> = {
  open: "Open now",
  soon: "Coming soon",
  planned: "In development",
};

// Week icons are matched on the topic name, so new weeks in the portal
// pick up a fitting icon without touching this page.
const WEEK_ICONS: [RegExp, LucideIcon][] = [
  [/cia|triad/i, ShieldHalf],
  [/encrypt|hash/i, KeyRound],
  [/network/i, Network],
  [/auth|access/i, Fingerprint],
  [/soc|analyst/i, Eye],
  [/malware/i, Bug],
  [/baseline|threshold|zero trust/i, Gauge],
  [/kill chain/i, Link2],
  [/siem/i, MonitorDot],
  [/detection|kql/i, ScanSearch],
  [/log/i, FileSearch],
];

function weekIcon(title: string): LucideIcon {
  return WEEK_ICONS.find(([re]) => re.test(title))?.[1] ?? BookOpen;
}

// One block per phase: what it covers, its weeks as cards with the portal's
// own one-line summary, the Home Lab as a single item with its parts, and
// the capstone. A phase with nothing written yet lists what it will cover.
function Course({ outline }: { outline: CourseOutline }) {
  return (
    <ol className="tp-syl" data-r>
      {outline.map((phase, n) => {
        const PhaseIcon = PHASE_ICONS[n] ?? BookOpen;
        return (
          <li key={phase.label} className="tp-syl__phase" data-status={phase.status}>
            <header className="tp-syl__head">
              <i className="tp-syl__badge">
                <PhaseIcon size={22} strokeWidth={1.75} />
              </i>
              <div>
                <p className="tp-syl__meta">
                  <span>{phase.label}</span>
                  <em>{STATUS_LABEL[phase.status]}</em>
                </p>
                <h3>{phase.title}</h3>
                {phase.summary && <p className="tp-syl__sum">{phase.summary}</p>}
              </div>
            </header>

            {phase.weeks.length > 0 && (
              <ul className="tp-syl__weeks">
                {phase.weeks.map((w) => {
                  const Icon = weekIcon(w.title);
                  return (
                    <li key={w.title} className="tp-syl__item">
                      <em><Icon size={15} strokeWidth={1.9} /></em>
                      <div>
                        <span>Week {w.no}</span>
                        <strong>{w.title}</strong>
                        <p>{w.summary}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}

            {phase.homeLab && (
              <div className="tp-syl__item tp-syl__wide">
                <em><Server size={15} strokeWidth={1.9} /></em>
                <div>
                  <span>Home Lab · {phase.homeLab.parts.length} parts</span>
                  <strong>Build and run PurveX Financial</strong>
                  <p>{phase.homeLab.summary}</p>
                  <ul className="tp-syl__parts">
                    {phase.homeLab.parts.map((part) => (
                      <li key={part}>{part}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {phase.capstones.map((c) => (
              <div key={c.title} className="tp-syl__item tp-syl__wide">
                <em><Flag size={15} strokeWidth={1.9} /></em>
                <div>
                  <span>Capstone</span>
                  <strong>{c.title}</strong>
                  <p>{c.summary}</p>
                </div>
              </div>
            ))}

            {phase.points.length > 0 && (
              <ul className="tp-syl__plan">
                {phase.points.map((pt) => (
                  <li key={pt}>
                    <Check size={15} aria-hidden="true" />
                    {pt}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* Three ways in, each written for the person choosing it. Explore is for
   someone still deciding. Pro is for someone who has decided and wants the
   job. Custom is for whoever is answerable for a cohort. Each perk is one
   smooth line that fits on one, with commas kept out of it, so the step up
   between tiers reads at a glance. */
const TIERS: {
  name: string;
  price: string;
  per?: string;
  trial?: string;
  forWho: string;
  perks: string[];
  cta: string;
  href: string;
  secondaryCta?: { label: string; href: string };
  featured?: boolean;
}[] = [
  {
    name: "Explore",
    price: "Free",
    forWho: "The whole curriculum, free for as long as you want it",
    perks: [
      "Every lesson, including each new phase",
      "The whole Ticket Queue and every challenge",
      "Every lab, on your own Windows PC",
      "Your readiness score from day one",
      "The Range Discord community",
      "No card. No trial clock.",
    ],
    cta: "Start free",
    href: "/range",
  },
  {
    name: "Pro",
    price: "$49",
    per: "/month",
    trial: "Free for your first 3 days",
    forWho: "The shortest road from learning this to being hired for it",
    perks: [
      "Everything in Explore",
      "Your own cloud lab in a browser tab",
      "A real Windows domain built just for you",
      "An AI coach that reads your lab and never hands you the answer",
      "A Proof Profile any employer can verify",
      "Private Pro channels in the Range Discord",
      "Cancel in one click",
    ],
    cta: "Get Pro",
    // ?checkout=1 means "buy", not "read the offer": after signing up they
    // go straight to Stripe rather than landing on a second pricing screen.
    // trial=0 on the secondary link carries the same intent through signup,
    // to the other Payment Link -- see /range/upgrade for both.
    href: "/range/upgrade?checkout=1",
    secondaryCta: { label: "Skip the trial, pay now", href: "/range/upgrade?checkout=1&trial=0" },
    featured: true,
  },
  {
    name: "Custom",
    price: "Talk to us",
    forWho: "Schools, agencies, and workforce programs running a cohort",
    perks: [
      "Everything in Pro on every seat",
      "Watch every student work in real time",
      "Your own classes with their own join links",
      "Labs provisioned and run for you",
      "Instructor onboarding and training",
      "Invoicing and paperwork your finance team can sign",
    ],
    cta: "Book a call",
    href: BOOKING_URL,
  },
];

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

      <section className="pg-section tp-proof" id="proof">
        <div className="pg-head">
          <h2>Proof employers can check</h2>
          <p>Every student gets a shareable portfolio of work confirmed in their own lab, and a credential ID any employer can verify.</p>
        </div>
        <div className="tp-proof__grid" data-r>
          <figure className="tp-proof__shot">
            <Image
              src="/marketing/portfolio-example.png"
              alt="Example PurveX portfolio: a SOC Analyst candidate, Security+ exam booked, and hands-on work verified in their lab"
              width={1912}
              height={1412}
              sizes="(max-width: 860px) 100vw, 820px"
            />
          </figure>
        </div>
      </section>

      <section className="pg-section tp-features" id="features">
        <div className="tp-features__head">
          <h2>Everything in Range</h2>
          <p>One portal for learning, practice, and proof. Students sign in and everything is there.</p>
          <Link href="/range" className="tp-link">
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

      <section className="pg-section tp-features" id="community">
        <div className="tp-features__head">
          <span className="tp-discord-badge" aria-hidden="true">
            <DiscordLogo size={26} />
          </span>
          <h2>Learn alongside the Range</h2>
          <p>The Range has its own Discord. Ask for a hint, get your lab running, and share the wins with people working the same tickets.</p>
          {DISCORD_URL ? (
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="tp-link">
              <DiscordLogo size={16} /> Join the Range Discord <ArrowRight size={14} />
            </a>
          ) : (
            <Link href="/range" className="tp-link">
              <DiscordLogo size={16} /> Start free to join <ArrowRight size={14} />
            </Link>
          )}
        </div>
        <ul className="tp-feature-list" data-r>
          {COMMUNITY.map(({ Icon, title, body }) => (
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
          <h2>The course, starting with the fundamentals</h2>
          <p>Three phases, from the fundamentals to incident response. Phase 1 is open now, and every week pairs short lessons with hands-on work in your own lab.</p>
        </div>
        <Course outline={outline} />
      </section>

      <section className="pg-section" id="who">
        <TrainingAudiences />
      </section>

      <section className="pg-section tp-pricing" id="pricing">
        <div className="pg-head">
          <h2>Start free. Go Pro when you want the job.</h2>
          <p>Every lesson is free, forever. Pro adds the cloud lab, the coach, and the proof an employer can check.</p>
        </div>
        <ul className="tp-tiers" data-r>
          {TIERS.map((t) => (
            <li key={t.name} className={t.featured ? "is-featured" : ""}>
              {t.featured && <em className="tp-tier__flag">Most popular</em>}
              <div className="tp-tier__top">
                <strong>{t.name}</strong>
                <span className="tp-tier__price">
                  {t.price}
                  {t.per && <i>{t.per}</i>}
                </span>
                {t.trial && <p className="tp-tier__trial">{t.trial}</p>}
                <p className="tp-tier__for">{t.forWho}</p>
              </div>
              <ul className="tp-tier__list">
                {t.perks.map((p) => (
                  <li key={p}>
                    <Check size={15} aria-hidden="true" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              {t.href.startsWith("http") ? (
                <a href={t.href} target="_blank" rel="noreferrer" className="tp-tier__cta">
                  {t.cta} <ArrowRight size={15} />
                </a>
              ) : (
                <Link href={t.href} className="tp-tier__cta">
                  {t.cta} <ArrowRight size={15} />
                </Link>
              )}
              {t.secondaryCta && (
                <Link href={t.secondaryCta.href} className="tp-tier__secondary">
                  {t.secondaryCta.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
        <p className="tp-pricing__note">No contracts. No setup fees. Pro cancels in one click.</p>
      </section>


      <section className="pg-close" data-r>
        <div className="pg-close__copy">
          <h2>Start a cohort</h2>
          <p className="pg-close__sub">A short call to plan your class. Already enrolled? Sign in to the portal.</p>
          <div className="pg-close__row">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="pg-close__book">
              Book a cohort <ArrowRight size={16} />
            </a>
            <Link href="/range" className="pg-close__more">
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
        /* Discord's mark on its own blurple tile, the way Discord shows it. */
        .tp-discord-badge {
          display: inline-grid; place-items: center; width: 44px; height: 44px; margin-bottom: 16px;
          border-radius: 12px; background: #5865F2; color: #fff;
          box-shadow: 0 6px 18px -8px rgba(88, 101, 242, .7);
        }
        .tp-feature-list { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 0 40px }
        .tp-feature-list li { display: grid; grid-template-columns: auto 1fr; gap: 16px; align-items: start; padding: 22px 0; border-top: 1px solid var(--border) }
        .tp-feature-list i {
          display: grid; place-items: center; width: 42px; height: 42px;
          background: var(--accent-soft); color: var(--accent-deep); border: 1px solid rgba(106,92,255,.18);
        }
        .tp-feature-list strong { display: block; font-size: 1.05rem; font-weight: 650; letter-spacing: -.014em; color: var(--ink) }
        .tp-feature-list p { margin: 4px 0 0; color: var(--muted); font-size: .92rem; line-height: 1.5 }

        .tp-tiers { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; align-items: stretch }
        .tp-tiers > li {
          position: relative; display: flex; flex-direction: column; padding: 30px 26px 28px;
          background: #fff; border: 1px solid var(--border-strong);
        }
        .tp-tiers > li.is-featured { border-color: var(--accent); box-shadow: 0 26px 52px -34px rgba(42,34,128,.45) }
        .tp-tier__flag {
          position: absolute; top: -1px; right: 22px; transform: translateY(-50%);
          padding: 4px 10px; background: var(--accent); color: #fff;
          font-style: normal; font-size: .62rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase;
        }
        .tp-tier__top { padding-bottom: 20px; border-bottom: 1px solid var(--border) }
        .tp-tier__top strong { display: block; font-family: var(--font-display); font-size: 1.02rem; font-weight: 700; letter-spacing: -.012em; color: var(--ink) }
        .tp-tier__price {
          display: flex; align-items: baseline; gap: 5px; margin-top: 12px;
          font-family: var(--font-display); font-size: clamp(1.9rem, 3vw, 2.5rem); font-weight: 700;
          letter-spacing: -.03em; line-height: 1; color: var(--ink);
        }
        .tp-tier__price i { font-style: normal; font-size: .82rem; font-weight: 600; letter-spacing: 0; color: var(--muted) }
        .tp-tier__trial { margin: 8px 0 0; font-size: .82rem; font-weight: 650; color: var(--accent-deep) }
        .tp-tier__for { margin: 14px 0 0; font-size: .92rem; line-height: 1.5; color: var(--muted); text-wrap: balance }
        .tp-tier__list { list-style: none; margin: 20px 0 0; padding: 0; display: grid; gap: 11px; flex: 1 }
        .tp-tier__list li { display: grid; grid-template-columns: auto 1fr; gap: 10px; align-items: start; font-size: .92rem; line-height: 1.45; color: var(--ink) }
        .tp-tier__list svg { margin-top: 3px; color: var(--accent-deep) }
        .tp-tier__cta {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin-top: 24px;
          padding: 13px 18px; font-size: .94rem; font-weight: 650; text-decoration: none;
          border: 1px solid var(--border-strong); color: var(--ink); transition: gap .25s var(--ease)
        }
        .tp-tier__cta:hover { gap: 12px }
        .tp-tiers > li.is-featured .tp-tier__cta { background: var(--accent); border-color: var(--accent); color: #fff }
        .tp-tier__secondary {
          display: inline-flex; margin-top: 10px; font-size: .82rem; font-weight: 600;
          color: var(--muted); text-decoration: underline; text-underline-offset: 3px; text-align: center; justify-content: center;
        }
        .tp-tier__secondary:hover { color: var(--ink) }
        .tp-pricing__note { margin: 22px 0 0; text-align: center; font-size: .88rem; color: var(--muted) }
        @media (max-width: 900px) { .tp-tiers { grid-template-columns: 1fr; gap: 16px } }

        .tp-syl { list-style: none; margin: 0; padding: 0; display: grid; gap: 24px }
        .tp-syl__phase { padding: 28px; border: 1px solid var(--border); background: #fff }
        .tp-syl__phase[data-status="open"] { border-color: rgba(106,92,255,.32); box-shadow: 0 28px 56px -42px rgba(85,70,224,.55) }
        .tp-syl__head { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 18px; align-items: start }
        .tp-syl__badge { display: grid; place-items: center; width: 48px; height: 48px; background: var(--accent); color: #fff; box-shadow: 0 14px 26px -16px rgba(85,70,224,.8) }
        .tp-syl__badge svg { position: static }
        .tp-syl__phase:not([data-status="open"]) .tp-syl__badge { background: var(--accent-soft); color: var(--accent-deep); box-shadow: none }
        .tp-syl__meta { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 0; font-size: .82rem; font-weight: 600; color: var(--accent-deep) }
        .tp-syl__meta em { font-style: normal; padding: 2px 8px; font-size: .72rem; font-weight: 650; background: var(--accent-soft); color: var(--accent-deep) }
        .tp-syl__phase[data-status="open"] .tp-syl__meta em { background: #e6f6ee; color: #0a7d55 }
        .tp-syl__head h3 { margin: 4px 0 0; font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; letter-spacing: -.02em; line-height: 1.2; color: var(--ink) }
        .tp-syl__sum { margin: 6px 0 0; max-width: 62ch; color: var(--ink-soft); font-size: .95rem; line-height: 1.55 }
        .tp-syl__weeks { list-style: none; margin: 22px 0 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px }
        .tp-syl__item { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 12px; padding: 14px 16px; border: 1px solid var(--border); background: #fbfcfe; transition: border-color .25s var(--ease) }
        .tp-syl__item:hover { border-color: rgba(106,92,255,.35) }
        .tp-syl__item > em { display: grid; place-items: center; width: 30px; height: 30px; background: var(--accent-soft); color: var(--accent-deep); transition: background .25s var(--ease), color .25s var(--ease) }
        .tp-syl__item > em svg { position: static }
        .tp-syl__item:hover > em { background: var(--accent); color: #fff }
        .tp-syl__item span { font-family: var(--font-mono); font-size: .68rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted) }
        .tp-syl__item strong { display: block; margin-top: 2px; font-size: .98rem; font-weight: 650; line-height: 1.3; color: var(--ink) }
        .tp-syl__item p { margin: 3px 0 0; font-size: .86rem; line-height: 1.45; color: var(--ink-soft); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden }
        .tp-syl__wide { margin-top: 10px }
        .tp-syl__wide p { -webkit-line-clamp: 3 }
        .tp-syl__parts { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px }
        .tp-syl__parts li { padding: 3px 9px; font-size: .78rem; font-weight: 600; border: 1px solid rgba(106,92,255,.25); background: #fff; color: var(--accent-deep) }
        .tp-syl__plan { list-style: none; margin: 18px 0 0; padding: 0; display: grid; gap: 8px }
        .tp-syl__plan li { display: flex; align-items: center; gap: 10px; color: var(--ink-soft); font-size: .93rem }
        .tp-syl__plan svg { flex: none; color: var(--accent) }

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
        .tp-proof__grid { display: grid; grid-template-columns: minmax(0, 1fr); max-width: 820px }
        .tp-proof__shot { margin: 0 }
        .tp-proof__shot img {
          display: block; width: 100%; height: auto; background: #fff;
          border: 1px solid var(--border-strong); box-shadow: 0 22px 44px -32px rgba(42,34,128,.35);
        }
        @media (prefers-reduced-motion: reduce) {
        }

        @media (max-width: 860px) {
          .tp-features { grid-template-columns: minmax(0, 1fr) }
          .tp-features__head { position: static }
          .tp-syl__weeks { grid-template-columns: 1fr }
        }
        @media (max-width: 640px) {
          .tp-feature-list { grid-template-columns: 1fr }
          .tp-syl__phase { padding: 20px }
          .tp-syl__head { grid-template-columns: minmax(0, 1fr) }
        }
      `}</style>
    </SiteChrome>
  );
}

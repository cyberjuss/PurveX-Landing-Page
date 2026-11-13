"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BookOpen, Bug, Check, FileSearch, Fingerprint, KeyRound, MonitorDot, Network, Radar, ScanSearch,
  Server, ShieldCheck, ShieldHalf, Siren, type LucideIcon,
} from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { DiscordLogo } from "./discord-logo";
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

// The Range's Discord. The invite is inlined at build time. Until it is set,
// the button sends people to sign up instead, which is where the portal's own
// Discord link lives.
const DISCORD_URL = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL;

// What the Discord is for, in four lines.
const COMMUNITY_POINTS = [
  "Hints when you're stuck, never answers",
  "Help getting your lab built and connected",
  "A new ticket every Friday to work together",
  "Resume, interview and Security+ study help",
];

// A small picture of the server, using the channels scripts/discord/setup.ts
// really builds, so what people see here is what they find when they join.
const DISCORD_PREVIEW: { category: string; locked?: boolean; channels: { name: string; active?: boolean }[] }[] = [
  { category: "📌 Start Here", channels: [{ name: "👋・welcome" }, { name: "📜・rules" }] },
  { category: "🎫 The Desk", channels: [{ name: "🎫・ticket-help" }, { name: "🧪・lab-setup" }, { name: "📅・ticket-of-the-week" }] },
  { category: "🏆 Progress", channels: [{ name: "🏆・wins", active: true }, { name: "🙋・introductions" }] },
  { category: "💎 Range Pro", locked: true, channels: [{ name: "💎・pro-lounge" }, { name: "☁️・cloud-lab-help" }] },
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

      <section className="pg-section tp-dc" id="community">
        <div className="tp-dc__copy">
          <span className="tp-discord-badge" aria-hidden="true">
            <DiscordLogo size={26} />
          </span>
          <h2>Learn alongside the Range</h2>
          <p>The Range has its own Discord, full of people working the same tickets you are. Ask for a hint, get your lab running, and share the wins.</p>
          <ul className="tp-dc__points">
            {COMMUNITY_POINTS.map((point) => (
              <li key={point}>
                <Check size={16} aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
          {DISCORD_URL ? (
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className="tp-dc__cta">
              <DiscordLogo size={20} /> Join the Range Discord
            </a>
          ) : (
            <Link href="/range" className="tp-dc__cta">
              <DiscordLogo size={20} /> Start free to join
            </Link>
          )}
        </div>

        {/* A picture of the server, not a live embed: no third-party script,
            and it shows the layout people will find when they join. */}
        <div className="tp-dc__window" aria-hidden="true">
          <div className="tp-dc__rail">
            <span className="tp-dc__server">
              <DiscordLogo size={22} />
            </span>
          </div>
          <div className="tp-dc__channels">
            <p className="tp-dc__name">PurveX Range</p>
            {DISCORD_PREVIEW.map((group) => (
              <div key={group.category} className="tp-dc__group">
                <p className="tp-dc__cat">
                  {group.category}
                  {group.locked && <span className="tp-dc__lock">Pro</span>}
                </p>
                {group.channels.map((c) => (
                  <p key={c.name} className={`tp-dc__chan${c.active ? " is-active" : ""}${group.locked ? " is-locked" : ""}`}>
                    <b>#</b>
                    {c.name}
                  </p>
                ))}
              </div>
            ))}
          </div>
          <div className="tp-dc__chat">
            <p className="tp-dc__topic">
              <b>#</b> 🏆・wins
            </p>
            <div className="tp-dc__msg">
              <span className="tp-dc__avatar">
                <DiscordLogo size={16} />
              </span>
              <div>
                <p className="tp-dc__who">
                  PurveX Range <em>APP</em> <time>Today at 4:12 PM</time>
                </p>
                <p>🎉 <strong>Jordan</strong> just finished <strong>Operation Day One</strong> in Range.</p>
              </div>
            </div>
            <div className="tp-dc__box">Message #🏆・wins</div>
          </div>
        </div>
      </section>

      <section className="pg-section" id="course">
        <div className="pg-head">
          <h2>The course, starting with the fundamentals</h2>
          <p>Phase 1 is open now, and the security phases follow. Each one pairs short lessons with hands-on work in the lab.</p>
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
        /* The Range Discord: the pitch beside a picture of the server, in
           Discord's own dark colours so it reads as the real thing. */
        .tp-dc { display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 40px 64px; align-items: center }
        .tp-dc__copy h2 { margin: 0; font-family: var(--font-display); font-size: clamp(1.9rem, 3.4vw, 2.5rem); font-weight: 700; letter-spacing: -.03em; line-height: 1.1; color: var(--ink) }
        .tp-dc__copy > p { margin: 14px 0 0; max-width: 46ch; color: var(--muted); font-size: 1rem; line-height: 1.6 }
        .tp-dc__points { list-style: none; margin: 22px 0 0; padding: 0; display: grid; gap: 10px }
        .tp-dc__points li { display: flex; align-items: center; gap: 10px; color: var(--ink-soft); font-size: .95rem }
        .tp-dc__points svg { flex: none; color: #5865F2 }
        .tp-dc__cta {
          display: inline-flex; align-items: center; gap: 10px; margin-top: 26px; padding: 13px 22px; border-radius: 10px;
          background: #5865F2; color: #fff; font-size: .98rem; font-weight: 650; text-decoration: none;
          box-shadow: 0 14px 28px -16px rgba(88, 101, 242, .9); transition: background .2s var(--ease), transform .2s var(--ease);
        }
        .tp-dc__cta:hover { background: #4752c4; transform: translateY(-1px) }

        .tp-dc__window {
          display: grid; grid-template-columns: 56px 190px minmax(0, 1fr); min-height: 340px; overflow: hidden; border-radius: 14px;
          background: #313338; color: #dbdee1; font-size: 13.5px; box-shadow: 0 40px 80px -40px rgba(16, 25, 46, .55), 0 0 0 1px rgba(16, 25, 46, .08);
        }
        .tp-dc__window p { margin: 0 }
        .tp-dc__rail { background: #1e1f22; padding: 12px 0; display: flex; justify-content: center }
        .tp-dc__server { display: grid; place-items: center; width: 40px; height: 40px; border-radius: 14px; background: #5865F2; color: #fff }
        .tp-dc__channels { background: #2b2d31; padding: 0 8px 12px; overflow: hidden }
        .tp-dc__name { padding: 13px 8px 12px; margin: 0 -8px 8px !important; border-bottom: 1px solid #1e1f22; font-weight: 700; color: #f2f3f5; font-size: 14px }
        .tp-dc__group { margin-top: 10px }
        .tp-dc__cat { display: flex; align-items: center; gap: 6px; padding: 0 6px 4px; font-size: 11px; font-weight: 700; letter-spacing: .02em; text-transform: uppercase; color: #949ba4 }
        .tp-dc__lock { padding: 0 5px; border-radius: 4px; background: #f0b232; color: #1e1f22; font-size: 9.5px; letter-spacing: .04em }
        .tp-dc__chan { display: flex; align-items: center; gap: 6px; padding: 5px 8px; border-radius: 4px; color: #949ba4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis }
        .tp-dc__chan b { color: #80848e; font-weight: 500; font-size: 16px; line-height: 1 }
        .tp-dc__chan.is-active { background: #404249; color: #f2f3f5 }
        .tp-dc__chan.is-locked { opacity: .55 }
        .tp-dc__chat { display: flex; flex-direction: column; min-width: 0 }
        .tp-dc__topic { display: flex; align-items: center; gap: 6px; padding: 12px 16px; border-bottom: 1px solid #26272b; font-weight: 600; color: #f2f3f5 }
        .tp-dc__topic b { color: #80848e; font-weight: 500; font-size: 18px; line-height: 1 }
        .tp-dc__msg { display: grid; grid-template-columns: 36px minmax(0, 1fr); gap: 12px; padding: 14px 16px 2px }
        .tp-dc__avatar { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: #5865F2; color: #fff }
        .tp-dc__who { display: flex; align-items: center; gap: 6px; font-weight: 600; color: #f2f3f5; font-size: 14px }
        .tp-dc__who em { padding: 0 4px; border-radius: 3px; background: #5865F2; color: #fff; font-style: normal; font-size: 9.5px; font-weight: 700 }
        .tp-dc__who time { font-weight: 400; font-size: 11.5px; color: #949ba4 }
        .tp-dc__msg div > p:last-child { margin-top: 2px; line-height: 1.45 }
        .tp-dc__msg strong { color: #f2f3f5 }
        .tp-dc__box { margin: auto 16px 16px; padding: 11px 14px; border-radius: 8px; background: #383a40; color: #6d6f78 }
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
          .tp-course { grid-template-columns: 1fr; gap: 32px }
          .tp-course::before { left: 27px; right: auto; top: 28px; bottom: 28px; width: 2px; height: auto; background: rgba(106,92,255,.25) }
          .tp-course > li, .tp-course > li + li { padding: 0 0 0 80px }
          .tp-course > li > i { position: absolute; left: 0; top: 0; margin: 0 }
          .tp-dc { grid-template-columns: minmax(0, 1fr) }
        }
        @media (max-width: 640px) {
          .tp-feature-list { grid-template-columns: 1fr }
          .tp-dc__window { grid-template-columns: 48px minmax(0, 1fr) }
          .tp-dc__channels { display: none }
        }
      `}</style>
    </SiteChrome>
  );
}

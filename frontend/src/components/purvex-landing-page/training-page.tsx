"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Building2,
  Check,
  Compass,
  Eye,
  FileText,
  FlaskConical,
  Footprints,
  Globe,
  GraduationCap,
  Lock,
  MessageCircle,
  Radar,
  ShieldAlert,
  Siren,
  Users,
  X,
} from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";

const translations = [
  { icon: Siren, detective: "A crime scene", analyst: "An alert in the queue" },
  { icon: FileText, detective: "Witness statements", analyst: "Raw log lines" },
  { icon: Footprints, detective: "A suspect's known M.O.", analyst: "Attacker TTPs (MITRE ATT&CK)" },
  { icon: Lock, detective: "Closing the case", analyst: "Containing the breach" },
];

const withoutItems = [
  "Theory-heavy courses that stop at a multiple-choice exam",
  "Certs that prove you memorized terms, not that you can use them",
  "Graduates who freeze the first time a real alert does not match the textbook",
  "One-size curriculum that ignores your program's actual tools and students",
];

const withItems = [
  "Hands-on labs built from real alerts and real log data",
  "Instruction focused on judgment: what to trust, what to question",
  "Graduates who can already investigate, not just define terms",
  "Curriculum shaped around your program, your tools, your students",
];

const curriculum = [
  {
    mod: "01",
    icon: BookOpen,
    title: "Phase 1 — Fundamentals",
    body: "CIA triad, networking, encryption & hashing, authentication and access control.",
  },
  {
    mod: "02",
    icon: Radar,
    title: "Phase 2 — Threat Detection & Log Analysis",
    body: "SIEM fundamentals, log analysis, and detection engineering.",
  },
  {
    mod: "03",
    icon: Siren,
    title: "Phase 3 — Incident Response",
    body: "Triage, investigation, containment, and writing it up.",
  },
  {
    mod: "04",
    icon: Building2,
    title: "Home Lab — Active Directory",
    body: "GovTech Financial: a fictional enterprise environment used for investigation and detection labs.",
  },
];

const careerLadder = [
  {
    level: "Trainee",
    icon: BookOpen,
    body: "Learning the fundamentals: networks, operating systems, how to read a raw log line.",
  },
  {
    level: "Tier 1 SOC Analyst",
    icon: Eye,
    body: "Watching the queue, triaging alerts. Learning to tell noise from a real signal.",
  },
  {
    level: "Tier 2 / Incident Responder",
    icon: ShieldAlert,
    body: "Investigating confirmed incidents end to end: contain, eradicate, document.",
  },
  {
    level: "Threat Hunter",
    icon: Compass,
    body: "Hunting the attacker who hasn't tripped an alarm yet.",
  },
  {
    level: "Senior Analyst / SOC Lead",
    icon: Award,
    body: "Mentoring the next Tier 1. Shaping how the whole team investigates.",
  },
];

const formats = [
  { icon: Users, title: "1:1 & small-group instruction", body: "Live sessions, paced to the learner or cohort." },
  { icon: FlaskConical, title: "Hands-on lab projects", body: "Real scenarios, worked at your own pace." },
  { icon: GraduationCap, title: "Embedded in your program", body: "We teach inside your existing curriculum." },
  { icon: Globe, title: "Private student portal", body: "Lessons, labs, and self-check quizzes on the web, not a shared drive folder." },
];

export default function TrainingPage() {
  return (
    <SiteChrome active="training">
      {/* ═══════════ HERO — left copy, translation duo stacked right ═══════════ */}
      <section className="sp-hero sp-hero--translate">
        <div className="sp-hero__copy">
          <h1 className="sp-hero__h1">Think Like a SOC Analyst 101</h1>
          <p className="sp-hero__sub">
            Hands-on training in how real analysts actually read a scene.
          </p>
          <div className="sp-hero__actions">
            <a href="#syllabus" className="sp-btn sp-btn--prim sp-btn--lg">
              See the curriculum <ArrowRight size={16} />
            </a>
            <Link href="/academy" className="sp-btn sp-btn--ghost sp-btn--lg">
              Already enrolled? Go to the Academy
            </Link>
          </div>
        </div>

        <div className="sp-hero__duo" data-r aria-hidden="true">
          <div className="sp-translate-card">
            <span className="sp-translate-card__eyebrow">A detective sees</span>
            <strong className="sp-translate-card__term">Fingerprints at the scene</strong>
          </div>
          <ArrowRight size={16} className="sp-hero__duo-arrow" />
          <div className="sp-translate-card sp-translate-card--accent">
            <span className="sp-translate-card__eyebrow sp-translate-card__eyebrow--accent">An analyst sees</span>
            <strong className="sp-translate-card__term sp-translate-card__term--accent">Indicators of compromise</strong>
          </div>
        </div>
      </section>

      {/* ═══════════ THE MINDSET ═══════════ */}
      <section className="sp-section">
        <div className="sp-head sp-head--left" data-r>
          <span className="sp-tag">The mindset</span>
          <h2>The instinct is already yours</h2>
          <p>
            A SOC analyst does exactly what a detective does. Walk into a scene, gather
            evidence, decide what happened.
          </p>
        </div>
        <div className="sp-translate-grid" data-r>
          {translations.map((t) => (
            <div key={t.detective} className="sp-translate-row">
              <div className="sp-translate-row__icon">
                <t.icon size={18} />
              </div>
              <div className="sp-translate-row__body">
                <span className="sp-translate-row__pair">
                  <span className="sp-translate-row__label">A detective sees</span>
                  <span className="sp-translate-row__term">{t.detective}</span>
                </span>
                <ArrowRight size={14} className="sp-translate-row__arrow" />
                <span className="sp-translate-row__pair">
                  <span className="sp-translate-row__label">An analyst sees</span>
                  <span className="sp-translate-row__term sp-translate-row__term--accent">{t.analyst}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ WHY THIS PROGRAM IS DIFFERENT ═══════════ */}
      <section className="sp-section sp-section--tight">
        <div className="sp-head sp-head--left" data-r>
          <span className="sp-tag">Why this program is different</span>
          <h2>Judgment is the skill</h2>
          <p>
            Certifications teach vocabulary. This program teaches judgment: deciding, in the
            moment, whether an alert is noise or a real compromise.
          </p>
        </div>
        <div className="sp-compare" data-r>
          <div className="sp-compare__col sp-compare__col--without">
            <div className="sp-compare__header">
              <div className="sp-compare__badge sp-compare__badge--x">
                <X size={18} />
              </div>
              <h3 className="sp-compare__h">Generic training</h3>
            </div>
            <ul className="sp-compare__list">
              {withoutItems.map((item) => (
                <li key={item}>
                  <X size={15} className="sp-compare__icon sp-compare__icon--x" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="sp-compare__col sp-compare__col--with">
            <span className="sp-compare__flag">Recommended</span>
            <div className="sp-compare__header">
              <div className="sp-compare__badge sp-compare__badge--ok">
                <Check size={18} />
              </div>
              <h3 className="sp-compare__h">Think Like a SOC Analyst 101</h3>
            </div>
            <ul className="sp-compare__list">
              {withItems.map((item) => (
                <li key={item}>
                  <Check size={15} className="sp-compare__icon sp-compare__icon--ok" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════ SYLLABUS ═══════════ */}
      <section className="sp-section" id="syllabus">
        <div className="sp-head sp-head--left" data-r>
          <span className="sp-tag">The syllabus</span>
          <h2>Four phases, the same ones in the student portal</h2>
          <p>From core fundamentals to a live lab environment built for investigation practice.</p>
        </div>
        <div className="sp-steps" data-r>
          {curriculum.map((c) => (
            <div key={c.mod} className="sp-step">
              <span className="sp-step__num">{c.mod}</span>
              <div className="sp-step__icon">
                <c.icon size={20} />
              </div>
              <div className="sp-step__body">
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CAREER LADDER ═══════════ */}
      <section className="sp-section sp-section--tight">
        <div className="sp-head sp-head--left" data-r>
          <span className="sp-tag">Where this leads</span>
          <h2>A real career ladder</h2>
          <p>Every module stacks toward a title employers actually recognize.</p>
        </div>
        <div className="sp-rungs" data-r>
          {careerLadder.map((r, i) => (
            <div key={r.level} className="sp-rung">
              <div
                className="sp-rung__fill"
                style={{ "--fill": `${((i + 1) / careerLadder.length) * 100}%` } as React.CSSProperties}
              />
              <div className="sp-rung__icon">
                <r.icon size={19} />
              </div>
              <h3>{r.level}</h3>
              <p>{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ DELIVERY FORMATS ═══════════ */}
      <section className="sp-section">
        <div className="sp-head sp-head--left" data-r>
          <span className="sp-tag">Delivery formats</span>
          <h2>Fits the way your program already runs</h2>
        </div>
        <div className="sp-formats" data-r>
          {formats.map((f) => (
            <article key={f.title} className="sp-format">
              <div className="sp-format__icon">
                <f.icon size={20} />
              </div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA — bordered banner, text left / button right ═══════════ */}
      <section className="sp-section">
        <div className="sp-cta-banner" data-r>
          <div className="sp-cta-banner__text">
            <MessageCircle size={20} className="sp-cta-banner__icon" />
            <h2>Partner with PurveX</h2>
          </div>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Book a call <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <style>{`
/* ── Hero, translate: left-aligned copy with the translation duo docked
   to the right as a static pair, not a centered headline with floating
   side decor like the home page. The full translation list repeats below
   in "The mindset" for everyone else. ── */
.sp-hero.sp-hero--translate { text-align: left; max-width: 1120px; display: grid; grid-template-columns: 1.1fr .9fr; gap: 56px; align-items: center }
.sp-hero--translate .sp-hero__h1 { text-align: left }
.sp-hero--translate .sp-hero__sub { margin: 22px 0 0; text-align: left }
.sp-hero--translate .sp-hero__actions { margin: 34px 0 0; justify-content: flex-start }
.sp-hero__duo { display: flex; flex-direction: column; align-items: center; gap: 10px }
.sp-hero__duo-arrow { color: var(--border-strong); transform: rotate(90deg) }
.sp-translate-card {
  width: 100%; max-width: 240px; padding: 16px 17px;
  background: var(--surface); border: 1px solid var(--border-strong);
  box-shadow: 0 24px 48px -22px rgba(16,25,46,.28);
  display: flex; flex-direction: column; gap: 4px;
}
.sp-translate-card--accent { background: linear-gradient(180deg, rgba(106,92,255,.06), var(--surface)) }
.sp-translate-card__eyebrow { font-size: .64rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted-dim) }
.sp-translate-card__eyebrow--accent { color: var(--accent-deep) }
.sp-translate-card__term { font-family: var(--font-display); font-size: .96rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink); line-height: 1.3 }
.sp-translate-card__term--accent { color: var(--accent-deep) }
@media (max-width: 940px) {
  .sp-hero.sp-hero--translate { grid-template-columns: 1fr; text-align: center; gap: 36px }
  .sp-hero--translate .sp-hero__h1, .sp-hero--translate .sp-hero__sub { text-align: center }
  .sp-hero--translate .sp-hero__sub { margin-left: auto; margin-right: auto }
  .sp-hero--translate .sp-hero__actions { justify-content: center }
  .sp-hero__duo { flex-direction: row; justify-content: center }
  .sp-hero__duo-arrow { transform: none }
}

/* ── The mindset: translation list, flat bordered rows instead of pinned
   corkboard cards -- reads as a confident list, not a craft project. ── */
.sp-translate-grid { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border) }
.sp-translate-grid[data-r] { opacity: 1; transform: none; filter: none; transition: none }
.sp-translate-grid[data-r] > * { opacity: 0; transform: translateY(16px); filter: blur(4px); transition: opacity .6s var(--ease), transform .6s var(--ease), filter .6s var(--ease) }
.sp-translate-grid[data-r].in > * { opacity: 1; transform: none; filter: blur(0) }
.sp-translate-grid[data-r] > *:nth-child(1) { transition-delay: .03s } .sp-translate-grid[data-r] > *:nth-child(2) { transition-delay: .08s }
.sp-translate-grid[data-r] > *:nth-child(3) { transition-delay: .13s } .sp-translate-grid[data-r] > *:nth-child(4) { transition-delay: .18s }
.sp-translate-row { display: flex; align-items: center; gap: 16px; padding: 22px 28px; border-bottom: 1px solid var(--border) }
.sp-translate-row:nth-child(even) { border-left: 1px solid var(--border) }
.sp-translate-row:nth-last-child(-n+2) { border-bottom: none }
.sp-translate-row__icon {
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 40px; height: 40px; border-radius: 50%;
  background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); color: var(--accent-deep);
}
.sp-translate-row__body { display: flex; align-items: center; gap: 12px; min-width: 0; flex-wrap: wrap }
.sp-translate-row__pair { display: flex; flex-direction: column; gap: 2px; min-width: 0 }
.sp-translate-row__label { font-size: .62rem; font-weight: 650; letter-spacing: .05em; text-transform: uppercase; color: var(--muted-dim) }
.sp-translate-row__term { font-family: var(--font-display); font-size: .92rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink); line-height: 1.3 }
.sp-translate-row__term--accent { color: var(--accent-deep) }
.sp-translate-row__arrow { flex-shrink: 0; color: var(--border-strong) }
@media (max-width: 780px) {
  .sp-translate-grid { grid-template-columns: 1fr }
  .sp-translate-row:nth-child(even) { border-left: none }
  .sp-translate-row:nth-last-child(-n+2) { border-bottom: 1px solid var(--border) }
  .sp-translate-row:last-child { border-bottom: none }
  .sp-translate-row__body { flex-direction: column; align-items: flex-start; gap: 6px }
  .sp-translate-row__arrow { transform: rotate(90deg) }
}

/* ── Why different: flat comparison, every point visible at once ── */
.sp-compare { position: relative; display: grid; grid-template-columns: 1fr 1fr; padding-top: 10px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border) }
.sp-compare__col { position: relative; padding: 36px 32px 40px; transition: opacity .2s var(--ease) }
.sp-compare__col:not(:first-child) { border-left: 1px solid var(--border) }
.sp-compare__col--without { opacity: .8 }
.sp-compare__col--without:hover { opacity: 1 }
.sp-compare__col--with { background: linear-gradient(180deg, rgba(106,92,255,.04), var(--surface)) }
.sp-compare__flag {
  position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
  white-space: nowrap;
  background: var(--accent-deep); color: #fff;
  font-size: .66rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
  padding: 6px 16px; border-radius: 999px;
  box-shadow: 0 8px 16px -6px rgba(85,70,224,.5);
}
.sp-compare__header { display: flex; align-items: center; gap: 14px; padding-bottom: 20px; margin-bottom: 6px; border-bottom: 1px solid var(--border) }
.sp-compare__col--with .sp-compare__header { border-bottom-color: rgba(106,92,255,.18) }
.sp-compare__badge { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 44px; height: 44px; border-radius: 50% }
.sp-compare__badge--x { background: rgba(229,72,77,.1); color: var(--red) }
.sp-compare__badge--ok { background: var(--accent-soft); color: var(--accent-deep) }
.sp-compare__h { margin: 0; font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink) }
.sp-compare__list { display: flex; flex-direction: column }
.sp-compare__list li {
  display: flex; align-items: flex-start; gap: 11px;
  padding: 14px 0;
  color: var(--ink-soft); font-size: .9rem; line-height: 1.55;
  border-bottom: 1px solid var(--border);
}
.sp-compare__list li:last-child { border-bottom: none; padding-bottom: 0 }
.sp-compare__col--with .sp-compare__list li { border-bottom-color: rgba(106,92,255,.18) }
.sp-compare__icon { flex-shrink: 0; margin-top: 2px }
.sp-compare__icon--x { color: var(--red) }
.sp-compare__icon--ok { color: var(--accent-deep) }
@media (max-width: 680px) {
  .sp-compare { grid-template-columns: 1fr }
  .sp-compare__col:not(:first-child) { border-left: none }
}

/* ── Syllabus: a numbered stepper, everything visible, nothing to click
   through -- replaces the old click-to-reveal zigzag roadmap. ── */
.sp-steps { display: flex; flex-direction: column; border-top: 1px solid var(--border) }
.sp-steps[data-r] { opacity: 1; transform: none; filter: none; transition: none }
.sp-steps[data-r] > * { opacity: 0; transform: translateY(18px); filter: blur(4px); transition: opacity .6s var(--ease), transform .6s var(--ease), filter .6s var(--ease) }
.sp-steps[data-r].in > * { opacity: 1; transform: none; filter: blur(0) }
.sp-steps[data-r] > *:nth-child(1) { transition-delay: .02s } .sp-steps[data-r] > *:nth-child(2) { transition-delay: .06s }
.sp-steps[data-r] > *:nth-child(3) { transition-delay: .1s } .sp-steps[data-r] > *:nth-child(4) { transition-delay: .14s }
.sp-step { display: flex; align-items: flex-start; gap: 22px; padding: 26px 4px; border-bottom: 1px solid var(--border); transition: background .25s var(--ease) }
.sp-step:hover { background: var(--surface-alt) }
.sp-step__num { flex-shrink: 0; width: 40px; padding-top: 8px; font-family: var(--font-mono); font-size: .8rem; font-weight: 600; color: var(--muted-dim) }
.sp-step__icon {
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 46px; height: 46px; border-radius: 50%;
  background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); color: var(--accent-deep);
  transition: transform .3s var(--ease), background .3s var(--ease), color .3s var(--ease);
}
.sp-step:hover .sp-step__icon { transform: scale(1.06) rotate(-4deg); background: var(--accent-deep); color: #fff }
.sp-step__body h3 { margin: 6px 0 0; font-family: var(--font-display); font-size: 1.06rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink) }
.sp-step__body p { margin: 8px 0 0; font-size: .92rem; color: var(--muted); line-height: 1.65; max-width: 620px; text-wrap: pretty }
@media (prefers-reduced-motion: reduce) { .sp-step, .sp-step__icon { transition: none } }
@media (max-width: 640px) {
  .sp-step { gap: 14px }
  .sp-step__num { width: 26px; font-size: .72rem }
  .sp-step__icon { width: 40px; height: 40px }
}

/* ── Career ladder: a growing accent bar per rung instead of a hardcoded
   bar chart, so the "ascending" cue lives in the same flat bordered-grid
   language as the rest of the page. ── */
.sp-rungs { display: grid; grid-template-columns: repeat(5, 1fr); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border) }
.sp-rungs[data-r] { opacity: 1; transform: none; filter: none; transition: none }
.sp-rungs[data-r] > * { opacity: 0; transform: translateY(20px); filter: blur(4px); transition: opacity .6s var(--ease), transform .6s var(--ease), filter .6s var(--ease) }
.sp-rungs[data-r].in > * { opacity: 1; transform: none; filter: blur(0) }
.sp-rungs[data-r] > *:nth-child(1) { transition-delay: .03s } .sp-rungs[data-r] > *:nth-child(2) { transition-delay: .09s }
.sp-rungs[data-r] > *:nth-child(3) { transition-delay: .15s } .sp-rungs[data-r] > *:nth-child(4) { transition-delay: .21s }
.sp-rungs[data-r] > *:nth-child(5) { transition-delay: .27s }
.sp-rung { position: relative; padding: 28px 22px 30px; text-align: center; transition: background .3s var(--ease) }
.sp-rung:hover { background: var(--surface-alt) }
.sp-rung:not(:first-child) { border-left: 1px solid var(--border) }
/* Width/height read from the --fill custom property set inline per rung --
   the mobile override below repoints the SAME value at height instead of
   width. Setting width directly inline would out-specificity that media
   query, since an element's own style attribute always wins over a
   stylesheet rule regardless of breakpoint. */
.sp-rung__fill { position: absolute; top: 0; left: 0; width: var(--fill); height: 3px; background: linear-gradient(90deg, var(--accent), var(--accent-deep)) }
.sp-rung__icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 42px; height: 42px; border-radius: 50%; margin-top: 8px;
  background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); color: var(--accent-deep);
}
.sp-rung h3 { margin: 16px 0 0; font-family: var(--font-display); font-size: .92rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink); line-height: 1.3 }
.sp-rung p { margin: 8px 0 0; font-size: .8rem; color: var(--muted); line-height: 1.55 }
@media (max-width: 780px) {
  .sp-rungs { grid-template-columns: 1fr }
  .sp-rung:not(:first-child) { border-left: none; border-top: 1px solid var(--border) }
  .sp-rung { display: flex; align-items: center; gap: 16px; text-align: left; padding: 18px 20px }
  .sp-rung__fill { top: 0; left: 0; width: 3px; height: var(--fill) }
  .sp-rung__icon { margin-top: 0; flex-shrink: 0 }
}

/* ── Delivery formats: same flat bordered-grid recipe as the mindset and
   ladder sections, so every content section reads as one system. ── */
.sp-formats { display: grid; grid-template-columns: repeat(2, 1fr); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border) }
.sp-formats[data-r] { opacity: 1; transform: none; filter: none; transition: none }
.sp-formats[data-r] > * { opacity: 0; transform: translateY(20px); filter: blur(4px); transition: opacity .6s var(--ease), transform .6s var(--ease), filter .6s var(--ease) }
.sp-formats[data-r].in > * { opacity: 1; transform: none; filter: blur(0) }
.sp-formats[data-r] > *:nth-child(1) { transition-delay: .03s } .sp-formats[data-r] > *:nth-child(2) { transition-delay: .1s }
.sp-formats[data-r] > *:nth-child(3) { transition-delay: .17s } .sp-formats[data-r] > *:nth-child(4) { transition-delay: .24s }
.sp-format { padding: 32px; transition: background .3s var(--ease) }
.sp-format:hover { background: var(--surface-alt) }
.sp-format:nth-child(even) { border-left: 1px solid var(--border) }
.sp-format:nth-child(n+3) { border-top: 1px solid var(--border) }
.sp-format__icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); color: var(--accent-deep);
  transition: transform .3s var(--ease), background .3s var(--ease), color .3s var(--ease);
}
.sp-format:hover .sp-format__icon { transform: scale(1.06) rotate(-4deg); background: var(--accent-deep); color: #fff }
.sp-format h3 { margin: 18px 0 0; font-family: var(--font-display); font-size: 1.02rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink) }
.sp-format p { margin: 8px 0 0; color: var(--muted); font-size: .9rem; line-height: 1.6 }
@media (prefers-reduced-motion: reduce) { .sp-format, .sp-format__icon, .sp-rung { transition: none } }
@media (max-width: 680px) {
  .sp-formats { grid-template-columns: 1fr }
  .sp-format:nth-child(even) { border-left: none }
  .sp-format:nth-child(n+2) { border-top: 1px solid var(--border) }
}

/* ── CTA banner: text left, button right, inside a bordered strip --
   distinct from the centered icon-over-headline CTA the home page uses ── */
.sp-cta-banner {
  display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap;
  padding: 40px 44px; border: 1px solid var(--border); border-radius: 20px; background: var(--surface-alt);
}
.sp-cta-banner__text { display: flex; align-items: center; gap: 14px }
.sp-cta-banner__icon { flex-shrink: 0; color: var(--accent-deep) }
.sp-cta-banner__text h2 { margin: 0; font-family: var(--font-display); font-size: clamp(1.3rem, 2.2vw, 1.7rem); font-weight: 700; letter-spacing: -.02em; color: var(--ink) }
@media (max-width: 620px) {
  .sp-cta-banner { flex-direction: column; align-items: flex-start; padding: 32px 28px }
  .sp-cta-banner .sp-btn { width: 100% }
}
      `}</style>
    </SiteChrome>
  );
}

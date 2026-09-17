"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Building2,
  Check,
  ClipboardList,
  Compass,
  Eye,
  Fingerprint,
  FileText,
  FlaskConical,
  Footprints,
  Globe,
  GraduationCap,
  Layers,
  Lock,
  MessageCircle,
  Radar,
  ShieldAlert,
  Siren,
  Users,
  X,
} from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";

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
  {
    mod: "05",
    id: "instruction",
    icon: GraduationCap,
    title: "Cybersecurity Instruction",
    body: "Instructor support for SOC operations, SIEM, threat detection, and incident response, built around your syllabus.",
  },
  {
    mod: "06",
    id: "labs",
    icon: FlaskConical,
    title: "Hands-On Security Labs",
    body: "Real tools and real log data, the same ones working analysts use every day.",
  },
  {
    mod: "07",
    id: "curriculum",
    icon: Layers,
    title: "Curriculum Support",
    body: "Training content mapped to what employers actually screen for in a SOC interview.",
  },
];

const analogyPairs = [
  { icon: Siren, detective: "A crime scene", analyst: "An alert in the queue" },
  { icon: FileText, detective: "Witness statements", analyst: "Raw log lines" },
  { icon: Fingerprint, detective: "Fingerprints at the scene", analyst: "Indicators of compromise" },
  { icon: Footprints, detective: "A suspect's known M.O.", analyst: "Attacker TTPs (MITRE ATT&CK)" },
  { icon: ClipboardList, detective: "The case file", analyst: "The incident report" },
  { icon: Lock, detective: "Closing the case", analyst: "Containing the breach" },
];

const careerLadder = [
  {
    level: "Trainee",
    icon: BookOpen,
    body: "Learning the fundamentals, networks, operating systems, how to read a raw log line.",
  },
  {
    level: "Tier 1 SOC Analyst",
    icon: Eye,
    body: "Watching the queue, triaging alerts. Learning to tell noise from a real signal.",
  },
  {
    level: "Tier 2 / Incident Responder",
    icon: ShieldAlert,
    body: "Investigating confirmed incidents end to end. Contain, eradicate, document.",
  },
  {
    level: "Threat Hunter",
    icon: Compass,
    body: "Not waiting on the alarm. Hunting for the attacker who has not tripped one yet.",
  },
  {
    level: "Senior Analyst / SOC Lead",
    icon: Award,
    body: "Mentoring the next Tier 1. Shaping how the whole team investigates.",
  },
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

const formats = [
  { icon: Users, title: "1:1 & small-group instruction", body: "Live sessions, paced to the learner or cohort." },
  { icon: FlaskConical, title: "Hands-on lab projects", body: "Real scenarios, worked at your own pace." },
  { icon: GraduationCap, title: "Embedded in your program", body: "We teach inside your existing curriculum." },
  { icon: Globe, title: "Private student portal", body: "Lessons, labs, and self-check quizzes on the web, not a shared drive folder." },
];

export default function TrainingPage() {
  // Starts on module 0 instead of null -- the card row below reserves a
  // fixed height so picking a module never shifts the layout, which means
  // "nothing selected" was just a dead, empty gap every visitor saw by
  // default. Opening the first module fills it immediately.
  const [openModule, setOpenModule] = useState<number | null>(0);
  const openCardRef = useRef<HTMLDivElement>(null);
  // Set only inside the module button's onClick, never true on mount -- the
  // effect below must not fire just because module 0 defaults open, or the
  // page auto-scrolls hundreds of pixels past the hero on every page load.
  const userTriggeredRef = useRef(false);

  // The icon row scrolls horizontally on mobile, and a middle module's card
  // is centered on its icon rather than clamped to the viewport -- tapping
  // one near the right edge of the scroll range left real content (title,
  // body text) cut off past the edge of the screen. Scrolling the newly
  // opened card into view (not just the icon) fixes that for every module,
  // not just the ones near an edge. block: "nearest" keeps this from also
  // yanking the page's vertical scroll position -- except on mount, where
  // gating on a click-set ref (not a mount-count ref) keeps that scroll
  // user-triggered only.
  useEffect(() => {
    if (openModule === null || !userTriggeredRef.current) return;
    userTriggeredRef.current = false;
    openCardRef.current?.scrollIntoView({ behavior: "smooth", inline: "nearest", block: "nearest" });
  }, [openModule]);

  // "Why this program is different" carousel: cycles through one
  // without/with pair at a time instead of stacking all four, so the
  // section stays short. Paused on hover/focus and skipped entirely for
  // prefers-reduced-motion, same as every other auto-animation on this page.
  const [comparePair, setComparePair] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  useEffect(() => {
    if (carouselPaused || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setComparePair((p) => (p + 1) % withoutItems.length);
    }, 4200);
    return () => clearInterval(id);
  }, [carouselPaused]);

  return (
    <SiteChrome active="training">
      {/* ═══════════ HERO — split copy + live curriculum preview ═══════════ */}
      <section className="sp-hero sp-hero--split">
        <div className="sp-hero__copy">
          <h1 className="sp-hero__h1">Think Like a SOC Analyst 101</h1>
          <p className="sp-hero__sub">
            Hands-on instruction in judgment, not memorization. How real analysts actually
            read a scene.
          </p>
          <div className="sp-hero__actions">
            <a href="#syllabus" className="sp-btn sp-btn--prim sp-btn--lg">
              See the Curriculum <ArrowRight size={16} />
            </a>
            <Link href="/academy" className="sp-btn sp-btn--ghost sp-btn--lg">
              Already enrolled? Go to the Academy
            </Link>
          </div>
        </div>
        <div className="sp-hero__preview" data-r>
          <div className="sp-orbit">
            <div className="sp-orbit__core">
              <Brain size={38} />
            </div>
            <div className="sp-orbit__ring sp-orbit__ring--1">
              <span className="sp-orbit__dot" />
            </div>
            <div className="sp-orbit__ring sp-orbit__ring--2">
              <span className="sp-orbit__dot" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ THE ANALOGY — corkboard ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">The mindset</span>
          <h2>You already think like this</h2>
          <p>
            Strip away the acronyms. A SOC analyst does exactly what a detective does: walk
            into a scene, gather evidence, decide what happened. Same instincts, different
            crime scene.
          </p>
        </div>
        <div className="sp-cork" data-r>
          {analogyPairs.map((a) => (
            <div key={a.detective} className="sp-cork__card">
              <span className="sp-cork__pin" />
              <div className="sp-cork__icon">
                <a.icon size={18} />
              </div>
              <div className="sp-cork__row">
                <span className="sp-cork__label">A detective sees</span>
                <span className="sp-cork__term">{a.detective}</span>
              </div>
              <div className="sp-cork__divider">
                <ArrowRight size={14} />
              </div>
              <div className="sp-cork__row">
                <span className="sp-cork__label">An analyst sees</span>
                <span className="sp-cork__term sp-cork__term--accent">{a.analyst}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ WHY THIS PROGRAM IS DIFFERENT ═══════════ */}
      <section className="sp-section sp-section--tight">
        <div className="sp-head" data-r>
          <span className="sp-tag">Why this program is different</span>
          <h2>Judgment is the skill. Everything else is just facts</h2>
          <p>
            Certifications teach vocabulary. This program teaches judgment: deciding, in the
            moment, whether an alert is noise or a real compromise.
          </p>
        </div>
        <div
          className="sp-compare sp-compare--carousel"
          data-r
          onMouseEnter={() => setCarouselPaused(true)}
          onMouseLeave={() => setCarouselPaused(false)}
        >
          <div className="sp-compare__col sp-compare__col--without">
            <div className="sp-compare__header">
              <div className="sp-compare__badge sp-compare__badge--x">
                <X size={18} />
              </div>
              <h3 className="sp-compare__h">Generic Training</h3>
            </div>
            <p key={`without-${comparePair}`} className="sp-compare__single">
              <X size={15} className="sp-compare__icon sp-compare__icon--x" />
              <span>{withoutItems[comparePair]}</span>
            </p>
          </div>
          <div className="sp-compare__arrow">
            <ArrowRight size={18} />
          </div>
          <div className="sp-compare__col sp-compare__col--with">
            <span className="sp-compare__flag">Recommended</span>
            <div className="sp-compare__header">
              <div className="sp-compare__badge sp-compare__badge--ok">
                <Check size={18} />
              </div>
              <h3 className="sp-compare__h">Think Like a SOC Analyst 101</h3>
            </div>
            <p key={`with-${comparePair}`} className="sp-compare__single">
              <Check size={15} className="sp-compare__icon sp-compare__icon--ok" />
              <span>{withItems[comparePair]}</span>
            </p>
          </div>
        </div>
        <div className="sp-compare__dots" data-r>
          {withoutItems.map((_, i) => (
            <button
              key={i}
              type="button"
              className={i === comparePair ? "sp-compare__dot sp-compare__dot--active" : "sp-compare__dot"}
              onClick={() => setComparePair(i)}
              aria-label={`Show comparison ${i + 1} of ${withoutItems.length}`}
              aria-current={i === comparePair}
            />
          ))}
        </div>
      </section>

      {/* ═══════════ SYLLABUS ═══════════ */}
      <section className="sp-section" id="syllabus">
        <div className="sp-head" data-r>
          <span className="sp-tag">The syllabus</span>
          <h2>From fundamentals to a full training partnership</h2>
          <p>The same phases as the student portal, plus how we support your program long-term.</p>
        </div>
        <div className="sp-roadmap-zigzag" data-r>
          <div className="sp-roadmap-zigzag__row sp-roadmap-zigzag__row--icons">
            {curriculum.map((c, i) => (
              <div key={c.mod} className="sp-roadmap-zigzag__slot">
                <button
                  type="button"
                  id={c.id}
                  onClick={() => {
                    userTriggeredRef.current = true;
                    setOpenModule(openModule === i ? null : i);
                  }}
                  className={
                    openModule === i ? "sp-roadmap-zigzag__icon sp-roadmap-zigzag__icon--active" : "sp-roadmap-zigzag__icon"
                  }
                  aria-pressed={openModule === i}
                  aria-label={c.title}
                >
                  <c.icon size={26} />
                </button>
              </div>
            ))}
          </div>
          <div className="sp-roadmap-zigzag__row sp-roadmap-zigzag__row--bottom">
            {curriculum.map((c, i) => (
              <div key={c.mod} className="sp-roadmap-zigzag__slot">
                {openModule === i && (
                  <>
                    <span className="sp-roadmap-zigzag__stem" />
                    <div className="sp-roadmap-zigzag__card" ref={openCardRef}>
                      <span className="sp-roadmap-zigzag__mod">Module {c.mod}</span>
                      <h3>{c.title}</h3>
                      <p>{c.body}</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CAREER LADDER ═══════════ */}
      <section className="sp-section sp-section--tight">
        <div className="sp-head" data-r>
          <span className="sp-tag">Where this leads</span>
          <h2>A ladder, not a certificate</h2>
          <p>Every module stacks toward a title employers recognize. Not just a line on a resume.</p>
        </div>
        <div className="sp-ladder" data-r>
          {careerLadder.map((r, i) => (
            <div key={r.level} className="sp-ladder__step">
              <div className="sp-ladder__copy">
                <h3>{r.level}</h3>
                <p>{r.body}</p>
              </div>
              <div className={`sp-ladder__bar sp-ladder__bar--${i}`}>
                <r.icon size={18} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ DELIVERY FORMATS ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">Delivery formats</span>
          <h2>Fits the way your program already runs</h2>
        </div>
        <div className="sp-dossier" data-r>
          {formats.map((f, i) => (
            <article key={f.title} className="sp-dossier__card">
              <span className="sp-dossier__tab">File {String(i + 1).padStart(2, "0")}</span>
              <div className="sp-dossier__icon">
                <f.icon size={20} />
              </div>
              <h3 className="sp-dossier__title">{f.title}</h3>
              <p className="sp-dossier__body">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="sp-section">
        <div className="sp-cta" data-r>
          <div className="sp-cta__icon">
            <MessageCircle size={22} />
          </div>
          <h2>Partner With PurveX</h2>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Schedule a Conversation <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <style>{`
/* ── Hero, split: copy left, live curriculum preview right ── */
.sp-hero.sp-hero--split { text-align: left; max-width: 1140px; display: grid; grid-template-columns: 1.05fr .95fr; gap: 56px; align-items: center }
.sp-hero--split .sp-hero__h1 { text-align: left }
.sp-hero--split .sp-hero__sub { margin: 22px 0 0; max-width: 480px; text-align: left }
.sp-hero--split .sp-hero__actions { margin: 34px 0 0; justify-content: flex-start }

.sp-hero__preview { display: flex; justify-content: center }

/* ── Hero preview: a brain orbiting ── */
.sp-orbit { position: relative; width: 100%; max-width: 340px; aspect-ratio: 1; display: flex; align-items: center; justify-content: center }
.sp-orbit__core {
  position: relative; z-index: 2;
  width: 96px; height: 96px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, var(--accent), var(--accent-deep));
  color: #fff;
  box-shadow: 0 24px 48px -16px rgba(85,70,224,.5);
}
.sp-orbit__ring {
  position: absolute; border: 1.5px dashed var(--border-strong); border-radius: 50%;
  animation: sp-orbit-spin 16s linear infinite;
}
.sp-orbit__ring--1 { width: 62%; height: 62%; animation-duration: 12s }
.sp-orbit__ring--2 { width: 100%; height: 100%; animation-duration: 22s; animation-direction: reverse }
.sp-orbit__dot {
  position: absolute; top: -6px; left: 50%; transform: translateX(-50%);
  width: 12px; height: 12px; border-radius: 50%;
  background: var(--accent-deep);
  box-shadow: 0 6px 14px -4px rgba(85,70,224,.6);
}
.sp-orbit__ring--2 .sp-orbit__dot { width: 10px; height: 10px; background: var(--accent) }
@keyframes sp-orbit-spin { to { transform: rotate(360deg) } }
@media (prefers-reduced-motion: reduce) { .sp-orbit__ring { animation: none } }
@media (max-width: 940px) {
  .sp-hero.sp-hero--split { grid-template-columns: 1fr; text-align: center; gap: 40px }
  .sp-hero--split .sp-hero__h1 { text-align: center }
  .sp-hero--split .sp-hero__sub { margin-left: auto; margin-right: auto; text-align: center }
  .sp-hero--split .sp-hero__actions { justify-content: center }
}

.sp-compare { position: relative; display: grid; grid-template-columns: 1fr 1fr; padding-top: 10px; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border) }
.sp-compare--carousel { padding-bottom: 4px }
.sp-compare__col { position: relative; padding: 36px 32px 40px; transition: opacity .2s var(--ease) }
.sp-compare--carousel .sp-compare__col { padding-bottom: 26px }
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
.sp-compare__single {
  display: flex; align-items: flex-start; gap: 11px;
  margin: 0; min-height: 72px;
  color: var(--ink-soft); font-size: .9rem; line-height: 1.55;
  animation: sp-compare-fade .35s var(--ease) both;
}
@keyframes sp-compare-fade { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .sp-compare__single { animation: none } }
.sp-compare__icon { flex-shrink: 0; margin-top: 2px }
.sp-compare__dots { display: flex; justify-content: center; gap: 9px; margin-top: 22px }
.sp-compare__dot {
  width: 8px; height: 8px; border-radius: 50%; padding: 0; border: none; cursor: pointer;
  background: var(--border-strong); transition: background .2s var(--ease), transform .2s var(--ease);
}
.sp-compare__dot:hover { background: var(--muted-dim) }
.sp-compare__dot--active { background: var(--accent-deep); transform: scale(1.25) }
.sp-compare__icon--x { color: var(--red) }
.sp-compare__icon--ok { color: var(--accent-deep) }
.sp-compare__arrow {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: 44px; height: 44px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface); border: 1px solid var(--border-strong);
  color: var(--accent-deep);
  box-shadow: 0 10px 22px -10px rgba(16,25,46,.3);
  z-index: 2;
}
@media (max-width: 680px) {
  .sp-compare { grid-template-columns: 1fr }
  .sp-compare__col:not(:first-child) { border-left: none }
  .sp-compare__arrow { display: none }
}

/* ── Syllabus (horizontal zigzag roadmap: click an icon to reveal its card) ── */
.sp-roadmap-zigzag { display: flex; flex-direction: column; padding: 44px 0 }
.sp-roadmap-zigzag__row { display: flex; gap: 6px }
.sp-roadmap-zigzag__row--bottom { align-items: flex-start; min-height: 188px }
.sp-roadmap-zigzag__row--icons { position: relative; padding: 20px 0 }
.sp-roadmap-zigzag__row--icons::before {
  content: ""; position: absolute; top: 50%; left: calc(100% / 14); right: calc(100% / 14); height: 2px;
  background: linear-gradient(90deg, var(--border-strong), var(--border) 92%, var(--border-strong));
}
.sp-roadmap-zigzag__slot { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center }
.sp-roadmap-zigzag__row--bottom .sp-roadmap-zigzag__slot { position: relative; justify-content: flex-start }
.sp-roadmap-zigzag__row--icons .sp-roadmap-zigzag__slot { align-items: center }

.sp-roadmap-zigzag__icon {
  position: relative; z-index: 1; flex-shrink: 0;
  width: 62px; height: 62px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface); border: 1.5px solid var(--border-strong); color: var(--muted-dim);
  font-family: inherit; padding: 0; cursor: pointer;
  transition: background .2s var(--ease), border-color .2s var(--ease), color .2s var(--ease), transform .2s var(--ease), box-shadow .2s var(--ease);
}
.sp-roadmap-zigzag__icon:hover { border-color: var(--accent-deep); color: var(--accent-deep); transform: translateY(-2px) }
.sp-roadmap-zigzag__icon--active {
  background: var(--accent-deep); border-color: var(--accent-deep); color: #fff;
  box-shadow: 0 10px 20px -10px rgba(85,70,224,.55);
  transform: translateY(-2px);
}
@media (prefers-reduced-motion: reduce) { .sp-roadmap-zigzag__icon, .sp-roadmap-zigzag__icon:hover, .sp-roadmap-zigzag__icon--active { transform: none; transition: none } }

.sp-roadmap-zigzag__stem { width: 2px; height: 20px; background: var(--border-strong); flex-shrink: 0; margin: 6px 0 }

.sp-roadmap-zigzag__card {
  /* Absolutely positioned and centered under its slot -- an equal-width flex
     slot (1/7 of the row) caps out around 150px, far too narrow for this
     card's copy, so it breaks out of the flex sizing entirely rather than
     being squeezed to its column's share. Only one card is ever open at a
     time, so it's free to overlap neighboring (empty) slots. --card-x is
     the horizontal offset, overridden below for the first/last slot so a
     340px-wide card centered on the outermost icons doesn't run past the
     viewport edge on common laptop widths. */
  --card-x: -50%;
  position: absolute; top: 32px; left: 50%; transform: translateX(var(--card-x));
  width: min(340px, calc(100vw - 48px)); min-height: 148px;
  padding: 18px 18px 20px;
  border: 1px solid var(--border); border-top: 3px solid var(--accent-deep);
  background: var(--surface);
  box-shadow: 0 20px 44px -22px rgba(16,25,46,.22);
  animation: sp-zigzag-card-in .3s var(--ease) both;
  display: flex; flex-direction: column; overflow: hidden;
}
.sp-roadmap-zigzag__slot:first-child .sp-roadmap-zigzag__card { left: 0; --card-x: 0% }
.sp-roadmap-zigzag__slot:last-child .sp-roadmap-zigzag__card { left: auto; right: 0; --card-x: 0% }
.sp-roadmap-zigzag__mod { flex-shrink: 0; font-family: var(--font-mono); font-size: .64rem; font-weight: 650; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep) }
.sp-roadmap-zigzag__card h3 {
  flex-shrink: 0; margin: 6px 0 0; font-family: var(--font-display); font-size: .96rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink); line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.sp-roadmap-zigzag__card p {
  margin: 8px 0 0; font-size: .8rem; color: var(--muted); line-height: 1.55;
  display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden;
}
@keyframes sp-zigzag-card-in { from { opacity: 0; transform: translate(var(--card-x), 6px) } to { opacity: 1; transform: translateX(var(--card-x)) } }
@media (prefers-reduced-motion: reduce) { .sp-roadmap-zigzag__card { animation: none } }

@media (max-width: 900px) {
  .sp-roadmap-zigzag { overflow-x: auto; -webkit-overflow-scrolling: touch }
  .sp-roadmap-zigzag__row { min-width: 760px }
  .sp-roadmap-zigzag__slot { flex: 0 0 100px }
  /* Wider than the old 160px -- this card's copy is written and measured
     against the 340px desktop width, and wraps to more lines at any
     narrower width. min-height (not a fixed height) lets the card hug
     short copy instead of leaving dead space below it, while still
     growing for whichever module's text needs the most room. */
  .sp-roadmap-zigzag__card { max-width: 240px; min-height: 190px; padding: 16px 16px 18px }
  .sp-roadmap-zigzag__row--bottom { min-height: 230px }
}

/* ── Corkboard: the detective/analyst analogy, pinned index cards ── */
.sp-cork { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px 22px; padding: 12px 8px 0 }
.sp-cork[data-r] { opacity: 1; transform: none; filter: none; transition: none }
.sp-cork[data-r] > * { opacity: 0; transform: translateY(20px); filter: blur(4px); transition: opacity .6s var(--ease), transform .6s var(--ease), filter .6s var(--ease) }
.sp-cork[data-r].in > * { opacity: 1; filter: blur(0) }
.sp-cork[data-r].in > *:nth-child(3n+1) { transform: rotate(-1.4deg) }
.sp-cork[data-r].in > *:nth-child(3n+2) { transform: rotate(1deg) }
.sp-cork[data-r].in > *:nth-child(3n) { transform: rotate(-0.6deg) }
.sp-cork__card {
  position: relative;
  padding: 26px 20px 22px;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: 0 16px 30px -18px rgba(16,25,46,.25);
  transition: transform .3s var(--ease), box-shadow .3s var(--ease);
}
.sp-cork__card:hover { transform: rotate(0deg) translateY(-4px) scale(1.02) !important; box-shadow: 0 22px 40px -16px rgba(16,25,46,.3); z-index: 2 }
.sp-cork__pin {
  position: absolute; top: -7px; left: 50%; transform: translateX(-50%);
  width: 14px; height: 14px; border-radius: 50%;
  background: radial-gradient(circle at 32% 28%, #ff8a8d, var(--red) 65%);
  box-shadow: 0 3px 6px rgba(16,25,46,.35);
}
.sp-cork__icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--accent-soft); color: var(--accent-deep); margin-bottom: 14px;
}
.sp-cork__row { display: flex; flex-direction: column; gap: 3px }
.sp-cork__label { font-size: .66rem; font-weight: 650; letter-spacing: .06em; text-transform: uppercase; color: var(--muted-dim) }
.sp-cork__term { font-family: var(--font-display); font-size: .96rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink); line-height: 1.35 }
.sp-cork__term--accent { color: var(--accent-deep) }
.sp-cork__divider { display: flex; align-items: center; color: var(--border-strong); margin: 12px 0; padding-left: 2px }
@media (prefers-reduced-motion: reduce) {
  .sp-cork[data-r] > *, .sp-cork__card, .sp-cork__card:hover { transform: none !important; transition: none }
}
@media (max-width: 860px) {
  .sp-cork { grid-template-columns: 1fr 1fr; gap: 22px 16px }
}
@media (max-width: 560px) {
  .sp-cork { grid-template-columns: 1fr }
}

/* ── Career ladder: ascending bar chart, each rung a title employers recognize ── */
.sp-ladder { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; padding: 44px 4px 0 }
.sp-ladder[data-r] { opacity: 1; transform: none; filter: none; transition: none }
.sp-ladder[data-r] > * { opacity: 0; transform: translateY(20px); filter: blur(4px); transition: opacity .6s var(--ease), transform .6s var(--ease), filter .6s var(--ease) }
.sp-ladder[data-r].in > * { opacity: 1; transform: none; filter: blur(0) }
.sp-ladder[data-r] > *:nth-child(1) { transition-delay: .03s } .sp-ladder[data-r] > *:nth-child(2) { transition-delay: .09s }
.sp-ladder[data-r] > *:nth-child(3) { transition-delay: .15s } .sp-ladder[data-r] > *:nth-child(4) { transition-delay: .21s }
.sp-ladder[data-r] > *:nth-child(5) { transition-delay: .27s }
.sp-ladder__step { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px }
.sp-ladder__copy h3 { margin: 0; font-family: var(--font-display); font-size: .92rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink); line-height: 1.3 }
.sp-ladder__copy p { margin: 8px 0 0; font-size: .8rem; color: var(--muted); line-height: 1.55 }
.sp-ladder__bar {
  width: 100%; max-width: 68px; border-radius: 12px 12px 0 0;
  display: flex; align-items: flex-start; justify-content: center; padding-top: 14px;
  color: #fff; background: linear-gradient(180deg, var(--accent), var(--accent-deep));
  box-shadow: 0 14px 26px -14px rgba(85,70,224,.55);
}
.sp-ladder__bar--0 { height: 60px }
.sp-ladder__bar--1 { height: 96px }
.sp-ladder__bar--2 { height: 132px }
.sp-ladder__bar--3 { height: 168px }
.sp-ladder__bar--4 { height: 204px; background: linear-gradient(180deg, #ffc257, #e2932a); box-shadow: 0 16px 30px -14px rgba(226,147,42,.55) }
@media (prefers-reduced-motion: reduce) { .sp-ladder[data-r] > * { opacity: 1; transform: none; filter: none; transition: none } }
@media (max-width: 780px) {
  .sp-ladder { flex-direction: column; align-items: stretch; gap: 4px; padding-top: 24px }
  .sp-ladder__step { flex-direction: row; align-items: center; text-align: left; gap: 18px; padding: 16px 4px; border-bottom: 1px solid var(--border) }
  .sp-ladder__step:last-child { border-bottom: none }
  .sp-ladder__copy { order: 2 }
  .sp-ladder__bar {
    order: 1; flex-shrink: 0; width: 44px; max-width: 44px; height: 44px !important;
    border-radius: 12px; padding-top: 0; align-items: center;
  }
}

/* ── Delivery formats as case-file dossiers (4 items: 2x2 on desktop) ── */
.sp-dossier { display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px }
.sp-dossier[data-r] { opacity: 1; transform: none; filter: none; transition: none }
.sp-dossier[data-r] > * { opacity: 0; transform: translateY(20px); filter: blur(4px); transition: opacity .6s var(--ease), transform .6s var(--ease), filter .6s var(--ease) }
.sp-dossier[data-r].in > * { opacity: 1; transform: none; filter: blur(0) }
.sp-dossier[data-r] > *:nth-child(1) { transition-delay: .03s } .sp-dossier[data-r] > *:nth-child(2) { transition-delay: .1s }
.sp-dossier[data-r] > *:nth-child(3) { transition-delay: .17s } .sp-dossier[data-r] > *:nth-child(4) { transition-delay: .24s }
.sp-dossier__card {
  position: relative; padding: 30px 24px 26px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 4px 16px 16px 16px;
  box-shadow: 0 16px 30px -20px rgba(16,25,46,.22);
  transition: transform .25s var(--ease), box-shadow .25s var(--ease), border-color .25s var(--ease);
}
.sp-dossier__card:hover { transform: translateY(-4px); box-shadow: 0 22px 40px -18px rgba(16,25,46,.28) }
.sp-dossier__tab {
  position: absolute; top: -13px; left: 22px;
  background: var(--accent-deep); color: #fff;
  font-family: var(--font-mono); font-size: .64rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  padding: 5px 12px; border-radius: 6px 6px 0 0;
  transition: background .25s var(--ease);
}
.sp-dossier__card:hover .sp-dossier__tab { background: var(--accent) }
.sp-dossier__icon {
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  width: 44px; height: 44px; border-radius: 50%;
  background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); color: var(--accent-deep);
}
.sp-dossier__title { margin: 18px 0 0; font-family: var(--font-display); font-size: 1.04rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink) }
.sp-dossier__body { margin: 10px 0 0; color: var(--muted); font-size: .92rem; line-height: 1.65 }
@media (max-width: 680px) {
  .sp-dossier { grid-template-columns: 1fr }
}

      `}</style>
    </SiteChrome>
  );
}

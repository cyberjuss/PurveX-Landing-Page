"use client";

import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  FlaskConical,
  GraduationCap,
  Layers,
  MessageCircle,
  Radar,
  Search,
  Siren,
  Users,
  X,
} from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";

const curriculum = [
  { mod: "01", icon: BookOpen, title: "Fundamentals", body: "The groundwork every analyst needs to start strong." },
  { mod: "02", icon: Radar, title: "Threat detection", body: "Spotting suspicious activity and acting on it early." },
  { mod: "03", icon: Search, title: "Log analysis projects", body: "Real log data, and finding what matters in the noise." },
  { mod: "04", icon: Siren, title: "Incident response", body: "An incident end to end: triage, investigate, contain, document." },
  {
    mod: "05",
    id: "instruction",
    icon: GraduationCap,
    title: "Cybersecurity Instruction",
    body: "Instructor support for cybersecurity, SOC operations, SIEM, threat detection, and incident response programs.",
  },
  {
    mod: "06",
    id: "labs",
    icon: FlaskConical,
    title: "Hands-On Security Labs",
    body: "Practical exercises designed to help learners investigate alerts, analyze threats, and understand modern security operations.",
  },
  {
    mod: "07",
    id: "curriculum",
    icon: Layers,
    title: "Curriculum Support",
    body: "Help developing or improving cybersecurity training content based on practical industry skills.",
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

const roadmap = [
  { skill: "Linux & security fundamentals", tool: "LabEx" },
  { skill: "Detection validation", tool: "Atomic Red Team" },
  { skill: "Threat mapping", tool: "MITRE ATT&CK" },
  { skill: "SIEM investigations", tool: "Splunk & Microsoft Sentinel" },
  { skill: "Threat hunting", tool: "KC7 Cyber" },
  { skill: "Enterprise Windows lab", tool: "DetectionLab" },
  { skill: "DFIR fundamentals", tool: "Velociraptor" },
];

const formats = [
  { icon: Users, title: "1:1 & small-group instruction", body: "Live sessions, paced to the learner or cohort." },
  { icon: FlaskConical, title: "Hands-on lab projects", body: "Real scenarios, worked at your own pace." },
  { icon: GraduationCap, title: "Embedded in your program", body: "We teach inside your existing curriculum." },
];

export default function TrainingPage() {
  const [openModule, setOpenModule] = useState<number | null>(null);

  return (
    <SiteChrome active="training">
      {/* ═══════════ HERO — split copy + live curriculum preview ═══════════ */}
      <section className="sp-hero sp-hero--split">
        <div className="sp-hero__copy">
          <h1 className="sp-hero__h1">Think Like a Security Analyst 101</h1>
          <p className="sp-hero__sub">
            PurveX&apos;s flagship training program: hands-on instruction built around how real
            analysts read a scene, not just what they memorize.
          </p>
          <a href="#syllabus" className="sp-btn sp-btn--prim sp-btn--lg">
            See the Curriculum <ArrowRight size={16} />
          </a>
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

      {/* ═══════════ WHY THIS PROGRAM IS DIFFERENT ═══════════ */}
      <section className="sp-section sp-section--tight">
        <div className="sp-compare-split" data-r>
          <div className="sp-compare">
            <div className="sp-compare__col sp-compare__col--without">
              <div className="sp-compare__badge sp-compare__badge--x">
                <X size={18} />
              </div>
              <h3 className="sp-compare__h">Generic training</h3>
              <ul>
                {withoutItems.map((t) => (
                  <li key={t}>
                    <X size={15} className="sp-compare__icon sp-compare__icon--x" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="sp-compare__arrow">
              <ArrowRight size={18} />
            </div>
            <div className="sp-compare__col sp-compare__col--with">
              <span className="sp-compare__flag">Recommended</span>
              <div className="sp-compare__badge sp-compare__badge--ok">
                <Check size={18} />
              </div>
              <h3 className="sp-compare__h">Think Like a Security Analyst 101</h3>
              <ul>
                {withItems.map((t) => (
                  <li key={t}>
                    <Check size={15} className="sp-compare__icon sp-compare__icon--ok" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="sp-head sp-head--left sp-compare-split__subtitle">
            <span className="sp-tag">Why this program is different</span>
            <h2>Judgment is the skill. Everything else is just facts.</h2>
          </div>
        </div>
      </section>

      {/* ═══════════ SYLLABUS ═══════════ */}
      <section className="sp-section" id="syllabus">
        <div className="sp-head" data-r>
          <span className="sp-tag">The syllabus</span>
          <h2>From fundamentals to a full training partnership.</h2>
          <p>Seven modules, from SOC analyst readiness to how we support your program long-term.</p>
        </div>
        <div className="sp-roadmap-zigzag" data-r>
          <div className="sp-roadmap-zigzag__row sp-roadmap-zigzag__row--top">
            {curriculum.map((c, i) => (
              <div key={c.mod} className="sp-roadmap-zigzag__slot">
                {i % 2 === 0 && openModule === i && (
                  <>
                    <div className="sp-roadmap-zigzag__card">
                      <span className="sp-roadmap-zigzag__mod">Module {c.mod}</span>
                      <h3>{c.title}</h3>
                      <p>{c.body}</p>
                    </div>
                    <span className="sp-roadmap-zigzag__stem" />
                  </>
                )}
              </div>
            ))}
          </div>
          <div className="sp-roadmap-zigzag__row sp-roadmap-zigzag__row--icons">
            {curriculum.map((c, i) => (
              <div key={c.mod} className="sp-roadmap-zigzag__slot">
                <button
                  type="button"
                  id={c.id}
                  onClick={() => setOpenModule(openModule === i ? null : i)}
                  className={
                    openModule === i ? "sp-roadmap-zigzag__icon sp-roadmap-zigzag__icon--active" : "sp-roadmap-zigzag__icon"
                  }
                  aria-pressed={openModule === i}
                  aria-label={c.title}
                >
                  <c.icon size={22} />
                </button>
              </div>
            ))}
          </div>
          <div className="sp-roadmap-zigzag__row sp-roadmap-zigzag__row--bottom">
            {curriculum.map((c, i) => (
              <div key={c.mod} className="sp-roadmap-zigzag__slot">
                {i % 2 === 1 && openModule === i && (
                  <>
                    <span className="sp-roadmap-zigzag__stem" />
                    <div className="sp-roadmap-zigzag__card">
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

      {/* ═══════════ LEARNING ROADMAP ═══════════ */}
      <section className="sp-section sp-section--tight">
        <div className="sp-roadmap-split" data-r>
          <div className="sp-head sp-head--left sp-roadmap-split__text">
            <span className="sp-tag">The learning roadmap</span>
            <h2>Every skill area, practiced on real tools.</h2>
            <p>
              Alongside our own instruction, the curriculum is built around established,
              real-world platforms — several of them free and open to anyone — so learners
              practice on the same tools working analysts actually use.
            </p>
          </div>
          <div className="sp-roadmap">
            {roadmap.map((r) => (
              <div key={r.skill} className="sp-roadmap__item">
                <span className="sp-roadmap__skill">{r.skill}</span>
                <span className="sp-roadmap__tool">{r.tool}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ DELIVERY FORMATS ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">Delivery formats</span>
          <h2>Fits the way your program already runs.</h2>
        </div>
        <div className="sp-cards sp-cards--3" data-r>
          {formats.map((f) => (
            <article key={f.title} className="sp-card">
              <div className="sp-card__icon">
                <f.icon size={20} />
              </div>
              <h3 className="sp-card__title">{f.title}</h3>
              <p className="sp-card__body">{f.body}</p>
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
            Partner With PurveX <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <style>{`
/* ── Hero, split: copy left, live curriculum preview right ── */
.sp-hero.sp-hero--split { text-align: left; max-width: 1140px; display: grid; grid-template-columns: 1.05fr .95fr; gap: 56px; align-items: center }
.sp-hero--split .sp-hero__badge { margin-bottom: 22px }
.sp-hero--split .sp-hero__h1 { text-align: left }
.sp-hero--split .sp-hero__sub { margin: 22px 0 0; max-width: 480px; text-align: left }
.sp-hero--split .sp-btn { margin-top: 34px }

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
  .sp-hero--split .sp-hero__h1, .sp-hero--split .sp-hero__badge { text-align: center }
  .sp-hero--split .sp-hero__sub { margin-left: auto; margin-right: auto; text-align: center }
}

/* ── Comparison: content left, subtitle right ── */
.sp-compare-split { display: grid; grid-template-columns: 1.5fr 1fr; gap: 48px; align-items: center }
.sp-compare-split__subtitle { margin: 0 }
@media (max-width: 900px) {
  .sp-compare-split { grid-template-columns: 1fr; gap: 28px }
  .sp-compare-split__subtitle { order: -1 }
}

.sp-compare { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding-top: 10px }
.sp-compare__col {
  --cut: 20px; position: relative; padding: 36px 32px;
  clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
  border: 1px solid var(--border);
  background: var(--surface);
  filter: drop-shadow(0 14px 26px rgba(16,25,46,.12));
  transition: transform .3s var(--ease), filter .3s;
}
.sp-compare__col--without { border-top: 3px solid rgba(229,72,77,.35); opacity: .8 }
.sp-compare__col--without:hover { opacity: 1; transform: translateY(-2px) }
.sp-compare__col--with {
  border-color: rgba(106,92,255,.3);
  border-top: 3px solid var(--accent);
  background: linear-gradient(180deg, rgba(106,92,255,.05), var(--surface));
  filter: drop-shadow(0 22px 40px rgba(85,70,224,.22));
  transform: translateY(-6px);
}
.sp-compare__col--with:hover { transform: translateY(-9px); filter: drop-shadow(0 28px 48px rgba(85,70,224,.28)) }
@media (prefers-reduced-motion: reduce) { .sp-compare__col { transition: none; transform: none } .sp-compare__col--with { transform: none } }
.sp-compare__flag {
  position: absolute; top: -14px; left: 50%; transform: translateX(-50%);
  white-space: nowrap;
  background: var(--accent-deep); color: #fff;
  font-size: .66rem; font-weight: 700; letter-spacing: .05em; text-transform: uppercase;
  padding: 6px 16px; border-radius: 999px;
  box-shadow: 0 8px 16px -6px rgba(85,70,224,.5);
}
.sp-compare__badge { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; margin-bottom: 16px }
.sp-compare__badge--x { background: rgba(229,72,77,.1); color: var(--red) }
.sp-compare__badge--ok { background: var(--accent-soft); color: var(--accent-deep) }
.sp-compare__h { margin: 0 0 18px; font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink) }
.sp-compare__col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px }
.sp-compare__col li { display: flex; align-items: flex-start; gap: 11px; color: var(--ink-soft); font-size: .9rem; line-height: 1.55 }
.sp-compare__icon { flex-shrink: 0; margin-top: 2px }
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
  .sp-compare { grid-template-columns: 1fr; gap: 30px }
  .sp-compare__arrow { display: none }
  .sp-compare__col--with { transform: none }
  .sp-compare__col--with:hover { transform: none }
}

/* ── Syllabus (horizontal zigzag roadmap: click an icon to reveal its card) ── */
.sp-roadmap-zigzag { display: flex; flex-direction: column; padding: 44px 0 }
.sp-roadmap-zigzag__row { display: flex; gap: 6px }
.sp-roadmap-zigzag__row--top { align-items: flex-end; min-height: 20px }
.sp-roadmap-zigzag__row--bottom { align-items: flex-start; min-height: 20px }
.sp-roadmap-zigzag__row--icons { position: relative; padding: 18px 0 }
.sp-roadmap-zigzag__row--icons::before {
  content: ""; position: absolute; top: 50%; left: calc(100% / 14); right: calc(100% / 14); height: 2px;
  background: linear-gradient(90deg, var(--border-strong), var(--border) 92%, var(--border-strong));
}
.sp-roadmap-zigzag__slot { flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center }
.sp-roadmap-zigzag__row--top .sp-roadmap-zigzag__slot { justify-content: flex-end }
.sp-roadmap-zigzag__row--bottom .sp-roadmap-zigzag__slot { justify-content: flex-start }
.sp-roadmap-zigzag__row--icons .sp-roadmap-zigzag__slot { align-items: center }

.sp-roadmap-zigzag__icon {
  position: relative; z-index: 1; flex-shrink: 0;
  width: 54px; height: 54px; border-radius: 50%;
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
  width: 100%; max-width: 200px; height: 220px;
  padding: 18px 18px 20px;
  border: 1px solid var(--border); border-radius: 12px;
  background: var(--surface);
  filter: drop-shadow(0 14px 26px rgba(16,25,46,.1));
  animation: sp-zigzag-card-in .3s var(--ease) both;
  display: flex; flex-direction: column; overflow: hidden;
}
.sp-roadmap-zigzag__mod { flex-shrink: 0; font-family: var(--font-mono); font-size: .64rem; font-weight: 650; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep) }
.sp-roadmap-zigzag__card h3 {
  flex-shrink: 0; margin: 6px 0 0; font-family: var(--font-display); font-size: .96rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink); line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.sp-roadmap-zigzag__card p {
  margin: 8px 0 0; font-size: .8rem; color: var(--muted); line-height: 1.55;
  display: -webkit-box; -webkit-line-clamp: 5; -webkit-box-orient: vertical; overflow: hidden;
}
@keyframes sp-zigzag-card-in { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .sp-roadmap-zigzag__card { animation: none } }

@media (max-width: 900px) {
  .sp-roadmap-zigzag { overflow-x: auto; -webkit-overflow-scrolling: touch }
  .sp-roadmap-zigzag__row { min-width: 760px }
  .sp-roadmap-zigzag__slot { flex: 0 0 100px }
  .sp-roadmap-zigzag__card { max-width: 160px; padding: 16px 16px 18px }
}

/* ── Learning roadmap: split layout, text left / divided skill-tool list right ── */
.sp-roadmap-split { display: grid; grid-template-columns: .85fr 1.15fr; gap: 56px; align-items: start }
.sp-roadmap-split__text { margin: 0 }
.sp-roadmap { display: flex; flex-direction: column }
.sp-roadmap__item {
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  padding: 18px 0; border-bottom: 1px solid var(--border);
}
.sp-roadmap__item:first-child { padding-top: 0 }
.sp-roadmap__item:last-child { border-bottom: none }
.sp-roadmap__skill { font-family: var(--font-display); font-size: .98rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink) }
.sp-roadmap__tool {
  flex-shrink: 0; white-space: nowrap;
  font-size: .78rem; font-weight: 600; color: var(--accent-deep);
  background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); border-radius: 999px;
  padding: 6px 14px;
}
@media (max-width: 860px) {
  .sp-roadmap-split { grid-template-columns: 1fr; gap: 28px }
}
@media (max-width: 560px) {
  .sp-roadmap__item { flex-direction: column; align-items: flex-start; gap: 8px }
}

      `}</style>
    </SiteChrome>
  );
}

"use client";

import {
  ArrowRight,
  BookOpen,
  Check,
  FlaskConical,
  GraduationCap,
  Layers,
  MessageCircle,
  Radar,
  Search,
  Siren,
  TrendingUp,
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

const growth = [22, 35, 48, 61, 74, 88, 100];
const CHART_W = 400;
const CHART_BASE = 128;
const CHART_TOP = 14;
const chartPoints = growth.map((v, i) => {
  const slot = CHART_W / growth.length;
  return { cx: slot * (i + 0.5), cy: CHART_BASE - (v / 100) * (CHART_BASE - CHART_TOP) };
});
const chartLine = chartPoints.map((p) => `${p.cx.toFixed(1)},${p.cy.toFixed(1)}`).join(" ");
const chartArea = `M ${chartPoints[0].cx.toFixed(1)},${CHART_BASE} ${chartPoints
  .map((p) => `L ${p.cx.toFixed(1)},${p.cy.toFixed(1)}`)
  .join(" ")} L ${chartPoints[chartPoints.length - 1].cx.toFixed(1)},${CHART_BASE} Z`;

export default function TrainingPage() {
  return (
    <SiteChrome active="training">
      {/* ═══════════ HERO — split copy + live curriculum preview ═══════════ */}
      <section className="sp-hero sp-hero--split">
        <div className="sp-hero__copy">
          <span className="sp-hero__badge">
            <GraduationCap size={13} /> Cybersecurity Training
          </span>
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
          <div className="sp-growth">
            <div className="sp-growth__head">
              <TrendingUp size={14} /> Skill growth, module by module
            </div>
            <svg className="sp-growth__svg" viewBox={`0 0 ${CHART_W} 140`} preserveAspectRatio="none">
              <defs>
                <linearGradient id="growthBar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" style={{ stopColor: "#eef0ff" }} />
                  <stop offset="18%" style={{ stopColor: "#d9d9ff" }} />
                  <stop offset="36%" style={{ stopColor: "#c2c0ff" }} />
                  <stop offset="54%" style={{ stopColor: "#aaa7ff" }} />
                  <stop offset="72%" style={{ stopColor: "#8f8bff" }} />
                  <stop offset="88%" style={{ stopColor: "#6a5cff" }} />
                  <stop offset="100%" style={{ stopColor: "#5546e0" }} />
                </linearGradient>
                <linearGradient id="growthArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" style={{ stopColor: "rgba(85,70,224,0.25)" }} />
                  <stop offset="100%" style={{ stopColor: "rgba(85,70,224,0)" }} />
                </linearGradient>
              </defs>

              {[0.25, 0.5, 0.75].map((f) => (
                <line
                  key={f}
                  className="sp-growth__grid"
                  x1="0"
                  x2={CHART_W}
                  y1={CHART_TOP + f * (CHART_BASE - CHART_TOP)}
                  y2={CHART_TOP + f * (CHART_BASE - CHART_TOP)}
                />
              ))}

              {chartPoints.map((p, i) => {
                const slot = CHART_W / growth.length;
                const barW = slot * 0.58;
                return (
                  <rect
                    key={i}
                    className="sp-growth__bar"
                    style={{ animationDelay: `${i * 0.07}s` }}
                    x={p.cx - barW / 2}
                    y={p.cy}
                    width={barW}
                    height={CHART_BASE - p.cy}
                    rx="5"
                    fill="url(#growthBar)"
                  />
                );
              })}

              <path className="sp-growth__area" fill="url(#growthArea)" d={chartArea} />
              <polyline className="sp-growth__line" points={chartLine} />
              {chartPoints.map((p, i) =>
                i === chartPoints.length - 1 ? (
                  <circle key={`ring-${i}`} className="sp-growth__ring" cx={p.cx} cy={p.cy} r={6.5} />
                ) : null
              )}
              {chartPoints.map((p, i) => (
                <circle
                  key={i}
                  className={i === chartPoints.length - 1 ? "sp-growth__dot sp-growth__dot--peak" : "sp-growth__dot"}
                  style={{ animationDelay: `${0.45 + i * 0.04}s` }}
                  cx={p.cx}
                  cy={p.cy}
                  r={i === chartPoints.length - 1 ? 6.5 : 3.5}
                />
              ))}
            </svg>
            <div className="sp-growth__labels">
              {curriculum.map((c) => (
                <span key={c.mod}>{c.mod}</span>
              ))}
            </div>
            <div className="sp-growth__foot">
              <span>Fundamentals</span>
              <span className="sp-growth__ready">
                <Check size={11} /> Job-ready
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ WHY THIS PROGRAM IS DIFFERENT ═══════════ */}
      <section className="sp-section sp-section--tight">
        <div className="sp-head" data-r>
          <span className="sp-tag">Why this program is different</span>
          <h2>Judgment is the skill. Everything else is just facts.</h2>
        </div>
        <div className="sp-compare" data-r>
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
      </section>

      {/* ═══════════ SYLLABUS ═══════════ */}
      <section className="sp-section" id="syllabus">
        <div className="sp-head" data-r>
          <span className="sp-tag">The syllabus</span>
          <h2>From fundamentals to a full training partnership.</h2>
          <p>Seven modules, from SOC analyst readiness to how we support your program long-term.</p>
        </div>
        <div className="sp-syllabus" data-r>
          {curriculum.map((c) => (
            <div key={c.title} id={c.id} className="sp-syllabus__row">
              <div className="sp-syllabus__num">
                <c.icon size={18} />
              </div>
              <div className="sp-syllabus__body">
                <span className="sp-syllabus__mod">Module {c.mod}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ LEARNING ROADMAP ═══════════ */}
      <section className="sp-section sp-section--tight">
        <div className="sp-head" data-r>
          <span className="sp-tag">The learning roadmap</span>
          <h2>Every skill area, practiced on real tools.</h2>
          <p>
            Alongside our own instruction, the curriculum is built around established,
            real-world platforms — several of them free and open to anyone — so learners
            practice on the same tools working analysts actually use.
          </p>
        </div>
        <div className="sp-roadmap" data-r>
          {roadmap.map((r) => (
            <div key={r.skill} className="sp-roadmap__item">
              <h3>{r.skill}</h3>
              <span className="sp-roadmap__tool">{r.tool}</span>
            </div>
          ))}
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

/* ── Growth chart (skill growth, module by module) ── */
.sp-growth {
  --cut: 18px;
  width: 100%; max-width: 420px;
  padding: 28px 30px 22px;
  clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
  border: 1px solid var(--border);
  background: var(--surface);
  filter: drop-shadow(0 20px 40px rgba(16,25,46,.14));
}
.sp-growth__head { display: flex; align-items: center; gap: 8px; font-size: .78rem; font-weight: 650; color: var(--muted); margin-bottom: 22px }
.sp-growth__head svg { color: var(--accent-deep) }
.sp-growth__svg { width: 100%; height: 140px; overflow: visible; display: block }
.sp-growth__grid { stroke: var(--border); stroke-width: 1; stroke-dasharray: 2 5 }
.sp-growth__bar { transform-box: fill-box; transform-origin: bottom; animation: sp-growth-rise .7s var(--ease) both }
.sp-growth__area { opacity: 0; animation: sp-growth-fade .6s var(--ease) .5s both }
.sp-growth__line {
  fill: none; stroke: var(--accent-deep); stroke-width: 2.25; stroke-linecap: round; stroke-linejoin: round;
  opacity: 0; animation: sp-growth-fade .6s var(--ease) .55s both;
}
.sp-growth__dot { fill: var(--surface); stroke: var(--accent-deep); stroke-width: 2; opacity: 0; animation: sp-growth-fade .5s var(--ease) both }
.sp-growth__dot--peak { fill: var(--accent-deep); stroke: #fff; stroke-width: 2 }
.sp-growth__ring {
  fill: none; stroke: var(--accent-deep); stroke-width: 2;
  transform-box: fill-box; transform-origin: center;
  animation: sp-growth-ping 2.2s var(--ease) infinite;
}
@keyframes sp-growth-rise { from { transform: scaleY(0) } to { transform: scaleY(1) } }
@keyframes sp-growth-fade { from { opacity: 0 } to { opacity: 1 } }
@keyframes sp-growth-ping { 0% { opacity: .55; transform: scale(1) } 100% { opacity: 0; transform: scale(2.1) } }
@media (prefers-reduced-motion: reduce) {
  .sp-growth__bar, .sp-growth__area, .sp-growth__line, .sp-growth__dot { animation: none; opacity: 1; transform: none }
  .sp-growth__ring { animation: none; opacity: 0 }
}
.sp-growth__labels { display: flex; justify-content: space-between; margin-top: 8px; padding: 0 2px; font-family: var(--font-mono); font-size: .66rem; font-weight: 600; letter-spacing: .04em; color: var(--muted-dim) }
.sp-growth__foot { display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding-top: 14px; border-top: 1px solid var(--border); font-size: .78rem; font-weight: 600; color: var(--muted) }
.sp-growth__ready { display: inline-flex; align-items: center; gap: 5px; color: var(--accent-deep) }
.sp-growth__ready svg { flex-shrink: 0 }
@media (max-width: 940px) {
  .sp-hero.sp-hero--split { grid-template-columns: 1fr; text-align: center; gap: 40px }
  .sp-hero--split .sp-hero__h1, .sp-hero--split .sp-hero__badge { text-align: center }
  .sp-hero--split .sp-hero__sub { margin-left: auto; margin-right: auto; text-align: center }
}

/* ── Comparison (generic training vs Think Like a Security Analyst 101) ── */
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

/* ── Syllabus (connected timeline) ── */
.sp-syllabus { position: relative; padding-left: 60px }
.sp-syllabus::before { content: ""; position: absolute; left: 20px; top: 6px; bottom: 6px; width: 2px; background: linear-gradient(var(--border-strong), var(--border) 88%, transparent) }
.sp-syllabus__row { position: relative; padding-bottom: 40px }
.sp-syllabus__row:last-child { padding-bottom: 0 }
.sp-syllabus__num {
  position: absolute; left: -60px; top: -2px;
  width: 42px; height: 42px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: var(--surface); border: 1.5px solid var(--accent-deep); color: var(--accent-deep);
  box-shadow: 0 8px 18px -10px rgba(85,70,224,.4);
}
.sp-syllabus__body { min-width: 0 }
.sp-syllabus__mod { font-family: var(--font-mono); font-size: .7rem; font-weight: 650; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep) }
.sp-syllabus__row h3 { margin: 8px 0 0; font-family: var(--font-display); font-size: 1.1rem; font-weight: 650; letter-spacing: -.015em; color: var(--ink) }
.sp-syllabus__row p { margin: 8px 0 0; font-size: .94rem; color: var(--muted); line-height: 1.65; max-width: 560px }

/* ── Learning roadmap (skill area, practiced via a real tool) ── */
.sp-roadmap {
  --cut: 20px;
  display: grid; grid-template-columns: repeat(2, 1fr);
  border: 1px solid var(--border);
  background: var(--surface);
  clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
  filter: drop-shadow(0 14px 26px rgba(16,25,46,.1));
}
.sp-roadmap__item { padding: 24px 30px; border-right: 1px dashed var(--border-strong); border-bottom: 1px dashed var(--border-strong) }
.sp-roadmap__item:nth-child(2n) { border-right: none }
.sp-roadmap__item:last-child { border-bottom: none }
.sp-roadmap__item:last-child:nth-child(odd) { grid-column: 1 / -1; border-right: none }
.sp-roadmap__item h3 { margin: 0; font-family: var(--font-display); font-size: 1rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink) }
.sp-roadmap__tool { display: block; margin-top: 8px; font-size: .78rem; font-weight: 600; color: var(--accent-deep) }
.sp-roadmap__tool::before { content: "via "; color: var(--muted-dim); font-weight: 500 }
@media (max-width: 680px) {
  .sp-roadmap { grid-template-columns: 1fr }
  .sp-roadmap__item { border-right: none !important; padding: 20px 24px }
}

@media (max-width: 680px) {
  .sp-syllabus { padding-left: 48px }
  .sp-syllabus::before { left: 15px }
  .sp-syllabus__num { left: -48px; width: 34px; height: 34px }
}
      `}</style>
    </SiteChrome>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, Check, FlaskConical, GraduationCap, Handshake, Layers, MessageCircle, TrendingUp, Users } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";

const curriculum = [
  { mod: "01", title: "Fundamentals", body: "The groundwork every analyst needs to start strong." },
  { mod: "02", title: "Threat detection", body: "Spotting suspicious activity and acting on it early." },
  { mod: "03", title: "Log analysis projects", body: "Real log data, and finding what matters in the noise." },
  { mod: "04", title: "Incident response", body: "An incident end to end: triage, investigate, contain, document." },
  {
    mod: "05",
    id: "instruction",
    title: "Cybersecurity Instruction",
    body: "Instructor support for cybersecurity, SOC operations, SIEM, threat detection, and incident response programs.",
  },
  {
    mod: "06",
    id: "labs",
    title: "Hands-On Security Labs",
    body: "Practical exercises designed to help learners investigate alerts, analyze threats, and understand modern security operations.",
  },
  {
    mod: "07",
    id: "curriculum",
    title: "Curriculum Support",
    body: "Help developing or improving cybersecurity training content based on practical industry skills.",
  },
];

const formats = [
  { icon: Users, title: "1:1 & small-group instruction", body: "Live sessions, paced to the learner or cohort." },
  { icon: FlaskConical, title: "Hands-on lab projects", body: "Real scenarios, worked at your own pace." },
  { icon: GraduationCap, title: "Embedded in your program", body: "We teach inside your existing curriculum." },
];

const tools = ["Microsoft Sentinel", "Splunk", "KQL / SPL", "Security+", "CySA+"];

export default function TrainingPage() {
  return (
    <SiteChrome active="training">
      {/* ═══════════ HERO — split copy + live curriculum preview ═══════════ */}
      <section className="sp-hero sp-hero--split">
        <div className="sp-hero__copy">
          <span className="sp-hero__badge">
            <GraduationCap size={13} /> Cybersecurity Training
          </span>
          <h1 className="sp-hero__h1">Training Built for the Job, Not the Textbook.</h1>
          <p className="sp-hero__sub">
            PurveX partners with cybersecurity academies and workforce programs on hands-on
            instruction built around real security operations.
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
            <div className="sp-growth__chart">
              <div className="sp-growth__bar" style={{ ["--h" as string]: "24%" }} />
              <div className="sp-growth__bar" style={{ ["--h" as string]: "36%" }} />
              <div className="sp-growth__bar" style={{ ["--h" as string]: "48%" }} />
              <div className="sp-growth__bar" style={{ ["--h" as string]: "62%" }} />
              <div className="sp-growth__bar" style={{ ["--h" as string]: "76%" }} />
              <div className="sp-growth__bar sp-growth__bar--peak" style={{ ["--h" as string]: "94%" }}>
                <span className="sp-growth__badge">
                  <Check size={12} />
                </span>
              </div>
            </div>
            <div className="sp-growth__labels">
              <span>Module 01</span>
              <span>Job-ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ WE SUPPORT YOUR PROGRAM ═══════════ */}
      <section className="sp-section sp-section--tight">
        <div className="sp-partner" data-r>
          <div className="sp-partner__text">
            <span className="sp-tag">We support your existing program</span>
            <h2>You do not need to compete with your program. We work alongside it.</h2>
            <p>
              PurveX works alongside your organization to strengthen your cybersecurity
              curriculum with experienced instruction, practical labs, and real-world security
              scenarios.
            </p>
            <p className="sp-partner__note">
              Learners are taught the blend of blue team and red team thinking: you cannot
              defend against tactics you do not understand.{" "}
              <Link href="/about#how-we-think">See how we think about security →</Link>
            </p>
          </div>
          <div className="sp-partner__visual">
            <div className="sp-partner__badge">
              <Handshake size={40} />
            </div>
            <div className="sp-partner__pills">
              <span className="sp-partner__pill">
                <GraduationCap size={14} /> Your Program
              </span>
              <span className="sp-partner__pill sp-partner__pill--accent">
                <Users size={14} /> PurveX Instruction
              </span>
            </div>
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
              <span className="sp-syllabus__mod">
                Module
                <strong>{c.mod}</strong>
              </span>
              <div>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
              </div>
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
        <div className="sp-tools" data-r>
          <div className="sp-tools__head">
            <Layers size={16} />
            <span>Tools &amp; Certifications</span>
          </div>
          <div className="sp-tools__chips">
            {tools.map((t) => (
              <span key={t} className="sp-tagchip">
                {t}
              </span>
            ))}
          </div>
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
.sp-growth__head { display: flex; align-items: center; gap: 8px; font-size: .78rem; font-weight: 650; color: var(--muted); margin-bottom: 26px }
.sp-growth__head svg { color: var(--accent-deep) }
.sp-growth__chart { display: flex; align-items: flex-end; gap: 10px; height: 140px; padding-bottom: 4px; border-bottom: 1px solid var(--border) }
.sp-growth__bar {
  flex: 1; height: var(--h); min-width: 0; border-radius: 6px 6px 0 0;
  background: var(--accent-soft);
  position: relative;
  transform-origin: bottom;
  animation: sp-growth-rise .8s var(--ease) both;
}
.sp-growth__bar:nth-child(1) { animation-delay: .05s }
.sp-growth__bar:nth-child(2) { animation-delay: .12s }
.sp-growth__bar:nth-child(3) { animation-delay: .19s }
.sp-growth__bar:nth-child(4) { animation-delay: .26s }
.sp-growth__bar:nth-child(5) { animation-delay: .33s }
.sp-growth__bar:nth-child(6) { animation-delay: .4s }
.sp-growth__bar--peak { background: linear-gradient(180deg, var(--accent), var(--accent-deep)) }
.sp-growth__badge { position: absolute; top: -26px; left: 50%; transform: translateX(-50%); width: 20px; height: 20px; border-radius: 50%; background: var(--accent-deep); color: #fff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px -2px rgba(85,70,224,.6) }
@keyframes sp-growth-rise { from { transform: scaleY(0) } to { transform: scaleY(1) } }
@media (prefers-reduced-motion: reduce) { .sp-growth__bar { animation: none } }
.sp-growth__labels { display: flex; justify-content: space-between; margin-top: 10px; font-size: .72rem; font-weight: 600; color: var(--muted-dim) }
@media (max-width: 940px) {
  .sp-hero.sp-hero--split { grid-template-columns: 1fr; text-align: center; gap: 40px }
  .sp-hero--split .sp-hero__h1, .sp-hero--split .sp-hero__badge { text-align: center }
  .sp-hero--split .sp-hero__sub { margin-left: auto; margin-right: auto; text-align: center }
}

/* ── We support your program (text + partnership visual) ── */
.sp-partner {
  --cut: 26px;
  position: relative; overflow: hidden;
  display: grid; grid-template-columns: 1.3fr .7fr; gap: 44px; align-items: center;
  padding: 48px 52px;
  clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
  border: 1px solid var(--border);
  background: radial-gradient(120% 140% at 100% 0%, rgba(106,92,255,.06), transparent 55%), var(--surface);
  filter: drop-shadow(0 20px 40px rgba(16,25,46,.1));
  transform: perspective(1000px) rotateX(var(--tiltX, 0deg)) rotateY(var(--tiltY, 0deg)) translateY(var(--tiltLift, 0px));
  transition: transform .35s var(--ease), filter .3s, border-color .3s;
}
.sp-partner::before {
  content: "";
  position: absolute; inset: 0;
  background: radial-gradient(260px circle at var(--mx, 100%) var(--my, 0%), rgba(106,92,255,.12), transparent 62%);
  opacity: 0; transition: opacity .4s; pointer-events: none;
}
.sp-partner:hover { border-color: var(--border-strong); filter: drop-shadow(0 26px 48px rgba(16,25,46,.14)) }
.sp-partner:hover::before { opacity: 1 }
@media (prefers-reduced-motion: reduce) { .sp-partner { transform: none !important } .sp-partner::before { display: none } }
.sp-partner h2 { margin: 14px 0 0; font-family: var(--font-display); font-size: clamp(1.5rem, 2.4vw, 1.95rem); font-weight: 700; line-height: 1.22; letter-spacing: -.02em; color: var(--ink) }
.sp-partner p { margin: 18px 0 0; color: var(--ink-soft); font-size: 1.02rem; line-height: 1.75 }
.sp-partner__note { margin-top: 22px !important; padding-top: 20px; border-top: 1px dashed var(--border-strong); font-size: .88rem !important; line-height: 1.65 !important; color: var(--muted) !important }
.sp-partner__note a { color: var(--accent-deep); font-weight: 600; text-decoration: none }
.sp-partner__note a:hover { text-decoration: underline }
.sp-partner__visual { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 26px }
.sp-partner__badge {
  position: relative;
  display: flex; align-items: center; justify-content: center;
  width: 104px; height: 104px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-deep));
  color: #fff;
  box-shadow: 0 20px 40px -14px rgba(85,70,224,.55);
}
.sp-partner__badge::before {
  content: "";
  position: absolute; inset: -11px;
  border-radius: 50%;
  border: 1.5px dashed rgba(106,92,255,.35);
  animation: sp-partner-spin 16s linear infinite;
}
@keyframes sp-partner-spin { to { transform: rotate(360deg) } }
@media (prefers-reduced-motion: reduce) { .sp-partner__badge::before { animation: none } }
.sp-partner__pills { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 10px }
.sp-partner__pill { display: inline-flex; align-items: center; gap: 7px; font-size: .8rem; font-weight: 650; color: var(--ink); background: var(--surface-alt); border: 1px solid var(--border); border-radius: 999px; padding: 8px 16px 8px 14px }
.sp-partner__pill svg { color: var(--muted-dim) }
.sp-partner__pill--accent { color: var(--accent-deep); background: var(--accent-soft); border-color: rgba(106,92,255,.25) }
.sp-partner__pill--accent svg { color: var(--accent-deep) }
@media (max-width: 860px) {
  .sp-partner { grid-template-columns: 1fr; padding: 36px 30px; gap: 28px }
  .sp-partner__visual { max-width: 320px; margin: 0 auto }
}

/* ── Syllabus (academic module list, two-up) ── */
.sp-syllabus {
  --cut: 18px;
  display: grid; grid-template-columns: 1fr 1fr;
  clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
  border: 1px solid var(--border);
  background: var(--surface);
  overflow: hidden;
  filter: drop-shadow(0 16px 32px rgba(16,25,46,.12));
}
.sp-syllabus__row { padding: 30px 34px; border-bottom: 1px dashed var(--border-strong) }
.sp-syllabus__row:nth-child(odd) { padding-right: 40px }
.sp-syllabus__row:nth-child(even) { padding-left: 40px; border-left: 1px dashed var(--border-strong) }
.sp-syllabus__row:last-child { grid-column: 1 / -1; border-bottom: none }
.sp-syllabus__mod { font-family: var(--font-mono); font-size: .68rem; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep); display: flex; align-items: baseline; gap: 10px }
.sp-syllabus__mod strong { font-family: var(--font-display); font-size: 1.7rem; font-weight: 700; color: var(--ink); letter-spacing: -.02em }
.sp-syllabus__row h3 { margin: 10px 0 0; font-family: var(--font-display); font-size: 1.06rem; font-weight: 650; letter-spacing: -.015em; color: var(--ink) }
.sp-syllabus__row p { margin: 8px 0 0; font-size: .92rem; color: var(--muted); line-height: 1.65; max-width: 560px }

.sp-tools {
  --cut: 18px;
  display: flex; align-items: center; gap: 16px 24px; flex-wrap: wrap;
  margin-top: 24px; padding: 22px 28px;
  clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
  border: 1px solid var(--border);
  background: var(--surface-alt);
}
.sp-tools__head { display: inline-flex; align-items: center; gap: 8px; font-size: .76rem; font-weight: 650; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep); flex-shrink: 0 }
.sp-tools__chips { display: flex; flex-wrap: wrap; gap: 8px; flex: 1 }
.sp-tagchip { font-size: .74rem; font-weight: 550; color: var(--accent-deep); background: var(--surface); border: 1px solid rgba(106,92,255,.18); border-radius: 999px; padding: 5px 11px }
@media (max-width: 680px) {
  .sp-syllabus { grid-template-columns: 1fr }
  .sp-syllabus__row { padding: 26px 24px }
  .sp-syllabus__row:nth-child(odd), .sp-syllabus__row:nth-child(even) { padding-left: 24px; padding-right: 24px; border-left: none }
  .sp-syllabus__row:last-child { grid-column: 1 }
  .sp-tools { flex-direction: column; align-items: flex-start }
}
      `}</style>
    </SiteChrome>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, FlaskConical, GraduationCap, Layers, Users } from "lucide-react";
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
      {/* ═══════════ HERO ═══════════ */}
      <section className="sp-hero">
        <span className="sp-hero__badge">
          <GraduationCap size={13} /> Cybersecurity Training
        </span>
        <h1 className="sp-hero__h1">Training Built for the Job, Not the Textbook.</h1>
        <p className="sp-hero__sub">
          PurveX partners with cybersecurity academies and workforce programs on hands-on
          instruction built around real security operations.
        </p>
      </section>

      {/* ═══════════ WE SUPPORT YOUR PROGRAM ═══════════ */}
      <section className="sp-section sp-section--tight">
        <div className="sp-panel" data-r>
          <span className="sp-tag">We support your existing program</span>
          <h2>You do not need to compete with your program. We work alongside it.</h2>
          <p>
            PurveX works alongside your organization to strengthen your cybersecurity curriculum
            with experienced instruction, practical labs, and real-world security scenarios.
          </p>
        </div>
        <p className="sp-footnote" data-r>
          Learners are taught the blend of blue team and red team thinking: you cannot defend
          against tactics you do not understand.{" "}
          <Link href="/about#how-we-think">See how we think about security →</Link>
        </p>
      </section>

      {/* ═══════════ SYLLABUS ═══════════ */}
      <section className="sp-section">
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
        <div className="sp-formats" data-r>
          {formats.map((f) => (
            <div key={f.title} className="sp-formats__item">
              <div className="sp-formats__icon">
                <f.icon size={18} />
              </div>
              <div>
                <h3 className="sp-formats__title">{f.title}</h3>
                <p className="sp-formats__body">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="sp-tools" data-r>
          <span className="sp-tools__label">Tools &amp; certs</span>
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
          <span className="sp-tag">Looking for an instructor or training partner?</span>
          <h2>Partner With PurveX</h2>
          <p>Tell us about your program and we will find the format that fits it best.</p>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Partner With PurveX <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <style>{`
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

.sp-formats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px }
.sp-formats__item { --cut: 16px; display: flex; align-items: flex-start; gap: 14px; padding: 22px; clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut)); border: 1px solid var(--border); background: var(--surface-alt) }
.sp-formats__icon { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 10px; background: var(--surface); border: 1px solid var(--border-strong); color: var(--accent-deep); flex-shrink: 0 }
.sp-formats__title { margin: 0; font-family: var(--font-display); font-size: .96rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink) }
.sp-formats__body { margin: 6px 0 0; color: var(--muted); font-size: .86rem; line-height: 1.55 }

.sp-tools { display: flex; align-items: center; gap: 12px 18px; flex-wrap: wrap; margin-top: 24px; padding: 18px 24px; border-radius: var(--radius); border: 1px solid var(--border); background: var(--surface-alt) }
.sp-tools__label { font-family: var(--font-mono); font-size: .7rem; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--muted-dim) }
.sp-tools__chips { display: flex; flex-wrap: wrap; gap: 8px; flex: 1 }
.sp-tagchip { font-size: .74rem; font-weight: 550; color: var(--accent-deep); background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); border-radius: 999px; padding: 5px 11px }

@media (max-width: 940px) { .sp-formats { grid-template-columns: 1fr } }
@media (max-width: 680px) {
  .sp-syllabus { grid-template-columns: 1fr }
  .sp-syllabus__row { padding: 26px 24px }
  .sp-syllabus__row:nth-child(odd), .sp-syllabus__row:nth-child(even) { padding-left: 24px; padding-right: 24px; border-left: none }
  .sp-syllabus__row:last-child { grid-column: 1 }
}
      `}</style>
    </SiteChrome>
  );
}

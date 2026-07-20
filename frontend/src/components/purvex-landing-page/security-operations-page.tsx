"use client";

import Link from "next/link";
import { ArrowRight, Radar, Search, ShieldCheck, Sliders, Swords, Target, Terminal, Waypoints } from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";

const services = [
  {
    id: "siem-detection-engineering",
    icon: Waypoints,
    title: "SIEM & Detection Engineering",
    body: "Build and improve security detections designed around your environment and threat landscape.",
  },
  {
    id: "siem-optimization",
    icon: Sliders,
    title: "SIEM Optimization",
    body: "Improve alert quality, reduce unnecessary noise, and help security teams focus on what matters.",
  },
  {
    id: "assessment",
    icon: Target,
    title: "Security Operations Assessment",
    body: "Evaluate your current security operations and identify opportunities to improve visibility, workflows, and detection coverage.",
  },
  {
    id: "detection-validation",
    icon: Radar,
    title: "Detection Validation",
    body: "Test whether security controls and detections respond as expected through controlled security simulations.",
  },
];

const process = [
  {
    n: "01",
    icon: Search,
    title: "Assess",
    body: "We start by understanding your current environment, tools, and detection coverage, so we know exactly where the gaps are.",
  },
  {
    n: "02",
    icon: Sliders,
    title: "Improve",
    body: "We tune, build, and strengthen detections and workflows based on what we find, prioritized by what matters most.",
  },
  {
    n: "03",
    icon: ShieldCheck,
    title: "Validate",
    body: "We test the changes so you know your detections fire the way they are supposed to, not just that they exist.",
  },
];

export default function SecurityOperationsPage() {
  return (
    <SiteChrome active="security-operations">
      {/* ═══════════ HERO ═══════════ */}
      <section className="sp-hero">
        <span className="sp-hero__badge">
          <Target size={13} /> Security Operations
        </span>
        <h1 className="sp-hero__h1">Strengthen Your Security Operations</h1>
        <p className="sp-hero__sub">
          Security tools are only effective when they are properly configured, monitored, and
          continuously improved. PurveX helps organizations improve their ability to identify
          threats and strengthen their detection capabilities.
        </p>
      </section>

      {/* ═══════════ SERVICES — CONSOLE ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">What we do</span>
          <h2>Four ways we strengthen your operations.</h2>
        </div>
        <div className="sp-console" data-r>
          <div className="sp-console__bar">
            <div className="sp-console__dots">
              <span />
              <span />
              <span />
            </div>
            <span className="sp-console__title">
              <Terminal size={12} /> security-operations.log
            </span>
          </div>
          <div className="sp-console__list">
            {services.map((s, i) => (
              <div key={s.title} id={s.id} className="sp-console__row">
                <span className="sp-console__idx">{String(i + 1).padStart(2, "0")}</span>
                <div className="sp-console__icon">
                  <s.icon size={18} />
                </div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW WE THINK ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">How we think</span>
          <h2>You cannot defend against tactics you do not understand.</h2>
          <p>
            Every detection we build starts from how attackers actually operate, not just what a
            vendor&apos;s default ruleset assumes. That is the blend of blue team and red team
            thinking PurveX is built on.
          </p>
        </div>
        <div className="sp-versus" data-r>
          <div className="sp-versus__side sp-versus__side--blue">
            <div className="sp-versus__icon">
              <ShieldCheck size={22} />
            </div>
            <span className="sp-versus__label">Blue Team</span>
            <p>Detect, respond, and defend the environment.</p>
          </div>
          <div className="sp-versus__mid">+</div>
          <div className="sp-versus__side sp-versus__side--red">
            <div className="sp-versus__icon">
              <Swords size={22} />
            </div>
            <span className="sp-versus__label">Red Team</span>
            <p>Think and move the way an attacker does.</p>
          </div>
        </div>
        <p className="sp-footnote" data-r>
          <Link href="/about#how-we-think">More on how we think →</Link>
        </p>
      </section>

      {/* ═══════════ HOW WE WORK ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">Our goal</span>
          <h2>Automate what can be automated. Never stop understanding it.</h2>
          <p>
            Every engagement moves through the same three stages, so you always know where things
            stand, and your team understands exactly what changed and why.
          </p>
        </div>
        <div className="sp-process" data-r>
          {process.map((p) => (
            <div key={p.title} className="sp-process__step">
              <span className="sp-process__num">{p.n}</span>
              <div className="sp-process__icon">
                <p.icon size={18} />
              </div>
              <h3 className="sp-process__title">{p.title}</h3>
              <p className="sp-process__body">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="sp-section">
        <div className="sp-cta" data-r>
          <span className="sp-tag">Not sure where your security gaps are?</span>
          <h2>Talk through your current security environment.</h2>
          <p>We will walk through where things stand today and identify where PurveX can help.</p>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Schedule a Conversation <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <style>{`
/* ── Console (dark terminal-style service log) ── */
.sp-console {
  --cut: 16px;
  clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
  border: 1px solid rgba(255,255,255,.08);
  background: var(--ink);
  overflow: hidden;
  filter: drop-shadow(0 24px 48px rgba(16,25,46,.35));
}
.sp-console__bar { display: flex; align-items: center; gap: 10px; padding: 14px 20px; background: rgba(255,255,255,.04); border-bottom: 1px solid rgba(255,255,255,.08) }
.sp-console__dots { display: flex; gap: 6px }
.sp-console__dots span { width: 9px; height: 9px; border-radius: 50% }
.sp-console__dots span:nth-child(1) { background: #f2777a }
.sp-console__dots span:nth-child(2) { background: #f4c059 }
.sp-console__dots span:nth-child(3) { background: #5ec269 }
.sp-console__title { display: inline-flex; align-items: center; gap: 7px; font-family: var(--font-mono); font-size: .72rem; color: rgba(255,255,255,.5); letter-spacing: .04em }
.sp-console__list { padding: 10px }
.sp-console__row { display: flex; align-items: flex-start; gap: 18px; padding: 22px 18px; transition: background .2s }
.sp-console__row:hover { background: rgba(255,255,255,.035) }
.sp-console__row + .sp-console__row { border-top: 1px solid rgba(255,255,255,.06) }
.sp-console__idx { font-family: var(--font-mono); font-size: .8rem; font-weight: 600; color: var(--accent); flex-shrink: 0; padding-top: 9px; width: 20px }
.sp-console__icon { flex-shrink: 0; width: 40px; height: 40px; border-radius: 10px; background: #fff; border: 1px solid #fff; color: var(--ink); display: flex; align-items: center; justify-content: center }
.sp-console__row h3 { margin: 0; font-family: var(--font-display); font-size: 1.02rem; font-weight: 650; letter-spacing: -.01em; color: #fff }
.sp-console__row p { margin: 6px 0 0; font-size: .88rem; color: rgba(255,255,255,.5); line-height: 1.6; max-width: 560px }

/* ── Blue vs red (inline version) ── */
.sp-versus { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 20px; max-width: 640px; margin: 0 auto }
.sp-versus__side { --cut: 14px; padding: 30px 26px; clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut)); text-align: center; transition: transform .3s var(--ease) }
.sp-versus__side:hover { transform: translateY(-3px) }
.sp-versus__side--blue { background: linear-gradient(160deg, var(--accent-soft), #ffffff); border: 1px solid rgba(106,92,255,.25) }
.sp-versus__side--red { background: linear-gradient(160deg, rgba(229,72,77,.08), #ffffff); border: 1px solid rgba(229,72,77,.22) }
.sp-versus__icon { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; border-radius: 13px; margin-bottom: 12px }
.sp-versus__side--blue .sp-versus__icon { background: var(--accent-soft); color: var(--accent-deep) }
.sp-versus__side--red .sp-versus__icon { background: rgba(229,72,77,.12); color: var(--red) }
.sp-versus__label { display: block; font-family: var(--font-display); font-size: 1.02rem; font-weight: 700; letter-spacing: -.01em; color: var(--ink) }
.sp-versus__side p { margin: 6px 0 0; font-size: .86rem; color: var(--muted); line-height: 1.5 }
.sp-versus__mid { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border-strong); font-family: var(--font-display); font-weight: 700; font-size: 1.2rem; color: var(--muted-dim); flex-shrink: 0 }
@media (max-width: 680px) { .sp-versus { grid-template-columns: 1fr; gap: 10px } .sp-versus__mid { justify-self: center } }

.sp-process { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; counter-reset: step }
.sp-process__step {
  --cut: 18px;
  position: relative; padding: 30px;
  clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
  border: 1px solid var(--border);
  background: var(--surface);
  filter: drop-shadow(0 14px 26px rgba(16,25,46,.12));
}
.sp-process__num { font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; letter-spacing: -.03em; color: var(--accent) }
.sp-process__icon { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 11px; background: var(--accent-soft); color: var(--accent-deep); margin-top: 14px }
.sp-process__title { margin: 16px 0 0; font-family: var(--font-display); font-size: 1.08rem; font-weight: 650; letter-spacing: -.015em; color: var(--ink) }
.sp-process__body { margin: 8px 0 0; color: var(--muted); font-size: .9rem; line-height: 1.65 }
@media (max-width: 940px) { .sp-process { grid-template-columns: 1fr } }
@media (max-width: 680px) {
  .sp-console__row { flex-wrap: wrap }
  .sp-console__idx { display: none }
}
      `}</style>
    </SiteChrome>
  );
}

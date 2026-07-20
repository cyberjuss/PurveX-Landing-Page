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
      {/* ═══════════ HERO — split copy + live console preview ═══════════ */}
      <section className="sp-hero sp-hero--split">
        <div className="sp-hero__copy">
          <span className="sp-hero__badge">
            <Target size={13} /> Security Operations
          </span>
          <h1 className="sp-hero__h1">Strengthen Your Security Operations</h1>
          <p className="sp-hero__sub">
            Security tools are only effective when they are properly configured, monitored, and
            continuously improved. PurveX helps organizations improve their ability to identify
            threats and strengthen their detection capabilities.
          </p>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Schedule a Conversation <ArrowRight size={16} />
          </a>
        </div>
        <div className="sp-hero__preview" data-r>
          <div className="sp-console sp-console--mini">
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
              {services.slice(0, 3).map((s, i) => (
                <div key={s.title} className="sp-console__row">
                  <span className="sp-console__idx">{String(i + 1).padStart(2, "0")}</span>
                  <div className="sp-console__icon">
                    <s.icon size={16} />
                  </div>
                  <div>
                    <h3>{s.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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

      {/* ═══════════ HOW WE THINK — zigzag row 1 ═══════════ */}
      <section className="sp-section">
        <div className="sp-zigzag" data-r>
          <div className="sp-zigzag__text">
            <span className="sp-tag">How we think</span>
            <h2>You cannot defend against tactics you do not understand.</h2>
            <p>
              Every detection we build starts from how attackers actually operate, not just what
              a vendor&apos;s default ruleset assumes. That is the blend of blue team and red team
              thinking PurveX is built on.
            </p>
            <Link href="/about#how-we-think" className="sp-zigzag__link">
              More on how we think <ArrowRight size={14} />
            </Link>
          </div>
          <div className="sp-versus sp-versus--compact">
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
        </div>
      </section>

      {/* ═══════════ OUR GOAL — zigzag row 2, reversed ═══════════ */}
      <section className="sp-section">
        <div className="sp-zigzag sp-zigzag--reverse" data-r>
          <div className="sp-timeline">
            {process.map((p) => (
              <div key={p.title} className="sp-timeline__step">
                <div className="sp-timeline__dot">
                  <p.icon size={16} />
                </div>
                <div className="sp-timeline__body">
                  <span className="sp-timeline__num">{p.n}</span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="sp-zigzag__text">
            <span className="sp-tag">Our goal</span>
            <h2>Automate what can be automated. Never stop understanding it.</h2>
            <p>
              Every engagement moves through the same three stages, so you always know where
              things stand, and your team understands exactly what changed and why.
            </p>
          </div>
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
/* ── Console (light terminal-style service log) ── */
.sp-console {
  --cut: 16px;
  clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut));
  border: 1px solid var(--border);
  background: var(--surface);
  overflow: hidden;
  filter: drop-shadow(0 20px 40px rgba(16,25,46,.14));
}
.sp-console__bar { display: flex; align-items: center; gap: 10px; padding: 14px 20px; background: var(--surface-alt); border-bottom: 1px solid var(--border) }
.sp-console__dots { display: flex; gap: 6px }
.sp-console__dots span { width: 9px; height: 9px; border-radius: 50% }
.sp-console__dots span:nth-child(1) { background: #f2777a }
.sp-console__dots span:nth-child(2) { background: #f4c059 }
.sp-console__dots span:nth-child(3) { background: #5ec269 }
.sp-console__title { display: inline-flex; align-items: center; gap: 7px; font-family: var(--font-mono); font-size: .72rem; color: var(--muted); letter-spacing: .04em }
.sp-console__list { padding: 10px }
.sp-console__row { display: flex; align-items: flex-start; gap: 20px; padding: 26px 24px; transition: background .2s }
.sp-console__row:hover { background: var(--surface-alt) }
.sp-console__row + .sp-console__row { border-top: 1px solid var(--border) }
.sp-console__idx { font-family: var(--font-mono); font-size: .8rem; font-weight: 600; color: var(--accent-deep); flex-shrink: 0; padding-top: 9px; width: 20px }
.sp-console__icon { flex-shrink: 0; width: 40px; height: 40px; border-radius: 10px; background: var(--accent-soft); border: 1px solid rgba(106,92,255,.2); color: var(--accent-deep); display: flex; align-items: center; justify-content: center }
.sp-console__row h3 { margin: 0; font-family: var(--font-display); font-size: 1.02rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink) }
.sp-console__row p { margin: 6px 0 0; font-size: .88rem; color: var(--muted); line-height: 1.6; max-width: 560px }

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

/* ── Hero, split: copy left, live console preview right ── */
.sp-hero--split { text-align: left; max-width: 1140px; display: grid; grid-template-columns: 1.05fr .95fr; gap: 56px; align-items: center }
.sp-hero--split .sp-hero__badge { margin-bottom: 22px }
.sp-hero--split .sp-hero__h1 { text-align: left }
.sp-hero--split .sp-hero__sub { margin: 22px 0 0; max-width: 480px }
.sp-hero--split .sp-btn { margin-top: 34px }
.sp-hero__preview { perspective: 1200px }
.sp-console--mini { max-width: 420px; margin-left: auto; transform: rotateY(-6deg) rotateX(2deg); transition: transform .5s var(--ease) }
.sp-console--mini:hover { transform: rotateY(-2deg) rotateX(0deg) }
.sp-console--mini .sp-console__row { padding: 16px 18px; gap: 14px }
.sp-console--mini .sp-console__icon { width: 32px; height: 32px }
.sp-console--mini .sp-console__row h3 { font-size: .88rem }
@media (prefers-reduced-motion: reduce) { .sp-console--mini { transform: none } }
@media (max-width: 940px) {
  .sp-hero--split { grid-template-columns: 1fr; text-align: center; gap: 40px }
  .sp-hero--split .sp-hero__h1, .sp-hero--split .sp-hero__badge { text-align: center }
  .sp-hero--split .sp-hero__sub { margin-left: auto; margin-right: auto }
  .sp-console--mini { transform: none; margin: 0 auto }
}

/* ── Zigzag rows (How we think / Our goal) ── */
.sp-zigzag { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center }
.sp-zigzag--reverse .sp-zigzag__text { order: 2 }
.sp-zigzag__text h2 { margin: 14px 0 0; font-family: var(--font-display); font-size: clamp(1.5rem, 2.6vw, 2rem); font-weight: 700; line-height: 1.24; letter-spacing: -.02em; color: var(--ink) }
.sp-zigzag__text p { margin: 18px 0 0; color: var(--ink-soft); font-size: 1.02rem; line-height: 1.75; max-width: 460px }
.sp-zigzag__link { display: inline-flex; align-items: center; gap: 8px; margin-top: 22px; font-size: .92rem; font-weight: 650; color: var(--accent-deep); text-decoration: none; transition: gap .25s var(--ease) }
.sp-zigzag__link:hover { gap: 12px }
.sp-versus--compact { max-width: none; margin: 0 }
@media (max-width: 860px) {
  .sp-zigzag { grid-template-columns: 1fr; gap: 32px }
  .sp-zigzag--reverse .sp-zigzag__text { order: 0 }
}

/* ── Timeline (Assess / Improve / Validate, vertical) ── */
.sp-timeline { position: relative; display: flex; flex-direction: column; gap: 30px; padding-left: 26px }
.sp-timeline::before { content: ""; position: absolute; left: 19px; top: 20px; bottom: 20px; width: 2px; background: linear-gradient(var(--border-strong), var(--border) 85%, transparent) }
.sp-timeline__step { position: relative; display: flex; gap: 18px }
.sp-timeline__dot { position: absolute; left: -26px; top: 0; width: 40px; height: 40px; border-radius: 50%; background: var(--surface); border: 2px solid var(--accent-deep); color: var(--accent-deep); display: flex; align-items: center; justify-content: center; flex-shrink: 0 }
.sp-timeline__body { padding-left: 34px }
.sp-timeline__num { font-family: var(--font-mono); font-size: .72rem; font-weight: 600; letter-spacing: .08em; color: var(--muted-dim) }
.sp-timeline__body h3 { margin: 4px 0 0; font-family: var(--font-display); font-size: 1.05rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink) }
.sp-timeline__body p { margin: 6px 0 0; color: var(--muted); font-size: .9rem; line-height: 1.6; max-width: 420px }

@media (max-width: 680px) {
  .sp-console__row { flex-wrap: wrap }
  .sp-console__idx { display: none }
}
      `}</style>
    </SiteChrome>
  );
}

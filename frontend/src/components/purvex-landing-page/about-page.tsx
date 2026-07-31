"use client";

import Link from "next/link";
import { ArrowRight, Brain, Radar, ShieldCheck, Swords, Zap } from "lucide-react";
import { SiteChrome } from "./chrome";

const goals = [
  {
    icon: Zap,
    title: "Automate the solvable",
    body: "Repeatable SOC work gets automated, so analysts spend their time on judgment calls, not repetitive tickets.",
  },
  {
    icon: Brain,
    title: "Understand what is underneath",
    body: "Automation without understanding is fragile. We make sure the people running it know exactly how and why it works.",
  },
];

export default function AboutPage() {
  return (
    <SiteChrome active="about">
      {/* ═══════════ HERO ═══════════ */}
      <section className="sp-hero">
        <h1 className="sp-hero__h1">Blue team. Red team. One discipline.</h1>
        <p className="sp-hero__sub">
          PurveX helps organizations strengthen their security operations and develop the
          cybersecurity talent needed to support them.
        </p>
      </section>

      {/* ═══════════ HOW WE THINK ═══════════ */}
      <section className="sp-section" id="how-we-think">
        <div className="sp-about-split" data-r>
          <div className="sp-head sp-head--left sp-about-split__text">
            <span className="sp-tag">How we think</span>
            <h2>You cannot defend against tactics you do not understand.</h2>
            <p>
              PurveX is built on the blend of blue team and red team thinking. Understanding
              both sides is what makes a stronger analyst, and it shapes everything we do. We do
              not train one side and hope it holds up against the other. We build analysts, and
              run operations, that understand both.
            </p>
            <p className="sp-about-wink">With great visibility comes great responsibility.</p>
          </div>
          <div className="sp-yinyang">
            <div className="sp-yinyang__label sp-yinyang__label--blue">
              <ShieldCheck size={17} />
              <div>
                <strong>Blue Team</strong>
                <span>Detect, respond, and defend the environment.</span>
              </div>
            </div>

            <svg viewBox="0 0 100 100" className="sp-yinyang__svg" aria-hidden="true">
              <circle cx="50" cy="50" r="49" className="sp-yinyang__red" />
              <path
                d="M50,1 A24.5,24.5 0 0,1 50,50 A24.5,24.5 0 0,0 50,99 A49,49 0 0,1 50,1 Z"
                className="sp-yinyang__blue"
              />
              <circle cx="50" cy="25.5" r="6.5" className="sp-yinyang__dot sp-yinyang__dot--red" />
              <circle cx="50" cy="74.5" r="6.5" className="sp-yinyang__dot sp-yinyang__dot--blue" />
            </svg>

            <div className="sp-yinyang__label sp-yinyang__label--red">
              <Swords size={17} />
              <div>
                <strong>Red Team</strong>
                <span>Think and move the way an attacker does.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ OUR GOAL ═══════════ */}
      <section className="sp-section sp-section--tight">
        <div className="sp-about-split" data-r>
          <div className="sp-head sp-head--left sp-about-split__text">
            <span className="sp-tag">Our goal</span>
            <h2>Automate what can be automated. Never stop understanding it.</h2>
            <p>
              A lot of what happens in a SOC is repeatable, and repeatable work should be
              automated, not repeated by hand forever. Our number one goal is to solve the
              problems in security operations that can be automated, and build a better way of
              doing what is left, without losing the people who have to run it.
            </p>
          </div>
          <div className="sp-goal-list">
            {goals.map((g) => (
              <div key={g.title} className="sp-goal-list__item">
                <div className="sp-goal-list__icon">
                  <g.icon size={19} />
                </div>
                <div>
                  <h3>{g.title}</h3>
                  <p>{g.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WHO WE ARE ═══════════ */}
      <section className="sp-section sp-section--tight" id="who-we-are">
        <div className="sp-head" data-r>
          <span className="sp-tag">Who we are</span>
          <h2>No layer between the work and the person doing it.</h2>
          <p>
            PurveX stays close to the work. The person running your security operations is the
            same one teaching in the field, not an account manager relaying between you and the
            work. That is not a feature we added. It is how we think a company like this should
            be run.
          </p>
        </div>
        <div className="sp-about-founder" data-r>
          <p>The best way to see if we are a fit is a real conversation, not a pitch.</p>
          <Link href="/about/founder" className="sp-btn sp-btn--ghost sp-btn--sm">
            Meet the founder <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="sp-section">
        <div className="sp-cta" data-r>
          <div className="sp-cta__icon">
            <Radar size={22} />
          </div>
          <h2>Proof, not assumed coverage.</h2>
          <Link href="/platform" className="sp-btn sp-btn--prim sp-btn--lg">
            Explore PurveX Labs <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <style>{`
/* ── Split sections: text left, visual/list right ── */
.sp-about-split { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center }
.sp-about-split__text { margin: 0 }
.sp-about-wink { margin: 18px 0 0; font-size: .88rem; font-style: italic; color: var(--muted) }
@media (max-width: 860px) {
  .sp-about-split { grid-template-columns: 1fr; gap: 40px }
}

/* ── Blue vs red ── */
.sp-yinyang { display: flex; align-items: center; justify-content: center; gap: 22px; flex-wrap: wrap }
.sp-yinyang__svg { width: 140px; height: 140px; flex-shrink: 0; filter: drop-shadow(0 16px 32px rgba(16,25,46,.16)); transition: transform .4s var(--ease) }
.sp-yinyang:hover .sp-yinyang__svg { transform: rotate(20deg) }
.sp-yinyang__red { fill: var(--red) }
.sp-yinyang__blue { fill: #2563eb }
.sp-yinyang__dot--red { fill: var(--red) }
.sp-yinyang__dot--blue { fill: #2563eb }
@media (prefers-reduced-motion: reduce) { .sp-yinyang__svg { transition: none } }
.sp-yinyang__label { display: flex; align-items: flex-start; gap: 9px; max-width: 148px }
.sp-yinyang__label--red { text-align: right; flex-direction: row-reverse }
.sp-yinyang__label svg { flex-shrink: 0; margin-top: 2px }
.sp-yinyang__label--blue svg { color: #2563eb }
.sp-yinyang__label--red svg { color: var(--red) }
.sp-yinyang__label strong { display: block; font-family: var(--font-display); font-size: .92rem; font-weight: 700; letter-spacing: -.01em; color: var(--ink) }
.sp-yinyang__label span { display: block; margin-top: 4px; font-size: .8rem; color: var(--muted); line-height: 1.45 }
@media (max-width: 680px) {
  .sp-yinyang { flex-direction: column }
  .sp-yinyang__svg { order: -1 }
  .sp-yinyang__label { max-width: none; width: 100%; justify-content: center; text-align: left }
  .sp-yinyang__label--red { flex-direction: row }
}

/* ── Our-goal list: divided, not boxed ── */
.sp-goal-list { display: flex; flex-direction: column }
.sp-goal-list__item { display: flex; gap: 16px; padding: 22px 0; border-top: 1px solid var(--border) }
.sp-goal-list__item:first-child { border-top: none; padding-top: 0 }
.sp-goal-list__item:last-child { padding-bottom: 0 }
.sp-goal-list__icon {
  flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%;
  background: var(--accent-soft); border: 1px solid rgba(106,92,255,.18); color: var(--accent-deep);
  display: flex; align-items: center; justify-content: center;
}
.sp-goal-list__item h3 { margin: 0; font-family: var(--font-display); font-size: 1.02rem; font-weight: 650; letter-spacing: -.01em; color: var(--ink) }
.sp-goal-list__item p { margin: 8px 0 0; font-size: .92rem; color: var(--muted); line-height: 1.6 }

/* ── Who we are: founder callout ── */
.sp-about-founder { max-width: 620px; margin: 32px auto 0; text-align: center; padding-top: 32px; border-top: 1px solid var(--border) }
.sp-about-founder p { margin: 0; color: var(--muted); font-size: .98rem; line-height: 1.7 }
.sp-about-founder .sp-btn { margin-top: 18px }
      `}</style>
    </SiteChrome>
  );
}

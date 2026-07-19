"use client";

import { Brain, ShieldCheck, Swords, Zap } from "lucide-react";
import { SiteChrome } from "./chrome";

const goals = [
  {
    icon: Zap,
    title: "Automate the solvable",
    body: "Repeatable SOC work gets automated, so analysts spend their time on judgment calls, not repetitive tickets.",
  },
  {
    icon: Brain,
    title: "Understand what's underneath",
    body: "Automation without understanding is fragile. We make sure the people running it know exactly how and why it works.",
  },
];

export default function AboutPage() {
  return (
    <SiteChrome active="about">
      {/* ═══════════ HERO ═══════════ */}
      <section className="sp-hero">
        <span className="sp-hero__badge">Your friendly neighborhood blue team</span>
        <h1 className="sp-hero__h1">About PurveX</h1>
        <p className="sp-hero__sub">
          PurveX helps organizations strengthen their security operations and develop the
          cybersecurity talent needed to support them.
        </p>
      </section>

      {/* ═══════════ HOW WE THINK ═══════════ */}
      <section id="how-we-think" className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">How we think</span>
          <h2>You can&apos;t defend what you don&apos;t know how attackers use to attack.</h2>
          <p>
            PurveX is built on the blend of blue team and red team thinking. Understanding both
            sides is what makes a stronger analyst, and it shapes everything we do.
          </p>
        </div>
        <div className="sp-versus" data-r>
          <div className="sp-versus__side sp-versus__side--blue">
            <div className="sp-versus__icon">
              <ShieldCheck size={24} />
            </div>
            <span className="sp-versus__label">Blue Team</span>
            <p>Detect, respond, and defend the environment.</p>
          </div>
          <div className="sp-versus__mid">+</div>
          <div className="sp-versus__side sp-versus__side--red">
            <div className="sp-versus__icon">
              <Swords size={24} />
            </div>
            <span className="sp-versus__label">Red Team</span>
            <p>Think and move the way an attacker does.</p>
          </div>
        </div>
        <p className="sp-versus__conclusion" data-r>
          We don&apos;t train one side and hope it holds up against the other. We build analysts,
          and run operations, that understand both.
        </p>
        <p className="sp-versus__wink" data-r>With great visibility comes great responsibility.</p>
      </section>

      {/* ═══════════ OUR GOAL ═══════════ */}
      <section className="sp-section">
        <div className="sp-head" data-r>
          <span className="sp-tag">Our goal</span>
          <h2>Automate what can be automated. Never stop understanding it.</h2>
          <p>
            A lot of what happens in a SOC is repeatable, and repeatable work should be
            automated, not repeated by hand forever. Our number one goal is to solve the problems
            in security operations that can be automated, and build a better way of doing what&apos;s
            left, without losing the people who have to run it.
          </p>
        </div>
        <div className="sp-cards sp-cards--2" data-r>
          {goals.map((g) => (
            <article key={g.title} className="sp-card">
              <div className="sp-card__icon">
                <g.icon size={20} />
              </div>
              <h3 className="sp-card__title">{g.title}</h3>
              <p className="sp-card__body">{g.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════ WHO WE ARE ═══════════ */}
      <section id="who-we-are" className="sp-section">
        <div className="sp-panel" data-r>
          <span className="sp-tag">Who we are</span>
          <h2>You work directly with the practitioner.</h2>
          <p>
            The person doing your security operations work is the same one teaching in the
            field. You get real experience, not a script.
          </p>
          <p>No sales layer. The best way to see if we&apos;re a fit is a quick conversation.</p>
        </div>
      </section>

      {/* ═══════════ BUILDING WHAT'S NEXT ═══════════ */}
      <section id="purvex-labs" className="sp-section">
        <div className="sp-panel" data-r>
          <span className="sp-tag">Building what&apos;s next</span>
          <h2>PurveX Labs</h2>
          <p>
            PurveX is exploring new ways to help security teams continuously measure and validate
            their detection capabilities.
          </p>
          <p>
            Our long-term vision is to develop technology that helps organizations move beyond
            assumed security coverage toward measurable evidence that their detections work when
            they are needed.
          </p>
        </div>
      </section>

      <style>{`
.sp-versus { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 20px }
.sp-versus__side { padding: 34px 28px; border-radius: calc(var(--radius) + 2px); text-align: center; transition: transform .3s var(--ease) }
.sp-versus__side:hover { transform: translateY(-3px) }
.sp-versus__side--blue { background: linear-gradient(160deg, var(--accent-soft), #ffffff); border: 1px solid rgba(106,92,255,.25) }
.sp-versus__side--red { background: linear-gradient(160deg, rgba(229,72,77,.08), #ffffff); border: 1px solid rgba(229,72,77,.22) }
.sp-versus__icon { display: inline-flex; align-items: center; justify-content: center; width: 52px; height: 52px; border-radius: 14px; margin-bottom: 14px }
.sp-versus__side--blue .sp-versus__icon { background: var(--accent-soft); color: var(--accent-deep) }
.sp-versus__side--red .sp-versus__icon { background: rgba(229,72,77,.12); color: var(--red) }
.sp-versus__label { display: block; font-family: var(--font-display); font-size: 1.08rem; font-weight: 700; letter-spacing: -.01em; color: var(--ink) }
.sp-versus__side p { margin: 8px 0 0; font-size: .88rem; color: var(--muted); line-height: 1.55 }
.sp-versus__mid { display: flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border-strong); font-family: var(--font-display); font-weight: 700; font-size: 1.3rem; color: var(--muted-dim); flex-shrink: 0 }
.sp-versus__conclusion { max-width: 640px; margin: 32px auto 0; text-align: center; font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; letter-spacing: -.01em; line-height: 1.5; color: var(--ink-soft) }
.sp-versus__wink { margin: 12px auto 0; text-align: center; font-size: .84rem; font-style: italic; color: var(--muted) }

@media (max-width: 680px) {
  .sp-versus { grid-template-columns: 1fr; gap: 12px }
  .sp-versus__mid { justify-self: center }
}
      `}</style>
    </SiteChrome>
  );
}

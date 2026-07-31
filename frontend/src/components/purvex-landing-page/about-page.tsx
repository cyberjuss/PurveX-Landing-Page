"use client";

import Link from "next/link";
import { ArrowRight, Brain, ShieldCheck, Swords, Zap } from "lucide-react";
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

const toc = [
  { num: "01", label: "How we think", href: "#how-we-think" },
  { num: "02", label: "Our goal", href: "#our-goal" },
  { num: "03", label: "Who we are", href: "#who-we-are" },
  { num: "04", label: "Looking ahead", href: "#looking-ahead" },
];

export default function AboutPage() {
  return (
    <SiteChrome active="about">
      <div className="sp-mag">
        {/* ═══════════ MASTHEAD ═══════════ */}
        <div className="sp-mag__masthead" data-r>
          <span className="sp-mag__kicker">Field Notes — On Security</span>
          <h1>Blue team. Red team. One discipline.</h1>
          <p>
            PurveX helps organizations strengthen their security operations and develop the
            cybersecurity talent needed to support them.
          </p>
          <div className="sp-mag__byline">
            <span>By PurveX</span>
            <span className="sp-mag__byline-dot" aria-hidden />
            <span>4 min read</span>
          </div>
        </div>

        {/* ═══════════ CONTENTS ═══════════ */}
        <nav className="sp-mag__toc" data-r aria-label="Sections">
          {toc.map((t) => (
            <a key={t.num} href={t.href}>
              <span className="sp-mag__toc-num">{t.num}</span>
              {t.label}
            </a>
          ))}
        </nav>

        {/* ═══════════ 01 — HOW WE THINK ═══════════ */}
        <section id="how-we-think" className="sp-mag__section" data-r>
          <div className="sp-mag__rail">
            <span className="sp-mag__num">01</span>
            <span className="sp-mag__label">How we think</span>
            <p className="sp-mag__pull">You cannot defend against tactics you do not understand.</p>
          </div>
          <div className="sp-mag__content">
            <p className="sp-mag__lede">
              PurveX is built on the blend of blue team and red team thinking. Understanding both
              sides is what makes a stronger analyst, and it shapes everything we do.
            </p>

            <div className="sp-yinyang">
              <div className="sp-yinyang__label sp-yinyang__label--blue">
                <ShieldCheck size={16} />
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
                <Swords size={16} />
                <div>
                  <strong>Red Team</strong>
                  <span>Think and move the way an attacker does.</span>
                </div>
              </div>
            </div>

            <p>
              We do not train one side and hope it holds up against the other. We build analysts,
              and run operations, that understand both.
            </p>
            <p className="sp-mag__wink">With great visibility comes great responsibility.</p>
          </div>
        </section>

        {/* ═══════════ 02 — OUR GOAL ═══════════ */}
        <section id="our-goal" className="sp-mag__section" data-r>
          <div className="sp-mag__rail">
            <span className="sp-mag__num">02</span>
            <span className="sp-mag__label">Our goal</span>
            <p className="sp-mag__pull">Automate what can be automated. Never stop understanding it.</p>
          </div>
          <div className="sp-mag__content">
            <p>
              A lot of what happens in a SOC is repeatable, and repeatable work should be
              automated, not repeated by hand forever. Our number one goal is to solve the
              problems in security operations that can be automated, and build a better way of
              doing what is left, without losing the people who have to run it.
            </p>
            <div className="sp-mag__points">
              {goals.map((g) => (
                <div key={g.title} className="sp-mag__point">
                  <div className="sp-mag__point-icon">
                    <g.icon size={17} />
                  </div>
                  <div>
                    <strong>{g.title}</strong>
                    <span>{g.body}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════ 03 — WHO WE ARE ═══════════ */}
        <section id="who-we-are" className="sp-mag__section" data-r>
          <div className="sp-mag__rail">
            <span className="sp-mag__num">03</span>
            <span className="sp-mag__label">Who we are</span>
            <p className="sp-mag__pull">No layer between the work and the person doing it.</p>
          </div>
          <div className="sp-mag__content">
            <p>
              PurveX stays close to the work. The person running your security operations is the
              same one teaching in the field, not an account manager relaying between you and
              the work. That is not a feature we added. It is how we think a company like this
              should be run.
            </p>
            <p>The best way to see if we are a fit is a real conversation, not a pitch.</p>
            <Link href="/about/founder" className="sp-mag__link">
              Meet the founder <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* ═══════════ 04 — LOOKING AHEAD ═══════════ */}
        <section id="looking-ahead" className="sp-mag__section" data-r>
          <div className="sp-mag__rail">
            <span className="sp-mag__num">04</span>
            <span className="sp-mag__label">Looking ahead</span>
            <p className="sp-mag__pull">Proof, not assumed coverage.</p>
          </div>
          <div className="sp-mag__content">
            <p>
              PurveX is exploring new ways to help security teams continuously measure and
              validate their detection capabilities: technology that helps organizations move
              beyond assumed security coverage toward measurable evidence that their detections
              work when they are needed.
            </p>
            <Link href="/platform" className="sp-mag__link">
              Explore PurveX Labs <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </div>

      <style>{`
.sp-mag { max-width: 1040px; margin: 0 auto; padding-top: 132px }

/* ── Masthead ── */
.sp-mag__kicker {
  display: inline-block; margin-bottom: 20px;
  font-family: var(--font-mono); font-size: .78rem; font-weight: 650; letter-spacing: .2em;
  text-transform: uppercase; color: var(--accent-deep);
}
.sp-mag__masthead h1 { margin: 0; font-family: var(--font-display); font-size: clamp(2.3rem, 4.6vw, 3.4rem); font-weight: 700; line-height: 1.1; letter-spacing: -.03em; color: var(--ink); text-wrap: balance; max-width: 780px }
.sp-mag__masthead p { margin: 22px 0 0; font-size: 1.1rem; line-height: 1.7; color: var(--ink-soft); max-width: 560px }
.sp-mag__byline {
  display: flex; align-items: center; gap: 10px; margin-top: 28px;
  font-family: var(--font-mono); font-size: .8rem; letter-spacing: .02em; color: var(--muted-dim);
}
.sp-mag__byline-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--muted-dim) }

/* ── Contents strip ── */
.sp-mag__toc {
  display: flex; flex-wrap: wrap; gap: 0;
  margin-top: 44px; padding: 22px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
}
.sp-mag__toc a {
  display: inline-flex; align-items: center; gap: 9px;
  padding: 6px 24px; border-left: 1px solid var(--border);
  font-family: var(--font-mono); font-size: .82rem; font-weight: 600; color: var(--muted);
  text-decoration: none; transition: color .2s var(--ease);
}
.sp-mag__toc a:first-child { border-left: none; padding-left: 0 }
.sp-mag__toc a:hover { color: var(--accent-deep) }
.sp-mag__toc-num { color: var(--accent-deep); font-weight: 700 }

/* ── Article rows: narrow rail + wide content ── */
.sp-mag__section { display: grid; grid-template-columns: 200px 1fr; gap: 48px; padding: 64px 0; border-bottom: 1px solid var(--border) }
.sp-mag__section:last-child { border-bottom: none }
.sp-mag__rail { position: relative; padding-right: 32px; border-right: 1px solid var(--border) }
.sp-mag__num {
  display: block; font-family: var(--font-display); font-size: 3.4rem; font-weight: 800; line-height: 1;
  color: transparent; -webkit-text-stroke: 1.5px var(--border-strong);
}
.sp-mag__label {
  display: block; margin-top: 14px;
  font-family: var(--font-mono); font-size: .72rem; font-weight: 650; letter-spacing: .16em;
  text-transform: uppercase; color: var(--accent-deep);
}
.sp-mag__pull {
  margin: 18px 0 0; font-family: var(--font-display); font-size: 1.1rem; font-weight: 650;
  letter-spacing: -.01em; line-height: 1.45; color: var(--ink);
}
.sp-mag__content { min-width: 0 }
.sp-mag__content p { margin: 0 0 20px; font-size: 1.02rem; line-height: 1.78; color: var(--ink-soft); max-width: 620px }
.sp-mag__content p:last-of-type { margin-bottom: 0 }
.sp-mag__lede::first-letter {
  float: left; margin: .02em .09em 0 0;
  font-family: var(--font-display); font-size: 3.6em; font-weight: 700; line-height: .8;
  color: var(--accent-deep);
}
.sp-mag__wink { font-size: .86rem; font-style: italic; color: var(--muted) }
.sp-mag__link { display: inline-flex; align-items: center; gap: 8px; margin-top: 6px; font-size: .92rem; font-weight: 650; color: var(--accent-deep); text-decoration: none; transition: gap .25s var(--ease) }
.sp-mag__link:hover { gap: 12px }

@media (max-width: 860px) {
  .sp-mag__section { grid-template-columns: 1fr; gap: 24px }
  .sp-mag__rail { padding-right: 0; padding-bottom: 24px; border-right: none; border-bottom: 1px solid var(--border) }
}
@media (max-width: 680px) {
  .sp-mag { padding-top: 72px }
  .sp-mag__toc { flex-direction: column; gap: 4px }
  .sp-mag__toc a { border-left: none; padding: 8px 0 }
  .sp-mag__section { padding: 44px 0 }
}

/* Blue vs red — a lighter, inline version of the shared card treatment */
.sp-yinyang { display: flex; align-items: center; justify-content: center; gap: 18px; flex-wrap: wrap; margin: 28px 0 }
.sp-yinyang__svg { width: 110px; height: 110px; flex-shrink: 0; filter: drop-shadow(0 14px 28px rgba(16,25,46,.16)); transition: transform .4s var(--ease); }
.sp-yinyang:hover .sp-yinyang__svg { transform: rotate(20deg) }
.sp-yinyang__red { fill: var(--red) }
.sp-yinyang__blue { fill: #2563eb }
.sp-yinyang__dot--red { fill: var(--red) }
.sp-yinyang__dot--blue { fill: #2563eb }
@media (prefers-reduced-motion: reduce) { .sp-yinyang__svg { transition: none } }
.sp-yinyang__label { display: flex; align-items: flex-start; gap: 8px; width: 128px }
.sp-yinyang__label--red { text-align: right; flex-direction: row-reverse }
.sp-yinyang__label svg { flex-shrink: 0; margin-top: 2px }
.sp-yinyang__label--blue svg { color: #2563eb }
.sp-yinyang__label--red svg { color: var(--red) }
.sp-yinyang__label strong { display: block; font-family: var(--font-display); font-size: .9rem; font-weight: 700; letter-spacing: -.01em; color: var(--ink) }
.sp-yinyang__label span { display: block; margin-top: 4px; font-size: .78rem; color: var(--muted); line-height: 1.45 }
@media (max-width: 680px) {
  .sp-yinyang { flex-direction: column }
  .sp-yinyang__svg { order: -1 }
  .sp-yinyang__label { width: 100%; justify-content: center; text-align: left }
  .sp-yinyang__label--red { flex-direction: row }
}

/* Our-goal points — inline, not boxed cards */
.sp-mag__points { display: flex; flex-direction: column; gap: 18px; margin-top: 8px }
.sp-mag__point { display: flex; gap: 14px; align-items: flex-start }
.sp-mag__point-icon { flex-shrink: 0; width: 34px; height: 34px; border-radius: 10px; background: var(--accent-soft); color: var(--accent-deep); display: flex; align-items: center; justify-content: center; margin-top: 2px }
.sp-mag__point strong { display: block; font-size: .98rem; font-weight: 650; color: var(--ink) }
.sp-mag__point span { display: block; margin-top: 4px; font-size: .92rem; color: var(--muted); line-height: 1.6 }
      `}</style>
    </SiteChrome>
  );
}

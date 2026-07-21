"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Brain, ShieldCheck, Swords, Zap } from "lucide-react";
import { SiteChrome, BOOKING_URL } from "./chrome";

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
  const threadRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const thread = threadRef.current;
        const fill = fillRef.current;
        if (!thread || !fill) return;
        const rect = thread.getBoundingClientRect();
        const startLine = window.innerHeight * 0.85;
        const endLine = window.innerHeight * 0.4;
        const progress = (startLine - rect.top) / (rect.height + startLine - endLine);
        fill.style.height = `${Math.min(1, Math.max(0, progress)) * 100}%`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <SiteChrome active="about">
      <div className="sp-story">
        {/* ═══════════ INTRO ═══════════ */}
        <div className="sp-story__intro" data-r>
          <h1>Blue team. Red team. One discipline.</h1>
          <p>
            PurveX helps organizations strengthen their security operations and develop the
            cybersecurity talent needed to support them.
          </p>
        </div>

        <div className="sp-story__thread" ref={threadRef}>
          <div className="sp-story__thread-fill" ref={fillRef} aria-hidden />
          {/* ═══════════ 01 — HOW WE THINK ═══════════ */}
          <section id="how-we-think" className="sp-story__chapter" data-r>
            <span className="sp-story__num">01</span>
            <span className="sp-story__label">How we think</span>
            <p className="sp-story__pull">
              You cannot defend against tactics you do not understand.
            </p>
            <p>
              PurveX is built on the blend of blue team and red team thinking. Understanding both
              sides is what makes a stronger analyst, and it shapes everything we do.
            </p>

            <div className="sp-versus">
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

            <p>
              We do not train one side and hope it holds up against the other. We build analysts,
              and run operations, that understand both.
            </p>
            <p className="sp-story__wink">With great visibility comes great responsibility.</p>
          </section>

          {/* ═══════════ 02 — OUR GOAL ═══════════ */}
          <section className="sp-story__chapter" data-r>
            <span className="sp-story__num">02</span>
            <span className="sp-story__label">Our goal</span>
            <p className="sp-story__pull">
              Automate what can be automated. Never stop understanding it.
            </p>
            <p>
              A lot of what happens in a SOC is repeatable, and repeatable work should be
              automated, not repeated by hand forever. Our number one goal is to solve the
              problems in security operations that can be automated, and build a better way of
              doing what is left, without losing the people who have to run it.
            </p>
            <div className="sp-story__points">
              {goals.map((g) => (
                <div key={g.title} className="sp-story__point">
                  <div className="sp-story__point-icon">
                    <g.icon size={17} />
                  </div>
                  <div>
                    <strong>{g.title}</strong>
                    <span>{g.body}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ═══════════ 03 — WHO WE ARE ═══════════ */}
          <section id="who-we-are" className="sp-story__chapter" data-r>
            <span className="sp-story__num">03</span>
            <span className="sp-story__label">Who we are</span>
            <p className="sp-story__pull">No layer between the work and the person doing it.</p>
            <p>
              PurveX stays close to the work. The person running your security operations is the
              same one teaching in the field, not an account manager relaying between you and
              the work. That is not a feature we added. It is how we think a company like this
              should be run.
            </p>
            <p>The best way to see if we are a fit is a real conversation, not a pitch.</p>

            <div className="sp-founder-card">
              <Image
                src="/Justin.jpg"
                alt="Justin Duru"
                width={64}
                height={64}
                className="sp-founder-card__avatar sp-founder-card__avatar--photo"
              />
              <div className="sp-founder-card__info">
                <strong>Justin Duru</strong>
                <span>Founder &amp; Lead Security Consultant</span>
                <div className="sp-founder-card__chips">
                  <span className="sp-founder-card__chip">SOC Analyst → Instructor</span>
                  <span className="sp-founder-card__chip">Sentinel &amp; SOAR</span>
                  <span className="sp-founder-card__chip">CySA+ · Security+</span>
                </div>
                <p className="sp-founder-card__quote">
                  I lead by serving the work, not standing above it.
                </p>
              </div>
            </div>

            <p>
              Before this was a company, it was time spent tuning Microsoft Sentinel detections
              for a federal agency, automating response workflows in Splunk SOAR, and teaching
              SOC fundamentals to analysts at Ellington Cyber Academy. All of that taught me the
              same lesson from different angles: real growth comes from hands-on repetition, not
              from watching someone else do the work.
            </p>
            <p>
              Hands-on alone is not enough, though. In an age where AI can write the query and
              summarize the alert for you, the skill that actually matters is knowing how to
              think: how to interpret what a system is telling you, when to trust it, and when to
              push back. That is what I try to teach, not shortcuts to capture a flag, but the
              judgment to actually solve the problem.
            </p>
            <p>
              That belief is also why PurveX exists. I kept running into the same gap: smaller
              security teams know they need stronger coverage, but do not have the headcount to
              build and maintain it by hand. I believe AI agents, paired with someone who still
              understands what is happening underneath them, can close that gap without requiring
              every team to be enterprise-sized to be secure.
            </p>

            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-story__link">
              Talk to us <ArrowRight size={14} />
            </a>
          </section>

          {/* ═══════════ 04 — LOOKING AHEAD ═══════════ */}
          <section id="looking-ahead" className="sp-story__chapter" data-r>
            <span className="sp-story__num">04</span>
            <span className="sp-story__label">Looking ahead</span>
            <p className="sp-story__pull">Proof, not assumed coverage.</p>
            <p>
              PurveX is exploring new ways to help security teams continuously measure and
              validate their detection capabilities: technology that helps organizations move
              beyond assumed security coverage toward measurable evidence that their detections
              work when they are needed.
            </p>
            <Link href="/platform" className="sp-story__link">
              Explore PurveX Labs <ArrowRight size={14} />
            </Link>
          </section>
        </div>
      </div>

      <style>{`
.sp-story { max-width: 700px; margin: 0 auto; padding-top: 132px }
.sp-story__intro h1 { margin: 0; font-family: var(--font-display); font-size: clamp(2.3rem, 4.6vw, 3.4rem); font-weight: 700; line-height: 1.1; letter-spacing: -.03em; color: var(--ink); text-wrap: balance }
.sp-story__intro p { margin: 22px 0 0; font-size: 1.1rem; line-height: 1.7; color: var(--ink-soft); max-width: 560px }

.sp-story__thread { position: relative; margin-top: 96px; padding-left: 52px }
.sp-story__thread::before { content: ""; position: absolute; left: 19px; top: 6px; bottom: 6px; width: 2px; background: linear-gradient(var(--border-strong), var(--border) 85%, transparent) }
.sp-story__thread-fill { position: absolute; left: 19px; top: 6px; width: 2px; height: 0%; border-radius: 2px; background: linear-gradient(var(--accent), var(--accent-deep)); box-shadow: 0 0 12px rgba(106,92,255,.5); transition: height .15s linear }
.sp-story__chapter { position: relative; margin-bottom: 88px }
.sp-story__chapter:last-child { margin-bottom: 0 }
.sp-story__num { position: absolute; left: -52px; top: -4px; width: 40px; height: 40px; border-radius: 50%; background: var(--surface); border: 2px solid var(--accent-deep); color: var(--accent-deep); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; font-size: .9rem; transition: background .4s var(--ease), color .4s var(--ease), transform .4s var(--ease), box-shadow .4s var(--ease) }
.sp-story__chapter.in .sp-story__num { background: var(--accent-deep); color: #fff; transform: scale(1.08); box-shadow: 0 6px 18px -6px rgba(85,70,224,.6) }

/* ── Alternating sides on wide screens: line down the middle, chapters left/right ── */
@media (min-width: 861px) {
  .sp-story { max-width: 960px }
  .sp-story__thread { padding-left: 0; margin-top: 64px }
  .sp-story__thread::before { left: 50%; transform: translateX(-50%) }
  .sp-story__thread-fill { left: 50%; transform: translateX(-50%) }
  .sp-story__chapter { width: calc(50% - 40px) }
  .sp-story__chapter:nth-of-type(odd) { margin-left: 0 }
  .sp-story__chapter:nth-of-type(even) { margin-left: calc(50% + 40px) }
  .sp-story__chapter:nth-of-type(odd) .sp-story__num { left: auto; right: -60px }
  .sp-story__chapter:nth-of-type(even) .sp-story__num { left: -60px; right: auto }
}
@media (prefers-reduced-motion: reduce) { .sp-story__thread-fill { transition: none } }
.sp-story__label { display: block; font-size: .74rem; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep) }
.sp-story__pull { margin: 14px 0 0; padding-left: 20px; border-left: 3px solid var(--accent); font-family: var(--font-display); font-size: clamp(1.2rem, 2.4vw, 1.5rem); font-weight: 650; letter-spacing: -.015em; line-height: 1.4; color: var(--ink) }
.sp-story__chapter > p:not(.sp-story__pull):not(.sp-story__wink) { margin: 20px 0 0; font-size: 1.02rem; line-height: 1.78; color: var(--ink-soft); max-width: 600px }
.sp-story__wink { margin: 16px 0 0; font-size: .86rem; font-style: italic; color: var(--muted) }
.sp-story__link { display: inline-flex; align-items: center; gap: 8px; margin-top: 22px; font-size: .92rem; font-weight: 650; color: var(--accent-deep); text-decoration: none; transition: gap .25s var(--ease) }
.sp-story__link:hover { gap: 12px }
.sp-founder-card {
  display: flex; align-items: flex-start; gap: 20px;
  margin-top: 32px; padding: 26px 28px;
  border-radius: 20px;
  background: linear-gradient(135deg, var(--accent-soft), transparent 70%);
  border: 1px solid rgba(106,92,255,.2);
}
.sp-founder-card__avatar { width: 64px; height: 64px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 12px 26px -8px rgba(85,70,224,.55) }
.sp-founder-card__avatar--photo { object-fit: cover }
.sp-founder-card__info { display: flex; flex-direction: column }
.sp-founder-card__info strong { font-size: 1.05rem; font-weight: 700; color: var(--ink) }
.sp-founder-card__info > span { margin-top: 2px; font-size: .86rem; color: var(--muted) }
.sp-founder-card__chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px }
.sp-founder-card__chip { font-size: .72rem; font-weight: 600; color: var(--accent-deep); background: var(--surface); border: 1px solid rgba(106,92,255,.25); border-radius: 999px; padding: 4px 11px }
.sp-founder-card__quote { margin: 14px 0 0; font-size: .88rem; font-style: italic; color: var(--ink-soft); line-height: 1.6 }
@media (max-width: 560px) {
  .sp-founder-card { flex-direction: column; align-items: flex-start; gap: 14px }
}

/* Blue vs red — a lighter, inline version of the shared card treatment */
.sp-versus { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px; margin-top: 28px }
.sp-versus__side { --cut: 14px; padding: 26px 22px; clip-path: polygon(var(--cut) 0, 100% 0, 100% calc(100% - var(--cut)), calc(100% - var(--cut)) 100%, 0 100%, 0 var(--cut)); text-align: center; transition: transform .3s var(--ease) }
.sp-versus__side:hover { transform: translateY(-3px) }
.sp-versus__side--blue { background: linear-gradient(160deg, var(--accent-soft), #ffffff); border: 1px solid rgba(106,92,255,.25) }
.sp-versus__side--red { background: linear-gradient(160deg, rgba(229,72,77,.08), #ffffff); border: 1px solid rgba(229,72,77,.22) }
.sp-versus__icon { display: inline-flex; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px; margin-bottom: 12px }
.sp-versus__side--blue .sp-versus__icon { background: var(--accent-soft); color: var(--accent-deep) }
.sp-versus__side--red .sp-versus__icon { background: rgba(229,72,77,.12); color: var(--red) }
.sp-versus__label { display: block; font-family: var(--font-display); font-size: .98rem; font-weight: 700; letter-spacing: -.01em; color: var(--ink) }
.sp-versus__side p { margin: 6px 0 0; font-size: .82rem; color: var(--muted); line-height: 1.5 }
.sp-versus__mid { display: flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 50%; background: var(--surface); border: 1px solid var(--border-strong); font-family: var(--font-display); font-weight: 700; font-size: 1.15rem; color: var(--muted-dim); flex-shrink: 0 }

/* Our-goal points — inline, not boxed cards */
.sp-story__points { display: flex; flex-direction: column; gap: 18px; margin-top: 24px }
.sp-story__point { display: flex; gap: 14px; align-items: flex-start }
.sp-story__point-icon { flex-shrink: 0; width: 34px; height: 34px; border-radius: 10px; background: var(--accent-soft); color: var(--accent-deep); display: flex; align-items: center; justify-content: center; margin-top: 2px }
.sp-story__point strong { display: block; font-size: .98rem; font-weight: 650; color: var(--ink) }
.sp-story__point span { display: block; margin-top: 4px; font-size: .92rem; color: var(--muted); line-height: 1.6 }

@media (max-width: 680px) {
  .sp-story { padding-top: 72px }
  .sp-story__thread { padding-left: 40px; margin-top: 64px }
  .sp-story__thread::before, .sp-story__thread-fill { left: 15px }
  .sp-story__num { left: -40px; width: 32px; height: 32px; font-size: .78rem }
  .sp-story__chapter { margin-bottom: 64px }
  .sp-versus { grid-template-columns: 1fr; gap: 10px }
  .sp-versus__mid { justify-self: center }
}
      `}</style>
    </SiteChrome>
  );
}

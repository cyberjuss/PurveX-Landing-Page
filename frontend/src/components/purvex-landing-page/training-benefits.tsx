"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { SKILLS, type Skill } from "@/lib/academy-score";
import type { CourseOutline } from "./training-page";

/* One ticket, four benefits. The ticket on the left changes state as each
   benefit on the right scrolls into view: Open, Verified, Coached, Proven. */

const SAMPLE_SCORES: Record<Skill, number> = { accounts: 92, directory: 78, troubleshooting: 88, security: 61 };

const STAGES = ["Open", "Verified", "Coached", "Proven"] as const;

const BLOCKS = [
  {
    title: "Real work, not slides",
    body: "Students build their own company network and work live tickets against it.",
  },
  {
    title: "Proof in the directory",
    body: "A ticket closes only when the directory shows the change, so results are verified instead of self-reported.",
  },
  {
    title: "A coach that guides",
    body: "Coach reads the student's own lab and teaches the method without giving the answer.",
  },
  {
    title: "A score employers trust",
    body: "Every result feeds a readiness score, verified tasks, and resume lines from closed tickets.",
  },
];

function TicketBody({ stage }: { stage: number }) {
  if (stage === 0) {
    return (
      <>
        <dl className="bn-grid">
          <div><dt>Account</dt><dd>riley.kwan</dd></div>
          <div><dt>Host</dt><dd>OPS-WKS03</dd></div>
          <div><dt>Seen</dt><dd>07:14</dd></div>
          <div><dt>Event</dt><dd>4740</dd></div>
        </dl>
        <p className="bn-ask">Open the account before you change anything.</p>
      </>
    );
  }
  if (stage === 1) {
    return (
      <ul className="bn-checks">
        <li><Check size={14} /> Account is enabled</li>
        <li><Check size={14} /> Sign-in is restored</li>
        <li><Check size={14} /> The change is seen in the directory</li>
      </ul>
    );
  }
  if (stage === 2) {
    return (
      <div className="bn-coach">
        <span><i /> Coach</span>
        <p>Check the Account tab first. What does it tell you about why the user cannot sign in?</p>
        <p className="bn-coach__check"><b>Check:</b> you can name the cause without guessing.</p>
      </div>
    );
  }
  return (
    <>
      <ul className="bn-bars">
        {(Object.keys(SKILLS) as Skill[]).map((k) => (
          <li key={k}>
            <span>{SKILLS[k].label}</span>
            <b>{SAMPLE_SCORES[k]}</b>
            <i style={{ ["--w" as string]: `${SAMPLE_SCORES[k]}%` }} />
          </li>
        ))}
      </ul>
      <p className="bn-resume">Resume line added: restored a locked-out account in Active Directory Users and Computers (INC-1042).</p>
    </>
  );
}

export function TrainingBenefits({ outline }: { outline: CourseOutline }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const nodes = refs.current.filter((n): n is HTMLLIElement => Boolean(n));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i));
        }
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: 0 },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  return (
    <div className="bn">
      <div className="bn__stick" aria-hidden="true">
        <article className="bn-ticket" data-stage={active}>
          <header>
            <span>INC-1042</span>
            <em key={active}>{STAGES[active]}</em>
          </header>
          <h3>Locked out</h3>
          <div className="bn-body" key={active}>
            <TicketBody stage={active} />
          </div>
        </article>
        <ol className="bn-rail">
          {STAGES.map((s, i) => (
            <li key={s} data-on={i <= active}>
              <i />
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <ol className="bn__list">
        {BLOCKS.map((b, i) => (
          <li
            key={b.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-i={i}
            data-on={i === active}
          >
            <span className="bn__n">{String(i + 1).padStart(2, "0")}</span>
            <h3>{b.title}</h3>
            <p>{b.body}</p>
            {i === 0 && (
              <ul className="bn__phases">
                {outline.map((p) => (
                  <li key={p.title}>{p.title}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export const BENEFITS_CSS = `
.bn { display: grid; grid-template-columns: .9fr 1.1fr; gap: 88px; align-items: start }
.bn__stick { position: sticky; top: 120px }
.bn-ticket {
  position: relative; background: #fff; border-radius: 22px; padding: 22px 26px 26px; border: 1px solid var(--border-strong);
  box-shadow: 0 40px 80px -40px rgba(42,34,128,.55); min-height: 340px; overflow: hidden;
}
.bn-ticket::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: linear-gradient(180deg, #7b6dff, #3d32b0) }
.bn-ticket header { display: flex; align-items: center; justify-content: space-between }
.bn-ticket header span { font-family: var(--font-mono); font-size: .66rem; font-weight: 700; letter-spacing: .1em; color: var(--accent-deep) }
.bn-ticket header em {
  font-style: normal; padding: 4px 12px; border-radius: 999px; background: var(--accent-soft); color: var(--accent-deep);
  font-family: var(--font-mono); font-size: .6rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; animation: bn-pop .4s var(--ease) both;
}
.bn-ticket[data-stage="1"] header em, .bn-ticket[data-stage="3"] header em { background: #e3f6ee; color: #12805a }
.bn-ticket h3 { margin: 16px 0 0; font-family: var(--font-display); font-size: 1.9rem; font-weight: 700; letter-spacing: -.035em }
.bn-body { margin-top: 20px; animation: bn-in .45s var(--ease) both }
.bn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px; margin: 0; padding-top: 18px; border-top: 1px solid var(--border) }
.bn-grid dt { font-family: var(--font-mono); font-size: .58rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--muted) }
.bn-grid dd { margin: 4px 0 0; font-family: var(--font-mono); font-size: .84rem; font-weight: 650; color: var(--ink) }
.bn-ask { margin: 20px 0 0; padding: 12px 14px; background: var(--accent-soft); font-size: .9rem; font-weight: 600; color: var(--accent-deep) }
.bn-checks { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--border) }
.bn-checks li { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border); font-size: .95rem; color: var(--ink) }
.bn-checks li svg { flex: none; width: 24px; height: 24px; padding: 5px; border-radius: 50%; background: #e3f6ee; color: #12805a }
.bn-coach { padding: 16px 18px; border-radius: 16px; background: linear-gradient(135deg, #f7f5ff, #fff 80%); border: 1px solid rgba(106,92,255,.18) }
.bn-coach > span { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: .62rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--accent-deep) }
.bn-coach > span i { width: 7px; height: 7px; border-radius: 50%; background: var(--accent) }
.bn-coach p { margin: 10px 0 0; font-size: .96rem; line-height: 1.6; color: var(--ink) }
.bn-coach__check { padding-top: 10px; border-top: 1px solid rgba(106,92,255,.16); color: var(--accent-deep) !important }
.bn-bars { list-style: none; margin: 0; padding: 0; display: grid; gap: 12px }
.bn-bars li { display: grid; grid-template-columns: 1fr auto; gap: 5px 10px; font-size: .84rem; color: var(--ink-soft) }
.bn-bars b { font-family: var(--font-mono); font-size: .76rem; color: var(--ink) }
.bn-bars i { grid-column: 1 / -1; position: relative; height: 6px; border-radius: 999px; background: var(--accent-soft); overflow: hidden }
.bn-bars i::after { content: ""; position: absolute; inset: 0 auto 0 0; width: var(--w); border-radius: 999px; background: linear-gradient(90deg, #8b7fff, var(--accent)); transform-origin: left; animation: bn-fill 1s var(--ease) both }
.bn-resume { margin: 18px 0 0; padding-top: 14px; border-top: 1px solid var(--border); font-size: .86rem; line-height: 1.55; color: var(--ink-soft) }
.bn-rail { list-style: none; margin: 26px 0 0; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); position: relative }
.bn-rail::before { content: ""; position: absolute; top: 5px; left: 12.5%; right: 12.5%; height: 2px; background: var(--border-strong) }
.bn-rail li { position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: .58rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--muted-dim); transition: color .3s var(--ease) }
.bn-rail li i { width: 12px; height: 12px; border-radius: 50%; background: #fff; border: 2px solid var(--border-strong); transition: background .3s var(--ease), border-color .3s var(--ease) }
.bn-rail li[data-on="true"] { color: var(--accent-deep) }
.bn-rail li[data-on="true"] i { background: var(--accent); border-color: var(--accent) }
.bn__list { list-style: none; margin: 0; padding: 0 }
.bn__list > li { min-height: 58vh; display: flex; flex-direction: column; justify-content: center; opacity: .32; transition: opacity .4s var(--ease) }
.bn__list > li[data-on="true"] { opacity: 1 }
.bn__list > li:first-child { min-height: 46vh; justify-content: flex-start; padding-top: 12px }
.bn__n { font-family: var(--font-mono); font-size: .74rem; font-weight: 700; letter-spacing: .1em; color: var(--accent-deep) }
.bn__list h3 { margin: 12px 0 0; font-family: var(--font-display); font-size: clamp(1.9rem, 3.6vw, 2.8rem); font-weight: 700; letter-spacing: -.04em; line-height: 1.06; max-width: 14ch; color: var(--ink) }
.bn__list p { margin: 16px 0 0; max-width: 40ch; font-size: 1.08rem; line-height: 1.65; color: var(--ink-soft) }
.bn__phases { list-style: none; margin: 22px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px }
.bn__phases li { padding: 7px 13px; border-radius: 999px; background: #fff; border: 1px solid rgba(106,92,255,.2); font-size: .8rem; font-weight: 550; color: var(--accent-deep) }
@keyframes bn-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes bn-pop { from { opacity: 0; transform: scale(.9) } to { opacity: 1; transform: none } }
@keyframes bn-fill { from { transform: scaleX(0) } to { transform: none } }
@media (prefers-reduced-motion: reduce) { .bn-body, .bn-ticket header em, .bn-bars i::after { animation: none } .bn__list > li { transition: none } }
@media (max-width: 980px) {
  .bn { grid-template-columns: 1fr; gap: 0 }
  .bn__stick { display: none }
  .bn__list > li, .bn__list > li:first-child { min-height: 0; opacity: 1; padding: 30px 0; border-top: 1px solid var(--border-strong) }
  .bn__list h3 { max-width: none }
}
`;

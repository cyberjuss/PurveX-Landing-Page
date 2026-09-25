"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import { LEVELS, SKILLS, type Skill } from "@/lib/academy-score";
import { IconCampus, IconCivic, IconGraduate, type BrandIcon } from "./brand-icons";

/* Who the training is for. The visitor picks who they are; the panel then
   shows how it works for them, step by step, with a small example of what
   they would see in the portal. Every figure is labeled as an example. */

type Key = "students" | "schools" | "employers";

type Audience = {
  key: Key;
  Icon: BrandIcon;
  pick: string;
  who: string;
  short: string;
  headline: string;
  sub: string;
  steps: string[];
  footLabel: string;
  foot: string[];
};

const AUDIENCES: Audience[] = [
  {
    key: "students",
    Icon: IconGraduate,
    pick: "I'm learning cybersecurity",
    who: "Students and career changers",
    short: "Students",
    headline: "Get the experience the first job asks for",
    sub: "Practice the real work before anyone is paying you to do it.",
    steps: [
      "Join with your class passcode",
      "Build your own company network",
      "Fix tickets and stop an attack, with Coach when you get stuck",
      "Finish with a score you can show employers",
    ],
    footLabel: "Prepares you for",
    foot: ["IT help desk", "IT support", "Junior security analyst"],
  },
  {
    key: "schools",
    Icon: IconCampus,
    pick: "I run a school or program",
    who: "Schools and workforce programs",
    short: "Schools",
    headline: "One course for the whole class",
    sub: "Every student gets the same hands-on course, and you see how each one is doing.",
    steps: [
      "Book a short call to plan your class",
      "Get a class passcode for your students",
      "Each student builds a lab on their own computer",
      "Follow every student's progress and readiness",
    ],
    footLabel: "Good to know",
    foot: ["No servers to set up", "Same lessons and labs for all", "A report for every student"],
  },
  {
    key: "employers",
    Icon: IconCivic,
    pick: "I hire or lead a team",
    who: "Employers and public agencies",
    short: "Employers",
    headline: "See who is ready before they start",
    sub: "Train new hires or upskill a team on the tasks they will actually do.",
    steps: [
      "Book a short call about your team",
      "Enroll new hires or current staff",
      "They practice real tasks in their own lab",
      "Review each person's skills and mock interview",
    ],
    footLabel: "Built for roles like",
    foot: ["Help desk", "IT support", "Security operations"],
  },
];

/* ---------- example cards ---------- */

function StudentCard() {
  const steps = [
    { done: true, text: "Company network built" },
    { done: true, text: "First help desk tickets fixed" },
    { done: false, text: `Readiness 72, ${LEVELS.almost.label}` },
  ];
  return (
    <article className="ta-card">
      <header><strong>My progress</strong><em>Example</em></header>
      <ol className="ta-steps">
        {steps.map((s) => (
          <li key={s.text} data-done={s.done ? "1" : "0"}>
            <i>{s.done ? <Check size={13} strokeWidth={3} /> : null}</i>
            {s.text}
          </li>
        ))}
      </ol>
      <p className="ta-coach">
        <b>Coach</b>
        Nice work. Next, find out why that account locked in the first place.
      </p>
    </article>
  );
}

const CLASS = [
  { name: "Amara O.", weeks: 6, level: "Ready" },
  { name: "Diego R.", weeks: 5, level: "Almost Ready" },
  { name: "Priya S.", weeks: 4, level: "In progress" },
  { name: "Tom W.", weeks: 6, level: "Ready" },
];

function ClassCard() {
  return (
    <article className="ta-card">
      <header><strong>Class progress</strong><em>Example</em></header>
      <ul className="ta-class">
        {CLASS.map((s) => (
          <li key={s.name}>
            <i>{s.name.split(" ").map((p) => p[0]).join("")}</i>
            <span>{s.name}</span>
            <ol aria-label={`${s.weeks} of 6 weeks done`}>
              {Array.from({ length: 6 }, (_, n) => <li key={n} data-on={n < s.weeks ? "1" : "0"} />)}
            </ol>
            <em data-ready={s.level === "Ready" ? "1" : "0"}>{s.level}</em>
          </li>
        ))}
      </ul>
    </article>
  );
}

const SCORES: Record<Skill, number> = { accounts: 92, directory: 78, troubleshooting: 88, security: 61 };

function CandidateCard() {
  return (
    <article className="ta-card">
      <header><strong>Team member report</strong><em>Example</em></header>
      <div className="ta-cand">
        <b>JM</b>
        <div>
          <strong>Jordan M.</strong>
          <span>Readiness 72, {LEVELS.almost.label}</span>
        </div>
      </div>
      <ul className="ta-skills">
        {(Object.keys(SKILLS) as Skill[]).map((k) => (
          <li key={k}>
            <span>{SKILLS[k].label}</span>
            <b>{SCORES[k]}</b>
            <i style={{ ["--w" as string]: `${SCORES[k]}%` }} />
          </li>
        ))}
      </ul>
      <p className="ta-mini"><Check size={14} strokeWidth={3} /> Mock interview: 4 of 5</p>
    </article>
  );
}

const CARDS: Record<Key, () => ReactNode> = {
  students: StudentCard,
  schools: ClassCard,
  employers: CandidateCard,
};

/* ---------- section ---------- */

export function TrainingAudiences() {
  const [i, setI] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const a = AUDIENCES[i];
  const Card = CARDS[a.key];

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + AUDIENCES.length) % AUDIENCES.length;
    setI(n);
    tabs.current[n]?.focus();
  }

  return (
    <div className="ta">
      <div className="ta-side">
        <h2>Built for learners and the teams that train them</h2>
        <div className="ta-pick" role="tablist" aria-label="Who it is for" aria-orientation="vertical" onKeyDown={onKey}>
          {AUDIENCES.map((t, n) => (
            <button
              key={t.key}
              ref={(el) => { tabs.current[n] = el; }}
              type="button"
              role="tab"
              id={`ta-tab-${t.key}`}
              aria-selected={n === i}
              aria-controls="ta-panel"
              tabIndex={n === i ? 0 : -1}
              onClick={() => setI(n)}
            >
              <i><t.Icon size={22} /></i>
              <span>
                <strong><span className="ta-long">{t.pick}</span><span className="ta-short">{t.short}</span></strong>
                <em>{t.who}</em>
              </span>
              <ArrowRight size={18} className="ta-pick__arrow" />
            </button>
          ))}
        </div>
      </div>

      <div className="ta-panel" role="tabpanel" id="ta-panel" aria-labelledby={`ta-tab-${a.key}`}>
        <div className="ta-panel__head" key={`h-${a.key}`}>
          <h3>{a.headline}</h3>
          <p>{a.sub}</p>
        </div>

        <div className="ta-panel__body">
          <div className="ta-how" key={`s-${a.key}`}>
            <span>How it works</span>
            <ol>
              {a.steps.map((s, n) => (
                <li key={s} style={{ ["--n" as string]: n }}>
                  <i>{n + 1}</i>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="ta-stage" key={`v-${a.key}`}>
            <Card />
          </div>
        </div>

        <footer className="ta-panel__foot" key={`f-${a.key}`}>
          <span>{a.footLabel}</span>
          <ul>
            {a.foot.map((f) => <li key={f}>{f}</li>)}
          </ul>
        </footer>
      </div>

      <style>{TA_CSS}</style>
    </div>
  );
}

const TA_CSS = `
.ta { display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); gap: 32px 48px; align-items: start }
.ta-side { position: sticky; top: 104px }
.ta-side h2 {
  margin: 0; font-family: var(--font-display); font-weight: 700; letter-spacing: -.022em; line-height: 1.15;
  font-size: clamp(1.6rem, 2.6vw, 2.1rem); color: var(--ink); text-wrap: balance;
}

/* picker */
.ta-pick { display: flex; flex-direction: column; gap: 6px; margin-top: 28px }
.ta-pick button {
  position: relative; display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 14px;
  min-height: 72px; padding: 14px 16px; text-align: left; background: transparent; border: 1px solid transparent; cursor: pointer; color: var(--ink);
  transition: background .3s var(--ease), border-color .3s var(--ease), box-shadow .3s var(--ease);
}
.ta-pick button::before { content: ""; position: absolute; left: -1px; top: -1px; bottom: -1px; width: 3px; background: var(--accent); transform: scaleY(0); transition: transform .35s cubic-bezier(.16,1,.3,1) }
.ta-pick button:hover { background: rgba(106,92,255,.05) }
.ta-pick button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
.ta-pick button > i {
  display: grid; place-items: center; width: 44px; height: 44px; background: var(--accent-soft); color: var(--accent-deep);
  transition: background .3s var(--ease), color .3s var(--ease);
}
.ta-pick button > i svg, .ta-pick__arrow { position: static }
.ta-pick strong { display: block; font-family: var(--font-display); font-size: 1.08rem; font-weight: 600; letter-spacing: -.02em; line-height: 1.25; color: var(--ink-soft); transition: color .3s var(--ease) }
.ta-pick em { display: block; margin-top: 2px; font-style: normal; font-size: .84rem; color: var(--muted) }
.ta-pick__arrow { color: var(--accent-deep); opacity: 0; transform: translateX(-6px); transition: opacity .3s var(--ease), transform .3s var(--ease) }
.ta-short { display: none }
.ta-pick button[aria-selected="true"] { background: #fff; border-color: var(--border); box-shadow: 0 18px 36px -26px rgba(42,34,128,.45) }
.ta-pick button[aria-selected="true"]::before { transform: scaleY(1) }
.ta-pick button[aria-selected="true"] > i { background: var(--accent); color: #fff }
.ta-pick button[aria-selected="true"] strong { color: var(--ink) }
.ta-pick button[aria-selected="true"] .ta-pick__arrow { opacity: 1; transform: none }

/* panel */
.ta-panel {
  position: relative; padding: clamp(24px, 3.4vw, 40px); background: #fff; border: 1px solid rgba(85,70,224,.16);
  box-shadow: 0 40px 80px -48px rgba(42,34,128,.45), 0 10px 22px -18px rgba(42,34,128,.2);
}
.ta-panel::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 4px; background: linear-gradient(90deg, #2a2280, var(--accent)) }
.ta-panel__head { animation: ta-in .45s cubic-bezier(.16,1,.3,1) both }
.ta-panel h3 {
  margin: 0; max-width: 22ch; font-family: var(--font-display); font-weight: 700; letter-spacing: -.03em; line-height: 1.1;
  font-size: clamp(1.6rem, 2.8vw, 2.3rem); color: var(--ink); text-wrap: balance;
}
.ta-panel__head p { margin: 10px 0 0; max-width: 52ch; color: var(--ink-soft); font-size: 1.02rem; line-height: 1.55 }
.ta-panel__body { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 360px); gap: 28px; align-items: stretch; margin-top: 28px }

.ta-how > span { display: block; font-size: .82rem; font-weight: 650; color: var(--accent-deep) }
.ta-how ol { position: relative; list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 18px }
.ta-how ol::before { content: ""; position: absolute; left: 15px; top: 16px; bottom: 16px; width: 2px; background: rgba(106,92,255,.2) }
.ta-how li {
  position: relative; display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 14px;
  font-size: .98rem; line-height: 1.45; color: var(--ink);
  animation: ta-in .45s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--n) * 70ms + 60ms);
}
.ta-how li i {
  position: relative; display: grid; place-items: center; width: 32px; height: 32px; font-style: normal; font-size: .86rem; font-weight: 700;
  background: #fff; border: 2px solid var(--accent); color: var(--accent-deep);
}
.ta-how li:last-child i { background: var(--accent); color: #fff }

.ta-stage {
  display: flex; align-items: center; justify-content: center; padding: 22px;
  background: repeating-linear-gradient(135deg, rgba(106,92,255,.09) 0 1px, transparent 1px 10px), var(--accent-soft);
  animation: ta-in .5s .08s cubic-bezier(.16,1,.3,1) both;
}

.ta-panel__foot { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-top: 26px; padding-top: 20px; border-top: 1px solid var(--border); animation: ta-in .45s .2s cubic-bezier(.16,1,.3,1) both }
.ta-panel__foot > span { font-size: .86rem; font-weight: 650; color: var(--ink) }
.ta-panel__foot ul { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; margin: 0; padding: 0 }
.ta-panel__foot li { padding: 6px 12px; border: 1px solid rgba(106,92,255,.28); background: #fff; font-size: .86rem; font-weight: 600; color: var(--accent-deep) }

/* example card */
.ta-card { width: 100%; padding: 18px 18px 16px; background: #fff; color: var(--ink); box-shadow: 0 24px 48px -26px rgba(42,34,128,.5) }
.ta-card header { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-bottom: 12px; border-bottom: 1px solid var(--border) }
.ta-card header strong { font-family: var(--font-display); font-weight: 600; font-size: 1rem; letter-spacing: -.02em }
.ta-card header em { padding: 3px 8px; font-style: normal; font-size: .7rem; font-weight: 700; color: var(--accent-deep); background: var(--accent-soft) }

.ta-steps { list-style: none; margin: 12px 0 0; padding: 0; display: flex; flex-direction: column; gap: 10px }
.ta-steps li { display: flex; align-items: center; gap: 10px; font-size: .9rem; color: var(--ink) }
.ta-steps li i { display: grid; place-items: center; width: 24px; height: 24px; flex: none; background: var(--green); color: #fff }
.ta-steps li i svg { position: static }
.ta-steps li[data-done="0"] i { background: #fff; border: 2px solid var(--accent) }
.ta-coach { margin: 14px 0 0; padding: 10px 12px; background: #f4f4fb; border: 1px solid var(--border); font-size: .86rem; line-height: 1.5; color: var(--ink) }
.ta-coach b { display: block; margin-bottom: 2px; font-size: .72rem; color: var(--accent-deep) }

.ta-class { list-style: none; margin: 4px 0 0; padding: 0 }
.ta-class > li { display: grid; grid-template-columns: auto 1fr auto; grid-template-areas: "av name lvl" "av bar lvl"; align-items: center; gap: 4px 10px; padding: 10px 0 }
.ta-class > li + li { border-top: 1px solid var(--border) }
.ta-class > li > i { grid-area: av; display: grid; place-items: center; width: 32px; height: 32px; font-style: normal; font-size: .72rem; font-weight: 700; color: var(--accent-deep); background: var(--accent-soft) }
.ta-class > li > span { grid-area: name; font-size: .88rem; font-weight: 600 }
.ta-class ol { grid-area: bar; display: flex; gap: 3px; list-style: none; margin: 0; padding: 0 }
.ta-class ol li { width: 14px; height: 5px; background: var(--border-strong) }
.ta-class ol li[data-on="1"] { background: var(--accent) }
.ta-class em { grid-area: lvl; font-style: normal; font-size: .74rem; font-weight: 700; color: var(--muted) }
.ta-class em[data-ready="1"] { color: var(--green) }

.ta-cand { display: flex; align-items: center; gap: 12px; margin-top: 12px }
.ta-cand > b { display: grid; place-items: center; width: 38px; height: 38px; font-size: .78rem; color: #fff; background: var(--accent-deep) }
.ta-cand strong { display: block; font-size: .95rem }
.ta-cand span { display: block; font-size: .8rem; color: var(--muted) }
.ta-skills { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 9px }
.ta-skills li { display: grid; grid-template-columns: 1fr auto; gap: 4px 10px; font-size: .82rem; color: var(--ink-soft) }
.ta-skills b { color: var(--ink) }
.ta-skills i { grid-column: 1 / -1; display: block; width: var(--w); height: 4px; background: var(--accent); transform-origin: left; animation: ta-grow .8s .2s cubic-bezier(.16,1,.3,1) both }
.ta-mini { display: flex; align-items: center; gap: 8px; margin: 12px 0 0; padding-top: 10px; border-top: 1px solid var(--border); font-size: .84rem; font-weight: 600; color: var(--ink) }
.ta-mini svg { position: static; color: var(--green) }

@keyframes ta-in { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
@keyframes ta-grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@media (prefers-reduced-motion: reduce) {
  .ta-panel__head, .ta-how li, .ta-stage, .ta-panel__foot, .ta-skills i { animation: none }
  .ta-pick button, .ta-pick button::before, .ta-pick__arrow { transition: none }
}

@media (max-width: 1100px) {
  .ta-panel__body { grid-template-columns: minmax(0, 1fr) }
  .ta-stage { justify-content: stretch }
}
@media (max-width: 900px) {
  .ta { grid-template-columns: minmax(0, 1fr) }
  .ta-side { position: static }
  .ta-pick { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 20px }
  .ta-pick button { grid-template-columns: 1fr; justify-items: center; text-align: center; gap: 8px; min-height: 0; padding: 12px 6px; border-color: var(--border) }
  .ta-pick button::before { left: -1px; right: -1px; top: auto; bottom: -1px; width: auto; height: 3px; transform: scaleX(0) }
  .ta-pick button[aria-selected="true"]::before { transform: scaleX(1) }
  .ta-pick em, .ta-pick__arrow, .ta-long { display: none }
  .ta-short { display: inline }
  .ta-pick strong { font-size: .9rem }
}
@media (max-width: 640px) {
  .ta-pick button > i { width: 38px; height: 38px }
  .ta-panel { padding: 22px 16px }
  .ta-stage { padding: 14px }
}
`;

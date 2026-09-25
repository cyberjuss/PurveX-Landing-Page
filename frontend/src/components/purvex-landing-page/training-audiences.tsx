"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Check } from "lucide-react";
import { LEVELS, SKILLS, type Skill } from "@/lib/academy-score";
import { IconCampus, IconCivic, IconGraduate, type BrandIcon } from "./brand-icons";

/* Who the training is for. The three audience cards are the tabs; each
   opens a panel with what that reader gets and a small example of what
   they would see in the portal. Every figure is labeled as an example. */

type Key = "students" | "schools" | "employers";

const AUDIENCES: {
  key: Key;
  Icon: BrandIcon;
  tab: string;
  short: string;
  hint: string;
  headline: string;
  points: string[];
}[] = [
  {
    key: "students",
    Icon: IconGraduate,
    tab: "Students and career changers",
    short: "Students",
    hint: "Get the experience first",
    headline: "Get the experience the first job asks for",
    points: [
      "Practice on a real company network, not slides",
      "Get unstuck with an AI coach whenever you need it",
      "Finish with a score and real work you can show",
    ],
  },
  {
    key: "schools",
    Icon: IconCampus,
    tab: "Schools and workforce programs",
    short: "Schools",
    hint: "Run one course for the class",
    headline: "One course for the whole class",
    points: [
      "A class passcode gets every student in",
      "Everyone works the same lessons, labs, and drills",
      "Each student gets their own readiness report",
    ],
  },
  {
    key: "employers",
    Icon: IconCivic,
    tab: "Employers and public agencies",
    short: "Employers",
    hint: "See who is ready",
    headline: "See who is ready before they start",
    points: [
      "Train new hires or upskill a whole team",
      "Skills are checked in a lab, not self-reported",
      "Scored mock interviews show how they explain their work",
    ],
  },
];

/* ---------- visuals ---------- */

function StudentCard() {
  const steps = [
    { done: true, text: "Company network built" },
    { done: true, text: "First help desk tickets fixed" },
    { done: false, text: "Readiness: 72 of 100, " + LEVELS.almost.label },
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
        Nice work. Next, let&apos;s figure out why that account locked in the first place.
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
      <p className="ta-foot">Everyone joined with one class passcode.</p>
    </article>
  );
}

const SCORES: Record<Skill, number> = { accounts: 92, directory: 78, troubleshooting: 88, security: 61 };

function CandidateCard() {
  return (
    <article className="ta-card">
      <header><strong>Candidate report</strong><em>Example</em></header>
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
      <p className="ta-foot"><Check size={14} strokeWidth={3} /> Mock interview 4 of 5. Every skill checked in their own lab.</p>
    </article>
  );
}

const VISUALS: Record<Key, () => React.ReactNode> = {
  students: StudentCard,
  schools: ClassCard,
  employers: CandidateCard,
};

/* ---------- section ---------- */

export function TrainingAudiences() {
  const [i, setI] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const a = AUDIENCES[i];
  const Visual = VISUALS[a.key];

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + AUDIENCES.length) % AUDIENCES.length;
    setI(n);
    tabs.current[n]?.focus();
  }

  return (
    <div className="ta">
      <div className="ta-head">
        <h2>Built for learners and the teams that train them</h2>
        <p>Pick who you are to see what you get.</p>
      </div>

      <div className="ta-tabs" role="tablist" aria-label="Who it is for" onKeyDown={onKey}>
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
            <i><t.Icon size={24} /></i>
            <span>
              <strong><span className="ta-long">{t.tab}</span><span className="ta-short">{t.short}</span></strong>
              <em>{t.hint}</em>
            </span>
          </button>
        ))}
      </div>

      <div className="ta-panel" role="tabpanel" id="ta-panel" aria-labelledby={`ta-tab-${a.key}`}>
        <div className="ta-panel__copy" key={`c-${a.key}`}>
          <h3>{a.headline}</h3>
          <ul>
            {a.points.map((p) => (
              <li key={p}>
                <b><Check size={14} strokeWidth={3} /></b>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div className="ta-panel__visual" key={`v-${a.key}`}>
          <Visual />
        </div>
      </div>

      <style>{TA_CSS}</style>
    </div>
  );
}

const TA_CSS = `
.ta-head { max-width: 40rem; margin: 0 0 32px }
.ta-head h2 {
  margin: 0; font-family: var(--font-display); font-weight: 700; letter-spacing: -.022em; line-height: 1.15;
  font-size: clamp(1.6rem, 2.6vw, 2.1rem); color: var(--ink); text-wrap: balance;
}
.ta-head p { margin: 12px 0 0; color: var(--muted); font-size: 1rem; line-height: 1.6 }

/* tabs */
.ta-tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px }
.ta-tabs button {
  position: relative; display: flex; align-items: center; gap: 14px; min-height: 84px; padding: 16px 18px; text-align: left;
  background: #fff; border: 1px solid var(--border-strong); cursor: pointer; color: var(--ink);
  transition: background .3s var(--ease), border-color .3s var(--ease), color .3s var(--ease), transform .2s var(--ease), box-shadow .3s var(--ease);
}
.ta-tabs button:hover { border-color: rgba(106,92,255,.45); transform: translateY(-2px); box-shadow: 0 16px 30px -24px rgba(42,34,128,.5) }
.ta-tabs button:active { transform: scale(.99) }
.ta-tabs button:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px }
.ta-tabs button > i {
  display: grid; place-items: center; width: 48px; height: 48px; flex: none;
  background: var(--accent-soft); color: var(--accent-deep); transition: background .3s var(--ease), color .3s var(--ease);
}
.ta-tabs button > i svg { position: static }
.ta-tabs strong { display: block; font-size: 1rem; font-weight: 650; letter-spacing: -.014em; line-height: 1.25 }
.ta-tabs em { display: block; margin-top: 3px; font-style: normal; font-size: .86rem; color: var(--muted); transition: color .3s var(--ease) }
.ta-short { display: none }
.ta-tabs button[aria-selected="true"] {
  background: #2a2280; border-color: #2a2280; color: #fff; transform: none; box-shadow: none;
}
.ta-tabs button[aria-selected="true"]::after {
  content: ""; position: absolute; left: 50%; bottom: -13px; width: 18px; height: 18px; background: #2a2280;
  transform: translateX(-50%) rotate(45deg);
}
.ta-tabs button[aria-selected="true"] > i { background: rgba(238,240,255,.14); color: #fff }
.ta-tabs button[aria-selected="true"] em { color: rgba(238,240,255,.75) }

/* panel */
.ta-panel {
  position: relative; overflow: hidden; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 440px); gap: 32px 56px; align-items: center;
  min-height: 440px; margin-top: 12px; padding: clamp(28px, 4.5vw, 56px);
  background: radial-gradient(600px circle at 90% 10%, rgba(106,92,255,.55), transparent 60%), linear-gradient(135deg, #2a2280, #3d32b0);
  color: #fff;
}
.ta-panel__copy { animation: ta-in .45s cubic-bezier(.16,1,.3,1) both }
.ta-panel h3 {
  margin: 0; max-width: 18ch; font-family: var(--font-display); font-weight: 700; letter-spacing: -.028em; line-height: 1.1;
  font-size: clamp(1.7rem, 3vw, 2.4rem); color: #fff; text-wrap: balance;
}
.ta-panel__copy ul { list-style: none; margin: 26px 0 0; padding: 0; display: flex; flex-direction: column; gap: 14px }
.ta-panel__copy li { display: flex; align-items: flex-start; gap: 12px; font-size: 1.02rem; line-height: 1.5; color: rgba(238,240,255,.92) }
.ta-panel__copy li b { display: grid; place-items: center; width: 24px; height: 24px; flex: none; margin-top: 1px; background: #fff; color: #2a2280 }
.ta-panel__visual { animation: ta-in .5s .06s cubic-bezier(.16,1,.3,1) both }

/* shared card */
.ta-card { padding: 20px 22px; background: #fff; color: var(--ink); box-shadow: 0 30px 60px -30px rgba(10,8,40,.6) }
.ta-card header { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-bottom: 14px; border-bottom: 1px solid var(--border) }
.ta-card header strong { font-family: var(--font-display); font-weight: 600; font-size: 1.05rem; letter-spacing: -.02em }
.ta-card header em { padding: 3px 8px; font-style: normal; font-size: .72rem; font-weight: 700; color: var(--accent-deep); background: var(--accent-soft) }
.ta-foot { display: flex; align-items: center; gap: 8px; margin: 14px 0 0; padding-top: 12px; border-top: 1px solid var(--border); font-size: .86rem; color: var(--ink-soft) }
.ta-foot svg { flex: none; color: var(--green); position: static }

/* students */
.ta-steps { list-style: none; margin: 14px 0 0; padding: 0; display: flex; flex-direction: column; gap: 12px }
.ta-steps li { display: flex; align-items: center; gap: 12px; font-size: .95rem; color: var(--ink) }
.ta-steps li i { display: grid; place-items: center; width: 26px; height: 26px; flex: none; background: var(--green); color: #fff }
.ta-steps li i svg { position: static }
.ta-steps li[data-done="0"] i { background: #fff; border: 2px solid var(--accent) }
.ta-coach { margin: 16px 0 0; padding: 12px 14px; background: #f4f4fb; border: 1px solid var(--border); font-size: .92rem; line-height: 1.5; color: var(--ink) }
.ta-coach b { display: block; margin-bottom: 2px; font-size: .74rem; color: var(--accent-deep) }

/* schools */
.ta-class { list-style: none; margin: 6px 0 0; padding: 0 }
.ta-class > li { display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 12px; padding: 10px 0 }
.ta-class > li + li { border-top: 1px solid var(--border) }
.ta-class > li > i { display: grid; place-items: center; width: 32px; height: 32px; font-style: normal; font-size: .74rem; font-weight: 700; color: var(--accent-deep); background: var(--accent-soft) }
.ta-class > li > span { font-size: .92rem; font-weight: 600 }
.ta-class ol { display: flex; gap: 3px; list-style: none; margin: 0; padding: 0 }
.ta-class ol li { width: 10px; height: 14px; background: var(--border-strong) }
.ta-class ol li[data-on="1"] { background: var(--accent) }
.ta-class em { min-width: 86px; text-align: right; font-style: normal; font-size: .76rem; font-weight: 700; color: var(--muted) }
.ta-class em[data-ready="1"] { color: var(--green) }

/* employers */
.ta-cand { display: flex; align-items: center; gap: 12px; margin-top: 14px }
.ta-cand > b { display: grid; place-items: center; width: 40px; height: 40px; font-size: .8rem; color: #fff; background: var(--accent-deep) }
.ta-cand strong { display: block; font-size: 1rem }
.ta-cand span { display: block; font-size: .84rem; color: var(--muted) }
.ta-skills { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 10px }
.ta-skills li { display: grid; grid-template-columns: 1fr auto; gap: 5px 10px; font-size: .86rem; color: var(--ink-soft) }
.ta-skills b { color: var(--ink) }
.ta-skills i { grid-column: 1 / -1; display: block; width: var(--w); height: 4px; background: var(--accent); transform-origin: left; animation: ta-grow .8s .15s cubic-bezier(.16,1,.3,1) both }

@keyframes ta-in { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
@keyframes ta-grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@media (prefers-reduced-motion: reduce) {
  .ta-panel__copy, .ta-panel__visual, .ta-skills i { animation: none }
  .ta-tabs button { transition: none }
}

@media (max-width: 900px) {
  .ta-panel { grid-template-columns: minmax(0, 1fr); min-height: 0 }
  .ta-tabs button { flex-direction: column; align-items: flex-start; gap: 10px; min-height: 0 }
  .ta-tabs em { display: none }
  .ta-long { display: none }
  .ta-short { display: inline }
}
@media (max-width: 640px) {
  .ta-tabs { gap: 8px }
  .ta-tabs button { align-items: center; text-align: center; padding: 12px 6px }
  .ta-tabs button > i { width: 40px; height: 40px }
  .ta-tabs strong { font-size: .88rem }
  .ta-panel { padding: 24px 18px }
  .ta-card { padding: 16px }
  .ta-class > li { grid-template-columns: auto 1fr auto; }
  .ta-class ol { display: none }
}
`;

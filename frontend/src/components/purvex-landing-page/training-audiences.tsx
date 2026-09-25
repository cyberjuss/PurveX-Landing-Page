"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight } from "lucide-react";
import { IconCampus, IconCivic, IconGraduate, type BrandIcon } from "./brand-icons";

/* Who the training is for. The visitor picks who they are; the panel then
   shows how getting started works for them in four short steps. */

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
      "Join with a class passcode",
      "Build your company network",
      "Fix tickets with Coach's help",
      "Earn a score employers can read",
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
      "Book a short call",
      "Get a class passcode",
      "Students build their labs",
      "Track every student",
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
      "Book a short call",
      "Enroll your people",
      "They practice real tasks",
      "Review each report",
    ],
    footLabel: "Built for roles like",
    foot: ["Help desk", "IT support", "Security operations"],
  },
];

/* ---------- section ---------- */

export function TrainingAudiences() {
  const [i, setI] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const a = AUDIENCES[i];

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

        <ol className="ta-how" key={`s-${a.key}`}>
          {a.steps.map((st, n) => (
            <li key={st} style={{ ["--n" as string]: n }}>
              <i>{n + 1}</i>
              {st}
            </li>
          ))}
        </ol>

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
.ta-how { position: relative; list-style: none; display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 32px 0 0; padding: 0 }
.ta-how::before { content: ""; position: absolute; left: 19px; right: calc((100% - 48px) / 4 - 19px); top: 18px; height: 2px; background: rgba(106,92,255,.22) }
.ta-how li {
  position: relative; display: flex; flex-direction: column; gap: 14px; font-size: .98rem; font-weight: 500; line-height: 1.4; color: var(--ink);
  animation: ta-in .45s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--n) * 70ms + 60ms);
}
.ta-how li i {
  display: grid; place-items: center; width: 38px; height: 38px; font-style: normal; font-size: .9rem; font-weight: 700;
  background: #fff; border: 2px solid var(--accent); color: var(--accent-deep);
}
.ta-how li:last-child i { background: var(--accent); color: #fff }

.ta-panel__foot { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-top: 32px; padding-top: 22px; border-top: 1px solid var(--border); animation: ta-in .45s .2s cubic-bezier(.16,1,.3,1) both }
.ta-panel__foot > span { font-size: .86rem; font-weight: 650; color: var(--ink) }
.ta-panel__foot ul { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; margin: 0; padding: 0 }
.ta-panel__foot li { padding: 6px 12px; background: var(--accent-soft); font-size: .86rem; font-weight: 600; color: var(--accent-deep) }

@keyframes ta-in { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
@keyframes ta-grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@media (prefers-reduced-motion: reduce) {
  .ta-panel__head, .ta-how li, .ta-panel__foot { animation: none }
  .ta-pick button, .ta-pick button::before, .ta-pick__arrow { transition: none }
}

@media (max-width: 1100px) {
  .ta-how { grid-template-columns: 1fr 1fr; row-gap: 24px }
  .ta-how::before { display: none }
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
  .ta-how { grid-template-columns: 1fr; gap: 14px }
  .ta-how li { flex-direction: row; align-items: center }
  .ta-how li i { width: 32px; height: 32px; flex: none }
}
`;

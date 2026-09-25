"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import { BOOKING_URL } from "./chrome";
import { LEVELS, SKILLS, type Skill } from "@/lib/academy-score";
import { IconEvidence, IconLifebuoy, IconTicket, type BrandIcon } from "./brand-icons";

/* Training hero. A working preview of the Academy: practice a ticket, ask
   Coach, and watch progress. It tours itself until the visitor clicks, then
   hands over control. Scores are an example student, labeled as such. */

type TabKey = "practice" | "coach" | "progress";

const TABS: { key: TabKey; label: string; Icon: BrandIcon; chip: string }[] = [
  { key: "practice", label: "Practice", Icon: IconTicket, chip: "Fix checked in their lab" },
  { key: "coach", label: "Coach", Icon: IconLifebuoy, chip: "A hint, never the answer" },
  { key: "progress", label: "Progress", Icon: IconEvidence, chip: "A score employers can read" },
];

const DWELL_MS = 7000;

const FACTS = [
  { k: "3", v: "phases, from the basics to incident response" },
  { k: "25", v: "hands-on missions checked in their own lab" },
  { k: "4", v: "job skills in a score employers can read" },
];

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/* ---------- practice: a ticket the visitor can check ---------- */

const STEPS = ["Read the ticket", "Find the cause", "Fix it in the lab"];

function Practice() {
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(0);
  const [check, setCheck] = useState<"idle" | "checking" | "fixed">("idle");

  useEffect(() => {
    const quick = reducedMotion();
    const t = quick
      ? [window.setTimeout(() => { setDone(STEPS.length); setCheck("fixed"); }, 0)]
      : [
      window.setTimeout(() => { setDone(0); setCheck("idle"); }, 0),
      window.setTimeout(() => setDone(1), 450),
      window.setTimeout(() => setDone(2), 950),
      window.setTimeout(() => setDone(3), 1450),
      window.setTimeout(() => setCheck("checking"), 1900),
      window.setTimeout(() => setCheck("fixed"), 3100),
        ];
    return () => t.forEach(window.clearTimeout);
  }, [run]);

  const status = check === "fixed" ? "Fixed" : check === "checking" ? "Checking" : "Open";

  return (
    <div className="thp">
      <div className="thp__ticket" data-state={check}>
        <header>
          <span>Help desk ticket</span>
          <em key={status}>{status}</em>
        </header>
        <strong>Riley can&apos;t sign in</strong>
        <p>&ldquo;I think my account is locked. I have a meeting in ten minutes.&rdquo;</p>
      </div>

      <ol className="thp__steps">
        {STEPS.map((s, i) => (
          <li key={s} data-on={i < done ? "1" : "0"}>
            <i>{i < done ? <Check size={13} strokeWidth={3} /> : i + 1}</i>
            {s}
          </li>
        ))}
      </ol>

      <div className="thp__foot" data-state={check}>
        {check === "fixed" ? (
          <p key="ok"><b><Check size={14} strokeWidth={3} /></b>PurveX confirmed the fix in their lab.</p>
        ) : check === "checking" ? (
          <p key="wait"><b className="thp__spin" />Checking their lab for the change</p>
        ) : (
          <p key="idle">Work the steps, then check the fix.</p>
        )}
        <button type="button" onClick={() => setRun((n) => n + 1)} disabled={check === "checking"}>
          {check === "fixed" ? <><RotateCcw size={14} /> Run it again</> : "Check my fix"}
        </button>
      </div>
    </div>
  );
}

/* ---------- coach: pick a mode, see how it answers ---------- */

const MODES = [
  {
    key: "help",
    label: "Need help",
    ask: "I'm stuck. Where do I start?",
    reply: "Start with Riley's account itself. What does it tell you about why they can't sign in?",
  },
  {
    key: "check",
    label: "Double-check",
    ask: "I think it's locked, so I'll unlock it.",
    reply: "What would look different if the account were disabled instead? The fix isn't the same.",
  },
  {
    key: "mentor",
    label: "Mentor",
    ask: "It works again. What should I look at next?",
    reply: "Ask why it locked. One computer with an old saved password is different from someone guessing.",
  },
  {
    key: "interview",
    label: "Interview",
    ask: "I'd check the log first, then fix the account.",
    reply: "4 of 5. Good order. Next time, say what you kept as evidence and who you told.",
  },
] as const;

function Coach() {
  const [m, setM] = useState(0);
  const [typing, setTyping] = useState(false);
  const mode = MODES[m];

  useEffect(() => {
    if (!typing) return;
    const t = window.setTimeout(() => setTyping(false), 800);
    return () => window.clearTimeout(t);
  }, [typing, m]);

  function choose(i: number) {
    setM(i);
    setTyping(!reducedMotion());
  }

  return (
    <div className="thc">
      <div className="thc__thread" aria-live="polite">
        <p className="thc__me" key={`a${m}`}>{mode.ask}</p>
        {typing ? (
          <p className="thc__bot thc__typing" aria-label="Coach is typing"><i /><i /><i /></p>
        ) : (
          <p className="thc__bot" key={`b${m}`}>
            <b>Coach</b>
            {mode.reply}
          </p>
        )}
      </div>
      <div className="thc__modes" role="group" aria-label="Coach modes">
        {MODES.map((x, i) => (
          <button key={x.key} type="button" aria-pressed={i === m} onClick={() => choose(i)}>
            {x.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------- progress: an example readiness report ---------- */

const SAMPLE: Record<Skill, number> = { accounts: 92, directory: 78, troubleshooting: 88, security: 61 };
const OVERALL = 72;
const RING = 2 * Math.PI * 38;

function Progress() {
  const skills = Object.keys(SKILLS) as Skill[];
  const low = skills.reduce((a, b) => (SAMPLE[b] < SAMPLE[a] ? b : a));

  return (
    <div className="thr">
      <div className="thr__top">
        <svg viewBox="0 0 88 88" className="thr__ring" aria-hidden="true">
          <circle cx="44" cy="44" r="38" />
          <circle cx="44" cy="44" r="38" style={{ ["--off" as string]: RING * (1 - OVERALL / 100), strokeDasharray: RING }} />
        </svg>
        <div>
          <span>Readiness, example student</span>
          <strong>{OVERALL}<small>/100</small></strong>
          <em>{LEVELS.almost.label}</em>
        </div>
      </div>
      <ul className="thr__skills">
        {skills.map((k, i) => (
          <li key={k} style={{ ["--w" as string]: `${SAMPLE[k]}%`, ["--i" as string]: i }} data-low={k === low ? "1" : "0"}>
            <span>{SKILLS[k].label}</span>
            <b>{SAMPLE[k]}</b>
            <i />
          </li>
        ))}
      </ul>
      <p className="thr__next">Coach starts next week with <b>{SKILLS[low].label}</b>.</p>
    </div>
  );
}

/* ---------- the window ---------- */

function AcademyWindow() {
  const [tab, setTab] = useState(0);
  const [auto, setAuto] = useState(true);
  const stage = useRef<HTMLDivElement>(null);

  function pick(i: number) {
    setAuto(false);
    setTab(i);
  }

  // Pointer glow and tilt write CSS variables straight to the element, so
  // moving the mouse never re-renders React.
  function move(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || !stage.current) return;
    const r = stage.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    stage.current.style.setProperty("--mx", `${x * 100}%`);
    stage.current.style.setProperty("--my", `${y * 100}%`);
    stage.current.style.setProperty("--ry", `${(x - 0.5) * 3}deg`);
    stage.current.style.setProperty("--rx", `${(0.5 - y) * 2.5}deg`);
  }
  function leave() {
    stage.current?.style.setProperty("--rx", "0deg");
    stage.current?.style.setProperty("--ry", "0deg");
  }

  const active = TABS[tab];

  return (
    <div className="thw-stage" ref={stage} onPointerMove={move} onPointerLeave={leave}>
      <div className="thw">
        <div className="thw__bar">
          <span className="thw__brand">PurveX Academy</span>
          <div className="thw__tabs" role="tablist" aria-label="Academy preview">
            {TABS.map((t, i) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                id={`thw-tab-${t.key}`}
                aria-controls="thw-panel"
                aria-selected={i === tab}
                onClick={() => pick(i)}
              >
                <t.Icon size={16} />
                {t.label}
                {auto && i === tab && (
                  <i
                    className="thw__timer"
                    style={{ animationDuration: `${DWELL_MS}ms` }}
                    onAnimationEnd={() => setTab((n) => (n + 1) % TABS.length)}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="thw__panel" role="tabpanel" id="thw-panel" aria-labelledby={`thw-tab-${active.key}`} key={active.key}>
          {active.key === "practice" && <Practice />}
          {active.key === "coach" && <Coach />}
          {active.key === "progress" && <Progress />}
        </div>
      </div>
      <p className="thw__chip" key={active.chip}>
        <b><Check size={13} strokeWidth={3} /></b>
        {active.chip}
      </p>
    </div>
  );
}

export function TrainingHero() {
  return (
    <section className="th">
      <div className="th-copy">
        <span className="sp-tag">Training</span>
        <h1>
          <span>Job-ready</span> cybersecurity training
        </h1>
        <p className="th-sub">
          Students practice on their own company network, get help from an AI coach, and finish with proof employers
          trust.
        </p>
        <div className="th-actions">
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Book a cohort <ArrowRight size={16} />
          </a>
          <Link href="/academy" className="sp-btn sp-btn--ghost sp-btn--lg">
            Sign in
          </Link>
        </div>
      </div>

      <AcademyWindow />

      <ul className="th-facts">
        {FACTS.map((f) => (
          <li key={f.v}>
            <b>{f.k}</b>
            <span>{f.v}</span>
          </li>
        ))}
      </ul>

      <style>{HERO_CSS}</style>
    </section>
  );
}

const HERO_CSS = `
.th {
  position: relative; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 540px); gap: 28px 56px; align-items: center;
  padding: clamp(40px, 6vw, 88px) 0 0;
}
.th-copy { max-width: 620px }
.th h1 {
  margin: 18px 0 0; font-family: var(--font-display); font-weight: 500;
  font-size: clamp(2.4rem, 4.4vw, 3.5rem); line-height: 1.04; letter-spacing: -.045em; color: var(--ink); text-wrap: balance;
}
.th h1 span { display: block; color: var(--accent-deep) }
.th-sub { margin: 22px 0 0; max-width: 46ch; color: var(--ink-soft); font-size: 1.1rem; line-height: 1.6 }
.th-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px }
.th-actions .sp-btn:active { transform: translateY(1px) scale(.98) }

/* stage: glow, offset plate, tilt */
.thw-stage { --mx: 70%; --my: 30%; --rx: 0deg; --ry: 0deg; position: relative; perspective: 1400px; padding: 10px 0 26px }
.thw-stage::before {
  content: ""; position: absolute; inset: -60px -40px -40px -60px; z-index: 0; pointer-events: none;
  background: radial-gradient(420px circle at var(--mx) var(--my), rgba(106,92,255,.22), transparent 65%);
  -webkit-mask-image: radial-gradient(closest-side, #000 60%, transparent);
  mask-image: radial-gradient(closest-side, #000 60%, transparent);
}
.thw-stage::after {
  content: ""; position: absolute; inset: 34px -18px 4px 26px; z-index: 0;
  background: repeating-linear-gradient(135deg, rgba(106,92,255,.10) 0 1px, transparent 1px 9px), var(--accent-soft);
  border: 1px solid rgba(106,92,255,.2);
}
.thw {
  position: relative; z-index: 1; background: #fff; border: 1px solid rgba(85,70,224,.2);
  box-shadow: 0 1px 0 rgba(255,255,255,.8) inset, 0 40px 80px -36px rgba(42,34,128,.45), 0 12px 24px -16px rgba(42,34,128,.25);
  transform: rotateX(var(--rx)) rotateY(var(--ry)); transform-style: preserve-3d;
  transition: transform .5s cubic-bezier(.16,1,.3,1);
}

/* window chrome */
.thw__bar { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 10px 10px 18px; background: #151a33; }
.thw__brand { font-family: var(--font-display); font-weight: 600; font-size: .92rem; letter-spacing: -.01em; color: #eef0ff; white-space: nowrap }
.thw__tabs { display: flex; gap: 4px; padding: 3px; background: rgba(238,240,255,.08) }
.thw__tabs button {
  position: relative; overflow: hidden; display: inline-flex; align-items: center; gap: 7px; min-height: 36px; padding: 0 12px;
  border: 0; background: transparent; cursor: pointer; color: rgba(238,240,255,.72);
  font-size: .84rem; font-weight: 600; transition: background .25s var(--ease), color .25s var(--ease);
}
.thw__tabs button:hover { color: #fff }
.thw__tabs button[aria-selected="true"] { background: #fff; color: var(--accent-deep) }
.thw__tabs button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
.thw__timer { position: absolute; left: 0; bottom: 0; height: 2px; width: 100%; background: var(--accent); transform-origin: left; animation: thw-timer linear both }
.thw-stage:hover .thw__timer { animation-play-state: paused }
.thw__panel { min-height: 356px; padding: 22px 22px 20px; animation: thw-in .45s cubic-bezier(.16,1,.3,1) both }

.thw__chip {
  position: absolute; z-index: 2; left: -28px; bottom: 0; display: inline-flex; align-items: center; gap: 10px; margin: 0;
  padding: 10px 16px 10px 10px; background: #fff; border: 1px solid rgba(85,70,224,.18);
  box-shadow: 0 20px 40px -20px rgba(42,34,128,.45); font-size: .88rem; font-weight: 600; color: var(--ink);
  animation: thw-chip .6s cubic-bezier(.16,1,.3,1) both;
}
.thw__chip b { display: grid; place-items: center; width: 24px; height: 24px; background: var(--green); color: #fff }

/* practice */
.thp__ticket { padding: 16px 18px; border: 1px solid var(--border); border-left: 3px solid var(--accent); background: #fbfbff; transition: border-color .4s var(--ease) }
.thp__ticket[data-state="fixed"] { border-left-color: var(--green) }
.thp__ticket header { display: flex; justify-content: space-between; align-items: center; gap: 10px }
.thp__ticket header span { font-size: .78rem; font-weight: 600; color: var(--muted) }
.thp__ticket header em {
  font-style: normal; padding: 3px 9px; font-size: .74rem; font-weight: 700; color: var(--accent-deep); background: var(--accent-soft);
  animation: thw-pop .35s var(--ease) both;
}
.thp__ticket[data-state="fixed"] header em { color: #fff; background: var(--green) }
.thp__ticket strong { display: block; margin-top: 8px; font-family: var(--font-display); font-weight: 600; font-size: 1.35rem; letter-spacing: -.03em; color: var(--ink) }
.thp__ticket p { margin: 6px 0 0; color: var(--ink-soft); font-size: .92rem; line-height: 1.45 }
.thp__steps { list-style: none; margin: 16px 0 0; padding: 0; display: grid; gap: 8px }
.thp__steps li { display: flex; align-items: center; gap: 12px; font-size: .95rem; color: var(--muted); transition: color .3s var(--ease) }
.thp__steps li i {
  display: grid; place-items: center; width: 26px; height: 26px; flex: none; font-style: normal; font-size: .76rem; font-weight: 700;
  border: 1px solid var(--border-strong); color: var(--muted); transition: background .3s var(--ease), border-color .3s var(--ease), color .3s var(--ease);
}
.thp__steps li[data-on="1"] { color: var(--ink) }
.thp__steps li[data-on="1"] i { background: var(--accent); border-color: var(--accent); color: #fff; animation: thw-pop .35s var(--ease) both }
.thp__foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 18px; padding: 12px 12px 12px 14px; background: var(--accent-soft); transition: background .4s var(--ease) }
.thp__foot[data-state="fixed"] { background: rgba(22,163,74,.09) }
.thp__foot p { display: flex; align-items: center; gap: 10px; margin: 0; font-size: .9rem; font-weight: 500; color: var(--ink); animation: thw-in .35s var(--ease) both }
.thp__foot p b { display: grid; place-items: center; width: 22px; height: 22px; flex: none; background: var(--green); color: #fff }
.thp__spin { width: 18px !important; height: 18px !important; background: transparent !important; border: 2px solid var(--accent); border-right-color: transparent; border-radius: 50%; animation: thw-rot .8s linear infinite }
.thp__foot button {
  display: inline-flex; align-items: center; gap: 6px; flex: none; min-height: 36px; padding: 0 14px; border: 0; cursor: pointer;
  background: var(--accent-deep); color: #fff; font-size: .84rem; font-weight: 650; transition: transform .15s var(--ease), opacity .2s;
}
.thp__foot button:active { transform: scale(.97) }
.thp__foot button:disabled { opacity: .45; cursor: default }
.thp__foot button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }

/* coach */
.thc { display: flex; flex-direction: column; justify-content: space-between; gap: 18px; min-height: 314px }
.thc__thread { display: flex; flex-direction: column; gap: 12px }
.thc__thread p { margin: 0; max-width: 86%; padding: 12px 14px; font-size: .95rem; line-height: 1.5; animation: thw-in .35s var(--ease) both }
.thc__me { align-self: flex-end; background: var(--accent-deep); color: #fff }
.thc__bot { align-self: flex-start; background: #f4f4fb; border: 1px solid var(--border); color: var(--ink) }
.thc__bot b { display: block; margin-bottom: 4px; font-size: .74rem; font-weight: 700; letter-spacing: .02em; color: var(--accent-deep) }
.thc__typing { display: inline-flex !important; gap: 5px; padding: 16px 16px !important }
.thc__typing i { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); animation: thw-dot 1s ease-in-out infinite }
.thc__typing i:nth-child(2) { animation-delay: .15s }
.thc__typing i:nth-child(3) { animation-delay: .3s }
.thc__modes { display: flex; flex-wrap: wrap; gap: 8px; padding-top: 14px; border-top: 1px solid var(--border) }
.thc__modes button {
  min-height: 36px; padding: 0 14px; border: 1px solid var(--border-strong); background: #fff; cursor: pointer;
  font-size: .86rem; font-weight: 600; color: var(--ink-soft); transition: border-color .2s, color .2s, background .2s, transform .15s;
}
.thc__modes button:hover { border-color: var(--accent); color: var(--accent-deep) }
.thc__modes button:active { transform: scale(.97) }
.thc__modes button[aria-pressed="true"] { background: var(--accent-soft); border-color: var(--accent); color: var(--accent-deep) }
.thc__modes button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }

/* progress */
.thr__top { display: flex; align-items: center; gap: 20px }
.thr__ring { width: 96px; height: 96px; flex: none; transform: rotate(-90deg) }
.thr__ring circle { fill: none; stroke-width: 8 }
.thr__ring circle:first-child { stroke: var(--accent-soft) }
.thr__ring circle:last-child { stroke: var(--accent); stroke-linecap: butt; stroke-dashoffset: var(--off); animation: thw-ring 1.2s cubic-bezier(.16,1,.3,1) both }
.thr__top span { display: block; font-size: .8rem; font-weight: 600; color: var(--muted) }
.thr__top strong { display: block; margin-top: 2px; font-family: var(--font-display); font-weight: 600; font-size: 2.6rem; letter-spacing: -.05em; line-height: 1; color: var(--ink) }
.thr__top strong small { font-size: 1rem; letter-spacing: 0; color: var(--muted) }
.thr__top em { display: inline-block; margin-top: 8px; padding: 3px 9px; font-style: normal; font-size: .76rem; font-weight: 700; color: var(--accent-deep); background: var(--accent-soft) }
.thr__skills { list-style: none; margin: 20px 0 0; padding: 0; display: grid; gap: 12px }
.thr__skills li { display: grid; grid-template-columns: 1fr auto; gap: 6px 12px; font-size: .88rem; color: var(--ink-soft) }
.thr__skills b { font-weight: 700; color: var(--ink) }
.thr__skills i { grid-column: 1 / -1; display: block; width: var(--w); height: 4px; background: var(--accent); transform-origin: left; animation: thw-grow .9s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--i) * 90ms + .2s) }
.thr__skills li[data-low="1"] i { background: #f59e0b }
.thr__next { margin: 18px 0 0; padding: 12px 14px; background: var(--accent-soft); font-size: .9rem; color: var(--ink) }

/* facts */
.th-facts {
  grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, 1fr); list-style: none;
  margin: clamp(28px, 4vw, 48px) 0 0; padding: 0; border-top: 1px solid var(--border);
}
.th-facts li { display: flex; align-items: baseline; gap: 14px; padding: 22px 24px 0 0 }
.th-facts li + li { padding-left: 24px; border-left: 1px solid var(--border) }
.th-facts b { font-family: var(--font-display); font-weight: 500; font-size: 2.2rem; letter-spacing: -.05em; line-height: 1; color: var(--accent-deep) }
.th-facts span { color: var(--ink-soft); font-size: .95rem; line-height: 1.4 }

@keyframes thw-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes thw-pop { from { opacity: 0; transform: scale(.85) } to { opacity: 1; transform: none } }
@keyframes thw-chip { from { opacity: 0; transform: translateY(10px) scale(.96) } to { opacity: 1; transform: none } }
@keyframes thw-rot { to { transform: rotate(360deg) } }
@keyframes thw-timer { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@keyframes thw-dot { 0%, 100% { opacity: .3; transform: translateY(0) } 50% { opacity: 1; transform: translateY(-3px) } }
@keyframes thw-ring { from { stroke-dashoffset: ${RING} } }
@keyframes thw-grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }

@media (prefers-reduced-motion: reduce) {
  .thw { transform: none; transition: none }
  .thw__panel, .thw__chip, .thp__ticket header em, .thp__steps li i, .thp__foot p, .thc__thread p,
  .thr__ring circle:last-child, .thr__skills i, .thc__typing i, .thp__spin { animation: none }
  .thw__timer { display: none }
}

@media (max-width: 1020px) {
  .th { grid-template-columns: minmax(0, 1fr) }
  .thw-stage { max-width: 600px }
}
@media (max-width: 640px) {
  .thw-stage::after { inset: 24px -8px 8px 12px }
  .thw-stage::before { display: none }
  .thw__bar { flex-direction: column; align-items: stretch; padding: 12px }
  .thw__tabs button { flex: 1; justify-content: center; padding: 0 8px }
  .thw__panel { padding: 16px }
  .thp__foot { flex-direction: column; align-items: stretch }
  .thp__foot button { justify-content: center }
  .thw__chip { left: 8px }
  .th-facts { grid-template-columns: 1fr }
  .th-facts li, .th-facts li + li { padding: 16px 0; border-left: 0; border-bottom: 1px solid var(--border) }
}
`;

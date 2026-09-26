"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, Check, Play, RotateCcw, X } from "lucide-react";

/* Platform hero. A working picture of one PurveX test: pick an attack,
   run it, and watch it move through the same five stages the product
   checks. A miss stops at the stage that broke and says why, in plain
   words. The techniques are real ATT&CK IDs; the results are examples. */

const STAGES = ["Attack runs", "Log arrives", "Log is read", "Rule matches", "Alert fires"];

type Technique = {
  id: string;
  name: string;
  stop: number | null;
  why?: string;
  fix?: string;
};

const TECHNIQUES: Technique[] = [
  { id: "T1059.001", name: "PowerShell run by a user", stop: null },
  {
    id: "T1003.001",
    name: "Password theft from memory",
    stop: 3,
    why: "The log arrived and was read, but no rule matched it.",
    fix: "Add a rule for this behavior, then run the test again.",
  },
  {
    id: "T1053.005",
    name: "Scheduled task created",
    stop: 1,
    why: "The computer never sent this log to your SIEM.",
    fix: "Turn on this log source, then run the test again.",
  },
];

const STEP_MS = 520;
const QUERY = "(prefers-reduced-motion: reduce)";

function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(QUERY);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}

type Phase = "idle" | "running" | "done";

function TestRun() {
  const reduced = useReducedMotion();
  const [pick, setPick] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(-1);
  const timers = useRef<number[]>([]);
  const t = TECHNIQUES[pick];

  function clear() {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }

  function run(i: number) {
    clear();
    const tech = TECHNIQUES[i];
    const end = tech.stop ?? STAGES.length - 1;
    if (reduced) {
      setStep(end);
      setPhase("done");
      return;
    }
    setPhase("running");
    setStep(-1);
    for (let k = 0; k <= end; k++) {
      timers.current.push(window.setTimeout(() => setStep(k), STEP_MS * (k + 1)));
    }
    timers.current.push(window.setTimeout(() => setPhase("done"), STEP_MS * (end + 2)));
  }

  // Play the first test once so the visitor sees a full run.
  useEffect(() => {
    const id = window.setTimeout(() => run(0), 700);
    return () => {
      window.clearTimeout(id);
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function choose(i: number) {
    clear();
    setPick(i);
    setPhase("idle");
    setStep(-1);
  }

  function stateOf(k: number) {
    if (k > step) return "wait";
    return t.stop === k ? "fail" : "ok";
  }

  const fired = phase === "done" && t.stop === null;
  const missed = phase === "done" && t.stop !== null;

  return (
    <div className="pxr">
      <header className="pxr__bar">
        <strong>Test run</strong>
        <span>Example</span>
      </header>

      <div className="pxr__body">
        <p className="pxr__label" id="pxr-pick">Pick an attack to test</p>
        <div className="pxr__picks" role="radiogroup" aria-labelledby="pxr-pick">
          {TECHNIQUES.map((x, i) => (
            <button
              key={x.id}
              type="button"
              role="radio"
              aria-checked={i === pick}
              onClick={() => choose(i)}
              disabled={phase === "running"}
            >
              <i />
              <span>{x.name}</span>
              <code>{x.id}</code>
            </button>
          ))}
        </div>

        <ol className="pxr__stages" aria-label="Test stages">
          {STAGES.map((s, k) => (
            <li key={s} data-s={stateOf(k)}>
              <i>
                {stateOf(k) === "ok" && <Check size={13} strokeWidth={3} />}
                {stateOf(k) === "fail" && <X size={13} strokeWidth={3} />}
              </i>
              <span>{s}</span>
            </li>
          ))}
        </ol>

        <div className="pxr__result" data-r={fired ? "fired" : missed ? "missed" : phase} aria-live="polite">
          {phase === "idle" && <p key="idle">Press run to send this attack through your environment.</p>}
          {phase === "running" && <p key="run"><b className="pxr__spin" />Running the test and checking your SIEM</p>}
          {fired && (
            <p key="fired"><b><Check size={14} strokeWidth={3} /></b>Alert fired. This detection works.</p>
          )}
          {missed && (
            <div key="missed">
              <p><b><X size={14} strokeWidth={3} /></b>Missed at &ldquo;{STAGES[t.stop ?? 0]}&rdquo;. {t.why}</p>
              <p className="pxr__fix">{t.fix}</p>
            </div>
          )}
        </div>

        <button type="button" className="pxr__run" onClick={() => run(pick)} disabled={phase === "running"}>
          {phase === "done" ? <><RotateCcw size={15} /> Run again</> : <><Play size={15} /> Run test</>}
        </button>
      </div>
    </div>
  );
}

export function PlatformHero() {
  return (
    <section className="pxh" id="top">
      <div className="pxh__copy">
        <span className="sp-tag">Platform</span>
        <h1>
          Prove your security alerts <span>actually work</span>
        </h1>
        <p className="pxh__sub">
          PurveX runs real attack tests in your environment and shows which alerts fired, which missed, and why.
        </p>
        <div className="pxh__actions">
          <Link href="/account/signup?plan=free" className="sp-btn sp-btn--prim sp-btn--lg">
            Get started free <ArrowRight size={16} />
          </Link>
          <a href="#pricing" className="sp-btn sp-btn--ghost sp-btn--lg">
            See pricing
          </a>
        </div>
      </div>
      <TestRun />
      <style>{PXH_CSS}</style>
    </section>
  );
}

const PXH_CSS = `
.pxh {
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 540px); gap: 32px 56px; align-items: center;
  padding: clamp(40px, 6vw, 80px) 0 0;
}
.pxh__copy { max-width: 600px }
.pxh h1 {
  margin: 18px 0 0; font-family: var(--font-display); font-weight: 500;
  font-size: clamp(2.3rem, 4.2vw, 3.4rem); line-height: 1.05; letter-spacing: -.045em; color: var(--ink); text-wrap: balance;
}
.pxh h1 span { color: var(--accent-deep) }
.pxh__sub { margin: 22px 0 0; max-width: 46ch; color: var(--ink-soft); font-size: 1.1rem; line-height: 1.6 }
.pxh__actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px }
.pxh__actions .sp-btn:active { transform: translateY(1px) scale(.98) }

.pxr {
  position: relative; background: #fff; border: 1px solid rgba(85,70,224,.18);
  box-shadow: 0 40px 80px -40px rgba(42,34,128,.4), 0 12px 24px -18px rgba(42,34,128,.22);
}
.pxr::before {
  content: ""; position: absolute; inset: -44px -36px -36px -44px; z-index: -1; pointer-events: none;
  background: radial-gradient(closest-side, rgba(106,92,255,.16), transparent);
}
.pxr__bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; background: #151a33; color: #eef0ff }
.pxr__bar strong { font-family: var(--font-display); font-size: .95rem; font-weight: 600 }
.pxr__bar span { padding: 2px 8px; font-size: .7rem; font-weight: 700; color: #151a33; background: #eef0ff }
.pxr__body { padding: 20px 20px 22px }
.pxr__label { margin: 0 0 10px; font-size: .82rem; font-weight: 650; color: var(--muted) }

.pxr__picks { display: grid; gap: 6px }
.pxr__picks button {
  display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 12px; min-height: 44px; padding: 8px 12px;
  text-align: left; background: #fff; border: 1px solid var(--border); cursor: pointer; color: var(--ink);
  font-size: .94rem; font-weight: 550; transition: border-color .2s, background .2s;
}
.pxr__picks button:hover:not(:disabled) { border-color: rgba(106,92,255,.45) }
.pxr__picks button:disabled { cursor: default }
.pxr__picks button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
.pxr__picks i { width: 16px; height: 16px; border: 2px solid var(--border-strong); border-radius: 50%; transition: border-color .2s, box-shadow .2s }
.pxr__picks code { font-family: var(--font-mono); font-size: .74rem; color: var(--muted) }
.pxr__picks button[aria-checked="true"] { border-color: var(--accent); background: var(--accent-soft) }
.pxr__picks button[aria-checked="true"] i { border-color: var(--accent); box-shadow: inset 0 0 0 3px #fff, inset 0 0 0 8px var(--accent) }

.pxr__stages { position: relative; display: grid; grid-template-columns: repeat(5, 1fr); list-style: none; margin: 22px 0 0; padding: 0 }
.pxr__stages::before { content: ""; position: absolute; left: 10%; right: 10%; top: 14px; height: 2px; background: var(--border) }
.pxr__stages li { position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; font-size: .76rem; font-weight: 600; color: var(--muted); line-height: 1.25 }
.pxr__stages i {
  position: relative; z-index: 1; display: grid; place-items: center; width: 30px; height: 30px;
  background: #fff; border: 2px solid var(--border-strong); color: #fff; transition: background .25s, border-color .25s, transform .25s;
}
.pxr__stages i svg { position: static }
.pxr__stages li[data-s="ok"] { color: var(--ink) }
.pxr__stages li[data-s="ok"] i { background: var(--accent); border-color: var(--accent); animation: pxr-pop .3s cubic-bezier(.16,1,.3,1) both }
.pxr__stages li[data-s="fail"] { color: #b42318 }
.pxr__stages li[data-s="fail"] i { background: #e5484d; border-color: #e5484d; animation: pxr-pop .3s cubic-bezier(.16,1,.3,1) both }

.pxr__result { min-height: 74px; margin-top: 20px; padding: 12px 14px; background: #f6f6fb; border: 1px solid var(--border); transition: background .3s, border-color .3s }
.pxr__result[data-r="fired"] { background: #f0fdf4; border-color: rgba(22,163,74,.3) }
.pxr__result[data-r="missed"] { background: #fef3f2; border-color: rgba(229,72,77,.3) }
.pxr__result p { display: flex; align-items: flex-start; gap: 10px; margin: 0; font-size: .92rem; line-height: 1.45; color: var(--ink); animation: pxr-in .3s cubic-bezier(.16,1,.3,1) both }
.pxr__result p b { display: grid; place-items: center; width: 22px; height: 22px; flex: none; color: #fff; background: var(--green) }
.pxr__result[data-r="missed"] p b { background: #e5484d }
.pxr__result p b svg { position: static }
.pxr__result .pxr__fix { margin-top: 6px; padding-left: 32px; color: var(--ink-soft); font-size: .88rem }
.pxr__spin { width: 18px !important; height: 18px !important; background: transparent !important; border: 2px solid var(--accent); border-right-color: transparent; border-radius: 50%; animation: pxr-rot .8s linear infinite }

.pxr__run {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; width: 100%; min-height: 44px; margin-top: 14px;
  border: 0; cursor: pointer; background: var(--accent-deep); color: #fff; font-size: .92rem; font-weight: 650;
  transition: transform .15s, opacity .2s;
}
.pxr__run svg { position: static }
.pxr__run:active:not(:disabled) { transform: scale(.98) }
.pxr__run:disabled { opacity: .5; cursor: default }
.pxr__run:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }

@keyframes pxr-pop { from { transform: scale(.6) } to { transform: none } }
@keyframes pxr-in { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
@keyframes pxr-rot { to { transform: rotate(360deg) } }
@media (prefers-reduced-motion: reduce) {
  .pxr__stages li i, .pxr__result p, .pxr__spin { animation: none !important }
}

@media (max-width: 1020px) {
  .pxh { grid-template-columns: minmax(0, 1fr) }
  .pxr { max-width: 600px }
}
@media (max-width: 640px) {
  .pxr::before { display: none }
  .pxr__body { padding: 16px }
  .pxr__picks code { display: none }
  .pxr__stages li { font-size: .66rem }
  .pxr__stages i { width: 26px; height: 26px }
}
`;

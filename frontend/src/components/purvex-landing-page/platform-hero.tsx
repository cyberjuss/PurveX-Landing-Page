"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ArrowRight, BellRing, Check, Crosshair, FileText, ListFilter, Play, RotateCcw, ScanSearch, Wrench, X, type LucideIcon } from "lucide-react";

/* Platform hero. A working picture of one PurveX test, styled like the
   console a security team would use: pick an attack, run it, and watch it
   move through the five stages the product checks while the log streams
   in. A miss stops at the stage that broke and says why, and the visitor
   can apply the fix and rerun it, which is the loop the product sells.
   Technique IDs are real ATT&CK IDs; hosts, events, and results are examples. */

const STAGES: { name: string; Icon: LucideIcon }[] = [
  { name: "Attack runs", Icon: Crosshair },
  { name: "Log arrives", Icon: FileText },
  { name: "Log is read", Icon: ScanSearch },
  { name: "Rule matches", Icon: ListFilter },
  { name: "Alert fires", Icon: BellRing },
];

type Technique = {
  id: string;
  tactic: string;
  name: string;
  stop: number | null;
  log: [string, string][];
  why?: string;
  fix?: string;
  fixLog?: [string, string][];
};

const TECHNIQUES: Technique[] = [
  {
    id: "T1059.001",
    tactic: "Execution",
    name: "PowerShell run by a user",
    stop: null,
    log: [
      ["runner", "Running T1059.001 on WIN-TEST01"],
      ["sysmon", "Event 1: powershell.exe -EncodedCommand"],
      ["siem", "Event parsed into process fields"],
      ["rule", "Matched: Encoded PowerShell command"],
      ["alert", "Sent to the SOC queue, severity High"],
    ],
  },
  {
    id: "T1003.001",
    tactic: "Credential access",
    name: "Password theft from memory",
    stop: 3,
    log: [
      ["runner", "Running T1003.001 on WIN-TEST01"],
      ["sysmon", "Event 10: process opened lsass.exe"],
      ["siem", "Event parsed into process fields"],
      ["rule", "No rule matched within 5 minutes"],
    ],
    why: "The log arrived and was read, but no rule matched it.",
    fix: "Add a rule for access to lsass.exe, then run the test again.",
    fixLog: [
      ["runner", "Running T1003.001 on WIN-TEST01"],
      ["sysmon", "Event 10: process opened lsass.exe"],
      ["siem", "Event parsed into process fields"],
      ["rule", "Matched: Access to lsass.exe (new rule)"],
      ["alert", "Sent to the SOC queue, severity Critical"],
    ],
  },
  {
    id: "T1053.005",
    tactic: "Persistence",
    name: "Scheduled task created",
    stop: 1,
    log: [
      ["runner", "Running T1053.005 on WIN-TEST01"],
      ["siem", "No matching event received within 5 minutes"],
    ],
    why: "The computer never sent this log to your SIEM.",
    fix: "Turn on task scheduler logging, then run the test again.",
    fixLog: [
      ["runner", "Running T1053.005 on WIN-TEST01"],
      ["winlog", "Event 4698: scheduled task created"],
      ["siem", "Event parsed into task fields"],
      ["rule", "Matched: New scheduled task by a user"],
      ["alert", "Sent to the SOC queue, severity Medium"],
    ],
  },
];

const STEP_MS = 650;
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
type Result = "fired" | "missed";

// A fixed technique passes every stage and logs its repaired run.
function effective(tech: Technique, isFixed: boolean): Technique {
  return isFixed && tech.fixLog ? { ...tech, stop: null, log: tech.fixLog } : tech;
}

function stamp(k: number) {
  return `09:41:${String(2 + k * 3).padStart(2, "0")}`;
}

function Console() {
  const reduced = useReducedMotion();
  const [pick, setPick] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(-1);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [fixed, setFixed] = useState<Record<string, boolean>>({});
  const timers = useRef<number[]>([]);
  const base = TECHNIQUES[pick];
  const t = effective(base, !!fixed[base.id]);

  function clear() {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }

  function finish(tech: Technique) {
    setPhase("done");
    setResults((r) => ({ ...r, [tech.id]: tech.stop === null ? "fired" : "missed" }));
  }

  function run(i: number, withFix = !!fixed[TECHNIQUES[i].id]) {
    clear();
    const tech = effective(TECHNIQUES[i], withFix);
    const end = tech.stop ?? STAGES.length - 1;
    if (reduced) {
      setStep(end);
      finish(tech);
      return;
    }
    setPhase("running");
    setStep(-1);
    for (let k = 0; k <= end; k++) {
      timers.current.push(window.setTimeout(() => setStep(k), STEP_MS * (k + 1)));
    }
    timers.current.push(window.setTimeout(() => finish(tech), STEP_MS * (end + 1) + 450));
  }

  // Play the first test once so the visitor sees a full run.
  useEffect(() => {
    const id = window.setTimeout(() => run(0), 800);
    return () => {
      window.clearTimeout(id);
      clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function choose(i: number) {
    if (phase === "running") return;
    clear();
    setPick(i);
    setPhase("idle");
    setStep(-1);
  }

  function applyFix() {
    setFixed((f) => ({ ...f, [base.id]: true }));
    run(pick, true);
  }

  function reset() {
    clear();
    setResults({});
    setFixed({});
    setPick(0);
    setPhase("idle");
    setStep(-1);
  }

  function stateOf(k: number) {
    if (k > step) return "wait";
    return t.stop === k ? "fail" : "ok";
  }

  const end = t.stop ?? STAGES.length - 1;
  const progress = step < 0 ? 0 : Math.min(step, end) / (STAGES.length - 1);
  const verdict: Result | null = phase === "done" ? (t.stop === null ? "fired" : "missed") : null;
  const tested = Object.keys(results).length;
  const fired = Object.values(results).filter((r) => r === "fired").length;
  const status = phase === "running" ? "Running" : verdict === "fired" ? "Fired" : verdict === "missed" ? "Missed" : "Ready";
  const wasFixed = !!fixed[base.id];

  return (
    <div className="pxc" data-verdict={verdict ?? phase}>
      <header className="pxc__bar">
        <span className="pxc__brand"><b />PurveX</span>
        <span className="pxc__title">Detection test</span>
        <em className="pxc__status" data-s={status.toLowerCase()} key={status}>
          {phase === "running" && <i />}
          {status}
        </em>
      </header>

      <div className="pxc__picks" role="radiogroup" aria-label="Pick an attack to test">
        {TECHNIQUES.map((x, i) => (
          <button
            key={x.id}
            type="button"
            role="radio"
            aria-checked={i === pick}
            onClick={() => choose(i)}
            aria-disabled={phase === "running"}
          >
            <span className="pxc__tactic">{x.tactic}</span>
            <strong>{x.name}</strong>
            <code>{x.id}</code>
            {results[x.id] && (
              <em data-r={results[x.id]} key={`${results[x.id]}-${!!fixed[x.id]}`}>
                {results[x.id] === "missed" ? "Missed" : fixed[x.id] ? "Fixed" : "Fired"}
              </em>
            )}
          </button>
        ))}
      </div>

      <div className="pxc__pipe">
        <div className="pxc__track" aria-hidden="true">
          <span style={{ ["--p" as string]: progress }} data-fail={verdict === "missed" || (phase === "running" && t.stop !== null && step >= end) ? "1" : "0"} />
        </div>
        <ol aria-label="Test stages">
          {STAGES.map(({ name, Icon }, k) => {
            const s = stateOf(k);
            return (
              <li key={name} data-s={s}>
                <i>
                  {s === "fail" ? <X size={16} strokeWidth={2.6} /> : <Icon size={16} strokeWidth={2} />}
                  {s === "ok" && <b><Check size={9} strokeWidth={4} /></b>}
                </i>
                <span>{name}</span>
              </li>
            );
          })}
        </ol>
      </div>

      <div className="pxc__log" aria-hidden="true">
        {step < 0 && phase !== "done" ? (
          <p className="pxc__log-idle">{phase === "running" ? "Starting test runner..." : "Waiting for a test to run"}</p>
        ) : (
          t.log.slice(0, step + 1).map(([src, line], k) => (
            <p key={`${t.id}-${k}`} data-fail={t.stop === k ? "1" : "0"}>
              <time>{stamp(k)}</time>
              <b>{src}</b>
              <span>{line}</span>
            </p>
          ))
        )}
      </div>

      <div className="pxc__verdict" aria-live="polite">
        {verdict === "fired" && (
          <p key={wasFixed ? "fx" : "f"}>
            <b><Check size={15} strokeWidth={3} /></b>
            {wasFixed ? (
              <span><strong>Fixed and proven.</strong> The alert fires now, and the run is kept as evidence.</span>
            ) : (
              <span><strong>Alert fired.</strong> This detection works.</span>
            )}
          </p>
        )}
        {verdict === "missed" && (
          <p key="m">
            <b><X size={15} strokeWidth={3} /></b>
            <span>
              <strong>Missed at {STAGES[t.stop ?? 0].name.toLowerCase()}.</strong> {t.why}
              <small>{t.fix}</small>
            </span>
          </p>
        )}
        {!verdict && (
          <p key="w" className="pxc__verdict-wait">
            {phase === "running" ? "Checking your SIEM for the result..." : "Pick an attack and run it."}
          </p>
        )}
        <div className="pxc__acts">
          {verdict === "missed" ? (
            <>
              <button type="button" onClick={applyFix}>
                <Wrench size={15} /> Fix and rerun
              </button>
              <button type="button" className="pxc__ghost" onClick={() => run(pick)}>
                Run again
              </button>
            </>
          ) : (
            <button type="button" onClick={() => run(pick)} disabled={phase === "running"}>
              {phase === "done" ? <><RotateCcw size={15} /> Run again</> : <><Play size={15} /> Run test</>}
            </button>
          )}
        </div>
      </div>

      <footer className="pxc__foot">
        <div className="pxc__cov">
          <ol aria-hidden="true">
            {TECHNIQUES.map((x) => (
              <li key={x.id} data-r={results[x.id] ?? "none"} />
            ))}
          </ol>
          <span>
            {tested === 0 ? "Coverage: nothing tested yet" : `Coverage: ${fired} of ${TECHNIQUES.length} alerts proven`}
          </span>
        </div>
        {tested > 0 && phase !== "running" ? (
          <button type="button" className="pxc__reset" onClick={reset}>Reset</button>
        ) : (
          <span>Example results</span>
        )}
      </footer>
    </div>
  );
}

export function PlatformHero() {
  return (
    <section className="pxh" id="top">
      <div className="pxh__copy">
        <span className="sp-tag">Platform</span>
        <h1>
          Prove your alerts <span>actually work</span>
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
      <Console />
      <style>{PXH_CSS}</style>
    </section>
  );
}

const PXH_CSS = `
.pxh {
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 600px); gap: 32px 56px; align-items: center;
  padding: clamp(40px, 6vw, 80px) 0 0;
}
.pxh__copy { max-width: 560px }
.pxh h1 {
  margin: 18px 0 0; font-family: var(--font-display); font-weight: 500;
  font-size: clamp(2.3rem, 4vw, 3.3rem); line-height: 1.05; letter-spacing: -.045em; color: var(--ink); text-wrap: balance;
}
.pxh h1 span { display: block; color: var(--accent-deep) }
.pxh__sub { margin: 22px 0 0; max-width: 46ch; color: var(--ink-soft); font-size: 1.1rem; line-height: 1.6 }
.pxh__actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px }
.pxh__actions .sp-btn:active { transform: translateY(1px) scale(.98) }

/* console */
.pxc {
  --c-bg: #0e1122; --c-panel: #151a33; --c-line: rgba(230,232,255,.1); --c-ink: #eceeff; --c-mute: rgba(230,232,255,.58);
  --c-acc: #8b7dff; --c-ok: #34d399; --c-bad: #f87171;
  position: relative; background: var(--c-bg); color: var(--c-ink); border: 1px solid rgba(139,125,255,.28);
  box-shadow: 0 50px 100px -40px rgba(42,34,128,.65), 0 0 0 1px rgba(255,255,255,.03) inset;
}
.pxc::before {
  content: ""; position: absolute; inset: -60px -40px -40px -60px; z-index: -1; pointer-events: none;
  background: radial-gradient(closest-side, rgba(106,92,255,.28), transparent);
}
.pxc::after {
  content: ""; position: absolute; left: 0; right: 0; top: 0; height: 1px; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(139,125,255,.8), transparent);
}

.pxc__bar { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-bottom: 1px solid var(--c-line); background: var(--c-panel) }
.pxc__brand { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 600; font-size: .92rem }
.pxc__brand b { width: 10px; height: 10px; background: var(--c-acc); box-shadow: 0 0 12px var(--c-acc) }
.pxc__title { font-size: .85rem; color: var(--c-mute) }
.pxc__status {
  display: inline-flex; align-items: center; gap: 7px; margin-left: auto; padding: 4px 10px; font-style: normal; font-size: .74rem; font-weight: 700;
  color: var(--c-ink); background: rgba(230,232,255,.08); border: 1px solid var(--c-line); animation: pxc-in .3s cubic-bezier(.16,1,.3,1) both;
}
.pxc__status[data-s="running"] { color: #c9c2ff; border-color: rgba(139,125,255,.5) }
.pxc__status[data-s="running"] i { width: 7px; height: 7px; border-radius: 50%; background: var(--c-acc); animation: pxc-blink 1s ease-in-out infinite }
.pxc__status[data-s="fired"] { color: #062e1f; background: var(--c-ok); border-color: var(--c-ok) }
.pxc__status[data-s="missed"] { color: #3b0a0a; background: var(--c-bad); border-color: var(--c-bad) }

.pxc__picks { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; padding: 16px 16px 0 }
.pxc__picks button {
  position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 4px; min-height: 96px; padding: 12px 12px 10px;
  text-align: left; background: rgba(230,232,255,.03); border: 1px solid var(--c-line); color: var(--c-ink); cursor: pointer;
  transition: border-color .25s, background .25s, transform .2s;
}
.pxc__picks button:hover { border-color: rgba(139,125,255,.45); transform: translateY(-2px) }
.pxc__picks button[aria-disabled="true"] { cursor: default; transform: none }
.pxc__picks button:focus-visible { outline: 2px solid var(--c-acc); outline-offset: 2px }
.pxc__picks button[aria-checked="true"] { background: rgba(139,125,255,.14); border-color: var(--c-acc); box-shadow: 0 0 0 1px var(--c-acc) inset, 0 12px 30px -16px rgba(139,125,255,.7) }
.pxc__tactic { font-size: .68rem; font-weight: 700; letter-spacing: .02em; color: #b3a9ff }
.pxc__picks strong { font-size: .88rem; font-weight: 600; line-height: 1.3 }
.pxc__picks code { margin-top: auto; font-family: var(--font-mono); font-size: .7rem; color: var(--c-mute) }
.pxc__picks em { position: absolute; right: 8px; bottom: 8px; padding: 1px 6px; font-style: normal; font-size: .64rem; font-weight: 800; animation: pxc-in .3s cubic-bezier(.16,1,.3,1) both }
.pxc__picks em[data-r="fired"] { color: #062e1f; background: var(--c-ok) }
.pxc__picks em[data-r="missed"] { color: #3b0a0a; background: var(--c-bad) }

.pxc__pipe { --pad: 16px; position: relative; padding: 24px var(--pad) 6px }
.pxc__track { position: absolute; left: calc(var(--pad) + (100% - 2 * var(--pad)) / 10); right: calc(var(--pad) + (100% - 2 * var(--pad)) / 10); top: 44px; height: 2px; background: var(--c-line) }
.pxc__track span {
  position: absolute; left: 0; top: 0; height: 100%; width: calc(var(--p) * 100%); background: var(--c-acc);
  box-shadow: 0 0 12px var(--c-acc); transition: width .55s cubic-bezier(.16,1,.3,1), background .3s;
}
.pxc__track span::after {
  content: ""; position: absolute; right: -5px; top: -4px; width: 10px; height: 10px; border-radius: 50%;
  background: #fff; box-shadow: 0 0 0 4px rgba(139,125,255,.35), 0 0 18px var(--c-acc);
}
.pxc__track span[data-fail="1"] { background: var(--c-bad); box-shadow: 0 0 12px var(--c-bad) }
.pxc__track span[data-fail="1"]::after { box-shadow: 0 0 0 4px rgba(248,113,113,.35), 0 0 18px var(--c-bad) }
.pxc__pipe ol { position: relative; display: grid; grid-template-columns: repeat(5, 1fr); list-style: none; margin: 0; padding: 0 }
.pxc__pipe li { display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: .72rem; font-weight: 600; text-align: center; color: var(--c-mute) }
.pxc__pipe li i {
  position: relative; display: grid; place-items: center; width: 40px; height: 40px;
  background: var(--c-panel); border: 1px solid var(--c-line); color: var(--c-mute);
  transition: background .3s, border-color .3s, color .3s, box-shadow .3s;
}
.pxc__pipe li i svg { position: static }
.pxc__pipe li i b { position: absolute; top: -6px; right: -6px; display: grid; place-items: center; width: 16px; height: 16px; background: var(--c-ok); color: #062e1f; animation: pxc-pop .3s cubic-bezier(.16,1,.3,1) both }
.pxc__pipe li i b svg { position: static }
.pxc__pipe li[data-s="ok"] { color: var(--c-ink) }
.pxc__pipe li[data-s="ok"] i { background: linear-gradient(rgba(139,125,255,.22), rgba(139,125,255,.22)), var(--c-panel); border-color: var(--c-acc); color: #fff; box-shadow: 0 0 20px -4px rgba(139,125,255,.7); animation: pxc-pop .35s cubic-bezier(.16,1,.3,1) both }
.pxc__pipe li[data-s="fail"] { color: var(--c-bad) }
.pxc__pipe li[data-s="fail"] i { background: linear-gradient(rgba(248,113,113,.2), rgba(248,113,113,.2)), var(--c-panel); border-color: var(--c-bad); color: #fff; box-shadow: 0 0 22px -4px rgba(248,113,113,.8); animation: pxc-shake .45s ease both }

.pxc__log {
  min-height: 136px; margin: 16px 16px 0; padding: 12px 14px; background: #080a17; border: 1px solid var(--c-line);
  font-family: var(--font-mono); font-size: .76rem; line-height: 1.55;
}
.pxc__log p { display: grid; grid-template-columns: auto 52px 1fr; gap: 10px; margin: 0 0 4px; color: #d6d9ff; animation: pxc-type .35s cubic-bezier(.16,1,.3,1) both }
.pxc__log time { color: rgba(230,232,255,.38) }
.pxc__log b { font-weight: 600; color: #b3a9ff }
.pxc__log p[data-fail="1"] { color: var(--c-bad) }
.pxc__log p[data-fail="1"] b { color: var(--c-bad) }
.pxc__log-idle { display: block !important; color: var(--c-mute) !important }
.pxc__log-idle::after { content: "_"; margin-left: 4px; animation: pxc-blink 1s steps(1) infinite }

.pxc__verdict { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 14px; margin: 14px 16px 0; min-height: 72px }
.pxc__acts { display: flex; flex-direction: column; align-items: stretch; gap: 6px }
.pxc__verdict p { display: flex; align-items: flex-start; gap: 10px; margin: 0; font-size: .88rem; line-height: 1.45; color: var(--c-ink); animation: pxc-in .35s cubic-bezier(.16,1,.3,1) both }
.pxc__verdict p b { display: grid; place-items: center; width: 24px; height: 24px; flex: none; color: #062e1f; background: var(--c-ok) }
.pxc__verdict p b svg { position: static }
.pxc[data-verdict="missed"] .pxc__verdict p b { color: #3b0a0a; background: var(--c-bad) }
.pxc__verdict strong { font-weight: 700 }
.pxc__verdict small { display: block; margin-top: 3px; font-size: .8rem; color: var(--c-mute) }
.pxc__verdict-wait { color: var(--c-mute) !important }
.pxc__acts button {
  display: inline-flex; align-items: center; gap: 8px; min-height: 42px; padding: 0 18px; border: 0; cursor: pointer; white-space: nowrap;
  background: var(--c-acc); color: #0e1122; font-size: .88rem; font-weight: 700;
  box-shadow: 0 10px 30px -10px rgba(139,125,255,.8); transition: transform .15s, opacity .2s, box-shadow .2s;
}
.pxc__acts button { justify-content: center }
.pxc__acts button svg { position: static }
.pxc__acts button:hover:not(:disabled) { box-shadow: 0 14px 36px -10px rgba(139,125,255,1) }
.pxc__acts button:active:not(:disabled) { transform: scale(.97) }
.pxc__acts button:disabled { opacity: .45; cursor: default; box-shadow: none }
.pxc__acts button:focus-visible { outline: 2px solid #fff; outline-offset: 2px }
.pxc__acts .pxc__ghost { min-height: 30px; padding: 0 12px; background: transparent; color: var(--c-mute); box-shadow: none; font-weight: 600; font-size: .8rem }
.pxc__acts .pxc__ghost:hover:not(:disabled) { color: var(--c-ink); box-shadow: none }

.pxc__foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 14px; padding: 10px 16px; border-top: 1px solid var(--c-line); font-size: .74rem; color: var(--c-mute) }
.pxc__cov { display: flex; align-items: center; gap: 10px }
.pxc__cov ol { display: flex; gap: 4px; list-style: none; margin: 0; padding: 0 }
.pxc__cov li { width: 22px; height: 8px; background: rgba(230,232,255,.12); transition: background .4s, box-shadow .4s }
.pxc__cov li[data-r="fired"] { background: var(--c-ok); box-shadow: 0 0 10px rgba(52,211,153,.6) }
.pxc__cov li[data-r="missed"] { background: var(--c-bad) }
.pxc__reset { padding: 2px 6px; border: 0; background: none; cursor: pointer; font-size: .74rem; font-weight: 600; color: var(--c-mute); text-decoration: underline; text-underline-offset: 3px }
.pxc__reset:hover { color: var(--c-ink) }
.pxc__reset:focus-visible { outline: 2px solid var(--c-acc); outline-offset: 2px }

@keyframes pxc-in { from { opacity: 0; transform: translateY(5px) } to { opacity: 1; transform: none } }
@keyframes pxc-type { from { opacity: 0; transform: translateX(-6px) } to { opacity: 1; transform: none } }
@keyframes pxc-pop { from { transform: scale(.6) } to { transform: none } }
@keyframes pxc-shake { 0%, 100% { transform: none } 25% { transform: translateX(-3px) } 75% { transform: translateX(3px) } }
@keyframes pxc-blink { 50% { opacity: 0 } }
@media (prefers-reduced-motion: reduce) {
  .pxc *, .pxc *::after { animation: none !important; transition: none !important }
}

@media (max-width: 1060px) {
  .pxh { grid-template-columns: minmax(0, 1fr) }
  .pxc { max-width: 640px }
}
@media (max-width: 640px) {
  .pxc::before { display: none }
  .pxc__title { display: none }
  .pxc__picks { grid-template-columns: 1fr; padding: 12px 12px 0 }
  .pxc__picks button { min-height: 0; padding-right: 64px }
  .pxc__picks code { margin-top: 2px }
  .pxc__picks em { top: 0; bottom: 0; right: 10px; height: fit-content; margin: auto 0 }
  .pxc__pipe { --pad: 8px; padding: 20px var(--pad) 4px }
  .pxc__track { top: 37px }
  .pxc__pipe li { font-size: .6rem }
  .pxc__pipe li i { width: 34px; height: 34px }
  .pxc__log { margin: 12px 12px 0; font-size: .68rem }
  .pxc__log p { grid-template-columns: 44px 1fr }
  .pxc__log time { display: none }
  .pxc__verdict { grid-template-columns: 1fr; margin: 12px 12px 0 }
  .pxc__acts { flex-direction: row }
  .pxc__acts button:first-child { flex: 1 }
}
`;

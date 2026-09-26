"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import Link from "next/link";
import {
  ArrowRight, BellRing, Check, Crosshair, FastForward, FileText, ListFilter, Play, RotateCcw, ScanSearch, Square, Wrench, X,
  type LucideIcon,
} from "lucide-react";

/* Platform hero. A working picture of PurveX as a queue of detection tests.
   Pick a test from the queue, run it, and watch it move through the five
   stages the product checks while the log streams in. A miss stops at the
   stage that broke and says why. The visitor can explain a miss (the
   product's AI-assisted analysis, with a suggested fix), apply the fix and
   rerun it, or run the whole queue at once like a scheduled run.
   Technique IDs are real ATT&CK IDs; hosts, events, and results are examples. */

const STAGES: { name: string; Icon: LucideIcon }[] = [
  { name: "Attack runs", Icon: Crosshair },
  { name: "Log arrives", Icon: FileText },
  { name: "Log is read", Icon: ScanSearch },
  { name: "Rule matches", Icon: ListFilter },
  { name: "Alert fires", Icon: BellRing },
];

type Line = [string, string];

type Test = {
  id: string;
  tactic: string;
  name: string;
  stop: number | null;
  log: Line[];
  why?: string;
  fix?: string;
  fixLog?: Line[];
  explain?: string;
  patch?: { label: string; code: string };
};

const TESTS: Test[] = [
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
    explain:
      "Sysmon recorded a process opening lsass.exe with memory-read access, and your SIEM parsed it cleanly. None of your rules look for that access, so nothing fired. This is how most password theft tools pull credentials out of memory.",
    patch: {
      label: "Suggested rule (Sigma)",
      code: `title: Process access to LSASS memory
logsource:
  product: windows
  category: process_access
detection:
  selection:
    TargetImage|endswith: '\\lsass.exe'
    GrantedAccess: ['0x1010', '0x1410', '0x1438']
  condition: selection
level: critical`,
    },
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
    explain:
      "Windows only records a new scheduled task (event 4698) when object access auditing is on. It is off on WIN-TEST01, so there was nothing to send to your SIEM, and no rule could ever see it.",
    patch: {
      label: "Suggested change (run on the endpoint, or set in Group Policy)",
      code: `auditpol /set /subcategory:"Other Object Access Events" /success:enable`,
    },
    fixLog: [
      ["runner", "Running T1053.005 on WIN-TEST01"],
      ["winlog", "Event 4698: scheduled task created"],
      ["siem", "Event parsed into task fields"],
      ["rule", "Matched: New scheduled task by a user"],
      ["alert", "Sent to the SOC queue, severity Medium"],
    ],
  },
  {
    id: "T1021.001",
    tactic: "Lateral movement",
    name: "Remote Desktop sign-in",
    stop: 2,
    log: [
      ["runner", "Running T1021.001 from WIN-TEST01 to WIN-TEST02"],
      ["winlog", "Event 4624: sign-in type 10"],
      ["siem", "Event arrived, but its sign-in fields were empty"],
    ],
    why: "The log arrived, but your SIEM did not read its fields, so no rule could use it.",
    fix: "Fix the field mapping for Remote Desktop sign-ins, then run the test again.",
    explain:
      "The sign-in event reached your SIEM, but its parser did not map the sign-in type or the source address. Your Remote Desktop rule looks for exactly those fields, so it had nothing to match.",
    patch: {
      label: "Suggested field mapping (event 4624)",
      code: `EventData.LogonType       -> logon.type
EventData.IpAddress       -> source.ip
EventData.TargetUserName  -> user.name
EventData.WorkstationName -> source.host`,
    },
    fixLog: [
      ["runner", "Running T1021.001 from WIN-TEST01 to WIN-TEST02"],
      ["winlog", "Event 4624: sign-in type 10"],
      ["siem", "Event parsed into sign-in fields"],
      ["rule", "Matched: Remote Desktop between workstations"],
      ["alert", "Sent to the SOC queue, severity Medium"],
    ],
  },
  {
    id: "T1110.001",
    tactic: "Credential access",
    name: "Password guessing",
    stop: 4,
    log: [
      ["runner", "Running T1110.001 against WIN-TEST01"],
      ["winlog", "Event 4625: repeated failed sign-ins"],
      ["siem", "Events parsed into sign-in fields"],
      ["rule", "Matched: Many failed sign-ins for one account"],
      ["alert", "Alert sent to a queue nobody watches"],
    ],
    why: "The rule matched, but the alert went to a queue nobody watches.",
    fix: "Route this alert to the SOC queue, then run the test again.",
    explain:
      "The rule matched and the alert was created, but it was routed to a queue with nobody assigned. The detection worked; the people who should act on it never saw it.",
    patch: {
      label: "Suggested routing",
      code: `alert: Many failed sign-ins for one account
severity: high
route_to: soc-tier1
notify: on-call`,
    },
    fixLog: [
      ["runner", "Running T1110.001 against WIN-TEST01"],
      ["winlog", "Event 4625: repeated failed sign-ins"],
      ["siem", "Events parsed into sign-in fields"],
      ["rule", "Matched: Many failed sign-ins for one account"],
      ["alert", "Sent to the SOC queue, severity High"],
    ],
  },
  {
    id: "T1136.001",
    tactic: "Persistence",
    name: "New local account created",
    stop: null,
    log: [
      ["runner", "Running T1136.001 on WIN-TEST01"],
      ["winlog", "Event 4720: user account created"],
      ["siem", "Event parsed into account fields"],
      ["rule", "Matched: Local account created outside IT"],
      ["alert", "Sent to the SOC queue, severity Medium"],
    ],
  },
];

const STEP_MS = 600;
// Run all moves faster so six tests finish in about ten seconds.
const BATCH_MS = 220;
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
type Filter = "all" | "missed" | "fired" | "open";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "missed", label: "Missed" },
  { key: "fired", label: "Fired" },
  { key: "open", label: "Not run" },
];

const LABEL: Record<string, string> = { open: "Not run", running: "Running", fired: "Fired", missed: "Missed", fixed: "Fixed" };

// A fixed test passes every stage and logs its repaired run.
function effective(test: Test, isFixed: boolean): Test {
  return isFixed && test.fixLog ? { ...test, stop: null, log: test.fixLog } : test;
}

function stamp(k: number) {
  return `09:41:${String(2 + k * 3).padStart(2, "0")}`;
}

function Queue() {
  const reduced = useReducedMotion();
  const [pick, setPick] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [step, setStep] = useState(-1);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [fixed, setFixed] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<Filter>("all");
  const [view, setView] = useState<"log" | "why">("log");
  const [typed, setTyped] = useState(0);
  const [batch, setBatch] = useState<{ at: number; total: number } | null>(null);
  const [summary, setSummary] = useState<{ fired: number; missed: number; first: number } | null>(null);
  const timers = useRef<number[]>([]);
  const chain = useRef<number[]>([]);
  const rows = useRef<(HTMLButtonElement | null)[]>([]);
  const base = TESTS[pick];
  const t = effective(base, !!fixed[base.id]);

  function clear() {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }

  function clearChain() {
    chain.current.forEach(window.clearTimeout);
    chain.current = [];
  }

  function run(i: number, withFix = !!fixed[TESTS[i].id], ms = STEP_MS) {
    clear();
    setView("log");
    const test = effective(TESTS[i], withFix);
    const end = test.stop ?? STAGES.length - 1;
    const done = () => {
      setPhase("done");
      setResults((r) => ({ ...r, [test.id]: test.stop === null ? "fired" : "missed" }));
    };
    if (reduced) {
      setStep(end);
      done();
      return;
    }
    setPhase("running");
    setStep(-1);
    for (let k = 0; k <= end; k++) {
      timers.current.push(window.setTimeout(() => setStep(k), ms * (k + 1)));
    }
    timers.current.push(window.setTimeout(done, ms * (end + 1) + (ms === STEP_MS ? 400 : 200)));
  }

  // Every test, back to back, like a scheduled run.
  function runAll() {
    if (batch) {
      clearChain();
      clear();
      setBatch(null);
      setPhase("idle");
      setStep(-1);
      return;
    }
    clearChain();
    setSummary(null);
    setFilter("all");
    const outcome = TESTS.map((x) => effective(x, !!fixed[x.id]));
    const fired = outcome.filter((x) => x.stop === null).length;
    const first = outcome.findIndex((x) => x.stop !== null);
    const wrap = () => {
      setBatch(null);
      setSummary({ fired, missed: TESTS.length - fired, first });
    };
    if (reduced) {
      setResults(Object.fromEntries(outcome.map((x) => [x.id, x.stop === null ? "fired" : "missed"])));
      const last = TESTS.length - 1;
      setPick(last);
      setStep(outcome[last].stop ?? STAGES.length - 1);
      setPhase("done");
      wrap();
      return;
    }
    let at = 0;
    outcome.forEach((x, i) => {
      chain.current.push(
        window.setTimeout(() => {
          setBatch({ at: i + 1, total: TESTS.length });
          setPick(i);
          run(i, !!fixed[x.id], BATCH_MS);
        }, at),
      );
      at += BATCH_MS * ((x.stop ?? STAGES.length - 1) + 1) + 200 + 380;
    });
    chain.current.push(window.setTimeout(wrap, at));
  }

  function explain() {
    setTyped(reduced ? 9999 : 0);
    setView("why");
  }


  // Play the first test once so the visitor sees a full run.
  useEffect(() => {
    const id = window.setTimeout(() => run(0), 800);
    return () => {
      window.clearTimeout(id);
      clear();
      clearChain();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Type the analysis out, the way the product's assistant answers.
  const whyText = TESTS[pick].explain ?? "";
  useEffect(() => {
    if (view !== "why" || typed >= whyText.length) return;
    const id = window.setTimeout(() => setTyped((n) => n + 3), 14);
    return () => window.clearTimeout(id);
  }, [view, typed, whyText]);

  function choose(i: number) {
    if (batch || phase === "running" || i === pick) return;
    clear();
    setView("log");
    setPick(i);
    // A test that ran before shows its last result; a new one waits to be run.
    if (results[TESTS[i].id]) {
      const test = effective(TESTS[i], !!fixed[TESTS[i].id]);
      setStep(test.stop ?? STAGES.length - 1);
      setPhase("done");
    } else {
      setStep(-1);
      setPhase("idle");
    }
  }

  function applyFix() {
    setFixed((f) => ({ ...f, [base.id]: true }));
    run(pick, true);
  }

  function reset() {
    clear();
    clearChain();
    setBatch(null);
    setSummary(null);
    setView("log");
    setResults({});
    setFixed({});
    setFilter("all");
    setPick(0);
    setPhase("idle");
    setStep(-1);
  }

  const statusOf = (x: Test) =>
    phase === "running" && x.id === base.id
      ? "running"
      : results[x.id] === "missed"
        ? "missed"
        : results[x.id]
          ? fixed[x.id] ? "fixed" : "fired"
          : "open";

  const matches = (x: Test, f: Filter) => {
    const s = statusOf(x);
    if (f === "all") return true;
    if (f === "missed") return s === "missed";
    if (f === "fired") return s === "fired" || s === "fixed";
    return s === "open";
  };

  const shown = TESTS.map((x, i) => ({ x, i })).filter(({ x }) => matches(x, filter));
  const count = (f: Filter) => TESTS.filter((x) => matches(x, f)).length;

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const d = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!d || shown.length === 0) return;
    e.preventDefault();
    const at = Math.max(0, shown.findIndex((r) => r.i === pick));
    const next = shown[(at + d + shown.length) % shown.length].i;
    choose(next);
    rows.current[next]?.focus();
  }

  function stateOf(k: number) {
    if (k > step) return "wait";
    return t.stop === k ? "fail" : "ok";
  }

  const end = t.stop ?? STAGES.length - 1;
  const progress = step < 0 ? 0 : Math.min(step, end) / (STAGES.length - 1);
  const verdict: Result | null = phase === "done" ? (t.stop === null ? "fired" : "missed") : null;
  const wasFixed = !!fixed[base.id];
  const baseStatus = statusOf(base);

  return (
    <div className="pq" data-verdict={verdict ?? phase}>
      <header className="pq__bar">
        <span className="pq__brand"><b />PurveX</span>
        <span className="pq__title">Detection tests</span>
        <button type="button" className="pq__runall" data-on={batch ? "1" : "0"} onClick={runAll} disabled={!batch && phase === "running"}>
          {batch ? <><Square size={12} /> Stop · {batch.at} of {batch.total}</> : <><FastForward size={14} /> Run all</>}
        </button>
        <div className="pq__filters" role="tablist" aria-label="Filter tests">
          {FILTERS.map((f) => (
            <button key={f.key} type="button" role="tab" aria-selected={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label}
              <span>{count(f.key)}</span>
            </button>
          ))}
        </div>
      </header>

      {summary && !batch && (
        <div className="pq__summary" role="status">
          <b>{summary.missed === 0 ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}</b>
          <p>
            <strong>Run complete.</strong> {summary.fired} of {TESTS.length} alerts fired.
            {summary.missed > 0 && ` ${summary.missed} ${summary.missed === 1 ? "miss" : "misses"} to fix.`}
          </p>
          {summary.missed > 0 && (
            <button
              type="button"
              onClick={() => {
                setFilter("missed");
                setSummary(null);
                if (summary.first >= 0) choose(summary.first);
              }}
            >
              Show misses
            </button>
          )}
          <button type="button" className="pq__summary-x" aria-label="Dismiss" onClick={() => setSummary(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      <div className="pq__body">
        <div className="pq__list" role="listbox" aria-label="Test queue" onKeyDown={onKey}>
          {shown.length === 0 && <p className="pq__empty">No tests here yet.</p>}
          {shown.map(({ x, i }) => {
            const s = statusOf(x);
            return (
              <button
                key={x.id}
                ref={(el) => { rows.current[i] = el; }}
                type="button"
                role="option"
                aria-selected={i === pick}
                tabIndex={i === pick ? 0 : -1}
                data-s={s}
                onClick={() => choose(i)}
              >
                <i aria-hidden="true">
                  {(s === "fired" || s === "fixed") && <Check size={12} strokeWidth={3.2} />}
                  {s === "missed" && <X size={12} strokeWidth={3.2} />}
                </i>
                <span className="pq__row">
                  <strong>{x.name}</strong>
                  <small><code>{x.id}</code>{x.tactic}</small>
                </span>
                <em>{LABEL[s]}</em>
              </button>
            );
          })}
        </div>

        <section className="pq__detail" aria-live="polite">
          <div className="pq__head" key={`h-${base.id}`}>
            <div>
              <p className="pq__meta"><code>{base.id}</code><span>{base.tactic}</span><span>WIN-TEST01</span></p>
              <h3>{base.name}</h3>
            </div>
            <em className="pq__pill" data-s={baseStatus} key={baseStatus}>{LABEL[baseStatus]}</em>
          </div>

          <div className="pq__pipe">
            <div className="pq__track" aria-hidden="true">
              <span
                style={{ ["--p" as string]: progress }}
                data-fail={verdict === "missed" || (phase === "running" && t.stop !== null && step >= end) ? "1" : "0"}
              />
            </div>
            <ol aria-label="Test stages">
              {STAGES.map(({ name, Icon }, k) => {
                const s = stateOf(k);
                return (
                  <li key={name} data-s={s}>
                    <i>
                      {s === "fail" ? <X size={15} strokeWidth={2.6} /> : <Icon size={15} strokeWidth={2} />}
                      {s === "ok" && <b><Check size={9} strokeWidth={4} /></b>}
                    </i>
                    <span>{name}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="pq__tabs" role="tablist" aria-label="Test detail">
            <button type="button" role="tab" aria-selected={view === "log"} onClick={() => setView("log")}>Run log</button>
            <button type="button" role="tab" aria-selected={view === "why"} onClick={explain} disabled={verdict !== "missed" || !base.explain}>
              Analysis
            </button>
          </div>

          {view === "why" && base.explain ? (
            <div className="pq__why" key={`why-${base.id}`}>
              <p>
                {base.explain.slice(0, typed)}
                {typed < base.explain.length && <i className="pq__caret" />}
              </p>
              {typed >= base.explain.length && base.patch && (
                <div className="pq__patch">
                  <header>{base.patch.label}</header>
                  <pre><code>{base.patch.code}</code></pre>
                </div>
              )}
            </div>
          ) : (
          <div className="pq__log" aria-hidden="true">
            {step < 0 ? (
              <p className="pq__log-idle">{phase === "running" ? "Starting the test runner" : "This test has not run yet"}</p>
            ) : (
              t.log.slice(0, step + 1).map(([src, line], k) => (
                <p key={`${t.id}-${wasFixed}-${k}`} data-fail={t.stop === k ? "1" : "0"}>
                  <time>{stamp(k)}</time>
                  <b>{src}</b>
                  <span>{line}</span>
                </p>
              ))
            )}
          </div>
          )}

          <div className="pq__verdict">
            <div className="pq__say">
              {verdict === "fired" && (
                <p key={wasFixed ? "fx" : "f"}>
                  <b><Check size={14} strokeWidth={3} /></b>
                  {wasFixed ? (
                    <span><strong>Fixed and proven.</strong> The alert fires now, and the run is kept as evidence.</span>
                  ) : (
                    <span><strong>Alert fired.</strong> This detection works.</span>
                  )}
                </p>
              )}
              {verdict === "missed" && (
                <p key="m">
                  <b><X size={14} strokeWidth={3} /></b>
                  <span>
                    <strong>Missed at {STAGES[t.stop ?? 0].name.toLowerCase()}.</strong> {t.why}
                    <small>{t.fix}</small>
                  </span>
                </p>
              )}
              {!verdict && (
                <p key="w" className="pq__wait">
                  {phase === "running" ? "Checking your SIEM for the result" : "Run this test to see if the alert fires."}
                </p>
              )}
            </div>
            <div className="pq__acts">
              {verdict === "missed" ? (
                <>
                  <button type="button" onClick={applyFix} disabled={!!batch}><Wrench size={15} /> Fix and rerun</button>
                  <div className="pq__minor">
                    {view !== "why" && base.explain && (
                      <button type="button" className="pq__ghost" onClick={explain} disabled={!!batch}>Explain the miss</button>
                    )}
                    <button type="button" className="pq__ghost" onClick={() => run(pick)} disabled={!!batch}>Run again</button>
                  </div>
                </>
              ) : (
                <button type="button" onClick={() => run(pick)} disabled={phase === "running" || !!batch}>
                  {phase === "done" ? <><RotateCcw size={15} /> Run again</> : <><Play size={15} /> Run test</>}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>

      <footer className="pq__foot">
        <div className="pq__cov">
          <ol aria-hidden="true">
            {TESTS.map((x) => <li key={x.id} data-s={statusOf(x)} />)}
          </ol>
          <span>Coverage: {count("fired")} of {TESTS.length} alerts proven</span>
        </div>
        <div className="pq__foot-end">
          <span>Example results</span>
          {Object.keys(results).length > 0 && phase !== "running" && !batch && (
            <button type="button" className="pq__reset" onClick={reset}>Reset</button>
          )}
        </div>
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
      <Queue />
      <style>{PXH_CSS}</style>
    </section>
  );
}

const PXH_CSS = `
.pxh { padding: clamp(40px, 6vw, 76px) 0 0 }
.pxh__copy { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "tag tag" "h1 h1" "sub act"; align-items: end; gap: 0 40px }
.pxh__copy .sp-tag { grid-area: tag; justify-self: start }
.pxh h1 {
  grid-area: h1; margin: 18px 0 0; max-width: 16ch; font-family: var(--font-display); font-weight: 500;
  font-size: clamp(2.4rem, 5vw, 4rem); line-height: 1.02; letter-spacing: -.05em; color: var(--ink);
}
.pxh h1 span { color: var(--accent-deep) }
.pxh__sub { grid-area: sub; margin: 20px 0 0; max-width: 50ch; color: var(--ink-soft); font-size: 1.1rem; line-height: 1.6 }
.pxh__actions { grid-area: act; display: flex; flex-wrap: wrap; gap: 12px }
.pxh__actions .sp-btn:active { transform: translateY(1px) scale(.98) }

/* queue console */
.pq {
  --q-line: #e8e9f3; --q-soft: #f7f7fc; --q-ok: #16a34a; --q-bad: #dc2626;
  position: relative; margin-top: 40px; background: #fff; border: 1px solid #e3e4f0;
  box-shadow: 0 1px 0 #fff inset, 0 50px 90px -50px rgba(42,34,128,.35), 0 18px 36px -28px rgba(42,34,128,.25);
}
.pq::before {
  content: ""; position: absolute; left: 10%; right: 10%; top: -80px; height: 160px; z-index: -1; pointer-events: none;
  background: radial-gradient(closest-side, rgba(106,92,255,.16), transparent);
}

.pq__bar { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border-bottom: 1px solid var(--q-line); background: linear-gradient(180deg, #fff, #fafaff) }
.pq__brand { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-display); font-weight: 600; font-size: .95rem; color: var(--ink) }
.pq__brand b { width: 10px; height: 10px; background: var(--accent) }
.pq__title { font-size: .86rem; color: var(--muted) }
.pq__runall {
  display: inline-flex; align-items: center; gap: 7px; min-height: 32px; margin-left: auto; padding: 0 12px; cursor: pointer;
  font-size: .8rem; font-weight: 650; color: var(--accent-deep); background: var(--accent-soft); border: 1px solid rgba(106,92,255,.3);
  transition: background .2s, color .2s, box-shadow .2s;
}
.pq__runall svg { position: static }
.pq__runall[data-on="0"]:hover:not(:disabled) { background: #fff; box-shadow: 0 6px 16px -10px rgba(85,70,224,.8) }
.pq__runall[data-on="1"]:hover { background: #2a2280 }
.pq__runall[data-on="1"] { color: #fff; background: var(--accent-deep); border-color: var(--accent-deep) }
.pq__runall:disabled { opacity: .5; cursor: default }
.pq__runall:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
.pq__filters { display: flex; gap: 2px; padding: 3px; background: var(--q-soft); border: 1px solid var(--q-line) }
.pq__filters button {
  display: inline-flex; align-items: center; gap: 6px; min-height: 30px; padding: 0 10px; border: 0; background: none; cursor: pointer;
  font-size: .8rem; font-weight: 600; color: var(--ink-soft); transition: background .2s, color .2s, box-shadow .2s;
}
.pq__filters button span { min-width: 18px; padding: 0 5px; font-size: .7rem; font-weight: 700; color: var(--muted); background: #fff; border: 1px solid var(--q-line) }
.pq__filters button[aria-selected="true"] { background: #fff; color: var(--accent-deep); box-shadow: 0 1px 3px rgba(42,34,128,.12) }
.pq__filters button[aria-selected="true"] span { color: var(--accent-deep); border-color: rgba(106,92,255,.3) }
.pq__filters button:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px }

.pq__summary {
  display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--q-line);
  background: linear-gradient(90deg, rgba(106,92,255,.08), rgba(106,92,255,.02)); animation: pq-in .35s cubic-bezier(.16,1,.3,1) both;
}
.pq__summary > b { display: grid; place-items: center; width: 22px; height: 22px; flex: none; color: #fff; background: var(--q-bad) }
.pq__summary > b svg { position: static }
.pq__summary p { flex: 1; margin: 0; font-size: .86rem; color: var(--ink) }
.pq__summary > button { min-height: 30px; padding: 0 12px; border: 1px solid rgba(106,92,255,.35); background: #fff; cursor: pointer; font-size: .8rem; font-weight: 650; color: var(--accent-deep) }
.pq__summary > button:hover { background: var(--accent-soft) }
.pq__summary .pq__summary-x { display: grid; place-items: center; width: 30px; padding: 0; border-color: transparent; background: none; color: var(--muted) }
.pq__summary .pq__summary-x svg { position: static }
.pq__body { display: grid; grid-template-columns: minmax(0, 340px) minmax(0, 1fr); min-height: 440px }

/* list */
.pq__list { display: flex; flex-direction: column; padding: 8px; border-right: 1px solid var(--q-line); background: var(--q-soft) }
.pq__empty { margin: 0; padding: 20px 12px; font-size: .86rem; color: var(--muted) }
.pq__list button {
  position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 12px;
  width: 100%; padding: 11px 12px; text-align: left; background: transparent; border: 1px solid transparent; cursor: pointer; color: var(--ink);
  transition: background .2s, border-color .2s, box-shadow .2s;
}
.pq__list button + button { margin-top: 2px }
.pq__list button:hover { background: #fff }
.pq__list button[aria-selected="true"] { background: #fff; border-color: var(--q-line); box-shadow: 0 8px 20px -14px rgba(42,34,128,.4) }
.pq__list button[aria-selected="true"]::before { content: ""; position: absolute; left: -1px; top: -1px; bottom: -1px; width: 3px; background: var(--accent) }
.pq__list button:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px }
.pq__list i { display: grid; place-items: center; width: 22px; height: 22px; border: 2px solid #cfd1e2; color: #fff; transition: background .25s, border-color .25s }
.pq__list i svg { position: static }
.pq__list button[data-s="fired"] i, .pq__list button[data-s="fixed"] i { background: var(--q-ok); border-color: var(--q-ok) }
.pq__list button[data-s="missed"] i { background: var(--q-bad); border-color: var(--q-bad) }
.pq__list button[data-s="running"] i { border-color: var(--accent); border-right-color: transparent; border-radius: 50%; animation: pq-rot .8s linear infinite }
.pq__row { min-width: 0 }
.pq__row strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .9rem; font-weight: 600 }
.pq__row small { display: block; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .76rem; color: var(--muted) }
.pq__row code { margin-right: 8px; font-family: var(--font-mono); font-size: .72rem; color: var(--accent-deep) }
.pq__list em { font-style: normal; font-size: .72rem; font-weight: 700; color: var(--muted) }
.pq__list button[data-s="fired"] em, .pq__list button[data-s="fixed"] em { color: var(--q-ok) }
.pq__list button[data-s="missed"] em { color: var(--q-bad) }
.pq__list button[data-s="running"] em { color: var(--accent-deep) }

/* detail */
.pq__detail { display: flex; flex-direction: column; padding: 20px 22px 18px; min-width: 0 }
.pq__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; animation: pq-in .3s cubic-bezier(.16,1,.3,1) both }
.pq__meta { display: flex; flex-wrap: wrap; gap: 6px; margin: 0 }
.pq__meta code, .pq__meta span { padding: 2px 8px; font-size: .74rem; font-weight: 600; background: var(--q-soft); border: 1px solid var(--q-line); color: var(--ink-soft) }
.pq__meta code { font-family: var(--font-mono); color: var(--accent-deep); background: var(--accent-soft); border-color: rgba(106,92,255,.2) }
.pq__head h3 { margin: 10px 0 0; font-family: var(--font-display); font-size: 1.45rem; font-weight: 600; letter-spacing: -.03em; color: var(--ink) }
.pq__pill { flex: none; padding: 4px 10px; font-style: normal; font-size: .76rem; font-weight: 700; color: var(--ink-soft); background: var(--q-soft); border: 1px solid var(--q-line); animation: pq-in .3s cubic-bezier(.16,1,.3,1) both }
.pq__pill[data-s="running"] { color: var(--accent-deep); background: var(--accent-soft); border-color: rgba(106,92,255,.3) }
.pq__pill[data-s="fired"], .pq__pill[data-s="fixed"] { color: #fff; background: var(--q-ok); border-color: var(--q-ok) }
.pq__pill[data-s="missed"] { color: #fff; background: var(--q-bad); border-color: var(--q-bad) }

.pq__pipe { position: relative; margin-top: 22px }
.pq__track { position: absolute; left: 10%; right: 10%; top: 19px; height: 2px; background: var(--q-line) }
.pq__track span {
  position: absolute; left: 0; top: 0; height: 100%; width: calc(var(--p) * 100%); background: var(--accent);
  transition: width .5s cubic-bezier(.16,1,.3,1), background .3s;
}
.pq__track span::after { content: ""; position: absolute; right: -5px; top: -4px; width: 10px; height: 10px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px rgba(106,92,255,.2) }
.pq__track span[data-fail="1"] { background: var(--q-bad) }
.pq__track span[data-fail="1"]::after { background: var(--q-bad); box-shadow: 0 0 0 4px rgba(220,38,38,.18) }
.pq__pipe ol { position: relative; display: grid; grid-template-columns: repeat(5, 1fr); list-style: none; margin: 0; padding: 0 }
.pq__pipe li { display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; font-size: .74rem; font-weight: 600; color: var(--muted) }
.pq__pipe li i {
  position: relative; display: grid; place-items: center; width: 40px; height: 40px; background: #fff; border: 1px solid #d9dbea; color: #9a9cb8;
  transition: background .3s, border-color .3s, color .3s, box-shadow .3s;
}
.pq__pipe li i svg { position: static }
.pq__pipe li i b { position: absolute; top: -6px; right: -6px; display: grid; place-items: center; width: 16px; height: 16px; background: var(--q-ok); color: #fff; animation: pq-pop .3s cubic-bezier(.16,1,.3,1) both }
.pq__pipe li i b svg { position: static }
.pq__pipe li[data-s="ok"] { color: var(--ink) }
.pq__pipe li[data-s="ok"] i { background: var(--accent); border-color: var(--accent); color: #fff; box-shadow: 0 10px 22px -12px rgba(85,70,224,.8); animation: pq-pop .35s cubic-bezier(.16,1,.3,1) both }
.pq__pipe li[data-s="fail"] { color: var(--q-bad) }
.pq__pipe li[data-s="fail"] i { background: var(--q-bad); border-color: var(--q-bad); color: #fff; box-shadow: 0 10px 22px -12px rgba(220,38,38,.8); animation: pq-shake .45s ease both }

.pq__tabs { display: flex; gap: 18px; margin-top: 18px; border-bottom: 1px solid var(--q-line) }
.pq__tabs button {
  position: relative; padding: 6px 0 9px; border: 0; background: none; cursor: pointer; font-size: .8rem; font-weight: 650; color: var(--muted);
  transition: color .2s;
}
.pq__tabs button[aria-selected="true"] { color: var(--accent-deep) }
.pq__tabs button[aria-selected="true"]::after { content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; background: var(--accent) }
.pq__tabs button:disabled { opacity: .45; cursor: default }
.pq__tabs button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
.pq__why { flex: 1; min-height: 132px; margin-top: 12px; padding: 14px; background: #fff; border: 1px solid rgba(106,92,255,.25); box-shadow: 0 0 0 4px rgba(106,92,255,.05) }
.pq__why > p { margin: 0; font-size: .9rem; line-height: 1.55; color: var(--ink) }
.pq__caret { display: inline-block; width: 7px; height: 1em; margin-left: 2px; vertical-align: -2px; background: var(--accent); animation: pq-blink .8s steps(1) infinite }
.pq__patch { margin-top: 12px; border: 1px solid var(--q-line); animation: pq-in .35s cubic-bezier(.16,1,.3,1) both }
.pq__patch header { padding: 7px 10px; background: var(--q-soft); border-bottom: 1px solid var(--q-line); font-size: .74rem; font-weight: 650; color: var(--ink-soft) }
.pq__patch pre { margin: 0; padding: 10px 12px; overflow-x: auto; background: #151a33; color: #e6e8ff; font-family: var(--font-mono); font-size: .74rem; line-height: 1.55 }
.pq__log { flex: 1; min-height: 132px; margin-top: 12px; padding: 12px 14px; background: var(--q-soft); border: 1px solid var(--q-line); font-family: var(--font-mono); font-size: .76rem; line-height: 1.6 }
.pq__log p { display: grid; grid-template-columns: auto 54px 1fr; gap: 10px; margin: 0 0 2px; color: var(--ink); animation: pq-type .3s cubic-bezier(.16,1,.3,1) both }
.pq__log time { color: #a2a4bd }
.pq__log b { font-weight: 600; color: var(--accent-deep) }
.pq__log p[data-fail="1"], .pq__log p[data-fail="1"] b { color: var(--q-bad) }
.pq__log-idle { display: block !important; color: var(--muted) !important }

.pq__verdict { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 16px; margin-top: 16px; min-height: 66px }
.pq__say p { display: flex; align-items: flex-start; gap: 10px; margin: 0; font-size: .9rem; line-height: 1.45; color: var(--ink); animation: pq-in .3s cubic-bezier(.16,1,.3,1) both }
.pq__say p b { display: grid; place-items: center; width: 24px; height: 24px; flex: none; color: #fff; background: var(--q-ok) }
.pq__say p b svg { position: static }
.pq[data-verdict="missed"] .pq__say p b { background: var(--q-bad) }
.pq__say small { display: block; margin-top: 3px; font-size: .82rem; color: var(--muted) }
.pq__wait { color: var(--muted) !important }
.pq__acts { display: flex; flex-direction: column; align-items: stretch; gap: 6px }
.pq__acts button {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 0 18px; border: 0; cursor: pointer; white-space: nowrap;
  background: var(--accent-deep); color: #fff; font-size: .88rem; font-weight: 650;
  box-shadow: 0 12px 24px -14px rgba(85,70,224,.9); transition: transform .15s, opacity .2s, box-shadow .2s;
}
.pq__acts button svg { position: static }
.pq__acts button:hover:not(:disabled) { box-shadow: 0 16px 30px -14px rgba(85,70,224,1) }
.pq__acts button:active:not(:disabled) { transform: scale(.97) }
.pq__acts button:disabled { opacity: .45; cursor: default; box-shadow: none }
.pq__acts button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }
.pq__minor { display: flex; justify-content: center; gap: 4px }
.pq__acts .pq__ghost { min-height: 30px; padding: 0 8px; background: transparent; color: var(--ink-soft); box-shadow: none; font-size: .8rem; font-weight: 600 }
.pq__acts .pq__ghost:hover:not(:disabled) { color: var(--accent-deep); box-shadow: none }

.pq__foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 11px 16px; border-top: 1px solid var(--q-line); background: #fafaff; font-size: .78rem; color: var(--muted) }
.pq__cov { display: flex; align-items: center; gap: 10px }
.pq__cov ol { display: flex; gap: 3px; list-style: none; margin: 0; padding: 0 }
.pq__cov li { width: 18px; height: 8px; background: #e3e4f0; transition: background .4s }
.pq__cov li[data-s="fired"], .pq__cov li[data-s="fixed"] { background: var(--q-ok) }
.pq__cov li[data-s="missed"] { background: var(--q-bad) }
.pq__cov li[data-s="running"] { background: var(--accent) }
.pq__foot-end { display: flex; align-items: center; gap: 14px }
.pq__reset { padding: 2px 4px; border: 0; background: none; cursor: pointer; font-size: .78rem; font-weight: 600; color: var(--ink-soft); text-decoration: underline; text-underline-offset: 3px }
.pq__reset:hover { color: var(--accent-deep) }
.pq__reset:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px }

@keyframes pq-in { from { opacity: 0; transform: translateY(5px) } to { opacity: 1; transform: none } }
@keyframes pq-type { from { opacity: 0; transform: translateX(-6px) } to { opacity: 1; transform: none } }
@keyframes pq-pop { from { transform: scale(.6) } to { transform: none } }
@keyframes pq-shake { 0%, 100% { transform: none } 25% { transform: translateX(-3px) } 75% { transform: translateX(3px) } }
@keyframes pq-rot { to { transform: rotate(360deg) } }
@keyframes pq-blink { 50% { opacity: 0 } }
@media (prefers-reduced-motion: reduce) {
  .pq *, .pq *::after { animation: none !important; transition: none !important }
}

@media (max-width: 900px) {
  .pxh__copy { grid-template-columns: minmax(0, 1fr); grid-template-areas: "tag" "h1" "sub" "act" }
  .pxh__actions { margin-top: 24px }
  .pq__body { grid-template-columns: minmax(0, 1fr) }
  .pq__list { flex-direction: row; overflow-x: auto; gap: 6px; border-right: 0; border-bottom: 1px solid var(--q-line); scroll-snap-type: x mandatory }
  .pq__list button { flex: none; width: 240px; scroll-snap-align: start }
  .pq__list button + button { margin-top: 0 }
}
@media (max-width: 640px) {
  .pq__bar { flex-wrap: wrap }
  .pq__title { display: none }
  .pq__runall { margin-left: auto }
  .pq__filters { width: 100%; margin-left: 0 }
  .pq__summary { flex-wrap: wrap }
  .pq__filters button { flex: 1; justify-content: center; padding: 0 4px; font-size: .74rem }
  .pq__detail { padding: 16px 14px }
  .pq__head h3 { font-size: 1.2rem }
  .pq__pipe li { font-size: .6rem }
  .pq__pipe li i { width: 34px; height: 34px }
  .pq__track { top: 16px }
  .pq__log { font-size: .68rem }
  .pq__log p { grid-template-columns: 46px 1fr }
  .pq__log time { display: none }
  .pq__verdict { grid-template-columns: minmax(0, 1fr) }
  .pq__acts { flex-direction: row }
  .pq__acts button:first-child { flex: 1 }
  .pq__foot { flex-wrap: wrap }
}
`;

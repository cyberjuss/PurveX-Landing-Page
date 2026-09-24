import { ArrowRight } from "lucide-react";
import {
  IconAI, IconAlert, IconChain, IconCoverage, IconEvidence, IconLog, IconOptIn, IconParser, IconReadOnly,
  IconRecord, IconRule, IconTicket, IconValidate, type BrandIcon,
} from "./brand-icons";

/* Product visuals for the Labs page. The detection chain is the recurring
   idea: Telemetry, Parser, Rule, Alert, Ticket. Values are illustrative. */

export const STAGES: { name: string; Icon: BrandIcon }[] = [
  { name: "Telemetry", Icon: IconLog },
  { name: "Parser", Icon: IconParser },
  { name: "Rule", Icon: IconRule },
  { name: "Alert", Icon: IconAlert },
  { name: "Ticket", Icon: IconTicket },
];

type StageState = "ok" | "fail" | "skip";

const RESULTS: { name: string; result: "Fired" | "Missed"; chain: StageState[] }[] = [
  { name: "PowerShell Execution", result: "Fired", chain: ["ok", "ok", "ok", "ok", "ok"] },
  { name: "Scheduled Task", result: "Fired", chain: ["ok", "ok", "ok", "ok", "ok"] },
  { name: "LSASS Memory", result: "Missed", chain: ["ok", "fail", "skip", "skip", "skip"] },
];

/** The hero: one test, one broken chain, and the evidence it produced. */
export function AssuranceConsole() {
  const lsass: StageState[] = ["ok", "fail", "skip", "skip", "skip"];
  return (
    <aside className="as-floor" aria-hidden="true">
      <div className="as-floor__wash" />
      <div className="as-sheet">
        <header>
          <span>RUN-14</span>
          <em>Executed 09:02</em>
          <span>SIEM: Splunk</span>
        </header>
        <h2>LSASS memory access</h2>
        <p className="as-sheet__sub">T1003.001 on WIN-DC02</p>
        <ol className="as-chain">
          {STAGES.map((s, i) => (
            <li key={s.name} data-s={lsass[i]} style={{ ["--i" as string]: i }}>
              <i><s.Icon size={20} /></i>
              <b>{s.name}</b>
              <span>{lsass[i] === "ok" ? "Observed" : lsass[i] === "fail" ? "Failed" : "Not reached"}</span>
            </li>
          ))}
        </ol>
        <div className="as-cause">
          <i><IconAI size={20} /></i>
          <div>
            <b>Root cause: parser drift</b>
            <p>The event arrives, but the field the rule reads is dropped before it is evaluated.</p>
          </div>
        </div>
      </div>
      <div className="as-dock">
        <p>
          <span><i className="as-live" /> Validation</span>
          <strong>95<small>/100</small></strong>
        </p>
        <div className="as-score"><i /></div>
        {RESULTS.map((r) => (
          <div key={r.name} className="as-row">
            <span>{r.name}</span>
            <span className="as-mini">
              {r.chain.map((c, i) => (
                <i key={i} data-s={c} />
              ))}
            </span>
            <em data-r={r.result}>{r.result}</em>
          </div>
        ))}
        <footer><IconEvidence size={14} /> Evidence saved with every result</footer>
      </div>
    </aside>
  );
}

/** A rule that exists, next to a rule that works. */
export function ProvenChain() {
  return (
    <div className="pv" data-r>
      {(["assumed", "proven"] as const).map((k) => (
        <div key={k} className="pv__row" data-k={k}>
          <span className="pv__label">{k === "assumed" ? "A rule that exists" : "A rule that works"}</span>
          <ol>
            {STAGES.map((s, i) => (
              <li key={s.name} style={{ ["--i" as string]: i }}>
                <i>
                  <s.Icon size={24} />
                  <u>{k === "assumed" ? "?" : "✓"}</u>
                </i>
                <b>{s.name}</b>
                <em>{k === "assumed" ? "Assumed" : "Proven"}</em>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

const PAIRS: { without: string; withText: string; a: string; b: string; Icon: BrandIcon }[] = [
  { without: "Uncertain", withText: "Tested", a: "Nobody knows whether the rule fires.", b: "Every rule runs against real attack behavior.", Icon: IconValidate },
  { without: "Manual", withText: "Measured", a: "Coverage lives in a spreadsheet.", b: "Coverage is scored after every run.", Icon: IconCoverage },
  { without: "Assumed", withText: "Isolated", a: "A silent rule stays a mystery.", b: "The failing stage is named.", Icon: IconChain },
  { without: "Disconnected", withText: "Evidenced", a: "Proof is scattered across tools.", b: "Each result is kept with its evidence.", Icon: IconEvidence },
];

export function Comparison() {
  return (
    <div className="wv" data-r>
      <div className="wv__head">
        <span>Without PurveX</span>
        <span />
        <span>With PurveX</span>
      </div>
      <ul>
        {PAIRS.map((p) => (
          <li key={p.without}>
            <div className="wv__without">
              <i><p.Icon size={22} /></i>
              <div>
                <strong>{p.without}</strong>
                <p>{p.a}</p>
              </div>
            </div>
            <span className="wv__arrow"><ArrowRight size={18} /></span>
            <div className="wv__with">
              <i><p.Icon size={22} /></i>
              <div>
                <strong>{p.withText}</strong>
                <p>{p.b}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const PATHS: { who: string; body: string; on: number[] }[] = [
  { who: "Detection engineers", body: "See which stage failed, and fix the parser or the rule with confidence.", on: [1, 2] },
  { who: "SOC managers", body: "Know which alerts reach analysts as tickets and which stay silent.", on: [3, 4] },
  { who: "Security leadership", body: "Show measured coverage and steady improvement, backed by evidence.", on: [0, 1, 2, 3, 4] },
];

export function Pathways() {
  return (
    <ol className="pw" data-r>
      {PATHS.map((p) => (
        <li key={p.who}>
          <div>
            <h3>{p.who}</h3>
            <p>{p.body}</p>
          </div>
          <div className="pw__track" aria-hidden="true">
            {STAGES.map((s, i) => (
              <span key={s.name} data-on={p.on.includes(i)}>
                <i><s.Icon size={16} /></i>
                <b>{s.name}</b>
              </span>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

const TRUST: { label: string; note: string; Icon: BrandIcon }[] = [
  { label: "Read-only", note: "by default on your SIEM", Icon: IconReadOnly },
  { label: "Auditable", note: "every run is recorded", Icon: IconEvidence },
  { label: "Explicit opt-in", note: "before any production test", Icon: IconOptIn },
  { label: "System of record", note: "stays your SIEM", Icon: IconRecord },
];

export function TrustStrip() {
  return (
    <ul className="ts" data-r>
      {TRUST.map((t) => (
        <li key={t.label}>
          <i><t.Icon size={22} /></i>
          <strong>{t.label}</strong>
          <span>{t.note}</span>
        </li>
      ))}
    </ul>
  );
}

export const PRODUCT_CSS = `
/* ---- hero console ---- */
.as-floor {
  --as-dark: #3d32b0; --as-deep: #2a2280; --as-mist: #eef0ff;
  position: relative; display: flex; flex-direction: column; justify-content: space-between; min-height: 560px; padding: 32px 26px 0; overflow: hidden;
  background: radial-gradient(90% 70% at 85% 0%, rgba(106,92,255,.5), transparent 58%), linear-gradient(165deg, var(--accent) 0%, var(--as-dark) 48%, var(--as-deep) 100%);
  border: 1px solid rgba(106,92,255,.38); animation: pg-floor-in 1s var(--ease) .18s both;
}
.as-floor__wash { position: absolute; inset: auto -20% -30% 20%; height: 70%; background: radial-gradient(circle, rgba(106,92,255,.35), transparent 70%); pointer-events: none }
.as-sheet { position: relative; z-index: 2; background: #fff; padding: 16px 18px 18px; border-left: 4px solid var(--accent); box-shadow: 0 28px 56px -18px rgba(42,34,128,.72); animation: pg-case-in .7s var(--ease) .3s both }
.as-sheet header { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: .6rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--muted) }
.as-sheet header span:first-child { color: var(--accent-deep); margin-right: auto }
.as-sheet header em, .as-sheet header span:last-child { font-style: normal; padding: 3px 7px; border: 1px solid rgba(106,92,255,.22); color: var(--accent-deep) }
.as-sheet h2 { margin: 14px 0 0; font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; letter-spacing: -.03em; color: var(--ink) }
.as-sheet__sub { margin: 4px 0 0; font-family: var(--font-mono); font-size: .72rem; color: var(--muted) }
.as-chain { list-style: none; margin: 18px 0 0; padding: 0; display: grid; grid-template-columns: repeat(5, 1fr); position: relative }
.as-chain::before { content: ""; position: absolute; top: 19px; left: 10%; right: 10%; height: 2px; background: repeating-linear-gradient(90deg, rgba(106,92,255,.3) 0 6px, transparent 6px 12px) }
.as-chain::after { content: ""; position: absolute; top: 19px; left: 10%; width: 20%; height: 2px; background: var(--accent); transform-origin: left; animation: as-trace 4.5s var(--ease) infinite }
.as-chain li { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 2px; opacity: 0; animation: pg-rise .6s var(--ease) both; animation-delay: calc(.6s + var(--i) * .12s) }
.as-chain li i { display: grid; place-items: center; width: 40px; height: 40px; margin-bottom: 6px; border-radius: 12px; background: linear-gradient(145deg, #fff, #ebe8ff); border: 1px solid rgba(106,92,255,.28); color: var(--accent-deep) }
.as-chain li b { font-size: .68rem; font-weight: 650; color: var(--ink) }
.as-chain li span { font-size: .6rem; color: var(--muted) }
.as-chain li[data-s="fail"] i { background: #fdeaea; border-color: #e5484d; color: #c23030; animation: as-fail 4.5s ease-in-out infinite }
.as-chain li[data-s="fail"] span { color: #c23030; font-weight: 700 }
.as-chain li[data-s="skip"] i { background: #fff; border: 1px dashed rgba(106,92,255,.4); color: var(--muted-dim) }
.as-chain li[data-s="skip"] b { color: var(--muted) }
.as-cause { display: flex; gap: 12px; align-items: flex-start; margin-top: 18px; padding: 12px 14px; background: var(--accent-soft) }
.as-cause > i { flex: none; display: grid; place-items: center; width: 34px; height: 34px; background: #fff; color: var(--accent-deep) }
.as-cause b { font-size: .84rem; color: var(--accent-deep) }
.as-cause p { margin: 3px 0 0; font-size: .78rem; line-height: 1.5; color: var(--ink-soft) }
.as-dock { position: relative; z-index: 2; margin: 26px -26px 0; padding: 14px 24px 0; background: rgba(42,34,128,.5); border-top: 1px solid rgba(238,240,255,.16); backdrop-filter: blur(10px) }
.as-dock > p { display: flex; align-items: center; justify-content: space-between; margin: 0 0 8px; font-family: var(--font-mono); font-size: .62rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--as-mist) }
.as-dock > p span { display: inline-flex; align-items: center; gap: 8px }
.as-dock > p strong { font-family: var(--font-display); font-size: 1.5rem; letter-spacing: -.03em; color: #fff }
.as-dock > p small { font-size: .7rem; opacity: .7; margin-left: 2px }
.as-live { width: 7px; height: 7px; border-radius: 50%; background: #fff; animation: pg-pulse 1.8s ease-out infinite }
.as-score { height: 5px; margin-bottom: 6px; background: rgba(238,240,255,.16) }
.as-score i { display: block; height: 100%; width: 95%; background: linear-gradient(90deg, #cfd4ff, #fff); transform-origin: left; animation: pg-fill 1.4s var(--ease) 1s both }
.as-row { display: grid; grid-template-columns: 1fr auto auto; gap: 14px; align-items: center; padding: 9px 0; border-top: 1px solid rgba(238,240,255,.1); font-size: .8rem; color: #fff; animation: pg-rise .6s var(--ease) both }
.as-row:nth-of-type(1) { animation-delay: 1.1s } .as-row:nth-of-type(2) { animation-delay: 1.25s } .as-row:nth-of-type(3) { animation-delay: 1.4s }
.as-mini { display: inline-flex; gap: 3px }
.as-mini i { width: 14px; height: 6px; background: #fff }
.as-mini i[data-s="fail"] { background: #ff8f93 }
.as-mini i[data-s="skip"] { background: rgba(238,240,255,.22) }
.as-row em { font-style: normal; font-family: var(--font-mono); font-size: .58rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; padding: 2px 7px; border: 1px solid rgba(238,240,255,.4) }
.as-row em[data-r="Missed"] { border-color: #ff8f93; color: #ffb3b6 }
.as-dock footer { display: flex; align-items: center; gap: 8px; padding: 10px 0 12px; border-top: 1px solid rgba(238,240,255,.1); font-size: .72rem; color: var(--as-mist) }
@keyframes as-trace { 0% { transform: scaleX(0); opacity: 1 } 40% { transform: scaleX(1); opacity: 1 } 80% { transform: scaleX(1); opacity: 0 } 100% { opacity: 0 } }
@keyframes as-fail { 0%, 40% { box-shadow: 0 0 0 0 rgba(229,72,77,0) } 50% { box-shadow: 0 0 0 8px rgba(229,72,77,.24) } 80%, 100% { box-shadow: 0 0 0 0 rgba(229,72,77,0) } }

/* ---- a rule that exists vs a rule that works ---- */
.pv { margin-top: 64px; display: grid; gap: 10px }
.pv[data-r] { opacity: 1; transform: none; filter: none }
.pv__row { display: grid; grid-template-columns: 11rem 1fr; gap: 24px; align-items: center; padding: 32px 0; border-top: 1px solid var(--border-strong) }
.pv__label { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink) }
.pv__row[data-k="assumed"] .pv__label { color: var(--muted) }
.pv ol { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(5, 1fr); position: relative }
.pv ol::before { content: ""; position: absolute; top: 28px; left: 10%; right: 10%; height: 2px }
.pv__row[data-k="assumed"] ol::before { background: repeating-linear-gradient(90deg, rgba(16,25,46,.25) 0 6px, transparent 6px 12px) }
.pv__row[data-k="proven"] ol::before { background: var(--accent); transform-origin: left }
.pv[data-r] .pv__row[data-k="proven"] ol::before { transform: scaleX(0); transition: transform 1.2s var(--ease) .5s }
.pv[data-r].in .pv__row[data-k="proven"] ol::before { transform: none }
.pv li { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 3px }
.pv li i { position: relative; display: grid; place-items: center; width: 58px; height: 58px; margin-bottom: 8px; border-radius: 18px }
.pv li b { font-size: .84rem; font-weight: 650 }
.pv li em { font-style: normal; font-family: var(--font-mono); font-size: .58rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase }
.pv li u { position: absolute; right: -7px; top: -7px; display: grid; place-items: center; width: 20px; height: 20px; border-radius: 50%; font-size: .68rem; font-weight: 800; text-decoration: none }
.pv__row[data-k="assumed"] li i { background: #fff; border: 1px dashed rgba(16,25,46,.3); color: var(--muted-dim) }
.pv__row[data-k="assumed"] li u { background: #f0f1f5; color: var(--muted) }
.pv__row[data-k="assumed"] li b, .pv__row[data-k="assumed"] li em { color: var(--muted) }
.pv__row[data-k="proven"] li i { background: linear-gradient(145deg, #7b6dff, #3d32b0); border: 0; color: #fff; box-shadow: 0 16px 26px -14px rgba(85,70,224,.8) }
.pv__row[data-k="proven"] li u { background: #22a06b; color: #fff }
.pv__row[data-k="proven"] li em { color: var(--accent-deep) }
.pv[data-r] .pv__row[data-k="proven"] li { opacity: 0; transform: translateY(10px); transition: opacity .5s var(--ease), transform .5s var(--ease); transition-delay: calc(.4s + var(--i) * .18s) }
.pv[data-r].in .pv__row[data-k="proven"] li { opacity: 1; transform: none }

/* ---- without / with ---- */
.wv { margin-top: 64px }
.wv[data-r] { opacity: 1; transform: none; filter: none }
.wv__head { display: grid; grid-template-columns: 1fr 64px 1fr; padding-bottom: 14px; font-family: var(--font-mono); font-size: .68rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--muted) }
.wv__head span:last-child { color: var(--accent-deep) }
.wv ul { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--border-strong) }
.wv li { display: grid; grid-template-columns: 1fr 64px 1fr; align-items: center; padding: 30px 0; border-bottom: 1px solid var(--border) }
.wv__without, .wv__with { display: flex; gap: 16px; align-items: center }
.wv__without i, .wv__with i { flex: none; display: grid; place-items: center; width: 50px; height: 50px; border-radius: 16px }
.wv__without i { background: #fff; border: 1px dashed rgba(16,25,46,.3); color: var(--muted-dim) }
.wv__with i { background: linear-gradient(145deg, #7b6dff, #3d32b0); color: #fff; box-shadow: 0 14px 24px -14px rgba(85,70,224,.8) }
.wv strong { display: block; font-family: var(--font-display); font-size: 1.25rem; font-weight: 700; letter-spacing: -.025em }
.wv__without strong { color: var(--muted); text-decoration: line-through; text-decoration-color: rgba(16,25,46,.25) }
.wv p { margin: 3px 0 0; font-size: .88rem; line-height: 1.5; color: var(--ink-soft) }
.wv__without p { color: var(--muted) }
.wv__arrow { justify-self: center; color: var(--accent); transition: transform .3s var(--ease) }
.wv li:hover .wv__arrow { transform: translateX(6px) }
.wv[data-r] li { opacity: 0; transform: translateY(14px); transition: opacity .6s var(--ease), transform .6s var(--ease) }
.wv[data-r].in li { opacity: 1; transform: none }
.wv[data-r].in li:nth-child(2) { transition-delay: .1s } .wv[data-r].in li:nth-child(3) { transition-delay: .2s } .wv[data-r].in li:nth-child(4) { transition-delay: .3s }

/* ---- pathways ---- */
.pw { list-style: none; margin: 64px 0 0; padding: 0; border-top: 1px solid var(--border-strong) }
.pw[data-r] { opacity: 1; transform: none; filter: none }
.pw > li { display: grid; grid-template-columns: 1fr 1.2fr; gap: 40px; align-items: center; padding: 36px 0; border-bottom: 1px solid var(--border) }
.pw h3 { margin: 0; font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; letter-spacing: -.028em }
.pw p { margin: 8px 0 0; max-width: 40ch; color: var(--ink-soft); font-size: .95rem; line-height: 1.6 }
.pw__track { display: grid; grid-template-columns: repeat(5, 1fr); position: relative }
.pw__track::before { content: ""; position: absolute; top: 17px; left: 10%; right: 10%; height: 2px; background: rgba(106,92,255,.16) }
.pw__track span { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 6px }
.pw__track i { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 11px; background: #fff; border: 1px dashed rgba(16,25,46,.25); color: var(--muted-dim); transition: background .4s var(--ease), color .4s var(--ease) }
.pw__track b { font-family: var(--font-mono); font-size: .54rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--muted-dim) }
.pw__track span[data-on="true"] i { background: linear-gradient(145deg, #7b6dff, #3d32b0); border: 0; color: #fff; box-shadow: 0 10px 18px -10px rgba(85,70,224,.8) }
.pw__track span[data-on="true"] b { color: var(--accent-deep) }

/* ---- trust strip and faq ---- */
.ts { list-style: none; margin: 0 0 64px; padding: 0; display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--border-strong) }
.ts[data-r] { opacity: 1; transform: none; filter: none }
.ts li { display: flex; flex-direction: column; gap: 4px; padding: 22px 20px 6px 0 }
.ts li + li { padding-left: 20px; border-left: 1px solid var(--border) }
.ts .ts-ico, .ts i { display: grid; place-items: center; width: 44px; height: 44px; margin-bottom: 10px; border-radius: 14px; background: linear-gradient(145deg, #fff, #ebe8ff); border: 1px solid rgba(106,92,255,.22); color: var(--accent-deep) }
.ts strong { font-family: var(--font-mono); font-size: .74rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--ink) }
.ts span { font-size: .86rem; color: var(--ink-soft); line-height: 1.5 }
.fq { border-top: 1px solid var(--border-strong) }
.fq details { border-bottom: 1px solid var(--border) }
.fq summary { display: grid; grid-template-columns: auto 1fr auto; gap: 18px; align-items: center; padding: 28px 0; cursor: pointer; list-style: none; transition: padding .3s var(--ease) }
.fq summary::-webkit-details-marker { display: none }
.fq summary:hover { padding-left: 10px }
.fq summary > i { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 13px; background: var(--accent-soft); color: var(--accent-deep) }
.fq summary strong { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; letter-spacing: -.02em }
.fq summary::after { content: "+"; font-size: 1.5rem; font-weight: 300; color: var(--accent-deep); transition: transform .3s var(--ease) }
.fq details[open] summary::after { transform: rotate(45deg) }
.fq details > div { padding: 0 0 26px 60px; max-width: 62ch }
.fq details p { margin: 0; color: var(--ink-soft); font-size: .98rem; line-height: 1.7 }
.fq mark { display: inline-block; margin: 0 4px 0 0; padding: 1px 8px; background: var(--accent-soft); color: var(--accent-deep); font-family: var(--font-mono); font-size: .68rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase }
.fq[data-r] { opacity: 1; transform: none; filter: none }

/* ---- pricing ---- */
.pr { position: relative; display: grid; grid-template-columns: 1fr 1fr; border-radius: 28px; overflow: hidden; border: 1px solid var(--border-strong); box-shadow: 0 40px 80px -44px rgba(42,34,128,.55) }
.pr[data-r] { opacity: 1; transform: none; filter: none }
.pr__side { padding: 44px 44px 40px; display: flex; flex-direction: column; background: linear-gradient(180deg, #fff, #f8f7ff) }
.pr__side--paid { color: #eef0ff; background: radial-gradient(70% 90% at 100% 0%, rgba(238,240,255,.18), transparent 55%), linear-gradient(145deg, #5546e0, #3d32b0 55%, #2a2280) }
.pr__name { font-family: var(--font-mono); font-size: .72rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--accent-deep) }
.pr__side--paid .pr__name { color: #fff }
.pr__price { margin: 14px 0 0; font-family: var(--font-display); font-size: clamp(3.4rem, 6vw, 4.8rem); font-weight: 700; line-height: .9; letter-spacing: -.055em }
.pr__price small { margin-left: 8px; font-size: .95rem; font-weight: 500; letter-spacing: 0; color: var(--muted) }
.pr__side--paid .pr__price small { color: #cfd4ff }
.pr__list { list-style: none; margin: 32px 0 40px; padding: 0; display: grid; gap: 12px }
.pr__list li { display: flex; align-items: center; gap: 12px; font-size: .96rem }
.pr__list li::before { content: "✓"; flex: none; display: grid; place-items: center; width: 22px; height: 22px; border-radius: 50%; background: var(--accent-soft); color: var(--accent-deep); font-size: .7rem; font-weight: 800 }
.pr__side--paid .pr__list li::before { background: rgba(255,255,255,.18); color: #fff }
.pr__side .sp-btn { margin-top: auto; align-self: flex-start; height: 48px; padding: 0 22px }
.pr__seam { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 2; padding: 8px 14px; border-radius: 999px; background: #fff; border: 1px solid var(--border-strong); box-shadow: 0 10px 20px -10px rgba(42,34,128,.5); font-family: var(--font-mono); font-size: .58rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep); white-space: nowrap }

@media (prefers-reduced-motion: reduce) {
  .as-sheet, .as-chain li, .as-row, .as-score i, .as-live, .as-chain::after, .as-chain li[data-s="fail"] i { animation: none; opacity: 1 }
  .pv[data-r] .pv__row[data-k="proven"] li, .wv[data-r] li { opacity: 1; transform: none; transition: none }
  .pv[data-r] .pv__row[data-k="proven"] ol::before { transform: none; transition: none }
}
@media (max-width: 980px) {
  .pv__row { grid-template-columns: 1fr; gap: 14px }
  .pw > li { grid-template-columns: 1fr; gap: 20px }
  .ts { grid-template-columns: 1fr 1fr }
  .ts li:nth-child(3) { padding-left: 0; border-left: 0 }
  .pr { grid-template-columns: 1fr }
  .pr__seam { display: none }
}
@media (max-width: 680px) {
  .wv__head { display: none }
  .wv li { grid-template-columns: 1fr; gap: 10px }
  .wv__arrow { transform: rotate(90deg); justify-self: start; margin-left: 17px }
  .wv li:hover .wv__arrow { transform: rotate(90deg) }
  .pv li b { font-size: .68rem }
  .pv li i { width: 46px; height: 46px; border-radius: 14px }
  .pv ol::before { top: 22px }
  .pw__track b { display: none }
  .ts { grid-template-columns: 1fr }
  .ts li + li { padding-left: 0; border-left: 0; border-top: 1px solid var(--border) }
  .fq details > div { padding-left: 0 }
  .pr__side { padding: 32px 24px }
}

.sp .pr__side--paid .sp-btn { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.6); color: #fff }
.sp .pr__side--paid .sp-btn:hover { background: rgba(255,255,255,.2); border-color: #fff; color: #fff }
`;

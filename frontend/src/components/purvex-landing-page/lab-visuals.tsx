import { IconAlert, IconLog, IconParser, IconRule, IconTicket, IconValidate } from "./brand-icons";

/* Custom visuals for the Labs page: the detection chain, an ATT&CK coverage
   matrix, and a detection health trend. All values are illustrative. */

const NODES = [
  { s: "test", name: "Attack test", note: "Real behavior", Icon: IconValidate },
  { s: "ok", name: "Telemetry", note: "Events arrive", Icon: IconLog },
  { s: "break", name: "Parser", note: "Fields dropped", Icon: IconParser },
  { s: "idle", name: "Rule", note: "Never evaluated", Icon: IconRule },
  { s: "idle", name: "Alert", note: "None", Icon: IconAlert },
  { s: "idle", name: "Ticket", note: "Never opened", Icon: IconTicket },
] as const;

export function ChainDiagram() {
  return (
    <div className="lb-chain" data-r>
      <div className="lb-chain__track">
        <span className="lb-pulse" aria-hidden="true" />
        <ol>
          {NODES.map((n) => (
            <li key={n.name} data-s={n.s}>
              <i><n.Icon size={26} /></i>
              <strong>{n.name}</strong>
              <span>{n.note}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="lb-chain__verdict">
        <b>Broke at the parser.</b> The rule was never the problem, so the fix belongs in the ingest.
      </p>
    </div>
  );
}

const TACTICS = ["RECON", "RESRC", "INIT", "EXEC", "PERSIST", "PRIV", "EVADE", "CRED", "DISC", "LATERAL", "COLLECT", "C2", "EXFIL", "IMPACT"];
const ROWS = [5, 3, 6, 9, 8, 7, 9, 8, 6, 5, 6, 4, 4, 5];

function seeded(seed: number) {
  let h = seed;
  return () => {
    h = (h * 1664525 + 1013904223) % 4294967296;
    return h / 4294967296;
  };
}

function buildMatrix() {
  const rand = seeded(7);
  return TACTICS.map((t, c) =>
    Array.from({ length: ROWS[c] }, () => {
      const r = rand();
      return r < 0.58 ? "fired" : r < 0.72 ? "missed" : "untested";
    }),
  );
}

const MATRIX = buildMatrix();
const FLAT = MATRIX.flat();
const FIRED = FLAT.filter((s) => s === "fired").length;
const MISSED = FLAT.filter((s) => s === "missed").length;
export const COVERAGE_PERCENT = Math.round((FIRED / (FIRED + MISSED)) * 100);

export function CoverageMatrix() {
  return (
    <div className="lb-matrix" data-r role="img" aria-label="Example ATT&CK coverage by tactic">
      <div className="lb-matrix__cols">
        {MATRIX.map((col, c) => (
          <div key={TACTICS[c]} className="lb-matrix__col">
            <span>{TACTICS[c]}</span>
            {col.map((state, r) => (
              <i key={r} data-s={state} style={{ ["--i" as string]: c * 2 + r }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const TREND = [54, 58, 57, 63, 66, 64, 70, 74, 73, 78, 81, 84];

export function HealthTrend() {
  const w = 520;
  const h = 150;
  const px = (i: number) => 8 + (i * (w - 16)) / (TREND.length - 1);
  const py = (v: number) => h - 14 - ((v - 45) / 45) * (h - 34);
  const line = TREND.map((v, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");
  const area = `${line} L${px(TREND.length - 1)} ${h} L${px(0)} ${h} Z`;
  const last = TREND.length - 1;
  return (
    <div className="lb-trend" data-r>
      <div className="lb-trend__score">
        <strong>84</strong>
        <span>Detection health<em>Example, 12 weeks</em></span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Detection health rising over twelve weeks">
        <defs>
          <linearGradient id="lb-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6a5cff" stopOpacity=".28" />
            <stop offset="1" stopColor="#6a5cff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={w} y1={h * f} y2={h * f} className="lb-trend__grid" />
        ))}
        <path d={area} fill="url(#lb-fill)" className="lb-trend__area" />
        <path d={line} className="lb-trend__line" pathLength={1} />
        <circle cx={px(last)} cy={py(TREND[last])} r="5" className="lb-trend__dot" />
        <circle cx={px(last)} cy={py(TREND[last])} r="5" className="lb-trend__ping" />
      </svg>
    </div>
  );
}

export const LAB_CSS = `
.lb-chain[data-r], .lb-matrix[data-r], .lb-trend[data-r], .lb-facts[data-r], .lb-runs[data-r] { opacity: 1; transform: none; filter: none }
.lb-chain { margin-top: 64px }
.lb-chain__track { position: relative }
.lb-chain ol { list-style: none; margin: 0; padding: 0; position: relative; display: grid; grid-template-columns: repeat(6, 1fr) }
.lb-chain ol::before, .lb-chain ol::after { content: ""; position: absolute; top: 32px; height: 2px }
.lb-chain ol::before { left: 8.33%; width: 33.34%; background: linear-gradient(90deg, var(--accent), var(--accent)) }
.lb-chain ol::after { left: 41.67%; width: 50%; background: repeating-linear-gradient(90deg, rgba(106,92,255,.35) 0 8px, transparent 8px 16px) }
.lb-chain li { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 4px }
.lb-chain li i {
  display: grid; place-items: center; width: 64px; height: 64px; margin-bottom: 12px; border-radius: 20px;
  background: linear-gradient(145deg, #fff, #ebe8ff); border: 1px solid rgba(106,92,255,.25); color: var(--accent-deep);
  box-shadow: 0 16px 28px -16px rgba(85,70,224,.6);
}
.lb-chain li strong { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; letter-spacing: -.015em }
.lb-chain li span { font-size: .84rem; color: var(--muted) }
.lb-chain li[data-s="test"] i { background: linear-gradient(145deg, #7b6dff, #3d32b0); border-color: transparent; color: #fff }
.lb-chain li[data-s="idle"] i { background: #fff; border: 1px dashed rgba(106,92,255,.4); color: var(--muted-dim); box-shadow: none }
.lb-chain li[data-s="idle"] strong { color: var(--muted) }
.lb-chain li[data-s="break"] i { background: #fdeaea; border-color: #e5484d; color: #c23030; animation: lb-break 4.5s ease-in-out infinite }
.lb-chain li[data-s="break"] span { color: #c23030; font-weight: 600 }
.lb-pulse { position: absolute; top: 27px; left: 8.33%; width: 12px; height: 12px; margin-left: -6px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 6px rgba(106,92,255,.18); animation: lb-run 4.5s ease-in-out infinite; z-index: 2 }
.lb-chain__verdict { margin: 48px 0 0; padding: 18px 22px; border-radius: 16px; background: linear-gradient(135deg, #f7f5ff, #fff 70%); border: 1px solid rgba(106,92,255,.18); font-size: .98rem; line-height: 1.6; color: var(--ink-soft) }
.lb-chain__verdict b { color: var(--ink) }
@keyframes lb-run { 0% { left: 8.33%; opacity: 0 } 8% { opacity: 1 } 55% { left: 41.67%; opacity: 1 } 70% { left: 41.67%; opacity: 0 } 100% { left: 41.67%; opacity: 0 } }
@keyframes lb-break { 0%, 50% { box-shadow: 0 0 0 0 rgba(229,72,77,0) } 58% { box-shadow: 0 0 0 10px rgba(229,72,77,.22) } 80%, 100% { box-shadow: 0 0 0 0 rgba(229,72,77,0) } }

.lb-facts { list-style: none; margin: 76px 0 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0 40px }
.lb-facts li { padding: 28px 0 0; border-top: 1px solid var(--border-strong); display: grid; grid-template-columns: auto 1fr; gap: 4px 16px; align-items: start }
.lb-facts .pg-ico { grid-row: span 2 }
.lb-facts strong { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; letter-spacing: -.015em; color: var(--ink) }
.lb-facts p { margin: 0; color: var(--ink-soft); font-size: .92rem; line-height: 1.6 }

.lb-band { display: grid; grid-template-columns: 1fr auto; gap: 32px; align-items: end }
.lb-band h2 { margin-top: 18px }
.lb-big { text-align: right }
.lb-big strong { display: block; font-family: var(--font-display); font-size: clamp(3.4rem, 7vw, 5.4rem); font-weight: 700; line-height: .9; letter-spacing: -.055em; color: var(--ink) }
.lb-big span { display: block; margin-top: 8px; font-size: .84rem; color: var(--ink-soft) }
.lb-legend { list-style: none; margin: 22px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px 22px }
.lb-legend li { display: inline-flex; align-items: center; gap: 8px; font-size: .84rem; color: var(--ink-soft) }
.lb-legend i { width: 12px; height: 12px; border-radius: 3px }
.lb-legend i[data-s="fired"], .lb-matrix i[data-s="fired"] { background: #c8c2ff }
.lb-legend i[data-s="missed"], .lb-matrix i[data-s="missed"] { background: #ff8f93 }
.lb-legend i[data-s="untested"], .lb-matrix i[data-s="untested"] { background: #e6eaf2 }
.lb-matrix { margin-top: 52px }
.lb-matrix__cols { display: grid; grid-template-columns: repeat(14, 1fr); gap: 6px; align-items: start }
.lb-matrix__col { display: flex; flex-direction: column; gap: 6px }
.lb-matrix__col span { margin-bottom: 4px; font-family: var(--font-mono); font-size: .54rem; font-weight: 700; letter-spacing: .04em; color: var(--muted); overflow: hidden; text-overflow: clip; white-space: nowrap }
.lb-matrix i { display: block; aspect-ratio: 1.5; border-radius: 4px }
.lb-matrix[data-r] i { opacity: 0; transform: scale(.6); transition: opacity .5s var(--ease), transform .5s var(--ease); transition-delay: calc(var(--i) * 22ms) }
.lb-matrix[data-r].in i { opacity: 1; transform: none }

.lb-evidence { display: grid; grid-template-columns: 1.15fr .85fr; gap: 64px; align-items: center }
.lb-trend__score { display: flex; align-items: flex-end; gap: 18px; margin-bottom: 10px }
.lb-trend__score strong { font-family: var(--font-display); font-size: clamp(4rem, 8vw, 6rem); font-weight: 700; line-height: .85; letter-spacing: -.06em; color: var(--accent-deep) }
.lb-trend__score span { display: flex; flex-direction: column; padding-bottom: 6px; font-size: .95rem; font-weight: 650; color: var(--ink) }
.lb-trend__score em { font-style: normal; font-weight: 500; font-size: .78rem; color: var(--muted); margin-top: 2px }
.lb-trend svg { display: block; width: 100%; height: auto; overflow: visible }
.lb-trend__grid { stroke: rgba(106,92,255,.14); stroke-dasharray: 3 6 }
.lb-trend__line { fill: none; stroke: var(--accent); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 1; stroke-dashoffset: 1 }
.lb-trend__area { opacity: 0; transition: opacity 1s var(--ease) 1s }
.lb-trend__dot { fill: #fff; stroke: var(--accent); stroke-width: 3; opacity: 0; transition: opacity .4s ease 1.5s }
.lb-trend__ping { fill: none; stroke: var(--accent); stroke-width: 2; opacity: 0 }
.lb-trend.in .lb-trend__line { animation: lb-draw 1.6s var(--ease) forwards }
.lb-trend.in .lb-trend__area, .lb-trend.in .lb-trend__dot { opacity: 1 }
.lb-trend.in .lb-trend__ping { animation: lb-ping 2.2s ease-out 1.6s infinite }
@keyframes lb-draw { to { stroke-dashoffset: 0 } }
@keyframes lb-ping { 0% { opacity: .6; r: 5 } 100% { opacity: 0; r: 16 } }
.lb-runs { list-style: none; margin: 36px 0 0; padding: 0; border-top: 1px solid var(--border-strong) }
.lb-runs li { display: grid; grid-template-columns: 6.5rem 1fr auto; gap: 14px; align-items: center; padding: 14px 0; border-bottom: 1px solid var(--border); font-size: .9rem }
.lb-runs code { font-family: var(--font-mono); font-size: .74rem; font-weight: 700; color: var(--accent-deep) }
.lb-runs em { font-style: normal; padding: 3px 10px; border-radius: 999px; font-family: var(--font-mono); font-size: .58rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; background: var(--accent-soft); color: var(--accent-deep) }
.lb-runs em[data-s="missed"] { background: #fdeaea; color: #c23030 }
.lb-evidence__copy .pg-bullets { margin-top: 22px }

@media (prefers-reduced-motion: reduce) {
  .lb-pulse, .lb-chain li[data-s="break"] i, .lb-trend__ping { animation: none }
  .lb-pulse { display: none }
  .lb-matrix[data-r] i { opacity: 1; transform: none; transition: none }
  .lb-trend__line { stroke-dashoffset: 0; animation: none !important }
  .lb-trend__area, .lb-trend__dot { opacity: 1 }
}
@media (max-width: 980px) {
  .lb-evidence { grid-template-columns: 1fr; gap: 36px }
  .lb-facts { grid-template-columns: 1fr; gap: 0 }
  .lb-facts li { padding: 20px 0 22px }
}
@media (max-width: 760px) {
  .lb-chain ol { grid-template-columns: 1fr; gap: 6px }
  .lb-chain ol::before, .lb-chain ol::after, .lb-pulse { display: none }
  .lb-chain li { flex-direction: row; text-align: left; gap: 2px 16px; flex-wrap: wrap; align-items: center }
  .lb-chain li i { margin: 0; width: 52px; height: 52px; border-radius: 16px }
  .lb-chain li strong { flex: 1 }
  .lb-chain li span { flex-basis: 100%; padding-left: 68px; margin-top: -30px }
  .lb-band { grid-template-columns: 1fr }
  .lb-big { text-align: left }
  .lb-matrix__col span { font-size: 0; margin-bottom: 2px }
  .lb-matrix__cols, .lb-matrix__col { gap: 3px }
  .lb-runs li { grid-template-columns: 5.5rem 1fr auto }
}
.pg-head--xl h2 { font-size: clamp(2.2rem, 4.8vw, 3.7rem); letter-spacing: -.045em; line-height: 1.02; max-width: 18ch }
.pg-head--xl p { max-width: 46ch }
`;

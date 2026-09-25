import { Check } from "lucide-react";
import { LEVELS } from "@/lib/academy-score";
import { IconBriefcase, IconLifebuoy, IconLog, IconValidate, type BrandIcon } from "./brand-icons";

/* What students walk away with. Four benefits in an uneven grid, each with
   a small scene that plays once the grid scrolls in (the chrome adds .in).
   The company and departments are PurveX Financial from the home lab. */

const DEPARTMENTS = [
  { name: "IT", critical: false },
  { name: "Compliance", critical: true },
  { name: "Wealth Management", critical: true },
  { name: "Operations", critical: false },
  { name: "Finance and Accounting", critical: true },
];

const PROOF = ["Unlocked a locked-out account", "Removed access for someone who left", "Contained a suspicious sign-in"];

const RING = 2 * Math.PI * 30;

function Head({ Icon, title, body }: { Icon: BrandIcon; title: string; body: string }) {
  return (
    <div className="tb-head">
      <i><Icon size={22} /></i>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}

export function TrainingBenefits() {
  return (
    <div className="tb" data-r>
      <article className="tb-cell tb-cell--lab">
        <Head
          Icon={IconLog}
          title="Learn by doing"
          body="Every student builds a small company network on their own computer and fixes real problems in it."
        />
        <div className="tb-co">
          <header>
            <span>Their company</span>
            <strong>PurveX Financial</strong>
            <em>A wealth firm with nine people and client money to protect</em>
          </header>
          <ul>
            {DEPARTMENTS.map((d, n) => (
              <li key={d.name} data-critical={d.critical ? "1" : "0"} style={{ ["--n" as string]: n }}>
                {d.name}
                {d.critical && <b>Sensitive data</b>}
              </li>
            ))}
          </ul>
        </div>
      </article>

      <article className="tb-cell tb-cell--coach">
        <Head
          Icon={IconLifebuoy}
          title="Help that teaches"
          body="An AI coach gives the next step when they are stuck. It never hands over the answer."
        />
        <div className="tb-chat" aria-hidden="true">
          <p className="tb-chat__me">Can you just tell me the answer?</p>
          <div className="tb-chat__reply">
            <p className="tb-chat__dots"><i /><i /><i /></p>
            <p className="tb-chat__bot"><b>Coach</b>Not yet. Open the account first. What does it tell you?</p>
          </div>
        </div>
      </article>

      <article className="tb-cell tb-cell--check">
        <Head
          Icon={IconValidate}
          title="Skills that are checked"
          body="Work passes only when their lab shows the fix. There is no credit for guessing."
        />
        <ol className="tb-verify" aria-hidden="true">
          <li><i><Check size={13} strokeWidth={3} /></i>Student marks the ticket done</li>
          <li className="tb-verify__lab">
            <i className="tb-verify__spin" />
            <i className="tb-verify__ok"><Check size={13} strokeWidth={3} /></i>
            <span className="tb-verify__wait">Checking their lab</span>
            <span className="tb-verify__done">Lab confirms the fix</span>
          </li>
        </ol>
      </article>

      <article className="tb-cell tb-cell--proof">
        <Head
          Icon={IconBriefcase}
          title="Proof for hiring"
          body="They finish with a readiness score and a record of real work a hiring manager can read."
        />
        <div className="tb-proof">
          <div className="tb-proof__score">
            <svg viewBox="0 0 72 72" aria-hidden="true">
              <circle cx="36" cy="36" r="30" />
              <circle cx="36" cy="36" r="30" style={{ strokeDasharray: RING, ["--off" as string]: RING * (1 - 0.72) }} />
            </svg>
            <div>
              <strong>72</strong>
              <span>{LEVELS.almost.label}</span>
            </div>
          </div>
          <ul>
            {PROOF.map((p, n) => (
              <li key={p} style={{ ["--n" as string]: n }}>
                <i><Check size={12} strokeWidth={3} /></i>
                {p}
              </li>
            ))}
          </ul>
          <em className="tb-proof__tag">Example</em>
        </div>
      </article>

      <style>{TB_CSS}</style>
    </div>
  );
}

const TB_CSS = `
.tb[data-r] { opacity: 1; transform: none; filter: none }
.tb { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px }
.tb-cell {
  position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; gap: 26px;
  padding: 28px; background: #fff; border: 1px solid var(--border-strong);
  box-shadow: 0 22px 44px -34px rgba(42,34,128,.4);
  opacity: 0; transform: translateY(18px);
  transition: opacity .7s var(--ease), transform .7s var(--ease), box-shadow .35s var(--ease), border-color .35s var(--ease);
}
.tb.in .tb-cell { opacity: 1; transform: none }
.tb.in .tb-cell:nth-child(2) { transition-delay: .08s, .08s, 0s, 0s }
.tb.in .tb-cell:nth-child(3) { transition-delay: .16s, .16s, 0s, 0s }
.tb.in .tb-cell:nth-child(4) { transition-delay: .24s, .24s, 0s, 0s }
.tb-cell:hover { border-color: rgba(106,92,255,.4); box-shadow: 0 30px 60px -34px rgba(42,34,128,.5) }
.tb-cell--lab { grid-column: span 7; background: linear-gradient(150deg, #2a2280, #3d32b0 60%, #4a3fd0); border-color: #2a2280; color: #fff }
.tb-cell--coach { grid-column: span 5 }
.tb-cell--check { grid-column: span 5; background: repeating-linear-gradient(135deg, rgba(106,92,255,.08) 0 1px, transparent 1px 10px), var(--accent-soft); border-color: rgba(106,92,255,.22) }
.tb-cell--proof { grid-column: span 7 }

.tb-head i { display: grid; place-items: center; width: 44px; height: 44px; background: var(--accent-soft); color: var(--accent-deep) }
.tb-head i svg { position: static }
.tb-head h3 { margin: 18px 0 0; font-family: var(--font-display); font-size: 1.4rem; font-weight: 700; letter-spacing: -.025em; line-height: 1.15; color: var(--ink) }
.tb-head p { margin: 8px 0 0; max-width: 44ch; color: var(--ink-soft); font-size: .98rem; line-height: 1.55 }
.tb-cell--lab .tb-head i { background: rgba(238,240,255,.14); color: #fff }
.tb-cell--lab .tb-head h3 { color: #fff }
.tb-cell--lab .tb-head p { color: rgba(238,240,255,.82) }
.tb-cell--check .tb-head i { background: #fff }

/* company */
.tb-co { padding: 18px; background: rgba(255,255,255,.07); border: 1px solid rgba(238,240,255,.16) }
.tb-co header span { display: block; font-size: .78rem; font-weight: 600; color: rgba(238,240,255,.7) }
.tb-co header strong { display: block; margin-top: 2px; font-family: var(--font-display); font-size: 1.3rem; font-weight: 600; letter-spacing: -.02em }
.tb-co header em { display: block; margin-top: 2px; font-style: normal; font-size: .88rem; color: rgba(238,240,255,.78) }
.tb-co ul { display: flex; flex-wrap: wrap; gap: 8px; list-style: none; margin: 16px 0 0; padding: 0 }
.tb-co li {
  display: inline-flex; align-items: center; gap: 8px; padding: 7px 11px; background: #fff; color: var(--ink); font-size: .86rem; font-weight: 600;
  opacity: 0; transform: translateY(6px) scale(.96);
}
.tb.in .tb-co li { animation: tb-pop .45s cubic-bezier(.16,1,.3,1) both; animation-delay: calc(var(--n) * 90ms + .45s) }
.tb-co li b { padding: 2px 6px; font-size: .68rem; font-weight: 700; color: #92400e; background: #fef3c7 }

/* coach chat */
.tb-chat { display: flex; flex-direction: column; gap: 10px; min-height: 150px }
.tb-chat p { margin: 0; max-width: 88%; padding: 11px 13px; font-size: .92rem; line-height: 1.45 }
.tb-chat__me { align-self: flex-end; background: var(--accent-deep); color: #fff; opacity: 0 }
.tb-chat__dots { display: inline-flex !important; gap: 5px; align-self: flex-start; background: #f4f4fb; border: 1px solid var(--border); opacity: 0 }
.tb-chat__dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); animation: tb-dot 1s ease-in-out infinite }
.tb-chat__dots i:nth-child(2) { animation-delay: .15s }
.tb-chat__dots i:nth-child(3) { animation-delay: .3s }
.tb-chat__bot { align-self: flex-start; background: #f4f4fb; border: 1px solid var(--border); color: var(--ink); opacity: 0 }
.tb-chat__reply { display: grid; justify-items: start; align-items: start }
.tb-chat__reply > p { grid-area: 1 / 1 }
.tb-chat__bot b { display: block; margin-bottom: 2px; font-size: .72rem; color: var(--accent-deep) }
.tb.in .tb-chat__me { animation: tb-in .45s .5s cubic-bezier(.16,1,.3,1) forwards }
.tb.in .tb-chat__dots { animation: tb-flash 1.2s 1s both }
.tb.in .tb-chat__bot { animation: tb-in .45s 2.2s cubic-bezier(.16,1,.3,1) forwards }

/* verify */
.tb-verify { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px }
.tb-verify li {
  position: relative; display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #fff;
  border: 1px solid var(--border); font-size: .94rem; font-weight: 500; color: var(--ink);
}
.tb-verify li > i { display: grid; place-items: center; width: 24px; height: 24px; flex: none; background: var(--border-strong); color: #fff }
.tb-verify li > i svg { position: static }
.tb-verify__lab { border-color: rgba(22,163,74,.35) !important; transition: background .4s var(--ease) }
.tb-verify__spin { position: absolute; left: 16px; background: transparent !important; border: 2px solid var(--accent); border-right-color: transparent; border-radius: 50%; animation: tb-rot .8s linear infinite }
.tb-verify__ok { position: relative; background: var(--green) !important; opacity: 0 }
.tb-verify__done { position: absolute; left: 52px; color: #166534; font-weight: 650; opacity: 0 }
.tb.in .tb-verify__spin { animation: tb-rot .8s linear infinite, tb-out .2s 2s forwards }
.tb.in .tb-verify__wait { animation: tb-out .2s 2s forwards }
.tb.in .tb-verify__ok { animation: tb-pop .35s 2.1s cubic-bezier(.16,1,.3,1) forwards }
.tb.in .tb-verify__done { animation: tb-in .35s 2.1s cubic-bezier(.16,1,.3,1) forwards }
.tb.in .tb-verify__lab { animation: tb-green .4s 2.1s forwards }

/* proof */
.tb-proof { position: relative; display: grid; grid-template-columns: auto 1fr; gap: 20px 28px; align-items: center; padding: 20px; border: 1px solid var(--border); background: #fbfbff }
.tb-proof__score { display: flex; align-items: center; gap: 14px }
.tb-proof__score svg { width: 84px; height: 84px; transform: rotate(-90deg) }
.tb-proof__score circle { fill: none; stroke-width: 7 }
.tb-proof__score circle:first-child { stroke: var(--accent-soft) }
.tb-proof__score circle:last-child { stroke: var(--accent); stroke-dashoffset: ${RING} }
.tb.in .tb-proof__score circle:last-child { animation: tb-ring 1.3s .5s cubic-bezier(.16,1,.3,1) forwards }
.tb-proof__score strong { display: block; font-family: var(--font-display); font-size: 2.2rem; font-weight: 600; letter-spacing: -.05em; line-height: 1 }
.tb-proof__score span { display: block; margin-top: 4px; font-size: .8rem; font-weight: 700; color: var(--accent-deep) }
.tb-proof ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px }
.tb-proof li { display: flex; align-items: center; gap: 10px; font-size: .92rem; color: var(--ink); opacity: 0 }
.tb.in .tb-proof li { animation: tb-in .4s cubic-bezier(.16,1,.3,1) forwards; animation-delay: calc(var(--n) * 120ms + .7s) }
.tb-proof li i { display: grid; place-items: center; width: 20px; height: 20px; flex: none; background: var(--green); color: #fff }
.tb-proof li i svg { position: static }
.tb-proof__tag { position: absolute; top: 10px; right: 10px; padding: 2px 7px; font-style: normal; font-size: .68rem; font-weight: 700; color: var(--accent-deep); background: var(--accent-soft) }

@keyframes tb-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes tb-pop { from { opacity: 0; transform: translateY(6px) scale(.9) } to { opacity: 1; transform: none } }
@keyframes tb-out { to { opacity: 0 } }
@keyframes tb-flash { 0% { opacity: 0 } 15%, 85% { opacity: 1 } 100% { opacity: 0 } }
@keyframes tb-dot { 0%, 100% { opacity: .3; transform: translateY(0) } 50% { opacity: 1; transform: translateY(-3px) } }
@keyframes tb-rot { to { transform: rotate(360deg) } }
@keyframes tb-ring { to { stroke-dashoffset: var(--off) } }
@keyframes tb-green { to { background: #f0fdf4 } }

/* Reduced motion: show every scene in its finished state. */
@media (prefers-reduced-motion: reduce) {
  .tb-cell, .tb.in .tb-cell { opacity: 1; transform: none; transition: none }
  .tb .tb-co li, .tb .tb-chat__me, .tb .tb-chat__bot, .tb .tb-proof li, .tb .tb-verify__ok, .tb .tb-verify__done { opacity: 1 !important; transform: none !important; animation: none !important }
  .tb .tb-chat__dots, .tb .tb-verify__spin, .tb .tb-verify__wait { display: none !important }
  .tb .tb-verify__done { position: static }
  .tb .tb-verify__lab { background: #f0fdf4; animation: none !important }
  .tb .tb-proof__score circle:last-child { stroke-dashoffset: var(--off); animation: none !important }
}

@media (max-width: 980px) {
  .tb-cell--lab, .tb-cell--coach, .tb-cell--check, .tb-cell--proof { grid-column: span 12 }
}
@media (max-width: 640px) {
  .tb-cell { padding: 22px 18px }
  .tb-proof { grid-template-columns: 1fr }
}
`;

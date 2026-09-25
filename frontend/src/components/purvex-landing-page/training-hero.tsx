"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BOOKING_URL } from "./chrome";

/* Training hero. One ticket plays the whole loop in plain words: it opens,
   Coach nudges, the student fixes their own lab, and PurveX checks the fix. */

const BEATS = [
  { stage: 0, status: "Open", kind: "ask", line: "Riley cannot sign in and thinks the account is locked." },
  { stage: 1, status: "Coached", kind: "coach", line: "Check the account before you change anything. What does it say?" },
  { stage: 1, status: "Working", kind: "cmd", line: "The student finds the lock and clears it in their lab." },
  { stage: 2, status: "Checking", kind: "check", line: "PurveX checks their lab for the fix" },
  { stage: 2, status: "Fixed", kind: "done", line: "Fix confirmed. The ticket closes and goes on their record." },
] as const;

const STAGES = ["Open", "Coached", "Fixed"];

const FACTS = [
  { k: "3", v: "phases, from the basics to incident response" },
  { k: "25", v: "hands-on missions checked in their own lab" },
  { k: "4", v: "job skills in a score employers can read" },
];

function ProofTicket() {
  // Start on the final beat so the first paint and reduced motion both show the proof.
  const [i, setI] = useState(BEATS.length - 1);
  const beat = BEATS[i];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % BEATS.length), 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <article className="th-ticket" data-kind={beat.kind} aria-hidden="true">
      <ol className="th-steps">
        {STAGES.map((s, n) => (
          <li key={s} data-on={n <= beat.stage ? "1" : "0"}>
            <i />
            {s}
          </li>
        ))}
      </ol>

      <header className="th-ticket__head">
        <span>Help desk ticket</span>
        <em key={beat.status}>{beat.status}</em>
      </header>
      <h3>Locked out</h3>
      <dl>
        <div><dt>From</dt><dd>Riley Kwan</dd></div>
        <div><dt>Where</dt><dd>Their own lab</dd></div>
      </dl>

      <div className="th-beat" key={i}>
        {beat.kind === "coach" && <b>Coach</b>}
        {beat.kind === "cmd" && <b>You</b>}
        {beat.kind === "check" && <b className="th-spin" />}
        {beat.kind === "done" && <b>✓</b>}
        <p>{beat.line}</p>
        {beat.kind === "check" && <i className="th-bar" />}
      </div>
    </article>
  );
}

export function TrainingHero() {
  return (
    <section className="th">
      <div className="th-copy">
        <span className="sp-tag">Training</span>
        <h1>Job-ready cybersecurity training</h1>
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

      <div className="th-stage">
        <ProofTicket />
      </div>

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
  display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 520px); gap: 28px 64px; align-items: center;
  padding: clamp(40px, 7vw, 96px) 0 0;
}
.th-copy { max-width: 560px }
.th h1 {
  margin: 14px 0 0; font-family: var(--font-display); font-weight: 500;
  font-size: clamp(2.4rem, 4.6vw, 3.9rem); line-height: 1.02; letter-spacing: -.045em; color: var(--ink);
}
.th-sub { margin: 20px 0 0; max-width: 50ch; color: var(--ink-soft); font-size: 1.08rem; line-height: 1.65 }
.th-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 30px }

.th-stage { position: relative }
.th-stage::before {
  content: ""; position: absolute; inset: 22px -22px -22px 22px;
  border: 1px solid rgba(85,70,224,.22); background: var(--accent-soft); z-index: 0;
}
.th-ticket {
  position: relative; z-index: 1; background: #fff; padding: 22px 26px 24px;
  border: 1px solid rgba(85,70,224,.22); border-left: 4px solid var(--accent);
  box-shadow: var(--highlight), var(--shadow-lg);
  transition: border-color .4s var(--ease);
}
.th-ticket[data-kind="done"] { border-left-color: var(--green) }

.th-steps { display: grid; grid-template-columns: repeat(3, 1fr); list-style: none; margin: 0 0 20px; padding: 0 }
.th-steps li {
  display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 2px solid var(--border);
  font-family: var(--font-mono); font-size: .66rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  color: var(--muted); transition: color .3s var(--ease), border-color .3s var(--ease);
}
.th-steps i { width: 8px; height: 8px; border: 1px solid var(--border-strong); flex: none; transition: background .3s var(--ease), border-color .3s var(--ease) }
.th-steps li[data-on="1"] { color: var(--accent-deep); border-bottom-color: var(--accent) }
.th-steps li[data-on="1"] i { background: var(--accent); border-color: var(--accent) }
.th-ticket[data-kind="done"] .th-steps li:last-child { color: var(--green); border-bottom-color: var(--green) }
.th-ticket[data-kind="done"] .th-steps li:last-child i { background: var(--green); border-color: var(--green) }

.th-ticket__head { display: flex; justify-content: space-between; align-items: center; gap: 12px }
.th-ticket__head span { font-family: var(--font-mono); font-size: .68rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--accent-deep) }
.th-ticket__head em {
  font-style: normal; padding: 4px 8px; border: 1px solid var(--accent); color: var(--accent-deep);
  font-family: var(--font-mono); font-size: .64rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  animation: th-pop .35s var(--ease) both;
}
.th-ticket[data-kind="done"] .th-ticket__head em { border-color: var(--green); color: #fff; background: var(--green) }
.th-ticket h3 { margin: 12px 0 0; font-family: var(--font-display); font-weight: 500; font-size: 1.9rem; letter-spacing: -.04em; color: var(--ink) }
.th-ticket dl { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 18px; margin: 16px 0 0; padding-top: 14px; border-top: 1px solid var(--border) }
.th-ticket dt { font-family: var(--font-mono); font-size: .6rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--muted) }
.th-ticket dd { margin: 3px 0 0; overflow-wrap: anywhere; font-family: var(--font-mono); font-size: .86rem; color: var(--ink) }

.th-beat {
  position: relative; display: grid; grid-template-columns: auto 1fr; gap: 12px; align-items: start;
  min-height: 76px; margin-top: 18px; padding: 14px 16px; background: var(--accent-soft);
  animation: th-in .4s var(--ease) both;
}
.th-beat b {
  display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 22px; padding: 0 6px;
  font-family: var(--font-mono); font-size: .66rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase;
  color: #fff; background: var(--accent);
}
.th-beat p { margin: 0; color: var(--ink); font-size: .98rem; line-height: 1.5 }
.th-ticket[data-kind="cmd"] .th-beat { background: var(--ink) }
.th-ticket[data-kind="cmd"] .th-beat b { background: var(--accent-soft); color: var(--accent-deep) }
.th-ticket[data-kind="cmd"] .th-beat p { color: #fff }
.th-ticket[data-kind="done"] .th-beat { background: rgba(22,163,74,.08) }
.th-ticket[data-kind="done"] .th-beat b { background: var(--green) }
.th-spin { width: 22px; min-width: 22px !important; padding: 0 !important; background: transparent !important; border: 2px solid var(--accent); border-right-color: transparent; border-radius: 50%; animation: th-rot .8s linear infinite }
.th-bar { grid-column: 1 / -1; display: block; height: 2px; background: var(--accent); transform-origin: left; animation: th-fill 2s var(--ease) both }

.th-facts {
  grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, 1fr); list-style: none;
  margin: clamp(32px, 5vw, 56px) 0 0; padding: 0; border-top: 1px solid var(--border);
}
.th-facts li { display: flex; align-items: baseline; gap: 14px; padding: 22px 24px 0 0 }
.th-facts li + li { padding-left: 24px; border-left: 1px solid var(--border) }
.th-facts b { font-family: var(--font-display); font-weight: 500; font-size: 2.2rem; letter-spacing: -.05em; line-height: 1; color: var(--accent-deep) }
.th-facts span { color: var(--ink-soft); font-size: .95rem; line-height: 1.4 }

@keyframes th-in { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
@keyframes th-pop { from { opacity: 0; transform: scale(.9) } to { opacity: 1; transform: none } }
@keyframes th-rot { to { transform: rotate(360deg) } }
@keyframes th-fill { from { transform: scaleX(0) } to { transform: scaleX(1) } }
@media (prefers-reduced-motion: reduce) {
  .th-beat, .th-ticket__head em, .th-bar { animation: none }
  .th-spin { animation: none }
}

@media (max-width: 980px) {
  .th { grid-template-columns: minmax(0, 1fr) }
  .th-stage { margin-right: 12px }
  .th-stage::before { inset: 12px -12px -12px 12px }
  .th-ticket { padding: 18px 18px 20px }
  .th-steps li { font-size: .6rem; letter-spacing: .04em }
  .th-facts { grid-template-columns: 1fr }
  .th-facts li, .th-facts li + li { padding: 16px 0; border-left: 0; border-bottom: 1px solid var(--border) }
}
`;

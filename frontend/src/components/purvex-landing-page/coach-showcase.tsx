"use client";

import { useState } from "react";
import { IconChecks, IconCompass, IconLifebuoy, IconMic, type BrandIcon } from "./brand-icons";

/* The four Coach modes shown as the real exchange each one produces.
   Wording follows how Coach is instructed to answer: a numbered path with
   a Check line, one specific question, and a scored interview. */

type Mode = {
  key: string;
  name: string;
  hint: string;
  Icon: BrandIcon;
  ticket: string;
  student: string;
  coach: React.ReactNode;
};

const MODES: Mode[] = [
  {
    key: "help",
    name: "Need help",
    hint: "One next step for a student who is stuck",
    Icon: IconLifebuoy,
    ticket: "INC-1042 Locked out",
    student: "I do not know where to start with this ticket.",
    coach: (
      <>
        <p>Start by confirming what is true before you change anything.</p>
        <ol>
          <li>Open Active Directory Users and Computers with Win+R and dsa.msc</li>
          <li>Find the account named in the ticket</li>
          <li>Open the Account tab and read the sign-in status</li>
        </ol>
        <p className="cs-check"><b>Check:</b> you can explain why the user cannot sign in without guessing.</p>
      </>
    ),
  },
  {
    key: "check",
    name: "Double-check",
    hint: "A test of the reasoning before anything changes",
    Icon: IconChecks,
    ticket: "INC-1042 Locked out",
    student: "I think the account is locked, so I will unlock it.",
    coach: (
      <>
        <p>What on the Account tab tells you that?</p>
        <p>
          And what would look different if the account were disabled instead of locked, since the fix is not the same?
        </p>
        <p className="cs-check"><b>Check:</b> you can name the field that separates the two cases.</p>
      </>
    ),
  },
  {
    key: "mentor",
    name: "Mentor",
    hint: "The call a team lead would make",
    Icon: IconCompass,
    ticket: "INC-1042 Locked out",
    student: "The account works again. What would a lead look at next?",
    coach: (
      <>
        <p>Ask why it happened, because unlocking treats the symptom.</p>
        <ul>
          <li>Repeated lockouts from one workstation usually point to a stale saved password</li>
          <li>Lockouts from many hosts point to someone guessing</li>
        </ul>
        <p className="cs-check"><b>Check:</b> you can say which case the log supports.</p>
      </>
    ),
  },
  {
    key: "interview",
    name: "Interview",
    hint: "A scored mock interview with a hire signal",
    Icon: IconMic,
    ticket: "Mock interview",
    student: "I would check the log first, contain the account, and then tell the team lead.",
    coach: (
      <>
        <p className="cs-score"><b>Score: 4 of 5</b></p>
        <ul>
          <li><b>What worked:</b> you read the log before touching the account.</li>
          <li><b>What was missing:</b> the result. Say what you preserved and who you told.</li>
        </ul>
        <p className="cs-check"><b>Better answer:</b> I would preserve the log, contain the account, and escalate before changing anything.</p>
      </>
    ),
  },
];

const PROOFS = [
  "Never states the answer to an unsolved mission",
  "Works from the student's real lab and results",
  "Reads a screenshot of the console",
];

export function CoachShowcase() {
  const [active, setActive] = useState(0);
  const m = MODES[active];

  return (
    <div className="cs" data-r>
      <div className="cs__left">
        <span className="pg-dark__kicker">PurveX Coach</span>
        <h2>A coach that never hands over the answer</h2>
        <p className="pg-dark__lead">
          Coach knows their lab because the lab syncs, and it can read and assess the ticket, the drill, and the CTF. It helps from that live picture, and it never hands over the answer.
        </p>
        <div className="cs__tabs" role="tablist" aria-label="Coach modes">
          {MODES.map((t, i) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              id={`cs-tab-${t.key}`}
              aria-selected={i === active}
              aria-controls="cs-panel"
              onClick={() => setActive(i)}
              data-on={i === active}
            >
              <i><t.Icon size={20} /></i>
              <span>
                <strong>{t.name}</strong>
                <em>{t.hint}</em>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="cs__sheet" id="cs-panel" role="tabpanel" aria-labelledby={`cs-tab-${m.key}`} key={m.key}>
        <header>
          <span>{m.ticket}</span>
          <em>{m.name}</em>
        </header>
        <div className="cs__turn cs__turn--student">
          <span>Student</span>
          <p>{m.student}</p>
        </div>
        <div className="cs__turn cs__turn--coach">
          <span><i /> Coach</span>
          <div>{m.coach}</div>
        </div>
      </div>

      <ul className="cs__proofs">
        {PROOFS.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

export const COACH_CSS = `
.pg-dark:has(.cs) { padding: 68px 56px 52px }
.cs[data-r] { opacity: 1; transform: none; filter: none }
.cs { display: grid; grid-template-columns: 1fr 1.05fr; gap: 0 56px; align-items: start }
.cs__left h2 { max-width: 16ch }
.cs__tabs { display: grid; gap: 10px; margin-top: 34px }
.cs__tabs button {
  display: grid; grid-template-columns: auto 1fr; gap: 16px; align-items: center; width: 100%; padding: 14px 16px; text-align: left;
  color: #fff; cursor: pointer; border: 1px solid rgba(238,240,255,.16); border-radius: 18px; background: rgba(16,8,64,.24);
  transition: background .3s var(--ease), border-color .3s var(--ease), transform .3s var(--ease);
}
.cs__tabs button:hover { background: rgba(16,8,64,.4); transform: translateX(4px) }
.cs__tabs button[data-on="true"] { background: rgba(255,255,255,.14); border-color: rgba(255,255,255,.5); transform: none }
.cs__tabs i { display: grid; place-items: center; width: 42px; height: 42px; border-radius: 13px; background: rgba(238,240,255,.14); border: 1px solid rgba(238,240,255,.26) }
.cs__tabs button[data-on="true"] i { background: #fff; color: var(--accent-deep) }
.cs__tabs strong { display: block; font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; letter-spacing: -.015em }
.cs__tabs em { display: block; margin-top: 2px; font-style: normal; font-size: .84rem; color: var(--hp-mist) }
.cs__sheet {
  position: relative; background: #fff; color: var(--ink); border-radius: 22px; padding: 22px 26px 26px;
  box-shadow: 0 40px 70px -30px rgba(10,6,48,.75); animation: cs-in .5s var(--ease) both;
}
.cs__sheet header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 16px; border-bottom: 1px solid var(--border) }
.cs__sheet header span { font-family: var(--font-mono); font-size: .66rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep) }
.cs__sheet header em { font-style: normal; padding: 3px 10px; border-radius: 999px; background: var(--accent-soft); font-family: var(--font-mono); font-size: .58rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep) }
.cs__turn { padding-top: 20px }
.cs__turn > span { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: .62rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--muted) }
.cs__turn > span i { width: 7px; height: 7px; border-radius: 50%; background: var(--accent) }
.cs__turn--student > p { margin: 8px 0 0; font-size: 1rem; line-height: 1.55; color: var(--ink-soft); font-style: italic }
.cs__turn--coach { margin-top: 22px; padding: 20px 20px 22px; border-radius: 16px; background: linear-gradient(135deg, #f7f5ff, #fff 80%); border: 1px solid rgba(106,92,255,.16) }
.cs__turn--coach > span { color: var(--accent-deep) }
.cs__turn--coach > div { margin-top: 10px; font-size: .96rem; line-height: 1.65; color: var(--ink) }
.cs__turn--coach p { margin: 0 0 10px }
.cs__turn--coach ol, .cs__turn--coach ul { margin: 0 0 12px; padding-left: 20px; display: grid; gap: 6px; color: var(--ink-soft) }
.cs__turn--coach ol { list-style: decimal }
.cs__turn--coach ul { list-style: disc }
.cs__turn--coach li::marker { color: var(--accent); font-weight: 700 }
.cs-check { margin: 14px 0 0 !important; padding-top: 12px; border-top: 1px solid rgba(106,92,255,.16); color: var(--accent-deep) }
.cs-check b { font-weight: 700 }
.cs-score b { font-family: var(--font-display); font-size: 1.15rem; letter-spacing: -.02em; color: var(--accent-deep) }
.cs__proofs { grid-column: 1 / -1; list-style: none; margin: 44px 0 0; padding: 26px 0 0; border-top: 1px solid rgba(238,240,255,.2); display: flex; flex-wrap: wrap; gap: 14px 40px }
.cs__proofs li { position: relative; padding-left: 22px; font-size: .94rem; color: #fff }
.cs__proofs li::before { content: ""; position: absolute; left: 0; top: .5em; width: 8px; height: 8px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 4px rgba(255,255,255,.18) }
@keyframes cs-in { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .cs__sheet { animation: none } .cs__tabs button { transition: none } }
@media (max-width: 980px) {
  .pg-dark:has(.cs) { padding: 44px 24px 36px }
  .cs { grid-template-columns: 1fr; gap: 32px }
  .cs__left h2 { max-width: none }
  .cs__proofs { margin-top: 12px }
}
@media (max-width: 680px) {
  .cs__sheet { padding: 18px 18px 22px }
  .cs__turn--coach { padding: 16px }
}
`;

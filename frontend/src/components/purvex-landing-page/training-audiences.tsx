"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { SKILLS, type Skill } from "@/lib/academy-score";
import type { CourseOutline } from "./training-page";
import {
  IconBriefcase, IconCampus, IconEvidence, IconGraduate, IconIdentity, IconKey, IconLog, IconValidate,
  type BrandIcon,
} from "./brand-icons";

/* The portal's benefits, told once per audience. Each view has three
   benefits and one visual made of things the portal really produces:
   a ticket that closes, a cohort setup, and a proof sheet. */

const SAMPLE_SCORES: Record<Skill, number> = { accounts: 92, directory: 78, troubleshooting: 88, security: 61 };

type View = {
  key: string;
  tab: string;
  sub: string;
  Icon: BrandIcon;
  headline: string;
  benefits: { title: string; body: string }[];
};

const VIEWS: View[] = [
  {
    key: "students",
    tab: "Students",
    sub: "Learn by doing",
    Icon: IconGraduate,
    headline: "Until the directory agrees",
    benefits: [
      { title: "A company of your own", body: "Tickets close only when the directory shows the change." },
      { title: "Coach on the ticket", body: "It gives the next step. The answer stays yours." },
      { title: "Proof you can show", body: "A score, closed tickets, and lines you can defend." },
    ],
  },
  {
    key: "programs",
    tab: "Programs",
    sub: "Schools, academies, workforce",
    Icon: IconCampus,
    headline: "Same course. Checked in the lab.",
    benefits: [
      { title: "One curriculum", body: "Every student works the same missions and drills." },
      { title: "Checked, not claimed", body: "The lab has to show the change." },
      { title: "A passcode, not a server", body: "Each student builds the lab on their own machine." },
    ],
  },
  {
    key: "employers",
    tab: "Employers",
    sub: "Hiring and upskilling",
    Icon: IconBriefcase,
    headline: "Hire from closed tickets",
    benefits: [
      { title: "Work you can open", body: "The directory shows the task. A résumé line does not." },
      { title: "Four skills, one bar", body: "Scored against what a Tier 1 hire has to do." },
      { title: "A spoken interview", body: "It ends with a hire signal, after the tickets are closed." },
    ],
  },
];

/* ---------- student: a ticket that changes state ---------- */

const TICKET_STAGES = ["Open", "Coached", "Proven"] as const;

function TicketBody({ stage }: { stage: number }) {
  if (stage === 0) {
    return (
      <>
        <dl className="au-grid">
          <div><dt>Account</dt><dd>riley.kwan</dd></div>
          <div><dt>Host</dt><dd>OPS-WKS03</dd></div>
          <div><dt>Seen</dt><dd>07:14</dd></div>
          <div><dt>Event</dt><dd>4740</dd></div>
        </dl>
        <p className="au-ask">Open the account before you change anything.</p>
      </>
    );
  }
  if (stage === 1) {
    return (
      <div className="au-coach">
        <span><i /> Coach</span>
        <p>Check the Account tab first. What does it tell you about why the user cannot sign in?</p>
        <p className="au-coach__check"><b>Check:</b> you can name the cause without guessing.</p>
      </div>
    );
  }
  return (
    <>
      <ul className="au-checks">
        <li><Check size={14} /> The change is seen in the directory</li>
        <li><Check size={14} /> Ticket closed and added to the record</li>
      </ul>
      <p className="au-resume">Resume line: restored a locked-out account in Active Directory Users and Computers (INC-1042).</p>
    </>
  );
}

function StudentVisual() {
  const [stage, setStage] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setStage((s) => (s + 1) % TICKET_STAGES.length), 3600);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <div className="au-ticket-wrap">
      <article className="au-ticket" data-stage={stage}>
        <header>
          <span>INC-1042</span>
          <em key={stage}>{TICKET_STAGES[stage]}</em>
        </header>
        <h4>Locked out</h4>
        <div className="au-body" key={stage}>
          <TicketBody stage={stage} />
        </div>
      </article>
      <ol className="au-rail">
        {TICKET_STAGES.map((s, i) => (
          <li key={s} data-on={i <= stage}>
            <button
              type="button"
              onClick={() => {
                setStage(i);
                setPaused(true);
              }}
              aria-label={`Show the ${s} stage`}
            >
              <i />
              <span>{s}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- programs: how a cohort runs ---------- */

const COHORT: { title: string; Icon: BrandIcon }[] = [
  { title: "A class passcode opens the course", Icon: IconKey },
  { title: "Each student signs in with their own account", Icon: IconIdentity },
  { title: "Each student builds the lab on their own machine", Icon: IconLog },
  { title: "Everyone works the same missions and drills", Icon: IconValidate },
  { title: "Every student gets a readiness report", Icon: IconEvidence },
];

function ProgramVisual() {
  const [on, setOn] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setOn((n) => (n + 1) % COHORT.length), 1800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <ol className="au-cohort">
      {COHORT.map((c, i) => (
        <li key={c.title} data-on={i <= on} data-now={i === on}>
          <i><c.Icon size={20} /></i>
          <span>{c.title}</span>
        </li>
      ))}
    </ol>
  );
}

/* ---------- employers: a proof sheet ---------- */

const VERIFIED = [
  "Restore a blocked account",
  "Grant access with a group",
  "Offboard without deleting",
  "Set an account lockout policy",
  "Turn on the auditing a SOC needs",
];

function EmployerVisual() {
  return (
    <article className="au-sheet">
      <header>
        <span>Candidate proof</span>
        <em>Example</em>
      </header>
      <div className="au-sheet__score">
        <strong>72<small>/100</small></strong>
        <span>Readiness<em>Almost ready</em></span>
      </div>
      <ul className="au-bars">
        {(Object.keys(SKILLS) as Skill[]).map((k) => (
          <li key={k}>
            <span>{SKILLS[k].label}</span>
            <b>{SAMPLE_SCORES[k]}</b>
            <i style={{ ["--w" as string]: `${SAMPLE_SCORES[k]}%` }} />
          </li>
        ))}
      </ul>
      <p className="au-sheet__label">Verified in their own lab</p>
      <ul className="au-verified">
        {VERIFIED.map((t, i) => (
          <li key={t} style={{ ["--i" as string]: i }}>
            <Check size={13} /> {t}
          </li>
        ))}
      </ul>
      <p className="au-sheet__signal">Interview signal <b>Close</b></p>
    </article>
  );
}

export function TrainingAudiences({ outline }: { outline: CourseOutline }) {
  const [active, setActive] = useState(0);
  const v = VIEWS[active];

  return (
    <div className="au">
      <div className="au-tabs" role="tablist" aria-label="Choose your view">
        {VIEWS.map((t, i) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            id={`au-tab-${t.key}`}
            aria-selected={i === active}
            aria-controls="au-panel"
            data-on={i === active}
            onClick={() => setActive(i)}
          >
            <i><t.Icon size={20} /></i>
            <span>
              <strong>{t.tab}</strong>
              <em>{t.sub}</em>
            </span>
          </button>
        ))}
      </div>

      <div className="au-panel" id="au-panel" role="tabpanel" aria-labelledby={`au-tab-${v.key}`} key={v.key}>
        <div className="au-copy">
          <h3>{v.headline}</h3>
          <ol>
            {v.benefits.map((b, i) => (
              <li key={b.title}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{b.title}</strong>
                  <p>{b.body}</p>
                </div>
              </li>
            ))}
          </ol>
          {v.key === "programs" && (
            <div className="au-course">
              <span>The course</span>
              <ul>
                {outline.map((p) => (
                  <li key={p.title}>{p.title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="au-stage" aria-hidden="true">
          {v.key === "students" && <StudentVisual />}
          {v.key === "programs" && <ProgramVisual />}
          {v.key === "employers" && <EmployerVisual />}
        </div>
      </div>
    </div>
  );
}

export const AUDIENCE_CSS = `
.au-tabs { display: grid; grid-template-columns: repeat(3, 1fr); border-bottom: 1px solid var(--border-strong) }
.au-tabs button {
  position: relative; display: flex; align-items: center; gap: 14px; padding: 20px 22px 22px 0; text-align: left; background: none; border: 0; cursor: pointer;
  color: var(--muted); transition: color .3s var(--ease);
}
.au-tabs button::after { content: ""; position: absolute; left: 0; right: 22px; bottom: -1px; height: 3px; background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform .45s var(--ease) }
.au-tabs button[data-on="true"] { color: var(--ink) }
.au-tabs button[data-on="true"]::after { transform: none }
.au-tabs button:hover { color: var(--ink) }
.au-tabs i { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 14px; background: #fff; border: 1px solid var(--border-strong); color: var(--muted-dim); transition: background .3s var(--ease), color .3s var(--ease), border-color .3s var(--ease) }
.au-tabs button[data-on="true"] i { background: linear-gradient(145deg, #7b6dff, #3d32b0); border-color: transparent; color: #fff }
.au-tabs strong { display: block; font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; letter-spacing: -.02em }
.au-tabs em { display: block; margin-top: 2px; font-style: normal; font-size: .82rem; color: var(--muted) }
.au-panel { display: grid; grid-template-columns: 1fr 1.05fr; gap: 72px; align-items: center; padding-top: 64px; animation: au-in .5s var(--ease) both }
.au-copy h3 { margin: 0; font-family: var(--font-display); font-size: clamp(2rem, 3.8vw, 3rem); font-weight: 700; letter-spacing: -.045em; line-height: 1.05; max-width: 13ch; color: var(--ink) }
.au-copy ol { list-style: none; margin: 40px 0 0; padding: 0; border-top: 1px solid var(--border-strong) }
.au-copy li { display: grid; grid-template-columns: 2.6rem 1fr; gap: 6px; padding: 24px 0; border-bottom: 1px solid var(--border) }
.au-copy li > span { font-family: var(--font-mono); font-size: .72rem; font-weight: 700; letter-spacing: .08em; color: var(--accent-deep); padding-top: 4px }
.au-copy strong { display: block; font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink) }
.au-copy p { margin: 6px 0 0; max-width: 42ch; font-size: .98rem; line-height: 1.6; color: var(--ink-soft) }
.au-course { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-top: 26px }
.au-course > span { font-family: var(--font-mono); font-size: .64rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--accent-deep) }
.au-course ul { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px }
.au-course li { padding: 7px 13px; border-radius: 999px; background: #fff; border: 1px solid rgba(106,92,255,.2); font-size: .8rem; font-weight: 550; color: var(--accent-deep) }
.au-stage {
  display: grid; place-items: center; min-height: 460px; padding: 40px; border-radius: 28px;
  background: radial-gradient(70% 70% at 80% 10%, rgba(106,92,255,.16), transparent 60%), linear-gradient(145deg, #f4f2ff, #fff);
  border: 1px solid rgba(106,92,255,.18);
}
.au-ticket-wrap, .au-cohort, .au-sheet { width: 100%; max-width: 420px }
.au-ticket { position: relative; background: #fff; border-radius: 20px; padding: 22px 24px 24px; border: 1px solid var(--border-strong); box-shadow: 0 36px 70px -34px rgba(42,34,128,.55); min-height: 300px; overflow: hidden }
.au-ticket::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: linear-gradient(180deg, #7b6dff, #3d32b0) }
.au-ticket header, .au-sheet header { display: flex; align-items: center; justify-content: space-between }
.au-ticket header span, .au-sheet header span { font-family: var(--font-mono); font-size: .66rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep) }
.au-ticket header em, .au-sheet header em { font-style: normal; padding: 4px 12px; border-radius: 999px; background: var(--accent-soft); color: var(--accent-deep); font-family: var(--font-mono); font-size: .6rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; animation: au-pop .4s var(--ease) both }
.au-ticket[data-stage="2"] header em { background: #e3f6ee; color: #12805a }
.au-ticket h4 { margin: 14px 0 0; font-family: var(--font-display); font-size: 1.7rem; font-weight: 700; letter-spacing: -.035em }
.au-body { margin-top: 18px; animation: au-in .45s var(--ease) both }
.au-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px; margin: 0; padding-top: 16px; border-top: 1px solid var(--border) }
.au-grid dt { font-family: var(--font-mono); font-size: .58rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--muted) }
.au-grid dd { margin: 4px 0 0; font-family: var(--font-mono); font-size: .84rem; font-weight: 650 }
.au-ask { margin: 18px 0 0; padding: 12px 14px; background: var(--accent-soft); font-size: .9rem; font-weight: 600; color: var(--accent-deep) }
.au-coach { padding: 16px 18px; border-radius: 16px; background: linear-gradient(135deg, #f7f5ff, #fff 80%); border: 1px solid rgba(106,92,255,.18) }
.au-coach > span { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: .62rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--accent-deep) }
.au-coach > span i { width: 7px; height: 7px; border-radius: 50%; background: var(--accent) }
.au-coach p { margin: 10px 0 0; font-size: .95rem; line-height: 1.6 }
.au-coach__check { padding-top: 10px; border-top: 1px solid rgba(106,92,255,.16); color: var(--accent-deep) }
.au-checks { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--border) }
.au-checks li, .au-verified li { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); font-size: .92rem }
.au-checks svg, .au-verified svg { flex: none; width: 22px; height: 22px; padding: 5px; border-radius: 50%; background: #e3f6ee; color: #12805a }
.au-resume { margin: 16px 0 0; font-size: .84rem; line-height: 1.55; color: var(--ink-soft) }
.au-rail { list-style: none; margin: 24px 0 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); position: relative }
.au-rail::before { content: ""; position: absolute; top: 6px; left: 16.6%; right: 16.6%; height: 2px; background: var(--border-strong) }
.au-rail button { position: relative; display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; background: none; border: 0; cursor: pointer; font-family: var(--font-mono); font-size: .58rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--muted-dim); transition: color .3s var(--ease) }
.au-rail i { width: 13px; height: 13px; border-radius: 50%; background: #fff; border: 2px solid var(--border-strong); transition: background .3s var(--ease), border-color .3s var(--ease) }
.au-rail li[data-on="true"] button { color: var(--accent-deep) }
.au-rail li[data-on="true"] i { background: var(--accent); border-color: var(--accent) }
.au-cohort { list-style: none; margin: 0; padding: 0; position: relative; display: grid; gap: 14px }
.au-cohort::before { content: ""; position: absolute; left: 25px; top: 26px; bottom: 26px; width: 2px; background: var(--border-strong) }
.au-cohort li { position: relative; display: flex; align-items: center; gap: 16px; padding: 12px 16px 12px 12px; border-radius: 16px; background: transparent; font-size: .95rem; font-weight: 600; color: var(--muted); transition: background .4s var(--ease), color .4s var(--ease), box-shadow .4s var(--ease) }
.au-cohort li i { display: grid; place-items: center; flex: none; width: 28px; height: 28px; margin: 0 6px 0 0; border-radius: 50%; background: #fff; border: 2px solid var(--border-strong); color: var(--muted-dim); transition: background .4s var(--ease), color .4s var(--ease), border-color .4s var(--ease); z-index: 1 }
.au-cohort li i svg { width: 14px; height: 14px }
.au-cohort li[data-on="true"] { color: var(--ink) }
.au-cohort li[data-on="true"] i { background: var(--accent); border-color: var(--accent); color: #fff }
.au-cohort li[data-now="true"] { background: #fff; box-shadow: 0 18px 32px -20px rgba(42,34,128,.5) }
.au-sheet { background: #fff; border-radius: 20px; padding: 22px 24px 20px; border: 1px solid var(--border-strong); box-shadow: 0 36px 70px -34px rgba(42,34,128,.55) }
.au-sheet__score { display: flex; align-items: flex-end; gap: 14px; margin: 16px 0 4px }
.au-sheet__score strong { font-family: var(--font-display); font-size: 3.2rem; font-weight: 700; line-height: .9; letter-spacing: -.055em; color: var(--accent-deep) }
.au-sheet__score small { font-size: 1rem; color: var(--muted); font-weight: 600 }
.au-sheet__score > span { display: flex; flex-direction: column; padding-bottom: 4px; font-size: .84rem; font-weight: 650 }
.au-sheet__score em { font-style: normal; font-weight: 500; font-size: .74rem; color: #a86a08 }
.au-bars { list-style: none; margin: 14px 0 0; padding: 14px 0 0; border-top: 1px solid var(--border); display: grid; gap: 10px }
.au-bars li { display: grid; grid-template-columns: 1fr auto; gap: 4px 10px; font-size: .8rem; color: var(--ink-soft) }
.au-bars b { font-family: var(--font-mono); font-size: .72rem; color: var(--ink) }
.au-bars i { grid-column: 1 / -1; position: relative; height: 5px; border-radius: 999px; background: var(--accent-soft); overflow: hidden }
.au-bars i::after { content: ""; position: absolute; inset: 0 auto 0 0; width: var(--w); border-radius: 999px; background: linear-gradient(90deg, #8b7fff, var(--accent)); transform-origin: left; animation: au-fill 1s var(--ease) .2s both }
.au-sheet__label { margin: 16px 0 0; font-family: var(--font-mono); font-size: .6rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--muted) }
.au-verified { list-style: none; margin: 4px 0 0; padding: 0 }
.au-verified li { padding: 9px 0; font-size: .84rem; opacity: 0; animation: au-in .45s var(--ease) both; animation-delay: calc(.3s + var(--i) * .12s) }
.au-sheet__signal { display: flex; justify-content: space-between; margin: 10px 0 0; padding-top: 12px; border-top: 1px solid var(--border); font-size: .84rem; color: var(--ink-soft) }
.au-sheet__signal b { color: var(--accent-deep) }
@keyframes au-in { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: none } }
@keyframes au-pop { from { opacity: 0; transform: scale(.9) } to { opacity: 1; transform: none } }
@keyframes au-fill { from { transform: scaleX(0) } to { transform: none } }
@media (prefers-reduced-motion: reduce) {
  .au-cohort li { color: var(--ink) }
  .au-cohort li i { background: var(--accent); border-color: var(--accent); color: #fff }
}
@media (prefers-reduced-motion: reduce) { .au-panel, .au-body, .au-ticket header em, .au-bars i::after, .au-verified li { animation: none; opacity: 1 } }
@media (max-width: 980px) {
  .au-panel { grid-template-columns: 1fr; gap: 40px; padding-top: 44px }
  .au-copy h3 { max-width: none }
  .au-stage { min-height: 0; padding: 28px 18px }
}
@media (max-width: 680px) {
  .au-tabs { grid-template-columns: 1fr }
  .au-tabs button { padding: 14px 0 }
  .au-tabs button::after { right: 0 }
  .au-tabs em { display: none }
}
`;

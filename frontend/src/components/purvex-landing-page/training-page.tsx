"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
  Check,
  Server,
  BookOpen,
  Compass,
  Eye,
  FileText,
  Footprints,
  GraduationCap,
  Lock,
  ShieldAlert,
  Siren,
} from "lucide-react";
import { BOOKING_URL, SiteChrome } from "./chrome";
import { CHALLENGE_LABELS, MISSION_CATALOG, type MissionCatalogEntry } from "@/lib/academy-missions";
import { SCORE_READY, SCORE_SOLID, SKILLS, type Skill } from "@/lib/academy-score";
import { COACH_MODE_LABELS } from "@/lib/academy-coach-mode";

/* ─────────────────────────────────────────────────────────
   Cybersecurity Training -- Think Like a SOC Analyst 101.

   Built from the Academy portal itself: the syllabus comes from the
   portal's content (passed in by the route), and the missions,
   competencies, score bars and coach modes are imported from the same
   modules the portal runs on, so this page describes the course that
   actually exists. Visual language is the marketing site's own:
   rounded surfaces, soft purple, and the shared premium depth from
   chrome.tsx.
   ───────────────────────────────────────────────────────── */

export type CourseOutline = {
  label: string;
  title: string;
  entries: { title: string; summary: string; live: boolean }[];
}[];

const pad = (n: number) => String(n).padStart(2, "0");

const MISSION_SETS: { key: MissionCatalogEntry["challenge"]; brief: string }[] = [
  { key: "day-one", brief: "First day on the desk. Find the facts in the directory before anyone asks." },
  { key: "ticket-queue", brief: "Real help desk tickets. Change the directory, then prove the fix held." },
  { key: "alert-queue", brief: "One alert at 2 AM. Read the log, then decide: mistake or attack." },
];

const missionsBySet = (key: MissionCatalogEntry["challenge"]) =>
  Object.values(MISSION_CATALOG).filter((m) => m.challenge === key);

const TOTAL_MISSIONS = Object.keys(MISSION_CATALOG).length;

// Illustrative student, for the report preview only.
const SAMPLE_SCORES: Record<Skill, number> = { accounts: 92, directory: 78, troubleshooting: 88, security: 61 };

const COACH_NOTES: Record<keyof typeof COACH_MODE_LABELS, string> = {
  walkthrough: "New or stuck. One next move, a numbered path through the real tools, and a check so you know what done looks like.",
  check: "You already get the idea. It checks your reasoning and points to the next step, without the beginner lecture.",
  mentor: "You know the lab. It ties the ticket to a real desk or SOC call and talks through the tradeoffs a lead would weigh.",
  interview: "It plays the GovTech Financial hiring manager. Five questions, each scored out of five, then a hire signal.",
};

const translations = [
  { icon: Siren, detective: "A crime scene", analyst: "An alert in the queue" },
  { icon: FileText, detective: "Witness statements", analyst: "Raw log lines" },
  { icon: Footprints, detective: "A suspect's known M.O.", analyst: "Attacker TTPs (MITRE ATT&CK)" },
  { icon: Lock, detective: "Closing the case", analyst: "Containing the breach" },
];

const careerLadder = [
  { level: "Trainee", icon: BookOpen, body: "Networks, operating systems, and how to read a raw log line." },
  { level: "Tier 1 SOC Analyst", icon: Eye, body: "Work the queue, triage alerts, and tell noise from a real signal." },
  { level: "Tier 2 / Incident Responder", icon: ShieldAlert, body: "Take a confirmed incident from start to finish. Contain, eradicate, document." },
  { level: "Threat Hunter", icon: Compass, body: "Don't wait for the alarm. Hunt the attacker who hasn't tripped one yet." },
  { level: "Senior Analyst / SOC Lead", icon: Award, body: "Mentor the next Tier 1 and shape how the whole team investigates." },
];

const formats = [
  { title: "Taught live", body: "1:1 or small-group sessions, led by an instructor who still works a queue." },
  { title: "Embedded in your program", body: "We teach inside your existing curriculum, on your calendar." },
  { title: "A portal per cohort", body: "Your students get their own Academy sign-in, progress and readiness report." },
  { title: "A lab on their own machine", body: "One script builds the GovTech Financial directory locally. Nothing to host." },
];

const proofs = [
  { ok: true, text: "jamie.torres is a member of the announcement group" },
  { ok: true, text: "riley.kwan is enabled and no longer locked out" },
  { ok: true, text: "svc-backup-job Description holds the run window" },
  { ok: false, text: "taylor.osei is still in Operations Users" },
];

// The 24 on-the-job tasks the drills and tickets are tied to. `lab` means the
// change is checked in the student's own directory.
const jobGroups: { skill: string; items: { t: string; lab: boolean }[] }[] = [
  {
    skill: "Accounts and Groups",
    items: [
      { t: "Grant access with a group, never admin rights", lab: true },
      { t: "Create an account to the naming standard", lab: true },
      { t: "Fix a group that cannot grant access", lab: true },
      { t: "Build role-based access with groups", lab: false },
    ],
  },
  {
    skill: "Directory Navigation",
    items: [
      { t: "Correct a misplaced account", lab: true },
      { t: "Retire accounts and computers nobody uses", lab: true },
    ],
  },
  {
    skill: "Troubleshooting",
    items: [
      { t: "Restore a blocked account", lab: true },
      { t: "Reset a password the safe way", lab: false },
      { t: "Check a ticket before acting on it", lab: false },
    ],
  },
  {
    skill: "Security Response",
    items: [
      { t: "Remove access that should not be there", lab: true },
      { t: "Offboard without deleting", lab: true },
      { t: "Set up a service account safely", lab: true },
      { t: "Fix a password that never expires", lab: true },
      { t: "Set an account lockout policy", lab: true },
      { t: "Turn on the auditing a SOC needs", lab: true },
      { t: "Keep the Security log long enough to investigate", lab: true },
      { t: "Fix a roastable service account", lab: true },
      { t: "Contain a compromised account, keep the evidence", lab: false },
      { t: "Triage a login alert: contain, preserve, escalate", lab: false },
      { t: "Trace a logon across log sources", lab: false },
      { t: "Write a clear escalation", lab: false },
    ],
  },
];

export default function TrainingPage({ outline }: { outline: CourseOutline }) {
  const lessonCount = outline.reduce((n, p) => n + p.entries.filter((e) => e.live).length, 0);

  return (
    <SiteChrome active="training">
      {/* ═══════════ HERO — copy left, the portal itself right ═══════════ */}
      <section className="sp-hero sp-hero--course">
        <div className="sp-hero__copy">
          <span className="sp-hero__badge">Cohort course · Student portal</span>
          <h1 className="sp-hero__h1">Think Like a SOC Analyst 101</h1>
          <p className="sp-hero__sub">
            Students learn the fundamentals, then work a live directory, a ticket queue and a
            2 AM login. They finish with a readiness score a hiring manager can read.
          </p>
          <div className="sp-hero__actions">
            <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
              Bring it to your program <ArrowRight size={16} />
            </a>
            <Link href="/academy" className="sp-btn sp-btn--ghost sp-btn--lg">
              Student sign in
            </Link>
          </div>
          <dl className="sp-facts">
            <div><dt>Phases</dt><dd>{pad(outline.length)}</dd></div>
            <div><dt>Lessons live</dt><dd>{pad(lessonCount)}</dd></div>
            <div><dt>Graded missions</dt><dd>{pad(TOTAL_MISSIONS)}</dd></div>
          </dl>
        </div>

        <figure className="sp-pv" data-r aria-label="Preview of the student portal">
          <div className="sp-pv__bar" aria-hidden="true">
            <span className="sp-pv__mark"><GraduationCap size={14} /></span>
            <span className="sp-pv__name">Think Like a SOC Analyst <em>101</em></span>
            <span className="sp-pv__av">JD</span>
          </div>
          <div className="sp-pv__body" aria-hidden="true">
            <div className="sp-pv__head">
              <div>
                <strong className="sp-pv__h">Welcome back</strong>
                <span className="sp-pv__sub">Pick up where you left off.</span>
              </div>
              <div className="sp-pv__score">
                <span className="sp-kick">Readiness</span>
                <strong>72<small>/100</small></strong>
                <span className="sp-kick sp-kick--warn">Almost ready</span>
              </div>
            </div>
            <div className="sp-pv__next">
              <span className="sp-kick">Start here</span>
              <strong>Week 2 — Log Analysis Fundamentals <ArrowRight size={13} /></strong>
            </div>
            {outline.map((p, i) => {
              const live = p.entries.filter((e) => e.live).length;
              // Illustrative progress: Phase 1 finished, one week into Phase 2.
              const done = i === 0 ? p.entries.length : i === 1 ? 1 : 0;
              return (
                <div key={p.title} className={`sp-pv__row${live === 0 ? " sp-pv__row--off" : ""}`}>
                  <span className="sp-pv__num">{pad(i + 1)}</span>
                  <div className="sp-pv__rowbody">
                    <span className="sp-pv__rowtitle">
                      {p.title}
                      {live === 0 && <em className="sp-square">In preparation</em>}
                    </span>
                    {live > 0 && (
                      <span className="sp-pv__segs">
                        {p.entries.map((e, j) => (
                          <i key={e.title} className={j < done ? "on" : j === done ? "here" : ""} />
                        ))}
                      </span>
                    )}
                  </div>
                  <span className="sp-pv__count">{live > 0 ? `${done}/${p.entries.length}` : "—"}</span>
                </div>
              );
            })}
          </div>
          <figcaption className="sp-pv__cap">The student portal, as a student sees it</figcaption>
        </figure>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="sp-section">
        <div className="sp-head sp-head--left" data-r>
          <span className="sp-tag">How the course works</span>
          <h2>Learn it. Work it. Prove it.</h2>
          <p>
            Certifications teach vocabulary. This course teaches judgment, and then checks it on
            work that looks like the job.
          </p>
        </div>
        <ol className="sp-loop" data-r>
          <li>
            <span className="sp-loop__n">01</span>
            <h3>Learn</h3>
            <p>
              Weekly lessons, each opened by an essential question. A quiz stands between you and
              marking the week complete.
            </p>
          </li>
          <li>
            <span className="sp-loop__n">02</span>
            <h3>Work</h3>
            <p>
              Build GovTech Financial, a fictional company&apos;s Active Directory, on your own
              machine. Then work its desk: lookups, tickets, and an alert.
            </p>
          </li>
          <li>
            <span className="sp-loop__n">03</span>
            <h3>Prove</h3>
            <p>
              Every attempt lands in a mission log and a readiness score, measured against the bar
              for a Tier 1 hire.
            </p>
          </li>
        </ol>
      </section>

      {/* ═══════════ THE LAB — proof of work ═══════════ */}
      <section className="sp-section">
        <div className="tr-split" data-r>
          <div className="sp-head sp-head--left">
            <span className="sp-tag">The lab</span>
            <h2>No lab change, no closed ticket</h2>
            <p>
              Students run one script to build GovTech Financial: five departments, nine people,
              and the groups that connect them. It syncs to their account every minute.
            </p>
            <p>
              A hands-on ticket only closes when the change shows up in their directory, and a
              typed answer cannot be copied off the ticket. That is why the score is worth reading.
            </p>
          </div>
          <div className="tr-proof" aria-hidden="true">
            <header>
              <span><Server size={14} /> govtechfinancial.local</span>
              <em><i /> Synced</em>
            </header>
            <ul>
              {proofs.map((p) => (
                <li key={p.text} data-ok={p.ok}>
                  <span>{p.ok ? <Check size={13} /> : "!"}</span>
                  {p.text}
                </li>
              ))}
            </ul>
            <footer>Checked against the live directory. A lab check code lasts 4 hours.</footer>
          </div>
        </div>
      </section>

      {/* ═══════════ SYLLABUS (from the portal's own content) ═══════════ */}
      <section className="sp-section" id="syllabus">
        <div className="sp-head sp-head--left" data-r>
          <span className="sp-tag">The syllabus</span>
          <h2>The same phases your students open in the portal</h2>
          <p>New weeks go live in the portal as they are finished. This list updates with them.</p>
        </div>
        <div className="sp-phases" data-r>
          {outline.map((p, i) => {
            const live = p.entries.filter((e) => e.live).length;
            return (
              <div key={p.title} className={`sp-phase${p.entries.length === 0 ? " sp-phase--off" : ""}`}>
                <span className="sp-phase__num">{pad(i + 1)}</span>
                <div className="sp-phase__main">
                  <h3>
                    {p.title}
                    {p.entries.length === 0 && <em className="sp-square">In preparation</em>}
                  </h3>
                  {p.entries.length === 0 ? (
                    <p className="sp-phase__empty">Triage, investigation, containment, and writing it up.</p>
                  ) : (
                    <ul className="sp-phase__weeks">
                      {p.entries.map((e) => (
                        <li key={e.title} className={e.live ? "" : "is-soon"}>
                          <span className="sp-phase__wk">{e.title}</span>
                          <span className="sp-phase__sum">{e.summary}</span>
                          {!e.live && <em className="sp-square sp-square--mute">Soon</em>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <span className="sp-phase__count">{p.entries.length ? `${live}/${p.entries.length} live` : "—"}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ MISSIONS ═══════════ */}
      <section className="sp-section">
        <div className="sp-head sp-head--left" data-r>
          <span className="sp-tag">The missions</span>
          <h2>{TOTAL_MISSIONS} missions on a directory they built</h2>
          <p>
            Each one is graded. Hints cost something, wrong answers are recorded, and the answer
            never comes from the coach.
          </p>
        </div>
        <div className="sp-sets" data-r>
          {MISSION_SETS.map((set) => {
            const list = missionsBySet(set.key);
            return (
              <div key={set.key} className="sp-set">
                <div className="sp-set__head">
                  <h3>{CHALLENGE_LABELS[set.key]}</h3>
                  <span className="sp-set__count">{pad(list.length)} missions</span>
                </div>
                <p className="sp-set__brief">{set.brief}</p>
                <ol className="sp-set__list">
                  {list.map((m, i) => (
                    <li key={m.id}>
                      <span className="sp-set__n">{pad(i + 1)}</span>
                      <span className="sp-set__t">{m.title}</span>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════ READINESS ═══════════ */}
      <section className="sp-section">
        <div className="sp-readiness" data-r>
          <div className="sp-head sp-head--left sp-readiness__copy">
            <span className="sp-tag">The readiness report</span>
            <h2>A score a hiring manager can read</h2>
            <p>
              Four competencies, each measured against the bar for a Tier 1 hire. Almost ready
              starts at {SCORE_SOLID}. Ready means {SCORE_READY} overall with nothing weak.
            </p>
            <ul className="sp-levels">
              <li><i className="sp-dot sp-dot--bad" /> Keep practicing <span>under {SCORE_SOLID}</span></li>
              <li><i className="sp-dot sp-dot--warn" /> Almost ready <span>{SCORE_SOLID}+</span></li>
              <li><i className="sp-dot sp-dot--good" /> Ready <span>{SCORE_READY}+</span></li>
            </ul>
          </div>
          <div className="sp-report" aria-label="Example readiness report">
            <div className="sp-report__top">
              <span className="sp-kick">Competencies</span>
              <span className="sp-kick">Example student</span>
            </div>
            {(Object.keys(SKILLS) as Skill[]).map((k, i) => {
              const v = SAMPLE_SCORES[k];
              const tone = v >= SCORE_READY ? "good" : v >= SCORE_SOLID ? "warn" : "bad";
              return (
                <div key={k} className="sp-report__row">
                  <div className="sp-report__name">
                    <strong>{SKILLS[k].label}</strong>
                    <span>{SKILLS[k].advice}</span>
                  </div>
                  <div className="sp-report__scale">
                    <div className={`sp-report__fill sp-bg-${tone}`} style={{ width: `${v}%` }} />
                    <i style={{ left: `${SCORE_SOLID}%` }} data-mark={i === 0 ? `Almost · ${SCORE_SOLID}` : undefined} />
                    <i style={{ left: `${SCORE_READY}%` }} data-mark={i === 0 ? `Ready · ${SCORE_READY}` : undefined} />
                  </div>
                  <span className={`sp-report__v sp-text-${tone}`}>{v}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ JOB TASKS ═══════════ */}
      <section className="sp-section">
        <div className="sp-head sp-head--left" data-r>
          <span className="sp-tag">Job tasks</span>
          <h2>24 tasks a Tier 1 is hired to do</h2>
          <p>
            Each drill and ticket maps to one. Filled dots are checked in the student&apos;s own
            directory. Outlined dots are proven in written and scenario work.
          </p>
        </div>
        <div className="tr-jobs" data-r>
          {jobGroups.map((g) => (
            <article key={g.skill}>
              <header>
                <strong>{g.skill}</strong>
                <span>{g.items.length}</span>
              </header>
              <ul>
                {g.items.map((j) => (
                  <li key={j.t} data-lab={j.lab}>
                    <i />
                    {j.t}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* ═══════════ COACH + DRILLS ═══════════ */}
      <section className="sp-section">
        <div className="sp-head sp-head--left" data-r>
          <span className="sp-tag">PurveX Coach</span>
          <h2>A coach that won&apos;t hand over the answer</h2>
          <p>
            It reads the student&apos;s own report and lab, then works in one of four modes. On an
            unsolved mission it teaches the method, never the flag.
          </p>
        </div>
        <div className="sp-modes" data-r>
          {(Object.keys(COACH_MODE_LABELS) as (keyof typeof COACH_MODE_LABELS)[]).map((m) => (
            <div key={m} className="sp-mode">
              <span className="sp-mode__label">{COACH_MODE_LABELS[m]}</span>
              <p>{COACH_NOTES[m]}</p>
            </div>
          ))}
        </div>
        <div className="sp-extras" data-r>
          <div>
            <span className="sp-kick">Daily drills</span>
            <p>One named case a day, drawn from the student&apos;s own directory. Graded on the server, so the answer never ships to the browser.</p>
          </div>
          <div>
            <span className="sp-kick">Bring your own assistant</span>
            <p>Students can connect their own AI client with a personal key. It can see their progress and practice with them. It can&apos;t see a flag.</p>
          </div>
        </div>
      </section>

      {/* ═══════════ THE MINDSET ═══════════ */}
      <section className="sp-section">
        <div className="sp-head sp-head--left" data-r>
          <span className="sp-tag">The mindset</span>
          <h2>The instinct is already yours</h2>
          <p>A SOC analyst does what a detective does. Walk into a scene, gather evidence, decide what happened.</p>
        </div>
        <div className="sp-xlate" data-r>
          {translations.map((t) => (
            <div key={t.detective} className="sp-xlate__row">
              <t.icon size={17} className="sp-xlate__icon" />
              <span className="sp-xlate__a">{t.detective}</span>
              <ArrowRight size={14} className="sp-xlate__arrow" />
              <span className="sp-xlate__b">{t.analyst}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CAREER LADDER ═══════════ */}
      <section className="sp-section">
        <div className="sp-head sp-head--left" data-r>
          <span className="sp-tag">Where this leads</span>
          <h2>A career ladder employers recognize</h2>
          <p>101 gets a student to the first rung with proof. The rest is the job.</p>
        </div>
        <div className="sp-rungs" data-r>
          {careerLadder.map((r, i) => (
            <div key={r.level} className={`sp-rung${i === 1 ? " sp-rung--here" : ""}`}>
              <div className="sp-rung__fill" style={{ "--fill": `${((i + 1) / careerLadder.length) * 100}%` } as React.CSSProperties} />
              <div className="sp-rung__icon">
                <r.icon size={18} />
              </div>
              <h3>{r.level}</h3>
              <p>{r.body}</p>
              {i === 1 && <em className="sp-square sp-rung__tag">101 ends here</em>}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FOR PROGRAMS ═══════════ */}
      <section className="sp-section">
        <div className="sp-head sp-head--left" data-r>
          <span className="sp-tag">For programs</span>
          <h2>Fits the way your program already runs</h2>
        </div>
        <div className="sp-formats" data-r>
          {formats.map((f, i) => (
            <article key={f.title} className="sp-format">
              <span className="sp-format__n">{pad(i + 1)}</span>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </article>
          ))}
        </div>
        <div className="sp-cta" data-r>
          <p>Running a bootcamp, a college program or an academy cohort?</p>
          <a href={BOOKING_URL} target="_blank" rel="noreferrer" className="sp-btn sp-btn--prim sp-btn--lg">
            Talk about your cohort <ArrowRight size={16} />
          </a>
        </div>
      </section>

      <style>{`
/* ── Shared bits ── */
.sp-kick { font-size: .66rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--muted-dim) }
.sp-kick--warn { color: #b7700a }
.sp-square { display: inline-flex; align-items: center; margin-left: 10px; padding: 3px 9px; border-radius: 999px; background: linear-gradient(180deg, #fff, #f3f1ff); border: 1px solid rgba(106,92,255,.22); font-size: .6rem; font-style: normal; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep); vertical-align: middle; white-space: nowrap }
.sp-square--mute { background: var(--surface-alt); border-color: var(--border); color: var(--muted-dim) }
.sp-bg-good { background: linear-gradient(90deg, #22c55e, #16a34a) } .sp-bg-warn { background: linear-gradient(90deg, #f5b544, #d98a0b) } .sp-bg-bad { background: linear-gradient(90deg, #f07174, #e5484d) }
.sp-text-good { color: #16a34a } .sp-text-warn { color: #c47a09 } .sp-text-bad { color: var(--red) }
.sp-surface { background: linear-gradient(180deg, #fff, #fcfcff); border: 1px solid var(--border); border-radius: 20px; box-shadow: var(--highlight), var(--shadow-md) }

/* ── Hero: copy left, the portal window right ── */
.sp-hero.sp-hero--course { text-align: left; max-width: none; display: grid; grid-template-columns: 1fr minmax(0, 520px); gap: 64px; align-items: center; padding-top: 104px }
.sp-hero--course .sp-hero__h1 { font-size: clamp(2.4rem, 4.6vw, 3.8rem) }
.sp-hero--course .sp-hero__sub { margin: 24px 0 0 }
.sp-hero--course .sp-hero__actions { margin: 34px 0 0; justify-content: flex-start }
.sp-facts { display: grid; grid-template-columns: repeat(3, 1fr); margin: 40px 0 0; max-width: 460px; padding: 6px; border-radius: 18px; background: rgba(255,255,255,.7); border: 1px solid var(--border); box-shadow: var(--highlight), var(--shadow-sm); opacity: 0; animation: sp-hero-in .85s var(--ease) .45s both }
.sp-facts div { padding: 12px 14px; border-radius: 13px }
.sp-facts div:first-child { background: #fff; box-shadow: var(--shadow-sm) }
.sp-facts dt { font-size: .62rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--muted-dim) }
.sp-facts dd { margin: 4px 0 0; font-size: 1.75rem; font-weight: 750; letter-spacing: -.04em; background: var(--grad-accent); -webkit-background-clip: text; background-clip: text; color: transparent }
@media (prefers-reduced-motion: reduce) { .sp-facts { animation: none; opacity: 1 } }

.sp-pv { position: relative; margin: 0; border-radius: 22px; border: 1px solid transparent; background: linear-gradient(#fff, #fff) padding-box, var(--grad-border) border-box; box-shadow: var(--highlight), var(--shadow-lg); overflow: hidden }
.sp-pv::before { content: ""; position: absolute; inset: -40% -20% auto; height: 70%; background: radial-gradient(closest-side, rgba(106,92,255,.12), transparent); pointer-events: none }
.sp-pv__bar { position: relative; display: flex; align-items: center; gap: 10px; height: 50px; padding: 0 16px; border-bottom: 1px solid var(--border); background: rgba(250,250,255,.8) }
.sp-pv__mark { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 8px; background: var(--grad-accent); color: #fff; box-shadow: 0 4px 10px -4px rgba(85,70,224,.7) }
.sp-pv__name { font-size: .8rem; font-weight: 600; color: var(--ink) }
.sp-pv__name em { margin-left: 6px; font-style: normal; font-size: .66rem; color: var(--muted-dim) }
.sp-pv__av { margin-left: auto; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: var(--grad-accent); color: #fff; font-size: .58rem; font-weight: 700; letter-spacing: .04em }
.sp-pv__body { position: relative; padding: 22px }
.sp-pv__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px }
.sp-pv__h { display: block; font-size: 1.5rem; font-weight: 750; letter-spacing: -.04em; color: var(--ink); line-height: 1.1 }
.sp-pv__sub { display: block; margin-top: 6px; font-size: .8rem; color: var(--ink-soft) }
.sp-pv__score { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px; padding: 10px 14px; border-radius: 14px; background: linear-gradient(180deg, #fff, #f6f5ff); border: 1px solid rgba(106,92,255,.18) }
.sp-pv__score strong { font-size: 1.6rem; font-weight: 750; letter-spacing: -.04em; background: var(--grad-accent); -webkit-background-clip: text; background-clip: text; color: transparent; line-height: 1 }
.sp-pv__score small { font-size: .78rem; font-weight: 600; -webkit-text-fill-color: var(--muted-dim) }
.sp-pv__next { margin: 18px 0 8px; padding: 14px 16px; border-radius: 14px; background: var(--surface-alt); display: flex; flex-direction: column; gap: 5px }
.sp-pv__next strong { display: inline-flex; align-items: center; gap: 6px; font-size: .92rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink) }
.sp-pv__row { display: grid; grid-template-columns: 30px 1fr auto; gap: 10px; align-items: start; padding: 14px 4px; border-top: 1px solid var(--border) }
.sp-pv__row:first-of-type { border-top: 0 }
.sp-pv__row--off { opacity: .55 }
.sp-pv__num { font-size: .68rem; font-weight: 700; color: var(--accent-deep); padding-top: 3px }
.sp-pv__rowtitle { display: block; font-size: .92rem; font-weight: 650; letter-spacing: -.02em; color: var(--ink) }
.sp-pv__segs { display: flex; gap: 4px; margin-top: 10px }
.sp-pv__segs i { flex: 1; height: 5px; border-radius: 999px; background: rgba(16,25,46,.07) }
.sp-pv__segs i.on { background: var(--grad-accent) }
.sp-pv__segs i.here { background: transparent; box-shadow: inset 0 0 0 1.5px var(--accent) }
.sp-pv__count { font-size: .7rem; font-weight: 700; color: var(--ink-soft); padding-top: 3px }
.sp-pv__cap { position: relative; padding: 11px 16px; border-top: 1px solid var(--border); font-size: .66rem; font-weight: 650; letter-spacing: .08em; text-transform: uppercase; color: var(--muted-dim); background: rgba(250,250,255,.8) }

/* ── Learn / Work / Prove ── */
.sp-loop { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px }
.sp-loop li { position: relative; padding: 30px 28px 32px; background: linear-gradient(180deg, #fff, #fcfcff); border: 1px solid var(--border); border-radius: 20px; box-shadow: var(--highlight), var(--shadow-md); overflow: hidden }
.sp-loop__n { position: absolute; top: 10px; right: 18px; font-size: 4.2rem; font-weight: 800; letter-spacing: -.06em; line-height: 1; background: linear-gradient(180deg, rgba(106,92,255,.18), rgba(106,92,255,0)); -webkit-background-clip: text; background-clip: text; color: transparent }
.sp-loop h3 { margin: 0; font-size: 1.6rem; font-weight: 750; letter-spacing: -.04em; color: var(--ink) }
.sp-loop p { position: relative; margin: 12px 0 0; color: var(--ink-soft); font-size: .95rem; line-height: 1.65 }

/* ── Syllabus: each phase a card ── */
.sp-phases { display: flex; flex-direction: column; gap: 16px }
.sp-phase { display: grid; grid-template-columns: 52px 1fr auto; gap: 16px; padding: 26px 28px; background: linear-gradient(180deg, #fff, #fcfcff); border: 1px solid var(--border); border-radius: 20px; box-shadow: var(--highlight), var(--shadow-md) }
.sp-phase__num { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: 12px; background: var(--grad-accent); color: #fff; font-size: .8rem; font-weight: 700; box-shadow: 0 8px 18px -8px rgba(85,70,224,.7) }
.sp-phase h3 { margin: 6px 0 0; font-size: 1.35rem; font-weight: 720; letter-spacing: -.03em; color: var(--ink) }
.sp-phase--off { background: var(--surface-alt); box-shadow: none }
.sp-phase--off h3 { color: var(--muted) }
.sp-phase--off .sp-phase__num { background: #e7e9f2; color: var(--muted); box-shadow: none }
.sp-phase__empty { margin: 8px 0 0; color: var(--muted); font-size: .95rem }
.sp-phase__weeks { list-style: none; margin: 18px 0 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px }
.sp-phase__weeks li { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 0; padding: 14px 16px; border-radius: 14px; background: var(--surface-alt); border: 1px solid transparent; transition: border-color .3s var(--ease), background .3s var(--ease) }
.sp-phase__weeks li:not(.is-soon):hover { background: #fff; border-color: rgba(106,92,255,.25) }
.sp-phase__wk { flex: 1 1 auto; font-size: .92rem; font-weight: 650; color: var(--ink) }
.sp-phase__sum { flex: 1 0 100%; order: 3; margin-top: 4px; font-size: .84rem; line-height: 1.55; color: var(--muted) }
.sp-phase__weeks li.is-soon .sp-phase__wk, .sp-phase__weeks li.is-soon .sp-phase__sum { color: var(--muted-dim) }
.sp-phase__count { align-self: start; margin-top: 8px; padding: 5px 10px; border-radius: 999px; background: var(--accent-soft); font-size: .7rem; font-weight: 700; color: var(--accent-deep); white-space: nowrap }
.sp-phase--off .sp-phase__count { background: transparent; color: var(--muted-dim) }

/* ── Missions ── */
.sp-sets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; align-items: start }
.sp-set { padding: 26px 24px 14px; background: linear-gradient(180deg, #fff, #fcfcff); border: 1px solid var(--border); border-radius: 20px; box-shadow: var(--highlight), var(--shadow-md) }
.sp-set__head { display: flex; justify-content: space-between; align-items: center; gap: 12px }
.sp-set__head h3 { margin: 0; font-size: 1.2rem; font-weight: 720; letter-spacing: -.03em; color: var(--ink) }
.sp-set__count { padding: 4px 9px; border-radius: 999px; background: var(--accent-soft); font-size: .66rem; font-weight: 700; color: var(--accent-deep); white-space: nowrap }
.sp-set__brief { margin: 10px 0 16px; color: var(--muted); font-size: .88rem; line-height: 1.55; min-height: 2.8em }
.sp-set__list { list-style: none; margin: 0 -8px; padding: 0 }
.sp-set__list li { display: flex; gap: 12px; align-items: baseline; padding: 9px 8px; border-radius: 10px; font-size: .86rem; color: var(--ink); transition: background .2s }
.sp-set__list li:hover { background: var(--surface-alt) }
.sp-set__n { font-size: .66rem; font-weight: 700; color: var(--accent); flex-shrink: 0; font-variant-numeric: tabular-nums }

/* ── Readiness ── */
.sp-readiness { display: grid; grid-template-columns: minmax(0, 380px) 1fr; gap: 56px; align-items: center }
.sp-head.sp-readiness__copy { margin: 0 }
.sp-levels { list-style: none; margin: 24px 0 0; padding: 6px; display: flex; flex-direction: column; gap: 4px; border-radius: 16px; background: var(--surface-alt) }
.sp-levels li { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 11px; font-size: .9rem; font-weight: 650; color: var(--ink) }
.sp-levels li:last-child { background: #fff; box-shadow: var(--shadow-sm) }
.sp-levels span { margin-left: auto; font-size: .72rem; font-weight: 700; color: var(--muted-dim) }
.sp-dot { width: 9px; height: 9px; border-radius: 50% }
.sp-dot--bad { background: var(--red) } .sp-dot--warn { background: #e0a020 } .sp-dot--good { background: #16a34a }
.sp-report { padding: 8px 26px 12px; background: linear-gradient(180deg, #fff, #fcfcff); border: 1px solid transparent; background-clip: padding-box; border-radius: 22px; box-shadow: var(--highlight), var(--shadow-lg); position: relative }
.sp-report::before { content: ""; position: absolute; inset: -1px; border-radius: 23px; padding: 1px; background: var(--grad-border); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none }
.sp-report__top { display: flex; justify-content: space-between; padding: 14px 0 }
.sp-report__row { display: grid; grid-template-columns: minmax(0, 1.1fr) 1.4fr 40px; gap: 20px; align-items: center; padding: 20px 0; border-top: 1px solid var(--border) }
.sp-report__name strong { display: block; font-size: .95rem; font-weight: 650; color: var(--ink) }
.sp-report__name span { display: block; margin-top: 4px; font-size: .78rem; line-height: 1.5; color: var(--muted) }
.sp-report__scale { position: relative; height: 10px; border-radius: 999px; background: rgba(16,25,46,.06) }
.sp-report__fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px; transform-origin: left; transform: scaleX(0); transition: transform 1.1s var(--ease) .2s }
.sp-readiness.in .sp-report__fill { transform: scaleX(1) }
.sp-report__scale i { position: absolute; top: -5px; bottom: -5px; width: 2px; border-radius: 2px; background: var(--ink); opacity: .7 }
.sp-report__scale i::after { content: attr(data-mark); position: absolute; bottom: calc(100% + 5px); right: 4px; white-space: nowrap; font-size: .58rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-soft) }
/* Almost sits left of its tick, Ready right of its own, so they never meet. */
.sp-report__scale i:last-of-type::after { right: auto; left: 6px }
.sp-report__v { font-size: 1.25rem; font-weight: 750; letter-spacing: -.03em; text-align: right }
@media (prefers-reduced-motion: reduce) { .sp-report__fill { transform: none; transition: none } }

/* ── Coach modes ── */
.sp-modes { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px }
.sp-mode { padding: 24px 22px 26px; background: linear-gradient(180deg, #fff, #fcfcff); border: 1px solid var(--border); border-radius: 18px; box-shadow: var(--highlight), var(--shadow-md); transition: transform .45s var(--ease), box-shadow .45s var(--ease), border-color .45s var(--ease) }
.sp-mode:hover { transform: translateY(-4px); border-color: rgba(106,92,255,.3); box-shadow: var(--highlight), var(--shadow-lg) }
.sp-mode__label { display: inline-flex; padding: 5px 11px; border-radius: 999px; background: var(--grad-accent); color: #fff; font-size: .68rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; box-shadow: 0 6px 14px -6px rgba(85,70,224,.7) }
.sp-mode p { margin: 14px 0 0; color: var(--ink-soft); font-size: .9rem; line-height: 1.6 }
.sp-extras { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px }
.sp-extras > div { padding: 22px 24px; border-radius: 18px; background: linear-gradient(135deg, #f7f5ff, #fff 60%); border: 1px solid rgba(106,92,255,.18); box-shadow: var(--highlight) }
.sp-extras .sp-kick { color: var(--accent-deep) }
.sp-extras p { margin: 8px 0 0; color: var(--ink-soft); font-size: .94rem; line-height: 1.65 }

/* ── Mindset ── */
.sp-xlate { padding: 8px; border-radius: 20px; background: var(--surface-alt); border: 1px solid var(--border) }
.sp-xlate__row { display: grid; grid-template-columns: 40px 1fr 28px 1fr; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 14px }
.sp-xlate__row + .sp-xlate__row { margin-top: 4px }
.sp-xlate__row:hover { background: #fff; box-shadow: var(--shadow-sm) }
.sp-xlate__icon { box-sizing: content-box; padding: 9px; border-radius: 10px; background: #fff; border: 1px solid var(--border); color: var(--muted) }
.sp-xlate__a { font-size: 1rem; color: var(--ink-soft) }
.sp-xlate__arrow { color: var(--accent) }
.sp-xlate__b { font-size: 1.08rem; font-weight: 700; letter-spacing: -.02em; color: var(--accent-deep) }

/* ── Career ladder ── */
.sp-rungs { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px }
.sp-rungs[data-r] { opacity: 1; transform: none; filter: none; transition: none }
.sp-rungs[data-r] > * { opacity: 0; transform: translateY(16px); transition: opacity .6s var(--ease), transform .6s var(--ease) }
.sp-rungs[data-r].in > * { opacity: 1; transform: none }
.sp-rungs[data-r] > *:nth-child(2) { transition-delay: .07s } .sp-rungs[data-r] > *:nth-child(3) { transition-delay: .14s }
.sp-rungs[data-r] > *:nth-child(4) { transition-delay: .21s } .sp-rungs[data-r] > *:nth-child(5) { transition-delay: .28s }
.sp-rung { position: relative; padding: 26px 20px 28px; border-radius: 18px; background: linear-gradient(180deg, #fff, #fcfcff); border: 1px solid var(--border); box-shadow: var(--highlight), var(--shadow-sm); overflow: hidden }
.sp-rung--here { border-color: rgba(106,92,255,.35); background: linear-gradient(180deg, #f6f4ff, #fff); box-shadow: var(--highlight), var(--shadow-lg) }
/* --fill is set inline and repointed at height on narrow screens (see below). */
.sp-rung__fill { position: absolute; top: 0; left: 0; width: var(--fill); height: 3px; background: var(--grad-accent) }
.sp-rung__icon { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px }
.sp-rung h3 { margin: 16px 0 0; font-size: 1rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink); line-height: 1.25 }
.sp-rung p { margin: 8px 0 0; font-size: .82rem; color: var(--muted); line-height: 1.55 }
.sp-rung__tag { margin: 14px 0 0 }

/* ── Formats + CTA ── */
.sp-formats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px }
.sp-format { padding: 24px 22px 26px; border-radius: 18px; background: linear-gradient(180deg, #fff, #fcfcff); border: 1px solid var(--border); box-shadow: var(--highlight), var(--shadow-md) }
.sp-format__n { display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 10px; background: linear-gradient(145deg, #fff, #efedff); border: 1px solid rgba(106,92,255,.2); font-size: .72rem; font-weight: 700; color: var(--accent-deep) }
.sp-format h3 { margin: 16px 0 0; font-size: 1.05rem; font-weight: 700; letter-spacing: -.02em; color: var(--ink) }
.sp-format p { margin: 8px 0 0; color: var(--muted); font-size: .88rem; line-height: 1.6 }
.sp-cta { position: relative; display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-top: 56px; padding: 36px 40px; border-radius: 24px; overflow: hidden; background: radial-gradient(120% 140% at 0% 0%, #6a5cff 0%, #4a3bd4 45%, #1d1a4d 100%); box-shadow: 0 30px 60px -30px rgba(74,59,212,.8) }
.sp-cta::after { content: ""; position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,.14) 1px, transparent 1px); background-size: 18px 18px; mask-image: linear-gradient(90deg, transparent, #000); pointer-events: none }
.sp-cta p { position: relative; margin: 0; font-size: 1.45rem; font-weight: 700; letter-spacing: -.03em; color: #fff }
.sp-cta .sp-btn--prim { position: relative; z-index: 1; background: #fff; color: var(--accent-deep); box-shadow: 0 10px 24px -10px rgba(0,0,0,.45) }
.sp-cta .sp-btn--prim:hover { background: #fff; filter: none }

/* ── Tablet ── */
@media (max-width: 1000px) {
  .sp-hero.sp-hero--course { grid-template-columns: 1fr; gap: 48px }
  .sp-pv { max-width: 560px }
  .sp-readiness { grid-template-columns: 1fr; gap: 32px }
  .sp-modes, .sp-formats { grid-template-columns: 1fr 1fr }
  .sp-sets { grid-template-columns: 1fr }
  .sp-set__brief { min-height: 0 }
  .sp-rungs { grid-template-columns: 1fr; gap: 10px }
  /* Icon in its own column, title + body stacked beside it. */
  .sp-rung { display: grid; grid-template-columns: 40px 1fr; column-gap: 16px; align-items: start; padding: 20px 18px 20px 22px }
  .sp-rung__fill { top: 0; left: 0; width: 3px; height: var(--fill) }
  .sp-rung__icon { grid-row: span 3 }
  .sp-rung h3 { margin: 2px 0 0 }
  .sp-rung p { margin: 4px 0 0; font-size: .88rem }
  .sp-rung__tag { justify-self: start; margin: 10px 0 0 }
}

/* ── Phones ── */
@media (max-width: 680px) {
  .sp-hero.sp-hero--course { padding-top: 56px }
  .sp-facts { max-width: none }
  .sp-facts dd { font-size: 1.5rem }
  .sp-pv__body { padding: 18px 16px }
  .sp-pv__h { font-size: 1.25rem }
  .sp-loop { grid-template-columns: 1fr; gap: 12px }
  .sp-loop li { padding: 24px 22px 26px }
  .sp-loop h3 { font-size: 1.4rem }
  .sp-phase { grid-template-columns: 1fr; gap: 10px; padding: 22px 18px }
  .sp-phase__count { justify-self: start; margin-top: 0 }
  .sp-phase--off .sp-phase__count { display: none }
  .sp-phase h3 { font-size: 1.2rem; margin: 0 }
  .sp-phase__weeks { grid-template-columns: 1fr; gap: 8px }
  .sp-report { padding: 6px 18px 10px }
  .sp-report__row { grid-template-columns: 1fr 40px; gap: 10px 14px }
  .sp-report__scale { grid-column: 1 / -1; grid-row: 2; margin-top: 20px }
  .sp-report__name span { display: none }
  .sp-modes, .sp-formats, .sp-extras { grid-template-columns: 1fr; gap: 12px }
  .sp-xlate__row { grid-template-columns: 40px 1fr; row-gap: 4px }
  .sp-xlate__arrow { display: none }
  .sp-xlate__b { grid-column: 2 }
  .sp-cta { flex-direction: column; align-items: stretch; padding: 28px 22px; margin-top: 40px }
  .sp-cta p { font-size: 1.2rem }
}
      `}</style>
      <style>{`
.tr-split { display: grid; grid-template-columns: 1fr 1fr; gap: 56px; align-items: center }
.tr-split .sp-head { margin-bottom: 0 }
.tr-split .sp-head p + p { margin-top: 14px }
.tr-proof { border-radius: 22px; background: #fff; border: 1px solid var(--border-strong); overflow: hidden; box-shadow: var(--shadow-lg) }
.tr-proof header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: var(--accent-soft); font-family: var(--font-mono); font-size: .68rem; font-weight: 700; letter-spacing: .08em; color: var(--accent-deep) }
.tr-proof header span, .tr-proof header em { display: inline-flex; align-items: center; gap: 8px }
.tr-proof header em { font-style: normal; text-transform: uppercase; letter-spacing: .1em }
.tr-proof header em i { width: 7px; height: 7px; border-radius: 50%; background: #1fa971 }
.tr-proof ul { list-style: none; margin: 0; padding: 8px 20px }
.tr-proof li { display: flex; align-items: center; gap: 12px; padding: 14px 0; font-size: .9rem; color: var(--ink); border-bottom: 1px solid var(--border) }
.tr-proof li:last-child { border-bottom: 0 }
.tr-proof li > span { flex: none; display: grid; place-items: center; width: 24px; height: 24px; border-radius: 50%; background: #e3f6ee; color: #12805a; font-weight: 700; font-size: .78rem }
.tr-proof li[data-ok="false"] > span { background: #fdeaea; color: #c23030 }
.tr-proof footer { padding: 14px 20px 18px; font-size: .78rem; color: var(--muted); background: #fafaff; border-top: 1px solid var(--border) }
.tr-jobs { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; align-items: start }
.tr-jobs article { padding: 22px; border-radius: 20px; background: #fff; border: 1px solid var(--border-strong); box-shadow: var(--shadow-md) }
.tr-jobs header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px }
.tr-jobs header strong { font-size: .98rem; font-weight: 650; letter-spacing: -.012em }
.tr-jobs header span { display: grid; place-items: center; min-width: 28px; height: 28px; padding: 0 8px; border-radius: 999px; background: var(--accent); color: #fff; font-family: var(--font-mono); font-size: .68rem; font-weight: 700 }
.tr-jobs ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 9px }
.tr-jobs li { display: flex; gap: 10px; align-items: flex-start; font-size: .84rem; line-height: 1.4; color: var(--ink-soft) }
.tr-jobs li i { flex: none; width: 10px; height: 10px; margin-top: .3em; border-radius: 50%; border: 2px solid var(--accent) }
.tr-jobs li[data-lab="true"] { color: var(--ink) }
.tr-jobs li[data-lab="true"] i { background: var(--accent) }
.tr-jobs[data-r] { opacity: 1; transform: none; filter: none }
.tr-jobs[data-r] article { opacity: 0; transform: translateY(16px); transition: opacity .6s var(--ease), transform .6s var(--ease) }
.tr-jobs[data-r].in article { opacity: 1; transform: none }
.tr-jobs[data-r].in article:nth-child(2) { transition-delay: .08s }
.tr-jobs[data-r].in article:nth-child(3) { transition-delay: .16s }
.tr-jobs[data-r].in article:nth-child(4) { transition-delay: .24s }
@media (prefers-reduced-motion: reduce) { .tr-jobs[data-r] article { opacity: 1; transform: none; transition: none } }
@media (max-width: 1100px) { .tr-jobs { grid-template-columns: 1fr 1fr } }
@media (max-width: 860px) { .tr-split { grid-template-columns: 1fr; gap: 32px } }
@media (max-width: 680px) { .tr-jobs { grid-template-columns: 1fr } }
      `}</style>
    </SiteChrome>
  );
}

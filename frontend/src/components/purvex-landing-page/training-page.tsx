"use client";

import Link from "next/link";
import {
  ArrowRight,
  Award,
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
   actually exists. Visual language matches the portal too: mono
   kickers, numbered hairline rows, square tags.
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
/* ── Shared bits in the portal's vocabulary ── */
.sp-kick { font-family: var(--font-mono); font-size: .64rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--muted-dim) }
.sp-kick--warn { color: #c4820e }
.sp-square { display: inline-flex; align-items: center; margin-left: 10px; padding: 2px 7px; border: 1px solid var(--accent-deep); font-family: var(--font-mono); font-size: .56rem; font-style: normal; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--accent-deep); vertical-align: middle; white-space: nowrap }
.sp-square--mute { border-color: var(--border-strong); color: var(--muted-dim) }
.sp-bg-good { background: var(--green) } .sp-bg-warn { background: #c4820e } .sp-bg-bad { background: var(--red) }
.sp-text-good { color: var(--green) } .sp-text-warn { color: #c4820e } .sp-text-bad { color: var(--red) }

/* ── Hero: copy left, a live-looking portal window right ── */
.sp-hero.sp-hero--course { text-align: left; max-width: none; display: grid; grid-template-columns: 1fr minmax(0, 520px); gap: 64px; align-items: center; padding-top: 96px }
.sp-hero--course .sp-hero__sub { margin: 24px 0 0 }
.sp-hero--course .sp-hero__actions { margin: 34px 0 0; justify-content: flex-start }
.sp-facts { display: flex; gap: 0; margin: 44px 0 0; border-top: 1px solid var(--border); max-width: 460px; opacity: 0; animation: sp-hero-in .85s var(--ease) .45s both }
.sp-facts div { flex: 1; padding: 14px 0 0 }
.sp-facts div + div { padding-left: 18px; border-left: 1px solid var(--border) }
.sp-facts dt { font-family: var(--font-mono); font-size: .6rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--muted-dim) }
.sp-facts dd { margin: 6px 0 0; font-family: var(--font-display); font-size: 1.9rem; font-weight: 600; letter-spacing: -.04em; color: var(--ink) }
@media (prefers-reduced-motion: reduce) { .sp-facts { animation: none; opacity: 1 } }

.sp-pv { margin: 0; background: var(--surface); border: 1px solid var(--border-strong); box-shadow: 0 40px 80px -40px rgba(16,25,46,.35), 0 2px 0 rgba(16,25,46,.02) }
.sp-pv__bar { display: flex; align-items: center; gap: 10px; height: 46px; padding: 0 14px; border-bottom: 1px solid var(--border) }
.sp-pv__mark { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 5px; background: var(--accent-deep); color: #fff }
.sp-pv__name { font-size: .8rem; font-weight: 500; color: var(--ink) }
.sp-pv__name em { margin-left: 6px; font-family: var(--font-mono); font-style: normal; font-size: .64rem; color: var(--muted-dim) }
.sp-pv__av { margin-left: auto; display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; background: var(--accent-deep); color: #fff; font-size: .56rem; font-weight: 700; letter-spacing: .06em }
.sp-pv__body { position: relative; padding: 22px 22px 8px; background-image: radial-gradient(rgba(16,25,46,.09) 1.2px, transparent 1.2px); background-size: 18px 18px; background-position: 0 0; background-repeat: repeat; background-clip: padding-box }
.sp-pv__body::before { content: ""; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(255,255,255,.55), #fff 45%); pointer-events: none }
.sp-pv__body > * { position: relative }
.sp-pv__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--border) }
.sp-pv__h { display: block; font-family: var(--font-display); font-size: 1.6rem; font-weight: 600; letter-spacing: -.04em; color: var(--ink); line-height: 1.1 }
.sp-pv__sub { display: block; margin-top: 6px; font-size: .78rem; color: var(--ink-soft) }
.sp-pv__score { text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 4px }
.sp-pv__score strong { font-family: var(--font-display); font-size: 1.7rem; font-weight: 600; letter-spacing: -.04em; color: var(--accent-deep); line-height: 1 }
.sp-pv__score small { font-size: .8rem; font-weight: 500; color: var(--muted-dim) }
.sp-pv__next { padding: 14px 0 18px; display: flex; flex-direction: column; gap: 6px }
.sp-pv__next strong { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-display); font-size: .95rem; font-weight: 600; letter-spacing: -.02em; color: var(--ink) }
.sp-pv__row { display: grid; grid-template-columns: 28px 1fr auto; gap: 10px; align-items: start; padding: 14px 0; border-top: 1px solid var(--border) }
.sp-pv__row--off { opacity: .55 }
.sp-pv__num { font-family: var(--font-mono); font-size: .66rem; font-weight: 700; color: var(--accent-deep); padding-top: 3px }
.sp-pv__rowtitle { display: block; font-family: var(--font-display); font-size: .92rem; font-weight: 600; letter-spacing: -.02em; color: var(--ink) }
.sp-pv__segs { display: flex; gap: 3px; margin-top: 10px }
.sp-pv__segs i { flex: 1; height: 4px; background: rgba(15,23,42,.08) }
.sp-pv__segs i.on { background: var(--accent-deep) }
.sp-pv__segs i.here { background: transparent; box-shadow: inset 0 0 0 1.5px var(--accent-deep) }
.sp-pv__count { font-family: var(--font-mono); font-size: .66rem; font-weight: 700; color: var(--ink-soft); padding-top: 3px }
.sp-pv__cap { padding: 10px 14px; border-top: 1px solid var(--border); font-family: var(--font-mono); font-size: .58rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: var(--muted-dim); background: var(--surface-alt) }

/* ── Learn / Work / Prove ── */
.sp-loop { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid var(--ink); border-bottom: 1px solid var(--border) }
.sp-loop li { padding: 32px 32px 36px 0 }
.sp-loop li + li { padding-left: 32px; border-left: 1px solid var(--border) }
.sp-loop__n { font-family: var(--font-mono); font-size: .7rem; font-weight: 700; color: var(--accent-deep) }
.sp-loop h3 { margin: 14px 0 0; font-family: var(--font-display); font-size: 1.8rem; font-weight: 600; letter-spacing: -.04em; color: var(--ink) }
.sp-loop p { margin: 12px 0 0; color: var(--ink-soft); font-size: .95rem; line-height: 1.65 }

/* ── Syllabus: portal-style phase rows ── */
.sp-phases { border-top: 1px solid var(--ink) }
.sp-phase { display: grid; grid-template-columns: 56px 1fr auto; gap: 16px; padding: 30px 0; border-bottom: 1px solid var(--border) }
.sp-phase__num { font-family: var(--font-mono); font-size: .76rem; font-weight: 700; color: var(--accent-deep); padding-top: 6px }
.sp-phase h3 { margin: 0; font-family: var(--font-display); font-size: 1.45rem; font-weight: 600; letter-spacing: -.03em; color: var(--ink) }
.sp-phase--off h3, .sp-phase--off .sp-phase__num { color: var(--muted-dim) }
.sp-phase__empty { margin: 8px 0 0; color: var(--muted); font-size: .95rem }
.sp-phase__weeks { list-style: none; margin: 16px 0 0; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 0 32px }
.sp-phase__weeks li { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 0; padding: 12px 0; border-top: 1px solid var(--border) }
.sp-phase__wk { flex: 1 1 auto; font-size: .95rem; font-weight: 600; color: var(--ink) }
.sp-phase__sum { flex: 1 0 100%; order: 3; margin-top: 4px; font-size: .85rem; line-height: 1.55; color: var(--muted) }
.sp-phase__weeks li.is-soon .sp-phase__wk, .sp-phase__weeks li.is-soon .sp-phase__sum { color: var(--muted-dim) }
.sp-phase__count { font-family: var(--font-mono); font-size: .7rem; font-weight: 700; color: var(--ink-soft); padding-top: 8px; white-space: nowrap }

/* ── Missions: three mission logs side by side ── */
.sp-sets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border-top: 1px solid var(--ink) }
.sp-set { padding: 28px 28px 8px 0 }
.sp-set + .sp-set { padding-left: 28px; border-left: 1px solid var(--border) }
.sp-set__head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px }
.sp-set__head h3 { margin: 0; font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; letter-spacing: -.03em; color: var(--ink) }
.sp-set__count { font-family: var(--font-mono); font-size: .64rem; font-weight: 700; letter-spacing: .06em; color: var(--muted-dim); white-space: nowrap }
.sp-set__brief { margin: 8px 0 16px; color: var(--muted); font-size: .88rem; line-height: 1.55; min-height: 2.8em }
.sp-set__list { list-style: none; margin: 0; padding: 0 }
.sp-set__list li { display: flex; gap: 12px; align-items: baseline; padding: 9px 0; border-top: 1px solid var(--border); font-size: .86rem; color: var(--ink) }
.sp-set__n { font-family: var(--font-mono); font-size: .62rem; color: var(--muted-dim); flex-shrink: 0 }

/* ── Readiness ── */
.sp-readiness { display: grid; grid-template-columns: minmax(0, 380px) 1fr; gap: 64px; align-items: start }
.sp-head.sp-readiness__copy { margin: 0 }
.sp-levels { list-style: none; margin: 24px 0 0; padding: 0; border-top: 1px solid var(--border) }
.sp-levels li { display: flex; align-items: center; gap: 10px; padding: 11px 0; border-bottom: 1px solid var(--border); font-size: .9rem; font-weight: 600; color: var(--ink) }
.sp-levels span { margin-left: auto; font-family: var(--font-mono); font-size: .7rem; font-weight: 700; color: var(--muted-dim) }
.sp-dot { width: 9px; height: 9px }
.sp-dot--bad { background: var(--red) } .sp-dot--warn { background: #c4820e } .sp-dot--good { background: var(--green) }
.sp-report { border-top: 1px solid var(--ink) }
.sp-report__top { display: flex; justify-content: space-between; padding: 12px 0 }
.sp-report__row { display: grid; grid-template-columns: minmax(0, 1.1fr) 1.4fr 36px; gap: 20px; align-items: center; padding: 20px 0; border-top: 1px solid var(--border) }
.sp-report__name strong { display: block; font-size: .95rem; font-weight: 600; color: var(--ink) }
.sp-report__name span { display: block; margin-top: 4px; font-size: .78rem; line-height: 1.5; color: var(--muted) }
.sp-report__scale { position: relative; height: 8px; background: rgba(15,23,42,.06); background-image: repeating-linear-gradient(90deg, transparent 0 calc(10% - 1px), rgba(15,23,42,.08) calc(10% - 1px) 10%) }
.sp-report__fill { position: absolute; left: 0; top: 0; bottom: 0; transform-origin: left; transform: scaleX(0); transition: transform 1.1s var(--ease) .2s }
.sp-readiness.in .sp-report__fill { transform: scaleX(1) }
.sp-report__scale i { position: absolute; top: -6px; bottom: -6px; width: 1px; background: var(--ink) }
.sp-report__scale i::after { content: attr(data-mark); position: absolute; bottom: calc(100% + 4px); right: 4px; white-space: nowrap; font-family: var(--font-mono); font-size: .56rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--ink-soft) }
/* Almost sits left of its tick, Ready right of its own, so they never meet. */
.sp-report__scale i:last-of-type::after { right: auto; left: 5px }
.sp-report__v { font-family: var(--font-display); font-size: 1.2rem; font-weight: 600; letter-spacing: -.03em; text-align: right }
@media (prefers-reduced-motion: reduce) { .sp-report__fill { transform: none; transition: none } }

/* ── Coach modes ── */
.sp-modes { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--ink); border-bottom: 1px solid var(--border) }
.sp-mode { padding: 26px 24px 30px 0 }
.sp-mode + .sp-mode { padding-left: 24px; border-left: 1px solid var(--border) }
.sp-mode__label { font-family: var(--font-mono); font-size: .7rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--accent-deep) }
.sp-mode p { margin: 12px 0 0; color: var(--ink-soft); font-size: .9rem; line-height: 1.6 }
.sp-extras { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 36px }
.sp-extras > div { padding: 20px 0 0; border-top: 2px solid var(--accent-deep) }
.sp-extras p { margin: 10px 0 0; color: var(--ink-soft); font-size: .95rem; line-height: 1.65 }

/* ── Mindset ── */
.sp-xlate { border-top: 1px solid var(--ink) }
.sp-xlate__row { display: grid; grid-template-columns: 28px 1fr 28px 1fr; align-items: center; gap: 12px; padding: 18px 0; border-bottom: 1px solid var(--border) }
.sp-xlate__icon { color: var(--muted-dim) }
.sp-xlate__a { font-size: 1rem; color: var(--ink-soft) }
.sp-xlate__arrow { color: var(--accent-deep) }
.sp-xlate__b { font-family: var(--font-display); font-size: 1.15rem; font-weight: 600; letter-spacing: -.02em; color: var(--ink) }

/* ── Career ladder ── */
.sp-rungs { display: grid; grid-template-columns: repeat(5, 1fr); border-top: 1px solid var(--ink); border-bottom: 1px solid var(--border) }
.sp-rungs[data-r] { opacity: 1; transform: none; transition: none }
.sp-rungs[data-r] > * { opacity: 0; transform: translateY(16px); transition: opacity .6s var(--ease), transform .6s var(--ease) }
.sp-rungs[data-r].in > * { opacity: 1; transform: none }
.sp-rungs[data-r] > *:nth-child(2) { transition-delay: .07s } .sp-rungs[data-r] > *:nth-child(3) { transition-delay: .14s }
.sp-rungs[data-r] > *:nth-child(4) { transition-delay: .21s } .sp-rungs[data-r] > *:nth-child(5) { transition-delay: .28s }
.sp-rung { position: relative; padding: 28px 20px 30px }
.sp-rung:not(:first-child) { border-left: 1px solid var(--border) }
.sp-rung--here { background: var(--accent-soft) }
/* --fill is set inline and repointed at height on phones (see below). */
.sp-rung__fill { position: absolute; top: -1px; left: 0; width: var(--fill); height: 2px; background: var(--accent-deep) }
.sp-rung__icon { display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: var(--radius); border: 1px solid var(--border-strong); color: var(--accent-deep) }
.sp-rung h3 { margin: 16px 0 0; font-family: var(--font-display); font-size: 1.02rem; font-weight: 600; letter-spacing: -.02em; color: var(--ink); line-height: 1.25 }
.sp-rung p { margin: 8px 0 0; font-size: .82rem; color: var(--muted); line-height: 1.55 }
.sp-rung__tag { margin: 14px 0 0 }

/* ── Formats + CTA ── */
.sp-formats { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--ink); border-bottom: 1px solid var(--border) }
.sp-format { padding: 26px 24px 30px 0 }
.sp-format + .sp-format { padding-left: 24px; border-left: 1px solid var(--border) }
.sp-format__n { font-family: var(--font-mono); font-size: .7rem; font-weight: 700; color: var(--accent-deep) }
.sp-format h3 { margin: 12px 0 0; font-family: var(--font-display); font-size: 1.1rem; font-weight: 600; letter-spacing: -.02em; color: var(--ink) }
.sp-format p { margin: 8px 0 0; color: var(--muted); font-size: .88rem; line-height: 1.6 }
.sp-cta { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-top: 48px; padding: 28px 32px; border: 1px solid var(--border); border-top: 2px solid var(--accent-deep) }
.sp-cta p { margin: 0; font-family: var(--font-display); font-size: 1.35rem; font-weight: 600; letter-spacing: -.03em; color: var(--ink) }

/* ── Tablet ── */
@media (max-width: 1000px) {
  .sp-hero.sp-hero--course { grid-template-columns: 1fr; gap: 48px }
  .sp-pv { max-width: 560px }
  .sp-readiness { grid-template-columns: 1fr; gap: 36px }
  .sp-modes, .sp-formats { grid-template-columns: 1fr 1fr }
  .sp-mode:nth-child(3), .sp-format:nth-child(3) { padding-left: 0; border-left: 0 }
  .sp-mode:nth-child(n+3), .sp-format:nth-child(n+3) { border-top: 1px solid var(--border) }
  .sp-sets { grid-template-columns: 1fr }
  .sp-set, .sp-set + .sp-set { padding: 28px 0 12px; border-left: 0 }
  .sp-set + .sp-set { border-top: 1px solid var(--border) }
  .sp-set__brief { min-height: 0 }
  .sp-rungs { grid-template-columns: 1fr }
  .sp-rung:not(:first-child) { border-left: none; border-top: 1px solid var(--border) }
  /* Icon in its own column, title + body stacked beside it. */
  .sp-rung { display: grid; grid-template-columns: 38px 1fr; column-gap: 16px; align-items: start; padding: 20px 18px }
  .sp-rung__fill { top: 0; left: 0; width: 2px; height: var(--fill) }
  .sp-rung__icon { grid-row: span 3 }
  .sp-rung h3 { margin: 2px 0 0 }
  .sp-rung p { margin: 4px 0 0; font-size: .88rem }
  .sp-rung__tag { justify-self: start; margin: 10px 0 0 }
}

/* ── Phones ── */
@media (max-width: 680px) {
  .sp-hero.sp-hero--course { padding-top: 56px }
  .sp-facts { max-width: none }
  .sp-facts dd { font-size: 1.6rem }
  .sp-pv__body { padding: 18px 16px 6px }
  .sp-pv__h { font-size: 1.3rem }
  .sp-loop { grid-template-columns: 1fr }
  .sp-loop li, .sp-loop li + li { padding: 24px 0 26px; border-left: 0 }
  .sp-loop li + li { border-top: 1px solid var(--border) }
  .sp-loop h3 { font-size: 1.5rem }
  .sp-phase { grid-template-columns: 34px 1fr; padding: 24px 0 }
  .sp-phase__count { grid-column: 2; padding-top: 0 }
  .sp-phase--off .sp-phase__count { display: none }
  .sp-phase h3 { font-size: 1.2rem }
  .sp-phase__weeks { grid-template-columns: 1fr }
  .sp-report__row { grid-template-columns: 1fr 36px; gap: 10px 14px }
  .sp-report__scale { grid-column: 1 / -1; grid-row: 2; margin-top: 18px }
  .sp-report__name span { display: none }
  .sp-modes, .sp-formats, .sp-extras { grid-template-columns: 1fr; gap: 0 }
  .sp-mode, .sp-mode + .sp-mode, .sp-format, .sp-format + .sp-format { padding: 22px 0 24px; border-left: 0 }
  .sp-mode + .sp-mode, .sp-format + .sp-format { border-top: 1px solid var(--border) }
  .sp-extras > div + div { margin-top: 28px }
  .sp-xlate__row { grid-template-columns: 22px 1fr; row-gap: 4px }
  .sp-xlate__arrow { display: none }
  .sp-xlate__b { grid-column: 2 }
  .sp-cta { flex-direction: column; align-items: stretch; padding: 24px 20px }
  .sp-cta p { font-size: 1.15rem }
}
      `}</style>
    </SiteChrome>
  );
}

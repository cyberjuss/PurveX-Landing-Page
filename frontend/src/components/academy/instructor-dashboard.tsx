"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, AlertTriangle, ArrowLeft, Check, Copy, ExternalLink, Gauge, Users } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import { scoreTone } from "@/lib/academy-score";
import "./instructor.css";

// The instructor's view of a class: who is stuck, who has gone quiet, where
// the class is weakest, and every student's progress in one table.

type Student = {
  userId: string;
  name: string | null;
  email: string | null;
  joinedAt: string;
  readiness: { overall: number | null; level: string; finished: number; total: number };
  skills: { key: string; label: string; score: number | null }[];
  stuck: { title: string; wrong: number; skipped: boolean }[];
  lastActive: string | null;
  place: { page: string; tab: string; at: string } | null;
  labSynced: string | null;
  drillsThisWeek: number;
  labsPassed: number;
  portfolio: string | null;
};
type Report = {
  class: { id: string; code: string; name: string; instructorEmail: string; createdAt: string };
  students: Student[];
  summary: { students: number; activeThisWeek: number; stuck: number; avgReadiness: number | null; weakest: { label: string; avg: number }[] };
};
type Data = { admin: boolean; classes: Report[] };

const DAY = 864e5;
const QUIET_DAYS = 7;

function ago(iso: string | null): string {
  if (!iso) return "Never";
  const ms = Date.now() - Date.parse(iso);
  if (Number.isNaN(ms)) return "Never";
  const mins = Math.round(ms / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

const quietDays = (s: Student) => (s.lastActive ? Math.floor((Date.now() - Date.parse(s.lastActive)) / DAY) : null);
const who = (s: Student) => s.name || s.email?.split("@")[0] || "Student";

/** Why a student needs a look, most urgent first. */
function flags(s: Student): string[] {
  const out: string[] = [];
  const quiet = quietDays(s);
  if (quiet === null) out.push("Has not started");
  else if (quiet >= QUIET_DAYS) out.push(`No activity in ${quiet} days`);
  for (const m of s.stuck.slice(0, 2)) out.push(`Stuck on ${m.title}${m.wrong ? ` · ${m.wrong} wrong` : ""}${m.skipped ? " · skipped" : ""}`);
  if (s.stuck.length > 2) out.push(`${s.stuck.length - 2} more open missions`);
  return out;
}

function CopyLink({ text, label }: { text: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="iv-copy"
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setDone(true);
          window.setTimeout(() => setDone(false), 1500);
        });
      }}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {done ? "Copied" : label}
    </button>
  );
}

/** The shareable join link with one-click copy -- what an instructor hands a class. */
function InviteBlock({ code }: { code: string }) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const joinLink = `${origin}/academy/join?code=${encodeURIComponent(code)}`;
  return (
    <div className="iv-invite">
      <div className="iv-invite__row">
        <code className="iv-invite__link">{joinLink}</code>
        <CopyLink text={joinLink} label="Copy join link" />
      </div>
    </div>
  );
}

function ClassView({ r }: { r: Report }) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const joinLink = `${origin}/academy/join?code=${encodeURIComponent(r.class.code)}`;
  const attention = r.students.map((s) => ({ s, why: flags(s) })).filter((x) => x.why.length);
  const skills = ["accounts", "directory", "troubleshooting", "security"].map((key) => {
    const scores = r.students.map((s) => s.skills.find((k) => k.key === key)).filter((k): k is Student["skills"][number] => Boolean(k));
    const done = scores.filter((k) => k.score !== null).map((k) => k.score!);
    return { key, label: scores[0]?.label ?? key, avg: done.length ? Math.round(done.reduce((a, b) => a + b, 0) / done.length) : null, n: done.length };
  });

  return (
    <div className="iv-class">
      <header className="rd-mast">
        <p className="rd-kicker">Instructor view</p>
        <h1 className="iv-title">{r.class.name}</h1>
        <div className="iv-invitecard">
          <div className="iv-invitecard__main">
            <span className="iv-invitecard__label">Invite your class</span>
            <p className="iv-invitecard__lead">Students open this link, sign in, and land in {r.class.name}. No code to type.</p>
            <div className="iv-invitecard__link">
              <code>{joinLink}</code>
              <CopyLink text={joinLink} label="Copy link" />
            </div>
            <p className="iv-invitecard__code">
              Class code <strong>{r.class.code}</strong>
              <CopyLink text={r.class.code} label="Copy" />
              <span>Fallback for the passcode screen.</span>
            </p>
          </div>
        </div>

        <dl className="iv-stats">
          <div className="iv-stat">
            <span className="iv-stat__ico"><Users aria-hidden="true" /></span>
            <div>
              <dt>Students</dt>
              <dd>{r.summary.students}</dd>
            </div>
          </div>
          <div className="iv-stat">
            <span className="iv-stat__ico"><Activity aria-hidden="true" /></span>
            <div>
              <dt>Active this week</dt>
              <dd>{r.summary.activeThisWeek}</dd>
            </div>
          </div>
          <div className="iv-stat">
            <span className={`iv-stat__ico${r.summary.stuck ? " iv-stat__ico--warn" : ""}`}><AlertTriangle aria-hidden="true" /></span>
            <div>
              <dt>Stuck on a mission</dt>
              <dd className={r.summary.stuck ? "rd-text-warn" : ""}>{r.summary.stuck}</dd>
            </div>
          </div>
          <div className="iv-stat">
            <span className="iv-stat__ico"><Gauge aria-hidden="true" /></span>
            <div>
              <dt>Average readiness</dt>
              <dd className={`rd-text-${scoreTone(r.summary.avgReadiness)}`}>{r.summary.avgReadiness ?? "––"}</dd>
            </div>
          </div>
        </dl>
      </header>

      {r.students.length === 0 ? (
        <section className="rd-sec">
          <p className="iv-empty">No students yet. Share the class code or the join link to get started.</p>
        </section>
      ) : (
        <>
          <section className="rd-sec">
            <div className="rd-sec__head">
              <span className="rd-sec__n">01</span>
              <h2>Needs a look</h2>
              <p>Students who are stuck on a mission, or who have gone quiet for a week.</p>
            </div>
            {attention.length === 0 ? (
              <p className="iv-empty">Everyone is moving. Nobody is stuck or quiet.</p>
            ) : (
              <ul className="iv-attn">
                {attention.map(({ s, why }) => (
                  <li key={s.userId}>
                    <strong>{who(s)}</strong>
                    <span>{why.join(" · ")}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rd-sec">
            <div className="rd-sec__head">
              <span className="rd-sec__n">02</span>
              <h2>Class skills</h2>
              <p>Average score on the missions students have finished. Reteach the lowest first.</p>
            </div>
            <div className="rd-ledger">
              {skills.map((k) => {
                const tone = scoreTone(k.avg);
                return (
                  <div key={k.key} className="rd-row">
                    <div className="rd-row__name">
                      <strong>{k.label}</strong>
                      <span>
                        {k.n} of {r.students.length} students have work here
                      </span>
                    </div>
                    <div className="rd-scale">
                      <div className={`rd-scale__fill rd-bg-${tone}`} style={{ width: `${k.avg ?? 0}%` }} />
                      <i style={{ left: "65%" }} data-mark="Almost · 65" />
                      <i style={{ left: "85%" }} data-mark="Ready · 85" />
                    </div>
                    <p className={`rd-row__score rd-text-${tone}`}>
                      {k.avg ?? "—"}
                      {k.avg !== null && <small>%</small>}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rd-sec">
            <div className="rd-sec__head">
              <span className="rd-sec__n">03</span>
              <h2>Students</h2>
              <p>Most recently active first.</p>
            </div>
            <div className="iv-table" role="table" aria-label={`${r.class.name} students`}>
              <div className="iv-tr iv-tr--head" role="row">
                <span role="columnheader">Student</span>
                <span role="columnheader">Readiness</span>
                <span role="columnheader">Where they are</span>
                <span role="columnheader">Last active</span>
                <span role="columnheader">Lab</span>
                <span role="columnheader">Drills this week</span>
                <span role="columnheader">Portfolio</span>
              </div>
              {r.students.map((s) => (
                <div key={s.userId} className="iv-tr" role="row">
                  <span role="cell" className="iv-who">
                    <strong>{who(s)}</strong>
                    {s.email && <small>{s.email}</small>}
                  </span>
                  <span role="cell" data-label="Readiness">
                    <b className={`rd-text-${scoreTone(s.readiness.overall)}`}>{s.readiness.overall ?? "––"}</b>
                    <small>
                      {s.readiness.level} · {s.readiness.finished}/{s.readiness.total} missions
                    </small>
                  </span>
                  <span role="cell" data-label="Where they are">
                    {s.place ? (
                      <>
                        {s.place.tab}
                        <small>{s.place.page}</small>
                      </>
                    ) : (
                      <small>Not seen yet</small>
                    )}
                  </span>
                  <span role="cell" data-label="Last active" className={quietDays(s) !== null && quietDays(s)! >= QUIET_DAYS ? "rd-text-warn" : ""}>
                    {ago(s.lastActive)}
                  </span>
                  <span role="cell" data-label="Lab">
                    {s.labSynced ? `Synced ${ago(s.labSynced).toLowerCase()}` : <small>Not connected</small>}
                  </span>
                  <span role="cell" data-label="Drills this week">
                    {s.drillsThisWeek}
                  </span>
                  <span role="cell" data-label="Portfolio">
                    {s.portfolio ? (
                      <a className="rd-link" href={`/p/${s.portfolio}`} target="_blank" rel="noreferrer">
                        Open <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <small>Not published</small>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function NewClassForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [made, setMade] = useState<{ name: string; code: string; emailed: boolean; to: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await academyFetch("/academy/api/instructor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, instructorEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create the class.");
        return;
      }
      setMade({ name: data.class.name, code: data.class.code, emailed: Boolean(data.emailed), to: email });
      setName("");
      setEmail("");
      onCreated();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rd-sec iv-new">
      <div className="rd-sec__head">
        <h2>Create a class</h2>
        <p>Assign an instructor by email. They sign in to Range with it to run the class.</p>
      </div>
      <form onSubmit={submit} className="iv-form">
        <label>
          <span>Class name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Symone, Fall 2026" required maxLength={80} />
        </label>
        <label>
          <span>Instructor email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="instructor@school.edu" required />
        </label>
        <button type="submit" className="rd-cta" disabled={busy}>
          {busy ? "Creating…" : "Create class"}
        </button>
      </form>
      {error && <p className="iv-error">{error}</p>}
      {made && (
        <div className="iv-made">
          <p>
            Created <strong>{made.name}</strong>.{" "}
            {made.emailed ? `We emailed the join link and sign-in steps to ${made.to}.` : `Couldn't send the email automatically — copy the link below and send it to ${made.to}.`}
          </p>
          <InviteBlock code={made.code} />
          <p className="iv-note">Code (fallback): <strong>{made.code}</strong></p>
        </div>
      )}
    </section>
  );
}

// The owner's view: create a class, assign its instructor, and keep the list.
// The instructor runs the class and tracks students; the owner just sets it up.
function OwnerView({ data, reload }: { data: Data; reload: () => void }) {
  const [viewing, setViewing] = useState<string | null>(null);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const viewingClass = viewing ? data.classes.find((c) => c.class.id === viewing) : null;

  if (viewingClass) {
    return (
      <div className="rd">
        <button type="button" className="ov-back" onClick={() => setViewing(null)}>
          <ArrowLeft aria-hidden="true" /> All classes
        </button>
        <ClassView r={viewingClass} />
      </div>
    );
  }

  return (
    <div className="rd">
      <header className="rd-mast">
        <p className="rd-kicker">Owner</p>
        <h1 className="iv-title">Classes</h1>
        <p className="ov-lede">Create a class and assign its instructor. They run it and track their students. You just set it up.</p>
      </header>

      <NewClassForm onCreated={reload} />

      <section className="rd-sec">
        <div className="rd-sec__head">
          <span className="rd-sec__n">{String(data.classes.length).padStart(2, "0")}</span>
          <h2>Your classes</h2>
          <p>Every class you have created, with its instructor and join link.</p>
        </div>
        {data.classes.length === 0 ? (
          <p className="iv-empty">No classes yet. Create your first one above.</p>
        ) : (
          <ul className="ov-classes">
            {data.classes.map((r) => {
              const joinLink = `${origin}/academy/join?code=${encodeURIComponent(r.class.code)}`;
              return (
                <li key={r.class.id} className="ov-class">
                  <div className="ov-class__main">
                    <strong>{r.class.name}</strong>
                    <small>{r.class.instructorEmail}</small>
                  </div>
                  <div className="ov-class__count">
                    <b>{r.summary.students}</b>
                    <span>student{r.summary.students === 1 ? "" : "s"}</span>
                  </div>
                  <div className="ov-class__actions">
                    <CopyLink text={joinLink} label="Copy link" />
                    <button type="button" className="iv-copy" onClick={() => setViewing(r.class.id)}>
                      View progress
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

export function InstructorDashboard() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pick, setPick] = useState(0);

  const load = useCallback(() => {
    academyFetch("/academy/api/instructor")
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(r.status === 403 ? "This account does not teach a class yet. Ask PurveX to set one up for your email." : body.error ?? "Could not load your classes.");
        setData(body as Data);
        setError(null);
      })
      .catch((err: Error) => setError(err.message));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="rd">
        <header className="rd-mast">
          <p className="rd-kicker">Instructor view</p>
          <p className="iv-empty">{error}</p>
        </header>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="rd">
        <p className="iv-empty">Loading your classes…</p>
      </div>
    );
  }

  // The owner gets a simple create-and-assign view; instructors get the class.
  if (data.admin) return <OwnerView data={data} reload={load} />;

  const current = data.classes[Math.min(pick, data.classes.length - 1)];
  return (
    <div className="rd">
      {data.classes.length > 1 && (
        <nav className="iv-tabs" aria-label="Classes">
          {data.classes.map((c, i) => (
            <button key={c.class.id} type="button" aria-pressed={c === current} onClick={() => setPick(i)}>
              {c.class.name}
              <small>{c.summary.students}</small>
            </button>
          ))}
        </nav>
      )}
      {current ? <ClassView r={current} /> : <p className="iv-empty">No classes yet.</p>}
    </div>
  );
}

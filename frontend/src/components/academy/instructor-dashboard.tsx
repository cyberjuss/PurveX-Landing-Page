"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronDown, Copy, Download, ExternalLink, Mail, Trash2 } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import { scoreTone } from "@/lib/academy-score";
import "./instructor.css";

// The instructor's view of a class: who is stuck, who has gone quiet, where
// the class is weakest, and every student's progress in one table. Each row
// opens to the full detail, and every read here has something you can do with
// it: mail the student, mail the whole at-risk group, or take the roster away
// as a spreadsheet.

type Student = {
  userId: string;
  name: string | null;
  email: string | null;
  joinedAt: string;
  readiness: { overall: number | null; accuracy: number | null; level: string; finished: number; total: number };
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
// Under two days is "Active". Between that and a week is "Steady": still
// moving, not worth chasing. Without this band Steady was unreachable.
const ACTIVE_DAYS = 2;

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

const onDay = (iso: string | null) => (iso && !Number.isNaN(Date.parse(iso)) ? new Date(iso).toLocaleDateString() : "—");
const quietDays = (s: Student) => (s.lastActive ? Math.floor((Date.now() - Date.parse(s.lastActive)) / DAY) : null);
const who = (s: Student) => s.name || s.email?.split("@")[0] || "Student";

type Status = { label: string; tone: "good" | "warn" | "bad" | "none" };

/** A single status read for a student, most urgent first. */
function statusOf(s: Student): Status {
  const quiet = quietDays(s);
  if (quiet === null) return { label: "Not started", tone: "none" };
  if (s.stuck.length) return { label: "Stuck", tone: "bad" };
  if (quiet >= QUIET_DAYS) return { label: "Quiet", tone: "warn" };
  if (quiet <= ACTIVE_DAYS) return { label: "Active", tone: "good" };
  return { label: "Steady", tone: "none" };
}

// Roster order: the students who need attention sit at the top.
const STATUS_PRIORITY: Record<string, number> = { Stuck: 0, Quiet: 1, "Not started": 2, Steady: 3, Active: 4 };
const urgency = (s: Student) => STATUS_PRIORITY[statusOf(s).label] ?? 3;

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

/** mailto for one student, with the reason already in the subject. */
function mailOne(s: Student, className: string): string | null {
  if (!s.email) return null;
  const why = flags(s);
  const subject = why.length ? `${className}: checking in` : `${className}`;
  const body = [
    `Hi ${who(s)},`,
    "",
    why.length ? `I noticed ${why[0].toLowerCase()}. Anything I can help unblock?` : "Checking in on how you are getting on.",
    "",
  ].join("\n");
  return `mailto:${encodeURIComponent(s.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** One mail to everyone who needs a look, bcc so they cannot see each other. */
function mailGroup(students: Student[], className: string): string | null {
  const to = students.map((s) => s.email).filter((e): e is string => Boolean(e));
  if (!to.length) return null;
  const body = ["Hi,", "", "Checking in on where you are. Reply here if anything is blocking you.", ""].join("\n");
  return `mailto:?bcc=${encodeURIComponent(to.join(","))}&subject=${encodeURIComponent(`${className}: checking in`)}&body=${encodeURIComponent(body)}`;
}

const csvCell = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function exportCsv(r: Report) {
  const head = [
    "Name", "Email", "Status", "Readiness", "Accuracy", "Level",
    "Missions finished", "Missions total", "Labs passed", "Drills this week",
    "Last active", "Where they are", "Lab synced", "Portfolio", "Joined", "Stuck on",
  ];
  const rows = [...r.students]
    .sort((a, b) => urgency(a) - urgency(b) || who(a).localeCompare(who(b)))
    .map((s) => [
      who(s), s.email ?? "", statusOf(s).label,
      s.readiness.overall ?? "", s.readiness.accuracy ?? "", s.readiness.level,
      s.readiness.finished, s.readiness.total, s.labsPassed, s.drillsThisWeek,
      s.lastActive ? new Date(s.lastActive).toISOString() : "Never",
      s.place ? `${s.place.tab} — ${s.place.page}` : "Not seen yet",
      s.labSynced ? new Date(s.labSynced).toISOString() : "Not connected",
      s.portfolio ? `${window.location.origin}/p/${s.portfolio}` : "",
      new Date(s.joinedAt).toISOString(),
      s.stuck.map((m) => m.title).join("; "),
    ]);
  // The BOM is what makes Excel read the accents correctly.
  const csv = "﻿" + [head, ...rows].map((line) => line.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `${r.class.name.replace(/[^\w.-]+/g, "-").replace(/^-|-$/g, "") || "class"}-roster.csv`;
  a.click();
  URL.revokeObjectURL(url);
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

function DeleteClassButton({ classId, name, onDeleted }: { classId: string; name: string; onDeleted: () => void }) {
  const [busy, setBusy] = useState(false);
  const del = async () => {
    if (!window.confirm(`Delete ${name}? This removes the class and its roster. Students keep their own progress and labs.`)) return;
    setBusy(true);
    try {
      const res = await academyFetch(`/academy/api/instructor?classId=${encodeURIComponent(classId)}`, { method: "DELETE" });
      if (res.ok) onDeleted();
      else setBusy(false);
    } catch {
      setBusy(false);
    }
  };
  return (
    <button type="button" className="iv-copy iv-del" disabled={busy} onClick={del}>
      <Trash2 className="h-3.5 w-3.5" /> {busy ? "Deleting…" : "Delete"}
    </button>
  );
}

/** The shareable join link with one-click copy -- what an instructor hands a class. */
function InviteBlock({ code }: { code: string }) {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const joinLink = `${origin}/range/join?code=${encodeURIComponent(code)}`;
  return (
    <div className="iv-invite">
      <div className="iv-invite__row">
        <code className="iv-invite__link">{joinLink}</code>
        <CopyLink text={joinLink} label="Copy join link" />
      </div>
    </div>
  );
}

/** Everything known about one student, opened from their row. */
function StudentDetail({ s, classTitle }: { s: Student; classTitle: string }) {
  const mail = mailOne(s, classTitle);
  const rated = s.skills.filter((k) => k.score !== null);
  return (
    <div className="iv-detail">
      <div className="iv-detail__grid">
        <section>
          <h3>Open missions</h3>
          {s.stuck.length === 0 ? (
            <p className="iv-detail__none">Nothing open. Every mission attempted is solved.</p>
          ) : (
            <ul className="iv-detail__stuck">
              {s.stuck.map((m) => (
                <li key={m.title}>
                  <strong>{m.title}</strong>
                  <span>
                    {m.wrong > 0 && `${m.wrong} wrong`}
                    {m.wrong > 0 && m.skipped && " · "}
                    {m.skipped && "skipped"}
                    {m.wrong === 0 && !m.skipped && "open"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3>Competencies</h3>
          {rated.length === 0 ? (
            <p className="iv-detail__none">No scored work yet, so there is nothing to read here.</p>
          ) : (
            <ul className="iv-detail__skills">
              {s.skills.map((k) => (
                <li key={k.key}>
                  <span>{k.label}</span>
                  <span className="iv-bar" aria-hidden="true">
                    <i className={`rd-bg-${scoreTone(k.score)}`} style={{ width: `${k.score ?? 0}%` }} />
                  </span>
                  <b className={`rd-text-${scoreTone(k.score)}`}>{k.score ?? "—"}</b>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h3>Record</h3>
          <dl className="iv-detail__facts">
            <div>
              <dt>Joined</dt>
              <dd>{onDay(s.joinedAt)}</dd>
            </div>
            <div>
              <dt>Labs passed</dt>
              <dd>{s.labsPassed}</dd>
            </div>
            <div>
              <dt>Drills this week</dt>
              <dd>{s.drillsThisWeek}</dd>
            </div>
            <div>
              <dt>Lab</dt>
              <dd>{s.labSynced ? `Synced ${ago(s.labSynced).toLowerCase()}` : "Not connected"}</dd>
            </div>
            <div>
              <dt>Last active</dt>
              <dd>{ago(s.lastActive)}</dd>
            </div>
            <div>
              <dt>Portfolio</dt>
              <dd>
                {s.portfolio ? (
                  <a className="rd-link" href={`/p/${s.portfolio}`} target="_blank" rel="noreferrer">
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  "Not published"
                )}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {s.email && (
        <div className="iv-detail__act">
          {mail && (
            <a className="iv-copy" href={mail}>
              <Mail className="h-3.5 w-3.5" /> Email {who(s)}
            </a>
          )}
          <CopyLink text={s.email} label="Copy address" />
        </div>
      )}
    </div>
  );
}

type SortKey = "urgency" | "name" | "readiness" | "active";
const FILTERS = ["All", "Needs a look", "Active", "Not started"] as const;
type Filter = (typeof FILTERS)[number];

function ClassView({ r, kicker = "Instructor view" }: { r: Report; kicker?: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("All");
  const [sort, setSort] = useState<SortKey>("urgency");
  const [showInvite, setShowInvite] = useState(false);

  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const joinLink = `${origin}/range/join?code=${encodeURIComponent(r.class.code)}`;
  const attention = r.students.map((s) => ({ s, why: flags(s) })).filter((x) => x.why.length);

  // Derived from the students rather than a fixed list, so a new competency in
  // the catalog shows up here instead of being silently dropped.
  const skills = useMemo(() => {
    const order: string[] = [];
    const seen = new Map<string, { label: string; scores: number[] }>();
    for (const s of r.students) {
      for (const k of s.skills) {
        if (!seen.has(k.key)) {
          seen.set(k.key, { label: k.label, scores: [] });
          order.push(k.key);
        }
        if (k.score !== null) seen.get(k.key)!.scores.push(k.score);
      }
    }
    return order.map((key) => {
      const e = seen.get(key)!;
      return { key, label: e.label, avg: e.scores.length ? Math.round(e.scores.reduce((a, b) => a + b, 0) / e.scores.length) : null, n: e.scores.length };
    });
  }, [r.students]);

  // The server already works out the weakest competencies; mark them so the
  // instructor knows where to start rather than reading four bars and guessing.
  const reteach = new Set(r.summary.weakest.map((w) => w.label));

  const shown = useMemo(() => {
    const keep = (s: Student) => {
      if (filter === "All") return true;
      const label = statusOf(s).label;
      if (filter === "Needs a look") return flags(s).length > 0;
      if (filter === "Active") return label === "Active" || label === "Steady";
      return label === "Not started";
    };
    const cmp: Record<SortKey, (a: Student, b: Student) => number> = {
      urgency: (a, b) => urgency(a) - urgency(b) || (Date.parse(b.lastActive ?? "0") || 0) - (Date.parse(a.lastActive ?? "0") || 0),
      name: (a, b) => who(a).localeCompare(who(b)),
      readiness: (a, b) => (b.readiness.overall ?? -1) - (a.readiness.overall ?? -1),
      active: (a, b) => (Date.parse(b.lastActive ?? "0") || 0) - (Date.parse(a.lastActive ?? "0") || 0),
    };
    return r.students.filter(keep).sort(cmp[sort]);
  }, [r.students, filter, sort]);

  const groupMail = mailGroup(attention.map((a) => a.s), r.class.name);

  return (
    <div className="iv-cc">
      {/* Always-visible summary. Sticks under the portal header so the headline
          numbers stay in view while the roster scrolls. */}
      <div className="iv-cc__bar">
        <div className="iv-cc__id">
          <p className="rd-kicker">{kicker}</p>
          <h1 className="iv-cc__title">{r.class.name}</h1>
        </div>
        <dl className="iv-cc__stats">
          <div>
            <dt>Students</dt>
            <dd>{r.summary.students}</dd>
          </div>
          <div>
            <dt>Active</dt>
            <dd>{r.summary.activeThisWeek}</dd>
          </div>
          <div className={attention.length ? "is-warn" : ""}>
            <dt>Needs a look</dt>
            <dd>{attention.length}</dd>
          </div>
          <div>
            <dt>Readiness</dt>
            <dd className={`rd-text-${scoreTone(r.summary.avgReadiness)}`}>{r.summary.avgReadiness ?? "\u2013\u2013"}</dd>
          </div>
        </dl>
        <div className="iv-cc__invite">
          <CopyLink text={joinLink} label="Join link" />
          <button type="button" className="iv-copy" aria-expanded={showInvite} onClick={() => setShowInvite((v) => !v)}>
            {showInvite ? "Hide code" : "Class code"}
          </button>
        </div>
      </div>

      {showInvite && (
        <div className="iv-cc__code">
          <code>{joinLink}</code>
          <p>
            Class code <strong>{r.class.code}</strong>
            <CopyLink text={r.class.code} label="Copy" />
            <span>Fallback for the join screen.</span>
          </p>
        </div>
      )}

      {r.students.length === 0 ? (
        <section className="iv-panel">
          <p className="iv-empty">No students yet. Share the join link above to get started.</p>
        </section>
      ) : (
        <div className="iv-cc__grid">
          <section className="iv-panel iv-cc__roster">
            <div className="iv-panel__head">
              <h2>Roster</h2>
              <p>Open a name for the full record.</p>
              <button type="button" className="iv-copy iv-panel__act" onClick={() => exportCsv(r)}>
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
            </div>

            <div className="iv-tools">
              <div className="iv-chips" role="group" aria-label="Filter students">
                {FILTERS.map((f) => (
                  <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                    {f}
                  </button>
                ))}
              </div>
              <label className="iv-sort">
                <span>Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                  <option value="urgency">Needs attention</option>
                  <option value="name">Name</option>
                  <option value="readiness">Readiness</option>
                  <option value="active">Last active</option>
                </select>
              </label>
            </div>

            {shown.length === 0 && <p className="iv-empty">No students match that filter.</p>}
            <div className="iv-table" role="table" aria-label={`${r.class.name} students`}>
              <div className="iv-tr iv-tr--head" role="row">
                <span role="columnheader">Student</span>
                <span role="columnheader">Readiness</span>
                <span role="columnheader">Where they are</span>
                <span role="columnheader">Last active</span>
              </div>
              {shown.map((s) => {
                const st = statusOf(s);
                const isOpen = open === s.userId;
                return (
                  <div key={s.userId} className={`iv-row${isOpen ? " iv-row--open" : ""}`}>
                    <div className="iv-tr" role="row">
                      <span role="cell" className="iv-who">
                        <button
                          type="button"
                          className="iv-who__toggle"
                          aria-expanded={isOpen}
                          onClick={() => setOpen(isOpen ? null : s.userId)}
                        >
                          <ChevronDown className="iv-who__chev h-4 w-4" aria-hidden="true" />
                          <strong>{who(s)}</strong>
                        </button>
                        {s.email && <small>{s.email}</small>}
                        <span className={`iv-pill iv-pill--${st.tone}`}>{st.label}</span>
                      </span>
                      <span role="cell" data-label="Readiness">
                        {/* Width is readiness (all missions). Color is accuracy, so a new student is not shown as failing. */}
                        <b className={`rd-text-${scoreTone(s.readiness.accuracy)}`}>{s.readiness.overall ?? "––"}</b>
                        <span className="iv-bar" aria-hidden="true">
                          <i className={`rd-bg-${scoreTone(s.readiness.accuracy)}`} style={{ width: `${s.readiness.overall ?? 0}%` }} />
                        </span>
                        <small>
                          {s.readiness.level} · {s.readiness.finished}/{s.readiness.total} missions
                          {s.readiness.accuracy !== null && ` · ${s.readiness.accuracy}% accuracy`}
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
                    </div>
                    {isOpen && <StudentDetail s={s} classTitle={r.class.name} />}
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="iv-cc__side">
            <section className="iv-panel">
              <div className="iv-panel__head">
                <h2>Needs a look</h2>
                {groupMail && attention.length > 1 && (
                  <a className="iv-copy iv-panel__act" href={groupMail}>
                    <Mail className="h-3.5 w-3.5" /> Email {attention.length}
                  </a>
                )}
              </div>
              {attention.length === 0 ? (
                <p className="iv-empty iv-empty--sm">Everyone is moving. Nobody is stuck or quiet.</p>
              ) : (
                <ul className="iv-attn">
                  {attention.map(({ s, why }) => {
                    const mail = mailOne(s, r.class.name);
                    return (
                      <li key={s.userId}>
                        <strong>{who(s)}</strong>
                        <span>{why.join(" \u00b7 ")}</span>
                        {mail && (
                          <a className="iv-attn__mail" href={mail} aria-label={`Email ${who(s)}`}>
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section className="iv-panel">
              <div className="iv-panel__head">
                <h2>Class skills</h2>
                <p>Reteach the lowest first.</p>
              </div>
              <ul className="iv-skills">
                {skills.map((k) => {
                  const tone = scoreTone(k.avg);
                  return (
                    <li key={k.key}>
                      <div className="iv-skills__top">
                        <strong>
                          {k.label}
                          {k.avg !== null && reteach.has(k.label) && <em className="iv-reteach">Reteach</em>}
                        </strong>
                        <b className={`rd-text-${tone}`}>
                          {k.avg ?? "\u2014"}
                          {k.avg !== null && <small>%</small>}
                        </b>
                      </div>
                      <span className="iv-bar" aria-hidden="true">
                        <i className={`rd-bg-${tone}`} style={{ width: `${k.avg ?? 0}%` }} />
                      </span>
                      <small className="iv-skills__n">{k.n} of {r.students.length} have work here</small>
                    </li>
                  );
                })}
              </ul>
            </section>
          </aside>
        </div>
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
  // With one class there is nothing to choose between, so open it. Landing on
  // a list of one and having to click it put the roster a step out of the way
  // for the person who opens this page most.
  const [viewing, setViewing] = useState<string | null>(data.classes.length === 1 ? data.classes[0].class.id : null);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const viewingClass = viewing ? data.classes.find((c) => c.class.id === viewing) : null;

  if (viewingClass) {
    return (
      <div className="rd iv-root">
        <button type="button" className="ov-back" onClick={() => setViewing(null)}>
          <ArrowLeft aria-hidden="true" /> All classes
        </button>
        <ClassView r={viewingClass} kicker="Owner view" />
      </div>
    );
  }

  return (
    <div className="rd iv-root">
      <header className="rd-mast">
        <p className="rd-kicker">Owner</p>
        <h1 className="iv-title">Classes</h1>
        <p className="ov-lede">Create a class and assign an instructor to run it.</p>
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
              const joinLink = `${origin}/range/join?code=${encodeURIComponent(r.class.code)}`;
              const needLook = r.students.filter((s) => flags(s).length > 0).length;
              return (
                <li key={r.class.id} className="ov-class">
                  <div className="ov-class__main">
                    <strong>{r.class.name}</strong>
                    <small>{r.class.instructorEmail}</small>
                    <code className="ov-class__link">{joinLink}</code>
                  </div>
                  {/* The list is where the owner decides which class to open,
                      so it carries the same read the class view opens on. */}
                  <dl className="ov-class__stats">
                    <div>
                      <dt>Students</dt>
                      <dd>{r.summary.students}</dd>
                    </div>
                    <div>
                      <dt>Active</dt>
                      <dd>{r.summary.activeThisWeek}</dd>
                    </div>
                    <div>
                      <dt>Need a look</dt>
                      <dd className={needLook ? "rd-text-warn" : ""}>{needLook}</dd>
                    </div>
                    <div>
                      <dt>Readiness</dt>
                      <dd className={`rd-text-${scoreTone(r.summary.avgReadiness)}`}>{r.summary.avgReadiness ?? "––"}</dd>
                    </div>
                  </dl>
                  <div className="ov-class__actions">
                    <CopyLink text={joinLink} label="Copy link" />
                    <button type="button" className="iv-copy" onClick={() => setViewing(r.class.id)}>
                      View progress
                    </button>
                    <DeleteClassButton classId={r.class.id} name={r.class.name} onDeleted={reload} />
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
    <div className="rd iv-root">
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

"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, X } from "lucide-react";
import {
  CERT_STATUSES,
  CERTS,
  DONE,
  HELP_STYLES,
  HOURS,
  MACHINES,
  MAX_ROLES,
  QUICK_CHECK,
  ROLES,
  sanitizeProfile,
  START_LEVELS,
  TIMELINES,
  type CertGoal,
  type CertId,
  type CertStatus,
  type HelpStyle,
  type Hours,
  type Machine,
  type RoleId,
  type StartLevel,
  type StudentProfile,
  type Timeline,
} from "@/lib/academy-certs";
import { academyFetch, DEV_PREVIEW } from "@/lib/academy-client";
import { updateDisplayName } from "@/lib/portal-auth";
// Imported here, not in globals.css, so the styles always arrive with the component.
import "./academy-intake.css";

type QuickStep = `q-${string}`;
type Step = CertId | "roles" | "timeline" | "hours" | "done" | QuickStep | "machine" | "help" | "start";
// Goal first, then time, then what they can already do, then a four-ticket
// quick check, then their setup and how they like help. Coach reads all of it.
const STEPS: Step[] = [
  "roles",
  "timeline",
  "hours",
  "done",
  ...QUICK_CHECK.map((q) => `q-${q.id}` as QuickStep),
  "machine",
  "help",
  "secplus",
  "cysa",
  "start",
];
const NONE_DONE = "none";
// Long enough to see the choice land before the next question slides in.
const ADVANCE_MS = 260;

const todayPlus = (days: number) => new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);

// The questions every student answers before the Academy opens, one per
// screen. Coach, the daily drill and the missions read the answers. Also used
// to edit them later.
export function AcademyIntake({
  initial,
  onSaved,
  onCancel,
}: {
  initial: StudentProfile | null;
  onSaved: (profile: StudentProfile) => void;
  /** Only when editing. A first-time student cannot skip. */
  onCancel?: () => void;
}) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [certs, setCerts] = useState<Partial<Record<CertId, CertGoal>>>(initial?.certs ?? {});
  const [roles, setRoles] = useState<RoleId[]>(initial?.roles ?? []);
  const [start, setStart] = useState<StartLevel | null>(initial?.start ?? null);
  const [background, setBackground] = useState(initial?.background ?? "");
  const ex = initial?.extras ?? {};
  const [timeline, setTimeline] = useState<Timeline | undefined>(ex.timeline);
  const [hours, setHours] = useState<Hours | undefined>(ex.hours);
  // Undefined until answered, so "none of these" is a real answer, not a skip.
  const [done, setDone] = useState<string[] | undefined>(ex.done);
  const [quick, setQuick] = useState<Record<string, number>>({});
  const [machine, setMachine] = useState<Machine | undefined>(ex.machine);
  const [help, setHelp] = useState<HelpStyle | undefined>(ex.help);
  const [notes, setNotes] = useState(ex.notes ?? "");
  // Asked here rather than at signup, where an extra field costs more than it
  // is worth. Without it the portal greets people by their email handle.
  const [firstName, setFirstName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  function go(to: number) {
    window.clearTimeout(timer.current);
    setError(null);
    setDir(to > i ? 1 : -1);
    setI(Math.max(0, Math.min(STEPS.length - 1, to)));
  }

  function pickCert(id: CertId, status: CertStatus) {
    setCerts((prev) => ({
      ...prev,
      [id]: status === "studying" ? { status, examDate: prev[id]?.examDate } : status === "earned" ? { status, earnedDate: prev[id]?.earnedDate } : { status },
    }));
    // Studying and Certified ask for a date, so they wait for Next.
    if (status !== "studying" && status !== "earned") timer.current = window.setTimeout(() => go(i + 1), ADVANCE_MS);
  }

  /** A single-choice answer: record it, then move on once it has landed. */
  function pickAndGo<T>(set: (v: T) => void, v: T) {
    set(v);
    timer.current = window.setTimeout(() => go(i + 1), ADVANCE_MS);
  }

  function toggleDone(id: string) {
    setDone((prev) => {
      if (id === NONE_DONE) return [];
      const cur = prev ?? [];
      return cur.includes(id) ? cur.filter((d) => d !== id) : [...cur, id];
    });
  }

  // The quick check keeps the first answer: it is a read on what they know
  // walking in, not a test to retry until it comes out right.
  function answerQuick(id: string, n: number) {
    setQuick((prev) => (id in prev ? prev : { ...prev, [id]: n }));
  }

  function extrasNow() {
    const right = Object.fromEntries(
      QUICK_CHECK.filter((q) => q.id in quick).map((q) => [q.id, quick[q.id] === q.answer])
    );
    return {
      timeline,
      hours,
      done,
      // A re-run of the questions without answering the check keeps the old result.
      quick: Object.keys(right).length ? right : ex.quick,
      machine,
      help,
      notes: notes.trim() || undefined,
    };
  }

  function toggleRole(id: RoleId) {
    setRoles((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : prev.length >= MAX_ROLES ? [prev[1], id] : [...prev, id]));
  }

  async function save() {
    if (busy || !start || !roles.length) return;
    setBusy(true);
    setError(null);
    try {
      // Before the answers, so a student who types a name always gets it
      // stored even if the profile save then fails and they retry.
      const name = firstName.trim();
      if (name) await updateDisplayName(name);
      // No account to save to in a local preview, so the answers stay in this browser.
      const extras = extrasNow();
      const local = DEV_PREVIEW ? sanitizeProfile({ certs, otherCerts: initial?.otherCerts ?? "", roles, start, background, extras }) : null;
      if (local) {
        onSaved(local);
        return;
      }
      const res = await academyFetch("/academy/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: { certs, otherCerts: initial?.otherCerts ?? "", roles, start, background, extras } }),
      });
      const data = (await res.json().catch(() => ({}))) as { profile?: StudentProfile; error?: string };
      if (!res.ok || !data.profile) throw new Error(data.error || "We couldn't save your answers. Please try again.");
      onSaved(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't save your answers. Please try again.");
      setBusy(false);
    }
  }

  // The last step also asks for a name. Required, because the whole point of
  // asking is that the portal stops calling people by their email handle, and
  // a field everyone skips would not do that.
  const quickQ = step.startsWith("q-") ? QUICK_CHECK.find((q) => `q-${q.id}` === step) : undefined;
  const canNext =
    step === "roles"
      ? roles.length > 0
      : step === "start"
        ? Boolean(start) && Boolean(firstName.trim())
        : step === "done"
          ? done !== undefined
          : quickQ
            ? quickQ.id in quick || Boolean(ex.quick && quickQ.id in ex.quick)
            : step === "secplus" || step === "cysa"
              ? Boolean(certs[step]?.status)
              : true;

  let title = "";
  let hint: string | null = null;
  let body: React.ReactNode = null;

  if (step === "timeline") {
    title = "When do you want to be job-ready?";
    body = (
      <div className="axq-list" role="radiogroup" aria-label={title}>
        {TIMELINES.map((t) => (
          <Option key={t.id} on={timeline === t.id} role="radio" onClick={() => pickAndGo(setTimeline, t.id)}>
            {t.label}
          </Option>
        ))}
      </div>
    );
  } else if (step === "hours") {
    title = "How much time can you give it each week?";
    hint = "Be honest. Coach uses it to set a pace you can keep.";
    body = (
      <div className="axq-list" role="radiogroup" aria-label={title}>
        {HOURS.map((h) => (
          <Option key={h.id} on={hours === h.id} role="radio" onClick={() => pickAndGo(setHours, h.id)}>
            {h.label}
          </Option>
        ))}
      </div>
    );
  } else if (step === "done") {
    title = "Which of these have you done for real?";
    hint = "Tap all that apply";
    body = (
      <div className="axq-list">
        {DONE.map((d) => (
          <Option key={d.id} on={Boolean(done?.includes(d.id))} role="checkbox" onClick={() => toggleDone(d.id)}>
            {d.label}
          </Option>
        ))}
        <Option on={done !== undefined && done.length === 0} role="checkbox" onClick={() => toggleDone(NONE_DONE)}>
          None of these yet
        </Option>
      </div>
    );
  } else if (quickQ) {
    const n = QUICK_CHECK.indexOf(quickQ) + 1;
    const picked = quick[quickQ.id];
    title = quickQ.prompt;
    hint = `Quick check ${n} of ${QUICK_CHECK.length} · Not graded. It shows Coach where to start.`;
    body = (
      <>
        <div className="axq-list" role="radiogroup" aria-label={`Quick check ${n}`}>
          {quickQ.options.map((o, k) => (
            <Option key={o} on={picked === k} role="radio" onClick={() => answerQuick(quickQ.id, k)}>
              {o}
            </Option>
          ))}
        </div>
        {picked !== undefined && (
          <p className={`axq-fb axq-reveal ${picked === quickQ.answer ? "is-right" : "is-wrong"}`} role="status">
            <strong>{picked === quickQ.answer ? "Right." : "Not quite."}</strong> {quickQ.why}
          </p>
        )}
      </>
    );
  } else if (step === "machine") {
    title = "What will you run your lab on?";
    hint = "The home lab needs a Windows PC. Anything else uses the cloud lab, which runs in a browser tab.";
    body = (
      <div className="axq-list" role="radiogroup" aria-label={title}>
        {MACHINES.map((m) => (
          <Option key={m.id} on={machine === m.id} role="radio" onClick={() => pickAndGo(setMachine, m.id)}>
            {m.label}
          </Option>
        ))}
      </div>
    );
  } else if (step === "help") {
    title = "When you're stuck, what helps most?";
    body = (
      <div className="axq-list" role="radiogroup" aria-label={title}>
        {HELP_STYLES.map((h) => (
          <Option key={h.id} on={help === h.id} role="radio" onClick={() => pickAndGo(setHelp, h.id)}>
            {h.label}
          </Option>
        ))}
      </div>
    );
  } else if (step === "secplus" || step === "cysa") {
    const goal = certs[step];
    title = CERTS[step].full;
    hint = "Your current status";
    body = (
      <>
        <div className="axq-list" role="radiogroup" aria-label={CERTS[step].full}>
          {CERT_STATUSES.map((s) => (
            <Option key={s.id} on={goal?.status === s.id} role="radio" onClick={() => pickCert(step, s.id)}>
              {s.label}
            </Option>
          ))}
        </div>
        {goal?.status === "studying" && (
          <label className="axq-field axq-reveal">
            <span>Scheduled exam date · Optional</span>
            <input
              type="date"
              min={todayPlus(0)}
              max={todayPlus(730)}
              value={goal.examDate ?? ""}
              onChange={(e) => setCerts((prev) => ({ ...prev, [step]: { status: "studying", examDate: e.target.value || undefined } }))}
            />
          </label>
        )}
        {goal?.status === "earned" && (
          <label className="axq-field axq-reveal">
            <span>Date earned · Optional</span>
            <input
              type="date"
              max={todayPlus(0)}
              value={goal.earnedDate ?? ""}
              onChange={(e) => setCerts((prev) => ({ ...prev, [step]: { status: "earned", earnedDate: e.target.value || undefined } }))}
            />
          </label>
        )}
      </>
    );
  } else if (step === "roles") {
    title = "Which job are you working toward?";
    hint = "Pick up to two";
    body = (
      <div className="axq-list">
        {ROLES.map((r) => (
          <Option key={r.id} on={roles.includes(r.id)} role="checkbox" onClick={() => toggleRole(r.id)}>
            {r.label}
          </Option>
        ))}
      </div>
    );
  } else {
    title = "Last thing: a little about you";
    body = (
      <>
        <div className="axq-list" role="radiogroup" aria-label="Starting point">
          {START_LEVELS.map((s) => (
            <Option key={s.id} on={start === s.id} role="radio" onClick={() => setStart(s.id)}>
              {s.label}
            </Option>
          ))}
        </div>
        <label className="axq-field">
          <span>First name</span>
          <input
            type="text"
            maxLength={40}
            autoComplete="given-name"
            placeholder="What should we call you?"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </label>
        <label className="axq-field">
          <span>Current role · Optional</span>
          <input type="text" maxLength={280} placeholder="e.g. Retail manager, student, veteran" value={background} onChange={(e) => setBackground(e.target.value)} />
        </label>
        <label className="axq-field">
          <span>Anything Coach should know? · Optional</span>
          <input
            type="text"
            maxLength={200}
            placeholder="e.g. English is my second language, keep answers short"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      </>
    );
  }

  // The Next button shows only where a tap does not move on by itself.
  const showNext =
    step === "roles" ||
    step === "start" ||
    step === "done" ||
    Boolean(quickQ) ||
    certs[step as CertId]?.status === "studying" ||
    certs[step as CertId]?.status === "earned" ||
    // A single choice already made (coming back to edit) needs a way forward.
    (step === "timeline" && Boolean(timeline)) ||
    (step === "hours" && Boolean(hours)) ||
    (step === "machine" && Boolean(machine)) ||
    (step === "help" && Boolean(help));

  return (
    <section className="axq" aria-label={initial ? "Your goals" : "Before you start"}>
      <div className="axq-top">
        {i > 0 ? (
          <button type="button" className="axq-icon" onClick={() => go(i - 1)} aria-label="Back" disabled={busy}>
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : onCancel ? (
          <button type="button" className="axq-icon" onClick={onCancel} aria-label="Close" disabled={busy}>
            <X className="h-4 w-4" />
          </button>
        ) : (
          <span className="axq-icon" aria-hidden="true" />
        )}
        <div className="axq-bar" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={i + 1}>
          {STEPS.map((s, n) => (
            <i key={s} className={n <= i ? "is-on" : ""} />
          ))}
        </div>
        <span className="axq-count">
          {i + 1}/{STEPS.length}
        </span>
      </div>

      <div key={step} className={`axq-step ${dir > 0 ? "axq-step--fwd" : "axq-step--back"}`}>
        <h1 className={title.length > 60 ? "is-long" : undefined}>{title}</h1>
        {hint && <p className="axq-hint">{hint}</p>}
        {body}
      </div>

      {error && (
        <p className="axq-error" role="alert">
          {error}
        </p>
      )}

      {showNext && (
        <button type="button" className="axq-next" disabled={!canNext || busy} onClick={() => (last ? void save() : go(i + 1))}>
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {last ? (initial ? "Save changes" : "Enter Range") : "Continue"} <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      )}
    </section>
  );
}

function Option({ on, role, onClick, children }: { on: boolean; role: "radio" | "checkbox"; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" role={role} aria-checked={on} className={`axq-opt${on ? " is-on" : ""}`} onClick={onClick}>
      <span>{children}</span>
      <span className="axq-mark" aria-hidden="true">
        {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}

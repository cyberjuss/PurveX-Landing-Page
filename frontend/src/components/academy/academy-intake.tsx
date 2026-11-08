"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, X } from "lucide-react";
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
      quickPick: Object.keys(right).length ? quick : ex.quickPick,
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

  // Each screen is a section of the form, a question, and its choices. The
  // choices are one list for every kind of step, so they look the same and
  // the keyboard (A, B, C… and Enter) works on all of them.
  type Choice = { label: string; on: boolean; pick: () => void; tone?: "right" | "wrong" | "answer" };
  let section = "";
  let title = "";
  let hint: string | null = null;
  let multi = false;
  let choices: Choice[] = [];
  let extra: React.ReactNode = null;

  if (step === "roles") {
    section = "Your goal";
    title = "Which job are you working toward?";
    hint = "Pick up to two.";
    multi = true;
    choices = ROLES.map((r) => ({ label: r.label, on: roles.includes(r.id), pick: () => toggleRole(r.id) }));
  } else if (step === "timeline") {
    section = "Your goal";
    title = "When do you want to be job-ready?";
    choices = TIMELINES.map((t) => ({ label: t.label, on: timeline === t.id, pick: () => pickAndGo(setTimeline, t.id) }));
  } else if (step === "hours") {
    section = "Your goal";
    title = "How much time can you give it each week?";
    hint = "Be honest. Coach uses it to set a pace you can keep.";
    choices = HOURS.map((h) => ({ label: h.label, on: hours === h.id, pick: () => pickAndGo(setHours, h.id) }));
  } else if (step === "done") {
    section = "Experience";
    title = "Which of these have you done for real?";
    hint = "Select all that apply.";
    multi = true;
    choices = [
      ...DONE.map((d) => ({ label: d.label, on: Boolean(done?.includes(d.id)), pick: () => toggleDone(d.id) })),
      { label: "None of these yet", on: done !== undefined && done.length === 0, pick: () => toggleDone(NONE_DONE) },
    ];
  } else if (quickQ) {
    const n = QUICK_CHECK.indexOf(quickQ) + 1;
    const picked = quick[quickQ.id];
    const answered = picked !== undefined;
    section = `Quick check · ${n} of ${QUICK_CHECK.length}`;
    title = quickQ.prompt;
    hint = "Not graded. Your first answer tells Coach where to start.";
    choices = quickQ.options.map((o, k) => ({
      label: o,
      on: picked === k,
      pick: () => answerQuick(quickQ.id, k),
      tone: !answered ? undefined : k === quickQ.answer ? (picked === k ? "right" : "answer") : picked === k ? "wrong" : undefined,
    }));
    if (answered)
      extra = (
        <div className={`axq-note ${picked === quickQ.answer ? "is-right" : "is-wrong"}`} role="status">
          <span className="axq-note__tag">{picked === quickQ.answer ? "Correct" : "Not quite"}</span>
          <p>{quickQ.why}</p>
        </div>
      );
  } else if (step === "machine") {
    section = "Setup";
    title = "What will you run your lab on?";
    hint = "The home lab needs a Windows PC. Anything else uses the cloud lab, which runs in a browser tab.";
    choices = MACHINES.map((m) => ({ label: m.label, on: machine === m.id, pick: () => pickAndGo(setMachine, m.id) }));
  } else if (step === "help") {
    section = "Setup";
    title = "When you're stuck, what helps most?";
    choices = HELP_STYLES.map((h) => ({ label: h.label, on: help === h.id, pick: () => pickAndGo(setHelp, h.id) }));
  } else if (step === "secplus" || step === "cysa") {
    const goal = certs[step];
    section = "Certifications";
    title = CERTS[step].full;
    hint = "Where are you with it?";
    choices = CERT_STATUSES.map((st) => ({ label: st.label, on: goal?.status === st.id, pick: () => pickCert(step, st.id) }));
    if (goal?.status === "studying")
      extra = (
        <label className="axq-field">
          <span>Scheduled exam date · Optional</span>
          <input
            type="date"
            min={todayPlus(0)}
            max={todayPlus(730)}
            value={goal.examDate ?? ""}
            onChange={(e) => setCerts((prev) => ({ ...prev, [step]: { status: "studying", examDate: e.target.value || undefined } }))}
          />
        </label>
      );
    if (goal?.status === "earned")
      extra = (
        <label className="axq-field">
          <span>Date earned · Optional</span>
          <input
            type="date"
            max={todayPlus(0)}
            value={goal.earnedDate ?? ""}
            onChange={(e) => setCerts((prev) => ({ ...prev, [step]: { status: "earned", earnedDate: e.target.value || undefined } }))}
          />
        </label>
      );
  } else {
    section = "About you";
    title = "Last thing: a little about you.";
    choices = START_LEVELS.map((st) => ({ label: st.label, on: start === st.id, pick: () => setStart(st.id) }));
    extra = (
      <div className="axq-fields">
        <label className="axq-field">
          <span>First name</span>
          <input type="text" maxLength={40} autoComplete="given-name" placeholder="What should we call you?" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
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
      </div>
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

  // Keyboard: a letter picks that choice, Enter continues. Ignored while typing.
  const keys = useRef({ choices, showNext, canNext, last, busy });
  keys.current = { choices, showNext, canNext, last, busy };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      const k = keys.current;
      if (e.key === "Enter" && k.showNext && k.canNext && !k.busy) {
        e.preventDefault();
        if (k.last) void save();
        else go(i + 1);
        return;
      }
      if (typing || e.key.length !== 1) return;
      const n = e.key.toUpperCase().charCodeAt(0) - 65;
      if (n >= 0 && n < k.choices.length) {
        e.preventDefault();
        k.choices[n].pick();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const qn = String(i + 1).padStart(2, "0");
  return (
    <section className="axq" aria-label={initial ? "Your goals" : "Before you start"}>
      <header className="axq-head">
        <div className="axq-head__row">
          {i > 0 ? (
            <button type="button" className="axq-back" onClick={() => go(i - 1)} disabled={busy}>
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back
            </button>
          ) : onCancel ? (
            <button type="button" className="axq-back" onClick={onCancel} disabled={busy}>
              <X className="h-3.5 w-3.5" aria-hidden /> Close
            </button>
          ) : (
            <span className="axq-org">PurveX Financial · New hire onboarding</span>
          )}
          <span className="axq-count">
            {qn} / {String(STEPS.length).padStart(2, "0")}
          </span>
        </div>
        <div className="axq-rule" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={i + 1}>
          <i style={{ width: `${((i + 1) / STEPS.length) * 100}%` }} />
        </div>
      </header>

      <div key={step} className="axq-step">
        <p className="axq-label">
          <span>Q{qn}</span>
          {section}
        </p>
        <h1 className={title.length > 60 ? "is-long" : undefined}>{title}</h1>
        {hint && <p className="axq-hint">{hint}</p>}
        {choices.length > 0 && (
          <div className="axq-list" role={multi ? "group" : "radiogroup"} aria-label={title}>
            {choices.map((c, n) => (
              <button
                key={c.label}
                type="button"
                role={multi ? "checkbox" : "radio"}
                aria-checked={c.on}
                className={`axq-opt${c.on ? " is-on" : ""}${c.tone ? ` is-${c.tone}` : ""}`}
                onClick={c.pick}
              >
                <kbd className="axq-key">{String.fromCharCode(65 + n)}</kbd>
                <span className="axq-opt__text">{c.label}</span>
                {c.tone === "answer" && <span className="axq-opt__tag">Correct answer</span>}
              </button>
            ))}
          </div>
        )}
        {extra}
      </div>

      {error && (
        <p className="axq-error" role="alert">
          {error}
        </p>
      )}

      {showNext && (
        <div className="axq-foot">
          <span className="axq-enter" aria-hidden>
            press <kbd>Enter</kbd>
          </span>
          <button type="button" className="axq-next" disabled={!canNext || busy} onClick={() => (last ? void save() : go(i + 1))}>
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                {last ? (initial ? "Save changes" : "Enter Range") : "Continue"} <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import {
  CERT_IDS,
  CERT_STATUSES,
  CERTS,
  MAX_ROLES,
  ROLES,
  START_LEVELS,
  type CertGoal,
  type CertId,
  type RoleId,
  type StartLevel,
  type StudentProfile,
} from "@/lib/academy-certs";
import { academyFetch } from "@/lib/academy-client";

const STEPS = ["Certifications", "Target role", "Starting point"] as const;

function todayPlus(days: number) {
  return new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
}

// The questions every student answers before the Academy opens. Coach, the
// daily drill and the missions read the answers. Also used to edit them later.
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
  const [step, setStep] = useState(0);
  const [certs, setCerts] = useState<Partial<Record<CertId, CertGoal>>>(initial?.certs ?? {});
  const [otherCerts, setOtherCerts] = useState(initial?.otherCerts ?? "");
  const [roles, setRoles] = useState<RoleId[]>(initial?.roles ?? []);
  const [start, setStart] = useState<StartLevel | null>(initial?.start ?? null);
  const [background, setBackground] = useState(initial?.background ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const certsDone = CERT_IDS.every((c) => certs[c]?.status);
  const ready = [certsDone, roles.length > 0, Boolean(start)];

  function setCert(id: CertId, patch: Partial<CertGoal>) {
    setCerts((prev) => {
      const next = { ...prev[id], ...patch } as CertGoal;
      if (next.status !== "studying") delete next.examDate;
      return { ...prev, [id]: next };
    });
  }

  function toggleRole(id: RoleId) {
    setRoles((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : prev.length >= MAX_ROLES ? [prev[1], id] : [...prev, id]));
  }

  async function save() {
    if (busy || !ready.every(Boolean)) return;
    setBusy(true);
    setError(null);
    try {
      const res = await academyFetch("/academy/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: { certs, otherCerts, roles, start, background } }),
      });
      const data = (await res.json().catch(() => ({}))) as { profile?: StudentProfile; error?: string };
      if (!res.ok || !data.profile) throw new Error(data.error || "Could not save your answers just now. Try again.");
      onSaved(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your answers just now. Try again.");
      setBusy(false);
    }
  }

  function next() {
    if (!ready[step]) {
      setError(step === 0 ? "Pick an answer for both certifications." : step === 1 ? "Pick at least one role." : "Pick where you are starting from.");
      return;
    }
    setError(null);
    if (step < STEPS.length - 1) setStep(step + 1);
    else void save();
  }

  return (
    <section className="rd ax-intake" aria-labelledby="ax-intake-title">
      <header className="ax-intake__head">
        <p className="rd-kicker">{initial ? "Your goals" : "Before you start"}</p>
        <h1 id="ax-intake-title">{initial ? "Update your goals" : "Three quick questions"}</h1>
        <p>Your answers shape what Coach focuses on, what your daily drill asks, and how each mission links to the exam you are working toward.</p>
        <ol className="ax-intake__steps" aria-label="Progress">
          {STEPS.map((label, i) => (
            <li key={label} className={i === step ? "is-here" : i < step ? "is-done" : ""} aria-current={i === step ? "step" : undefined}>
              <span>{i < step ? <Check className="h-3 w-3" /> : i + 1}</span>
              {label}
            </li>
          ))}
        </ol>
      </header>

      {step === 0 && (
        <div className="ax-intake__body">
          <h2>Where are you with these certifications?</h2>
          {CERT_IDS.map((id) => {
            const cert = CERTS[id];
            const goal = certs[id];
            return (
              <fieldset key={id} className="ax-intake__cert">
                <legend>
                  <strong>{cert.full}</strong>
                  <small>Exam {cert.exam}</small>
                </legend>
                <div className="ax-intake__seg" role="radiogroup" aria-label={cert.full}>
                  {CERT_STATUSES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={goal?.status === s.id}
                      className={goal?.status === s.id ? "is-on" : ""}
                      onClick={() => setCert(id, { status: s.id })}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {goal?.status === "studying" && (
                  <label className="ax-intake__field ax-intake__field--inline">
                    <span>Exam date, if booked</span>
                    <input
                      type="date"
                      min={todayPlus(0)}
                      max={todayPlus(730)}
                      value={goal.examDate ?? ""}
                      onChange={(e) => setCert(id, { examDate: e.target.value || undefined })}
                    />
                  </label>
                )}
              </fieldset>
            );
          })}
          <label className="ax-intake__field">
            <span>Other certifications you hold or are studying for (optional)</span>
            <input
              type="text"
              maxLength={160}
              placeholder="For example A+, Network+"
              value={otherCerts}
              onChange={(e) => setOtherCerts(e.target.value)}
            />
          </label>
        </div>
      )}

      {step === 1 && (
        <div className="ax-intake__body">
          <h2>Which role are you aiming for?</h2>
          <p className="ax-intake__note">Pick up to {MAX_ROLES}. Coach looks up what each role does day to day and keeps your practice pointed at it.</p>
          <div className="ax-intake__cards">
            {ROLES.map((r) => {
              const on = roles.includes(r.id);
              return (
                <button key={r.id} type="button" aria-pressed={on} className={`ax-intake__card${on ? " is-on" : ""}`} onClick={() => toggleRole(r.id)}>
                  <span className="ax-intake__tick" aria-hidden="true">{on && <Check className="h-3.5 w-3.5" />}</span>
                  <strong>{r.label}</strong>
                  <span>{r.blurb}</span>
                  <small>Built by {r.phases}</small>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="ax-intake__body">
          <h2>Where are you starting from?</h2>
          <div className="ax-intake__cards ax-intake__cards--three" role="radiogroup" aria-label="Starting point">
            {START_LEVELS.map((s) => {
              const on = start === s.id;
              return (
                <button key={s.id} type="button" role="radio" aria-checked={on} className={`ax-intake__card${on ? " is-on" : ""}`} onClick={() => setStart(s.id)}>
                  <span className="ax-intake__tick" aria-hidden="true">{on && <Check className="h-3.5 w-3.5" />}</span>
                  <strong>{s.label}</strong>
                  <span>{s.blurb}</span>
                </button>
              );
            })}
          </div>
          <label className="ax-intake__field">
            <span>Your current or last job, in a line (optional)</span>
            <textarea
              rows={2}
              maxLength={280}
              placeholder="For example: retail shift lead, Army signal support, college student"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
            />
            <small>Coach uses this to connect what you already know to desk work. It never shows on anything public.</small>
          </label>
        </div>
      )}

      {error && (
        <p className="ax-intake__error" role="alert">
          {error}
        </p>
      )}

      <footer className="ax-intake__foot">
        {step > 0 ? (
          <button type="button" className="ax-intake__back" onClick={() => (setError(null), setStep(step - 1))} disabled={busy}>
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        ) : onCancel ? (
          <button type="button" className="ax-intake__back" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="ax-intake__next" onClick={next} disabled={busy}>
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : step < STEPS.length - 1 ? (
            <>
              Continue <ArrowRight className="h-4 w-4" />
            </>
          ) : initial ? (
            "Save my goals"
          ) : (
            <>
              Start the Academy <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </footer>
    </section>
  );
}

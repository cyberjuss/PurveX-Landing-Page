"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, X } from "lucide-react";
import {
  CERT_STATUSES,
  CERTS,
  MAX_ROLES,
  ROLES,
  START_LEVELS,
  type CertGoal,
  type CertId,
  type CertStatus,
  type RoleId,
  type StartLevel,
  type StudentProfile,
} from "@/lib/academy-certs";
import { academyFetch } from "@/lib/academy-client";
// Imported here, not in globals.css, so the styles always arrive with the component.
import "./academy-intake.css";

type Step = CertId | "roles" | "start";
const STEPS: Step[] = ["secplus", "cysa", "roles", "start"];
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
    setCerts((prev) => ({ ...prev, [id]: status === "studying" ? { status, examDate: prev[id]?.examDate } : { status } }));
    // Studying asks for an exam date, so it waits for Next.
    if (status !== "studying") timer.current = window.setTimeout(() => go(i + 1), ADVANCE_MS);
  }

  function toggleRole(id: RoleId) {
    setRoles((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : prev.length >= MAX_ROLES ? [prev[1], id] : [...prev, id]));
  }

  async function save() {
    if (busy || !start || !roles.length) return;
    setBusy(true);
    setError(null);
    try {
      const res = await academyFetch("/academy/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: { certs, otherCerts: initial?.otherCerts ?? "", roles, start, background } }),
      });
      const data = (await res.json().catch(() => ({}))) as { profile?: StudentProfile; error?: string };
      if (!res.ok || !data.profile) throw new Error(data.error || "Could not save. Try again.");
      onSaved(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save. Try again.");
      setBusy(false);
    }
  }

  const canNext = step === "roles" ? roles.length > 0 : step === "start" ? Boolean(start) : Boolean(certs[step]?.status);

  let title = "";
  let hint: string | null = null;
  let body: React.ReactNode = null;

  if (step === "secplus" || step === "cysa") {
    const goal = certs[step];
    title = CERTS[step].label;
    hint = "Where are you with it?";
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
            <span>Exam date (optional)</span>
            <input
              type="date"
              min={todayPlus(0)}
              max={todayPlus(730)}
              value={goal.examDate ?? ""}
              onChange={(e) => setCerts((prev) => ({ ...prev, [step]: { status: "studying", examDate: e.target.value || undefined } }))}
            />
          </label>
        )}
      </>
    );
  } else if (step === "roles") {
    title = "Your target role";
    hint = `Pick up to ${MAX_ROLES}`;
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
    title = "Your starting point";
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
          <span>Current job (optional)</span>
          <input type="text" maxLength={280} placeholder="Retail lead, student, Army signal" value={background} onChange={(e) => setBackground(e.target.value)} />
        </label>
      </>
    );
  }

  // The Next button shows only where a tap does not move on by itself.
  const showNext = step === "roles" || step === "start" || certs[step as CertId]?.status === "studying";

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
        <h1>{title}</h1>
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
              {last ? (initial ? "Save" : "Start") : "Next"} <ArrowRight className="h-4 w-4" />
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

"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Loader2, X } from "lucide-react";
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
import { daysUntil, passedExamDates, todayLocal } from "@/lib/academy-goals";

// Every intake answer on one screen, so changing an exam date is one edit,
// not a walk through all four intake questions. The first-time intake stays
// a step-by-step flow.
export function GoalsPanel({
  profile,
  onClose,
  onSaved,
}: {
  profile: StudentProfile;
  onClose: () => void;
  onSaved: (profile: StudentProfile) => void;
}) {
  const [certs, setCerts] = useState<Record<CertId, CertGoal>>(profile.certs);
  const [roles, setRoles] = useState<RoleId[]>(profile.roles);
  const [start, setStart] = useState<StartLevel>(profile.start);
  const [background, setBackground] = useState(profile.background);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chrome] = useState(() => {
    const root = document.querySelector(".academy-bg");
    const header = root?.querySelector("header");
    return {
      theme: root?.getAttribute("data-academy-theme") === "dark" ? "dark" : "light",
      top: header ? Math.round(header.getBoundingClientRect().bottom) : 0,
    };
  });
  const closeRef = useRef<HTMLButtonElement>(null);
  const today = todayLocal();
  const overdue = passedExamDates({ ...profile, certs }, today);

  useEffect(() => {
    // Lock <html> only, as the Coach does, so the sticky header stays put.
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const changed =
    JSON.stringify(certs) !== JSON.stringify(profile.certs) ||
    roles.join() !== profile.roles.join() ||
    start !== profile.start ||
    background.trim() !== profile.background;

  function toggleRole(id: RoleId) {
    setRoles((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : prev.length >= MAX_ROLES ? [prev[1], id] : [...prev, id]));
  }

  function setCert(id: CertId, next: CertGoal) {
    setCerts((prev) => ({ ...prev, [id]: next.status === "studying" ? next : { status: next.status } }));
  }

  async function save() {
    if (busy || !roles.length || !changed) return;
    setBusy(true);
    setError(null);
    try {
      const res = await academyFetch("/academy/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: { certs, otherCerts: profile.otherCerts, roles, start, background } }),
      });
      const data = (await res.json().catch(() => ({}))) as { profile?: StudentProfile; error?: string };
      if (!res.ok || !data.profile) throw new Error(data.error || "Unable to save your goals. Check your connection and try again.");
      onSaved(data.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save your goals. Check your connection and try again.");
      setBusy(false);
    }
  }

  return createPortal(
    <div className="ad-drawer-root" data-academy-theme={chrome.theme} style={{ ["--dr-top"]: `${chrome.top}px` } as CSSProperties}>
      <div className="ad-drawer__backdrop" onClick={onClose} />
      <aside className="ad-drawer" role="dialog" aria-modal="true" aria-label="Goals">
        <div className="ad-drawer__head">
          <span className="ad-drawer__title">Goals</span>
          <button ref={closeRef} type="button" className="ad-drawer__close" aria-label="Close" onClick={onClose}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="ad-drawer__body gp">

          <section className="gp-sec">
            <h3>Target role</h3>
            <p className="gp-hint">Pick up to two.</p>
            <div className="gp-chips">
              {ROLES.map((r) => (
                <button key={r.id} type="button" role="checkbox" aria-checked={roles.includes(r.id)} className="gp-chip" onClick={() => toggleRole(r.id)}>
                  {r.label}
                </button>
              ))}
            </div>
          </section>

          {CERT_IDS.map((id) => {
            const goal = certs[id];
            const late = overdue.includes(id);
            return (
              <section key={id} className="gp-sec">
                <div className="gp-sec__head">
                  <h3>{CERTS[id].full}</h3>
                  {goal.status === "studying" && goal.examDate && goal.examDate >= today && (
                    <span className="gp-count">
                      <b>{daysUntil(goal.examDate, today)}</b> {daysUntil(goal.examDate, today) === 1 ? "day left" : "days left"}
                    </span>
                  )}
                  {goal.status === "earned" && <span className="gp-count gp-count--done">Certified</span>}
                </div>
                {late && (
                  <div className="gp-late" role="status">
                    <p>
                      Your exam date, {new Date(`${goal.examDate}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })}, has passed. How did it go?
                    </p>
                    <div className="gp-late__actions">
                      <button type="button" onClick={() => setCert(id, { status: "earned" })}>
                        I passed
                      </button>
                      <button type="button" onClick={() => setCert(id, { status: "studying" })}>
                        Set a new date
                      </button>
                      <button type="button" onClick={() => setCert(id, { status: "planning" })}>
                        Not taken yet
                      </button>
                    </div>
                  </div>
                )}
                <div className="gp-chips" role="radiogroup" aria-label={CERTS[id].full}>
                  {CERT_STATUSES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="radio"
                      aria-checked={goal.status === s.id}
                      className="gp-chip"
                      onClick={() => setCert(id, { status: s.id, examDate: s.id === "studying" ? goal.examDate : undefined })}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
                {goal.status === "studying" && (
                  <label className="gp-field">
                    <span>Exam date · Optional</span>
                    <input
                      type="date"
                      min={today}
                      value={goal.examDate && goal.examDate >= today ? goal.examDate : ""}
                      onChange={(e) => setCert(id, { status: "studying", examDate: e.target.value || undefined })}
                    />
                  </label>
                )}
              </section>
            );
          })}

          <section className="gp-sec">
            <h3>Starting point</h3>
            <div className="gp-chips" role="radiogroup" aria-label="Starting point">
              {START_LEVELS.map((s) => (
                <button key={s.id} type="button" role="radio" aria-checked={start === s.id} className="gp-chip" onClick={() => setStart(s.id)}>
                  {s.label}
                </button>
              ))}
            </div>
            <label className="gp-field">
              <span>Current role · Optional</span>
              <input type="text" maxLength={280} placeholder="e.g. Retail manager, student, veteran" value={background} onChange={(e) => setBackground(e.target.value)} />
            </label>
          </section>
        </div>

        <div className="gp-foot">
          {error && (
            <p className="gp-error" role="alert">
              {error}
            </p>
          )}
          {!roles.length && <p className="gp-error">Choose at least one target role.</p>}
          <div className="gp-foot__row">
            <button type="button" className="gp-btn" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button type="button" className="gp-btn gp-btn--primary" onClick={() => void save()} disabled={busy || !changed || !roles.length}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save goals"}
            </button>
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}

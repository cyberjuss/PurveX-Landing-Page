"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, LogOut, Sparkles } from "lucide-react";
import { useCoach } from "@/components/academy/coach-context";
import { READINESS_PATH, useResults } from "@/lib/academy-client";
import { LEVELS, summarize } from "@/lib/academy-score";

export type AcademyStudent = { id: string; email: string | null; name: string | null };

const AccountContext = createContext<AcademyStudent | null>(null);

export function AcademyAccountProvider({ student, children }: { student: AcademyStudent; children: React.ReactNode }) {
  return <AccountContext.Provider value={student}>{children}</AccountContext.Provider>;
}

export function useAcademyAccount() {
  return useContext(AccountContext);
}

function firstToken(value: string, skipTiny = false) {
  const parts = value.trim().split(/[\s._-]+/).filter(Boolean);
  const pick = skipTiny
    ? parts.find((p) => p.length > 2 && !GENERIC.test(p)) ?? ""
    : parts[0];
  return pick ?? "";
}

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

const GENERIC = /^(test|user|demo|tmp|admin|dev|coach)$/i;

export function accountFirstName(student: AcademyStudent | null): string | null {
  if (!student) return null;
  const fromName = student.name ? firstToken(student.name) : "";
  if (fromName && !GENERIC.test(fromName)) return titleCase(fromName);
  const fromEmail = student.email ? firstToken(student.email.split("@")[0] ?? "", true) : "";
  if (fromEmail && !GENERIC.test(fromEmail)) return titleCase(fromEmail);
  return null;
}

export function accountInitials(student: AcademyStudent | null): string {
  if (!student) return "?";
  if (student.name) {
    const parts = student.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  }
  const local = student.email?.split("@")[0] ?? "";
  const bits = local.split(/[._-]+/).filter(Boolean);
  if (bits.length >= 2) return (bits[0][0] + bits[1][0]).toUpperCase();
  return (local.slice(0, 2) || "?").toUpperCase();
}

export function AcademyProfileMenu({ onSignOut }: { onSignOut: () => void }) {
  const student = useAcademyAccount();
  const readiness = summarize(useResults());
  const { setModalOpen, remaining, limit, enabled } = useCoach();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 16 });
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const firstName = accountFirstName(student);
  const initials = accountInitials(student);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const el = root.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setPos({ top: r.bottom + 8, right: Math.max(12, window.innerWidth - r.right) });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (root.current?.contains(t) || panel.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const dark = mounted && document.querySelector(".academy-bg")?.getAttribute("data-academy-theme") === "dark";
  const menu =
    open && mounted
      ? createPortal(
          <div
            ref={panel}
            role="dialog"
            aria-label="Account"
            className="ax-account"
            style={{
              position: "fixed",
              top: pos.top,
              right: pos.right,
              zIndex: 80,
              display: "flex",
              flexDirection: "column",
              width: 272,
              padding: "16px 16px 12px",
              background: dark ? "#1a2030" : "#fff",
              color: dark ? "#eef1f8" : "#0f172a",
              border: dark ? "1px solid rgba(255,255,255,0.14)" : "1px solid rgba(15,23,42,0.12)",
              boxShadow: dark ? "0 20px 48px -16px rgba(0,0,0,0.55)" : "0 18px 40px -20px rgba(15,23,42,0.28)",
            }}
          >
            <p className="rd-kicker">Account</p>
            {firstName && <strong>{firstName}</strong>}
            {student?.email && <span>{student.email}</span>}
            <Link href={READINESS_PATH} className="ax-account__score" onClick={() => setOpen(false)}>
              <span className="rd-kicker">Help Desk Readiness</span>
              <em>{readiness.finished === 0 ? "––" : readiness.overall}</em>
              <small>{LEVELS[readiness.level].label}</small>
              <b>
                Open report <ArrowRight className="h-3.5 w-3.5" />
              </b>
            </Link>
            {enabled && (
              <div className="ax-account__ask">
                <button
                  type="button"
                  className="ax-account__coach pc-launch"
                  onClick={() => {
                    setOpen(false);
                    setModalOpen(true);
                  }}
                >
                  <Sparkles className="h-4 w-4" /> Coach
                </button>
                {remaining != null && (
                  <small>
                    {remaining === 0 ? "None left today" : `${remaining} of ${limit} left today`}
                  </small>
                )}
              </div>
            )}
            <button type="button" className="ax-account__out" onClick={onSignOut}>
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>,
          document.body
        )
      : null;

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        className="ax-avatar"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((v) => !v)}
        title={student?.email ?? "Account"}
      >
        {initials}
      </button>
      {menu}
    </div>
  );
}

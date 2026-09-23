"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, Sparkles, X } from "lucide-react";
import { CoachChat, CoachHeader } from "@/components/academy/coach-chat";
import { useCoach } from "@/components/academy/coach-context";
import { READINESS_PATH, useResults } from "@/lib/academy-client";
import { summarize } from "@/lib/academy-score";

export function ReadinessNavLink() {
  const summary = summarize(useResults());
  const active = usePathname() === READINESS_PATH;
  return (
    <Link
      href={READINESS_PATH}
      className={`flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition ${
        active
          ? "border-[rgba(106,92,255,0.35)] bg-[rgba(106,92,255,0.08)] text-[#5546e0]"
          : "border-[var(--pvrx-border-light)] bg-white text-slate-600 hover:border-[rgba(106,92,255,0.35)] hover:text-[#5546e0]"
      }`}
    >
      <Gauge className="h-4 w-4" />
      <span className="hidden sm:inline">Readiness</span>
      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
        {summary.finished === 0 ? "—" : `${summary.overall}%`}
      </span>
    </Link>
  );
}

export function PurvexCoach() {
  const { modalOpen, setModalOpen } = useCoach();
  const pathname = usePathname();

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModalOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, setModalOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="pc-launch flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold text-white"
      >
        <Sparkles className="h-4 w-4" />
        <span className="hidden sm:inline">Coach</span>
      </button>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-center sm:p-6">
          <div className="pc-backdrop absolute inset-0" onClick={() => setModalOpen(false)} />
          <div
            role="dialog"
            aria-label="PurveX Coach"
            className="pc-panel pc-pop pc-modal relative flex flex-col overflow-hidden"
          >
            <CoachHeader>
              {pathname !== READINESS_PATH && (
                <Link href={READINESS_PATH} onClick={() => setModalOpen(false)} className="pc-icon" title="Full readiness report">
                  <Gauge className="h-4 w-4" />
                </Link>
              )}
              <button type="button" onClick={() => setModalOpen(false)} className="pc-icon" aria-label="Close coach">
                <X className="h-4 w-4" />
              </button>
            </CoachHeader>
            <CoachChat />
          </div>
        </div>
      )}
    </>
  );
}

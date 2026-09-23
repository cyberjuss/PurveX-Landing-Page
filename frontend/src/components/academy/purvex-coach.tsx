"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, X } from "lucide-react";
import { CoachChat, CoachHeader } from "@/components/academy/coach-chat";
import { useCoach } from "@/components/academy/coach-context";
import { READINESS_PATH } from "@/lib/academy-client";

export function PurvexCoach() {
  const { modalOpen, setModalOpen } = useCoach();
  const pathname = usePathname();

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModalOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, setModalOpen]);

  if (!modalOpen) return null;

  return (
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
  );
}

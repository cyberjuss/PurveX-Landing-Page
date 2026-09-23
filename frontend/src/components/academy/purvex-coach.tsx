"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, X } from "lucide-react";
import { CoachChat, CoachHeader } from "@/components/academy/coach-chat";
import { useCoach } from "@/components/academy/coach-context";
import { READINESS_PATH } from "@/lib/academy-client";

export function PurvexCoach() {
  const { modalOpen, setModalOpen } = useCoach();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModalOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [modalOpen, setModalOpen]);

  if (!mounted || !modalOpen) return null;

  return createPortal(
    <div data-pc-root="" className="pc-root" style={{ position: "fixed", inset: 0, zIndex: 90 }}>
      <style>{`
        [data-pc-root] .pc-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; padding: 24px 24px 20px; border-bottom: 1px solid var(--pc-line); }
        [data-pc-root] .pc-ask { display: block; margin: 8px 0 10px; }
        [data-pc-root] .pc-lede { display: block; margin: 0 0 28px; }
        [data-pc-root] .pc-prompts { list-style: none; margin: 0; padding: 0; }
        [data-pc-root] .pc-prompt { display: grid !important; grid-template-columns: 28px minmax(0, 1fr); gap: 14px; width: 100%; padding: 16px 0; text-align: left; }
        [data-pc-root] .pc-prompt__n { display: block; }
        [data-pc-root] .pc-prompt__body { display: flex !important; flex-direction: column; align-items: flex-start; gap: 4px; }
        [data-pc-root] .pc-prompt__act, [data-pc-root] .pc-prompt__title { display: block !important; }
        [data-pc-root] .pc-score { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
        [data-pc-root] .pc-score small { display: block; }
        [data-pc-root] .pc-compose__box textarea { resize: none; appearance: none; }
      `}</style>
      <div className="pc-backdrop" onClick={() => setModalOpen(false)} />
      <div
        role="dialog"
        aria-label="PurveX Coach"
        className="pc-panel"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(440px, 100vw)", height: "100dvh" }}
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
    </div>,
    document.body
  );
}

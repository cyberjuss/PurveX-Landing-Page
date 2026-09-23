"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { CoachChat, CoachHeader } from "@/components/academy/coach-chat";
import { useCoach } from "@/components/academy/coach-context";

export function PurvexCoach() {
  const { modalOpen, setModalOpen } = useCoach();
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

  const theme = document.querySelector(".academy-bg")?.getAttribute("data-academy-theme") === "dark" ? "dark" : "light";

  return createPortal(
    <div data-pc-root="" data-academy-theme={theme} className="pc-root" style={{ position: "fixed", inset: 0, zIndex: 90 }}>
      <style>{`
        [data-pc-root] .pc-head { display: flex; align-items: center; justify-content: space-between; }
        [data-pc-root] .pc-prompts { list-style: none; margin: 0; padding: 0; }
        [data-pc-root] .pc-prompt { display: block !important; width: 100%; text-align: left; }
        [data-pc-root] .pc-compose__box textarea { resize: none; appearance: none; }
      `}</style>
      <div className="pc-backdrop" onClick={() => setModalOpen(false)} />
      <div
        role="dialog"
        aria-label="PurveX Coach"
        className="pc-panel"
        style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(440px, 100vw)", height: "100dvh", background: "var(--pc-bg)", color: "var(--pc-text)" }}
      >
        <CoachHeader>
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

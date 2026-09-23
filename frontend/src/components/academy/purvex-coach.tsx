"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { CoachChat, CoachHeader } from "@/components/academy/coach-chat";
import { useCoach } from "@/components/academy/coach-context";

function academyChrome() {
  const root = document.querySelector(".academy-bg");
  const header = root?.querySelector("header");
  return {
    theme: root?.getAttribute("data-academy-theme") === "dark" ? "dark" : "light",
    top: header ? Math.round(header.getBoundingClientRect().bottom) : 0,
  };
}

export function PurvexCoach() {
  const { modalOpen, setModalOpen } = useCoach();
  const [mounted, setMounted] = useState(false);
  const [, setLayout] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!modalOpen) return;
    const sync = () => setLayout((n) => n + 1);
    sync();
    const root = document.querySelector(".academy-bg");
    const obs = root ? new MutationObserver(sync) : null;
    obs?.observe(root!, { attributes: true, attributeFilter: ["data-academy-theme"] });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModalOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      document.body.style.overflow = prev;
      obs?.disconnect();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [modalOpen, setModalOpen]);

  if (!mounted || !modalOpen) return null;

  const { theme, top } = academyChrome();

  return createPortal(
    <div
      data-pc-root=""
      data-academy-theme={theme}
      className="pc-root"
      style={{ position: "fixed", inset: 0, zIndex: 35, ["--pc-top"]: `${top}px` } as CSSProperties}
    >
      <style>{`
        [data-pc-root] .pc-head { display: flex; align-items: center; justify-content: space-between; }
        [data-pc-root] .pc-prompts { list-style: none; margin: 0; padding: 0; }
        [data-pc-root] .pc-prompt { display: block !important; width: 100%; text-align: left; }
        [data-pc-root] .pc-compose__box { display: flex; align-items: center; }
        [data-pc-root] .pc-compose__box input { appearance: none; -webkit-appearance: none; }
        [data-pc-root] button:active { transform: none; }
      `}</style>
      <div className="pc-backdrop" onClick={() => setModalOpen(false)} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="PurveX Coach"
        className="pc-panel"
        style={{
          position: "fixed",
          top,
          right: 0,
          bottom: 0,
          width: "min(380px, 100vw)",
          height: `calc(100dvh - ${top}px)`,
          background: "var(--pc-bg)",
          color: "var(--pc-text)",
        }}
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

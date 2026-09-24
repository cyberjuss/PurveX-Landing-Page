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
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
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
        [data-pc-root] .pc-tickets { list-style: none; margin: 0; padding: 0; }
        [data-pc-root] .pc-ticket { display: flex !important; align-items: center; width: 100%; text-align: left; }
        [data-pc-root] .pc-ticket i { display: block; width: 3px; height: 22px; }
        [data-pc-root] textarea.pc-dock__field {
          display: block !important; width: 100% !important; resize: none !important;
          appearance: none !important; border-radius: 0 !important;
          background: var(--pc-bg) !important; color: var(--pc-text) !important;
          border: 1px solid var(--pc-line) !important; box-shadow: none !important;
        }
        [data-pc-root] .pc-dock__send {
          display: flex !important; width: 100%; border-radius: 0 !important;
          background: var(--pc-text) !important; color: var(--pc-bg) !important;
        }
        [data-pc-root] .pc-dock__tools { display: flex; gap: 8px; margin: 0 0 10px; }
        [data-pc-root] .pc-dock__tool {
          flex: 1; height: 36px; border: 1px solid var(--pc-line); background: transparent;
          color: var(--pc-text-2);
        }
        [data-pc-root] .pc-shots { display: flex; gap: 8px; margin: 0 0 10px; }
        [data-pc-root] .pc-shot { position: relative; width: 72px; height: 52px; border: 1px solid var(--pc-line); }
        [data-pc-root] .pc-shot__img { display: block; width: 72px; height: 52px; object-fit: cover; }
        [data-pc-root] .pc-code { padding: 2px 6px; border: 1px solid var(--pc-line); background: var(--pc-bg-2); }
        [data-pc-root] .pc-term { display: block; border: 1px solid var(--pc-line); background: var(--pc-bg-2); }
        [data-pc-root] .pc-term pre { display: block; padding: 12px; margin: 0; }
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

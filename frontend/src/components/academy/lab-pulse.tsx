"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { academyFetch } from "@/lib/academy-client";
import { HostedLabMenu, useHostedLabAvailable } from "./hosted-lab-button";

type LabStatus = {
  connected: boolean;
  syncedAgo: string | null;
  stale: boolean;
  hasTicketObjects: boolean;
};

function tipFor(s: LabStatus | null) {
  if (!s || !s.connected) return "No lab has reported yet.";
  const when = s.syncedAgo ? `Your lab last reported ${s.syncedAgo}.` : "Your lab is connected.";
  if (!s.hasTicketObjects) return `${when} Ticket objects are not in yet.`;
  if (s.stale) return `${when} If that time does not move, run Build-Environment.ps1 -SyncOnly on the domain controller.`;
  return when;
}

const Monitor = () => (
  <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
    <rect x="3" y="4" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
    <path d="M8 20h8M12 16v4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

// The lab light on each mission: green when the lab is reporting. With a hosted
// lab it is also a button that opens the lab menu (open, stop, extend, start).
export function LabPulse() {
  const [state, setState] = useState<LabStatus | null>(null);
  const hosted = useHostedLabAvailable();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 16 });
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      academyFetch("/academy/api/lab-status")
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!cancelled && data && typeof data.connected === "boolean") setState(data);
        })
        .catch(() => {});
    load();
    const id = window.setInterval(load, 30000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  // Keep the menu under the icon, and close it on an outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const place = () => {
      const r = button.current?.getBoundingClientRect();
      if (r) setPos({ top: r.bottom + 8, right: Math.max(16, window.innerWidth - r.right) });
    };
    place();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!button.current?.contains(t) && !menu.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const connected = Boolean(state?.connected);
  const warn = Boolean(state?.stale || (state?.connected && !state.hasTicketObjects));
  const tone = !connected ? "off" : warn ? "stale" : "on";
  const tip = tipFor(state);

  if (!hosted) {
    return (
      <span className={`ad-lab ad-lab--${tone}`} tabIndex={0} aria-label={tip}>
        <Monitor />
        <span className="ad-lab__tip" role="tooltip">
          {tip}
        </span>
      </span>
    );
  }

  return (
    <>
      <button
        ref={button}
        type="button"
        className={`ad-lab ad-lab--${tone}`}
        aria-label={`Your lab. ${tip}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <Monitor />
        <span className="ad-lab__tip" role="tooltip">
          {tip} Click to open your lab.
        </span>
      </button>
      {open &&
        createPortal(
          <div ref={menu} className="hl-pop" style={{ top: pos.top, right: pos.right }} role="dialog" aria-label="Your lab">
            <HostedLabMenu />
          </div>,
          document.body
        )}
    </>
  );
}

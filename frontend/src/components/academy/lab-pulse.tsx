"use client";

import { useEffect, useState } from "react";
import { academyFetch } from "@/lib/academy-client";
import { LabMonitorIcon as Monitor, useHostedLab, useLabMenu } from "./hosted-lab-button";

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

// The lab light on each mission: green when the lab is reporting, so the
// student knows the lab check will work. With a hosted lab it also opens the
// same lab menu as the question strip.
export function LabPulse() {
  const [state, setState] = useState<LabStatus | null>(null);
  const { available } = useHostedLab();
  const { anchor, isOpen, toggle, popover } = useLabMenu<HTMLButtonElement>();

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

  const connected = Boolean(state?.connected);
  const warn = Boolean(state?.stale || (state?.connected && !state.hasTicketObjects));
  const tone = !connected ? "off" : warn ? "stale" : "on";
  const tip = tipFor(state);

  if (!available) {
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
        ref={anchor}
        type="button"
        className={`ad-lab ad-lab--${tone}`}
        aria-label={`Your lab. ${tip}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={toggle}
      >
        <Monitor />
        <span className="ad-lab__tip" role="tooltip">
          {tip} Click for your lab.
        </span>
      </button>
      {popover}
    </>
  );
}

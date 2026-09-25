"use client";

import { useEffect, useState } from "react";
import { academyFetch } from "@/lib/academy-client";

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

export function LabPulse() {
  const [state, setState] = useState<LabStatus | null>(null);

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
  const stale = Boolean(state?.stale);
  const tip = tipFor(state);

  return (
    <span
      className={`ad-lab${connected ? " ad-lab--on" : " ad-lab--off"}${stale ? " ad-lab--stale" : ""}`}
      tabIndex={0}
      aria-label={tip}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <rect x="3" y="4" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
        <path d="M8 20h8M12 16v4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
      <span className="ad-lab__tip" role="tooltip">
        {tip}
      </span>
    </span>
  );
}

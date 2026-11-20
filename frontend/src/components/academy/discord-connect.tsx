"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";

type Status = { configured: false } | { configured: true; linked: { username: string | null } | null; pro: boolean; inServer: boolean };

// Goals -> Community: link a Discord account so the Pro role and the Pro
// channels follow Range Pro by themselves. Hidden when the site has no
// Discord app set up. See lib/academy-discord-roles.ts.
export function DiscordConnect() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    academyFetch("/academy/api/discord")
      .then((r) => (r.ok ? (r.json() as Promise<Status>) : null))
      .then((s) => live && setStatus(s))
      .catch(() => live && setStatus(null));
    return () => {
      live = false;
    };
  }, []);

  if (!status || !status.configured) return null;

  async function connect() {
    setBusy(true);
    setError(null);
    const res = await academyFetch("/academy/api/discord", { method: "POST" }).catch(() => null);
    const body = res?.ok ? ((await res.json()) as { url?: string }) : null;
    if (body?.url) window.location.assign(body.url);
    else {
      setBusy(false);
      setError("Could not reach Discord. Try again in a minute.");
    }
  }

  async function disconnect() {
    setBusy(true);
    setError(null);
    const res = await academyFetch("/academy/api/discord", { method: "DELETE" }).catch(() => null);
    setBusy(false);
    if (res?.ok && status?.configured) setStatus({ ...status, linked: null });
    else setError("Could not disconnect. Try again in a minute.");
  }

  const linked = status.linked;
  return (
    <div className="gp-discord">
      {linked ? (
        <>
          <p>
            Connected to Discord as <strong>@{linked.username ?? "your account"}</strong>.{" "}
            {!status.inServer
              ? "Join the server with the link below and your role follows."
              : status.pro
                ? "You have the Pro role and the Pro channels."
                : "Get Range Pro and the Pro role and channels open up by themselves."}
          </p>
          <button type="button" className="gp-link gp-link--btn" onClick={() => void disconnect()} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : "Disconnect Discord"}
          </button>
        </>
      ) : (
        <>
          <p>Connect your Discord account and the Pro role and channels follow Range Pro by themselves, with nobody to message.</p>
          <button type="button" className="gp-btn gp-btn--primary gp-discord__connect" onClick={() => void connect()} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : "Connect Discord"}
          </button>
        </>
      )}
      {error && (
        <p className="gp-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

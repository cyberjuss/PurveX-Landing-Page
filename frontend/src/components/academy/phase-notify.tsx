"use client";

import { useEffect, useState } from "react";
import { BellRing, Check } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";

// "Notify me when it opens" for a coming-soon phase. Uses the email on the
// signed-in account, and lets the student take it back.
export function PhaseNotify({ phase }: { phase: string }) {
  const [state, setState] = useState<"loading" | "off" | "on" | "saving" | "error">("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let live = true;
    academyFetch("/academy/api/phase-notify")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { phases?: string[]; email?: string | null }) => {
        if (!live) return;
        setEmail(d.email ?? null);
        setState(d.phases?.includes(phase) ? "on" : "off");
      })
      .catch(() => live && setState("off"));
    return () => {
      live = false;
    };
  }, [phase]);

  async function join() {
    setState("saving");
    setMessage("");
    const r = await academyFetch("/academy/api/phase-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phase }),
    }).catch(() => null);
    if (r?.ok) return setState("on");
    const d = await r?.json().catch(() => null);
    setMessage(d?.error ?? "Couldn't save that. Try again.");
    setState("error");
  }

  async function leave() {
    setState("saving");
    const r = await academyFetch(`/academy/api/phase-notify?phase=${encodeURIComponent(phase)}`, { method: "DELETE" }).catch(() => null);
    setState(r?.ok ? "off" : "on");
  }

  if (state === "loading") return <div className="ax-notify" aria-busy="true" />;

  if (state === "on")
    return (
      <div className="ax-notify ax-notify--on" role="status">
        <Check className="h-4 w-4" aria-hidden />
        <p>
          You&apos;re on the list. We&apos;ll email {email ? <strong>{email}</strong> : "you"} when it opens.
        </p>
        <button type="button" className="ax-notify__undo" onClick={leave}>
          Remove me
        </button>
      </div>
    );

  return (
    <div className="ax-notify">
      <button type="button" className="rd-cta ax-notify__btn" onClick={join} disabled={state === "saving"}>
        <BellRing className="h-4 w-4" aria-hidden /> {state === "saving" ? "Saving…" : "Notify me when it opens"}
      </button>
      <p className="ax-notify__fine">
        {message || <>One email{email ? <> to <strong>{email}</strong></> : null}, nothing else.</>}
      </p>
    </div>
  );
}

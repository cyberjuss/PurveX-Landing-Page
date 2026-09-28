"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Server } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";

// The lab icon in the header: the student's own hosted domain controller.
// Start it, open it in a new tab, keep it running longer, stop it, or reset it.

type State = "none" | "starting" | "ready" | "stopping" | "stopped";
type Status = { available: boolean; state?: State; stopAt?: string | null; firstBoot?: boolean; error?: string };

const LABEL: Record<State, string> = {
  none: "Start my lab",
  starting: "Starting lab",
  ready: "Open lab",
  stopping: "Stopping lab",
  stopped: "Start lab",
};

const clock = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export function HostedLabButton() {
  const [s, setS] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const r = await academyFetch("/academy/api/hosted-lab").catch(() => null);
    const data: Status | null = r?.ok ? await r.json() : null;
    if (data) setS(data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Poll while the lab is changing state.
  const moving = s?.state === "starting" || s?.state === "stopping";
  useEffect(() => {
    if (!moving) return;
    const t = window.setInterval(() => void load(), 10_000);
    return () => window.clearInterval(t);
  }, [moving, load]);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setMenu(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [menu]);

  async function act(action: "start" | "stop" | "extend" | "reset") {
    setBusy(true);
    setError(null);
    setMenu(false);
    try {
      const r = await academyFetch("/academy/api/hosted-lab", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const data = await r.json();
      if (!r.ok) setError(data.error ?? "Something went wrong.");
      else setS({ available: true, ...data });
    } catch {
      setError("Could not reach CaseFile. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function open() {
    // Open the tab inside the click, so the browser does not block it, then point it at the lab.
    const tab = window.open("about:blank", "_blank");
    setBusy(true);
    setError(null);
    try {
      const r = await academyFetch("/academy/api/hosted-lab", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "open" }) });
      const data = await r.json();
      if (!r.ok || !data.url) {
        tab?.close();
        setError(data.error ?? "Could not open your lab.");
        void load();
        return;
      }
      if (tab) {
        tab.opener = null;
        tab.location.href = data.url;
      } else {
        window.location.href = data.url;
      }
    } catch {
      tab?.close();
      setError("Could not reach CaseFile. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!s?.available) return null;
  const state = s.state ?? "none";
  const primary = () => (state === "ready" ? open() : state === "none" || state === "stopped" ? act("start") : undefined);
  const waiting = busy || moving;

  return (
    <div ref={root} className="relative flex items-center">
      <button
        type="button"
        onClick={primary}
        disabled={waiting}
        title={state === "starting" && s.firstBoot ? "Your lab is being set up. The first start takes about 3 minutes." : LABEL[state]}
        className="flex h-9 items-center gap-2 rounded-l-md border border-[var(--pvrx-border-light)] bg-white px-2.5 text-sm font-semibold text-slate-600 transition hover:border-[rgba(106,92,255,0.35)] hover:text-[#5546e0] disabled:cursor-wait"
      >
        {waiting ? <Loader2 className="h-[18px] w-[18px] animate-spin" /> : <Server className={`h-[18px] w-[18px] ${state === "ready" ? "text-emerald-600" : ""}`} />}
        <span className="hidden sm:inline">{LABEL[state]}</span>
      </button>
      <button
        type="button"
        aria-label="Lab options"
        aria-expanded={menu}
        onClick={() => setMenu((v) => !v)}
        className="flex h-9 w-7 items-center justify-center rounded-r-md border border-l-0 border-[var(--pvrx-border-light)] bg-white text-slate-500 transition hover:text-[#5546e0]"
      >
        <ChevronDown className="h-4 w-4" />
      </button>

      {menu && (
        <div role="menu" className="absolute right-0 top-11 z-50 w-64 rounded-md border border-[var(--pvrx-border-light)] bg-white p-3 text-sm text-slate-700 shadow-lg">
          <p className="mb-2 text-xs text-slate-500">
            {state === "ready" && s.stopAt
              ? `Running. Stops on its own at ${clock(s.stopAt)}.`
              : state === "starting"
                ? s.firstBoot
                  ? "Setting up your lab. The first start takes about 3 minutes."
                  : "Starting. About a minute."
                : state === "stopped"
                  ? "Stopped. Your work is saved."
                  : state === "none"
                    ? "Your own PurveX Financial domain controller, in the browser."
                    : "Stopping."}
          </p>
          <div className="grid gap-1">
            {state === "ready" && (
              <button type="button" role="menuitem" className="rounded px-2 py-1.5 text-left hover:bg-slate-100" onClick={() => act("extend")}>
                Keep it running 3 more hours
              </button>
            )}
            {(state === "ready" || state === "starting") && (
              <button type="button" role="menuitem" className="rounded px-2 py-1.5 text-left hover:bg-slate-100" onClick={() => act("stop")}>
                Stop lab (work is saved)
              </button>
            )}
            {state !== "none" && (
              <button
                type="button"
                role="menuitem"
                className="rounded px-2 py-1.5 text-left text-red-700 hover:bg-red-50"
                onClick={() => {
                  if (window.confirm("Reset your lab? You get a fresh copy of PurveX Financial and every change you made in the lab is gone. Your CaseFile progress stays.")) void act("reset");
                }}
              >
                Reset to a fresh lab
              </button>
            )}
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="absolute right-0 top-11 z-40 w-64 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

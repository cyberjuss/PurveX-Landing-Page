"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown, Loader2, Server } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import "./hosted-lab.css";

// The student's own hosted domain controller: a button in the header and a
// panel on every challenge. Both read one shared status, so starting the lab
// from either updates both.

type State = "none" | "starting" | "ready" | "stopping" | "stopped";
type Status = { available: boolean; state?: State; stopAt?: string | null; firstBoot?: boolean };
type Snapshot = { status: Status | null; busy: boolean; error: string | null };

const LABEL: Record<State, string> = {
  none: "Start my lab",
  starting: "Starting lab",
  ready: "Open lab",
  stopping: "Stopping lab",
  stopped: "Start lab",
};

const clock = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// ---- shared store ---------------------------------------------------------

let snap: Snapshot = { status: null, busy: false, error: null };
const listeners = new Set<() => void>();
let loading: Promise<void> | null = null;
let poll = 0;

function set(patch: Partial<Snapshot>) {
  snap = { ...snap, ...patch };
  listeners.forEach((l) => l());
  const moving = snap.status?.state === "starting" || snap.status?.state === "stopping";
  if (moving && !poll) poll = window.setInterval(() => void load(), 10_000);
  if (!moving && poll) {
    window.clearInterval(poll);
    poll = 0;
  }
}

function load(): Promise<void> {
  loading ??= academyFetch("/academy/api/hosted-lab")
    .then((r) => (r.ok ? r.json() : null))
    .then((data: Status | null) => {
      if (data) set({ status: data });
    })
    .catch(() => {})
    .finally(() => {
      loading = null;
    });
  return loading;
}

async function act(action: "start" | "stop" | "extend" | "reset") {
  set({ busy: true, error: null });
  try {
    const r = await academyFetch("/academy/api/hosted-lab", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    const data = await r.json();
    if (!r.ok) set({ error: data.error ?? "Something went wrong." });
    else set({ status: { available: true, ...data } });
  } catch {
    set({ error: "Could not reach CaseFile. Try again." });
  } finally {
    set({ busy: false });
  }
}

async function open() {
  // Open the tab inside the click, so the browser does not block it, then point it at the lab.
  const tab = window.open("about:blank", "_blank");
  set({ busy: true, error: null });
  try {
    const r = await academyFetch("/academy/api/hosted-lab", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "open" }) });
    const data = await r.json();
    if (!r.ok || !data.url) {
      tab?.close();
      set({ error: data.error ?? "Could not open your lab." });
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
    set({ error: "Could not reach CaseFile. Try again." });
  } finally {
    set({ busy: false });
  }
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const SERVER_SNAP: Snapshot = { status: null, busy: false, error: null };

function useHostedLab() {
  const s = useSyncExternalStore(subscribe, () => snap, () => SERVER_SNAP);
  useEffect(() => {
    if (!snap.status) void load();
  }, []);
  const state: State = s.status?.state ?? "none";
  const moving = state === "starting" || state === "stopping";
  const primary = () => (state === "ready" ? open() : state === "none" || state === "stopped" ? act("start") : undefined);
  return { ...s, state, waiting: s.busy || moving, primary };
}

function statusLine(state: State, s: Status | null): string {
  if (state === "ready") return s?.stopAt ? `Running. Stops on its own at ${clock(s.stopAt)}.` : "Running.";
  if (state === "starting") return s?.firstBoot ? "Setting up your lab. The first start takes about 3 minutes." : "Starting. About a minute.";
  if (state === "stopped") return "Stopped. Your work is saved.";
  if (state === "stopping") return "Stopping.";
  return "Your own PurveX Financial domain controller, in the browser.";
}

// ---- header button --------------------------------------------------------

export function HostedLabButton() {
  const { status, state, waiting, error, primary } = useHostedLab();
  const [menu, setMenu] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setMenu(false);
    };
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [menu]);

  if (!status?.available) return null;
  const run = (a: "stop" | "extend" | "reset") => {
    setMenu(false);
    void act(a);
  };

  return (
    <div ref={root} className="relative flex items-center">
      <button
        type="button"
        onClick={primary}
        disabled={waiting}
        title={statusLine(state, status)}
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
          <p className="mb-2 text-xs text-slate-500">{statusLine(state, status)}</p>
          <div className="grid gap-1">
            {state === "ready" && (
              <button type="button" role="menuitem" className="rounded px-2 py-1.5 text-left hover:bg-slate-100" onClick={() => run("extend")}>
                Keep it running 3 more hours
              </button>
            )}
            {(state === "ready" || state === "starting") && (
              <button type="button" role="menuitem" className="rounded px-2 py-1.5 text-left hover:bg-slate-100" onClick={() => run("stop")}>
                Stop lab (work is saved)
              </button>
            )}
            {state !== "none" && (
              <button
                type="button"
                role="menuitem"
                className="rounded px-2 py-1.5 text-left text-red-700 hover:bg-red-50"
                onClick={() => {
                  if (window.confirm("Reset your lab? You get a fresh copy of PurveX Financial and every change you made in the lab is gone. Your CaseFile progress stays.")) run("reset");
                }}
              >
                Reset to a fresh lab
              </button>
            )}
          </div>
        </div>
      )}
      {error && !menu && (
        <p role="alert" className="absolute right-0 top-11 z-40 w-64 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

// ---- challenge panel ------------------------------------------------------

/** Shown at the top of every challenge, where the student needs the lab. */
export function HostedLabCard() {
  const { status, state, waiting, error, primary } = useHostedLab();
  if (!status?.available) return null;
  return (
    <section className="hl-card" aria-label="Your lab">
      <span className={`hl-card__icon hl-card__icon--${state}`} aria-hidden="true">
        {waiting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Server className="h-5 w-5" />}
      </span>
      <div className="hl-card__text">
        <p className="hl-card__kicker">Your lab</p>
        <p className="hl-card__title">PurveX Financial domain controller</p>
        <p className="hl-card__status">{statusLine(state, status)}</p>
        {error && <p className="hl-card__error" role="alert">{error}</p>}
      </div>
      <div className="hl-card__actions">
        <button type="button" className="hl-card__primary" onClick={primary} disabled={waiting}>
          {LABEL[state]}
        </button>
        {state === "ready" && (
          <button type="button" className="hl-card__secondary" onClick={() => void act("extend")} disabled={waiting}>
            3 more hours
          </button>
        )}
      </div>
    </section>
  );
}

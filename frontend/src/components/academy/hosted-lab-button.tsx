"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, LifeBuoy, Loader2, RotateCcw, Server } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import { openHelp } from "@/components/academy/get-help";
import "./hosted-lab.css";

// The student's own hosted domain controller: a button in the header and a
// panel on every challenge. Both read one shared status, so starting the lab
// from either updates both.

type State = "none" | "starting" | "ready" | "stopping" | "stopped";
/** locked: hosted labs exist here, but this account is on Explore and has not bought one. */
type Status = { available: boolean; locked?: boolean; state?: State; stopAt?: string | null; startedAt?: string | null; firstBoot?: boolean; instanceType?: string; linux?: boolean; error?: string; hoursUsed?: number; hoursLimit?: number | null; hoursLeft?: number | null };
type Snapshot = { status: Status | null; busy: boolean; error: string | null };

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
      // A status read carries its own failure when AWS cannot be reached. That
      // landed in status.error, which nothing rendered, so a lab that could not
      // be reached was indistinguishable from one that was simply off.
      if (data) set({ status: data, error: data.error ?? null });
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
    set({ error: "Could not reach Range. Try again." });
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
    set({ error: "Could not reach Range. Try again." });
  } finally {
    set({ busy: false });
  }
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const SERVER_SNAP: Snapshot = { status: null, busy: false, error: null };

export function useHostedLab() {
  const s = useSyncExternalStore(subscribe, () => snap, () => SERVER_SNAP);
  useEffect(() => {
    if (!snap.status) void load();
  }, []);
  const state: State = s.status?.state ?? "none";
  const moving = state === "starting" || state === "stopping";
  const primary = () => (state === "ready" ? open() : state === "none" || state === "stopped" ? act("start") : undefined);
  return { ...s, state, waiting: s.busy || moving, primary, available: Boolean(s.status?.available), locked: Boolean(s.status?.locked) };
}

/** For code outside React (the answer check): does this student have a hosted lab, and start it. */
export const hasHostedLab = () => Boolean(snap.status?.available);
export const startHostedLabNow = () => act("start");

// ---- one anchored menu, opened from the header, the question strip, or a mission's lab light ----

export function useLabMenu<T extends HTMLElement>() {
  const anchor = useRef<T>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [isOpen, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 16 });

  useEffect(() => {
    if (!isOpen) return;
    const place = () => {
      const r = anchor.current?.getBoundingClientRect();
      if (r) setPos({ top: r.bottom + 8, right: Math.max(16, window.innerWidth - r.right) });
    };
    place();
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!anchor.current?.contains(t) && !menu.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      anchor.current?.focus();
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
  }, [isOpen]);

  const popover = isOpen
    ? createPortal(
        <div ref={menu} className="hl-pop" style={{ top: pos.top, right: pos.right }} role="dialog" aria-label="Your lab">
          <HostedLabMenu />
        </div>,
        document.body
      )
    : null;
  return { anchor, isOpen, toggle: () => setOpen((v) => !v), popover };
}

const CHIP: Record<State, string> = { none: "Offline", starting: "Starting", ready: "Online", stopping: "Stopping", stopped: "Offline" };

/** Green online, amber while it changes, red offline: the lab light's colors. */
const labTone = (state: State) => (state === "ready" ? "on" : state === "starting" || state === "stopping" ? "wait" : "off");

// ---- header chip ----------------------------------------------------------

/** A small status chip in the top bar, on every page. Opens the lab menu. */
export function HostedLabButton() {
  const { available, state } = useHostedLab();
  const { anchor, isOpen, toggle, popover } = useLabMenu<HTMLButtonElement>();
  if (!available) return null;
  const tone = labTone(state);
  return (
    <>
      <button
        ref={anchor}
        type="button"
        onClick={toggle}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        title="Your lab"
        data-tour="lab"
        className="flex h-9 items-center gap-2 rounded-md border border-[var(--pvrx-border-light)] bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-[rgba(106,92,255,0.35)] hover:text-[#5546e0]"
      >
        <span className={`flex hl-lab--${tone}`}>
          <LabMonitorIcon size={20} />
        </span>
        <span className="hidden sm:inline">{CHIP[state]}</span>
      </button>
      {popover}
    </>
  );
}

/** The computer icon the lab light and the top-bar chip use. */
export const LabMonitorIcon = ({ size = 30 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <rect x="3" y="4" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
    <path d="M8 20h8M12 16v4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

// ---- setup tabs -----------------------------------------------------------

/** On the Home Lab setup tabs: hosted students skip building their own server. */
export function HostedLabSetupNote() {
  const { available, locked, state, busy, primary } = useHostedLab();
  // The one place the cloud lab is worth selling: this student is reading
  // the instructions for building a domain controller by hand, which is
  // exactly the work Pro does for them.
  if (locked) {
    return (
      <aside className="hl-note" aria-label="Range Pro builds this lab for you">
        <span className="hl-note__mark" aria-hidden="true">
          <Server className="h-5 w-5" />
        </span>
        <div className="hl-note__text">
          <p className="hl-note__title">Range Pro builds this lab for you.</p>
          <p className="hl-note__body">Pro gives you your own Windows domain on a server we run, one click away in a browser tab, with the ticket objects and Coach sync already in place. You can also follow this tab and build it yourself for free.</p>
        </div>
        <a href="/range/upgrade" className="hl-note__go">
          Get Pro
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </aside>
    );
  }
  if (!available) return null;
  return (
    <aside className="hl-note" aria-label="Your lab is hosted">
      <span className="hl-note__mark" aria-hidden="true">
        <Server className="h-5 w-5" />
      </span>
      <div className="hl-note__text">
        <p className="hl-note__title">Your lab is hosted. Skip this setup.</p>
        <p className="hl-note__body">Range already built PurveX Financial on your own server with the ticket objects and Coach sync in place, so read this tab to see what the setup does and then work in your hosted lab.</p>
      </div>
      <button type="button" className="hl-note__go" onClick={primary} disabled={busy || state === "starting" || state === "stopping"}>
        {state === "ready" ? "Open" : state === "starting" ? "Starting" : state === "stopping" ? "Stopping" : state === "stopped" ? "Resume lab" : "Start my lab"}
        {state === "ready" && <ArrowUpRight className="h-4 w-4" />}
      </button>
    </aside>
  );
}

// ---- challenge panel ------------------------------------------------------

// What a start goes through, with rough seconds from the click to the end of each step.
const FIRST_BOOT = [
  { label: "Starting the server", until: 45 },
  { label: "Booting Windows", until: 110 },
  { label: "Starting Active Directory", until: 160 },
  { label: "Linking to Range", until: 200 },
];
const RESUME = [
  { label: "Waking the server", until: 20 },
  { label: "Resuming Windows", until: 50 },
  { label: "Reconnecting to Range", until: 80 },
];

const SPECS: Record<string, string> = { "t3.small": "2 vCPU · 2 GB", "t3.medium": "2 vCPU · 4 GB", "t3.large": "2 vCPU · 8 GB", "t3.xlarge": "4 vCPU · 16 GB" };
// The Ubuntu server's size is fixed by var.linux_instance_type in Terraform.
const LINUX_SPEC = SPECS["t3.small"];


const PRIMARY: Record<State, string> = { none: "Start my lab", starting: "Starting", ready: "Open", stopping: "Stopping", stopped: "Resume lab" };

/** Seconds since this start, ticking once a second while the lab starts. */
function useElapsed(startedAt: string | null | undefined, on: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  const [seenAt] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [on]);
  const from = startedAt ? Math.min(Date.parse(startedAt), seenAt) : seenAt;
  return Math.max(0, (now - from) / 1000);
}

function StartTracker({ status }: { status: Status }) {
  const steps = status.firstBoot ? FIRST_BOOT : RESUME;
  const elapsed = useElapsed(status.startedAt, true);
  const total = steps[steps.length - 1].until;
  const next = steps.findIndex((s) => s.until > elapsed);
  const current = next === -1 ? steps.length - 1 : next;
  // Never shows done before the lab says so.
  const pct = Math.min(94, (elapsed / total) * 100);
  const left = Math.max(0, Math.ceil((total - elapsed) / 60));
  return (
    <div className="hl__track" aria-live="polite">
      <p className="hl__eta">
        <span>{steps[current].label}</span>
        <em>{elapsed > total ? "Almost there" : `About ${left} min left`}</em>
      </p>
      {/* A 4px rule with a 5% fill read as a stray dash, so the empty part of
          the track is drawn and the fill never shrinks below a visible stub. */}
      <div className="hl__bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label="Lab start progress">
        <span style={{ width: `max(6px, ${pct}%)` }} />
      </div>
      <ol className="hl__steps">
        {steps.map((s, i) => (
          <li key={s.label} className={i < current ? "is-done" : i === current ? "is-now" : ""}>
            <i aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ol>
    </div>
  );
}

/** The lab menu the lab icon opens on each mission: status, open, stop, start. */
export function HostedLabMenu() {
  const { status, state, waiting, busy, error, primary } = useHostedLab();
  if (!status?.available) return null;
  const spec = SPECS[status.instanceType ?? ""] ?? status.instanceType;
  // No lab yet means the next one is a pod, so describe what they will get.
  // An existing lab describes what it actually has, which for one built before
  // pods is a single machine.
  const bothMachines = state === "none" ? true : Boolean(status.linux);
  const legacySingle = state !== "none" && !status.linux;
  const note =
    state === "ready"
      ? status.stopAt ? `Stops on its own at ${clock(status.stopAt)}.` : "Running."
      : state === "starting"
        ? null
        : state === "stopped"
        ? "Stopped. Everything you changed is saved."
        : state === "stopping"
          ? "Saving your session."
          : state === "none"
            ? "A domain controller and an Ubuntu server on their own network. Both are ready in about 3 minutes and open in a browser tab."
            : null;

  return (
    <section className={`hl hl--menu hl--${state}`} aria-label="Your lab">
      <header className="hl__top">
        <span className="hl__mark" aria-hidden="true">
          <Server className="h-5 w-5" />
        </span>
        <div className="hl__id">
          <p className="hl__kicker">Your lab</p>
          <p className="hl__title">PurveX Financial</p>
        </div>
        <span className={`hl__state is-${labTone(state)}`}>
          <i aria-hidden="true" />
          {CHIP[state]}
        </span>
      </header>

      <dl className="hl__specs">
        <div>
          <dt>Domain</dt>
          <dd>purvexfinancial.local</dd>
        </div>
        <div>
          <dt>{bothMachines ? "Machines" : "Machine"}</dt>
          <dd className="hl__machines">
            <span>Windows Server 2022{spec ? ` · ${spec}` : ""}</span>
            {bothMachines && <span>Ubuntu 24.04 · {LINUX_SPEC}</span>}
          </dd>
        </div>
        {typeof status.hoursLimit === "number" && status.hoursLimit > 0 && (
          <div>
            <dt>This month</dt>
            <dd>
              {status.hoursUsed ?? 0} of {status.hoursLimit} hours used
            </dd>
          </div>
        )}
      </dl>

      {/* A lab built before pods existed is one machine, and nothing else on
          this panel would ever tell them why their Ubuntu server is missing. */}
      {legacySingle && (
        <p className="hl__legacy">
          This lab was built before the Ubuntu server existed. Reset it below to get both machines.
        </p>
      )}

      {state === "starting" && <StartTracker status={status} />}
      {state === "stopping" && (
        <div className="hl__bar hl__bar--idle" role="progressbar" aria-label="Stopping your lab">
          <span />
        </div>
      )}

      <div className="hl__foot">
        {note && <p className="hl__note">{note}</p>}
        <div className="hl__actions">
          {state !== "starting" && state !== "stopping" && (
            <button type="button" className="hl__go" onClick={primary} disabled={waiting}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {PRIMARY[state]}
              {state === "ready" && !busy && <ArrowUpRight className="h-4 w-4" />}
            </button>
          )}
          {state === "ready" && (
            <button type="button" className="hl__ghost" onClick={() => void act("stop")} disabled={waiting}>
              Stop
            </button>
          )}
        </div>
      </div>
      {error && (
        <p className="hl__error" role="alert">
          {error}
        </p>
      )}
      <div className="hl__links">
        {state !== "none" && (
          <button
            type="button"
            className="hl__link hl__link--warn"
            // Not disabled while starting: a boot that hangs is exactly when
            // someone needs this, and it terminates the instances by id.
            disabled={busy}
            onClick={() => {
              if (window.confirm("Reset your lab? You get a fresh copy of PurveX Financial and every change you made in the lab is gone. Your Range progress stays.")) void act("reset");
            }}
          >
            <RotateCcw className="h-3 w-3" aria-hidden /> Reset to a fresh lab
          </button>
        )}
        <button type="button" className="hl__link hl__link--end" onClick={() => openHelp("lab")}>
          <LifeBuoy className="h-3 w-3" aria-hidden /> Get help
        </button>
      </div>
    </section>
  );
}

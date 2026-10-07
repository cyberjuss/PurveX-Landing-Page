"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Check, Copy, Eye, Info, LifeBuoy, Loader2, RotateCcw, Server } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import { openHelp } from "@/components/academy/get-help";
import { LabBriefing, labBriefed, markLabBriefed } from "@/components/academy/lab-briefing";
import "./hosted-lab.css";

// The student's own hosted domain controller: a button in the header and a
// panel on every challenge. Both read one shared status, so starting the lab
// from either updates both.

type State = "none" | "starting" | "ready" | "stopping" | "stopped";
/** locked: hosted labs exist here, but this account is on Explore and has not bought one. */
type Status = { available: boolean; locked?: boolean; state?: State; stopAt?: string | null; startedAt?: string | null; firstBoot?: boolean; instanceType?: string; linux?: boolean; error?: string; hoursUsed?: number; hoursLimit?: number | null; hoursLeft?: number | null; sessionHours?: number };
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
          <p className="hl-note__title">Pro builds this lab for you.</p>
          <p className="hl-note__body">Pro gives you your own Windows domain in a browser tab, with the ticket objects and Coach sync already in place. Or follow this tab and build it yourself for free.</p>
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
        <p className="hl-note__body">Range already built PurveX Financial for you, ticket objects and Coach sync in place. Read this tab to see what the setup does, then work in your lab.</p>
      </div>
      <button type="button" className="hl-note__go" onClick={primary} disabled={busy || state === "starting" || state === "stopping"}>
        {state === "ready" ? "Open" : state === "starting" ? "Starting" : state === "stopping" ? "Stopping" : state === "stopped" ? "Resume" : "Start"}
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
const LINUX_SPEC = SPECS["t3.medium"];


const PRIMARY: Record<State, string> = { none: "Start", starting: "Starting", ready: "Open", stopping: "Stopping", stopped: "Resume" };

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
/**
 * The Ubuntu box's local sign-in.
 *
 * Guacamole signs them in, so the desktop never asks. `sudo` does, and the
 * domain-join lab needs it, so this is the only place the password exists for
 * them to read. Fetched on request rather than with the status, so it is not
 * sitting in the page for a whole session, and hidden again when the panel
 * closes.
 */
function LinuxSignIn() {
  const [creds, setCreds] = useState<{ username: string; password: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function reveal() {
    setLoading(true);
    setErr(null);
    try {
      const r = await academyFetch("/academy/api/hosted-lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "credentials" }),
      });
      const data = await r.json();
      if (!r.ok) setErr(data.error ?? "Could not read the sign-in.");
      else setCreds(data as { username: string; password: string });
    } catch {
      setErr("Could not reach Range. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!creds) return;
    try {
      await navigator.clipboard.writeText(creds.password);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setErr("Your browser blocked the copy. Select the password and copy it by hand.");
    }
  }

  // One quiet row until it is asked for. This used to be a bordered card with
  // a heading, an explanation and two labelled rows, which made the busiest
  // thing on the panel the one thing a student needs least often.
  return (
    <div className="hl__creds">
      <p className="hl__creds__row">
        <span>Sudo password</span>
        {creds ? (
          <>
            <code className="hl__creds__secret">{creds.password}</code>
            <button type="button" className="hl__creds__btn" onClick={copy}>
              {copied ? <Check className="h-3 w-3" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
              {copied ? "Copied" : "Copy"}
            </button>
          </>
        ) : (
          <button type="button" className="hl__creds__btn" onClick={reveal} disabled={loading}>
            {loading ? <Loader2 className="h-3 w-3 animate-spin" aria-hidden /> : <Eye className="h-3 w-3" aria-hidden />}
            Show
          </button>
        )}
      </p>
      {creds && (
        <p className="hl__creds__why">
          User <code>student</code>. The desktop is already signed in.
        </p>
      )}
      {err && <p className="hl__creds__err" role="alert">{err}</p>}
    </div>
  );
}

export function HostedLabMenu() {
  const { status, state, waiting, busy, error, primary } = useHostedLab();
  // "start" stands in front of the first start; "read" is the same briefing
  // reopened from the footer link once they have been through it.
  const [brief, setBrief] = useState<null | "start" | "read">(null);
  if (!status?.available) return null;
  // Nobody should meet a live Windows domain cold. The first start goes
  // through the briefing; every later one does not.
  const onPrimary = () => {
    if (state === "none" && !labBriefed()) setBrief("start");
    else primary();
  };
  const startFromBrief = () => {
    markLabBriefed();
    setBrief(null);
    primary();
  };
  const spec = SPECS[status.instanceType ?? ""] ?? status.instanceType;
  // No lab yet means the next one is a pod, so describe what they will get.
  // An existing lab describes what it actually has, which for one built before
  // pods is a single machine.
  const bothMachines = state === "none" ? true : Boolean(status.linux);
  const legacySingle = state !== "none" && !status.linux;
  const note =
    state === "ready"
      ? status.stopAt ? `Stops at ${clock(status.stopAt)}.` : "Running."
      : state === "starting" || state === "stopped" || state === "stopping"
        ? null
        : state === "none"
          ? "A Windows domain controller and an Ubuntu desktop, yours alone. Ready in a few minutes, in a browser tab."
          : null;

  return (
    <section className={`hl hl--menu hl--${state}`} aria-label="Your lab">
      <header className="hl__top">
        <div className="hl__id">
          <p className="hl__title">PurveX Financial</p>
          <p className="hl__domain">purvexfinancial.local</p>
        </div>
      </header>

      {/* The lab is two machines, so they are the subject rather than a row in
          a spec table. One tile each, side by side, the way they actually sit. */}
      <ul className="hl__rigs">
        <li>
          <em>DC</em>
          <strong>Windows Server 2022</strong>
          <small>{spec ?? ""}</small>
        </li>
        {bothMachines && (
          <li>
            <em>DESKTOP</em>
            <strong>Ubuntu 24.04</strong>
            <small>{LINUX_SPEC}</small>
          </li>
        )}
      </ul>

      {state === "ready" && Boolean(status.linux) && <LinuxSignIn />}

      {/* A lab built before pods existed is one machine, and nothing else on
          this panel would ever tell them why their Ubuntu server is missing. */}
      {legacySingle && (
        <p className="hl__legacy">
          This lab predates the Ubuntu server. Reset it to get both machines.
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
            <button type="button" className="hl__go" onClick={onPrimary} disabled={waiting}>
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
      {typeof status.hoursLimit === "number" && status.hoursLimit > 0 && (
        <p className="hl__hours">
          <span>Hours</span>
          <span
            className="hl__meter"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={status.hoursLimit}
            aria-valuenow={status.hoursUsed ?? 0}
            aria-label={`${status.hoursUsed ?? 0} of ${status.hoursLimit} lab hours used this month`}
          >
            <i style={{ width: `${Math.min(100, ((status.hoursUsed ?? 0) / status.hoursLimit) * 100)}%` }} />
          </span>
          <em>
            {String(status.hoursUsed ?? 0).padStart(2, "0")}<i>/{status.hoursLimit}</i>
          </em>
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
              if (window.confirm("Reset your lab? You get a fresh PurveX Financial. Everything you changed in the lab is gone. Your Range progress stays.")) void act("reset");
            }}
          >
            <RotateCcw className="h-3 w-3" aria-hidden /> Reset
          </button>
        )}
        <button type="button" className="hl__link" onClick={() => setBrief("read")}>
          <Info className="h-3 w-3" aria-hidden /> How it works
        </button>
        <button type="button" className="hl__link hl__link--end" onClick={() => openHelp("lab")}>
          <LifeBuoy className="h-3 w-3" aria-hidden /> Help
        </button>
      </div>
      {brief && (
        <LabBriefing
          sessionHours={status.sessionHours ?? 3}
          monthlyHours={typeof status.hoursLimit === "number" && status.hoursLimit > 0 ? status.hoursLimit : null}
          onStart={brief === "start" ? startFromBrief : undefined}
          starting={busy}
          onClose={() => {
            // Read once, even if they back out of starting: they have seen it,
            // and a dialog that keeps reappearing in front of Start is a wall.
            if (brief === "start") markLabBriefed();
            setBrief(null);
          }}
        />
      )}
    </section>
  );
}

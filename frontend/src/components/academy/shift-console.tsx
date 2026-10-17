"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  AlertTriangle, ArrowLeft, ArrowRight, Check, Clock, Loader2, LifeBuoy, Power, RefreshCw, ShieldAlert,
  Lock, Unlock, KeyRound, UserPlus, UserMinus, UserX, UserCog, ArrowLeftRight, FolderTree, SprayCan, Target,
  Crown, DoorOpen, BellOff, ShieldOff, ShieldCheck, ShieldX, Ticket, Search, Share2, Server, EyeOff, Infinity as InfinityIcon,
  Wrench, Info, ArrowUpRight, FileText, X, Zap, Inbox, CheckCircle2, Radar, Hash, GraduationCap,
} from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import { startHostedLabNow, useHostedLab } from "@/components/academy/hosted-lab-button";
import { DeskLayer, DeskSummary, type DeskEvent, type DeskReport } from "./shift-desk";
import { useCoach } from "./coach-context";
import "./shift.css";

type Sev = "P1" | "P2" | "P3";
type Incident = {
  uid: string;
  defId: string;
  kind: "alert" | "ticket";
  severity: Sev;
  from: string;
  title: string;
  brief: string;
  why: string | null;
  attack: { id: string; name: string } | null;
  diagnosisPrompt: string;
  arriveSec: number;
  deadlineSec: number;
  acknowledged: boolean;
  resolved: boolean;
  escalated: boolean;
  onTime: boolean;
  overdue: boolean;
  hintsUsed: number;
  hintsTotal: number;
  nextHintCostPct: number | null;
  shownHints: string[];
  diagnosis: string;
  responseSaved: boolean;
  submitted?: boolean;
};
/** Tier 2's read of an escalation (Coach as the tier 2 lead), from the shift report. */
type Review = { score: number; grade: string; handoff: string; couldHave: string; by: "coach" | "facts" };

type Report = {
  totalScore: number;
  maxScore: number;
  resolvedCount: number;
  onTimeCount: number;
  headline: string;
  habit: string;
  escalatedCount: number;
  incidents: { title: string; severity: string; resolved: boolean; escalated: boolean; touched: boolean; onTime: boolean; noHarm: boolean; diagnosisRight: boolean; hintsUsed: number; score: number; max: number; review?: Review | null }[];
} & Partial<DeskReport>;
type Shift = {
  id: string;
  startedAt: string;
  endsAt: string;
  phase: number;
  level: number;
  mix?: "tickets" | "alerts" | null;
  status: "active" | "done";
  incidents: Incident[];
  /** Calls, status requests and urgent asks that have arrived. */
  desk?: DeskEvent[];
  report: Report | null;
};
type LabState = "none" | "starting" | "ready" | "stopping" | "stopped";

/** First letter up: "work it first" reads as a label, "Work it first". */
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

/** "now", "45s", "4m": how long ago, short enough for a queue row. */
const ago = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return s < 10 ? "now" : s < 60 ? `${s}s` : `${Math.floor(s / 60)}m`;
};
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const skillOf = (kind: "alert" | "ticket") => (kind === "ticket" ? "troubleshooting" : "security");
const incNo = (idx: number) => `INC-${2101 + idx}`;
/** "Marcus Lee, Operations Analyst" -> { name, role }. Alerts have no role. */
function sender(inc: Incident): { name: string; role: string | null } {
  if (inc.kind === "alert") return { name: inc.from, role: null };
  const [name, ...rest] = inc.from.split(",");
  return { name: name.trim(), role: rest.join(",").trim() || null };
}
function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

function useNow(on: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [on]);
  return now;
}

const emptySubscribe = () => () => {};
/** True only after hydration on the client, without a setState-in-effect. */
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
/** The academy's current theme, so the portaled console matches the portal. */
function useAcademyTheme(): "light" | "dark" {
  return useSyncExternalStore(
    emptySubscribe,
    () => (document.documentElement.dataset.academyTheme === "dark" ? "dark" : "light"),
    () => "light"
  );
}

// The console is a full-screen overlay. The academy wraps pages in an animated
// container whose transform makes it the containing block for position:fixed, which
// would trap the overlay inside the content column. Portalling to <body> escapes it.
export function ShiftConsole() {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(<ShiftConsoleInner />, document.body);
}

function ShiftConsoleInner() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [shift, setShift] = useState<Shift | null>(null);
  const [labState, setLabState] = useState<LabState>("none");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finishing = useRef(false);
  // The hosted-lab store leads the shift route by a few seconds after a start,
  // so it decides whether the lab is up.
  const lab = useHostedLab();
  const labNow: LabState = lab.status ? lab.state : labState;
  // A shift asked for while the lab is down waits for it: "Start another
  // shift" on the report, or "Start my lab" on the intro, starts the lab and
  // then the shift on its own the moment the lab is Online.
  const [queued, setQueued] = useState(false);
  const [leftReport, setLeftReport] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await academyFetch("/academy/api/shift");
      const data = await r.json();
      setAvailable(Boolean(data.available));
      if (data.available) {
        // Keep an active shift through a transient empty/failed poll instead of
        // dropping the student back to the intro. A real end returns status "done".
        setShift((prev) => data.shift ?? (prev && prev.status === "active" ? prev : null));
        setLabState((data.labState as LabState) ?? "none");
      }
    } catch {
      setAvailable(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const active = shift?.status === "active";
  const now = useNow(active);

  // Poll while active for new arrivals, and on the intro to catch the lab coming Online.
  const polling = active || (available === true && (shift?.status !== "done" || queued));
  useEffect(() => {
    if (!polling) return;
    const t = window.setInterval(() => void load(), active ? 3000 : 5000);
    return () => window.clearInterval(t);
  }, [polling, active, load]);

  const post = useCallback(async (payload: Record<string, unknown>, opts?: { silent?: boolean }) => {
    setBusy(true);
    if (!opts?.silent) setError(null);
    try {
      const r = await academyFetch("/academy/api/shift", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await r.json();
      if (!r.ok) {
        // A background action (like the auto-ack on open) should not throw a banner.
        if (!opts?.silent) setError(data.error ?? "Something went wrong.");
        return null;
      }
      if (data.shift) setShift(data.shift);
      return data;
    } catch {
      setError("Could not reach your shift. Try again.");
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  // End the shift the moment the clock runs out.
  useEffect(() => {
    if (!active || !shift) return;
    const left = Date.parse(shift.endsAt) - Date.now();
    const fire = () => {
      if (!finishing.current) {
        finishing.current = true;
        void post({ action: "finish" });
      }
    };
    if (left <= 0) {
      fire();
      return;
    }
    const t = window.setTimeout(fire, left);
    return () => window.clearTimeout(t);
  }, [active, shift, post]);

  const theme = useAcademyTheme();

  // The lab is started once per queued shift, and only from a state AWS will
  // start from: a lab still stopping (hibernating) is waited out first, since
  // starting it mid-stop is refused.
  const kicked = useRef(false);
  const queueShift = useCallback(async () => {
    kicked.current = false;
    setQueued(true);
    setLeftReport(true);
    void load();
  }, [load]);
  useEffect(() => {
    if (!queued || kicked.current || (labNow !== "stopped" && labNow !== "none")) return;
    kicked.current = true;
    void startHostedLabNow().then(() => load());
  }, [queued, labNow, load]);
  const again = useCallback(() => {
    if (labNow === "ready") void post({ action: "start" });
    else void queueShift();
  }, [labNow, post, queueShift]);
  useEffect(() => {
    if (!queued || labNow !== "ready" || busy) return;
    setQueued(false);
    void post({ action: "start" });
  }, [queued, labNow, busy, post]);

  if (available === null)
    return (
      <div className="shift-app shift-app--center" data-academy-theme={theme}>
        <p className="sh-loading"><Loader2 className="h-4 w-4 animate-spin" /> Loading your shift…</p>
      </div>
    );

  if (!available)
    return (
      <div className="shift-app shift-app--center" data-academy-theme={theme}>
        <div className="sh-gate-card">
          <h1>Shift</h1>
          <p>Shifts need a hosted lab and that comes with Range Pro. Email support@purvex.io if you already have it.</p>
        </div>
      </div>
    );

  if (shift?.status === "done" && shift.report && !leftReport) return <ShiftReport theme={theme} report={shift.report} onAgain={again} busy={busy} error={error} />;
  if (active && shift) return <ActiveShift theme={theme} shift={shift} now={now} busy={busy} error={error} post={post} />;

  return <ShiftIntro theme={theme} labState={labState} busy={busy} error={error} queued={queued} onStart={() => post({ action: "start" })} onStartLab={queueShift} onRefresh={load} />;
}

// ---- intro (with the lab-online gate) -------------------------------------

function ShiftIntro({ theme, labState, busy, error, queued, onStart, onStartLab, onRefresh }: { theme: "light" | "dark"; labState: LabState; busy: boolean; error: string | null; queued: boolean; onStart: () => void; onStartLab: () => void; onRefresh: () => void }) {
  // Both the shift route and the hosted-lab store know the lab's state, and
  // they disagree for a few seconds after a start. The store leads because it
  // updates the moment a start is accepted; the shift route's copy covers the
  // first paint, before the store has loaded.
  const lab = useHostedLab();
  const state: LabState = lab.status ? lab.state : labState;
  const online = state === "ready";
  const starting = state === "starting";
  const labWord = online ? "Online" : starting ? "Starting…" : "Offline";
  // act() reports a refusal by writing to the store rather than throwing, so a
  // start that is denied has to be read from there. Without this the button
  // silently did nothing and the reason was never shown.
  const shown = error ?? lab.error;
  // Starting the lab here also queues the shift, so one click opens the desk.
  const startLab = onStartLab;
  return (
    <div className="shift-app shift-app--center" data-academy-theme={theme}>
      <Link href="/range" className="sh-corner-home" aria-label="Back to Range"><ArrowLeft className="h-4 w-4" /></Link>
      <div className="sh-intro">
        <div className="sh-brand">
          <span className="sh-logo">P</span>
          <div>
            <p className="sh-kicker">PurveX Financial · Security Operations</p>
            <h1>Start your shift</h1>
          </div>
        </div>
        <p className="sh-lede">
          You are on the desk for 30 minutes. Real attacks and tickets fire into your own lab on their own. Work them highest priority first, and close as many as you can before the shift ends.
        </p>

        <ul className="sh-rules">
          <li>
            <span className="sh-rules__ic"><ShieldAlert className="h-4 w-4" /></span>
            <strong>Real attacks hit your own lab</strong>
            <small>Nothing is scripted for show. The same events land in your domain controller.</small>
          </li>
          <li>
            <span className="sh-rules__ic"><Clock className="h-4 w-4" /></span>
            <strong>One 30-minute window, worked by priority</strong>
            <small>No ticket has its own timer. P1 before P2 before P3. Anything still open when the shift ends scores nothing.</small>
          </li>
          <li>
            <span className="sh-rules__ic"><LifeBuoy className="h-4 w-4" /></span>
            <strong>Coach thinks it through with you</strong>
            <small>Ask what to check next. Coach asks questions back and never hands you the answer.</small>
          </li>
        </ul>

        {/* Lab state and the action on it belong together: reading "Offline" and
            then hunting for a button is what made this feel broken. */}
        <div className={`sh-lab sh-lab--${online ? "on" : starting ? "wait" : "off"}`}>
          <p className="sh-labline">
            <span className={`sh-labdot sh-labdot--${online ? "on" : starting ? "wait" : "off"}`} />
            Your lab is <strong>{labWord}</strong>
          </p>
          <p className="sh-lab__note">
            {online
              ? "The desk is ready. Tickets start arriving the moment you begin."
              : starting
                ? queued
                  ? "Your shift starts on its own the moment the lab is Online. First boot takes a couple of minutes."
                  : "First boot takes a couple of minutes. This updates on its own."
                : state === "stopping" && queued
                  ? "Your lab is still saving from its last stop. It starts again as soon as that finishes, then your shift begins."
                : lab.locked
                  ? "Shifts need a hosted lab and that comes with Range Pro."
                  : lab.notEnabled
                    ? "Your cloud lab is not switched on for this account yet. Email support@purvex.io and we will turn it on."
                    : "Shifts run in your own lab. Start it and the desk opens."}
          </p>

          {shown && <p className="sh-error">{shown}</p>}

          {online ? (
            <button type="button" className="sh-go" disabled={busy} onClick={onStart}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Start shift <ArrowRight className="h-4 w-4" />
            </button>
          ) : starting ? (
            <button type="button" className="sh-go sh-go--ghost" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" /> Refresh status
            </button>
          ) : lab.locked ? (
            <Link href="/range/upgrade" className="sh-go">
              See Range Pro <ArrowRight className="h-4 w-4" />
            </Link>
          ) : lab.notEnabled ? (
            <a href="mailto:support@purvex.io?subject=Switch%20on%20my%20cloud%20lab" className="sh-go">
              Email support <ArrowRight className="h-4 w-4" />
            </a>
          ) : (
            <button type="button" className="sh-go" disabled={lab.waiting} onClick={startLab}>
              {lab.waiting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />} Start my lab
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- active shift: the queue ----------------------------------------------

/** What each priority means on the desk, shown where a per-ticket timer used to be. */
const PRIORITY_NOTE: Record<"P1" | "P2" | "P3", string> = {
  P1: "Critical · work it first",
  P2: "High · after any P1",
  P3: "Routine · when the queue allows",
};

const SEV_CLASS: Record<Sev, string> = { P1: "sh-sev--p1", P2: "sh-sev--p2", P3: "sh-sev--p3" };

// A cyber/tech glyph per incident type, same lucide family as the labs and drills,
// so the queue reads at a glance. Falls back to a shield for anything unmapped.
type IconType = typeof ShieldAlert;
const INCIDENT_ICON: Record<string, IconType> = {
  "lockout-ticket": Lock,
  "wrong-disable": UserX,
  "pwd-expired": KeyRound,
  "wrong-ou": FolderTree,
  "access-request": UserPlus,
  offboarding: UserMinus,
  "dept-transfer": ArrowLeftRight,
  spray: SprayCan,
  "targeted-bruteforce": Target,
  "rogue-admin": UserCog,
  "domain-admins": Crown,
  "compromised-account": ShieldAlert,
  "backdoor-account": DoorOpen,
  "false-alarm": BellOff,
  "weak-policy": ShieldOff,
  "reversible-enc": Unlock,
  "preauth-exposure": Ticket,
  kerberoast: KeyRound,
  "pwd-notreqd": ShieldX,
  delegation: Share2,
  "never-expires": InfinityIcon,
  "rogue-computer": Server,
  "audit-disabled": EyeOff,
  "admin-pso": ShieldCheck,
  "threat-hunt-spn": Search,
};
const iconFor = (defId: string): IconType => INCIDENT_ICON[defId] ?? ShieldAlert;

function ActiveShift({ theme, shift, now, busy, error, post }: { theme: "light" | "dark"; shift: Shift; now: number; busy: boolean; error: string | null; post: (p: Record<string, unknown>, opts?: { silent?: boolean }) => Promise<Record<string, unknown> | null> }) {
  const start = Date.parse(shift.startedAt);
  const end = Date.parse(shift.endsAt);
  const left = Math.max(0, Math.round((end - now) / 1000));
  const elapsedPct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));

  const total = shift.incidents.length;
  const handled = shift.incidents.filter((i) => i.resolved || i.escalated).length;
  // What is still open, by priority: the pressure the header shows.
  const openBy = { P1: 0, P2: 0, P3: 0 };
  for (const i of shift.incidents) if (!i.resolved && !i.escalated) openBy[i.severity] += 1;
  // How long ago each incident landed, from the shift's own clock.
  const ageOf = (inc: Incident) => ago(Math.max(0, now - start - inc.arriveSec * 1000));
  const escalated = shift.incidents.filter((i) => i.escalated).length;

  // Stable incident numbers follow the server's creation order.
  const numOf = new Map(shift.incidents.map((i, idx) => [i.uid, incNo(idx)]));

  // Order: unresolved by severity first, then resolved.
  const order = { P1: 0, P2: 1, P3: 2 };
  const done = (i: Incident) => i.resolved || i.escalated;
  const queue = [...shift.incidents].sort((a, b) => (done(a) === done(b) ? order[a.severity] - order[b.severity] : done(a) ? 1 : -1));

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = queue.find((i) => i.uid === selectedId) ?? queue.find((i) => !done(i)) ?? queue[0] ?? null;

  // The open incident to work next: highest priority, then oldest, skipping
  // the one already in front of the student.
  const nextUp = queue.filter((i) => !done(i) && i.uid !== selected?.uid).sort((a, b) => order[a.severity] - order[b.severity] || a.arriveSec - b.arriveSec)[0] ?? null;

  // Keys, so the queue can be worked without the mouse: J and K (or the
  // arrows) move through it, N jumps to the next priority. Never while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.metaKey || e.ctrlKey || e.altKey || (t && (t.closest("input, textarea, select, [contenteditable=true]") || t.closest(".sdk")))) return;
      const at = Math.max(0, queue.findIndex((i) => i.uid === selected?.uid));
      const go = (i: Incident | undefined) => {
        if (!i) return;
        e.preventDefault();
        setSelectedId(i.uid);
        document.querySelector(`[data-uid="${i.uid}"]`)?.scrollIntoView({ block: "nearest" });
      };
      if (e.key === "j" || e.key === "ArrowDown") go(queue[Math.min(queue.length - 1, at + 1)]);
      else if (e.key === "k" || e.key === "ArrowUp") go(queue[Math.max(0, at - 1)]);
      else if (e.key === "n" || e.key === "N") go(nextUp ?? undefined);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // A new incident landing announces itself: a toast with its priority that
  // opens it in one click, and a flash on its row. The first load is not news.
  const known = useRef<Set<string> | null>(null);
  const [fresh, setFresh] = useState<Incident[]>([]);
  useEffect(() => {
    const ids = new Set(shift.incidents.map((i) => i.uid));
    if (known.current) {
      const landed = shift.incidents.filter((i) => !known.current!.has(i.uid));
       
      if (landed.length) setFresh((f) => [...landed, ...f].slice(0, 3));
    }
    known.current = ids;
  }, [shift.incidents]);
  useEffect(() => {
    if (!fresh.length) return;
    const t = window.setTimeout(() => setFresh((f) => f.slice(0, -1)), 6000);
    return () => window.clearTimeout(t);
  }, [fresh]);
  const freshIds = new Set(fresh.map((f) => f.uid));

  // Coach knows which incident is open, so "help me" means this one, and it
  // coaches as the senior analyst at the next desk without doing the work.
  const { setPlace } = useCoach();
  const placeTitle = selected ? `${selected.severity} ${selected.title}` : "the queue";
  useEffect(() => {
    setPlace({ kind: "shift", title: placeTitle, at: `${handled} of ${total} closed, ${clock(left)} left on the shift` });
    // Only the incident in focus changes what Coach should know; the clock is context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeTitle, setPlace]);
  useEffect(() => () => setPlace(null), [setPlace]);

  return (
    <div className="shift-app" data-academy-theme={theme}>
      <header className="sh-top">
        <div className="sh-brand">
          <Link href="/range" className="sh-top__home" aria-label="Back to Range" title="Back to Range (your shift keeps running)">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="sh-logo">P</span>
          <div className="sh-top__title">
            <p className="sh-top__name">Night shift · PurveX Financial</p>
            <p className="sh-top__sub">
              Help desk and SOC tier 1 · Level {shift.level}
              {shift.mix ? ` · ${shift.mix === "tickets" ? "Heavy on tickets tonight" : "Heavy on alerts tonight"}` : ""}
            </p>
          </div>
        </div>
        <div className="sh-pressure" aria-label="What is open on the queue">
          {(["P1", "P2", "P3"] as const).map((sev) => (
            <span key={sev} className={`sh-pressure__sev is-${sev.toLowerCase()}${openBy[sev] ? "" : " is-zero"}`} title={`${openBy[sev]} ${sev} open`}>
              <i aria-hidden />
              {sev}
              <b>{openBy[sev]}</b>
            </span>
          ))}
          <span className="sh-pressure__sep" aria-hidden />
          <span className="sh-pressure__stat">
            <b>{handled}</b>/{total} closed
          </span>
          {escalated > 0 && (
            <span className="sh-pressure__stat">
              <b>{escalated}</b> escalated
            </span>
          )}
        </div>
        <div className="sh-top__right">
          <button
            type="button"
            className="sh-next"
            disabled={!nextUp}
            onClick={() => nextUp && setSelectedId(nextUp.uid)}
            title={nextUp ? `Open ${nextUp.severity} ${nextUp.title} (N)` : "Nothing else open"}
          >
            <Zap className="h-4 w-4" />
            <span>Next priority</span>
            {nextUp && <b className={`sh-next__sev is-${nextUp.severity.toLowerCase()}`}>{nextUp.severity}</b>}
            <kbd>N</kbd>
          </button>
          <div className={`sh-clock ${left <= 60 ? "sh-clock--low" : ""}`}>
            <span className="sh-clock__label">Shift ends in</span>
            <span className="sh-clock__time">{clock(left)}</span>
          </div>
          {/* Ending grades the shift and there is no way back into it, so it
              asks -- and says how much is still open, since that is what the
              student is actually giving up. Every other destructive control on
              the portal confirms; this one did not. */}
          <button
            type="button"
            className="sh-end"
            disabled={busy}
            onClick={() => {
              const open = shift.incidents.filter((i) => !i.resolved && !i.escalated).length;
              const warn = open
                ? `End the shift now? ${open} incident${open === 1 ? " is" : "s are"} still open and will score nothing. You cannot come back into this shift.`
                : "End the shift now? It is graded as it stands and you cannot come back into it.";
              if (window.confirm(warn)) void post({ action: "finish" });
            }}
          >
            End shift
          </button>
        </div>
        <div className="sh-prog" aria-hidden="true">
          <div className={`sh-prog__fill ${left <= 60 ? "sh-prog__fill--low" : ""}`} style={{ width: `${elapsedPct}%` }} />
        </div>
      </header>

      <div className="sh-toasts" aria-live="polite">
        {/* Once it is open, its toast has done its job. */}
        {fresh.filter((f) => f.uid !== selected?.uid).map((f) => {
          const Icon = iconFor(f.defId);
          return (
            <button
              key={f.uid}
              type="button"
              className={`sh-toast is-${f.severity.toLowerCase()}`}
              onClick={() => {
                setSelectedId(f.uid);
                setFresh((x) => x.filter((y) => y.uid !== f.uid));
              }}
            >
              <span className="sh-toast__icon">
                <Icon className="h-4 w-4" />
              </span>
              <span className="sh-toast__main">
                <span className="sh-toast__k">
                  New {f.severity} {f.kind}
                </span>
                <span className="sh-toast__t">{f.title}</span>
              </span>
              <span className="sh-toast__go">
                Open <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      <div className="sh-body">
        <aside className="sh-side">
          {queue.length === 0 ? (
            <p className="sh-waiting sh-radar"><Radar className="h-5 w-5" /> Watching the queue…</p>
          ) : (
            <div className="sh-queue" role="tablist" aria-label="Incident queue">
              {[
                { label: "Open", rows: queue.filter((i) => !done(i)) },
                { label: "Closed", rows: queue.filter((i) => done(i)) },
              ].map(
                (group) =>
                  group.rows.length > 0 && (
                    <section key={group.label} className="sh-qgroup">
                      <p className="sh-qgroup__head">
                        {group.label === "Open" ? <Inbox className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        {group.label}
                        <b>{group.rows.length}</b>
                      </p>
                      <ul className="sh-list">
                        {group.rows.map((inc) => {
                          const closed = inc.resolved || inc.escalated;
                          const isSel = selected?.uid === inc.uid;
                          const urgent = !closed && !inc.acknowledged && inc.severity === "P1";
                          const cls = ["sh-li", `sh-li--sev-${inc.severity.toLowerCase()}`, isSel && "sh-li--on", closed && "sh-li--done", urgent && "sh-li--urgent", freshIds.has(inc.uid) && "sh-li--fresh"].filter(Boolean).join(" ");
                          const Icon = iconFor(inc.defId);
                          return (
                            <li key={inc.uid}>
                              <button type="button" role="tab" aria-selected={isSel} className={cls} data-uid={inc.uid} onClick={() => setSelectedId(inc.uid)}>
                                <span className="sh-li__top">
                                  {/* Severity is the coloured bar down the left; stated in text too, so it does not rest on colour alone. */}
                                  <span className="sh-li__sev">{inc.severity}</span>
                                  <span className="sh-li__icon">
                                    <Icon className="h-3.5 w-3.5" />
                                  </span>
                                  <span className="sh-li__no">{numOf.get(inc.uid)}</span>
                                  <span className="sh-li__kind">{inc.kind}</span>
                                  <span className="sh-li__end">
                                    {inc.resolved ? (
                                      <span className="sh-li__state is-done">
                                        <Check className="h-3 w-3" /> Solved
                                      </span>
                                    ) : inc.escalated ? (
                                      <span className="sh-li__state is-up">
                                        <ArrowUpRight className="h-3 w-3" /> Tier 2
                                      </span>
                                    ) : !inc.acknowledged ? (
                                      <span className="sh-li__state is-new">
                                        <i aria-hidden /> New · {ageOf(inc)}
                                      </span>
                                    ) : (
                                      <span className="sh-li__state">{ageOf(inc)}</span>
                                    )}
                                  </span>
                                </span>
                                <span className="sh-li__title">{inc.title}</span>
                                <span className="sh-li__from">
                                  {sender(inc).name}
                                  {sender(inc).role ? ` · ${sender(inc).role}` : ""}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  )
              )}
            </div>
          )}
          <p className="sh-keys" aria-hidden>
            <kbd>J</kbd>
            <kbd>K</kbd> move <span>·</span> <kbd>N</kbd> next priority
          </p>
        </aside>

        <main className="sh-main">
          {error && <p className="sh-error">{error}</p>}
          <DeskLayer desk={shift.desk ?? []} now={now} busy={busy} post={post} />
          {selected ? (
            <IncidentDetail key={selected.uid} inc={selected} no={numOf.get(selected.uid) ?? ""} age={ageOf(selected)} busy={busy} post={post} />
          ) : (
            <div className="sh-empty">
              <span className="sh-empty__radar" aria-hidden>
                <Radar className="h-8 w-8" />
              </span>
              <p>The first incident will land shortly.</p>
              <small>Keep your lab open. Alerts and tickets arrive on their own.</small>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

type SubmitResult = { resolved: boolean; escalated?: boolean; onTime: boolean; waiting: boolean; results: { label: string; ok: boolean }[]; needFinding?: boolean; evidencePending?: boolean; answerRight?: boolean | null };

function IncidentDetail({ inc, no, age, busy, post }: { inc: Incident; no: string; age: string; busy: boolean; post: (p: Record<string, unknown>, opts?: { silent?: boolean }) => Promise<Record<string, unknown> | null> }) {
  const [diagnosis, setDiagnosis] = useState(inc.diagnosis);
  const [response, setResponse] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const hints = inc.shownHints;
  // Escalating closes the incident for good, so it asks once instead of firing
  // on the first click.
  const [confirming, setConfirming] = useState(false);
  const hasFinding = diagnosis.trim().length > 0;
  // Escalating is for what tier 1 tried and could not close: one Submit and
  // check, a finding and a closing note, all of which tier 2 reads.
  const submitted = Boolean(inc.submitted) || result !== null;
  const hasNote = response.trim().length > 0;
  const canEscalate = submitted && hasFinding && hasNote;
  const escalateNeeds = [!submitted && "press Submit and check once", !hasFinding && "answer the question", !hasNote && "write a closing note"].filter(Boolean) as string[];
  const { ask } = useCoach();

  const s = sender(inc);

  // Opening an incident acknowledges it (starts the "working" state). No button; matches the desk.
  useEffect(() => {
    if (!inc.resolved && !inc.acknowledged) void post({ action: "ack", uid: inc.uid }, { silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inc.uid]);

  async function submit(escalate = false) {
    let note = response;
    if (escalate) {
      const base = response.trim() || "Handing this to tier 2 with the evidence below.";
      note = /escalat/i.test(base) ? base : `${base}\n\nEscalated to tier 2.`;
      setResponse(note);
    }
    const data = await post({ action: "submit", uid: inc.uid, diagnosis, response: note, escalate });
    if (data?.result) setResult(data.result as SubmitResult);
    setConfirming(false);
  }

  return (
    <div className={`sh-detail ${inc.resolved ? "sh-detail--done" : ""}`}>
      <div className="sh-detail__crumbs">
        <span className={`sh-pill sh-pill--${inc.severity.toLowerCase()}`}>
          {inc.severity} · {PRIORITY_NOTE[inc.severity].split(" · ")[0]}
        </span>
        {(() => {
          const Icon = iconFor(inc.defId);
          return (
            <span className="sh-meta">
              <Icon className="h-3.5 w-3.5" /> {inc.kind === "alert" ? "Alert" : "Ticket"}
            </span>
          );
        })()}
        <span className="sh-meta sh-meta--mono">
          <Hash className="h-3.5 w-3.5" />
          {no}
        </span>
        <span className="sh-meta">
          <Clock className="h-3.5 w-3.5" /> Arrived {age} ago
        </span>
        <span className="sh-meta">
          <GraduationCap className="h-3.5 w-3.5" /> {cap(skillOf(inc.kind))}
        </span>
        {inc.resolved ? (
          <span className="sh-status sh-status--done">
            <Check className="h-3.5 w-3.5" /> Solved
          </span>
        ) : inc.escalated ? (
          <span className="sh-status sh-status--up">
            <ArrowUpRight className="h-3.5 w-3.5" /> With tier 2
          </span>
        ) : (
          <span className="sh-detail__left">{cap(PRIORITY_NOTE[inc.severity].split(" · ")[1])}</span>
        )}
      </div>

      <h2 className="sh-detail__title">{inc.title}</h2>

      <div className="sh-split">
        <div className="sh-col">
      <div className="sh-msg">
        <span className={`sh-msg__avatar ${inc.kind === "alert" ? "sh-msg__avatar--alert" : ""}`}>
          {inc.kind === "alert" ? <AlertTriangle className="h-4 w-4" /> : initials(s.name)}
        </span>
        <div className="sh-msg__body">
          <p className="sh-msg__from">
            <strong>{s.name}</strong>
            {s.role ? <span className="sh-msg__role">{s.role}</span> : null}
          </p>
          <p className="sh-msg__text">{inc.brief}</p>
          {inc.why && (
            <p className="sh-why"><span className="sh-why__tag"><Info className="h-3.5 w-3.5" /> Why it matters</span>{inc.why}</p>
          )}
          {inc.attack && (
            <a
              className="sh-attack"
              href={`https://attack.mitre.org/techniques/${inc.attack.id.replace(".", "/")}/`}
              target="_blank"
              rel="noreferrer"
              title={`MITRE ATT&CK ${inc.attack.id}: ${inc.attack.name}`}
            >
              MITRE ATT&CK {inc.attack.id} · {inc.attack.name}
            </a>
          )}
        </div>
      </div>

        </div>

        <div className="sh-col">
      {inc.resolved ? (
        <div className="sh-resolved">
          <span className="sh-resolved__seal" aria-hidden>
            <Check className="h-5 w-5" />
          </span>
          <span>
            <strong>Closed.</strong> Your lab shows the fix and your answer is right. It counts toward your shift score.
          </span>
        </div>
      ) : inc.escalated ? (
        <div className="sh-handoff">
          <p className="sh-handoff__head"><ArrowUpRight className="h-4 w-4" /> Handed to tier 2</p>
          <p>Tier 2 owns this now and it is off your queue. Coach, as the tier 2 lead, has your finding and your closing note, and reviews the handoff in your shift report: what tier 2 could use, and what you could have done yourself.</p>
          <p className="sh-handoff__cost">It scores as a handoff, not a fix: you keep the credit for the finding, the write-up and leaving the rest alone, and you give up the points for resolving it.</p>
        </div>
      ) : (
        <div className="sh-work">
          <p className="sh-work__head">Your response</p>
          {/* The same four moves on every incident, as one line rather than a
              paragraph repeated on each: the question below is what changes. */}
          <ol className="sh-steps" aria-label="How to close it">
            <li><Search className="h-3.5 w-3.5" /> Investigate</li>
            <li><Wrench className="h-3.5 w-3.5" /> Fix in your lab</li>
            <li><FileText className="h-3.5 w-3.5" /> Answer and note</li>
            <li><Check className="h-3.5 w-3.5" /> Submit and check</li>
          </ol>
          <p className="sh-work__note">Range marks your answer and reads your live lab. Both have to be right to close it.</p>

          <label className="sh-q">
            <span className="sh-q__k">The question</span>
            <span className="sh-q__p">{inc.diagnosisPrompt}</span>
            <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Your answer" autoComplete="off" />
          </label>

          <label className="sh-field">
            <span><FileText className="h-3.5 w-3.5" /> Closing note</span>
            <textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={3} placeholder="What happened, what you changed, and what the next person should check." />
          </label>

          {hints.length > 0 && (
            <ul className="sh-hints">
              {hints.map((h, i) => (
                <li key={i}><LifeBuoy className="h-3.5 w-3.5" /> {h}</li>
              ))}
            </ul>
          )}

          {/* Two separate verdicts, so it is clear which half is still wrong:
              the answer to the question, and the fix in the lab. */}
          {result && !result.resolved && (
            <div className="sh-result sh-result--wait">
              <ul className="sh-verdict">
                <li className={result.answerRight ? "is-ok" : "is-no"}>
                  {result.answerRight ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  <strong>Your answer</strong> {result.answerRight ? "is right" : diagnosis.trim() ? "is not right yet" : "is blank"}
                </li>
                <li className={result.needFinding ? "is-ok" : "is-no"}>
                  {result.needFinding ? <Check className="h-3.5 w-3.5" /> : result.waiting ? <Loader2 className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                  <strong>Your lab</strong>{" "}
                  {result.needFinding
                    ? "shows the fix"
                    : result.waiting
                      ? "did not report back in time, so nothing was marked wrong. Check again in a moment"
                      : result.evidencePending && result.results.filter((r) => !r.ok).length === 1
                        ? "has not logged the attack yet. Give it a minute, then check again"
                        : "does not show the fix yet"}
                </li>
              </ul>
              {!result.waiting && !result.needFinding && (
                <ul>
                  {result.results
                    .filter((r) => !r.ok)
                    .map((r, i) => (
                      <li key={i}>{r.label}</li>
                    ))}
                </ul>
              )}
            </div>
          )}

          {confirming ? (
            <div className="sh-confirm">
              <p className="sh-confirm__head"><ArrowUpRight className="h-4 w-4" /> Hand this to tier 2?</p>
              <p>Coach, as the tier 2 lead, takes the incident with your finding and closing note, and it comes off your queue. After the shift, Coach grades the handoff and tells you what you could have done yourself.</p>
              <p className="sh-confirm__cost">
                It closes for you at that point. You keep the credit for your finding, your closing note and for leaving the
                accounts that were fine alone, and you give up the points for fixing it.
              </p>
              <div className="sh-confirm__btns">
                <button type="button" className="sh-escalate sh-escalate--go" disabled={busy} onClick={() => submit(true)}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />} Hand it up
                </button>
                <button type="button" className="sh-coach" disabled={busy} onClick={() => setConfirming(false)}>
                  Keep working it
                </button>
              </div>
            </div>
          ) : (
            <div className="sh-actions">
              <button type="button" className="sh-submit" disabled={busy} onClick={() => submit(false)}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Submit and check
              </button>
              {/* Nothing to hand up without a finding, so the button says so rather
                  than failing on the server after the click. */}
              <button
                type="button"
                className="sh-escalate"
                disabled={busy || !canEscalate}
                title={canEscalate ? "Hand this incident to tier 2 with your finding and closing note" : `To escalate, ${escalateNeeds.join(", ")}`}
                onClick={() => setConfirming(true)}
              >
                <ArrowUpRight className="h-4 w-4" /> Escalate to tier 2
              </button>
              <button
                type="button"
                className="sh-coach sh-coach--talk"
                onClick={() =>
                  ask(
                    `I'm on shift working ${inc.severity} "${inc.title}". ${inc.brief} ${diagnosis.trim() ? `So far I think: ${diagnosis.trim()}.` : "I haven't found the evidence yet."} Help me decide what to check next, without giving me the answer.`
                  )
                }
              >
                <LifeBuoy className="h-3.5 w-3.5" /> Think it through
              </button>
              {!canEscalate && (
                <p className="sh-actions__why">To escalate to tier 2, {escalateNeeds.join(", then ")}. Tier 2 takes what you tried, not a blank ticket.</p>
              )}
            </div>
          )}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

// ---- report ---------------------------------------------------------------

function ShiftReport({ theme, report, onAgain, busy, error }: { theme: "light" | "dark"; report: Report; onAgain: () => void; busy: boolean; error: string | null }) {
  const pct = report.maxScore ? Math.round((report.totalScore / report.maxScore) * 100) : 0;
  const R = 56;
  const C = 2 * Math.PI * R;
  const ringCls = pct >= 85 ? "sh-gauge__fg--good" : pct < 50 ? "sh-gauge__fg--low" : "";
  return (
    <div className="shift-app shift-app--center" data-academy-theme={theme}>
      <div className="sh-report">
        <header className="sh-report__head">
          <div className="sh-gauge">
            <svg viewBox="0 0 128 128" aria-hidden="true">
              <circle className="sh-gauge__bg" cx="64" cy="64" r={R} />
              <circle className={`sh-gauge__fg ${ringCls}`} cx="64" cy="64" r={R} style={{ strokeDasharray: C, strokeDashoffset: C * (1 - pct / 100) }} />
            </svg>
            <span className="sh-gauge__num">{pct}%</span>
          </div>
          <div>
            <p className="sh-kicker">Shift report</p>
            <p className="sh-report__headline">{report.headline}</p>
            <p className="sh-report__score"><b>{report.totalScore}</b> of {report.maxScore} points</p>
            <p className="sh-report__sub">
                {report.resolvedCount} of {report.incidents.length} closed
                {report.escalatedCount ? ` · ${report.escalatedCount} escalated` : ""}
              </p>
          </div>
        </header>

        <div className="sh-report__rows">
          {report.incidents.map((i, n) => (
            <div key={n} className="sh-rep">
              <span className={`sh-sev ${SEV_CLASS[i.severity as Sev] ?? ""}`}>{i.severity}</span>
              <span className="sh-rep__title">{i.title}</span>
              <span className="sh-rep__tags">
                <em className={i.resolved ? "ok" : i.escalated ? "up" : "no"}>{i.resolved ? "Solved" : i.escalated ? "Escalated" : i.touched ? "Missed" : "Not worked"}</em>
                {i.touched && !i.noHarm && <em className="no">Collateral</em>}
                {i.resolved && !i.diagnosisRight && <em className="no">Weak diagnosis</em>}
                {i.hintsUsed > 0 && <em className="hint">{i.hintsUsed} hint{i.hintsUsed === 1 ? "" : "s"}</em>}
              </span>
              <span className="sh-rep__score">{i.score}<small>/{i.max}</small></span>
              {i.review && (
                <div className="sh-review">
                  <p className="sh-review__head">
                    <ArrowUpRight className="h-3.5 w-3.5" /> Tier 2 review{i.review.by === "coach" ? " from Coach" : ""}
                    <b className={`sh-review__grade is-${i.review.score}`}>{i.review.grade}</b>
                  </p>
                  <p><strong>Your handoff.</strong> {i.review.handoff}</p>
                  <p><strong>What you could have done.</strong> {i.review.couldHave}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {report.metrics && report.triage && report.desk && report.timeline && (
          <DeskSummary
            r={{ metrics: report.metrics, triage: report.triage, desk: report.desk, timeline: report.timeline }}
            headline={report.headline}
            totals={`${report.totalScore} of ${report.maxScore} points, ${report.resolvedCount} of ${report.incidents.length} closed`}
          />
        )}

        <p className="sh-report__habit"><strong>One habit to work on:</strong> {report.habit}</p>
        <div className="sh-report__actions">
          <button type="button" className="sh-go" disabled={busy} onClick={onAgain}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Start another shift <ArrowRight className="h-4 w-4" />
          </button>
          <Link href="/range" className="sh-report__leave"><ArrowLeft className="h-3.5 w-3.5" /> Back to Range</Link>
        </div>
        {/* A new shift needs the hosted lab connected. Without this the Start
            button spun and stopped with nothing said. */}
        {error && <p className="sh-error">{error}</p>}
      </div>
    </div>
  );
}

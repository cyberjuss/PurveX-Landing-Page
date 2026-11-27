"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  AlertTriangle, ArrowLeft, ArrowRight, Check, Clock, Loader2, LifeBuoy, Power, RefreshCw, ShieldAlert,
  Lock, Unlock, KeyRound, UserPlus, UserMinus, UserX, UserCog, ArrowLeftRight, FolderTree, SprayCan, Target,
  Crown, DoorOpen, Bell, BellOff, ShieldOff, ShieldCheck, ShieldX, Ticket, Search, Share2, Server, EyeOff, Infinity as InfinityIcon,
  Info, ArrowUpRight, Headset, X, Zap, Inbox, CheckCircle2, Radar, Hash, GraduationCap, Mail, BookOpen,
} from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import { startHostedLabNow, useHostedLab } from "@/components/academy/hosted-lab-button";
import { DeskLayer, DeskSummary, type DeskEvent, type DeskReport } from "./shift-desk";
import { useCoach } from "./coach-context";
import { lessonForIncident } from "@/lib/academy-job-lessons";
import "./shift.css";
import { useAcademyTheme } from "@/lib/use-academy-theme";

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
  /** A ticket waiting for the student to set its priority; severity is a placeholder until then. */
  untriaged?: boolean;
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
  incidents: { title: string; severity: string; resolved: boolean; escalated: boolean; touched: boolean; onTime: boolean; noHarm: boolean; diagnosisRight: boolean; hintsUsed: number; score: number; max: number; review?: Review | null; call?: { chose: string | null; actual: string; points: number; max: number } | null }[];
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
  /** This week's shift has been worked; the next opens Monday. */
  weekDone?: boolean;
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
        if (!opts?.silent) setError(data.error ?? "Something went wrong");
        return null;
      }
      if (data.shift) setShift(data.shift);
      return data;
    } catch {
      setError("Could not reach your shift · Try again");
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
          <p>Shifts need a hosted lab with Range Pro · Email support@purvex.io if you have it</p>
        </div>
      </div>
    );

  if (shift?.status === "done" && shift.report && !leftReport) return <ShiftReport theme={theme} report={shift.report} onAgain={again} busy={busy} error={error} weekDone={Boolean(shift.weekDone)} />;
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
          You are on the desk for 30 minutes · Three incidents fire into your lab · Close all three by priority before the shift ends
        </p>

        <ul className="sh-rules">
          <li>
            <span className="sh-rules__ic"><ShieldAlert className="h-4 w-4" /></span>
            <strong>Real attacks hit your own lab</strong>
            <small>The events land in your own domain controller</small>
          </li>
          <li>
            <span className="sh-rules__ic"><Clock className="h-4 w-4" /></span>
            <strong>One 30-minute window, worked by priority</strong>
            <small>Critical before High before Routine · Anything open at the end loses its fix points</small>
          </li>
          <li>
            <span className="sh-rules__ic"><LifeBuoy className="h-4 w-4" /></span>
            <strong>Coach thinks it through with you</strong>
            <small>Coach asks questions back and never hands you the answer</small>
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
              ? "The desk is ready · Tickets arrive the moment you begin"
              : starting
                ? queued
                  ? "Your shift starts once the lab is Online · First boot takes a couple of minutes"
                  : "First boot takes a couple of minutes"
                : state === "stopping" && queued
                  ? "Your lab is still saving · Your shift begins once it restarts"
                : lab.locked
                  ? "Shifts need a hosted lab with Range Pro"
                  : lab.notEnabled
                    ? "Your cloud lab is not on yet · Email support@purvex.io"
                    : "Start your lab and the desk opens"}
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
  P3: "Routine",
};

/** The word behind each code, spelled out wherever a badge has the room for it. */
const SEV_WORD: Record<Sev, string> = { P1: "Critical", P2: "High", P3: "Routine" };

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
  let untriagedOpen = 0;
  for (const i of shift.incidents) {
    if (i.resolved || i.escalated) continue;
    if (i.untriaged) untriagedOpen += 1;
    else openBy[i.severity] += 1;
  }
  // How long ago each incident landed, from the shift's own clock.
  const ageOf = (inc: Incident) => ago(Math.max(0, now - start - inc.arriveSec * 1000));
  const escalated = shift.incidents.filter((i) => i.escalated).length;

  // Stable incident numbers follow the server's creation order.
  const numOf = new Map(shift.incidents.map((i, idx) => [i.uid, incNo(idx)]));

  // Order: untriaged tickets first (they need a call), then open by priority, then closed.
  const order = { P1: 0, P2: 1, P3: 2 };
  const rankOf = (i: Incident) => (i.untriaged ? -1 : order[i.severity]);
  const done = (i: Incident) => i.resolved || i.escalated;
  const queue = [...shift.incidents].sort((a, b) => (done(a) === done(b) ? rankOf(a) - rankOf(b) : done(a) ? 1 : -1));

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = queue.find((i) => i.uid === selectedId) ?? queue.find((i) => !done(i)) ?? queue[0] ?? null;

  // The open incident to work next: highest priority, then oldest, skipping
  // the one already in front of the student.
  const nextUp = queue.filter((i) => !done(i) && i.uid !== selected?.uid).sort((a, b) => rankOf(a) - rankOf(b) || a.arriveSec - b.arriveSec)[0] ?? null;

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
      // A P1 from monitoring sounds and pulses the bar. Tickets are untriaged, so they never give their priority away.
      if (landed.some((i) => i.severity === "P1" && !i.untriaged)) raiseP1();
    }
    known.current = ids;
  }, [shift.incidents]);
  useEffect(() => {
    if (!fresh.length) return;
    const t = window.setTimeout(() => setFresh((f) => f.slice(0, -1)), 6000);
    return () => window.clearTimeout(t);
  }, [fresh]);
  const freshIds = new Set(fresh.map((f) => f.uid));

  // The P1 alarm: a soft two-note tone (muteable, remembered) and a red pulse across the bar.
  const [muted, setMuted] = useState(() => {
    try {
      return window.localStorage.getItem("purvex.shift.sound") === "off";
    } catch {
      return false;
    }
  });
  const [alarm, setAlarm] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const mutedRef = useRef(muted);
  mutedRef.current = muted;
  const raiseP1 = () => {
    setAlarm(true);
    window.setTimeout(() => setAlarm(false), 6000);
    if (mutedRef.current) return;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = (audio.current ??= new Ctx());
      void ctx.resume();
      [880, 660].forEach((hz, n) => {
        const t = ctx.currentTime + n * 0.22;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = hz;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.22);
      });
    } catch {}
  };
  const toggleSound = () =>
    setMuted((m) => {
      try {
        window.localStorage.setItem("purvex.shift.sound", m ? "on" : "off");
      } catch {}
      return !m;
    });

  const unread = (shift.desk ?? []).filter((d) => !d.answered && !d.lapsed).length;
  const [deskSeen, setDeskSeen] = useState<Set<string>>(() => new Set());
  const markSeen = (uid: string) => setDeskSeen((s) => new Set(s).add(uid));
  // The rail shows the queue or the inbox, as two tabs, so the incident gets the room.
  const [rail, setRail] = useState<"queue" | "inbox">("queue");

  // Coach knows which incident is open, so "help me" means this one, and it
  // coaches as the senior analyst at the next desk without doing the work.
  const { setPlace } = useCoach();
  const placeTitle = selected ? `${selected.untriaged ? "untriaged" : selected.severity} ${selected.title}` : "the queue";
  useEffect(() => {
    setPlace({ kind: "shift", title: placeTitle, at: `${handled} of ${total} closed, ${clock(left)} left on the shift` });
    // Only the incident in focus changes what Coach should know; the clock is context.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeTitle, setPlace]);
  useEffect(() => () => setPlace(null), [setPlace]);

  // The tab title, so the shift can be watched from the lab's window.
  const tabTitle = `${openBy.P1 ? `(${openBy.P1} Critical) ` : ""}${clock(left)} · Shift`;
  useEffect(() => {
    const before = document.title;
    return () => {
      document.title = before;
    };
  }, []);
  useEffect(() => {
    document.title = tabTitle;
  }, [tabTitle]);

  return (
    <div className="shift-app" data-academy-theme={theme}>
      <header className={`sx-bar${alarm ? " is-alarm" : ""}`}>
        <div className="sx-bar__id">
          <Link href="/range/drill" className="sx-icon" aria-label="Back to the Desk" title="Back to the Desk (your shift keeps running)">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="sx-live">
            <i aria-hidden />
            On shift
          </span>
          <div className="sx-bar__name">
            <strong>Night shift · PurveX Financial</strong>
            <span>
              Tier 1 desk · Level {shift.level}
              {shift.mix ? ` · ${shift.mix === "tickets" ? "Heavy on tickets tonight" : "Heavy on alerts tonight"}` : ""}
            </span>
          </div>
        </div>
        <div className="sx-board" aria-label="What is open on the queue">
          <span className={`sx-board__cell is-un${untriagedOpen ? "" : " is-zero"}`} title={`${untriagedOpen} waiting for a priority`}>
            <b>{untriagedOpen}</b>
            <small>Untriaged</small>
          </span>
          {(["P1", "P2", "P3"] as const).map((sev) => (
            <span key={sev} className={`sx-board__cell is-${sev.toLowerCase()}${openBy[sev] ? "" : " is-zero"}`} title={`${openBy[sev]} ${SEV_WORD[sev]} open`}>
              <b>{openBy[sev]}</b>
              <small>{SEV_WORD[sev]}</small>
            </span>
          ))}
          <span className="sx-board__cell is-closed">
            <b>
              {handled}
              <em>/{total}</em>
            </b>
            <small>closed{escalated > 0 ? ` · ${escalated} to tier 2` : ""}</small>
          </span>
        </div>
        <div className="sx-bar__end">
          <button type="button" className="sx-sound" onClick={toggleSound} aria-pressed={!muted} title={muted ? "Critical alert sound is off" : "Critical alert sound is on"}>
            {muted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          </button>
          <button
            type="button"
            className="sx-next"
            disabled={!nextUp}
            onClick={() => nextUp && setSelectedId(nextUp.uid)}
            title={nextUp ? `Open ${nextUp.untriaged ? "untriaged" : SEV_WORD[nextUp.severity]} ${nextUp.title} (N)` : "Nothing else open"}
          >
            <Zap className="h-4 w-4" />
            Next
            {nextUp && <b className={`sx-next__sev is-${nextUp.untriaged ? "un" : nextUp.severity.toLowerCase()}`}>{nextUp.untriaged ? "Triage" : SEV_WORD[nextUp.severity]}</b>}
          </button>
          <div className={`sx-timer ${left <= 60 ? "is-low" : left <= 300 ? "is-warn" : ""}`}>
            <small>Shift ends in</small>
            <b>{clock(left)}</b>
          </div>
          {/* Ending grades the shift and there is no way back into it, so it asks first. */}
          <button
            type="button"
            className="sx-end"
            disabled={busy}
            onClick={() => {
              const open = shift.incidents.filter((i) => !i.resolved && !i.escalated).length;
              const warn = open
                ? `End the shift now? ${open} incident${open === 1 ? " is" : "s are"} still open and will lose the points for fixing ${open === 1 ? "it" : "them"} · You cannot come back into this shift`
                : "End the shift now? It is graded as it stands and you cannot come back into it";
              if (window.confirm(warn)) void post({ action: "finish" });
            }}
          >
            End shift
          </button>
        </div>
        <div className="sx-bar__prog" aria-hidden="true">
          <i className={left <= 60 ? "is-low" : left <= 300 ? "is-warn" : ""} style={{ width: `${elapsedPct}%` }} />
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

      <div className="sx-body">
        <aside className="sx-rail">
          <div className="sx-tabs" role="tablist" aria-label="Queue and inbox">
            <button type="button" role="tab" aria-selected={rail === "queue"} className={rail === "queue" ? "is-on" : ""} onClick={() => setRail("queue")}>
              <Inbox className="h-4 w-4" /> Queue <b>{queue.filter((i) => !done(i)).length}</b>
            </button>
            <button type="button" role="tab" aria-selected={rail === "inbox"} className={rail === "inbox" ? "is-on" : ""} onClick={() => setRail("inbox")}>
              <Mail className="h-4 w-4" /> Inbox {unread > 0 && <b className="is-hot">{unread}</b>}
            </button>
          </div>
          {rail === "inbox" ? (
            <div className="sx-inbox">
              <DeskLayer desk={shift.desk ?? []} now={now} busy={busy} post={post} inline seen={deskSeen} onSeen={markSeen} />
            </div>
          ) : queue.length === 0 ? (
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
                          const cls = ["sh-li", `sh-li--sev-${inc.untriaged ? "un" : inc.severity.toLowerCase()}`, isSel && "sh-li--on", closed && "sh-li--done", urgent && "sh-li--urgent", freshIds.has(inc.uid) && "sh-li--fresh"].filter(Boolean).join(" ");
                          const Icon = iconFor(inc.defId);
                          return (
                            <li key={inc.uid}>
                              <button type="button" role="tab" aria-selected={isSel} className={cls} data-uid={inc.uid} onClick={() => setSelectedId(inc.uid)}>
                                <span className="sh-li__top">
                                  <span className="sh-li__sev">{inc.untriaged ? "Triage" : SEV_WORD[inc.severity]}</span>
                                  <span className="sh-li__icon">
                                    <Icon className="h-3.5 w-3.5" />
                                  </span>
                                  <span className="sh-li__no">{numOf.get(inc.uid)}</span>
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
        </aside>

        {selected ? (
          <IncidentDetail
            key={selected.uid}
            inc={selected}
            no={numOf.get(selected.uid) ?? ""}
            age={ageOf(selected)}
            busy={busy}
            post={post}
            lead={error ? <p className="sh-error">{error}</p> : null}
          />
        ) : (
          <>
            <main className="sx-main">
              {error && <p className="sh-error">{error}</p>}
              <div className="sh-empty">
                <span className="sh-empty__radar" aria-hidden>
                  <Radar className="h-8 w-8" />
                </span>
                <p>The first incident lands shortly</p>
                <small>Keep your lab open · Alerts arrive on their own</small>
              </div>
            </main>
            <aside className="sx-resp" aria-label="Your response" />
          </>
        )}
      </div>
    </div>
  );
}

type SubmitResult = { resolved: boolean; escalated?: boolean; onTime: boolean; waiting: boolean; results: { label: string; ok: boolean }[]; needFinding?: boolean; evidencePending?: boolean; answerRight?: boolean | null };

function IncidentDetail({ inc, no, age, busy, post, lead }: { inc: Incident; no: string; age: string; lead?: React.ReactNode; busy: boolean; post: (p: Record<string, unknown>, opts?: { silent?: boolean }) => Promise<Record<string, unknown> | null> }) {
  // What they typed is kept per incident, so opening another one and coming
  // back does not lose it. Session storage only: it is a draft, not a record.
  const draftKey = `shift-draft:${inc.uid}`;
  const draft = (() => {
    try {
      return JSON.parse(window.sessionStorage.getItem(draftKey) || "null") as { d?: string; r?: string } | null;
    } catch {
      return null;
    }
  })();
  const [diagnosis, setDiagnosis] = useState(draft?.d ?? inc.diagnosis);
  const [response, setResponse] = useState(draft?.r ?? "");
  useEffect(() => {
    try {
      window.sessionStorage.setItem(draftKey, JSON.stringify({ d: diagnosis, r: response }));
    } catch {}
  }, [draftKey, diagnosis, response]);
  // Ctrl or Cmd + Enter submits from either box.
  const submitKey = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !busy) {
      e.preventDefault();
      void submit(false);
    }
  };
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
  const escalateNeeds = [!submitted && "submit once", !hasFinding && "answer", !hasNote && "add a note"].filter(Boolean) as string[];
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

  // Where the incident stands, as the lifecycle tracker shows it.
  const stage = inc.resolved || inc.escalated ? 3 : submitted ? 2 : inc.acknowledged ? 1 : 0;
  const stages = ["New", "Investigating", "Submitted", inc.escalated ? "With tier 2" : "Closed"];
  const lesson = lessonForIncident(inc.defId, skillOf(inc.kind));
  const Icon = iconFor(inc.defId);
  const labOk = Boolean(result?.needFinding);

  return (
    <>
      <main className="sx-main">
        {lead}
        <section className={`sx-case${inc.resolved ? " is-done" : ""}`}>
          <div className="sx-case__meta">
            <span className={`sx-pri is-${inc.untriaged ? "un" : inc.severity.toLowerCase()}`}>{inc.untriaged ? "Untriaged" : SEV_WORD[inc.severity]}</span>
            <span className="sx-chip">
              <Icon className="h-3.5 w-3.5" /> {inc.kind === "alert" ? "Alert" : "Ticket"}
            </span>
            <span className="sx-chip sx-chip--mono">
              <Hash className="h-3.5 w-3.5" />
              {no}
            </span>
            <span className="sx-chip">
              <Clock className="h-3.5 w-3.5" /> Arrived {age} ago
            </span>
            <span className="sx-chip">
              <GraduationCap className="h-3.5 w-3.5" /> {cap(skillOf(inc.kind))}
            </span>
            <span className="sx-case__sla">{inc.resolved ? "Solved" : inc.escalated ? "With tier 2" : inc.untriaged ? "Set its priority first" : cap(PRIORITY_NOTE[inc.severity].split(" · ")[1] ?? "")}</span>
          </div>
          <h1 className="sx-case__title">{inc.title}</h1>
          <ol className="sx-life" aria-label="Where this incident stands">
            {stages.map((label, i) => (
              <li key={label} className={i < stage || (i === 3 && stage === 3) ? "is-done" : i === stage ? "is-now" : ""}>
                <i aria-hidden>{i < stage || (i === 3 && stage === 3) ? <Check className="h-3 w-3" /> : null}</i>
                {label}
              </li>
            ))}
          </ol>
        </section>

        <section className="sx-panel">
          <header className="sx-panel__head">
            <span className={`sx-avatar${inc.kind === "alert" ? " is-alert" : ""}`}>{inc.kind === "alert" ? <AlertTriangle className="h-4 w-4" /> : initials(s.name)}</span>
            <span className="sx-panel__who">
              <strong>{s.name}</strong>
              <span>{s.role ?? (inc.kind === "alert" ? "Automated detection" : "Caller")}</span>
            </span>
            <span className="sx-k">{inc.kind === "alert" ? "Alert" : "Reported"}</span>
          </header>
          <p className="sx-brief">{inc.brief}</p>
        </section>

        {(inc.why || inc.attack) && (
          <div className="sx-pair">
            {inc.why && (
              <section className="sx-panel sx-panel--why">
                <span className="sx-k">
                  <Info className="h-3.5 w-3.5" /> Why it matters
                </span>
                <p>{inc.why}</p>
              </section>
            )}
            {inc.attack && (
              <a
                className="sx-panel sx-panel--attack"
                href={`https://attack.mitre.org/techniques/${inc.attack.id.replace(".", "/")}/`}
                target="_blank"
                rel="noreferrer"
                title={`MITRE ATT&CK ${inc.attack.id}: ${inc.attack.name}`}
              >
                <span className="sx-k">MITRE ATT&CK</span>
                <strong>{inc.attack.id}</strong>
                <span>{inc.attack.name}</span>
                <ArrowUpRight className="sx-panel__out h-4 w-4" />
              </a>
            )}
          </div>
        )}
      </main>

      <aside className="sx-resp" aria-label="Your response">
        {inc.resolved ? (
          <div className="sx-closed">
            <span className="sx-closed__seal" aria-hidden>
              <Check className="h-6 w-6" />
            </span>
            <strong>Closed</strong>
            <p>Your lab shows the fix · It counts toward your shift score</p>
          </div>
        ) : inc.escalated ? (
          <div className="sx-closed is-up">
            <span className="sx-closed__seal" aria-hidden>
              <ArrowUpRight className="h-6 w-6" />
            </span>
            <strong>Handed to tier 2</strong>
            <p>Coach reviews the handoff in your shift report</p>
            <p className="sx-closed__cost">You keep the finding points but not the fix points</p>
          </div>
        ) : inc.untriaged ? (
          <div className="sx-resp__scroll">
            <p className="sx-k">Triage</p>
            <div className="sx-triage">
              <strong>Set the priority</strong>
              <p>Weigh impact against urgency · The first call is the one on record</p>
              <ul className="sx-triage__guide">
                <li>
                  <b className="is-p1">Critical</b> An attack in progress or the business is stopped
                </li>
                <li>
                  <b className="is-p2">High</b> A real security risk or a whole team blocked
                </li>
                <li>
                  <b className="is-p3">Routine</b> One person affected or a workaround exists
                </li>
              </ul>
              <div className="sx-triage__pick">
                {(["P1", "P2", "P3"] as const).map((p) => (
                  <button key={p} type="button" className={`is-${p.toLowerCase()}`} disabled={busy} onClick={() => void post({ action: "triage", uid: inc.uid, priority: p })}>
                    <b>{SEV_WORD[p]}</b>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="sx-resp__scroll">
              <p className="sx-k">Your response</p>
              <ol className="sx-steps">
                <li className={`sx-step${stage >= 1 ? " is-done" : ""}`}>
                  <span className="sx-step__n">{stage >= 1 ? <Check className="h-3.5 w-3.5" /> : 1}</span>
                  <div className="sx-step__body">
                    <strong>Investigate</strong>
                    <p>Read what your lab shows before you change anything</p>
                    <div className="sx-step__tools">
                      <button
                        type="button"
                        onClick={() =>
                          ask(
                            `I'm on shift working ${inc.untriaged ? "an untriaged ticket" : inc.severity} "${inc.title}". ${inc.brief} ${diagnosis.trim() ? `So far I think: ${diagnosis.trim()}.` : "I haven't found the evidence yet."} Help me decide what to check next, without giving me the answer.`
                          )
                        }
                      >
                        <LifeBuoy className="h-3.5 w-3.5" /> Think it through
                      </button>
                      <a href={lesson.href} target="_blank" rel="noopener" title={`Opens the ${lesson.label} lesson in a new tab`}>
                        <BookOpen className="h-3.5 w-3.5" /> Read up · {lesson.label}
                      </a>
                    </div>
                  </div>
                </li>
                <li className={`sx-step${labOk ? " is-done" : ""}`}>
                  <span className="sx-step__n">{labOk ? <Check className="h-3.5 w-3.5" /> : 2}</span>
                  <div className="sx-step__body">
                    <strong>Fix it in your lab</strong>
                    <p>The check reads your live lab so the change has to be real</p>
                  </div>
                </li>
                <li className={`sx-step${hasFinding ? " is-done" : ""}`}>
                  <span className="sx-step__n">{hasFinding ? <Check className="h-3.5 w-3.5" /> : 3}</span>
                  <label className="sx-step__body">
                    <strong>Answer</strong>
                    <span className="sx-q">{inc.diagnosisPrompt}</span>
                    <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} onKeyDown={submitKey} placeholder="Your answer" autoComplete="off" />
                  </label>
                </li>
                <li className={`sx-step${hasNote ? " is-done" : ""}`}>
                  <span className="sx-step__n">{hasNote ? <Check className="h-3.5 w-3.5" /> : 4}</span>
                  <label className="sx-step__body">
                    <strong>Closing note</strong>
                    <textarea value={response} onChange={(e) => setResponse(e.target.value)} onKeyDown={submitKey} rows={3} placeholder="What happened and what you changed" />
                  </label>
                </li>
              </ol>

              {hints.length > 0 && (
                <ul className="sh-hints">
                  {hints.map((h, i) => (
                    <li key={i}>
                      <LifeBuoy className="h-3.5 w-3.5" /> {h}
                    </li>
                  ))}
                </ul>
              )}

              {/* Two separate verdicts, so it is clear which half is still wrong. */}
              {result && !result.resolved && (
                <div className="sx-verdict">
                  <ul>
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
                          ? "did not report back in time so nothing was marked wrong · Check again in a moment"
                          : result.evidencePending && result.results.filter((r) => !r.ok).length === 1
                            ? "has not received this incident yet · Check again in a moment"
                            : "does not show the fix yet"}
                    </li>
                  </ul>
                  {!result.waiting && !result.needFinding && (
                    <ul className="sx-verdict__left">
                      {result.results
                        .filter((r) => !r.ok)
                        .map((r, i) => (
                          <li key={i}>{r.label}</li>
                        ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="sx-resp__foot">
              {confirming ? (
                <div className="sx-confirm">
                  <strong>
                    <ArrowUpRight className="h-4 w-4" /> Hand this to tier 2?
                  </strong>
                  <p>Coach takes it as the tier 2 lead · You keep the finding points but give up the fix points</p>
                  <div className="sx-foot__row">
                    <button type="button" className="sx-submit" disabled={busy} onClick={() => submit(true)}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />} Hand it up
                    </button>
                    <button type="button" className="sx-ghost" disabled={busy} onClick={() => setConfirming(false)}>
                      Keep working
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button type="button" className="sx-submit" disabled={busy} onClick={() => submit(false)}>
                    {busy ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Checking your lab…
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" /> Submit and check
                        <kbd>Ctrl ↵</kbd>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="sx-ghost"
                    disabled={busy || !canEscalate}
                    title={canEscalate ? "Hand this incident to tier 2 with your finding and closing note" : `To escalate ${escalateNeeds.join(" · ")}`}
                    onClick={() => setConfirming(true)}
                  >
                    <ArrowUpRight className="h-4 w-4" /> Escalate to tier 2
                  </button>
                  {!canEscalate && <p className="sx-foot__why">To escalate · {escalateNeeds.join(" · ")}</p>}
                </>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}

// ---- report ---------------------------------------------------------------

function ShiftReport({ theme, report, onAgain, busy, error, weekDone }: { theme: "light" | "dark"; report: Report; onAgain: () => void; busy: boolean; error: string | null; weekDone: boolean }) {
  // The shift is over, so the drafts typed into its incidents have done their job.
  useEffect(() => {
    try {
      for (let i = window.sessionStorage.length - 1; i >= 0; i--) {
        const k = window.sessionStorage.key(i);
        if (k?.startsWith("shift-draft:")) window.sessionStorage.removeItem(k);
      }
    } catch {}
  }, []);
  const pct = report.maxScore ? Math.round((report.totalScore / report.maxScore) * 100) : 0;
  const left = Math.max(0, report.incidents.length - report.resolvedCount - report.escalatedCount);
  const pri = (sev: string) => (sev === "P1" ? 1 : sev === "P2" ? 2 : 3);
  return (
    <div className="shift-app shift-app--center" data-academy-theme={theme}>
      <div className="sh-report dk dk--report">
        <header className="dk-head">
          <div className="dk-head__id">
            <span className="dk-mark" aria-hidden>
              <Headset className="h-5 w-5" />
            </span>
            <div>
              <span className="dk-kicker">PurveX Financial · Shift report</span>
              <h1>{report.headline}</h1>
            </div>
          </div>
          <div className="dk-head__live">
            <span className="dk-status">
              <i aria-hidden />
              Clocked out
            </span>
          </div>
        </header>

        <dl className="dk-kpis dk-kpis--4">
          <div>
            <dt>Score</dt>
            <dd className={pct >= 85 ? "rd-text-good" : pct < 50 ? "rd-text-bad" : ""}>{pct}%</dd>
            <span className="dk-kpis__note">
              {report.totalScore} of {report.maxScore} points
            </span>
          </div>
          <div>
            <dt>Closed</dt>
            <dd>
              {report.resolvedCount}
              <small className="dk-kpis__of">/{report.incidents.length}</small>
            </dd>
            <span className="dk-kpis__note">fixed in your lab</span>
          </div>
          <div>
            <dt>Escalated</dt>
            <dd>{report.escalatedCount}</dd>
            <span className="dk-kpis__note">handed to tier 2</span>
          </div>
          <div>
            <dt>Left open</dt>
            <dd className={left ? "rd-text-bad" : ""}>{left}</dd>
            <span className="dk-kpis__note">when the shift ended</span>
          </div>
        </dl>

        <section className="dk-queue" aria-label="Shift tickets">
          <div className="dk-queue__bar">
            <h2>Shift tickets</h2>
            <span>{report.incidents.length} arrived · highest priority first</span>
          </div>
          <ul>
            {[...report.incidents]
              .sort((x, y) => pri(x.severity) - pri(y.severity))
              .map((i, n) => {
                const tone = i.resolved ? "done" : i.escalated ? "open" : "missed";
                return (
                  <li key={n} className={`dk-row dk-row--rep dk-row--p${pri(i.severity)}`}>
                    <span className="dk-pri">
                      <b>{SEV_WORD[i.severity as Sev] ?? i.severity}</b>
                    </span>
                    <span className="dk-ticket">
                      <strong>{i.title}</strong>
                      {i.call && (
                        <span className={`dk-call${i.call.points === i.call.max ? " is-good" : i.call.points ? " is-near" : " is-bad"}`}>
                          {i.call.chose ? `Your call ${SEV_WORD[i.call.chose as Sev] ?? i.call.chose} · Actual ${SEV_WORD[i.call.actual as Sev] ?? i.call.actual}` : `Never triaged · Actual ${SEV_WORD[i.call.actual as Sev] ?? i.call.actual}`} · {i.call.points}/{i.call.max}
                        </span>
                      )}
                      <span className="dk-tags">
                        {i.touched && !i.noHarm && <em className="is-bad">Collateral</em>}
                        {i.resolved && !i.diagnosisRight && <em className="is-bad">Weak diagnosis</em>}
                        {i.hintsUsed > 0 && <em>{i.hintsUsed} hint{i.hintsUsed === 1 ? "" : "s"}</em>}
                      </span>
                    </span>
                    <span className="dk-cell" data-label="State">
                      <em className={`dk-state dk-state--${tone}`}>{i.resolved ? "Solved" : i.escalated ? "Escalated" : i.touched ? "Missed" : "Not worked"}</em>
                    </span>
                    <span className="dk-score">
                      {i.score}
                      <small>/{i.max}</small>
                    </span>
                    {i.review && (
                      <div className="sh-review dk-review">
                        <p className="sh-review__head">
                          <ArrowUpRight className="h-3.5 w-3.5" /> Tier 2 review{i.review.by === "coach" ? " from Coach" : ""}
                          <b className={`sh-review__grade is-${i.review.score}`}>{i.review.grade}</b>
                        </p>
                        <p><strong>Your handoff</strong> {i.review.handoff}</p>
                        <p><strong>What you could have done</strong> {i.review.couldHave}</p>
                      </div>
                    )}
                  </li>
                );
              })}
          </ul>
        </section>

        {report.metrics && report.triage && report.desk && report.timeline && (
          <DeskSummary
            r={{ metrics: report.metrics, triage: report.triage, desk: report.desk, timeline: report.timeline }}
            headline={report.headline}
            totals={`${report.totalScore} of ${report.maxScore} points, ${report.resolvedCount} of ${report.incidents.length} closed`}
          />
        )}

        <p className="sh-report__habit"><strong>One habit to work on</strong> {report.habit}</p>
        <div className="sh-report__actions">
          {weekDone ? (
            <p className="sh-report__next">One shift a week · Your next shift opens Monday</p>
          ) : (
            <button type="button" className="sh-go" disabled={busy} onClick={onAgain}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Start another shift <ArrowRight className="h-4 w-4" />
            </button>
          )}
          <Link href="/range/drill" className="sh-report__leave"><ArrowLeft className="h-3.5 w-3.5" /> Back to the Desk</Link>
        </div>
        {/* A new shift needs the hosted lab connected. Without this the Start
            button spun and stopped with nothing said. */}
        {error && <p className="sh-error">{error}</p>}
      </div>
    </div>
  );
}

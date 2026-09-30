"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Clock, Loader2, LifeBuoy, Monitor, Power, RefreshCw, ShieldAlert } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import { startHostedLabNow } from "@/components/academy/hosted-lab-button";
import "./shift.css";

type Sev = "P1" | "P2" | "P3";
type Incident = {
  defId: string;
  kind: "alert" | "ticket";
  severity: Sev;
  from: string;
  title: string;
  brief: string;
  attack: { id: string; name: string } | null;
  diagnosisPrompt: string;
  arriveSec: number;
  deadlineSec: number;
  acknowledged: boolean;
  resolved: boolean;
  onTime: boolean;
  overdue: boolean;
  hintsUsed: number;
  hintsTotal: number;
  nextHintCostPct: number | null;
  shownHints: string[];
  diagnosis: string;
  responseSaved: boolean;
};
type Report = {
  totalScore: number;
  maxScore: number;
  resolvedCount: number;
  onTimeCount: number;
  headline: string;
  habit: string;
  incidents: { title: string; severity: string; resolved: boolean; onTime: boolean; noHarm: boolean; diagnosisRight: boolean; hintsUsed: number; score: number; max: number }[];
};
type Shift = {
  id: string;
  startedAt: string;
  endsAt: string;
  phase: number;
  level: number;
  status: "active" | "done";
  incidents: Incident[];
  report: Report | null;
};
type LabState = "none" | "starting" | "ready" | "stopping" | "stopped";

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

  const load = useCallback(async () => {
    try {
      const r = await academyFetch("/academy/api/shift");
      const data = await r.json();
      setAvailable(Boolean(data.available));
      if (data.available) {
        setShift(data.shift ?? null);
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
  const polling = active || (available === true && shift?.status !== "done");
  useEffect(() => {
    if (!polling) return;
    const t = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(t);
  }, [polling, load]);

  const post = useCallback(async (payload: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    try {
      const r = await academyFetch("/academy/api/shift", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error ?? "Something went wrong.");
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
          <p>Shifts run in your hosted lab, and hosted labs are not on for this account yet. Ask your instructor.</p>
        </div>
      </div>
    );

  if (shift?.status === "done" && shift.report) return <ShiftReport theme={theme} report={shift.report} onAgain={() => post({ action: "start" })} busy={busy} />;
  if (active && shift) return <ActiveShift theme={theme} shift={shift} now={now} busy={busy} error={error} post={post} />;

  return <ShiftIntro theme={theme} labState={labState} busy={busy} error={error} onStart={() => post({ action: "start" })} onRefresh={load} />;
}

// ---- intro (with the lab-online gate) -------------------------------------

function ShiftIntro({ theme, labState, busy, error, onStart, onRefresh }: { theme: "light" | "dark"; labState: LabState; busy: boolean; error: string | null; onStart: () => void; onRefresh: () => void }) {
  const online = labState === "ready";
  const starting = labState === "starting";
  const labWord = online ? "Online" : starting ? "Starting…" : "Offline";
  const [labBusy, setLabBusy] = useState(false);
  async function startLab() {
    setLabBusy(true);
    try {
      await startHostedLabNow();
    } catch {}
    onRefresh();
    setLabBusy(false);
  }
  return (
    <div className="shift-app shift-app--center" data-academy-theme={theme}>
      <div className="sh-intro">
        <Link href="/academy" className="sh-back"><ArrowLeft className="h-3.5 w-3.5" /> Academy</Link>
        <div className="sh-brand">
          <span className="sh-logo">P</span>
          <div>
            <p className="sh-kicker">PurveX Financial · Security Operations</p>
            <h1>Start your shift</h1>
          </div>
        </div>
        <p className="sh-lede">
          You are on the desk for 30 minutes. Alerts and tickets arrive on their own. Investigate each in your lab, fix it, and close it before its SLA runs out.
        </p>
        <ul className="sh-rules">
          <li>
            <span className="sh-rule__icon"><ShieldAlert className="h-[18px] w-[18px]" /></span>
            <span className="sh-rule__body"><b>Real attacks</b>Fired straight into your own lab</span>
          </li>
          <li>
            <span className="sh-rule__icon"><Clock className="h-[18px] w-[18px]" /></span>
            <span className="sh-rule__body"><b>30 minutes on the clock</b>P1 in 5, P2 in 8, P3 in 12</span>
          </li>
          <li>
            <span className="sh-rule__icon"><LifeBuoy className="h-[18px] w-[18px]" /></span>
            <span className="sh-rule__body"><b>Coach costs points</b>10%, then 20%, then 40%</span>
          </li>
        </ul>

        <div className={`sh-labgate sh-labgate--${online ? "on" : "off"}`}>
          <span className={`sh-labdot sh-labdot--${online ? "on" : labState === "starting" ? "wait" : "off"}`} />
          <span className="sh-labgate__text">
            Your lab is <strong>{labWord}</strong>. {online ? "You are ready to start." : starting ? "It is coming up; this updates on its own." : "Start it, then this updates on its own."}
          </span>
          {!online && (
            starting ? (
              <button type="button" className="sh-refresh" onClick={onRefresh} aria-label="Refresh lab status">
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </button>
            ) : (
              <button type="button" className="sh-refresh" onClick={startLab} disabled={labBusy}>
                {labBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Power className="h-3.5 w-3.5" />} Start my lab
              </button>
            )
          )}
        </div>

        {error && <p className="sh-error">{error}</p>}
        <button type="button" className="sh-go" disabled={busy || !online} onClick={onStart}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Start shift <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---- active shift: the queue ----------------------------------------------

const SEV_CLASS: Record<Sev, string> = { P1: "sh-sev--p1", P2: "sh-sev--p2", P3: "sh-sev--p3" };

function ActiveShift({ theme, shift, now, busy, error, post }: { theme: "light" | "dark"; shift: Shift; now: number; busy: boolean; error: string | null; post: (p: Record<string, unknown>) => Promise<Record<string, unknown> | null> }) {
  const start = Date.parse(shift.startedAt);
  const end = Date.parse(shift.endsAt);
  const left = Math.max(0, Math.round((end - now) / 1000));
  const elapsedPct = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));

  const total = shift.incidents.length;
  const resolved = shift.incidents.filter((i) => i.resolved).length;
  const withinSla = shift.incidents.filter((i) => (i.resolved ? i.onTime : !i.overdue)).length;
  const hintsUsed = shift.incidents.reduce((s, i) => s + i.hintsUsed, 0);

  // Stable incident numbers follow the server's creation order.
  const numOf = new Map(shift.incidents.map((i, idx) => [i.defId, incNo(idx)]));

  // Order: unresolved by severity first, then resolved.
  const order = { P1: 0, P2: 1, P3: 2 };
  const queue = [...shift.incidents].sort((a, b) => (a.resolved === b.resolved ? order[a.severity] - order[b.severity] : a.resolved ? 1 : -1));

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = queue.find((i) => i.defId === selectedId) ?? queue.find((i) => !i.resolved) ?? queue[0] ?? null;

  return (
    <div className="shift-app" data-academy-theme={theme}>
      <header className="sh-top">
        <div className="sh-brand">
          <span className="sh-logo">P</span>
          <div className="sh-top__title">
            <p className="sh-top__name">Night shift · PurveX Financial</p>
            <p className="sh-top__sub">Help desk and SOC tier 1 · Level {shift.level}</p>
          </div>
        </div>
        <div className="sh-top__right">
          <span className="sh-online"><Monitor className="h-4 w-4" /> Lab online</span>
          <div className={`sh-clock ${left <= 60 ? "sh-clock--low" : ""}`}>
            <span className="sh-clock__label">Shift ends in</span>
            <span className="sh-clock__time">{clock(left)}</span>
          </div>
          <button type="button" className="sh-end" disabled={busy} onClick={() => post({ action: "finish" })}>
            End shift
          </button>
        </div>
        <div className="sh-prog" aria-hidden="true">
          <div className={`sh-prog__fill ${left <= 60 ? "sh-prog__fill--low" : ""}`} style={{ width: `${elapsedPct}%` }} />
        </div>
      </header>

      <div className="sh-body">
        <aside className="sh-side">
          <div className="sh-stats">
            <div className="sh-stat">
              <span className="sh-stat__num">{resolved}/{total}</span>
              <span className="sh-stat__label">Closed</span>
            </div>
            <div className="sh-stat">
              <span className="sh-stat__num">{withinSla}</span>
              <span className="sh-stat__label">Within SLA</span>
            </div>
            <div className="sh-stat">
              <span className="sh-stat__num">{hintsUsed}</span>
              <span className="sh-stat__label">Hints used</span>
            </div>
          </div>

          {queue.length === 0 ? (
            <p className="sh-waiting"><Loader2 className="h-4 w-4 animate-spin" /> Watching the queue…</p>
          ) : (
            <ul className="sh-list" role="tablist" aria-label="Incident queue">
              {queue.map((inc) => {
                const deadlineAt = start + (inc.arriveSec + inc.deadlineSec) * 1000;
                const secs = inc.resolved ? null : Math.max(0, Math.round((deadlineAt - now) / 1000));
                const isSel = selected?.defId === inc.defId;
                const urgent = !inc.resolved && !inc.acknowledged && inc.severity === "P1";
                const cls = ["sh-li", `sh-li--sev-${inc.severity.toLowerCase()}`, isSel && "sh-li--on", inc.resolved && "sh-li--done", urgent && "sh-li--urgent"].filter(Boolean).join(" ");
                return (
                  <li key={inc.defId}>
                    <button type="button" role="tab" aria-selected={isSel} className={cls} onClick={() => setSelectedId(inc.defId)}>
                      <span className="sh-li__top">
                        <span className={`sh-tag sh-tag--${inc.kind}`}>{inc.kind}</span>
                        <span className="sh-li__no">{numOf.get(inc.defId)}</span>
                        {inc.resolved ? (
                          <span className="sh-status sh-status--done">Solved</span>
                        ) : secs !== null ? (
                          <span className={`sh-li__timer ${secs <= 60 ? "sh-li__timer--low" : ""}`}>{clock(secs)} left</span>
                        ) : null}
                      </span>
                      <span className="sh-li__title">{inc.title}</span>
                      <span className="sh-li__from">{sender(inc).name}{sender(inc).role ? ` · ${sender(inc).role}` : ""}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="sh-sidenote">New tickets arrive during the shift, some of them without warning.</p>
        </aside>

        <main className="sh-main">
          {error && <p className="sh-error">{error}</p>}
          {selected ? (
            <IncidentDetail key={selected.defId} inc={selected} no={numOf.get(selected.defId) ?? ""} start={start} now={now} busy={busy} post={post} />
          ) : (
            <p className="sh-waiting sh-waiting--big"><Loader2 className="h-4 w-4 animate-spin" /> The first incident will land shortly.</p>
          )}
        </main>
      </div>
    </div>
  );
}

type SubmitResult = { resolved: boolean; onTime: boolean; waiting: boolean; results: { label: string; ok: boolean }[] };

function IncidentDetail({ inc, no, start, now, busy, post }: { inc: Incident; no: string; start: number; now: number; busy: boolean; post: (p: Record<string, unknown>) => Promise<Record<string, unknown> | null> }) {
  const [diagnosis, setDiagnosis] = useState(inc.diagnosis);
  const [response, setResponse] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [hints, setHints] = useState<string[]>(inc.shownHints);

  const deadlineAt = start + (inc.arriveSec + inc.deadlineSec) * 1000;
  const left = inc.resolved ? null : Math.max(0, Math.round((deadlineAt - now) / 1000));
  const late = left === 0 && !inc.resolved;
  const s = sender(inc);

  // Opening an incident acknowledges it (starts the "working" state). No button; matches the desk.
  useEffect(() => {
    if (!inc.resolved && !inc.acknowledged) void post({ action: "ack", defId: inc.defId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inc.defId]);

  async function submit(escalate = false) {
    let note = response;
    if (escalate) {
      const base = response.trim() || "Contained in the lab and handed the evidence to tier 2.";
      note = /escalat/i.test(base) ? base : `${base}\n\nEscalated to tier 2.`;
      setResponse(note);
    }
    const data = await post({ action: "submit", defId: inc.defId, diagnosis, response: note });
    if (data?.result) setResult(data.result as SubmitResult);
  }
  async function coach() {
    const data = await post({ action: "hint", defId: inc.defId });
    if (data && typeof data.hint === "string") setHints((h) => [...h, data.hint as string]);
  }

  return (
    <div className={`sh-detail ${inc.resolved ? "sh-detail--done" : ""}`}>
      <div className="sh-detail__crumbs">
        <span className={`sh-tag sh-tag--${inc.kind}`}>{inc.kind}</span>
        <span className="sh-detail__no">{no}</span>
        <span className="sh-detail__skill">Skill: {skillOf(inc.kind)}</span>
        {inc.attack && (
          <a
            className="sh-attack"
            href={`https://attack.mitre.org/techniques/${inc.attack.id.replace(".", "/")}/`}
            target="_blank"
            rel="noreferrer"
            title={`MITRE ATT&CK ${inc.attack.id}: ${inc.attack.name}`}
          >
            ATT&CK {inc.attack.id} · {inc.attack.name}
          </a>
        )}
        <span className={`sh-sev ${SEV_CLASS[inc.severity]}`}>{inc.severity}</span>
        {inc.resolved ? (
          <span className="sh-status sh-status--done"><Check className="h-3.5 w-3.5" /> Solved</span>
        ) : (
          <span className={`sh-detail__left ${late ? "sh-detail__left--late" : left !== null && left <= 60 ? "sh-detail__left--low" : ""}`}>
            {late ? "SLA breached" : `${clock(left ?? 0)} left`}
          </span>
        )}
      </div>

      <h2 className="sh-detail__title">{inc.title}</h2>

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
        </div>
      </div>

      {inc.resolved ? (
        <p className="sh-resolved"><Check className="h-4 w-4" /> Handled. It counts toward your shift score.</p>
      ) : (
        <div className="sh-work">
          <div className="sh-lab">
            <p className="sh-lab__head">In your lab</p>
            <p className="sh-lab__note">Make the change on your domain controller, then <strong>Check my fix</strong>. Range reads your live lab, not a checkbox.</p>
            <label className="sh-field">
              <span>{inc.diagnosisPrompt}</span>
              <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Your finding" autoComplete="off" />
            </label>
          </div>

          <label className="sh-field">
            <span>Closing note</span>
            <textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={3} placeholder="What happened, what you changed, and what the next person should check." />
          </label>

          {hints.length > 0 && (
            <ul className="sh-hints">
              {hints.map((h, i) => (
                <li key={i}><LifeBuoy className="h-3.5 w-3.5" /> {h}</li>
              ))}
            </ul>
          )}

          {result && !result.resolved && (
            <div className="sh-result sh-result--wait">
              {result.waiting ? "Waiting for your lab to report the change. Make the fix, then check again in about a minute." : "Your lab does not show this fix yet:"}
              {!result.waiting && <ul>{result.results.filter((r) => !r.ok).map((r, i) => <li key={i}>{r.label}</li>)}</ul>}
            </div>
          )}

          <div className="sh-actions">
            <button type="button" className="sh-submit" disabled={busy} onClick={() => submit(false)}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Check my fix
            </button>
            <button type="button" className="sh-escalate" disabled={busy} onClick={() => submit(true)}>
              Escalate
            </button>
            {inc.nextHintCostPct !== null && (
              <button type="button" className="sh-coach" disabled={busy} onClick={coach}>
                <LifeBuoy className="h-3.5 w-3.5" /> Ask Coach (−{inc.nextHintCostPct}%)
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- report ---------------------------------------------------------------

function ShiftReport({ theme, report, onAgain, busy }: { theme: "light" | "dark"; report: Report; onAgain: () => void; busy: boolean }) {
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
            <p className="sh-report__sub">{report.resolvedCount} of {report.incidents.length} closed · {report.onTimeCount} within SLA</p>
          </div>
        </header>

        <div className="sh-report__rows">
          {report.incidents.map((i, n) => (
            <div key={n} className="sh-rep">
              <span className={`sh-sev ${SEV_CLASS[i.severity as Sev] ?? ""}`}>{i.severity}</span>
              <span className="sh-rep__title">{i.title}</span>
              <span className="sh-rep__tags">
                <em className={i.resolved ? "ok" : "no"}>{i.resolved ? "Solved" : "Missed"}</em>
                {i.resolved && <em className={i.onTime ? "ok" : "no"}>{i.onTime ? "On time" : "Late"}</em>}
                {!i.noHarm && <em className="no">Collateral</em>}
                {i.resolved && !i.diagnosisRight && <em className="no">Weak diagnosis</em>}
                {i.hintsUsed > 0 && <em className="hint">{i.hintsUsed} hint{i.hintsUsed === 1 ? "" : "s"}</em>}
              </span>
              <span className="sh-rep__score">{i.score}<small>/{i.max}</small></span>
            </div>
          ))}
        </div>

        <p className="sh-report__habit"><strong>One habit to work on:</strong> {report.habit}</p>
        <div className="sh-report__actions">
          <button type="button" className="sh-go" disabled={busy} onClick={onAgain}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Start another shift <ArrowRight className="h-4 w-4" />
          </button>
          <Link href="/academy" className="sh-report__leave"><ArrowLeft className="h-3.5 w-3.5" /> Back to Academy</Link>
        </div>
      </div>
    </div>
  );
}

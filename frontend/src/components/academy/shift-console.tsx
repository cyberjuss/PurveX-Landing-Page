"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ArrowRight, Check, Clock, Loader2, LifeBuoy, ShieldAlert, Ticket } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import "./shift.css";

type Sev = "P1" | "P2" | "P3";
type Incident = {
  defId: string;
  kind: "alert" | "ticket";
  severity: Sev;
  from: string;
  title: string;
  brief: string;
  diagnosisPrompt: string;
  arriveSec: number;
  deadlineSec: number;
  acknowledged: boolean;
  resolved: boolean;
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

const LEVELS = ["Foundation", "Standard", "Hard", "Expert"];
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function useNow(on: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!on) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [on]);
  return now;
}

export function ShiftConsole() {
  const [available, setAvailable] = useState<boolean | null>(null);
  const [shift, setShift] = useState<Shift | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finishing = useRef(false);

  const load = useCallback(async () => {
    try {
      const r = await academyFetch("/academy/api/shift");
      const data = await r.json();
      setAvailable(Boolean(data.available));
      if (data.available) setShift(data.shift ?? null);
    } catch {
      setAvailable(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const active = shift?.status === "active";
  const now = useNow(active);

  // Poll while active to pull newly arrived incidents and server-side state.
  useEffect(() => {
    if (!active) return;
    const t = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(t);
  }, [active, load]);

  const post = useCallback(
    async (payload: Record<string, unknown>) => {
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
    },
    []
  );

  // End the shift automatically the moment the clock runs out.
  useEffect(() => {
    if (!active || !shift) return;
    const left = Date.parse(shift.endsAt) - Date.now();
    if (left <= 0 && !finishing.current) {
      finishing.current = true;
      void post({ action: "finish" });
      return;
    }
    const t = window.setTimeout(() => {
      if (!finishing.current) {
        finishing.current = true;
        void post({ action: "finish" });
      }
    }, Math.max(0, left));
    return () => window.clearTimeout(t);
  }, [active, shift, post]);

  if (available === null) return <div className="sh"><p className="sh-loading"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</p></div>;
  if (!available)
    return (
      <div className="sh">
        <div className="sh-intro">
          <h1>Shift</h1>
          <p>Shifts run in your hosted lab, and hosted labs are not on for this account yet. Ask your instructor.</p>
        </div>
      </div>
    );

  if (shift?.status === "done" && shift.report) return <ShiftReport report={shift.report} onAgain={() => post({ action: "start" })} busy={busy} />;
  if (active && shift) return <ActiveShift shift={shift} now={now} busy={busy} error={error} post={post} />;

  return (
    <div className="sh">
      <div className="sh-intro">
        <p className="sh-kicker">PurveX Financial · Security Operations</p>
        <h1>Start your shift</h1>
        <p className="sh-lede">You are on the desk for 15 minutes. Incidents arrive on their own: alerts from the SIEM, tickets from staff. Investigate each one in your lab, act, and write it up before its deadline. A hint costs points, like asking a senior analyst.</p>
        <ul className="sh-rules">
          <li><ShieldAlert className="h-4 w-4" /> Real incidents, fired into your own lab</li>
          <li><Clock className="h-4 w-4" /> 15 minutes · P1 in 5, P2 in 8, P3 in 12</li>
          <li><LifeBuoy className="h-4 w-4" /> Hints cost 10%, 20%, then 40%</li>
        </ul>
        {error && <p className="sh-error">{error}</p>}
        <button type="button" className="sh-go" disabled={busy} onClick={() => post({ action: "start" })}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Start shift <ArrowRight className="h-4 w-4" />
        </button>
        <p className="sh-note">Your lab must be Online. It stays as you left it; incidents are cleaned up when the shift ends.</p>
      </div>
    </div>
  );
}

function ActiveShift({ shift, now, busy, error, post }: { shift: Shift; now: number; busy: boolean; error: string | null; post: (p: Record<string, unknown>) => Promise<Record<string, unknown> | null> }) {
  const left = Math.max(0, Math.round((Date.parse(shift.endsAt) - now) / 1000));
  const start = Date.parse(shift.startedAt);
  const queue = [...shift.incidents].sort((a, b) => (a.resolved === b.resolved ? 0 : a.resolved ? 1 : -1));
  const open = shift.incidents.filter((i) => !i.resolved).length;
  return (
    <div className="sh sh--active">
      <header className="sh-bar">
        <div>
          <p className="sh-kicker">On shift · {LEVELS[shift.level - 1] ?? "Standard"}</p>
          <p className="sh-bar__open">{open ? `${open} open incident${open === 1 ? "" : "s"}` : "Queue clear"}</p>
        </div>
        <div className={`sh-timer ${left <= 60 ? "sh-timer--low" : ""}`}>
          <Clock className="h-4 w-4" />
          {clock(left)}
        </div>
        <button type="button" className="sh-end" disabled={busy} onClick={() => post({ action: "finish" })}>
          End shift
        </button>
      </header>
      {error && <p className="sh-error">{error}</p>}
      {queue.length === 0 ? (
        <p className="sh-waiting"><Loader2 className="h-4 w-4 animate-spin" /> Watching the queue. The first incident will land shortly.</p>
      ) : (
        <div className="sh-queue">
          {queue.map((inc) => (
            <IncidentCard key={inc.defId} inc={inc} start={start} now={now} busy={busy} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

const SEV_CLASS: Record<Sev, string> = { P1: "sh-sev--p1", P2: "sh-sev--p2", P3: "sh-sev--p3" };

type SubmitResult = { resolved: boolean; onTime: boolean; waiting: boolean; results: { label: string; ok: boolean }[] };

function IncidentCard({ inc, start, now, busy, post }: { inc: Incident; start: number; now: number; busy: boolean; post: (p: Record<string, unknown>) => Promise<Record<string, unknown> | null> }) {
  const [diagnosis, setDiagnosis] = useState(inc.diagnosis);
  const [response, setResponse] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [hints, setHints] = useState<string[]>(inc.shownHints);

  const deadlineAt = start + (inc.arriveSec + inc.deadlineSec) * 1000;
  const left = inc.resolved ? null : Math.max(0, Math.round((deadlineAt - now) / 1000));
  const late = left === 0 && !inc.resolved;

  async function submit() {
    const data = await post({ action: "submit", defId: inc.defId, diagnosis, response });
    if (data?.result) setResult(data.result as SubmitResult);
  }
  async function hint() {
    const data = await post({ action: "hint", defId: inc.defId });
    if (data && typeof data.hint === "string") setHints((h) => [...h, data.hint as string]);
  }

  return (
    <section className={`sh-card ${inc.resolved ? "sh-card--done" : ""}`}>
      <header className="sh-card__head">
        <span className={`sh-sev ${SEV_CLASS[inc.severity]}`}>{inc.severity}</span>
        <span className="sh-card__kind">
          {inc.kind === "ticket" ? <Ticket className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {inc.kind === "ticket" ? "Help desk ticket" : "SIEM alert"}
        </span>
        <span className="sh-card__from">{inc.from}</span>
        {inc.resolved ? (
          <span className="sh-card__state sh-card__state--done"><Check className="h-3.5 w-3.5" /> Resolved</span>
        ) : (
          <span className={`sh-card__timer ${left !== null && left <= 60 ? "sh-card__timer--low" : ""} ${late ? "sh-card__timer--late" : ""}`}>
            {late ? "Overdue" : left !== null ? clock(left) : ""}
          </span>
        )}
      </header>
      <h3 className="sh-card__title">{inc.title}</h3>
      <p className="sh-card__brief">{inc.brief}</p>

      {inc.resolved ? (
        <p className="sh-card__resolved"><Check className="h-4 w-4" /> Handled. It counts toward your shift score.</p>
      ) : !inc.acknowledged ? (
        <button type="button" className="sh-ack" disabled={busy} onClick={() => post({ action: "ack", defId: inc.defId })}>
          Acknowledge and start the clock
        </button>
      ) : (
        <div className="sh-work">
          <label className="sh-field">
            <span>{inc.diagnosisPrompt}</span>
            <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Your finding" autoComplete="off" />
          </label>
          <label className="sh-field">
            <span>What did you do? Name the evidence, the action, and whether you escalated.</span>
            <textarea value={response} onChange={(e) => setResponse(e.target.value)} rows={3} placeholder="Investigated…, found…, so I…, and escalated because…" />
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
              {result.waiting ? "Waiting for your lab to report the change. Make the fix, then submit again in about a minute." : "Not resolved yet:"}
              {!result.waiting && (
                <ul>{result.results.filter((r) => !r.ok).map((r, i) => <li key={i}>{r.label}</li>)}</ul>
              )}
            </div>
          )}

          <div className="sh-actions">
            <button type="button" className="sh-submit" disabled={busy} onClick={submit}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Submit response
            </button>
            {inc.nextHintCostPct !== null && (
              <button type="button" className="sh-hint" disabled={busy} onClick={hint}>
                <LifeBuoy className="h-3.5 w-3.5" /> Hint (−{inc.nextHintCostPct}%)
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function ShiftReport({ report, onAgain, busy }: { report: Report; onAgain: () => void; busy: boolean }) {
  const pct = report.maxScore ? Math.round((report.totalScore / report.maxScore) * 100) : 0;
  return (
    <div className="sh">
      <div className="sh-report">
        <header className="sh-report__head">
          <p className="sh-kicker">Shift report</p>
          <p className="sh-report__score">
            {report.totalScore}
            <span>/ {report.maxScore}</span>
          </p>
          <p className="sh-report__headline">{report.headline}</p>
          <p className="sh-report__sub">{report.resolvedCount} of {report.incidents.length} resolved · {report.onTimeCount} within the deadline · {pct}%</p>
        </header>

        <div className="sh-report__rows">
          {report.incidents.map((i, n) => (
            <div key={n} className="sh-rep">
              <span className={`sh-sev ${SEV_CLASS[i.severity as Sev] ?? ""}`}>{i.severity}</span>
              <span className="sh-rep__title">{i.title}</span>
              <span className="sh-rep__tags">
                <em className={i.resolved ? "ok" : "no"}>{i.resolved ? "Resolved" : "Missed"}</em>
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
        <button type="button" className="sh-go" disabled={busy} onClick={onAgain}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Start another shift <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

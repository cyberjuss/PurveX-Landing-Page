"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Check, ChevronRight, Database, Loader2, Play, Search, Table2, Zap } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import type { CasePublic, QueryResult } from "@/lib/siem/types";
import "./siem-console.css";

type Load = { mode: "mock" | "live"; cases: { id: string; title: string }[]; caseId: string; current: CasePublic | null };

export function SiemConsole() {
  const [load, setLoad] = useState<Load | null>(null);
  const [caseId, setCaseId] = useState<string>("");
  const [kql, setKql] = useState<string>("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [fired, setFired] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const fetchCase = useCallback(async (id?: string) => {
    const r = await academyFetch(`/academy/api/siem${id ? `?case=${encodeURIComponent(id)}` : ""}`);
    if (!r.ok) return;
    const data: Load = await r.json();
    setLoad(data);
    setCaseId(data.caseId);
    if (data.current?.examples[0] && !id) setKql(data.current.examples[0].kql);
  }, []);

  useEffect(() => { void fetchCase(); }, [fetchCase]);

  const current = load?.current ?? null;

  const run = useCallback(async () => {
    if (!caseId || !kql.trim()) return;
    setRunning(true);
    setQueryError(null);
    try {
      const r = await academyFetch("/academy/api/siem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "query", case: caseId, kql }) });
      const data = await r.json();
      if (data.queryError) { setQueryError(data.queryError); setResult(null); }
      else if (data.result) { setResult(data.result); }
    } finally {
      setRunning(false);
    }
  }, [caseId, kql]);

  const fire = useCallback(async () => {
    if (!caseId) return;
    setFired("…");
    const r = await academyFetch("/academy/api/siem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "fire", case: caseId }) });
    const data = await r.json();
    setFired(data.fired ? `${data.fired.added} new events arrived. Re-run your query.` : "This case has no live stage.");
    window.setTimeout(() => setFired(null), 6000);
  }, [caseId]);

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); void run(); }
  };

  const useExample = (q: string) => { setKql(q); editorRef.current?.focus(); };

  if (!load) return <div className="siem-loading"><Loader2 className="siem-spin" size={20} /> Loading the SIEM…</div>;

  return (
    <div className="siem">
      <header className="siem-top">
        <div className="siem-top__title">
          <Search size={18} />
          <div>
            <h1>Range SIEM</h1>
            <p>Query your logs the way you would in Microsoft Sentinel.</p>
          </div>
        </div>
        <div className="siem-top__right">
          {load.mode === "mock" && <span className="siem-badge" title="Local practice data. In production this is your own Sentinel workspace.">Practice data</span>}
          <select className="siem-case" value={caseId} onChange={(e) => { setResult(null); void fetchCase(e.target.value); }}>
            {load.cases.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
      </header>

      {current && (
        <p className="siem-story">{current.story}</p>
      )}

      <div className="siem-grid">
        <aside className="siem-schema" aria-label="Tables and columns">
          <h2><Database size={14} /> Tables</h2>
          {current?.tables.map((t) => (
            <details key={t.name} className="siem-table">
              <summary><Table2 size={13} /> {t.name}</summary>
              <p className="siem-table__about">{t.about}</p>
              <ul>
                {t.columns.map((c) => (
                  <li key={c.name}><button type="button" onClick={() => useExample(`${t.name}\n| where ${c.name} == ""`)}><code>{c.name}</code> <span>{c.type}</span></button><em>{c.about}</em></li>
                ))}
              </ul>
            </details>
          ))}
        </aside>

        <section className="siem-main">
          <div className="siem-examples">
            <span>Try:</span>
            {current?.examples.map((ex) => (
              <button key={ex.label} type="button" className="siem-chip" onClick={() => useExample(ex.kql)}>{ex.label}</button>
            ))}
          </div>

          <div className="siem-editor">
            <textarea ref={editorRef} value={kql} onChange={(e) => setKql(e.target.value)} onKeyDown={onKey} spellCheck={false} aria-label="KQL query" placeholder="SecurityEvent | where EventID == 4625" />
            <div className="siem-editor__bar">
              <button type="button" className="siem-run" onClick={() => void run()} disabled={running}>{running ? <Loader2 className="siem-spin" size={15} /> : <Play size={15} />} Run <kbd>Ctrl+Enter</kbd></button>
              <button type="button" className="siem-fire" onClick={() => void fire()} title="Simulate new events arriving, as they would from a live lab."><Zap size={14} /> Run scenario (sim)</button>
            </div>
          </div>
          {fired && <p className="siem-fired"><Zap size={13} /> {fired}</p>}

          {queryError && <p className="siem-qerror"><AlertTriangle size={14} /> {queryError}</p>}

          {result && <Results result={result} />}
        </section>

        <aside className="siem-alerts" aria-label="Incident queue">
          <h2><AlertTriangle size={14} /> Incidents</h2>
          {current?.alerts.map((a) => (
            <div key={a.id} className={`siem-alert siem-alert--${a.severity.toLowerCase()}`}>
              <div className="siem-alert__sev">{a.severity}</div>
              <h3>{a.title}</h3>
              {a.attack && <span className="siem-alert__attack">{a.attack.id} · {a.attack.name}</span>}
              <p className="siem-alert__ent">{a.entities.join(" · ")}</p>
            </div>
          ))}
          {current && <Findings caseId={caseId} alerts={current.alerts.length} prompts={current.findings ?? []} />}
        </aside>
      </div>
    </div>
  );
}

function Results({ result }: { result: QueryResult }) {
  const max = useMemo(() => {
    const nums = result.columns.filter((c) => result.rows.every((r) => typeof r[c] === "number"));
    return nums.length === 1 ? Math.max(1, ...result.rows.map((r) => Number(r[nums[0]]))) : 0;
  }, [result]);
  if (!result.rows.length) return <p className="siem-empty">No rows matched. Loosen a filter and run it again.</p>;
  return (
    <div className="siem-results">
      <div className="siem-results__meta">{result.rows.length} row{result.rows.length === 1 ? "" : "s"}{result.truncated ? " (first 500 shown)" : ""} · scanned {result.scanned.toLocaleString()}</div>
      <div className="siem-results__scroll">
        <table>
          <thead><tr>{result.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {result.rows.map((row, i) => (
              <tr key={i}>{result.columns.map((c) => <td key={c} title={String(row[c] ?? "")}>{String(row[c] ?? "")}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      {max > 0 && (
        <div className="siem-spark" aria-hidden="true">
          {result.rows.slice(0, 40).map((r, i) => {
            const n = result.columns.find((c) => typeof r[c] === "number");
            return <span key={i} style={{ height: `${Math.max(3, (Number(r[n!]) / max) * 100)}%` }} />;
          })}
        </div>
      )}
    </div>
  );
}

function Findings({ caseId, alerts, prompts }: { caseId: string; alerts: number; prompts: { id: string; prompt: string }[] }) {
  // The flags for this case. The prompts come from the server with the case; the
  // console only ever learns right/wrong plus an optional nudge, never the answer.
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [state, setState] = useState<Record<string, { ok: boolean; note: string | null }>>({});
  const submit = async (id: string) => {
    const r = await academyFetch("/academy/api/siem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "check", case: caseId, findingId: id, answer: answers[id] ?? "" }) });
    const data = await r.json();
    setState((s) => ({ ...s, [id]: { ok: !!data.correct, note: data.feedback ?? null } }));
  };
  if (!prompts.length) return null;
  return (
    <div className="siem-findings">
      <h2><Check size={14} /> Report your findings</h2>
      {prompts.map((p) => {
        const st = state[p.id];
        return (
          <div key={p.id} className={`siem-finding${st?.ok ? " siem-finding--ok" : ""}`}>
            <p>{p.prompt}</p>
            {st?.ok ? (
              <span className="siem-finding__done"><Check size={13} /> Confirmed</span>
            ) : (
              <>
                <div className="siem-finding__row">
                  <input value={answers[p.id] ?? ""} onChange={(e) => setAnswers((a) => ({ ...a, [p.id]: e.target.value }))} placeholder="your answer" aria-label={p.prompt} />
                  <button type="button" onClick={() => void submit(p.id)}><ChevronRight size={15} /></button>
                </div>
                {st?.note && <p className="siem-finding__note">{st.note}</p>}
              </>
            )}
          </div>
        );
      })}
      <p className="siem-findings__hint">{alerts} alerts are open. Use the tables to prove what happened, then report it here.</p>
    </div>
  );
}

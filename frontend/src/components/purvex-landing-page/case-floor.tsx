"use client";

import { useEffect, useState } from "react";
import { FLOOR_CSS } from "./case-floor-css";

export type FloorCase = {
  id: string;
  sev: string;
  status: string;
  title: string;
  fields: { k: string; v: string }[];
  body: string;
  ask: string;
};

export type FloorAlert = { title: string; sev: string; time: string; id: string; acct: string; host: string };

function pickPair(alerts: FloorAlert[], avoid: string[] = []) {
  const pool = alerts.filter((a) => !avoid.includes(a.title));
  const src = pool.length >= 2 ? pool : alerts;
  const first = src[Math.floor(Math.random() * src.length)];
  const rest = src.filter((a) => a.title !== first.title);
  const second = rest[Math.floor(Math.random() * rest.length)];
  return [first, second];
}

function Case({ cases }: { cases: FloorCase[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % cases.length), 4200);
    return () => window.clearInterval(id);
  }, [cases.length]);

  const item = cases[i];

  return (
    <div className="cf-case">
      <span className="cf-case__stack" aria-hidden />
      <span className="cf-case__stack cf-case__stack--2" aria-hidden />
      <article key={item.id} className="cf-ticket">
        <header className="cf-ticket__bar">
          <span>{item.id}</span>
          <span data-sev={item.sev}>{item.sev}</span>
          <span>{item.status}</span>
        </header>
        <div className="cf-ticket__sheet">
          <h2>{item.title}</h2>
          <dl className="cf-ticket__grid">
            {item.fields.map((f) => (
              <div key={f.k}>
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
          <p className="cf-ticket__body">{item.body}</p>
          <p className="cf-ticket__ask">{item.ask}</p>
        </div>
      </article>
    </div>
  );
}

function Dock({ alerts, label }: { alerts: FloorAlert[]; label: string }) {
  const [rows, setRows] = useState(() => [alerts[0], alerts[1]]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const next = () => {
      setRows((cur) => pickPair(alerts, cur.map((r) => r.title)));
      setTick((n) => n + 1);
    };
    next();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(next, 2800);
    return () => window.clearInterval(id);
  }, [alerts]);

  return (
    <div className="cf-dock">
      <p>
        <span className="cf-dock__live" /> {label}
      </p>
      {rows.map((row, idx) => (
        <div key={`${tick}-${row.title}-${idx}`} className="cf-dock__row">
          <strong>{row.title}</strong>
          <em data-sev={row.sev}>{row.sev}</em>
          <span>{row.time}</span>
          <span>{row.id}</span>
          <span>{row.acct}</span>
          <span>{row.host}</span>
        </div>
      ))}
    </div>
  );
}

/** The home page hero panel: a rotating ticket over a live queue. Pass each tab its own content. */
export function CaseFloor({ cases, alerts, label }: { cases: FloorCase[]; alerts: FloorAlert[]; label: string }) {
  return (
    <>
      <aside className="cf-floor" aria-hidden="true">
        <div className="cf-floor__wash" />
        <Case cases={cases} />
        <Dock alerts={alerts} label={label} />
      </aside>
      <style>{FLOOR_CSS}</style>
    </>
  );
}

export const DETECTION_CASES: FloorCase[] = [
  {
    id: "RUN-14",
    sev: "Crit",
    status: "Missed",
    title: "LSASS memory access",
    fields: [
      { k: "Technique", v: "T1003.001" },
      { k: "Host", v: "WIN-DC02" },
      { k: "Rule", v: "Exists" },
      { k: "Alert", v: "None" },
    ],
    body: "The rule is in place, but the ingest path is not. That is the miss.",
    ask: "Fix the ingest before you touch the rule.",
  },
  {
    id: "RUN-15",
    sev: "High",
    status: "Fired",
    title: "PowerShell execution",
    fields: [
      { k: "Technique", v: "T1059.001" },
      { k: "Host", v: "WIN-APP08" },
      { k: "Rule", v: "Exists" },
      { k: "Alert", v: "Fired" },
    ],
    body: "The rule fired within seconds of the test.",
    ask: "Keep the evidence and schedule the next run.",
  },
  {
    id: "RUN-16",
    sev: "High",
    status: "Noisy",
    title: "Scheduled task creation",
    fields: [
      { k: "Technique", v: "T1053.005" },
      { k: "Host", v: "WIN-WKS12" },
      { k: "Rule", v: "Exists" },
      { k: "Alerts", v: "41 a day" },
    ],
    body: "One rule produces most of the noise in the queue.",
    ask: "Tune it so that real alerts stop getting buried.",
  },
];

export const DETECTION_ALERTS: FloorAlert[] = [
  { title: "PowerShell execution", sev: "High", time: "09:02", id: "T1059.001", acct: "Fired", host: "WIN-APP08" },
  { title: "LSASS memory access", sev: "Crit", time: "09:04", id: "T1003.001", acct: "Missed", host: "WIN-DC02" },
  { title: "Scheduled task creation", sev: "High", time: "09:07", id: "T1053.005", acct: "Fired", host: "WIN-WKS12" },
  { title: "WMI persistence", sev: "Med", time: "09:11", id: "T1546.003", acct: "Fired", host: "WIN-SQL04" },
  { title: "Registry run key", sev: "High", time: "09:15", id: "T1547.001", acct: "Missed", host: "WIN-FS03" },
];

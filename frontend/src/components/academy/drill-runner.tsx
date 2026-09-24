"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, Check, ClipboardList, Flame, Timer, X } from "lucide-react";
import { useCoach } from "@/components/academy/coach-context";
import { academyFetch, localDay, READINESS_PATH } from "@/lib/academy-client";
import { SKILLS, type Skill } from "@/lib/academy-score";

export type DrillStatus = {
  stats: {
    days: string[];
    streak: number;
    longest: number;
    total: number;
    today: DrillEntry | null;
    bestTimed: DrillEntry | null;
    lastTimed: DrillEntry | null;
    lastDay: string | null;
  };
  lab: { synced: boolean; syncedAt: string | null; ago: string | null; days: number | null; security: boolean; events: boolean; verified?: boolean };
  focus: string | null;
  level: { n: number; name: string };
  ctf: { week: string; entry: DrillEntry | null };
  report: Report;
  missed: Missed[];
  chats: { base: number; bonus: number; parts: { label: string; n: number }[] };
  incidentUntil: string | null;
  jobs: JobRow[];
  nextJob: string | null;
  findings: Finding[];
};

type Finding = { id: string; severity: "high" | "medium" | "low"; title: string; facts: string; fixable: boolean; job: string };

type JobRow = { id: string; label: string; skill: Skill; lab: boolean; security: boolean; status: "new" | "practiced" | "proven"; correct: number; asked: number };

type Missed = { day: string; mode: string; title: string; skill: Skill; prompt: string; picked: string; answer: string; explain: string };

type Report = {
  from: string;
  to: string;
  drills: number;
  daysActive: number;
  asked: number;
  correct: number;
  accuracy: number | null;
  levelName: string;
  skills: { skill: Skill; label: string; asked: number; correct: number; pct: number | null }[];
  weakest: { label: string; pct: number | null } | null;
  themes: { theme: string; missed: number; asked: number }[];
  next: string;
};

type Mode = "daily" | "timed" | "ctf";
const MODE_LABEL: Record<string, string> = { daily: "Daily scenario", timed: "Incident drill", ctf: "Weekly CTF", coach: "Practice" };

type DrillEntry = { id: string; day: string; mode: string; correct: number; total: number; seconds: number; detail?: { t: string }[] };
type Item = { skill: Skill; title: string; story?: string; prompt: string; evidence?: string[]; choices: string[]; free?: boolean; format?: string; kind?: "decide" | "respond" | "change"; long?: boolean; checklist?: string[]; checkCount?: number; setup?: { note: string; script: string }; job?: string; gated?: boolean };
type TaskInfo = { setup?: { note: string; script: string }; checklist?: string[]; checkCount?: number };
type CheckRes = { needsSetup?: boolean; fresh: boolean; results: { label: string; ok: boolean }[]; syncedAgo: string | null; passed: boolean };
type Review = { title: string; skill: Skill; picked: string | null; answer: string; correct: boolean; explain: string; runbook?: string[] };
type Run = { mode: Mode; token: string; items: Item[]; limit: number; ai: boolean; startedAt: number };
type Result = { entry: DrillEntry; review: Review[]; late: boolean; counted: boolean; items: Item[] } & DrillStatus;

export { localDay };

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const LETTERS = ["A", "B", "C", "D"];

export function scoreLabel(e: DrillEntry) {
  return e.total === 1 ? (e.correct ? "Correct" : "Missed") : `${e.correct}/${e.total}`;
}

export function drillPassed(e: DrillEntry) {
  return e.total > 0 && e.correct * 2 >= e.total;
}

export function labLine(lab: DrillStatus["lab"]) {
  if (!lab.synced) return "";
  const stale = lab.days !== null && lab.days >= 7;
  return `Written from your lab. It last checked in ${lab.ago}.${stale ? " Turn your domain controller on to refresh it." : ""}`;
}

export function streakLine(s: DrillStatus["stats"]) {
  if (s.today) return s.streak > 1 ? `${s.streak} days in a row. See you tomorrow.` : "Done for today. Come back tomorrow to start a streak.";
  if (s.streak > 0) return `${s.streak}-day streak. Do today's scenario to keep it.`;
  if (s.total > 0) return "Your streak reset. Start a new one today.";
  return "One scenario a day. About two minutes.";
}

function lastSeven() {
  const out: { day: string; label: string; date: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({
      day: localDay(d),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: String(d.getDate()),
    });
  }
  return out;
}

function TaskPanel({ task, checkRes }: { task: TaskInfo; checkRes: CheckRes | null }) {
  return (
    <div className="dr-task">
      <span className="rd-kicker">Fix it in your lab</span>
      {task.checklist ? (
        <ul className="dr-task__list">
          {task.checklist.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      ) : (
        <p>
          You are checked on the result: {task.checkCount} things must be true when you are done. Work out what the job needs.
        </p>
      )}
      <p className="dr-task__sync">
        Your lab reports about every minute. Make the change, wait for it to report, then check.
      </p>
      {checkRes && (
        <div className="dr-checks">
          {checkRes.needsSetup && (
            <p className="dr-checks__stale">
              Your lab reported, but the practice account is not there yet. Run the setup script on the domain controller, wait for the next report, then check again.
            </p>
          )}
          {!checkRes.fresh && (
            <p className="dr-checks__stale">
              Your lab has not reported since you started{checkRes.syncedAgo ? ` (last report ${checkRes.syncedAgo})` : ""}. Make the change, sync, then check again.
            </p>
          )}
          {checkRes.fresh && !checkRes.needsSetup && (
            <ul>
              {checkRes.results.map((r) => (
                <li key={r.label} className={r.ok ? "is-ok" : "is-bad"}>
                  <span>{r.ok ? "✓" : "✗"}</span>
                  {r.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function Scenario({
  caseNo,
  item,
  picked,
  onPick,
  hint,
  onHint,
  checkRes,
  unlock,
}: {
  caseNo: string;
  item: Item;
  picked: string | null;
  onPick: (c: string) => void;
  hint: string | null;
  onHint: () => void;
  checkRes: CheckRes | null;
  unlock: TaskInfo | null;
}) {
  return (
    <div className="dr-card">
      <span className="rd-kicker">
        Case {caseNo} · {SKILLS[item.skill].label}
        {item.job ? ` · Job task: ${item.job}` : ""}
      </span>
      <h2 className="dr-card__title">{item.title}</h2>
      {item.story && <p className="dr-story">{item.story}</p>}
      {item.evidence && (
        <div className="dr-term" aria-label="Evidence">
          <div className="dr-term__bar">
            <i />
            <i />
            <i />
            <span>Evidence</span>
          </div>
          <pre>{item.evidence.join("\n")}</pre>
        </div>
      )}
      <h3 className="dr-question">{item.prompt}</h3>
      {item.kind === "change" ? (
        <TaskPanel task={item} checkRes={checkRes} />
      ) : item.kind === "respond" ? (
        <div className="dr-free">
          <label htmlFor="dr-answer">{item.format || "Write your answer"}</label>
          <textarea
            id="dr-answer"
            rows={6}
            value={picked ?? ""}
            onChange={(e) => onPick(e.target.value)}
            maxLength={1200}
            placeholder="First I would… because… Before that I would check…"
          />
          <span className="dr-free__count">{(picked ?? "").length} / 1200</span>
        </div>
      ) : item.free ? (
        <div className="dr-free">
          <label htmlFor="dr-answer">{item.format || "Type your answer"}</label>
          <input
            id="dr-answer"
            type="text"
            value={picked ?? ""}
            onChange={(e) => onPick(e.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="answer"
            disabled={Boolean(item.gated && unlock)}
          />
          {hint ? (
            <p className="dr-hint">Hint: {hint}</p>
          ) : (
            <button type="button" className="dr-link" onClick={onHint}>
              Need a hint?
            </button>
          )}
          {item.gated && unlock && <TaskPanel task={unlock} checkRes={checkRes} />}
        </div>
      ) : (
        <div className="dr-choices" role="radiogroup">
          {item.choices.map((c, i) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={picked === c}
              className={`dr-choice${picked === c ? " dr-choice--on" : ""}`}
              onClick={() => onPick(c)}
            >
              <b>{LETTERS[i]}</b>
              <span>{c}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function LabFindings({ items }: { items: Finding[] }) {
  const tone = { high: "Serious", medium: "Worth fixing", low: "Minor" } as const;
  return (
    <li>
      <div className="ax-path__row">
        <span className="ax-path__n">04</span>
        <span className="ax-path__main">
          <span className="ax-path__title">What your lab needs</span>
          <span className="ax-path__body">
            {items.length === 0
              ? "Nothing is wrong in your lab right now. Your daily case will be a judgement case."
              : "A real audit of your own lab. Your daily lab task is one of these, and it is checked in your lab."}
          </span>
        </span>
        <span className="ax-path__count">
          <Link href={READINESS_PATH} className="rd-cta">
            Open report <ArrowRight className="h-4 w-4" />
          </Link>
        </span>
      </div>
      {items.length > 0 && (
        <ul className="dr-findings__list">
          {items.map((f) => (
            <li key={f.id} className={`is-${f.severity}`}>
              <span className="dr-findings__tag">{tone[f.severity]}</span>
              <strong>{f.title}</strong>
              <p>{f.facts}</p>
              {!f.fixable && <em>Needs a decision, not a setting.</em>}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

type Challenge = { code: string; target: string; command: string; expiresAt: string };
type VerifyState = { verified: boolean; verifiedAt: string | null; live: boolean; challenge: Challenge | null };

// Proves the lab is live: plant a one-time code, and the next snapshot has to contain it.
function VerifyLab({ verified, onVerified }: { verified: boolean; onVerified: () => void }) {
  const [state, setState] = useState<VerifyState | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const call = useCallback(async (action?: "start" | "check") => {
    const res = await academyFetch("/academy/api/lab-verify", action
      ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }
      : undefined);
    const data = await res.json();
    if (!res.ok && !data.challenge) throw new Error(data.error || "Could not reach the lab check.");
    return data as VerifyState & { passed?: boolean; fresh?: boolean; error?: string };
  }, []);

  useEffect(() => {
    call().then(setState).catch(() => {});
  }, [call]);

  async function run(action: "start" | "check") {
    setBusy(true);
    setNote(null);
    try {
      const data = await call(action);
      setState(data);
      if (action === "check") {
        if (data.passed) {
          setNote("Verified. You can remove the code from the description now.");
          onVerified();
        } else {
          setNote(data.fresh ? "Your lab reported, but the code is not in it yet. Check the description and try again." : "Waiting for your lab to report. It syncs about every minute now.");
        }
      }
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Could not check your lab.");
    } finally {
      setBusy(false);
    }
  }

  const open = state?.challenge ?? null;
  return (
    <section className="rd-sec dr-findings">
      <div className="rd-sec__head">
        <span className="rd-sec__n">05</span>
        <h2>Verify your lab</h2>
        <p>
          {verified
            ? "Your lab is verified. A code you planted showed up in a live snapshot. Verify again any time."
            : "Plant a one-time code in your lab to show your snapshots come from a lab you control right now."}
        </p>
      </div>
      {open ? (
        <ul className="dr-findings__list">
          <li>
            <strong>Your code: {open.code}</strong>
            <p>Set the description of {open.target} to this code. In PowerShell on your domain controller:</p>
            <code style={{ display: "block", padding: "10px 12px", border: "1px solid var(--rd-line)", borderRadius: 8, fontSize: "var(--ty-small)", overflowX: "auto", maxWidth: "100%" }}>{open.command}</code>
            <p>Your lab now syncs about every minute. When it has reported, check it. The code lasts 4 hours.</p>
            <button type="button" className="dr-outline" disabled={busy} onClick={() => void run("check")}>
              {busy ? "Checking…" : "Check my lab"} <ArrowRight className="h-4 w-4" />
            </button>
          </li>
        </ul>
      ) : (
        <button type="button" className="dr-outline" disabled={busy} onClick={() => void run("start")}>
          {busy ? "Starting…" : verified ? "Verify again" : "Start verification"} <ArrowRight className="h-4 w-4" />
        </button>
      )}
      {note && <p className="dr-lab">{note}</p>}
    </section>
  );
}

function academyChrome() {
  const root = document.querySelector(".academy-bg");
  const header = root?.querySelector("header");
  return {
    theme: root?.getAttribute("data-academy-theme") === "dark" ? "dark" : "light",
    top: header ? Math.round(header.getBoundingClientRect().bottom) : 0,
  };
}

function JobTasks({ jobs, security }: { jobs: JobRow[]; security: boolean }) {
  const { ask } = useCoach();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [, setLayout] = useState(0);
  const done = jobs.filter((j) => j.status === "proven" && j.lab);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const sync = () => setLayout((n) => n + 1);
    sync();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const prevBody = document.body.style.overflow;
    const prevHtml = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    return () => {
      document.body.style.overflow = prevBody;
      document.documentElement.style.overflow = prevHtml;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [open]);

  const { theme, top } = mounted ? academyChrome() : { theme: "light", top: 0 };

  return (
    <>
      <button type="button" className="dr-clip" aria-expanded={open} aria-label="Work you have done" onClick={() => setOpen(true)}>
        <ClipboardList />
        {done.length > 0 && <em>{done.length}</em>}
      </button>
      {mounted &&
        createPortal(
          <div
            className="dr-jobsheet"
            data-open={open ? "true" : "false"}
            data-academy-theme={theme}
            style={{ ["--js-top"]: `${top}px` } as CSSProperties}
          >
            <button type="button" className="dr-jobsheet__scrim" aria-label="Close job tasks" onClick={() => setOpen(false)} />
            <aside className="dr-jobsheet__panel" role="dialog" aria-label="Work you have done">
              <div className="dr-jobsheet__head">
                <div>
                  <span>Work you have done</span>
                  <p>Use this when you apply. It lists only the real work your lab already shows, so you can talk about what you have done.</p>
                </div>
                <button type="button" className="dr-jobsheet__close" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="dr-jobsheet__body">
                {!security && jobs.some((j) => j.security) && (
                  <p className="dr-jobs__note">
                    Security settings show up here after you run the updated lab script from Build This Lab once on the domain controller.
                  </p>
                )}
                {done.length === 0 ? (
                  <p className="dr-jobs__empty">Nothing here yet. When your lab shows a change you made, it is added so you have it for applications.</p>
                ) : (
                  <ul className="dr-jobs__list">
                    {done.map((j) => (
                      <li key={j.id} className="is-proven">
                        <span className="dr-jobs__mark" aria-hidden>
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="dr-jobs__name">
                          {j.label}
                          <em>{j.security ? "Security configuration in your lab" : "Seen in your lab"}</em>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  type="button"
                  className="dr-jobs__bullet"
                  onClick={() => {
                    const proven = done.map((j) => j.label).join(", ") || "none yet";
                    setOpen(false);
                    ask(
                      `Write my resume bullets from work I have already done. Use your resume-bullet rule. One line each. Each line must say what I did, the tool by its full name, how I did it, and the impact.\n\nAlready in my lab: ${proven}.`
                    );
                  }}
                >
                  Ask Coach for a project bullet
                </button>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}

export function DrillRunner() {
  const { ask } = useCoach();
  const [status, setStatus] = useState<DrillStatus | null>(null);
  const [run, setRun] = useState<Run | null>(null);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [now, setNow] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const finishing = useRef(false);

  const load = useCallback(() => {
    academyFetch(`/academy/api/drill?day=${localDay()}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStatus(d))
      .catch(() => {});
  }, []);

  useEffect(load, [load]);

  async function getHint(token: string) {
    try {
      const res = await academyFetch("/academy/api/drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "hint", token }),
      });
      const data = await res.json();
      setHint(typeof data.hint === "string" ? data.hint : "No hint for this one.");
    } catch {
      setHint("Could not load a hint.");
    }
  }

  const [checkRes, setCheckRes] = useState<CheckRes | null>(null);
  const [unlock, setUnlock] = useState<TaskInfo | null>(null);

  async function unlockTask(current: Run, given: (string | null)[]) {
    setBusy(true);
    setError(null);
    try {
      const res = await academyFetch("/academy/api/drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlock", token: current.token, answers: given }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not check your answer.");
      if (!data.ok) {
        setError("That is not right. Read the evidence again, or ask for the hint.");
        return;
      }
      setUnlock({ setup: data.setup, checklist: data.checklist, checkCount: data.checkCount });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check your answer.");
    } finally {
      setBusy(false);
    }
  }

  async function checkLab(current: Run, given: (string | null)[] = []) {
    setBusy(true);
    setError(null);
    try {
      const res = await academyFetch("/academy/api/drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check", token: current.token, answers: given, day: localDay() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not check your lab.");
      if (data.passed && data.entry) {
        setResult({ ...data, items: current.items });
        setStatus(data);
        setRun(null);
        return;
      }
      setCheckRes({ needsSetup: Boolean(data.needsSetup), fresh: Boolean(data.fresh), results: data.results ?? [], syncedAgo: data.syncedAgo ?? null, passed: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check your lab.");
    } finally {
      setBusy(false);
    }
  }

  async function start(mode: Mode, format?: string) {
    setBusy(true);
    setError(null);
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 70_000);
    try {
      const res = await academyFetch("/academy/api/drill", {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start", mode, day: localDay(), format }),
      });
      const text = await res.text();
      let data: { error?: string; done?: boolean; items?: unknown[]; token?: string; limitSeconds?: number; ai?: boolean } | null = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }
      if (!res.ok || !data) throw new Error(data?.error || "Could not start the drill. Try again in a minute.");
      if (data.done) {
        setStatus(data as DrillStatus);
        return;
      }
      if (!data.token || !Array.isArray(data.items) || data.items.length === 0) {
        throw new Error(data.error || "Could not write this one. Try again in a minute.");
      }
      finishing.current = false;
      setResult(null);
      setHint(null);
      setCheckRes(null);
      setUnlock(null);
      setIdx(0);
      setAnswers(data.items.map(() => null));
      setNow(Date.now());
      setRun({ mode, token: data.token, items: data.items as Run["items"], limit: data.limitSeconds ?? 0, ai: Boolean(data.ai), startedAt: Date.now() });
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === "AbortError";
      setError(aborted ? "That took too long. Try again in a minute." : err instanceof Error ? err.message : "Could not start the drill.");
    } finally {
      window.clearTimeout(timer);
      setBusy(false);
    }
  }

  function exitDrill() {
    finishing.current = false;
    setLeaving(false);
    setRun(null);
    setAnswers([]);
    setHint(null);
    setCheckRes(null);
    setUnlock(null);
    setIdx(0);
    setError(null);
  }

  const finish = useCallback(async (current: Run, given: (string | null)[], final = false) => {
    if (finishing.current) return;
    finishing.current = true;
    setBusy(true);
    try {
      const res = await academyFetch("/academy/api/drill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "finish", token: current.token, answers: given, day: localDay(), final }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not score the drill.");
      // A wrong typed answer to the weekly CTF does not close it. They can try again or give up.
      if (data.retry) {
        finishing.current = false;
        setError("That is not right. Read the evidence again, or ask for the hint.");
        return;
      }
      setResult({ ...data, items: current.items });
      setStatus(data);
      setRun(null);
    } catch (err) {
      finishing.current = false;
      setError(err instanceof Error ? err.message : "Could not score the drill.");
    } finally {
      setBusy(false);
    }
  }, []);

  // The clock ticks while a drill is running. A timed drill ends itself.
  useEffect(() => {
    if (!run) return;
    const t = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(t);
  }, [run]);

  const elapsed = run ? Math.max(0, Math.floor((now - run.startedAt) / 1000)) : 0;
  const left = run && run.limit > 0 ? Math.max(0, run.limit - elapsed) : null;

  useEffect(() => {
    if (run && left === 0) void finish(run, answers);
  }, [run, left, answers, finish]);

  if (run) {
    const single = run.items.length === 1;
    const item = run.items[idx];
    const last = idx === run.items.length - 1;
    const picked = answers[idx];
    const pick = (c: string) => setAnswers((a) => a.map((v, i) => (i === idx ? c : v)));
    return (
      <div className="rd dr dr--play">
        <div className="dr-bar">
          <span className="rd-kicker">
            {run.mode === "timed"
              ? `Incident drill · ${idx + 1} of ${run.items.length}`
              : run.mode === "ctf"
                ? run.items[0]?.gated
                  ? "Weekly CTF · find it, then contain it"
                  : "Weekly CTF · type your answer"
                : run.items[0]?.kind === "change"
                  ? "Daily lab task · make the change"
                  : run.items[0]?.kind === "respond"
                    ? "Daily written case"
                    : run.ai
                      ? "Daily scenario · written for you"
                      : "Daily scenario"}
          </span>
          <span className="dr-bar__end">
            {leaving ? (
              <span className="dr-leave">
                Leave this drill?
                <button type="button" className="dr-link" onClick={() => setLeaving(false)}>
                  Stay
                </button>
                <button type="button" className="dr-link dr-link--bad" onClick={exitDrill}>
                  Leave
                </button>
              </span>
            ) : (
              <button type="button" className="dr-exit" onClick={() => setLeaving(true)}>
                <X className="h-4 w-4" /> Exit
              </button>
            )}
            <span className={`dr-clock${left !== null && left <= 30 ? " dr-clock--low" : ""}`}>
              <Timer className="h-4 w-4" />
              {clock(left ?? elapsed)}
            </span>
          </span>
        </div>
        {!single && (
          <div className="dr-segs" aria-hidden>
            {run.items.map((_, i) => (
              <i key={i} className={i < idx ? "rd-tone-good" : i === idx ? "rd-tone-live" : "rd-tone-none"} />
            ))}
          </div>
        )}

        <div key={idx} className={dir === 1 ? "ax-enter-fwd" : "ax-enter-back"}>
          <Scenario caseNo={String((status?.stats.total ?? 0) + 1).padStart(2, "0")} item={item} picked={picked} onPick={pick} hint={hint} onHint={() => void getHint(run.token)} checkRes={checkRes} unlock={unlock} />
        </div>

        <div className="dr-actions">
          {item.gated && !unlock ? (
            <>
              <span className="dr-actions__side">
                <button type="button" className="dr-link" disabled={busy} onClick={() => void finish(run, answers, true)}>
                  Give up and see the answer
                </button>
              </span>
              <button type="button" className="rd-cta" disabled={busy || !picked || !picked.trim()} onClick={() => void unlockTask(run, answers)}>
                {busy ? "Checking…" : "Check my answer"} <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : item.kind === "change" || (item.gated && unlock) ? (
            <>
              <span className="dr-actions__side">
                <button type="button" className="dr-link" disabled={busy} onClick={() => void finish(run, item.gated ? answers : [""], true)}>
                  Give up and see the steps
                </button>
                {run.mode === "daily" && item.kind === "change" && (
                  <button type="button" className="dr-link" disabled={busy} onClick={() => void start("daily", "respond")}>
                    Can&apos;t reach your lab? Do a written case instead
                  </button>
                )}
              </span>
              <button type="button" className="rd-cta" disabled={busy} onClick={() => void checkLab(run, answers)}>
                {busy ? "Checking…" : "Check my lab"} <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              {idx > 0 ? (
                <button type="button" className="dr-link" onClick={() => { setDir(-1); setIdx(idx - 1); }}>
                  Back
                </button>
              ) : run.mode === "ctf" ? (
                <button type="button" className="dr-link" disabled={busy} onClick={() => void finish(run, answers, true)}>
                  Give up and see the answer
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                className="rd-cta"
                disabled={busy || !picked || !picked.trim() || (item.kind === "respond" && picked.trim().length < 40)}
                onClick={() => (last ? void finish(run, answers) : (setDir(1), setIdx(idx + 1)))}
              >
                {busy && item.kind === "respond" ? "Marking…" : last ? (single ? "Submit answer" : "Finish") : "Next"} <ArrowRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        {error && <p className="dr-error">{error}</p>}
      </div>
    );
  }

  if (result) {
    const { entry, review, items } = result;
    const single = review.length === 1;
    const first = review[0];
    const misses = [...new Set(review.filter((r) => !r.correct).map((r) => SKILLS[r.skill].label))];
    return (
      <div className="rd dr dr--play ax-enter">
        <span className="rd-kicker">{MODE_LABEL[entry.mode] ?? "Drill"} · Result</span>

        {single ? (
          <div className={`dr-verdict ${first.correct ? "is-right" : "is-wrong"}`}>
            <span className="dr-verdict__mark">{first.correct ? <Check className="h-6 w-6" /> : <X className="h-6 w-6" />}</span>
            <div>
              <strong>{entry.mode === "ctf" ? (first.correct ? "Captured" : "Not captured") : first.correct ? "Correct" : "Not quite"}</strong>
              {entry.mode !== "ctf" && <span>{clock(entry.seconds)}</span>}
            </div>
          </div>
        ) : (
          <div className="dr-score">
            <strong>
              {entry.correct}
              <small>/{entry.total}</small>
            </strong>
            <span>
              {clock(entry.seconds)}
              {result.late ? " · over the clock, not recorded" : ""}
            </span>
          </div>
        )}

        {entry.mode === "daily" && <p className="dr-note">{streakLine(result.stats)}</p>}
        {entry.mode === "ctf" && <p className="dr-note">One investigation a week. The next one opens Monday.</p>}
        {!result.counted && entry.mode === "daily" && <p className="dr-note">Today&apos;s first result stands. This is your score for the day.</p>}

        <ol className="dr-review">
          {review.map((r, i) => (
            <li key={i} className={r.correct ? "is-right" : "is-wrong"}>
              <span className="dr-review__mark">{r.correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}</span>
              <div>
                <strong>{r.title}</strong>
                {single && items[i]?.story && <p className="dr-review__story">{items[i].story}</p>}
                {!r.correct && items[i]?.kind !== "change" && <p>{items[i]?.free ? "You wrote" : "You picked"}: {r.picked ?? "nothing"}.</p>}
                <p>
                  {items[i]?.kind === "respond"
                    ? "A strong answer"
                    : items[i]?.kind === "change"
                      ? "Outcome"
                      : items[i]?.format
                        ? items[i].format
                        : "Best answer"}
                  : <b>{/flag/i.test(items[i]?.format ?? "") ? `gtf{${r.answer}}` : r.answer}</b>
                </p>
                <p>{r.explain}</p>
                {r.runbook && r.runbook.length > 0 && (
                  <div className="dr-term dr-term--small">
                    <div className="dr-term__bar">
                      <i />
                      <i />
                      <i />
                      <span>On the job, the same thing in PowerShell</span>
                    </div>
                    <pre>{r.runbook.join("\n")}</pre>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="dr-actions">
          {entry.mode === "daily" && !result.incidentUntil ? (
            <button type="button" className="rd-cta" disabled={busy} onClick={() => void start("timed")}>
              Try an incident drill <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="button" className="rd-cta" onClick={() => setResult(null)}>
              Done <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {misses.length > 0 && (
            <button
              type="button"
              className="dr-link"
              onClick={() =>
                ask(
                  single
                    ? `I just missed today's drill scenario "${first.title}" (${misses[0]}). Coach me on the thinking behind it without quizzing me on mission answers.`
                    : `I just missed drill questions on ${misses.join(" and ")}. Coach me on those without giving away mission answers.`
                )
              }
            >
              Ask Coach about it
            </button>
          )}
          {entry.mode === "daily" && !result.incidentUntil && (
            <button type="button" className="dr-link" onClick={() => setResult(null)}>
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  const s = status?.stats;
  const week = lastSeven();
  const today = localDay();
  const caseNo = String((s?.total ?? 0) + 1).padStart(2, "0");
  const nameOf = (e: DrillEntry | null | undefined) => e?.detail?.[0]?.t ?? null;
  return (
    <div className="rd dr dr--floor">
      <header className="dr-mast">
        <div className="ax-titleblock">
          <h1>Drills</h1>
          <p>Practice on your own directory. One named case a day.</p>
        </div>
        {status && <JobTasks jobs={status.jobs} security={status.lab.security} />}
      </header>

      {status && s ? (
        <>
          <div className="dr-strip">
            <span className="dr-streakline">
              <Flame className="h-4 w-4" />
              {s.streak} day streak
            </span>
            <span className="dr-days" aria-label="Last seven days, oldest on the left">
              {week.map((d) => (
                <i
                  key={d.day}
                  title={`${d.label} ${d.date}`}
                  className={`${s.days.includes(d.day) ? "is-done" : ""}${d.day === today ? " is-today" : ""}`}
                >
                  {d.label.slice(0, 1)}
                </i>
              ))}
            </span>
            <span className="dr-level">
              Level {status.level.n} · {status.level.name}
            </span>
          </div>

          <ol className="ax-path dr-rows">
            <li>
              <div className="ax-path__row">
                <span className="ax-path__n">01</span>
                <span className="ax-path__main">
                  <span className="ax-path__title">
                    {s.today ? (nameOf(s.today) ?? "Daily scenario") : `Case ${caseNo}`}
                    {s.today && <em className={`ax-tag ${s.today.correct ? "ax-tag--good" : ""}`}>{scoreLabel(s.today)}</em>}
                  </span>
                  <span className="ax-path__body">
                    {s.today
                      ? `Daily scenario · ${clock(s.today.seconds)}. ${streakLine(s)}`
                      : `A decision, a written case, or a real change in your lab${status.focus ? `, aimed at ${status.focus}` : ""}. It gets a name when you open it.`}
                  </span>
                </span>
                <span className="ax-path__count">
                  {!s.today && (
                    <button type="button" className="rd-cta" disabled={busy} onClick={() => void start("daily")}>
                      {busy ? "Writing…" : "Open case"} <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </span>
              </div>
            </li>
            <li>
              <div className="ax-path__row">
                <span className="ax-path__n">02</span>
                <span className="ax-path__main">
                  <span className="ax-path__title">
                    Incident drill
                    {status.incidentUntil && s.lastTimed && (
                      <em className={`ax-tag ${drillPassed(s.lastTimed) ? "ax-tag--good" : "ax-tag--bad"}`}>
                        {drillPassed(s.lastTimed) ? "Passed" : "Failed"}
                      </em>
                    )}
                  </span>
                  <span className="ax-path__body">
                    {status.incidentUntil && s.lastTimed
                      ? `${scoreLabel(s.lastTimed)}. The next one opens 24 hours after the one you just finished.`
                      : status.incidentUntil
                        ? "Done for today. The next one opens 24 hours after the one you just finished."
                      : `Five alerts and tickets against a clock. One a day. ${s.bestTimed ? `Best ${s.bestTimed.correct}/${s.bestTimed.total}.` : ""}`}
                  </span>
                </span>
                <span className="ax-path__count">
                  {status.incidentUntil && s.lastTimed ? (
                    drillPassed(s.lastTimed) ? (
                      <Check className="h-5 w-5 text-[var(--rd-good)]" aria-label="Passed" />
                    ) : (
                      <X className="h-5 w-5 text-[var(--rd-bad)]" aria-label="Failed" />
                    )
                  ) : !status.incidentUntil ? (
                    <button type="button" className="dr-outline" disabled={busy} onClick={() => void start("timed")}>
                      Start <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : null}
                </span>
              </div>
            </li>
            <li>
              <div className="ax-path__row">
                <span className="ax-path__n">03</span>
                <span className="ax-path__main">
                  <span className="ax-path__title">
                    {status.ctf.entry ? (nameOf(status.ctf.entry) ?? "Weekly CTF") : "Weekly CTF"}
                    {status.ctf.entry && <em className={`ax-tag ${status.ctf.entry.correct ? "ax-tag--good" : ""}`}>{status.ctf.entry.correct ? "Captured" : "Not captured"}</em>}
                  </span>
                  <span className="ax-path__body">
                    {status.ctf.entry
                      ? "A new investigation opens Monday."
                      : `One hard investigation a week, asked about your own Security log. ${
                          status.lab.events
                            ? "Your lab sent its log, so this one is about what really happened in it."
                            : "Update the lab script from Build This Lab so it can ask about your own Security log."
                        }`}
                  </span>
                </span>
                <span className="ax-path__count">
                  {!status.ctf.entry && (
                    <button type="button" className="dr-outline" disabled={busy} onClick={() => void start("ctf")}>
                      {busy ? "Writing…" : "Start"} <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </span>
              </div>
            </li>
            <LabFindings items={status.findings} />
          </ol>
          {error && <p className="dr-error">{error}</p>}
          {status.lab.synced && (
            <VerifyLab
              verified={Boolean(status.lab.verified)}
              onVerified={() => setStatus((s) => (s ? { ...s, lab: { ...s.lab, verified: true } } : s))}
            />
          )}

          {status.lab.synced && <p className="dr-lab">{labLine(status.lab)}</p>}
        </>
      ) : (
        <p className="dr-note">Loading your drills…</p>
      )}
    </div>
  );
}

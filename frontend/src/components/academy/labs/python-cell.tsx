"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

// A small Python editor for the labs. The code runs in Pyodide, the
// open-source Python for the browser, inside public/lab-python-worker.js:
// off the page, with no network, and stopped if it runs too long.

const LOAD_MS = 90_000;
const RUN_MS = 6_000;

type Status = "idle" | "loading" | "running" | "done" | "error";

export function PythonCell({
  initial,
  files,
  onRun,
}: {
  initial: string;
  /** Files the code can open, by name. */
  files?: Record<string, string>;
  /** Called with the output after every finished run. */
  onRun?: (out: string, ok: boolean) => void;
}) {
  const [code, setCode] = useState(initial);
  const [status, setStatus] = useState<Status>("idle");
  const [out, setOut] = useState("");
  const worker = useRef<Worker | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const runId = useRef(0);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      worker.current?.terminate();
    },
    [],
  );

  const stop = (message: string) => {
    window.clearTimeout(timer.current);
    worker.current?.terminate();
    worker.current = null;
    setStatus("error");
    setOut(message);
    onRun?.(message, false);
  };

  const run = () => {
    if (status === "loading" || status === "running") return;
    if (!worker.current) {
      try {
        worker.current = new Worker("/lab-python-worker.js", { type: "module" });
      } catch {
        setStatus("error");
        setOut("This browser could not start Python. Try Chrome, Edge or Firefox.");
        return;
      }
      setStatus("loading");
    } else {
      setStatus("running");
    }
    const id = ++runId.current;
    const w = worker.current;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => stop("Python took too long to start. Check your connection and run it again."), LOAD_MS);
    w.onerror = () => stop("Python could not load here. A network block is the usual cause. You can still answer from the log above.");
    w.onmessage = (e: MessageEvent<{ id: number; type: string; ok?: boolean; out?: string }>) => {
      if (e.data.id !== id) return;
      if (e.data.type === "running") {
        setStatus("running");
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => stop(`Stopped after ${RUN_MS / 1000} seconds. Look for a loop that never ends.`), RUN_MS);
        return;
      }
      window.clearTimeout(timer.current);
      const text = e.data.out?.trim() || "(no output: add a print)";
      setStatus(e.data.ok ? "done" : "error");
      setOut(text);
      onRun?.(text, Boolean(e.data.ok));
    };
    w.postMessage({ id, code, files });
  };

  const busy = status === "loading" || status === "running";
  return (
    <div className="lk-py">
      <div className="lk-py__bar">
        <span>
          <b>Python</b> · runs in your browser
        </span>
        <span className="lk-py__btns">
          <button type="button" className="lk-mini" disabled={busy || code === initial} onClick={() => setCode(initial)}>
            <RotateCcw aria-hidden="true" /> Reset
          </button>
          <button type="button" className="lk-mini lk-mini--go" disabled={busy} onClick={run}>
            <Play aria-hidden="true" /> {status === "loading" ? "Loading Python…" : status === "running" ? "Running…" : "Run"}
          </button>
        </span>
      </div>
      <textarea
        className="lk-py__code"
        value={code}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        aria-label="Python code"
        rows={Math.min(22, code.split("\n").length + 1)}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== "Tab") return;
          e.preventDefault();
          const t = e.currentTarget;
          const { selectionStart: a, selectionEnd: b } = t;
          const next = code.slice(0, a) + "    " + code.slice(b);
          setCode(next);
          requestAnimationFrame(() => t.setSelectionRange(a + 4, a + 4));
        }}
      />
      {status === "loading" && <p className="lk-note">The first run downloads Python once, about 13 MB. After that it is instant.</p>}
      {(status === "done" || status === "error") && <pre className={`lk-py__out${status === "error" ? " is-error" : ""}`}>{out}</pre>}
    </div>
  );
}

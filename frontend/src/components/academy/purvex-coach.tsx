"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import { loadResults, summarize, LEVELS, type Results } from "@/lib/academy-score";

type ChatMsg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Why did I get the Riley ticket wrong?",
  "What should I practice next?",
  "Help me understand this without giving me the answer.",
];

export function PurvexCoach() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [results, setResults] = useState<Results>({});
  const listRef = useRef<HTMLDivElement>(null);

  const summary = summarize(results);
  const strongest = [...summary.skills]
    .filter((s) => s.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  const weakest = summary.focus[0];

  useEffect(() => {
    if (!open) return;
    setResults(loadResults());
    academyFetch("/academy/api/coach")
      .then((r) => r.json())
      .then((data) => {
        setEnabled(data.enabled !== false);
        if (typeof data.remaining === "number") setRemaining(data.remaining);
        if (typeof data.limit === "number") setLimit(data.limit);
      })
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, busy, open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    if (remaining === 0) {
      setError(`Daily coach limit reached (${limit} questions).`);
      return;
    }
    setError(null);
    setInput("");
    const nextHistory = [...messages, { role: "user" as const, content: question }];
    setMessages(nextHistory);
    setBusy(true);
    try {
      const res = await academyFetch("/academy/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          history: messages,
          results: loadResults(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Coach is unavailable.");
        if (typeof data.remaining === "number") setRemaining(data.remaining);
        return;
      }
      setMessages([...nextHistory, { role: "assistant", content: data.reply }]);
      if (typeof data.remaining === "number") setRemaining(data.remaining);
    } catch {
      setError("Could not reach PurveX Coach.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-1.5 rounded-md border border-[var(--pvrx-border-light)] bg-white px-3 text-sm font-medium text-slate-600 transition hover:border-[rgba(106,92,255,0.35)] hover:text-[#5546e0]"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Coach</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-center sm:justify-end sm:p-6">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setOpen(false)} />
          <div
            role="dialog"
            aria-label="PurveX Coach"
            className="relative flex h-[min(720px,100dvh)] w-full flex-col bg-white shadow-2xl sm:h-[min(720px,calc(100dvh-3rem))] sm:max-w-md sm:rounded-2xl sm:border sm:border-[var(--pvrx-border-light)]"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--pvrx-border-light)] px-5 py-4">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#5546e0]">PurveX Coach</p>
                <h2 className="mt-0.5 font-display text-lg font-semibold text-slate-900">
                  Your AI cybersecurity lab coach
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Close coach"
              >
                <X className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="border-b border-[var(--pvrx-border-light)] px-5 py-3 text-sm">
              <p className="text-slate-700">
                Readiness Score:{" "}
                <strong>{summary.finished === 0 ? "—" : `${summary.overall}%`}</strong>
                <span className="text-slate-400"> · {LEVELS[summary.level].label}</span>
              </p>
              {strongest && (
                <p className="mt-1 text-slate-500">
                  Strongest: {strongest.label}
                  {strongest.score !== null ? ` (${strongest.score}%)` : ""}.
                </p>
              )}
              {weakest && (
                <p className="text-slate-500">
                  Biggest gap: {weakest.label}
                  {weakest.score !== null ? ` (${weakest.score}%)` : " (not started)"}.
                </p>
              )}
              {remaining !== null && (
                <p className="mt-1 font-mono text-[11px] text-slate-400">
                  {remaining} of {limit} questions left today
                </p>
              )}
            </div>

            <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500">Ask me anything about your lab.</p>
                  <div className="flex flex-col gap-2">
                    {STARTERS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-xl border border-[var(--pvrx-border-light)] bg-slate-50 px-3 py-2 text-left text-sm text-slate-700 transition hover:border-[rgba(106,92,255,0.35)] hover:text-[#5546e0]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div
                  key={`${m.role}-${i}`}
                  className={`max-w-[95%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-6 ${
                    m.role === "user"
                      ? "ml-auto bg-[#5546e0] text-white"
                      : "bg-slate-50 text-slate-800"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {busy && (
                <p className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                </p>
              )}
              {error && <p className="text-sm text-red-600">{error}</p>}
              {!enabled && (
                <p className="text-sm text-slate-500">Coach is not configured yet. Ask your instructor.</p>
              )}            </div>

            <form
              className="flex gap-2 border-t border-[var(--pvrx-border-light)] p-4"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask PurveX Coach…"
                disabled={busy || !enabled || remaining === 0}
                className="h-11 flex-1 rounded-xl border border-[var(--pvrx-border-light)] bg-white px-3 text-sm text-slate-800 outline-none focus:border-[#5546e0]"
              />
              <button
                type="submit"
                disabled={busy || !enabled || remaining === 0 || !input.trim()}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5546e0] text-white disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

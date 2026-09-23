"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUp, Check, Copy, RotateCcw, ShieldCheck } from "lucide-react";
import { useCoach } from "@/components/academy/coach-context";
import { useResults } from "@/lib/academy-client";
import { MISSION_CATALOG } from "@/lib/academy-missions";
import { LEVELS, summarize, type Results } from "@/lib/academy-score";

function inline(text: string, key: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\s][^*]*\*)/g).map((part, i) => {
    const k = `${key}-${i}`;
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={k}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return <code key={k} className="pc-code">{part.slice(1, -1)}</code>;
    if (part.length > 2 && part.startsWith("*") && part.endsWith("*")) return <em key={k}>{part.slice(1, -1)}</em>;
    return <Fragment key={k}>{part}</Fragment>;
  });
}

function Terminal({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="pc-term">
      <div className="pc-term__bar">
        <span className="pc-term__lang">{lang || "shell"}</span>
        <button
          type="button"
          className="pc-term__copy"
          onClick={() => {
            navigator.clipboard?.writeText(code).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            });
          }}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

type Block =
  | { kind: "p"; text: string }
  | { kind: "label"; text: string }
  | { kind: "check"; text: string }
  | { kind: "steps"; items: string[]; start: number }
  | { kind: "bullets"; items: string[]; start: number }
  | { kind: "code"; lang: string; code: string };

function parse(text: string): Block[] {
  const blocks: Block[] = [];
  const parts = text.trim().split(/```(\w*)\n?([\s\S]*?)```/g);
  for (let i = 0; i < parts.length; i += 3) {
    const prose = parts[i];
    let list: { kind: "steps" | "bullets"; items: string[]; start: number } | null = null;
    let para: string[] = [];
    const flush = () => {
      if (para.length) {
        const t = para.join("\n").trim();
        const bare = t.replace(/^\*\*(.+)\*\*$/, "$1");
        if (/^check:/i.test(bare)) blocks.push({ kind: "check", text: t.replace(/^\**check:\**\s*/i, "") });
        else if (bare !== t && bare.endsWith(":") && bare.length < 60) blocks.push({ kind: "label", text: bare.slice(0, -1) });
        else blocks.push({ kind: "p", text: t });
      }
      para = [];
    };
    for (const line of prose.split("\n")) {
      const step = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
      const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
      if (step || bullet) {
        flush();
        const kind: "steps" | "bullets" = step ? "steps" : "bullets";
        const item: string = step ? step[2] : bullet![1];
        if (list && list.kind === kind) list.items.push(item);
        else {
          list = { kind, items: [item], start: step ? Number(step[1]) : 1 };
          blocks.push(list);
        }
      } else if (!line.trim()) {
        flush();
        list = null;
      } else {
        list = null;
        para.push(line);
      }
    }
    flush();
    if (parts[i + 2] !== undefined) blocks.push({ kind: "code", lang: parts[i + 1], code: parts[i + 2].replace(/\n$/, "") });
  }
  return blocks;
}

function CoachText({ text }: { text: string }) {
  return (
    <div className="pc-text">
      {parse(text).map((b, i) => {
        const k = String(i);
        if (b.kind === "code") return <Terminal key={k} lang={b.lang} code={b.code} />;
        if (b.kind === "label") return <p key={k} className="pc-label">{b.text}</p>;
        if (b.kind === "check")
          return (
            <div key={k} className="pc-check">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <p>
                <span className="pc-check__tag">Check</span>
                {inline(b.text, k)}
              </p>
            </div>
          );
        if (b.kind === "steps")
          return (
            <ol key={k} className="pc-steps">
              {b.items.map((item, j) => (
                <li key={j}>
                  <span className="pc-steps__n">{String(b.start + j).padStart(2, "0")}</span>
                  <span>{inline(item, `${k}-${j}`)}</span>
                </li>
              ))}
            </ol>
          );
        if (b.kind === "bullets")
          return (
            <ul key={k} className="pc-bullets">
              {b.items.map((item, j) => (
                <li key={j}>{inline(item, `${k}-${j}`)}</li>
              ))}
            </ul>
          );
        return (
          <p key={k} className="whitespace-pre-wrap">
            {inline(b.text, k)}
          </p>
        );
      })}
    </div>
  );
}

function briefing(results: Results) {
  const s = summarize(results);
  const missions = Object.values(MISSION_CATALOG);
  const missed = missions.find((m) => {
    const r = results[m.id];
    return r && (!r.solved || r.wrong > 0);
  });
  const next = missions.find((m) => !results[m.id]);
  const gap = s.finished > 0 ? s.focus[0] : undefined;

  const starters: { ask: string; action: string; title: string }[] = [];
  if (missed) starters.push({ ask: `Walk me through "${missed.title}" without giving it away.`, action: "Help", title: missed.title });
  if (next) starters.push({ ask: `How do I start "${next.title}"?`, action: "Start", title: next.title });
  if (gap) starters.push({ ask: `Give me a 15-minute drill for ${gap.label}.`, action: "Drill", title: gap.label });
  starters.push({
    ask: "How do I check a user's groups in Active Directory Users and Computers?",
    action: "How-to",
    title: "Check groups in ADUC",
  });

  return {
    score: s.finished === 0 ? null : s.overall,
    level: LEVELS[s.level].label,
    starters: starters.slice(0, 3),
  };
}

export function CoachHeader({ children }: { children?: ReactNode }) {
  const { messages, clear, busy } = useCoach();
  const brief = briefing(useResults());
  return (
    <div className="pc-head">
      <div className="min-w-0">
        <p className="pc-head__kicker">Hey</p>
        <p className="pc-head__title">Coach</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="pc-stamp">{brief.score === null ? "––" : brief.score}</span>
        {messages.length > 0 && (
          <button type="button" onClick={clear} disabled={busy} className="pc-icon" aria-label="New conversation" title="New conversation">
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}

export function CoachChat() {
  const { messages, busy, enabled, remaining, limit, error, send } = useCoach();
  const brief = briefing(useResults());
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const blocked = busy || !enabled || remaining === 0;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [input]);

  function submit() {
    if (blocked || !input.trim()) return;
    send(input);
    setInput("");
  }

  return (
    <div className="pc flex min-h-0 flex-1 flex-col">
      <div ref={listRef} className="pc-scroll min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {messages.length === 0 && (
          <div className="pc-open">
            <h2 className="pc-ask">Stuck?</h2>
            <p className="pc-lede">I walk the clicks. You find the flags.</p>
            <ol className="pc-prompts">
              {brief.starters.map((s, i) => (
                <li key={s.ask}>
                  <button type="button" disabled={blocked} onClick={() => send(s.ask)} className="pc-prompt">
                    <span className="pc-prompt__n">{String(i + 1).padStart(2, "0")}</span>
                    <span className="pc-prompt__body">
                      <em>{s.action}</em>
                      <strong>{s.title}</strong>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="pc-thread">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="pc-turn">
                <p className="pc-reply__who">You</p>
                <p className="pc-user">{m.content}</p>
              </div>
            ) : (
              <div key={i} className="pc-turn">
                <p className="pc-reply__who">Coach</p>
                <CoachText text={m.content} />
              </div>
            )
          )}
          {busy && (
            <div className="pc-turn">
              <p className="pc-reply__who">Coach</p>
              <p className="pc-thinking">
                Reading your lab and results<span className="pc-dots"><i /><i /><i /></span>
              </p>
            </div>
          )}
        </div>
        {error && <p className="pc-error">{error}</p>}
        {!enabled && <p className="pc-error">PurveX Coach is not set up yet. Ask your instructor.</p>}
      </div>

      <form
        className="pc-compose"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="pc-compose__box">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={remaining === 0 ? "That's all for today" : "What's up?"}
            maxLength={2000}
            disabled={!enabled || remaining === 0}
          />
          <button type="submit" disabled={blocked || !input.trim()} className="pc-send" aria-label="Send">
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
        <p className="pc-compose__hint">
          <span>Enter sends</span>
          {remaining !== null && <span>{remaining} left</span>}
        </p>
      </form>
    </div>
  );
}

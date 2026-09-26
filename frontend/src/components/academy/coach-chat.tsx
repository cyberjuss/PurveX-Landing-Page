"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type DragEvent, type ReactNode } from "react";
import { Check, Copy, Mic, RotateCcw, ShieldCheck, Square, X } from "lucide-react";
import { useCoach } from "@/components/academy/coach-context";
import { COACH_MODE_LABELS, COACH_MODES, coachStarters, interviewStarters } from "@/lib/academy-coach-mode";
import { useResults } from "@/lib/academy-client";
import { filesToCoachImages, imagesFromClipboard } from "@/lib/academy-coach-capture";
import { COACH_IMAGE_MAX, coachImageSrc, type CoachImage } from "@/lib/academy-coach-media";

// Voice for Interview mode uses the browser's own speech tools, so there is
// nothing to install and no audio leaves the device through PurveX.
type Recognizer = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function recognizerCtor(): (new () => Recognizer) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognizer; webkitSpeechRecognition?: new () => Recognizer };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const noopSubscribe = () => () => {};
const canSpeak = () => typeof window !== "undefined" && "speechSynthesis" in window;
const canListen = () => recognizerCtor() !== null;
function spokenText(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/^\s*[-*•]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function speak(text: string) {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  const say = new SpeechSynthesisUtterance(spokenText(text));
  say.lang = "en-US";
  say.rate = 1;
  window.speechSynthesis.speak(say);
}

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
            }).catch(() => {});
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

export function CoachHeader({ children }: { children?: ReactNode }) {
  const { messages, clear, busy } = useCoach();
  return (
    <div className="pc-head">
      <p className="pc-head__title">Coach</p>
      <div className="flex shrink-0 items-center gap-1">
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
  const { messages, busy, enabled, remaining, error, send, resetToday, mode, setMode } = useCoach();
  const results = useResults();
  const prompts = mode === "interview" ? interviewStarters(results) : coachStarters(results);
  const [input, setInput] = useState("");
  const [images, setImages] = useState<CoachImage[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [attaching, setAttaching] = useState(false);
  const [listening, setListening] = useState(false);
  const speechOut = useSyncExternalStore(noopSubscribe, canSpeak, () => false);
  const speechIn = useSyncExternalStore(noopSubscribe, canListen, () => false);
  const heard = useRef<Recognizer | null>(null);
  const spoken = useRef(messages.length);
  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const blocked = busy || !enabled || remaining === 0;
  const canSend = Boolean(input.trim() || images.length);

  // Interview reads each new Coach reply aloud. No toggle. Speech is on.
  useEffect(() => {
    if (messages.length <= spoken.current) {
      spoken.current = messages.length;
      return;
    }
    spoken.current = messages.length;
    const last = messages[messages.length - 1];
    if (mode === "interview" && speechOut && last?.role === "assistant") speak(last.content);
  }, [messages, mode, speechOut]);

  useEffect(
    () => () => {
      heard.current?.stop();
      if (canSpeak()) window.speechSynthesis.cancel();
    },
    []
  );

  function toggleMic() {
    if (listening) {
      heard.current?.stop();
      return;
    }
    const Ctor = recognizerCtor();
    if (!Ctor) return;
    if (canSpeak()) window.speechSynthesis.cancel();
    const rec = new Ctor();
    const base = input.trim();
    rec.lang = "en-US";
    rec.interimResults = true;
    rec.continuous = true;
    rec.onresult = (e) => {
      const said = Array.from(e.results, (r) => r[0]?.transcript ?? "").join(" ").trim();
      setInput(`${base ? `${base} ` : ""}${said}`.slice(0, 6000));
    };
    rec.onend = () => {
      setListening(false);
      heard.current = null;
    };
    rec.onerror = () => {
      setListening(false);
      heard.current = null;
    };
    heard.current = rec;
    setListening(true);
    rec.start();
  }

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function addFiles(files: Iterable<File>) {
    if (blocked) return;
    setAttachError(null);
    setAttaching(true);
    try {
      const next = await filesToCoachImages(files, images.length);
      if (!next.length) {
        setAttachError("Could not read that screenshot. Paste or upload a PNG or JPG.");
        return;
      }
      setImages((prev) => [...prev, ...next].slice(0, COACH_IMAGE_MAX));
    } catch (err) {
      setAttachError(err instanceof Error ? err.message : "Could not add that image.");
    } finally {
      setAttaching(false);
    }
  }

  function submit() {
    if (blocked || !canSend) return;
    heard.current?.stop();
    if (canSpeak()) window.speechSynthesis.cancel();
    send(input, images);
    setInput("");
    setImages([]);
    setAttachError(null);
  }

  return (
    <div className="pc flex min-h-0 flex-1 flex-col">
      <div ref={listRef} className="pc-scroll min-h-0 flex-1 overflow-y-auto">
        {messages.length === 0 && remaining !== 0 && (
          <div className="pc-open">
            <p className="pc-open__lead">
              {mode === "interview"
                ? "Mock Tier 1 interviews scored like the real thing, and resume help built from the work you have proven."
                : "Picked from where you left off or where you struggled."}
            </p>
            <ul className="pc-tickets">
              {prompts.map((s) => (
                <li key={s.ask}>
                  <button type="button" disabled={blocked} onClick={() => send(s.ask)} className="pc-ticket">
                    <i />
                    <span>{s.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {messages.length === 0 && remaining === 0 && (
          <div className="pc-empty">
            <p>That’s all for today.<br />Your 25 chats reset tomorrow.</p>
            {process.env.NODE_ENV !== "production" && (
              <button type="button" className="pc-dock__send" onClick={() => void resetToday()}>
                Reset for testing
              </button>
            )}
          </div>
        )}

        <div className="pc-thread">
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="pc-turn">
                <p className="pc-reply__who">You</p>
                {m.images?.length ? (
                  <div className="pc-shots pc-shots--msg">
                    {m.images.map((image, j) => (
                      <img key={j} src={coachImageSrc(image)} alt="Attached screenshot" className="pc-shot__img" />
                    ))}
                  </div>
                ) : null}
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
              <div className="pc-thinking">
                <span className="pc-dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <p>{messages[messages.length - 1]?.images?.length ? "Looking at the shot…" : "Looking that up…"}</p>
              </div>
            </div>
          )}
        </div>
        {error && <p className="pc-error">{error}</p>}
        {!enabled && <p className="pc-error">PurveX Coach is not set up yet. Ask your instructor.</p>}
      </div>

      {remaining === 0 && messages.length > 0 ? (
        <p className="pc-dock pc-dock__done">
          That’s all for today. Your 25 chats reset tomorrow.
        </p>
      ) : remaining !== 0 ? (
        <form
          className="pc-dock"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          onDragOver={(e: DragEvent) => {
            if ([...e.dataTransfer.types].includes("Files")) e.preventDefault();
          }}
          onDrop={(e: DragEvent) => {
            e.preventDefault();
            void addFiles(e.dataTransfer.files);
          }}
        >
          <div className="pc-modes" role="radiogroup" aria-label="Coach mode">
            {COACH_MODES.map((id) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={mode === id}
                className={`pc-mode${mode === id ? " pc-mode--on" : ""}`}
                onClick={() => setMode(id)}
              >
                {COACH_MODE_LABELS[id]}
              </button>
            ))}
          </div>
          {images.length > 0 && (
            <div className="pc-shots">
              {images.map((image, i) => (
                <div key={`${image.data.slice(0, 24)}-${i}`} className="pc-shot">
                  <img src={coachImageSrc(image)} alt="" className="pc-shot__img" />
                  <button
                    type="button"
                    className="pc-shot__x"
                    aria-label="Remove screenshot"
                    onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <textarea
            className="pc-dock__field"
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPaste={(e) => {
              const files = imagesFromClipboard(e.clipboardData);
              if (!files.length) return;
              e.preventDefault();
              void addFiles(files);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={
              mode === "check"
                ? "What do you want guidance on?"
                : mode === "mentor"
                  ? "What real-world situation are you mapping?"
                  : mode === "interview"
                    ? "Answer the question, say start, or paste your resume."
                    : "Where are you stuck?"
            }
            maxLength={6000}
            disabled={!enabled}
            autoFocus
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            hidden
            onChange={(e) => {
              void addFiles(e.target.files || []);
              e.target.value = "";
            }}
          />
          <div className="pc-dock__tools">
            <button
              type="button"
              className="pc-dock__tool"
              disabled={blocked || attaching || images.length >= COACH_IMAGE_MAX}
              onClick={() => fileRef.current?.click()}
            >
              Upload
            </button>
            {mode === "interview" && speechIn && (
              <button
                type="button"
                className="pc-dock__tool inline-flex items-center justify-center gap-1.5"
                disabled={blocked}
                aria-pressed={listening}
                onClick={toggleMic}
              >
                {listening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {listening ? "Stop" : "Speak"}
              </button>
            )}
          </div>
          <button type="submit" disabled={blocked || attaching || !canSend} className="pc-dock__send">
            Send
          </button>
          {attachError && <p className="pc-dock__err">{attachError}</p>}
          {remaining !== null && (
            <p className="pc-dock__left">
              {remaining} left today
              {remaining <= 5 && (
                <>
                  {" · "}
                  <a href="/academy/drill" className="pc-dock__earn">
                    Earn more with a drill
                  </a>
                </>
              )}
            </p>
          )}
        </form>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Download, Server, X, type LucideIcon } from "lucide-react";
import "./risk-triage-lab.css";
import "./lab-kit.css";
import { useOptionalCoach } from "../coach-context";
import { LOST_ASK } from "./lab-brief";

// Shared pieces for the browser-only week labs. They use the Week 1 lab's
// rt-* styles so every lab looks and behaves the same.

/** SHA-256 of a string as lowercase hex, the same value sha256sum and Get-FileHash print. */
export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256File(file: File): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Hashes a fixed set of strings once, keyed like the input. Empty until the browser finishes. */
export function useHashes(inputs: Record<string, string>): Record<string, string> {
  const [out, setOut] = useState<Record<string, string>>({});
  const key = JSON.stringify(inputs);
  useEffect(() => {
    let live = true;
    const entries = Object.entries(JSON.parse(key) as Record<string, string>);
    Promise.all(entries.map(async ([k, v]) => [k, await sha256Hex(v)] as const)).then((rows) => {
      if (live) setOut(Object.fromEntries(rows));
    });
    return () => {
      live = false;
    };
  }, [key]);
  return out;
}

export const normHash = (v: string) => v.trim().toLowerCase().replace(/[^0-9a-f]/g, "");

/** Saves a text file exactly as written, so its hash matches the one the lab expects. */
export function downloadText(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const AV_COLORS = [
  ["#dbeafe", "#3b82f6"],
  ["#dcfce7", "#16a34a"],
  ["#fef3c7", "#d97706"],
  ["#fce7f3", "#db2777"],
  ["#ede9fe", "#7c3aed"],
  ["#cffafe", "#0891b2"],
];

/** A person in the lab's story, drawn as a simple bust in their own color. */
export function Avatar({ name, kind = "person", size = 32 }: { name: string; kind?: "person" | "server" | "unknown"; size?: number }) {
  if (kind === "server") {
    return (
      <span className="lk-av lk-av--server" style={{ width: size, height: size }} title={name}>
        <Server aria-hidden="true" />
      </span>
    );
  }
  const [bg, fg] = kind === "unknown" ? ["#e5e7eb", "#9ca3af"] : AV_COLORS[[...name].reduce((n, ch) => n + ch.charCodeAt(0), 0) % AV_COLORS.length];
  return (
    <span className="lk-av" style={{ width: size, height: size }} title={name}>
      <svg viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="20" fill={bg} />
        <circle cx="20" cy="16" r="7" fill={fg} />
        <path d="M7 38c1.6-7.5 6.8-11 13-11s11.4 3.5 13 11" fill={fg} />
        {kind === "unknown" && (
          <text x="20" y="19.5" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">
            ?
          </text>
        )}
      </svg>
    </span>
  );
}

/** The lab's guide gives each step's instruction as a message. */
export function Narrator({ name = "Alex Rivera", role = "IT", children }: { name?: string; role?: string; children: ReactNode }) {
  return (
    <div className="lk-nar">
      <Avatar name={name} size={36} />
      <div className="lk-nar__bubble">
        <small>
          {name} · {role}
        </small>
        <p>{children}</p>
      </div>
    </div>
  );
}

/** A thin terminal-style status bar across the top of a lab. Decorative only. */
export function LabHud({ label, icon: Icon, step, total }: { label: string; icon: LucideIcon; step: number; total: number }) {
  return (
    <div className="lk-hud" aria-hidden="true">
      <span className="lk-hud__live" />
      <Icon className="lk-hud__icon" />
      <b>PX-SOC</b>
      <span className="lk-hud__label">{label}</span>
      <span className="lk-hud__step">
        Step {step + 1}/{total}
      </span>
    </div>
  );
}

/** Tells the week this lab is finished once the student reaches its debrief. */
export function useLabDone(done: boolean, onDone?: () => void) {
  useEffect(() => {
    if (done) onDone?.();
  }, [done, onDone]);
}

/** Progress kept in the browser, like the Week 1 lab. */
export function useSaved<T>(key: string, start: T, valid: (v: T) => boolean): [T, (next: T | ((prev: T) => T)) => void] {
  const [s, setS] = useState<T>(() => {
    if (typeof window === "undefined") return start;
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "null") as T | null;
      if (saved && valid(saved)) return saved;
    } catch {}
    return start;
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(s));
    } catch {}
  }, [key, s]);
  return [s, setS];
}

export function Stepper({ steps, step, done, reached, onGo }: { steps: string[]; step: number; done: boolean[]; reached: boolean[]; onGo: (i: number) => void }) {
  return (
    <ol className="rt-steps" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((label, i) => (
        <li key={label}>
          <button
            type="button"
            className={`rt-step${step === i ? " is-on" : ""}${done[i] ? " is-done" : ""}`}
            disabled={!reached[i]}
            aria-current={step === i ? "step" : undefined}
            onClick={() => onGo(i)}
          >
            <span className="rt-step__n">{done[i] ? <Check aria-hidden="true" /> : i + 1}</span>
            <span className="rt-step__label">{label}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}

export type DotStatus = "open" | "answered" | "right" | "wrong";

/** One card at a time, with lettered dots. Arrows, dots, arrow keys and a swipe all move between cards. */
export function Deck({
  tags,
  titles,
  index,
  dir,
  onGo,
  status,
  children,
}: {
  tags: string[];
  titles: string[];
  index: number;
  dir: -1 | 0 | 1;
  onGo: (i: number) => void;
  status: DotStatus[];
  children: ReactNode;
}) {
  const touch = useRef<{ x: number; y: number } | null>(null);
  const go = (i: number) => {
    if (i >= 0 && i < tags.length) onGo(i);
  };
  return (
    <div
      className="rt-deck"
      onKeyDown={(e) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className="rt-deck__bar">
        <button type="button" className="rt-deck__nav" aria-label="Previous" disabled={index === 0} onClick={() => go(index - 1)}>
          <ChevronLeft aria-hidden="true" />
        </button>
        <ol className="rt-deck__dots">
          {tags.map((t, i) => (
            <li key={t}>
              <button
                type="button"
                className={`rt-deck__dot is-${status[i]}${i === index ? " is-on" : ""}`}
                aria-label={`${t}: ${titles[i]}`}
                aria-current={i === index ? "step" : undefined}
                onClick={() => go(i)}
              >
                {t}
              </button>
            </li>
          ))}
        </ol>
        <button type="button" className="rt-deck__nav" aria-label="Next" disabled={index === tags.length - 1} onClick={() => go(index + 1)}>
          <ChevronRight aria-hidden="true" />
        </button>
      </div>
      <div
        className="rt-deck__stage"
        role="group"
        aria-roledescription="carousel"
        aria-label={`${index + 1} of ${tags.length}`}
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          if (!touch.current) return;
          const dx = e.changedTouches[0].clientX - touch.current.x;
          const dy = e.changedTouches[0].clientY - touch.current.y;
          touch.current = null;
          if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
          go(dx < 0 ? index + 1 : index - 1);
        }}
      >
        <div key={index} className={dir === 1 ? "academy-slide-in-right" : dir === -1 ? "academy-slide-in-left" : undefined}>
          {children}
        </div>
      </div>
    </div>
  );
}

/** Deck position plus the slide direction and the move to the next open card once one is answered. */
export function useDeck(count: number) {
  const [card, setCard] = useState(0);
  const [dir, setDir] = useState<-1 | 0 | 1>(0);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const show = (i: number) => {
    window.clearTimeout(timer.current);
    if (i === card || i < 0 || i >= count) return;
    setDir(i > card ? 1 : -1);
    setCard(i);
  };
  const reset = () => {
    window.clearTimeout(timer.current);
    setCard(0);
    setDir(0);
  };
  /** After an answer, slide to the next unanswered card. */
  const next = (answered: (i: number) => boolean) => {
    if (!answered(card)) return;
    const order = [...Array(count).keys()];
    const target = [...order.slice(card + 1), ...order.slice(0, card)].find((i) => !answered(i));
    if (target === undefined) return;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setDir(target > card ? 1 : -1);
      setCard(target);
    }, 450);
  };
  return { card, dir, show, reset, next };
}

export function Verdict({ right, children }: { right: boolean; children: ReactNode }) {
  return (
    <p className={`rt-verdict${right ? " is-right" : " is-wrong"}`}>
      {right ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}
      <span>{children}</span>
    </p>
  );
}

/** A labeled single-choice list. `answer` marks the right option once the step is checked. */
export function Options({
  label,
  options,
  value,
  answer,
  disabled,
  onPick,
}: {
  label: string;
  options: { key: string; text: string }[];
  value?: string;
  answer?: string;
  disabled: boolean;
  onPick: (key: string) => void;
}) {
  return (
    <div className="lk-options" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={value === o.key}
          disabled={disabled}
          className={answer === o.key ? "is-answer" : ""}
          onClick={() => onPick(o.key)}
        >
          <span className="lk-options__mark" aria-hidden="true" />
          <span>{o.text}</span>
        </button>
      ))}
    </div>
  );
}

export function CopyButton({ text, label = "Copy", onCopied }: { text: string; label?: string; onCopied?: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="lk-mini"
      onClick={() => {
        onCopied?.();
        navigator.clipboard?.writeText(text).then(
          () => {
            setDone(true);
            window.setTimeout(() => setDone(false), 1400);
          },
          () => {},
        );
      }}
    >
      {done ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />} {done ? "Copied" : label}
    </button>
  );
}

export function DownloadButton({ name, text, onDone }: { name: string; text: string; onDone?: () => void }) {
  return (
    <button
      type="button"
      className="lk-mini"
      onClick={() => {
        downloadText(name, text);
        onDone?.();
      }}
    >
      <Download aria-hidden="true" /> Download {name}
    </button>
  );
}

/** CyberChef, the open-source analyst's toolkit from GCHQ, opened on a ready recipe. */
export const CYBERCHEF = "https://gchq.github.io/CyberChef/";
export const CHEF_SHA256 = `${CYBERCHEF}#recipe=SHA2('256',64,160)`;
export const CHEF_FROM_BASE64 = `${CYBERCHEF}#recipe=From_Base64('A-Za-z0-9%2B/%3D',true,false)`;

/**
 * How to take a SHA-256 with the open-source tools analysts use on the job:
 * CyberChef in any browser, PowerShell 7 on any system, and sha256sum,
 * shasum or OpenSSL in a terminal. The small hasher at the end is only for
 * schools that block CyberChef. It runs in the browser and sends nothing anywhere.
 */
export function HashTool({ mode }: { mode: "file" | "text" }) {
  const [tab, setTab] = useState<"cyberchef" | "pwsh" | "terminal" | "backup">("cyberchef");
  const [out, setOut] = useState("");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const tabs = [
    { key: "cyberchef", label: "CyberChef" },
    { key: "pwsh", label: "PowerShell 7" },
    { key: "terminal", label: "Terminal" },
    { key: "backup", label: "CyberChef blocked?" },
  ] as const;
  return (
    <details className="rt-brief lk-tool">
      <summary>
        <span>
          <b>Stuck, or prefer the command line?</b>
          <small>Step by step for free, open-source tools: CyberChef, PowerShell 7, sha256sum and OpenSSL</small>
        </span>
      </summary>
      <div className="rt-brief__body">
        <div className="lk-tabs" role="tablist" aria-label="Tool">
          {tabs.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === "cyberchef" && (
          <div className="lk-howto">
            <p className="lk-oss">Open source · Apache 2.0 · by GCHQ · runs in your browser</p>
            <p>
              <a className="lk-mini" href={CHEF_SHA256} target="_blank" rel="noreferrer">
                Open CyberChef with SHA-256 ready
              </a>
            </p>
            {mode === "file" ? (
              <p>Drag the file into the Input box, or use its Open file button. The Output box shows the SHA-256.</p>
            ) : (
              <p>Type the word into Input exactly, with no space or line break after it. Output shows the SHA-256.</p>
            )}
          </div>
        )}
        {tab === "pwsh" && (
          <div className="lk-howto">
            <p className="lk-oss">Open source · MIT · Windows, Mac and Linux · run pwsh</p>
            {mode === "file" ? (
              <>
                <p>From the folder the file downloaded to:</p>
                <pre>Get-FileHash ./FILE-NAME.txt -Algorithm SHA256</pre>
                <p>Capital or lowercase letters both count.</p>
              </>
            ) : (
              <>
                <p>With the word inside the quotes:</p>
                <pre>{`$b = [Text.Encoding]::UTF8.GetBytes("Summer2026!")\n[Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($b))`}</pre>
              </>
            )}
          </div>
        )}
        {tab === "terminal" && (
          <div className="lk-howto">
            <p className="lk-oss">Open source · GNU coreutils and OpenSSL · Linux, Mac, and Git Bash on Windows</p>
            {mode === "file" ? (
              <>
                <p>From your Downloads folder. Linux:</p>
                <pre>sha256sum FILE-NAME.txt</pre>
                <p>Mac:</p>
                <pre>shasum -a 256 FILE-NAME.txt</pre>
                <p>Anywhere OpenSSL is installed:</p>
                <pre>openssl dgst -sha256 FILE-NAME.txt</pre>
              </>
            ) : (
              <>
                <p>printf adds no hidden line break, so the hash matches. Linux:</p>
                <pre>printf &apos;%s&apos; &apos;Summer2026!&apos; | sha256sum</pre>
                <p>Mac, or anywhere with OpenSSL:</p>
                <pre>printf &apos;%s&apos; &apos;Summer2026!&apos; | openssl dgst -sha256</pre>
              </>
            )}
          </div>
        )}
        {tab === "backup" && (
          <div className="lk-howto">
            <p>If your school blocks CyberChef, this hasher gives the same answer. It runs in your browser and sends nothing anywhere.</p>
            {mode === "file" ? (
              <label className="lk-drop">
                <input
                  type="file"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setBusy(true);
                    setOut(await sha256File(f));
                    setBusy(false);
                  }}
                />
                <span>Choose a downloaded file. It stays on your computer.</span>
              </label>
            ) : (
              <div className="lk-hashtext">
                <input type="text" value={text} placeholder="Type a word to hash" onChange={(e) => setText(e.target.value)} spellCheck={false} autoComplete="off" />
                <button
                  type="button"
                  className="rt-btn"
                  disabled={!text || busy}
                  onClick={async () => {
                    setBusy(true);
                    setOut(await sha256Hex(text));
                    setBusy(false);
                  }}
                >
                  Hash it
                </button>
              </div>
            )}
            {out && (
              <div className="lk-hashout">
                <code>{out}</code>
                <CopyButton text={out} />
              </div>
            )}
          </div>
        )}
      </div>
    </details>
  );
}

/** A SHA-256 in monospace, wrapped so it fits a phone. */
export function Hash({ value }: { value?: string }) {
  if (!value) return <code className="lk-hash">computing…</code>;
  return <code className="lk-hash">{value}</code>;
}

/**
 * A pasted hash laid over the reference one, character by character, so a
 * student sees exactly where two fingerprints agree and where they split.
 */
export function HashCompare({ label, mine, reference }: { label: string; mine: string; reference?: string }) {
  if (!reference || !mine) return null;
  const a = normHash(mine);
  const same = [...reference].filter((ch, i) => a[i] === ch).length;
  return (
    <div className="lk-compare" aria-label={`${label}: ${same} of ${reference.length} characters match`}>
      <div className="lk-compare__row">
        <span>IT portal</span>
        <code>{reference}</code>
      </div>
      <div className="lk-compare__row">
        <span>{label}</span>
        <code>
          {[...reference].map((ch, i) => (
            <b key={i} className={a[i] === ch ? "is-same" : "is-diff"} style={{ animationDelay: `${i * 12}ms` }}>
              {a[i] ?? "·"}
            </b>
          ))}
        </code>
      </div>
      <p className="lk-compare__meter">
        <i style={{ width: `${(same / reference.length) * 100}%` }} className={same === reference.length ? "is-full" : ""} />
        <span>
          {same} of {reference.length} characters line up
        </span>
      </p>
    </div>
  );
}

/**
 * Warm-up: type, and watch the SHA-256 update live. One changed character
 * flips about half the hash, which is why a matching hash means an
 * untouched file.
 */
export function HashPlayground({ seed }: { seed: string }) {
  const [text, setText] = useState(seed);
  const [base, setBase] = useState<string>("");
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    let live = true;
    sha256Hex(text).then((h) => {
      if (!live) return;
      setNow(h);
      setBase((b) => b || h);
    });
    return () => {
      live = false;
    };
  }, [text]);
  const changed = base && now ? [...now].filter((ch, i) => base[i] !== ch).length : 0;
  return (
    <div className="lk-play">
      <div className="lk-play__head">
        <b>Warm-up: one character, a whole new fingerprint</b>
        <small>Change a single letter below, even a capital or a space, and watch the hash.</small>
      </div>
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} autoComplete="off" aria-label="Text to hash" />
      <code className="lk-play__hash" aria-live="polite">
        {[...now].map((ch, i) => (
          <b key={i} className={base[i] !== ch ? "is-diff" : ""}>
            {ch}
          </b>
        ))}
      </code>
      <p className="lk-note">
        {changed === 0 ? "This is the fingerprint of the text as it started." : `${changed} of 64 characters changed. You cannot tell from the new hash what you edited, or turn it back into the text.`}
      </p>
      <div>
        <button type="button" className="lk-mini" onClick={() => setText(seed)}>
          Reset the text
        </button>
      </div>
    </div>
  );
}

export interface GuideStep {
  title: ReactNode;
  done: boolean;
  /** Controls for this step. Hidden until the student reaches it, so only one thing is asked at a time. */
  body?: ReactNode;
}

/**
 * A numbered walkthrough inside a card: finished steps get a tick and the current one is highlighted.
 * By default later steps stay hidden until reached. Pass showAll when a step can be done outside the page
 * (in a terminal, in a CyberChef tab already open), so nobody gets stuck waiting for a step to unlock.
 */
export function Guide({ steps, showAll = false }: { steps: GuideStep[]; showAll?: boolean }) {
  const coach = useOptionalCoach();
  const now = steps.findIndex((st) => !st.done);
  return (
    <ol className="lk-guide">
      {steps.map((st, i) => {
        const state = st.done ? "is-done" : i === now ? "is-now" : "is-later";
        return (
          <li key={i} className={state} aria-current={i === now ? "step" : undefined}>
            <span className="lk-guide__n">{st.done ? <Check aria-hidden="true" /> : i + 1}</span>
            <div className="lk-guide__body">
              <b>{st.title}</b>
              {st.body && (showAll || now === -1 || i <= now) && st.body}
              {i === now && coach?.enabled && (
                <button type="button" className="lk-guide__ask" onClick={() => coach.ask(LOST_ASK)}>
                  Lost? Ask Coach
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** The footer's "what now" line: points at the first unfinished card. */
export function nextHint(done: boolean[], names: string[]) {
  const i = done.findIndex((d) => !d);
  return i === -1 ? "All done. Check your answers." : `Next: ${names[i]}`;
}

const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * Shows `to`, and when `play` changes, animates from `from` into `to` one
 * character at a time so the student sees the value turn back into the
 * original. Skips the animation for people who ask for reduced motion.
 */
export function Morph({ from, to, play, className }: { from: string; to: string; play: number; className?: string }) {
  const [shown, setShown] = useState(to);
  useEffect(() => {
    if (!play) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = requestAnimationFrame(() => setShown(to));
      return () => cancelAnimationFrame(id);
    }
    const start = performance.now();
    const ms = 1100;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const len = Math.round(from.length + (to.length - from.length) * t);
      const fixed = Math.floor(to.length * t);
      let out = to.slice(0, fixed);
      for (let i = fixed; i < len; i++) out += t < 0.15 && from[i] ? from[i] : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
      setShown(out);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [play, from, to]);
  return <span className={className}>{play ? shown : to}</span>;
}

/** The one idea a card should leave behind, shown once the student has done it. */
export function Takeaway({ children, afterMorph = false }: { children: ReactNode; afterMorph?: boolean }) {
  return (
    <div className={`lk-takeaway${afterMorph ? " lk-takeaway--late" : ""}`} role="note">
      <b>Walk away knowing</b>
      <p>{children}</p>
    </div>
  );
}

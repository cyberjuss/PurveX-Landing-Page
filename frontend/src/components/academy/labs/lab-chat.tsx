"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Check, X } from "lucide-react";
import { Avatar } from "./lab-kit";
import "./lab-chat.css";

// The guided-chat lab kit. Labs play out as a conversation with Alex: he sends
// the situation and tasks, the student answers with chips that appear as their
// own replies. These primitives keep every chat lab consistent. Each lab keeps
// its own scoring; it only changes how the steps are presented.

/** Alex's message (left). tone marks a verdict bubble green or red. */
export function Says({ children, tone, who = "Alex Rivera" }: { children: ReactNode; tone?: "right" | "wrong"; who?: string }) {
  return (
    <div className="lc-row lc-row--alex">
      <Avatar name={who} size={30} />
      <div className={`lc-bubble lc-bubble--alex${tone ? ` is-${tone}` : ""}`}>
        {tone && (tone === "right" ? <Check className="lc-ic" aria-hidden="true" /> : <X className="lc-ic" aria-hidden="true" />)}
        <span>{children}</span>
      </div>
    </div>
  );
}

/** The student's reply (right). */
export function Mine({ children }: { children: ReactNode }) {
  return (
    <div className="lc-row lc-row--me">
      <div className="lc-bubble lc-bubble--me">{children}</div>
    </div>
  );
}

export function ChipRow({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div className="lc-chiprow">
      {label && <span className="lc-chiprow__label">{label}</span>}
      <div className="lc-chips">{children}</div>
    </div>
  );
}

export function Chip({ children, onClick, active }: { children: ReactNode; onClick: () => void; active?: boolean }) {
  return (
    <button type="button" className={`lc-chip${active ? " is-active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

export function SendAction({ children, onClick, subtle }: { children: ReactNode; onClick: () => void; subtle?: boolean }) {
  return (
    <button type="button" className={`lc-send${subtle ? " is-subtle" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

/** The chat window: a header for who you're talking to and how far along you
 *  are, the scrolling thread, and the composer. `signal` changes whenever the
 *  thread gains a message, which keeps the newest one in view. */
export function ChatShell({
  who = "Alex Rivera",
  role,
  steps,
  step,
  done,
  onAsk,
  signal,
  thread,
  composer,
  label,
}: {
  who?: string;
  role: string;
  steps: string[];
  step: number;
  done: boolean[];
  onAsk?: () => void;
  signal: unknown;
  thread: ReactNode;
  composer: ReactNode;
  label?: string;
}) {
  const threadRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [signal]);

  return (
    <section className="lc" aria-label={label ?? "Guided lab chat"}>
      <header className="lc-head">
        <Avatar name={who} size={38} />
        <div className="lc-head__who">
          <b>{who}</b>
          <span>{role}{steps[step] ? ` · ${steps[step]}` : ""}</span>
        </div>
        <ol className="lc-head__steps" aria-label="Progress">
          {steps.map((s, i) => (
            <li key={s} className={`lc-pip${i === step ? " is-on" : ""}${done[i] ? " is-done" : ""}`} title={s} />
          ))}
        </ol>
        {onAsk && (
          <button type="button" className="lc-ask" onClick={onAsk}>Lost?</button>
        )}
      </header>
      <div className="lc-thread" ref={threadRef}>
        {thread}
      </div>
      <div className="lc-composer">{composer}</div>
    </section>
  );
}

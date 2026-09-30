"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { academyFetch } from "@/lib/academy-client";
import "./hosted-lab.css";
import "./get-help.css";

// Reach a person when something is broken. Opened from the account menu and
// the lab menu; mounted once in the shell. Range attaches the lab status, so
// the student only says what went wrong.

export type HelpTopic = "lab" | "sync" | "check" | "account" | "other";

const TOPICS: { id: HelpTopic; label: string }[] = [
  { id: "lab", label: "My lab will not start or open" },
  { id: "sync", label: "My lab is not syncing" },
  { id: "check", label: "A check marked my work wrong" },
  { id: "account", label: "Sign-in or account" },
  { id: "other", label: "Something else" },
];

// `n` counts opens, so each open mounts a fresh form.
let current: { open: boolean; topic: HelpTopic; n: number } = { open: false, topic: "other", n: 0 };
const listeners = new Set<() => void>();
const emit = (next: typeof current) => {
  current = next;
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const CLOSED = { open: false, topic: "other" as HelpTopic, n: 0 };

export const openHelp = (topic: HelpTopic = "other") => emit({ open: true, topic, n: current.n + 1 });
const closeHelp = () => emit({ ...current, open: false });

export function HelpDialog({ email }: { email: string | null }) {
  const state = useSyncExternalStore(subscribe, () => current, () => CLOSED);
  if (!state.open) return null;
  return <HelpPanel key={state.n} email={email} initialTopic={state.topic} />;
}

function HelpPanel({ email, initialTopic }: { email: string | null; initialTopic: HelpTopic }) {
  const pathname = usePathname();
  const [topic, setTopic] = useState<HelpTopic>(initialTopic);
  const [message, setMessage] = useState("");
  const [phase, setPhase] = useState<"edit" | "sending" | "sent">("edit");
  const [error, setError] = useState<string | null>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    box.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeHelp();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const send = async () => {
    if (message.trim().length < 5) {
      setError("Say in a few words what went wrong.");
      return;
    }
    setPhase("sending");
    setError(null);
    try {
      const r = await academyFetch("/academy/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, message, page: pathname }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setError(data.error ?? "Could not send. Try again.");
        setPhase("edit");
        return;
      }
      setMessage("");
      setPhase("sent");
    } catch {
      setError("Could not reach Range. Check your connection and try again.");
      setPhase("edit");
    }
  };

  return createPortal(
    <div className="gh">
      <button type="button" className="gh__scrim" aria-label="Close" onClick={closeHelp} />
      <section className="hl gh__panel" role="dialog" aria-modal="true" aria-labelledby="gh-title">
        <div className="gh__head">
          <div>
            <p className="hl__kicker">Get help</p>
            <h2 id="gh-title" className="gh__title">
              {phase === "sent" ? "Message sent" : "Talk to a person"}
            </h2>
          </div>
          <button type="button" className="gh__close" aria-label="Close" onClick={closeHelp}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {phase === "sent" ? (
          <>
            <p className="gh__done">
              <Check className="h-4 w-4" />
              A person on the PurveX team will reply{email ? ` to ${email}` : " by email"} within one business day.
            </p>
            <button type="button" className="hl__go" onClick={closeHelp}>
              Done
            </button>
          </>
        ) : (
          <>
            <fieldset className="gh__topics">
              <legend>What is wrong?</legend>
              {TOPICS.map((t) => (
                <label key={t.id} className={topic === t.id ? "is-on" : ""}>
                  <input type="radio" name="gh-topic" value={t.id} checked={topic === t.id} onChange={() => setTopic(t.id)} />
                  {t.label}
                </label>
              ))}
            </fieldset>
            <label className="gh__field">
              <span>What happened?</span>
              <textarea
                ref={box}
                value={message}
                maxLength={2000}
                rows={4}
                placeholder="For example: I clicked Open and the tab stays blank."
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <p className="gh__note">We attach your lab status and the page you are on, so you do not need to.</p>
            {error && (
              <p className="hl__error" role="alert">
                {error}
              </p>
            )}
            <div className="hl__actions">
              <button type="button" className="hl__go" onClick={() => void send()} disabled={phase === "sending"}>
                {phase === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
                {phase === "sending" ? "Sending" : "Send"}
              </button>
              <button type="button" className="hl__ghost" onClick={closeHelp}>
                Cancel
              </button>
            </div>
          </>
        )}
      </section>
    </div>,
    document.body
  );
}

"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { sendHold } from "@/lib/holds";

export function HoldCard({ source }: { source: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [need, setNeed] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const n = name.trim();
    const mail = email.trim();
    const help = need.trim();
    if (!n || !mail || !help) {
      setState("error");
      setMsg("Name, email, and what you need.");
      return;
    }
    setState("loading");
    setMsg("");
    try {
      await sendHold({ name: n, email: mail, need: help, source });
      setState("ok");
      setMsg("We have it. We will write back.");
      setName("");
      setEmail("");
      setNeed("");
    } catch (err) {
      setState("error");
      setMsg(err instanceof Error ? err.message : "Unable to send right now.");
    }
  }

  return (
    <form className="hold" onSubmit={onSubmit}>
      <header>
        <span>Hold</span>
        <span>30 min</span>
      </header>
      <strong>Open conversation</strong>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </label>
      <label>
        Email
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </label>
      <label>
        What you need help with
        <textarea value={need} onChange={(e) => setNeed(e.target.value)} rows={3} />
      </label>
      <button type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Sending..." : <>Send hold <ArrowRight size={14} /></>}
      </button>
      {msg && <p className={`hold__msg hold__msg--${state}`}>{msg}</p>}
      <style>{HOLD_CSS}</style>
    </form>
  );
}

const HOLD_CSS = `
.hold {
  background: #fff; color: var(--ink); border-left: 4px solid var(--accent);
  padding: 22px 22px 20px; box-shadow: 0 28px 48px -22px rgba(16,8,64,.55);
}
.hold header {
  display: flex; justify-content: space-between; align-items: center;
  font-family: var(--font-mono); font-size: .62rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep);
}
.hold header span:last-child { padding: 3px 7px; background: var(--accent-soft) }
.hold strong {
  display: block; margin: 14px 0 0;
  font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; letter-spacing: -.02em;
}
.hold label {
  display: block; margin: 14px 0 0;
  font-family: var(--font-mono); font-size: .58rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: var(--muted);
}
.hold input, .hold textarea {
  display: block; width: 100%; margin: 6px 0 0; padding: 8px 0 7px;
  border: 0; border-bottom: 1px solid rgba(106,92,255,.22);
  background: none; color: var(--ink); font: inherit; font-size: .88rem;
  letter-spacing: 0; text-transform: none; outline: none; resize: vertical;
}
.hold textarea { min-height: 72px }
.hold input:focus, .hold textarea:focus { border-bottom-color: var(--accent) }
.hold button {
  display: inline-flex; align-items: center; gap: 8px; margin-top: 16px;
  height: 40px; padding: 0 16px; border: 0;
  background: var(--accent-deep); color: #fff; font-weight: 650; font-size: .86rem;
  cursor: pointer;
}
.hold button:hover { background: var(--accent) }
.hold button:disabled { opacity: .7; cursor: default }
.hold__msg { margin: 10px 0 0; font-size: .8rem; line-height: 1.4 }
.hold__msg--ok { color: var(--green) }
.hold__msg--error { color: var(--red) }
`;

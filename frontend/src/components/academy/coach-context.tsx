"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { academyFetch } from "@/lib/academy-client";
import { loadResults } from "@/lib/academy-score";

export type CoachMessage = { role: "user" | "assistant"; content: string };

type CoachState = {
  messages: CoachMessage[];
  busy: boolean;
  enabled: boolean;
  remaining: number | null;
  limit: number;
  error: string | null;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  send: (text: string) => void;
  clear: () => void;
  // Sends a question from anywhere in the Academy. It goes to the inline
  // coach panel when one is on the page, otherwise it opens the pop-up.
  ask: (text: string) => void;
  registerInline: (el: HTMLElement | null) => void;
};

const CoachContext = createContext<CoachState | null>(null);

export function useCoach() {
  const ctx = useContext(CoachContext);
  if (!ctx) throw new Error("useCoach must be used inside CoachProvider");
  return ctx;
}

export function CoachProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const inlineRef = useRef<HTMLElement | null>(null);
  const busyRef = useRef(false);
  const messagesRef = useRef<CoachMessage[]>([]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    academyFetch("/academy/api/coach")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        setEnabled(data.enabled !== false);
        if (typeof data.remaining === "number") setRemaining(data.remaining);
        if (typeof data.limit === "number") setLimit(data.limit);
      })
      .catch(() => {});
  }, []);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || busyRef.current) return;
      if (remaining === 0) {
        setError(`You have used all ${limit} coach questions for today. They reset tomorrow.`);
        return;
      }
      busyRef.current = true;
      setBusy(true);
      setError(null);
      const history = messagesRef.current;
      const next = [...history, { role: "user" as const, content: question }];
      setMessages(next);
      try {
        const res = await academyFetch("/academy/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question, history, results: loadResults() }),
        });
        const data = await res.json();
        if (typeof data.remaining === "number") setRemaining(data.remaining);
        if (!res.ok || typeof data.reply !== "string" || !data.reply.trim()) {
          setError(typeof data.error === "string" && data.error ? data.error : "PurveX Coach is unavailable right now.");
          return;
        }
        setMessages([...next, { role: "assistant", content: data.reply }]);
      } catch {
        setError("Could not reach PurveX Coach.");
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [remaining, limit]
  );

  const ask = useCallback(
    (text: string) => {
      if (inlineRef.current) {
        inlineRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        setModalOpen(true);
      }
      send(text);
    },
    [send]
  );

  const registerInline = useCallback((el: HTMLElement | null) => {
    inlineRef.current = el;
  }, []);

  const clear = useCallback(() => {
    if (busyRef.current) return;
    setMessages([]);
    setError(null);
  }, []);

  return (
    <CoachContext.Provider
      value={{ messages, busy, enabled, remaining, limit, error, modalOpen, setModalOpen, send, clear, ask, registerInline }}
    >
      {children}
    </CoachContext.Provider>
  );
}

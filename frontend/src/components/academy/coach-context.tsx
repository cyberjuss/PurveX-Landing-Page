"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { academyFetch, RESULTS_CHANGED_EVENT, RESULTS_UPDATED_EVENT } from "@/lib/academy-client";
import { DEFAULT_COACH_MODE, modeFromReport, type CoachMode } from "@/lib/academy-coach-mode";
import { COACH_SHOT_ASK, type CoachImage } from "@/lib/academy-coach-media";
import { loadResults } from "@/lib/academy-score";

export type CoachMessage = { role: "user" | "assistant"; content: string; images?: CoachImage[] };

type CoachState = {
  messages: CoachMessage[];
  busy: boolean;
  enabled: boolean;
  remaining: number | null;
  limit: number;
  error: string | null;
  modalOpen: boolean;
  setModalOpen: (open: boolean) => void;
  mode: CoachMode;
  setMode: (mode: CoachMode) => void;
  send: (text: string, images?: CoachImage[]) => void;
  clear: () => void;
  resetToday: () => Promise<void>;
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
  const [mode, setModeState] = useState<CoachMode>(DEFAULT_COACH_MODE);
  const inlineRef = useRef<HTMLElement | null>(null);
  const busyRef = useRef(false);
  const messagesRef = useRef<CoachMessage[]>([]);
  const pickedRef = useRef(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const apply = () => {
      if (pickedRef.current) return;
      setModeState(modeFromReport(loadResults()));
    };
    apply();
    window.addEventListener(RESULTS_CHANGED_EVENT, apply);
    window.addEventListener(RESULTS_UPDATED_EVENT, apply);
    window.addEventListener("storage", apply);
    return () => {
      window.removeEventListener(RESULTS_CHANGED_EVENT, apply);
      window.removeEventListener(RESULTS_UPDATED_EVENT, apply);
      window.removeEventListener("storage", apply);
    };
  }, []);

  const setMode = useCallback((next: CoachMode) => {
    pickedRef.current = true;
    setModeState(next);
  }, []);

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
    async (text: string, images?: CoachImage[]) => {
      const shots = images?.slice(0, 2) ?? [];
      const question = text.trim() || (shots.length ? COACH_SHOT_ASK : "");
      if (!question || busyRef.current) return;
      if (remaining === 0) {
        setError(`You have used all ${limit} coach questions for today. They reset tomorrow.`);
        return;
      }
      busyRef.current = true;
      setBusy(true);
      setError(null);
      const history = messagesRef.current.map(({ role, content }) => ({ role, content }));
      const next = [...messagesRef.current, { role: "user" as const, content: question, images: shots.length ? shots : undefined }];
      setMessages(next);
      try {
        const res = await academyFetch("/academy/api/coach", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question, images: shots, history, results: loadResults(), mode }),
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
    [remaining, limit, mode]
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

  const resetToday = useCallback(async () => {
    const r = await academyFetch("/academy/api/coach?reset=1");
    const data = r.ok ? await r.json() : null;
    if (typeof data?.remaining === "number") setRemaining(data.remaining);
    setMessages([]);
    setError(null);
  }, []);

  return (
    <CoachContext.Provider
      value={{ messages, busy, enabled, remaining, limit, error, modalOpen, setModalOpen, mode, setMode, send, clear, resetToday, ask, registerInline }}
    >
      {children}
    </CoachContext.Provider>
  );
}

"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PhaseDef } from "@/lib/academy-content";
import { findQuiz } from "@/content/academy/quizzes";

const STORAGE_KEY = "academy-progress-v1";
const QUIZ_PASS_KEY = "academy-quiz-pass-v1";
const LAST_STOP_KEY = "academy-last-stop-v1";

function entryKey(phaseSlug: string, entrySlug: string) {
  return `${phaseSlug}:${entrySlug}`;
}

export type LastStop = { phaseSlug: string; entrySlug: string };

function parseLastStop(raw: string | null): LastStop | null {
  if (!raw) return null;
  const [phaseSlug, entrySlug] = raw.split(":");
  return phaseSlug && entrySlug ? { phaseSlug, entrySlug } : null;
}

function countEntries(phases: PhaseDef[]) {
  return phases.reduce((total, phase) => total + phase.weeks.length + (phase.homeLab ? 1 : 0), 0);
}

interface AcademyProgressContextValue {
  isComplete: (phaseSlug: string, entrySlug: string) => boolean;
  hasPassedQuiz: (phaseSlug: string, entrySlug: string) => boolean;
  recordQuizPass: (phaseSlug: string, entrySlug: string) => void;
  toggleComplete: (phaseSlug: string, entrySlug: string) => void;
  lastStop: LastStop | null;
  setLastStop: (phaseSlug: string, entrySlug: string) => void;
  completedCount: number;
  totalCount: number;
}

const AcademyProgressContext = createContext<AcademyProgressContextValue | null>(null);

export function AcademyProgressProvider({ phases, children }: { phases: PhaseDef[]; children: React.ReactNode }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [quizPasses, setQuizPasses] = useState<Set<string>>(new Set());
  const [lastStop, setLastStopState] = useState<LastStop | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const passedRaw = window.localStorage.getItem(QUIZ_PASS_KEY);
      const done = new Set<string>(raw ? JSON.parse(raw) : []);
      const passed = new Set<string>(passedRaw ? JSON.parse(passedRaw) : []);
      for (const key of [...done]) {
        const [phaseSlug, entrySlug] = key.split(":");
        if (phaseSlug && entrySlug && findQuiz(phaseSlug, entrySlug) && !passed.has(key)) done.delete(key);
      }
      setCompleted(done);
      setQuizPasses(passed);
      setLastStopState(parseLastStop(window.localStorage.getItem(LAST_STOP_KEY)));
    } catch {
      // Private browsing / blocked storage -- progress just won't persist.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
    } catch {
      // Ignore -- nothing to persist to.
    }
  }, [completed, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(QUIZ_PASS_KEY, JSON.stringify([...quizPasses]));
    } catch {
      // Ignore -- nothing to persist to.
    }
  }, [quizPasses, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      if (lastStop) window.localStorage.setItem(LAST_STOP_KEY, entryKey(lastStop.phaseSlug, lastStop.entrySlug));
    } catch {
      // Ignore -- nothing to persist to.
    }
  }, [lastStop, loaded]);

  const totalCount = useMemo(() => countEntries(phases), [phases]);

  const value = useMemo<AcademyProgressContextValue>(
    () => ({
      isComplete: (phaseSlug, entrySlug) => completed.has(entryKey(phaseSlug, entrySlug)),
      hasPassedQuiz: (phaseSlug, entrySlug) => quizPasses.has(entryKey(phaseSlug, entrySlug)),
      recordQuizPass: (phaseSlug, entrySlug) => {
        const key = entryKey(phaseSlug, entrySlug);
        setQuizPasses((prev) => {
          if (prev.has(key)) return prev;
          const next = new Set(prev);
          next.add(key);
          return next;
        });
        setCompleted((prev) => {
          if (prev.has(key)) return prev;
          const next = new Set(prev);
          next.add(key);
          return next;
        });
      },
      toggleComplete: (phaseSlug, entrySlug) => {
        const key = entryKey(phaseSlug, entrySlug);
        setCompleted((prev) => {
          const next = new Set(prev);
          if (next.has(key)) {
            next.delete(key);
            return next;
          }
          if (findQuiz(phaseSlug, entrySlug) && !quizPasses.has(key)) return prev;
          next.add(key);
          return next;
        });
      },
      lastStop,
      setLastStop: (phaseSlug, entrySlug) => {
        setLastStopState((prev) =>
          prev?.phaseSlug === phaseSlug && prev.entrySlug === entrySlug ? prev : { phaseSlug, entrySlug }
        );
      },
      completedCount: completed.size,
      totalCount,
    }),
    [completed, quizPasses, lastStop, totalCount]
  );

  return <AcademyProgressContext.Provider value={value}>{children}</AcademyProgressContext.Provider>;
}

export function useAcademyProgress() {
  const ctx = useContext(AcademyProgressContext);
  if (!ctx) throw new Error("useAcademyProgress must be used within AcademyProgressProvider");
  return ctx;
}

export function RecordLastStop({ phaseSlug, entrySlug }: { phaseSlug: string; entrySlug: string }) {
  const { setLastStop } = useAcademyProgress();
  useEffect(() => {
    setLastStop(phaseSlug, entrySlug);
  }, [phaseSlug, entrySlug, setLastStop]);
  return null;
}

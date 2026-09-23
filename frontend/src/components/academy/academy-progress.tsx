"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PhaseDef } from "@/lib/academy-content";

const STORAGE_KEY = "academy-progress-v1";
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
  toggleComplete: (phaseSlug: string, entrySlug: string) => void;
  lastStop: LastStop | null;
  setLastStop: (phaseSlug: string, entrySlug: string) => void;
  completedCount: number;
  totalCount: number;
}

const AcademyProgressContext = createContext<AcademyProgressContextValue | null>(null);

export function AcademyProgressProvider({ phases, children }: { phases: PhaseDef[]; children: React.ReactNode }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [lastStop, setLastStopState] = useState<LastStop | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setCompleted(new Set(JSON.parse(raw)));
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
      if (lastStop) window.localStorage.setItem(LAST_STOP_KEY, entryKey(lastStop.phaseSlug, lastStop.entrySlug));
    } catch {
      // Ignore -- nothing to persist to.
    }
  }, [lastStop, loaded]);

  const totalCount = useMemo(() => countEntries(phases), [phases]);

  const value = useMemo<AcademyProgressContextValue>(
    () => ({
      isComplete: (phaseSlug, entrySlug) => completed.has(entryKey(phaseSlug, entrySlug)),
      toggleComplete: (phaseSlug, entrySlug) => {
        const key = entryKey(phaseSlug, entrySlug);
        setCompleted((prev) => {
          const next = new Set(prev);
          if (next.has(key)) next.delete(key);
          else next.add(key);
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
    [completed, lastStop, totalCount]
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

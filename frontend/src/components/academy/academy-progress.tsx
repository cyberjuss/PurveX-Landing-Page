"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PhaseDef, WeekDef } from "@/lib/academy-content";
import { findQuiz } from "@/content/academy/quizzes";
import { useResults } from "@/lib/academy-client";
import { CHALLENGE_PATHS, MISSION_CATALOG, type MissionCatalogEntry } from "@/lib/academy-missions";
import type { Results } from "@/lib/academy-score";
import { isPhaseLocked } from "@/lib/academy-locks";

const STORAGE_KEY = "academy-progress-v1";
const QUIZ_PASS_KEY = "academy-quiz-pass-v1";
const LAST_STOP_KEY = "academy-last-stop-v1";
const LABS_DONE_KEY = "academy-labs-done-v1";

/** The slug a tab gets in the URL. Section tabs use the same one. */
export function slugify(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function labKey(phaseSlug: string, entrySlug: string, labSlug: string) {
  return `${phaseSlug}:${entrySlug}:${labSlug}`;
}

/** One thing a week needs before it counts as complete. */
export interface Requirement {
  label: string;
  done: boolean;
}

type ChallengeKey = MissionCatalogEntry["challenge"];

/** The challenge a "Challenge: ..." tab runs, matched by its page and tab slug. */
function challengeFor(phaseSlug: string, entrySlug: string, tabSlug: string): ChallengeKey | null {
  const href = `/range/${phaseSlug}/${entrySlug}`;
  const hit = (Object.entries(CHALLENGE_PATHS) as [ChallengeKey, { href: string; tab: string }][]).find(([, p]) => p.href === href && p.tab === tabSlug);
  return hit ? hit[0] : null;
}

/** A challenge is done once every one of its missions is solved. */
function challengeDone(key: ChallengeKey, results: Results) {
  const list = Object.values(MISSION_CATALOG).filter((m) => m.challenge === key);
  return list.length > 0 && list.every((m) => results[m.id]?.solved);
}

/** Each "Challenge: ..." tab of an entry, with the challenge it runs. */
function entryChallenges(phaseSlug: string, entry: WeekDef): { label: string; key: ChallengeKey }[] {
  return entry.sections
    .filter((s) => s.label.startsWith("Challenge:"))
    .map((s) => ({ label: s.label, key: challengeFor(phaseSlug, entry.slug, slugify(s.label.replace(/^Challenge:\s*/, ""))) }))
    .filter((c): c is { label: string; key: ChallengeKey } => c.key !== null);
}

function entryKey(phaseSlug: string, entrySlug: string) {
  return `${phaseSlug}:${entrySlug}`;
}

export type LastStop = { phaseSlug: string; entrySlug: string };

function parseLastStop(raw: string | null): LastStop | null {
  if (!raw) return null;
  const [phaseSlug, entrySlug] = raw.split(":");
  return phaseSlug && entrySlug ? { phaseSlug, entrySlug } : null;
}

// Locked phases stay out of course progress until they open.
function countEntries(phases: PhaseDef[]) {
  return phases.filter((p) => !isPhaseLocked(p.slug)).reduce((total, phase) => total + phase.weeks.length + (phase.homeLab ? 1 : 0), 0);
}

interface AcademyProgressContextValue {
  isComplete: (phaseSlug: string, entrySlug: string) => boolean;
  /** What a week or Home Lab needs: its quiz, its labs and its challenges. Empty when it has none. */
  requirements: (phaseSlug: string, entrySlug: string) => Requirement[];
  /** A phase is complete once every challenge in it is solved. */
  isPhaseComplete: (phaseSlug: string) => boolean;
  recordLabDone: (phaseSlug: string, entrySlug: string, labSlug: string) => void;
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
  const [labsDone, setLabsDone] = useState<Set<string>>(new Set());
  const [lastStop, setLastStopState] = useState<LastStop | null>(null);
  const [loaded, setLoaded] = useState(false);
  const results = useResults();

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
      const labsRaw = window.localStorage.getItem(LABS_DONE_KEY);
      // Merge, since a finished lab on screen can report in before this runs.
      const labsSaved: string[] = labsRaw ? JSON.parse(labsRaw) : [];
      setLabsDone((prev) => new Set([...labsSaved, ...prev]));
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
      window.localStorage.setItem(LABS_DONE_KEY, JSON.stringify([...labsDone]));
    } catch {
      // Ignore -- nothing to persist to.
    }
  }, [labsDone, loaded]);

  useEffect(() => {
    if (!loaded) return;
    try {
      if (lastStop) window.localStorage.setItem(LAST_STOP_KEY, entryKey(lastStop.phaseSlug, lastStop.entrySlug));
    } catch {
      // Ignore -- nothing to persist to.
    }
  }, [lastStop, loaded]);

  const totalCount = useMemo(() => countEntries(phases), [phases]);

  // Everything each week and Home Lab asks for, and whether it is done.
  const reqs = useMemo(() => {
    const map = new Map<string, Requirement[]>();
    for (const phase of phases) {
      for (const entry of [...phase.weeks, ...(phase.homeLab ? [phase.homeLab] : [])]) {
        const key = entryKey(phase.slug, entry.slug);
        const list: Requirement[] = [];
        if (findQuiz(phase.slug, entry.slug)) list.push({ label: "Quiz", done: quizPasses.has(key) });
        for (const s of entry.sections.filter((s) => s.label.startsWith("Lab:"))) {
          list.push({ label: s.label, done: labsDone.has(labKey(phase.slug, entry.slug, slugify(s.label.replace(/^Lab:\s*/, "")))) });
        }
        for (const c of entryChallenges(phase.slug, entry)) list.push({ label: c.label, done: challengeDone(c.key, results) });
        map.set(key, list);
      }
    }
    return map;
  }, [phases, quizPasses, labsDone, results]);

  // A week marks itself complete once its quiz, labs and challenges are all done.
  // Nothing is ever unmarked here, so earlier progress stays.
  useEffect(() => {
    if (!loaded) return;
    const ready = [...reqs].filter(([key, list]) => list.length > 0 && list.every((r) => r.done) && !completed.has(key)).map(([key]) => key);
    if (ready.length === 0) return;
    setCompleted((prev) => new Set([...prev, ...ready]));
  }, [reqs, completed, loaded]);

  const phaseDone = useMemo(() => {
    const done = new Set<string>();
    for (const phase of phases) {
      const entries = [...phase.weeks, ...(phase.homeLab ? [phase.homeLab] : [])];
      const challenges = entries.flatMap((e) => entryChallenges(phase.slug, e));
      const live = entries.filter((e) => e.sections.length > 0);
      // A phase without challenges falls back to every published week being complete.
      const complete =
        challenges.length > 0
          ? challenges.every((c) => challengeDone(c.key, results))
          : live.length > 0 && live.every((e) => completed.has(entryKey(phase.slug, e.slug)));
      if (complete) done.add(phase.slug);
    }
    return done;
  }, [phases, results, completed]);

  const value = useMemo<AcademyProgressContextValue>(
    () => ({
      isComplete: (phaseSlug, entrySlug) => completed.has(entryKey(phaseSlug, entrySlug)),
      requirements: (phaseSlug, entrySlug) => reqs.get(entryKey(phaseSlug, entrySlug)) ?? [],
      isPhaseComplete: (phaseSlug) => phaseDone.has(phaseSlug),
      recordLabDone: (phaseSlug, entrySlug, labSlug) => {
        const key = labKey(phaseSlug, entrySlug, labSlug);
        setLabsDone((prev) => (prev.has(key) ? prev : new Set([...prev, key])));
      },
      hasPassedQuiz: (phaseSlug, entrySlug) => quizPasses.has(entryKey(phaseSlug, entrySlug)),
      recordQuizPass: (phaseSlug, entrySlug) => {
        const key = entryKey(phaseSlug, entrySlug);
        setQuizPasses((prev) => {
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
          if ((reqs.get(key) ?? []).length > 0) return prev;
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
      completedCount: [...completed].filter((key) => !isPhaseLocked(key.split(":")[0])).length,
      totalCount,
    }),
    [completed, quizPasses, reqs, phaseDone, lastStop, totalCount]
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

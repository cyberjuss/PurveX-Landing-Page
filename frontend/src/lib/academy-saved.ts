// What a student has in progress that is not a scored result: lesson
// checkmarks, quiz passes, finished labs, where they stopped, quiz answers,
// and what is typed into each challenge box. Kept on the account so it
// follows the student to another browser or device, and so leaving a page
// never loses an answer. Scored results live in academy_progress instead.
//
// Shared by the route and the page, so both read and merge it the same way.

export type QuizState = {
  /** The option picked for each question, or null where none is yet. */
  answers: (number | null)[];
  submitted: boolean;
  /** The question on screen. */
  at: number;
};

export type Saved = {
  completed: string[];
  quizPasses: string[];
  labsDone: string[];
  lastStop: string | null;
  quizzes: Record<string, QuizState>;
  /** Text in a challenge box, by mission id. */
  drafts: Record<string, string>;
};

/** A change to send. Lists and lastStop replace; quizzes and drafts merge by key, and null removes one. */
export type SavedPatch = Partial<Pick<Saved, "completed" | "quizPasses" | "labsDone" | "lastStop">> & {
  quizzes?: Record<string, QuizState | null>;
  drafts?: Record<string, string | null>;
};

export const EMPTY_SAVED: Saved = { completed: [], quizPasses: [], labsDone: [], lastStop: null, quizzes: {}, drafts: {} };

// A challenge answer is checked up to 120 characters, so a longer draft is never needed.
const DRAFT_MAX = 120;
const KEY_MAX = 120;
const LIST_MAX = 500;
const MAP_MAX = 400;
const QUIZ_QUESTIONS_MAX = 50;

const key = (v: unknown): v is string => typeof v === "string" && v.length > 0 && v.length <= KEY_MAX;
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function list(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return [...new Set(v.filter(key))].slice(0, LIST_MAX);
}

function quiz(v: unknown): QuizState | null {
  if (!isRecord(v) || !Array.isArray(v.answers) || v.answers.length > QUIZ_QUESTIONS_MAX) return null;
  const answers = v.answers.map((a) => (Number.isInteger(a) && (a as number) >= 0 && (a as number) < 10 ? (a as number) : null));
  const at = Number.isInteger(v.at) ? Math.min(Math.max(v.at as number, 0), Math.max(answers.length - 1, 0)) : 0;
  return { answers, submitted: v.submitted === true, at };
}

function draft(v: unknown): string | null {
  return typeof v === "string" ? v.slice(0, DRAFT_MAX) : null;
}

/** A change from the page, with anything malformed or oversized dropped. */
export function sanitizePatch(raw: unknown): SavedPatch {
  if (!isRecord(raw)) return {};
  const out: SavedPatch = {};
  const completed = list(raw.completed);
  const quizPasses = list(raw.quizPasses);
  const labsDone = list(raw.labsDone);
  if (completed) out.completed = completed;
  if (quizPasses) out.quizPasses = quizPasses;
  if (labsDone) out.labsDone = labsDone;
  if (raw.lastStop === null || key(raw.lastStop)) out.lastStop = raw.lastStop;
  if (isRecord(raw.quizzes)) {
    out.quizzes = {};
    // Only an explicit null clears a quiz. A malformed entry is skipped, so it cannot wipe a good copy.
    for (const [k, v] of Object.entries(raw.quizzes).slice(0, MAP_MAX)) {
      if (!key(k)) continue;
      const q = v === null ? null : quiz(v);
      if (v === null || q) out.quizzes[k] = q;
    }
  }
  if (isRecord(raw.drafts)) {
    out.drafts = {};
    for (const [k, v] of Object.entries(raw.drafts).slice(0, MAP_MAX)) {
      if (!key(k)) continue;
      const d = v === null ? null : draft(v);
      if (v === null || d !== null) out.drafts[k] = d;
    }
  }
  return out;
}

/** A stored copy, read back defensively. */
export function sanitizeSaved(raw: unknown): Saved {
  return applyPatch(EMPTY_SAVED, sanitizePatch(raw));
}

export function applyPatch(base: Saved, patch: SavedPatch): Saved {
  const next: Saved = { ...base, quizzes: { ...base.quizzes }, drafts: { ...base.drafts } };
  if (patch.completed) next.completed = patch.completed;
  if (patch.quizPasses) next.quizPasses = patch.quizPasses;
  if (patch.labsDone) next.labsDone = patch.labsDone;
  if (patch.lastStop !== undefined) next.lastStop = patch.lastStop;
  for (const [k, v] of Object.entries(patch.quizzes ?? {})) {
    if (v) next.quizzes[k] = v;
    else delete next.quizzes[k];
  }
  for (const [k, v] of Object.entries(patch.drafts ?? {})) {
    if (v) next.drafts[k] = v;
    else delete next.drafts[k];
  }
  // Caps hold after a merge too, so many small patches cannot grow a row without bound.
  next.quizzes = Object.fromEntries(Object.entries(next.quizzes).slice(-MAP_MAX));
  next.drafts = Object.fromEntries(Object.entries(next.drafts).slice(-MAP_MAX));
  return next;
}

/** Two copies of the same student's progress, put together so nothing finished on either is lost. */
export function mergeSaved(a: Saved, b: Saved): Saved {
  const union = (x: string[], y: string[]) => [...new Set([...x, ...y])].slice(0, LIST_MAX);
  return {
    completed: union(a.completed, b.completed),
    quizPasses: union(a.quizPasses, b.quizPasses),
    labsDone: union(a.labsDone, b.labsDone),
    lastStop: a.lastStop ?? b.lastStop,
    quizzes: { ...b.quizzes, ...a.quizzes },
    drafts: { ...b.drafts, ...a.drafts },
  };
}

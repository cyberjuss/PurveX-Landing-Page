// Spaced review of the concepts a student has met. Each concept they turn
// over on a recap joins the deck with the sentence that taught it. It comes
// back for review after a day; each time they still know it the gap grows
// (1, 3, 7, 14, 30 days), and a miss sends it back to the start. Kept in
// this browser. Storage can throw in a private window, and then the deck
// simply does not persist.

export type Concept = {
  term: string;
  sentence: string;
  /** The lesson tab it came from. */
  where: string;
  /** How many reviews in a row it has been known. */
  box: number;
  /** When it is next due, in epoch milliseconds. */
  due: number;
};

const KEY = "academy-review";
const DAY = 24 * 60 * 60 * 1000;
const GAPS = [1, 3, 7, 14, 30];
export const REVIEW_EVENT = "academy-review-changed";

const keyOf = (term: string) => term.trim().toLowerCase();

export function loadDeck(): Record<string, Concept> {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, Concept>) : {};
  } catch {
    return {};
  }
}

function saveDeck(deck: Record<string, Concept>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(deck));
  } catch {}
  window.dispatchEvent(new Event(REVIEW_EVENT));
}

/** Adds a concept if it is new. Returns true when it was. */
export function collect(term: string, sentence: string, where: string): boolean {
  const deck = loadDeck();
  const k = keyOf(term);
  if (deck[k]) return false;
  // In local dev a new concept is due at once, so the review loop can be
  // tried without waiting a day. A production build always waits.
  const first = process.env.NODE_ENV === "development" ? 0 : GAPS[0] * DAY;
  deck[k] = { term, sentence, where, box: 0, due: Date.now() + first };
  saveDeck(deck);
  return true;
}

export function has(term: string): boolean {
  return Boolean(loadDeck()[keyOf(term)]);
}

export function dueNow(now = Date.now()): Concept[] {
  return Object.values(loadDeck())
    .filter((c) => c.due <= now)
    .sort((a, b) => a.due - b.due);
}

/** Records a review: known pushes it further out, a miss starts it over. */
export function grade(term: string, knew: boolean) {
  const deck = loadDeck();
  const c = deck[keyOf(term)];
  if (!c) return;
  c.box = knew ? Math.min(c.box + 1, GAPS.length - 1) : 0;
  c.due = Date.now() + GAPS[c.box] * DAY;
  saveDeck(deck);
}

/** Counts for the home card: total held, due now, and how many are well known. */
export function deckStats(now = Date.now()) {
  const all = Object.values(loadDeck());
  const due = all.filter((c) => c.due <= now).length;
  const strong = all.filter((c) => c.box >= 3).length;
  const next = all.filter((c) => c.due > now).sort((a, b) => a.due - b.due)[0]?.due ?? null;
  return { total: all.length, due, strong, next };
}

export function gapDays(box: number) {
  return GAPS[Math.min(box, GAPS.length - 1)];
}

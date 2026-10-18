import { marked, type Token } from "marked";
import { GLOSSARY, lookup, type GlossaryEntry } from "@/lib/concept-glossary";

export type DeckActivity =
  | { kind: "sort"; prompt: string; buckets: { name: string; items: string[] }[]; layout?: "match" | "connect" }
  | { kind: "order"; prompt: string; items: string[] };

export interface DeckSlide {
  /** The heading the slide sits under, or the section label before any heading. */
  title: string;
  /** True when the slide carries on a heading the previous slide started. */
  cont: boolean;
  /** Body markdown, without the heading. */
  markdown: string;
  /** True when the body already shows a picture, so no drawing is put beside it. */
  visual: boolean;
  /** The drawing an author picked with <!-- art: name -->, when they picked one. */
  art?: string;
  /** A drag-and-drop activity, which takes the whole slide. */
  activity?: DeckActivity;
  /** The closing recap: each key term with the sentence that taught it. */
  recap?: RecapItem[];
  /** The week's essential question, shown as the deck's opening slide. */
  question?: string;
}

export type RecapItem = { term: string; sentence: string };

const RECAP_MAX = 6;
const RECAP_MIN = 3;

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * The concepts a section teaches, as the glossary writes them out: first the
 * ones it puts in bold or under a heading, in order, then (if that is fewer
 * than three) the ones it names in passing. A recap card used to carry the
 * sentence the term was bolded in, which was often a fragment, or a label
 * like "Situation:" that was never a concept at all.
 */
function glossaryRecap(text: string): RecapItem[] {
  const found: { at: number; entry: GlossaryEntry }[] = [];
  const named = /\*\*([^*]+)\*\*|^#{2,4}\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = named.exec(text))) {
    const entry = lookup((m[1] ?? m[2]).replace(/\*\*/g, ""));
    if (entry) found.push({ at: m.index, entry });
  }
  const seen = new Set<GlossaryEntry>();
  const out: RecapItem[] = [];
  const add = (entry: GlossaryEntry) => {
    if (seen.has(entry) || out.length >= RECAP_MAX) return;
    seen.add(entry);
    out.push({ term: entry.term, sentence: entry.means });
  };
  found.sort((a, b) => a.at - b.at).forEach((f) => add(f.entry));
  if (out.length < RECAP_MIN) {
    const plainText = text.replace(/\*\*/g, "");
    GLOSSARY.filter((entry) => !entry.strict)
      .map((entry) => ({ entry, at: plainText.search(new RegExp(`\\b${escape(entry.term)}\\b`, "i")) }))
      .filter((f) => f.at >= 0)
      .sort((a, b) => a.at - b.at)
      .forEach((f) => add(f.entry));
  }
  return out;
}

/**
 * The concepts a section taught, at most six, each with its glossary
 * definition. A section that names fewer than three (a lab's setup, a page of
 * steps) gets no recap: a card with nothing to recall is worse than none.
 */
export function buildRecap(markdown: string): RecapItem[] {
  const text = markdown
    .replace(/\r\n/g, "\n")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<details[\s\S]*?<\/details>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const out = glossaryRecap(text);
  return out.length >= RECAP_MIN ? out : [];
}

// About what fits on a slide and still reads at a glance. A heading (### or ####) always
// starts a slide; past this many words the next paragraph starts another.
const WORDS_PER_SLIDE = 95;

const OPEN_TAG = /<(div|details|figure|section|aside|table)\b/gi;
const CLOSE_TAG = /<\/(div|details|figure|section|aside|table)>/gi;
// A picture, or one of the lesson's own drawn diagrams (OU tree, decision chart).
const VISUAL = /<img\b|!\[|<svg\b|class="ad-(shots|tree|og|decision)\b/;
const ART_NOTE = /^\s*<!--\s*art:\s*([a-z-]+)\s*-->\s*$/i;

function words(raw: string) {
  const text = raw.replace(/<[^>]+>/g, " ").replace(/[`*_#>\[\]()!-]/g, " ").trim();
  return text ? text.split(/\s+/).length : 0;
}

function plain(text: string) {
  return text.replace(/<[^>]+>/g, "").replace(/\*\*|__|`/g, "").trim();
}

/**
 * A sort block lists each bucket with its items:
 *
 *     ```sort
 *     prompt: Which part of the triad failed?
 *     Confidentiality: Payroll file emailed to the wrong team | Laptop stolen
 *     Integrity: Invoice bank details changed
 *     ```
 *
 * An order block lists its steps in the right order; the slide shuffles them.
 *
 *     ```order
 *     prompt: Put the handshake in order.
 *     Client sends SYN
 *     Server replies SYN-ACK
 *     ```
 */
export function parseActivity(lang: string, body: string): DeckActivity | null {
  const lines = body.split("\n").map((l) => l.trim()).filter(Boolean);
  let prompt =
    lang === "sort"
      ? "Drag each card to where it belongs."
      : lang === "match" || lang === "connect"
        ? "Drag each term to what it matches."
        : "Drag the steps into order.";
  const rest: string[] = [];
  for (const line of lines) {
    const p = /^prompt:\s*(.+)$/i.exec(line);
    if (p) prompt = p[1];
    else rest.push(line);
  }
  // A match block pairs a short term with what it matches, one pair a line:
  // "Threat = Something or someone that could use it". The term is the card
  // the student drags; the right-hand side is the row it drops on.
  if (lang === "match" || lang === "connect") {
    const buckets = rest
      .map((line) => {
        const at = line.indexOf(" = ");
        return at < 1 ? null : { name: line.slice(at + 3).trim(), items: [line.slice(0, at).trim()] };
      })
      .filter((b): b is { name: string; items: string[] } => Boolean(b && b.name && b.items[0]));
    return buckets.length >= 2 ? { kind: "sort", prompt, buckets, layout: lang } : null;
  }
  if (lang === "order") {
    const items = rest.map((l) => l.replace(/^(\d+[.)]|[-*])\s+/, ""));
    return items.length >= 2 ? { kind: "order", prompt, items } : null;
  }
  const buckets = rest
    .map((line) => {
      const at = line.indexOf(":");
      if (at < 1) return null;
      const items = line.slice(at + 1).split("|").map((s) => s.trim()).filter(Boolean);
      return { name: line.slice(0, at).trim(), items };
    })
    .filter((b): b is { name: string; items: string[] } => Boolean(b && b.items.length));
  return buckets.length >= 2 ? { kind: "sort", prompt, buckets } : null;
}

// Splits a lesson section into slides the way a deck would: one per heading,
// and a long heading broken at a paragraph so no slide is a wall of text.
// Lists, code and tables stay with the paragraph that introduces them, and
// nothing breaks inside an open HTML block (a <details> or a screenshot row
// can span several tokens once it contains blank lines). A sort or order
// block becomes a slide of its own.
export function splitLessonIntoDeck(markdown: string, label: string): DeckSlide[] {
  const tokens = marked.lexer(markdown.replace(/\r\n/g, "\n"));
  type Draft = { title: string; cont: boolean; raw: string[]; words: number; art?: string; activity?: DeckActivity };
  const slides: Draft[] = [];
  let title = label;
  let depth = 0;

  const open = (cont: boolean) => slides.push({ title, cont, raw: [], words: 0 });
  const current = () => slides[slides.length - 1];

  for (const token of tokens as Token[]) {
    if (token.type === "space") continue;
    if (depth === 0 && token.type === "heading" && token.depth <= 4) {
      title = plain(token.text);
      open(false);
      continue;
    }
    if (depth === 0 && token.type === "hr") {
      if (current()?.raw.length) open(true);
      continue;
    }
    const note = token.type === "html" ? ART_NOTE.exec(token.raw) : null;
    if (note) {
      if (!current()) open(false);
      current().art = note[1].toLowerCase();
      continue;
    }
    if (depth === 0 && token.type === "code" && (token.lang === "sort" || token.lang === "order" || token.lang === "match" || token.lang === "connect")) {
      const activity = parseActivity(token.lang, token.text);
      if (activity) {
        slides.push({ title, cont: Boolean(current()), raw: [], words: 0, activity });
        // Whatever follows the activity starts fresh rather than sharing its slide.
        open(true);
        continue;
      }
    }
    const n = words(token.raw);
    const startsBlock = token.type === "paragraph" || token.type === "html" || token.type === "blockquote";
    const slide = current();
    if (!slide || slide.activity) open(Boolean(slide));
    else if (depth === 0 && startsBlock && slide.raw.length && slide.words + n > WORDS_PER_SLIDE) open(true);
    current().raw.push(token.raw);
    current().words += n;
    depth = Math.max(0, depth + (token.raw.match(OPEN_TAG)?.length ?? 0) - (token.raw.match(CLOSE_TAG)?.length ?? 0));
  }

  const deck: DeckSlide[] = slides
    .filter((s) => s.activity || s.raw.join("").trim().length > 0)
    .map((s) => {
      const body = s.raw.join("\n").trim();
      return {
        title: s.title,
        cont: s.cont && !s.activity,
        markdown: body,
        visual: VISUAL.test(body),
        ...(s.art ? { art: s.art } : {}),
        ...(s.activity ? { activity: s.activity } : {}),
      };
    });

  // A section long enough to need one closes on a recap of what it taught.
  const recap = deck.length >= 3 ? buildRecap(markdown) : [];
  if (recap.length) deck.push({ title: label, cont: false, markdown: "", visual: false, recap });
  return deck;
}

/** A section is shown as a deck unless it is a challenge (it pages its own tickets). */
export function isDeckable(markdown: string) {
  return !/class="ad-(mission|brief)\b/.test(markdown);
}

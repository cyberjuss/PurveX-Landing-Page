import { marked, type Token } from "marked";

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
}

export type RecapItem = { term: string; sentence: string };

// Bold that labels a line rather than naming a concept.
const NOT_A_TERM = /^(controls?|the ticket|ticket|note|tip|example|examples|warning|fix|fixes|result|rule|why|never|not|always|only|no|and|or)$/i;
const RECAP_MAX = 6;
const RECAP_MIN = 3;

function sentencesOf(line: string): string[] {
  return line.match(/[^.!?]+[.!?]*["')]*/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
}

/**
 * The terms a section put in bold, each with the sentence it was taught in,
 * one per sentence and at most six. A section that bolds nothing (the
 * malware types, say) falls back to its sub-headings and the first sentence
 * under each. Everything comes from the lesson itself.
 */
export function buildRecap(markdown: string, label: string): RecapItem[] {
  const text = markdown
    .replace(/\r\n/g, "\n")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<details[\s\S]*?<\/details>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "");
  const out: RecapItem[] = [];
  const seen = new Set<string>();
  for (const raw of text.split("\n")) {
    if (/^\s*(#|\||<)/.test(raw)) continue;
    const line = raw.replace(/^\s*([-*]|\d+\.)\s+/, "").trim();
    for (const s of sentencesOf(line)) {
      if (s.replace(/\*\*/g, "").split(/\s+/).length < 5) continue;
      const m = /\*\*([^*]+)\*\*/.exec(s);
      if (!m) continue;
      const term = m[1].replace(/[.:]$/, "").trim();
      const key = term.toLowerCase();
      if (seen.has(key) || NOT_A_TERM.test(term) || term.length < 3 || term.split(/\s+/).length > 5) continue;
      seen.add(key);
      out.push({ term, sentence: s });
    }
  }
  if (out.length >= RECAP_MIN) return out.slice(0, RECAP_MAX);

  const byHeading: RecapItem[] = [];
  const heading = /^#{3,4}\s+(.+)\n+([^\n]+)/gm;
  let h: RegExpExecArray | null;
  while ((h = heading.exec(text))) {
    const term = h[1].replace(/\*\*/g, "").trim();
    const first = sentencesOf(h[2].replace(/<[^>]+>/g, "").trim())[0];
    if (!first || term === label || /^(check yourself|overview)$/i.test(term) || first.split(/\s+/).length < 5) continue;
    byHeading.push({ term, sentence: first });
  }
  return byHeading.length >= RECAP_MIN ? byHeading.slice(0, RECAP_MAX) : [];
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
  const recap = deck.length >= 3 ? buildRecap(markdown, label) : [];
  if (recap.length) deck.push({ title: label, cont: false, markdown: "", visual: false, recap });
  return deck;
}

/** A section is shown as a deck unless it is a challenge (it pages its own tickets). */
export function isDeckable(markdown: string) {
  return !/class="ad-(mission|brief)\b/.test(markdown);
}

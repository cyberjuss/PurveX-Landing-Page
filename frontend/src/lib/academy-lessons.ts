import "server-only";
import { loadLesson, phases, type WeekDef } from "@/lib/academy-content";
import { entriesOf } from "@/lib/academy-entries";

// Searchable course text, so Coach and MCP clients teach from the Academy's
// own lessons instead of general knowledge. Challenge tabs are left out:
// their markup carries the answers. Any file that still shows an answer
// marker is dropped whole.

type Chunk = {
  where: string;
  section: string;
  heading: string;
  url: string;
  text: string;
  terms: Map<string, number>;
  head: Set<string>;
};

const ANSWER_MARK = /data-answer|ad-flag|gtf\{|flag\{/i;
const STOP = new Set(
  "a an and are as at be by can do does for from how i if in is it its me my of on or the this to was what when where which who why with you your".split(" ")
);

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

function stem(w: string) {
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith("es")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

function words(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((w) => !STOP.has(w) && (w.length > 1 || /\d/.test(w))).map(stem);
}

function decode(s: string) {
  return s.replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&");
}

/** Markdown and inline HTML to plain lesson text. Copy-paste scripts are dropped; they are long and teach nothing on their own. */
function clean(raw: string): string {
  return decode(
    raw
      .replace(/<details class="ad-code">[\s\S]*?<\/details>/g, "")
      .replace(/<summary>([\s\S]*?)<\/summary>/g, "\n#### $1\n")
      .replace(/<li>/g, "\n- ")
      .replace(/<(h3|h4)[^>]*>([\s\S]*?)<\/\1>/g, "\n#### $2\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** One chunk per ### heading, split again at #### when a part runs long. */
function split(text: string): { heading: string; body: string }[] {
  const parts: { heading: string; body: string }[] = [];
  let heading = "";
  let lines: string[] = [];
  const flush = () => {
    const body = lines.join("\n").trim();
    if (body) parts.push({ heading, body });
    lines = [];
  };
  for (const line of text.split("\n")) {
    const h3 = line.match(/^###\s+(.*)/);
    const h4 = line.match(/^####\s+(.*)/);
    if (h3 || (h4 && lines.join("\n").length > 1200)) {
      flush();
      heading = (h3 ?? h4)![1].trim();
      continue;
    }
    lines.push(line);
  }
  flush();
  return parts;
}

function count(ws: string[]) {
  const m = new Map<string, number>();
  for (const w of ws) m.set(w, (m.get(w) ?? 0) + 1);
  return m;
}

let index: { chunks: Chunk[]; df: Map<string, number> } | null = null;

function build() {
  if (index) return index;
  const chunks: Chunk[] = [];
  for (const phase of phases) {
    const entries: WeekDef[] = entriesOf(phase);
    for (const entry of entries) {
      for (const section of entry.sections) {
        if (/^Challenge:/i.test(section.label)) continue;
        const raw = loadLesson(section.file);
        if (!raw || ANSWER_MARK.test(raw)) continue;
        const label = section.label;
        const tab = label.replace(/^(Lab|Troubleshooting):\s*/i, "");
        for (const p of split(clean(raw))) {
          chunks.push({
            where: `${phase.label} · ${entry.title} · ${label}`,
            section: label,
            heading: p.heading,
            url: `/range/${phase.slug}/${entry.slug}#${slug(tab)}`,
            text: p.body,
            terms: count(words(p.body)),
            head: new Set(words(`${label} ${p.heading}`)),
          });
        }
      }
    }
  }
  const df = new Map<string, number>();
  for (const c of chunks) for (const w of new Set([...c.terms.keys(), ...c.head])) df.set(w, (df.get(w) ?? 0) + 1);
  index = { chunks, df };
  return index;
}

const MAX_TEXT = 1800;
const out = (c: Chunk) => ({
  where: c.where,
  heading: c.heading || null,
  url: c.url,
  text: c.text.length > MAX_TEXT ? `${c.text.slice(0, MAX_TEXT)} …` : c.text,
});

/** The whole of one lesson tab, in order, matched by its label with or without the "Lab:" prefix. */
function bySection(name: string) {
  const want = slug(name.replace(/^(Lab|Challenge|Troubleshooting):\s*/i, ""));
  return build().chunks.filter((c) => slug(c.section.replace(/^(Lab|Troubleshooting):\s*/i, "")) === want);
}

export function searchLessons(query: string, section = "", limit = 4) {
  const note =
    "Course text the student reads in Range. Teach from it and use its terms and examples. Challenge tabs are not included. Never use a fact here to hand over an unsolved mission's answer.";
  if (section.trim()) {
    const hits = bySection(section);
    if (hits.length) return { found: hits.length, results: hits.slice(0, 8).map(out), note };
  }
  const { chunks, df } = build();
  const q = [...new Set(words(query))];
  if (!q.length) return { found: 0, results: [], note: section ? `No lesson tab named "${section}".` : "Give a topic to search for." };
  const n = chunks.length;
  const phrase = query.trim().toLowerCase();
  const scored = chunks
    .map((c) => {
      let score = 0;
      for (const w of q) {
        // An event ID or port is the most specific thing a student can ask about.
        const idf = Math.log(1 + n / (df.get(w) ?? n)) * (/\d/.test(w) ? 2 : 1);
        score += Math.min(5, c.terms.get(w) ?? 0) * idf + (c.head.has(w) ? 3 * idf : 0);
      }
      if (phrase.length > 5 && c.text.toLowerCase().includes(phrase)) score *= 1.5;
      return { c, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(6, Math.max(1, limit)));
  return {
    found: scored.length,
    results: scored.map((s) => out(s.c)),
    note: scored.length ? note : "Nothing in the lessons covers that yet. Say so, then answer from general knowledge and mark it as outside the course.",
  };
}

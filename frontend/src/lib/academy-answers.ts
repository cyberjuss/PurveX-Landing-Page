import "server-only";
import { loadLesson, phases } from "@/lib/academy-content";

// Challenge answers stay on the server. The lesson markup still holds them
// for authoring, so the page gets a copy with every answer attribute and
// every Answer/Problem/Solution box taken out. A box is sent back only once
// the student has earned it: solved, or out of tries.

type MissionKey = { accepts: string[]; reveal: string };

/** Same rule the page used: case, spaces and dots do not matter, and the gtf{} wrapper is optional. */
export const normalizeGuess = (s: string) =>
  s.trim().toLowerCase().replace(/^gtf\{|\}$/g, "").replace(/[\s.]+/g, "-");

/** Index just past the </div> that closes the <div at `start`. */
function divEnd(html: string, start: number): number {
  const tag = /<div\b|<\/div>/g;
  tag.lastIndex = start;
  let depth = 0;
  for (let m = tag.exec(html); m; m = tag.exec(html)) {
    depth += m[0] === "</div>" ? -1 : 1;
    if (depth === 0) return m.index + m[0].length;
  }
  return html.length;
}

const FLAG_OPEN = /<div class="ad-flag">/g;

function challengeFiles(): string[] {
  return phases.flatMap((p) => [...p.weeks, ...(p.homeLab ? [p.homeLab] : [])]).flatMap((e) => e.sections.filter((s) => /^Challenge:/.test(s.label)).map((s) => s.file));
}

let keys: Map<string, MissionKey> | null = null;

function build() {
  if (keys) return keys;
  keys = new Map();
  for (const file of challengeFiles()) {
    const md = loadLesson(file);
    if (!md) continue;
    const open = /<div class="ad-mission[^"]*" data-id="([^"]+)"/g;
    for (let m = open.exec(md); m; m = open.exec(md)) {
      const block = md.slice(m.index, divEnd(md, m.index));
      const answer = block.match(/data-answer="([^"]*)"/)?.[1];
      if (!answer) continue;
      const accept = block.match(/data-accept="([^"]*)"/)?.[1] ?? "";
      const flagAt = block.search(FLAG_OPEN);
      const flag = flagAt >= 0 ? block.slice(flagAt, divEnd(block, flagAt)) : "";
      keys.set(m[1], {
        accepts: [answer, ...accept.split("|")].map(normalizeGuess).filter(Boolean),
        reveal: flag.replace(/^<div class="ad-flag">/, "").replace(/<\/div>$/, "").trim(),
      });
    }
  }
  return keys;
}

export const hasMissionKey = (id: string) => build().has(id);

export function checkGuess(id: string, guess: string): boolean {
  const key = build().get(id);
  const g = normalizeGuess(guess);
  return Boolean(key && g && key.accepts.includes(g));
}

export const missionReveal = (id: string) => build().get(id)?.reveal ?? null;

/** The markup the page gets: no answer attributes, and every reveal box emptied. */
export function stripAnswers(md: string): string {
  const noAttrs = md.replace(/\s+data-(answer|accept)="[^"]*"/g, "");
  let out = "";
  let from = 0;
  FLAG_OPEN.lastIndex = 0;
  for (let m = FLAG_OPEN.exec(noAttrs); m; m = FLAG_OPEN.exec(noAttrs)) {
    out += noAttrs.slice(from, m.index) + '<div class="ad-flag"></div>';
    from = divEnd(noAttrs, m.index);
    FLAG_OPEN.lastIndex = from;
  }
  return out + noAttrs.slice(from);
}

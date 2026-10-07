import type { PhaseDef, WeekDef } from "@/lib/academy-content";

/**
 * Everything a student works through in a phase, in order: the weeks, then the
 * hands-on labs.
 *
 * Its own module rather than a function in academy-content, because that one is
 * server-only -- it reads lesson files off disk -- while the sidebar, the home
 * page and the progress store all need this list in the browser. Importing the
 * types from there costs nothing, since types are erased before the bundler
 * ever sees them.
 */
export function entriesOf(phase: PhaseDef | undefined): WeekDef[] {
  if (!phase) return [];
  return [...phase.weeks, ...(phase.homeLabs ?? [])];
}

/**
 * The url segment a lab is served at, derived from its widget or its filename.
 *
 * Lives here rather than in academy-labs so there is one definition. That
 * module reads the phases off disk and is server-only, while the sidebar has
 * to build the same links in the browser, and two copies of this rule would
 * drift the moment a lab was renamed.
 */
export function labSlug(file: string, widget?: string): string {
  if (widget) return widget;
  const base = file.split("/").pop() ?? file;
  return base.replace(/^lab-/, "").replace(/\.md$/, "");
}

/** Every hands-on lab across the given phases, in course order, as links. */
export function labLinksOf(phases: PhaseDef[]): { slug: string; title: string }[] {
  const out: { slug: string; title: string }[] = [];
  for (const phase of phases) {
    for (const entry of entriesOf(phase)) {
      for (const s of entry.sections) {
        if (!s.label.startsWith("Lab:")) continue;
        out.push({ slug: labSlug(s.file, s.widget), title: s.label.replace(/^Lab:\s*/, "") });
      }
    }
  }
  return out;
}

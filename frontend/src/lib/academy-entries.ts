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

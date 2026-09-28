// Phases students cannot open yet. Remove a slug here to open that phase.
export const LOCKED_PHASES: readonly string[] = ["phase-2", "phase-3"];

export const isPhaseLocked = (phaseSlug: string) => LOCKED_PHASES.includes(phaseSlug);

/** True when an /academy/<phase>/... link points into a locked phase. */
export const isLockedHref = (href: string) => isPhaseLocked(href.split(/[/#?]/)[2] ?? "");

// Phases students cannot open yet. Remove a slug here to open that phase.
// A locked phase shows as "Coming soon", with a way to be emailed when it opens
// (see /academy/api/phase-notify and scripts/notify-phase.mjs).
export const LOCKED_PHASES: readonly string[] = ["phase-3"];

export const isPhaseLocked = (phaseSlug: string) => LOCKED_PHASES.includes(phaseSlug);

/** True when an /academy/<phase>/... link points into a locked phase. */
export const isLockedHref = (href: string) => isPhaseLocked(href.split(/[/#?]/)[2] ?? "");

/** What a coming-soon phase is about, for its page and the email that announces it. */
export const PHASE_PREVIEW: Record<string, { label: string; title: string; summary: string; points: string[] }> = {
  "phase-2": {
    label: "Phase 2",
    title: "Threat Detection & Log Analysis",
    summary: "An alert fires. Read the host, the account and the log before you decide what happened.",
    points: [
      "Work a SOC alert queue",
      "Write detections in KQL",
      "Trace four real attack campaigns",
    ],
  },
  "phase-3": {
    label: "Phase 3",
    title: "Incident Response",
    summary: "Triage and investigation through containment and writing it up.",
    points: [
      "Run an incident from alert to containment",
      "Collect and protect evidence",
      "Write the incident report",
    ],
  },
};

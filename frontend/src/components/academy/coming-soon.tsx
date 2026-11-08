import { PHASE_PREVIEW } from "@/lib/academy-locks";
import { PhaseNotify } from "./phase-notify";

// Shared "no content yet" placeholder, for a week whose sections are still
// being written.
export function ComingSoon({ message }: { message: string }) {
  return (
    <div className="ax-soon">
      <span className="rd-stamp rd-text-none">In preparation</span>
      <p>{message}</p>
    </div>
  );
}

/**
 * Shown in place of a whole phase while it is coming soon: what the phase
 * covers, and a way to be emailed the day it opens.
 */
export function PhaseLocked({ phase, title, summary }: { phase: string; title?: string; summary?: string }) {
  const preview = PHASE_PREVIEW[phase];
  return (
    <div className="rd">
      <header className="rd-mast">
        <div className="ax-titleblock">
          <h1>{title ?? preview?.title}</h1>
          <p>{summary ?? preview?.summary}</p>
        </div>
      </header>
      <div className="ax-soon">
        <span className="rd-stamp rd-text-none">Coming soon</span>
        <p>
          {preview ? `${preview.label} is still being finished.` : "This phase is still being finished."} Keep working through Phase 1 for now, because
          everything here builds on the environment you set up there.
        </p>
        {preview && (
          <>
            <ul className="ax-soon__points">
              {preview.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
            <PhaseNotify phase={phase} label={preview.label} />
          </>
        )}
      </div>
    </div>
  );
}

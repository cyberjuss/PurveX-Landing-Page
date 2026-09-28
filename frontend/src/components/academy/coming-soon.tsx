// Shared "no content yet" placeholder -- used both for an individual week
// with an empty sections array (Phase 1 Week 2, all of Phase 2) and for a
// phase with no weeks defined at all (Phase 3).
export function ComingSoon({ message }: { message: string }) {
  return (
    <div className="ax-soon">
      <span className="rd-stamp rd-text-none">In preparation</span>
      <p>{message}</p>
    </div>
  );
}

/** Shown in place of a whole phase while it is locked. */
export function PhaseLocked({ title, summary }: { title: string; summary: string }) {
  return (
    <div className="rd">
      <header className="rd-mast">
        <div className="ax-titleblock">
          <h1>{title}</h1>
          <p>{summary}</p>
        </div>
      </header>
      <div className="ax-soon">
        <span className="rd-stamp rd-text-none">Locked</span>
        <p>This phase is locked for now. Keep working through Phase 1.</p>
      </div>
    </div>
  );
}

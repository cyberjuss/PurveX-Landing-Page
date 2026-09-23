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

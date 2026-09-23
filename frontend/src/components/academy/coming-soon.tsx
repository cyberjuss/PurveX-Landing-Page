import { Clock } from "lucide-react";

// Shared "no content yet" placeholder -- used both for an individual week
// with an empty sections array (Phase 1 Week 2, all of Phase 2) and for a
// phase with no weeks defined at all (Phase 3). Those two cases used to be
// two separate hand-rolled blocks with different radii, padding, and
// copy; this is the one design both should read as.
export function ComingSoon({ message }: { message: string }) {
  return (
    <div className="mt-8 flex items-start gap-4 rounded-xl border border-[var(--pvrx-border-light)] bg-slate-50/60 p-6 shadow-[0_1px_2px_rgba(16,25,46,0.04),0_14px_32px_-26px_rgba(16,25,46,0.14)]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[rgba(106,92,255,0.1)] text-[#5546e0]">
        <Clock className="h-5 w-5" />
      </span>
      <p className="text-sm leading-6 text-slate-500">{message}</p>
    </div>
  );
}

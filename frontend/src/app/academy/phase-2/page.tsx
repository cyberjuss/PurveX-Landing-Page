import { redirect } from "next/navigation";
import { findPhase, firstAvailableEntry } from "@/lib/academy-content";
import { isPhaseLocked } from "@/lib/academy-locks";
import { PhaseLocked } from "@/components/academy/coming-soon";

// The sidebar already lists every week in this phase -- a separate overview
// page here just repeated that same list. Landing straight in the first
// week gets you into content one click sooner instead of re-showing a menu
// you were already looking at.
export default function Phase2Page() {
  const phase = findPhase("phase-2")!;
  if (isPhaseLocked(phase.slug)) return <PhaseLocked title={phase.title} summary="An alert fires. Read the host, the account, and the log before you decide what happened." />;
  const entry = firstAvailableEntry(phase);
  redirect(entry ? `/range/${phase.slug}/${entry.slug}` : "/range");
}

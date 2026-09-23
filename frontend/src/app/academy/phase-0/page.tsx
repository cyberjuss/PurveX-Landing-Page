import { redirect } from "next/navigation";
import { findPhase, firstAvailableEntry } from "@/lib/academy-content";

// The sidebar already lists every week in this phase -- a separate overview
// page here just repeated that same list. Landing straight in the first
// week gets you into content one click sooner instead of re-showing a menu
// you were already looking at.
export default function Phase0Page() {
  const phase = findPhase("phase-0")!;
  const entry = firstAvailableEntry(phase);
  redirect(entry ? `/academy/${phase.slug}/${entry.slug}` : "/academy");
}

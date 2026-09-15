import { findPhase } from "@/lib/academy-content";
import { PhaseOverview } from "@/components/academy/phase-overview";

export default function Phase1Page() {
  const phase = findPhase("phase-1")!;
  return <PhaseOverview phase={phase} tagline="The groundwork every analyst needs before touching a real alert queue." />;
}

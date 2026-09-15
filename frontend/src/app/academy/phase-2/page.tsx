import { findPhase } from "@/lib/academy-content";
import { PhaseOverview } from "@/components/academy/phase-overview";

export default function Phase2Page() {
  const phase = findPhase("phase-2")!;
  return <PhaseOverview phase={phase} tagline="Recognizing malware and the attacks that ride alongside it, then building toward SIEM and detection engineering." />;
}

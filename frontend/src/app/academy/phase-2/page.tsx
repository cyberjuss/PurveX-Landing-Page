import { findPhase } from "@/lib/academy-content";
import { PhaseOverview } from "@/components/academy/phase-overview";

export default function Phase2Page() {
  const phase = findPhase("phase-2")!;
  return <PhaseOverview phase={phase} tagline="Malware, log analysis, and building toward SIEM and detection engineering." />;
}

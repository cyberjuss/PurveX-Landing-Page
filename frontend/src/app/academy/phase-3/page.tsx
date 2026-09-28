import { ComingSoon, PhaseLocked } from "@/components/academy/coming-soon";
import { isPhaseLocked } from "@/lib/academy-locks";

export default function Phase3Page() {
  if (isPhaseLocked("phase-3")) return <PhaseLocked title="Incident Response" summary="Triage and investigation through containment and writing it up." />;
  return (
    <div className="rd">
      <header className="rd-mast">
        <div className="ax-titleblock">
          <h1>Incident Response</h1>
          <p>Triage and investigation through containment and writing it up.</p>
        </div>
      </header>

      <ComingSoon message="This phase's material is still being written. It will appear here as soon as it is ready." />
    </div>
  );
}

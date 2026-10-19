import { LabsView } from "@/components/academy/labs-view";
import { phases } from "@/lib/academy-content";
import { entriesOf } from "@/lib/academy-entries";
import { listLabs } from "@/lib/academy-labs";

export default function LabsPage() {
  // Each lab carries the week that assigns it, so the map and the SOC floor can
  // group a week's labs together, and its phase, because week numbers start
  // again in each phase.
  const labs = listLabs().map((l) => {
    const phase = phases.find((p) => p.slug === l.phaseSlug);
    const week = phase ? entriesOf(phase).find((e) => e.slug === l.entrySlug)?.title : undefined;
    return { ...l, week: week ?? l.phaseLabel, phase: phase ? `${phase.label} · ${phase.title}` : undefined };
  });
  return (
    <div className="rd">
      <LabsView labs={labs} />
    </div>
  );
}

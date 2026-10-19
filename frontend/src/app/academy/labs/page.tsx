import { LabsView } from "@/components/academy/labs-view";
import { listLabs } from "@/lib/academy-labs";

export default function LabsPage() {
  return (
    <div className="rd">
      <LabsView labs={listLabs()} />
    </div>
  );
}

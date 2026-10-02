import { LabGallery } from "@/components/academy/lab-gallery";
import { listLabs } from "@/lib/academy-labs";

export default function LabsPage() {
  return (
    <div className="rd">
      <LabGallery labs={listLabs()} />
    </div>
  );
}

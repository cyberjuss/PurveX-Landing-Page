import { notFound } from "next/navigation";
import { loadLesson, phases } from "@/lib/academy-content";
import { entriesOf } from "@/lib/academy-entries";
import { findLab, listLabs } from "@/lib/academy-labs";
import { extractEssentialQuestion } from "@/lib/markdown";
import { SingleLab } from "@/components/academy/single-lab";

export function generateStaticParams() {
  return listLabs().map((l) => ({ lab: l.slug }));
}

export default async function LabPage({ params }: { params: Promise<{ lab: string }> }) {
  const { lab: slug } = await params;
  const lab = findLab(slug);
  if (!lab) notFound();

  // Markdown labs load their steps here; the essential-question block is lifted
  // off the same way the week view does it, so the lab reads clean.
  let markdown: string | null = null;
  if (!lab.widget) {
    const raw = loadLesson(lab.file);
    markdown = raw ? extractEssentialQuestion(raw).rest : null;
  }

  // The week's own title, so the lab can offer a way back to the thing that
  // assigned it. Labs are no longer tabs on their week, so nothing else on
  // this page says which week it belongs to.
  const entryTitle = entriesOf(phases.find((p) => p.slug === lab.phaseSlug) ?? phases[0])
    .find((e) => e.slug === lab.entrySlug)?.title;

  return (
    <div className="rd">
      <SingleLab
        slug={lab.slug}
        title={lab.title}
        phaseSlug={lab.phaseSlug}
        entrySlug={lab.entrySlug}
        entryTitle={entryTitle}
        widget={lab.widget}
        markdown={markdown}
      />
    </div>
  );
}

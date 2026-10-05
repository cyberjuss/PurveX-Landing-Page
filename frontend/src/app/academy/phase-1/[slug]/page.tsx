import { notFound } from "next/navigation";
import { findPhase, findEntry } from "@/lib/academy-content";
import { entriesOf } from "@/lib/academy-entries";
import { PhaseEntry } from "@/components/academy/phase-entry";

export function generateStaticParams() {
  const phase = findPhase("phase-1")!;
  return entriesOf(phase).map((e) => ({ slug: e.slug }));
}

export default async function Phase1EntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const phase = findPhase("phase-1")!;
  const entry = findEntry("phase-1", slug);
  if (!entry) notFound();
  return <PhaseEntry phase={phase} entry={entry} />;
}

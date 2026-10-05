import { notFound } from "next/navigation";
import { findPhase, findEntry } from "@/lib/academy-content";
import { entriesOf } from "@/lib/academy-entries";
import { PhaseEntry } from "@/components/academy/phase-entry";
import { PhaseLocked } from "@/components/academy/coming-soon";
import { isPhaseLocked } from "@/lib/academy-locks";

export function generateStaticParams() {
  const phase = findPhase("phase-2")!;
  return entriesOf(phase).map((e) => ({ slug: e.slug }));
}

export default async function Phase2EntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const phase = findPhase("phase-2")!;
  const entry = findEntry("phase-2", slug);
  if (!entry) notFound();
  if (isPhaseLocked(phase.slug)) return <PhaseLocked title={entry.title} summary={entry.summary} />;
  return <PhaseEntry phase={phase} entry={entry} />;
}

import { notFound } from "next/navigation";
import { findPhase, findEntry } from "@/lib/academy-content";
import { PhaseEntry } from "@/components/academy/phase-entry";

export function generateStaticParams() {
  const phase = findPhase("phase-2")!;
  return [...phase.weeks.map((w) => ({ slug: w.slug })), ...(phase.homeLab ? [{ slug: phase.homeLab.slug }] : [])];
}

export default async function Phase2EntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const phase = findPhase("phase-2")!;
  const entry = findEntry("phase-2", slug);
  if (!entry) notFound();
  return <PhaseEntry phase={phase} entry={entry} />;
}

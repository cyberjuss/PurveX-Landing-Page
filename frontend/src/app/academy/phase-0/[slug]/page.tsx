import { notFound } from "next/navigation";
import { findPhase, findEntry } from "@/lib/academy-content";
import { PhaseEntry } from "@/components/academy/phase-entry";

export function generateStaticParams() {
  const phase = findPhase("phase-0")!;
  return [...phase.weeks.map((w) => ({ slug: w.slug })), ...(phase.homeLab ? [{ slug: phase.homeLab.slug }] : [])];
}

export default async function Phase0EntryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const phase = findPhase("phase-0")!;
  const entry = findEntry("phase-0", slug);
  if (!entry) notFound();
  return <PhaseEntry phase={phase} entry={entry} />;
}

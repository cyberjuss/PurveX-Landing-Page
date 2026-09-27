import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProofPublicView } from "@/components/proof/proof-public-view";
import { loadProofData } from "@/lib/academy-proof-data";
import { findProofBySlug } from "@/lib/academy-proof-store";
import "./proof.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = await findProofBySlug(slug);
  if (!found?.settings.published) return { title: "Profile not found", robots: { index: false } };
  return {
    title: `${found.settings.displayName} · Proof Profile`,
    description: `Lab work ${found.settings.displayName} completed and confirmed in PurveX Academy.`,
    robots: { index: false, follow: false },
  };
}

// What an employer sees at the student's shared link.
export default async function ProofProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await findProofBySlug(slug);
  if (!found?.settings.published) notFound();
  const data = await loadProofData(found.userId);
  return <ProofPublicView settings={found.settings} data={data} />;
}

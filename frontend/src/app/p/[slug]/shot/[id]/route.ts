import { NextResponse } from "next/server";
import { SHOTS_PER_ITEM } from "@/lib/academy-proof";
import { findProofBySlug, listShots, readShotBytes } from "@/lib/academy-proof-store";

export const runtime = "nodejs";

// A screenshot on a published profile. Served from our own domain so the
// storage bucket stays private and the page needs no outside image host.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const found = await findProofBySlug(slug);
  if (!found?.settings.published) return new NextResponse(null, { status: 404 });
  const shots = await listShots(found.userId);
  const shot = shots.find((s) => s.id === id);
  if (!shot || !found.settings.shotsOn.includes(shot.job)) return new NextResponse(null, { status: 404 });
  if (shots.filter((s) => s.job === shot.job).indexOf(shot) >= SHOTS_PER_ITEM) return new NextResponse(null, { status: 404 });
  const bytes = await readShotBytes(shot);
  if (!bytes) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(bytes), {
    headers: { "Content-Type": shot.contentType, "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff" },
  });
}

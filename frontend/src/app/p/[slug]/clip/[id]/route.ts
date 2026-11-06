import { NextResponse } from "next/server";
import { clipPlayUrl, listClips } from "@/lib/academy-clips";
import { findProofBySlug } from "@/lib/academy-proof-store";

export const runtime = "nodejs";

// A verified challenge clip on a published portfolio. The video player is
// sent on to a short-lived link to the private file, which supports seeking.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string; id: string }> }) {
  const { slug, id } = await params;
  const found = await findProofBySlug(slug);
  if (!found?.settings.published) return new NextResponse(null, { status: 404 });
  const clip = (await listClips(found.userId, true)).find((c) => c.id === id);
  const url = clip ? await clipPlayUrl(clip) : null;
  if (!url) return new NextResponse(null, { status: 404 });
  return NextResponse.redirect(url, { status: 302, headers: { "Cache-Control": "private, max-age=600" } });
}

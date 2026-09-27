import { NextResponse } from "next/server";
import { fileType, findProofBySlug, readFile } from "@/lib/academy-proof-store";

export const runtime = "nodejs";

// The profile photo on a published portfolio, served from our own domain.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await findProofBySlug(slug);
  const path = found?.settings.published ? found.settings.avatarPath : null;
  const bytes = path ? await readFile(path) : null;
  if (!path || !bytes) return new NextResponse(null, { status: 404 });
  return new NextResponse(new Uint8Array(bytes), {
    headers: { "Content-Type": fileType(path), "Cache-Control": "public, max-age=300", "X-Content-Type-Options": "nosniff" },
  });
}

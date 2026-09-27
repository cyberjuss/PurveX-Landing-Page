import { NextResponse } from "next/server";
import { findProofBySlug, readFile } from "@/lib/academy-proof-store";

export const runtime = "nodejs";

// The resume on a published portfolio, downloaded as "First-Last-Resume.pdf".
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await findProofBySlug(slug);
  const path = found?.settings.published ? found.settings.resumePath : null;
  const bytes = path ? await readFile(path) : null;
  if (!found || !path || !bytes) return new NextResponse(null, { status: 404 });
  const name = found.settings.displayName.replace(/[^A-Za-z0-9 ]+/g, "").trim().replace(/\s+/g, "-") || "Resume";
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}-Resume.pdf"`,
      "Cache-Control": "public, max-age=300",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

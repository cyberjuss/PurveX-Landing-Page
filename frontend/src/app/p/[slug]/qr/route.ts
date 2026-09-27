import { NextResponse } from "next/server";
import QRCode from "qrcode";

export const runtime = "nodejs";

const SLUG = /^[a-z0-9-]{1,40}$/;

// A PNG QR code for a portfolio link, sent as a file download. Served as a
// real file because phones and in-app browsers often block script downloads.
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUG.test(slug)) return new NextResponse(null, { status: 404 });
  const png = await QRCode.toBuffer(`https://purvex.io/p/${slug}`, {
    type: "png",
    width: 600,
    margin: 2,
    errorCorrectionLevel: "M",
    color: { dark: "#111827", light: "#ffffff" },
  });
  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="purvex-portfolio-${slug}.png"`,
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

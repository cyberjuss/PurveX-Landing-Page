import { NextResponse } from "next/server";
import { compareToBaseline, sanitizeLabSnapshot } from "@/lib/academy-lab";
import { resolveMcpKey, saveLabState } from "@/lib/academy-store";

export const runtime = "nodejs";

// Upload target for public/lab-scripts/Build-Environment.ps1, authenticated
// with the pvx_ key embedded in the student's downloaded copy.
const MAX_BYTES = 512 * 1024;

export async function POST(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userId = key ? await resolveMcpKey(key) : null;
  if (!userId) {
    return NextResponse.json({ error: "Invalid or missing PurveX Academy key." }, { status: 401 });
  }

  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BYTES) {
    return NextResponse.json({ error: "Snapshot is too large." }, { status: 413 });
  }
  const text = await request.text();
  if (text.length > MAX_BYTES) {
    return NextResponse.json({ error: "Snapshot is too large." }, { status: 413 });
  }

  let raw: unknown;
  try {
    // Windows PowerShell 5.1 can prepend a UTF-8 byte order mark.
    raw = JSON.parse(text.replace(/^\uFEFF/, ""));
  } catch {
    return NextResponse.json({ error: "Snapshot is not valid JSON." }, { status: 400 });
  }

  const snapshot = sanitizeLabSnapshot(raw);
  if (!snapshot) {
    return NextResponse.json({ error: "Snapshot has no lab objects in it." }, { status: 400 });
  }

  try {
    await saveLabState(userId, snapshot);
  } catch (err) {
    console.error("academy_lab_state save failed", err);
    return NextResponse.json({ error: "Could not save the snapshot." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    capturedAt: snapshot.capturedAt,
    counts: { users: snapshot.users.length, groups: snapshot.groups.length, computers: snapshot.computers.length, ous: snapshot.ous.length },
    differences: compareToBaseline(snapshot).length,
  });
}

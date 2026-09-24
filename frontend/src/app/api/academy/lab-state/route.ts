import { NextResponse } from "next/server";
import { compareToBaseline, sanitizeLabSnapshot } from "@/lib/academy-lab";
import { loadLabLive, resolveMcpKey, saveLabState } from "@/lib/academy-store";

export const runtime = "nodejs";

// Upload target for public/lab-scripts/Build-Environment.ps1, authenticated
// with the pvx_ key embedded in the student's downloaded copy.
const MAX_BYTES = 512 * 1024;

async function keyUser(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return key ? resolveMcpKey(key) : null;
}

async function isLive(userId: string) {
  const live = await loadLabLive(userId).catch(() => null);
  return Boolean(live?.liveUntil) && Date.parse(live?.liveUntil as string) > Date.now();
}

// The lab script asks this every few minutes. While it says live, the script sends a snapshot each time.
export async function GET(request: Request) {
  const userId = await keyUser(request);
  if (!userId) return NextResponse.json({ error: "Invalid or missing PurveX Academy key." }, { status: 401 });
  return NextResponse.json({ live: await isLive(userId) });
}

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
    live: await isLive(userId),
  });
}

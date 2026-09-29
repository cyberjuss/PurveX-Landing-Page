import { NextResponse } from "next/server";
import { compareToBaseline, sanitizeLabSnapshot } from "@/lib/academy-lab";
import { loadLabLive, resolveLabKey, saveLabLive, saveLabState } from "@/lib/academy-store";
import { isVerified } from "@/lib/academy-verify";

export const runtime = "nodejs";

// Upload target for public/lab-scripts/Build-Environment.ps1, authenticated
// with the pvx_ key embedded in the student's downloaded copy, or the pvl_
// key a hosted lab gets on first boot.
const MAX_BYTES = 512 * 1024;

async function keyUser(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  return key ? resolveLabKey(key) : null;
}

async function isLive(userId: string) {
  const live = await loadLabLive(userId).catch(() => null);
  return Boolean(live?.liveUntil) && Date.parse(live?.liveUntil as string) > Date.now();
}

// The lab script asks this every few minutes. While it says live, the script sends a snapshot each time.
export async function GET(request: Request) {
  const userId = await keyUser(request);
  if (!userId) return NextResponse.json({ error: "Invalid or missing Range key." }, { status: 401 });
  return NextResponse.json({ live: await isLive(userId) });
}

export async function POST(request: Request) {
  const auth = request.headers.get("authorization") || "";
  const key = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  const userId = key ? await resolveLabKey(key) : null;
  if (!userId) {
    return NextResponse.json({ error: "Invalid or missing Range key." }, { status: 401 });
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

  // A hosted-lab key only exists inside a machine Range built for this student, so its
  // snapshots already prove the lab is theirs and live. No code to plant. Refreshed hourly.
  if (key.startsWith("pvl_")) {
    const live = await loadLabLive(userId).catch(() => null);
    const fresh = live?.verifiedAt && isVerified(live.verifiedAt) && Date.now() - Date.parse(live.verifiedAt) < 3600_000;
    if (!fresh) await saveLabLive(userId, { verifiedAt: new Date().toISOString() }).catch(() => {});
  }

  return NextResponse.json({
    ok: true,
    capturedAt: snapshot.capturedAt,
    counts: { users: snapshot.users.length, groups: snapshot.groups.length, computers: snapshot.computers.length, ous: snapshot.ous.length },
    differences: compareToBaseline(snapshot).length,
    live: await isLive(userId),
  });
}

import { after, NextResponse } from "next/server";
import { stopIdleHostedLab } from "@/lib/academy-hosted";
import { compareToBaseline, sanitizeLabSnapshot } from "@/lib/academy-lab";
import { loadLabLive, loadLabState, resolveLabKey, saveLabLive, saveLabState } from "@/lib/academy-store";
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

  // A refused snapshot is invisible from here: the lab goes on building, the
  // student watches "Linking to Range" forever, and the only record is a line
  // in a transcript nobody reads. So say how far over it went, in the log and
  // in the reply the lab prints.
  const tooBig = (size: number) => {
    console.error("lab snapshot refused", userId, `${size} bytes over ${MAX_BYTES}`);
    return NextResponse.json({ error: `Snapshot is too large: ${size} bytes against a ${MAX_BYTES} limit.` }, { status: 413 });
  };
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > MAX_BYTES) return tooBig(declared);
  const text = await request.text();
  if (text.length > MAX_BYTES) {
    return tooBig(text.length);
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

  // A fast nudge from the sync loop leaves the security and event keys out so it
  // does not have to read the 30-day Security log. Keep the digest from the last
  // full snapshot in that case, rather than overwriting it with the empty
  // default the sanitizer fills in, so log-analysis challenges still see it.
  const rawObj = raw as Record<string, unknown>;
  const omittedHeavy = !("events" in rawObj) || !("security" in rawObj);
  if (omittedHeavy) {
    const prior = await loadLabState(userId).catch(() => null);
    if (prior?.snapshot) {
      if (!("events" in rawObj)) snapshot.events = prior.snapshot.events;
      if (!("security" in rawObj)) snapshot.security = prior.snapshot.security;
    }
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
    // The lab reports its own idleness every minute, which makes this the
    // cheapest place to notice one nobody is working in. Best effort, after
    // the reply: the sync must not wait on EC2.
    after(() => stopIdleHostedLab(userId, snapshot.idleMinutes).then(() => undefined).catch(() => undefined));
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

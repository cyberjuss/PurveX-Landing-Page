import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { CLIP_MAX_BYTES, CLIP_MAX_SECONDS } from "@/lib/academy-clip-limits";
import {
  challengeSolvedAt,
  clipPlayUrl,
  clipsAvailable,
  confirmClip,
  deleteClip,
  isChallengeKey,
  listClips,
  startClip,
} from "@/lib/academy-clips";
import { CHALLENGE_LABELS } from "@/lib/academy-missions";
import { loadProgress } from "@/lib/academy-store";
import { isRangePro, proRequired } from "@/lib/range-plan";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// Verified challenge clips for the Proof Profile. Listing and watching your
// own is open to every student. Adding one needs Pro, like every other write
// to the profile, and a challenge the server has recorded as fully solved.
async function auth(request: Request, requirePro: boolean) {
  if (!(await isAcademyUnlocked())) return { error: NextResponse.json({ error: "Locked" }, { status: 401 }) } as const;
  const student = await getAcademyStudent(request);
  if (!student) return { error: NextResponse.json({ error: "Sign in first." }, { status: 401 }) } as const;
  if (requirePro && !(await isRangePro(student))) {
    return { error: NextResponse.json(proRequired("Adding a challenge clip to your profile"), { status: 403 }) } as const;
  }
  if (!clipsAvailable()) return { error: NextResponse.json({ error: "Clip uploads aren't switched on yet." }, { status: 503 }) } as const;
  return { student } as const;
}

const view = (c: Awaited<ReturnType<typeof listClips>>[number]) => ({
  id: c.id,
  challenge: c.challenge,
  title: CHALLENGE_LABELS[c.challenge],
  durationSec: c.durationSec,
  sizeBytes: c.sizeBytes,
  recordedAt: c.recordedAt,
  solvedAt: c.solvedAt,
  hasPoster: Boolean(c.posterPath),
});

/** Your own clips, or ?id=... for a link to watch one (add &poster=1 for its still frame). */
export async function GET(request: Request) {
  const a = await auth(request, false);
  if (a.error) return a.error;
  const params = new URL(request.url).searchParams;
  const clips = await listClips(a.student.id, true);
  const id = params.get("id");
  if (id) {
    const clip = clips.find((c) => c.id === id);
    const url = clip ? await clipPlayUrl(clip, params.get("poster") === "1") : null;
    return url ? NextResponse.json({ url }) : NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  return NextResponse.json({ clips: clips.map(view) });
}

/** Step 1: ask to add a clip. Checks the solve and the size, then hands back an upload link. */
export async function POST(request: Request) {
  const a = await auth(request, true);
  if (a.error) return a.error;
  let body: { challenge?: unknown; sizeBytes?: unknown; durationSec?: unknown; recordedAt?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!isChallengeKey(body.challenge)) return NextResponse.json({ error: "That isn't a challenge." }, { status: 400 });
  const size = Number(body.sizeBytes);
  const seconds = Number(body.durationSec);
  if (!Number.isFinite(size) || size <= 0) return NextResponse.json({ error: "The recording is empty." }, { status: 400 });
  if (size > CLIP_MAX_BYTES || seconds > CLIP_MAX_SECONDS) {
    return NextResponse.json({ error: "Clips can be up to 15 minutes. Record a shorter one to add it to your profile." }, { status: 413 });
  }
  const solvedAt = challengeSolvedAt(await loadProgress(a.student.id), body.challenge);
  if (!solvedAt) {
    return NextResponse.json({ error: "Solve every question in this challenge first. Only finished challenges go on your profile." }, { status: 409 });
  }
  const recordedAt = typeof body.recordedAt === "string" && !Number.isNaN(Date.parse(body.recordedAt)) ? new Date(body.recordedAt).toISOString() : null;
  const started = await startClip(a.student.id, body.challenge, size, Number.isFinite(seconds) ? seconds : 0, recordedAt, solvedAt);
  if (!started) return NextResponse.json({ error: "Couldn't start the upload. Try again in a minute." }, { status: 500 });
  return NextResponse.json(started);
}

/** Step 2: the file is uploaded. The server checks it arrived and puts it on the profile. */
export async function PATCH(request: Request) {
  const a = await auth(request, true);
  if (a.error) return a.error;
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const clip = await confirmClip(a.student.id, id);
  if (!clip) return NextResponse.json({ error: "The upload didn't arrive. Try adding it again." }, { status: 409 });
  return NextResponse.json({ clip: view(clip) });
}

export async function DELETE(request: Request) {
  const a = await auth(request, false);
  if (a.error) return a.error;
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!(await deleteClip(a.student.id, id))) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

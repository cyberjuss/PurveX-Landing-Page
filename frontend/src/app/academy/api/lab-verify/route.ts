import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { loadLabLive, loadLabState, saveLabLive, touchLabLive } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";
import { CHALLENGE_MINUTES, LIVE_MINUTES, challengeOpen, challengeTarget, codeInSnapshot, isVerified, newChallengeCode, powershellLine } from "@/lib/academy-verify";

export const runtime = "nodejs";

async function auth(request: Request) {
  if (!(await isAcademyUnlocked())) return { error: NextResponse.json({ error: "Locked" }, { status: 401 }) };
  const student = await getAcademyStudent(request);
  if (!student) return { error: NextResponse.json({ error: "Sign in first." }, { status: 401 }) };
  return { student };
}

async function state(userId: string) {
  const [live, lab] = await Promise.all([loadLabLive(userId), loadLabState(userId)]);
  const open = challengeOpen(live.challengeAt) && live.challengeCode && lab ? live : null;
  const target = lab && open ? challengeTarget(lab.snapshot) : null;
  return {
    hasLab: Boolean(lab),
    verified: isVerified(live.verifiedAt),
    verifiedAt: live.verifiedAt,
    live: Boolean(live.liveUntil) && Date.parse(live.liveUntil as string) > Date.now(),
    challenge:
      open && target
        ? {
            code: open.challengeCode as string,
            target: target.label,
            command: powershellLine(target, open.challengeCode as string),
            expiresAt: new Date(Date.parse(open.challengeAt as string) + CHALLENGE_MINUTES * 60_000).toISOString(),
          }
        : null,
  };
}

export async function GET(request: Request) {
  const a = await auth(request);
  if (a.error) return a.error;
  return NextResponse.json(await state(a.student.id));
}

export async function POST(request: Request) {
  const a = await auth(request);
  if (a.error) return a.error;
  const userId = a.student.id;
  const body = (await request.json().catch(() => ({}))) as { action?: string };
  const lab = await loadLabState(userId);
  if (!lab) return NextResponse.json({ error: "Connect your lab first. Run the script from Build the Environment." }, { status: 400 });

  if (body.action === "start") {
    const live = await loadLabLive(userId);
    // An open challenge is reused, so a page refresh never invalidates the code the student planted.
    if (!(challengeOpen(live.challengeAt) && live.challengeCode)) {
      await saveLabLive(userId, { challengeCode: newChallengeCode(), challengeAt: new Date().toISOString() });
    }
    await touchLabLive(userId, LIVE_MINUTES);
    return NextResponse.json(await state(userId));
  }

  if (body.action === "check") {
    const live = await loadLabLive(userId);
    if (!(challengeOpen(live.challengeAt) && live.challengeCode)) {
      return NextResponse.json({ ...(await state(userId)), error: "No open challenge. Start a new one." }, { status: 400 });
    }
    await touchLabLive(userId, LIVE_MINUTES);
    const seen = codeInSnapshot(lab.snapshot, live.challengeCode);
    // A snapshot taken before the challenge cannot hold the code, so this only says whether to keep waiting.
    const fresh = Date.parse(lab.uploadedAt) > Date.parse(live.challengeAt as string);
    if (seen) {
      await saveLabLive(userId, { verifiedAt: new Date().toISOString(), challengeCode: null, challengeAt: null });
      return NextResponse.json({ ...(await state(userId)), passed: true });
    }
    return NextResponse.json({ ...(await state(userId)), passed: false, fresh });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

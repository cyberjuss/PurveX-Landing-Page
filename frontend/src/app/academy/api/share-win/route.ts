import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { sanitizeProfile } from "@/lib/academy-certs";
import { discordWinsConfigured, finishedChallenges, postWin } from "@/lib/academy-discord";
import { loadProgress, readProfile, saveProfile } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// "Share it in #wins": the yes to the question asked after a student's first
// finished challenge. It turns on the same opt-in as the checkbox in Goals,
// so later wins post by themselves, and posts this one now. The challenge has
// to be one they really finished, read from their recorded results, so the
// endpoint cannot be used to announce anything else.
export async function POST(request: Request) {
  if (!(await isAcademyUnlocked())) return NextResponse.json({ error: "Locked" }, { status: 401 });
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!discordWinsConfigured()) return NextResponse.json({ error: "Sharing wins is not set up." }, { status: 404 });

  let body: { challenge?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const finished = finishedChallenges(await loadProgress(student.id));
  const challenge = finished.find((k) => k === body.challenge);
  if (!challenge) return NextResponse.json({ error: "That challenge is not finished yet." }, { status: 400 });

  const { profile, failed } = await readProfile(student.id);
  if (failed || !profile) return NextResponse.json({ error: "Couldn't load your profile. Try again." }, { status: 503 });
  const next = sanitizeProfile({ ...profile, extras: { ...profile.extras, shareWins: true }, updatedAt: new Date().toISOString() });
  if (next) await saveProfile(student.id, next);

  const posted = await postWin(profile.callMe || student.name || "", challenge);
  return NextResponse.json({ posted });
}

import { after, NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { sanitizeProfile } from "@/lib/academy-certs";
import { ensureRoleBrief } from "@/lib/academy-role-research";
import { loadProfile, saveProfile } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";
// Room for the role research that runs after the response.
export const maxDuration = 60;

async function auth(request: Request) {
  if (!(await isAcademyUnlocked())) return { error: NextResponse.json({ error: "Locked" }, { status: 401 }) } as const;
  const student = await getAcademyStudent(request);
  if (!student) return { error: NextResponse.json({ error: "Sign in first." }, { status: 401 }) } as const;
  return { student } as const;
}

export async function GET(request: Request) {
  const a = await auth(request);
  if (a.error) return a.error;
  return NextResponse.json({ profile: await loadProfile(a.student.id) });
}

export async function PUT(request: Request) {
  const a = await auth(request);
  if (a.error) return a.error;
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const profile = sanitizeProfile({ ...(payload as { profile?: object }).profile, updatedAt: new Date().toISOString() });
  if (!profile) {
    return NextResponse.json({ error: "Answer every question, and pick at least one role." }, { status: 400 });
  }
  // A database problem is logged by the store. It never keeps a student out: the browser keeps a copy too.
  const saved = await saveProfile(a.student.id, profile);
  // Research the roles after the student is on their way. Coach uses general knowledge until it lands.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey) after(() => Promise.all(profile.roles.map((role) => ensureRoleBrief(apiKey, role))).then(() => undefined));
  return NextResponse.json({ profile, saved });
}

import { NextResponse } from "next/server";
import { setAcademyCookie } from "@/lib/academy-auth";
import { ensureMembership } from "@/lib/academy-membership";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// Range is open: anyone who signs in gets in. The first time an account opens
// it, a membership row is created and the course unlocks, which is what lets
// someone who found us on their own start without a class passcode. Admins,
// instructors and cohort students come through the same door; their extra
// rights are checked where they are used, not here. The shared passcode and
// class links still work for cohorts that prefer them.
export async function POST(request: Request) {
  const me = await getAcademyStudent(request);
  if (!me) return NextResponse.json({ unlocked: false }, { status: 401 });
  await ensureMembership(me);
  return NextResponse.json({ unlocked: await setAcademyCookie() });
}

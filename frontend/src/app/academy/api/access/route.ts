import { NextResponse } from "next/server";
import { setAcademyCookie } from "@/lib/academy-auth";
import { classesFor } from "@/lib/academy-classes";
import { isRangePro } from "@/lib/range-plan";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// Accounts that already have access skip the passcode: instructors with a
// class of their own, and anyone isRangePro() covers -- admins, students on
// a class roster, and Range Pro subscribers. A code is a class's way in, not
// the only one, so a subscriber is never asked for one.
export async function POST(request: Request) {
  const me = await getAcademyStudent(request);
  if (!me) return NextResponse.json({ unlocked: false }, { status: 401 });
  const allowed = (await isRangePro(me)) || (await classesFor(me.email)).length > 0;
  return NextResponse.json({ unlocked: allowed && (await setAcademyCookie()) });
}

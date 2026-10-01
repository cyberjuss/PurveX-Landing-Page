import { NextResponse } from "next/server";
import { setAcademyCookie } from "@/lib/academy-auth";
import { classesFor, isAcademyAdmin, isClassMember } from "@/lib/academy-classes";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// Accounts that already have access skip the passcode: admins, instructors,
// and students already on a class roster. Anyone else still needs a code.
export async function POST(request: Request) {
  const me = await getAcademyStudent(request);
  if (!me) return NextResponse.json({ unlocked: false }, { status: 401 });
  const allowed =
    isAcademyAdmin(me.email) || (await classesFor(me.email)).length > 0 || (await isClassMember(me.id));
  return NextResponse.json({ unlocked: allowed && (await setAcademyCookie()) });
}

import { NextResponse } from "next/server";
import { setAcademyCookie } from "@/lib/academy-auth";
import { classesFor, isClassMember } from "@/lib/academy-classes";
import { isRangePro } from "@/lib/range-plan";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// Who skips the passcode and gets straight into the portal: Range Pro
// subscribers and admins (isRangePro), instructors with a class of their own
// (classesFor), and anyone on a class roster (isClassMember).
//
// A cohort seat is used for the roster check, not isRangePro, on purpose. A
// student's Pro runs out 12 weeks after they join (see cohortAccessExpiry), at
// which point isRangePro goes false, but they keep access to the free Explore
// tier. Gating the portal on isRangePro would lock an expired cohort student
// out entirely instead of dropping them to free. Pro features stay gated by
// isRangePro inside each route; this only decides who can open the portal.
export async function POST(request: Request) {
  const me = await getAcademyStudent(request);
  if (!me) return NextResponse.json({ unlocked: false }, { status: 401 });
  const allowed =
    (await isRangePro(me)) ||
    (await isClassMember(me.id).catch(() => false)) ||
    (await classesFor(me.email)).length > 0;
  return NextResponse.json({ unlocked: allowed && (await setAcademyCookie()) });
}

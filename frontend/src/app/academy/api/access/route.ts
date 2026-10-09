import { NextResponse } from "next/server";
import { setAcademyCookie } from "@/lib/academy-auth";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// Signing in is the way in. Every account gets Explore: every lesson, every
// challenge, the Ticket Queue and the browser labs. What costs money per
// student (the cloud lab, Coach, the Shift, AI-written drills, a published
// Proof Profile) asks isRangePro() on its own route, so opening the door here
// opens nothing that is sold. A class code no longer gates entry; it only
// puts a student on a class roster, which is what makes their seat Pro.
//
// This also covers a cohort student whose 12-week seat has run out (see
// cohortAccessExpiry): isRangePro goes false, and they drop to Explore
// rather than being sent back to the passcode screen.
export async function POST(request: Request) {
  const me = await getAcademyStudent(request);
  if (!me) return NextResponse.json({ unlocked: false }, { status: 401 });
  return NextResponse.json({ unlocked: await setAcademyCookie() });
}

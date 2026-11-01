import { NextResponse } from "next/server";
import { setAcademyCookie } from "@/lib/academy-auth";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// Who skips the passcode and gets straight into the portal: anyone signed in.
// Explore is the free tier every student starts on, so being a real student
// is the only thing this checks -- there is no "not allowed in yet" plan.
// Pro features (the cloud lab, Coach, the Proof Profile) stay gated by
// isRangePro inside each of those routes; this only decides who can open
// the portal at all, and a signed-in student always can.
export async function POST(request: Request) {
  const me = await getAcademyStudent(request);
  if (!me) return NextResponse.json({ unlocked: false }, { status: 401 });
  await setAcademyCookie();
  return NextResponse.json({ unlocked: true });
}

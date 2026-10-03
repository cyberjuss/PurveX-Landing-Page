import { NextResponse } from "next/server";
import { rangeEntitlement } from "@/lib/range-plan";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// What plan the signed-in account is on. Deliberately not behind
// isAcademyUnlocked(): the upgrade page asks this before anyone has a
// passcode, which is the whole point of letting a subscription be its own
// way in.
export async function GET(request: Request) {
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ plan: "free", source: "none", until: null, canceled: false, signedIn: false });
  return NextResponse.json({ ...(await rangeEntitlement(student)), signedIn: true });
}

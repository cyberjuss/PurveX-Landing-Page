import { NextResponse } from "next/server";
import { rangeEntitlement } from "@/lib/range-plan";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// The same Payment Link the upgrade page has baked in, read here at request
// time instead. NEXT_PUBLIC_ vars are inlined when the bundle is built, so
// adding the link in the host's dashboard does nothing to a build that went
// out without it -- which is exactly how /range/upgrade ends up telling a
// paying customer that checkout is not configured. Served from the route,
// the link works on the next request.
const checkoutUrl = (process.env.NEXT_PUBLIC_STRIPE_RANGE_PRO_LINK_URL ?? "").trim();

// What plan the signed-in account is on. Deliberately not behind
// isAcademyUnlocked(): the upgrade page asks this before anyone has a
// passcode, which is the whole point of letting a subscription be its own
// way in.
export async function GET(request: Request) {
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ plan: "free", source: "none", until: null, canceled: false, signedIn: false, checkoutUrl });
  return NextResponse.json({ ...(await rangeEntitlement(student)), signedIn: true, checkoutUrl });
}

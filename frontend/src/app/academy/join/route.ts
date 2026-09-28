import { NextResponse } from "next/server";
import { setAcademyCookie, setClassCookie } from "@/lib/academy-auth";
import { findClassByCode } from "@/lib/academy-classes";

export const runtime = "nodejs";

// An instructor's share link: /academy/join?code=CLASS-CODE unlocks the course
// and joins the class at the student's next sign-in. Works for students who
// already unlocked with another passcode too.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const cls = await findClassByCode(url.searchParams.get("code") ?? "");
  if (cls) {
    await setClassCookie(cls.code);
    await setAcademyCookie();
  }
  return NextResponse.redirect(new URL("/academy", url.origin));
}

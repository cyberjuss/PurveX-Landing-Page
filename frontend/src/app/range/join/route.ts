import { NextResponse } from "next/server";
import { setAcademyCookie, setClassCookie } from "@/lib/academy-auth";
import { findClassByCode } from "@/lib/academy-classes";

export const runtime = "nodejs";

// The student-facing share link: /range/join?code=CLASS-CODE unlocks the course
// and joins the class at the next sign-in. Mirrors /academy/join, which stays for
// older links. Students never see "academy" in the link they are handed.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const cls = await findClassByCode(url.searchParams.get("code") ?? "");
  if (cls) {
    await setClassCookie(cls.code);
    await setAcademyCookie();
  }
  return NextResponse.redirect(new URL("/academy", url.origin));
}

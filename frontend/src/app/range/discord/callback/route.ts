import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { checkState, finishLink, LINK_COOKIE } from "@/lib/academy-discord-roles";

export const runtime = "nodejs";

// Where Discord sends a student back after Connect Discord. A real route under
// /range, like /range/join, so it wins over the /range -> /academy rewrite.
// The signed state says who started it, and the cookie proves it is the same
// browser. Either way the student lands back in Range, with ?discord= saying
// how it went.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const back = (outcome: string) => NextResponse.redirect(new URL(`/range?discord=${outcome}`, url.origin));
  const jar = await cookies();
  const nonce = jar.get(LINK_COOKIE)?.value;
  jar.delete({ name: LINK_COOKIE, path: "/range/discord" });

  // They pressed Cancel on Discord's screen.
  if (url.searchParams.get("error")) return back("cancelled");

  const userId = checkState(url.searchParams.get("state") ?? "", nonce);
  const code = url.searchParams.get("code");
  if (!userId || !code) return back("expired");

  const done = await finishLink(userId, code, url.origin).catch((err) => {
    console.error("discord: link failed", err instanceof Error ? err.message : err);
    return { ok: false as const, reason: "error" };
  });
  return back(done.ok ? "linked" : "failed");
}

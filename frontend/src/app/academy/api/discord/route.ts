import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAcademyStudent } from "@/lib/academy-student";
import { rangeEntitlement } from "@/lib/range-plan";
import { discordLinkConfigured, LINK_COOKIE, loadLink, startLink, syncDiscordRole, unlink } from "@/lib/academy-discord-roles";

export const runtime = "nodejs";

// The student's side of the Discord link (lib/academy-discord-roles.ts).
//   GET     whether they are linked and to whom, and their role, re-synced on the way
//   POST    the Discord sign-in URL to send them to
//   DELETE  unlink, taking the Pro role back first

export async function GET(request: Request) {
  if (!discordLinkConfigured()) return NextResponse.json({ configured: false });
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const link = await loadLink(student.id);
  const pro = (await rangeEntitlement(student)).plan === "pro";
  // Opening Goals is a free chance to put the role right, say for a class
  // seat that started since the last daily run.
  const sync = link ? await syncDiscordRole(student.id, student) : "unlinked";
  return NextResponse.json({
    configured: true,
    linked: link ? { username: link.discord_username } : null,
    pro,
    inServer: sync !== "not-in-server",
  });
}

export async function POST(request: Request) {
  if (!discordLinkConfigured()) return NextResponse.json({ error: "Discord linking is not set up." }, { status: 404 });
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const { url, nonce } = startLink(student.id, new URL(request.url).origin);
  (await cookies()).set(LINK_COOKIE, nonce, { httpOnly: true, secure: true, sameSite: "lax", path: "/range/discord", maxAge: 600 });
  return NextResponse.json({ url });
}

export async function DELETE(request: Request) {
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  await unlink(student.id);
  return NextResponse.json({ linked: null });
}

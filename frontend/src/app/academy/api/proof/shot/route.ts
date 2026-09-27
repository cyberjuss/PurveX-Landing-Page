import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { listShots, readShotBytes } from "@/lib/academy-proof-store";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

// A student's own screenshot, for their profile editor. The page fetches it
// with the Academy Bearer token and shows it from a blob URL.
export async function GET(request: Request) {
  if (!(await isAcademyUnlocked())) return NextResponse.json({ error: "Locked" }, { status: 401 });
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const shot = (await listShots(student.id)).find((s) => s.id === id);
  if (!shot) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const bytes = await readShotBytes(shot);
  if (!bytes) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return new NextResponse(new Uint8Array(bytes), {
    headers: { "Content-Type": shot.contentType, "Cache-Control": "private, max-age=300" },
  });
}

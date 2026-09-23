import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { createMcpKey, getMcpKeyInfo, revokeMcpKey } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

async function requireStudent(request: Request) {
  if (!(await isAcademyUnlocked())) return null;
  return getAcademyStudent(request);
}

export async function GET(request: Request) {
  const student = await requireStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  return NextResponse.json({ key: await getMcpKeyInfo(student.id) });
}

export async function POST(request: Request) {
  const student = await requireStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  try {
    const key = await createMcpKey(student.id);
    return NextResponse.json({ key, info: await getMcpKeyInfo(student.id) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not create a key.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const student = await requireStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  try {
    await revokeMcpKey(student.id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not revoke the key.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getAcademyStudent } from "@/lib/academy-student";
import { isPhaseLocked, PHASE_PREVIEW } from "@/lib/academy-locks";
import { phaseInterestEmail } from "@/lib/academy-emails";
import { sendEmail } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { mailGuard } from "@/lib/auth-guard";

export const runtime = "nodejs";

// "Notify me when it opens" for a coming-soon phase. The address is the one on
// the signed-in account, never one typed into the page, so nobody can put
// someone else on the list.

export async function GET(request: Request) {
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ phases: [], email: student.email });
  const { data, error } = await supabaseAdmin.from("academy_phase_interest").select("phase").eq("user_id", student.id);
  if (error) {
    console.error("academy_phase_interest read failed", error.message);
    return NextResponse.json({ error: "Couldn't check right now." }, { status: 503 });
  }
  return NextResponse.json({ phases: (data ?? []).map((r) => r.phase), email: student.email });
}

export async function POST(request: Request) {
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  if (!student.email) return NextResponse.json({ error: "Your account has no email address." }, { status: 400 });
  let phase = "";
  try {
    phase = String(((await request.json()) as { phase?: unknown }).phase ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const preview = PHASE_PREVIEW[phase];
  if (!preview || !isPhaseLocked(phase)) return NextResponse.json({ error: "That phase isn't coming soon." }, { status: 400 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Not available right now." }, { status: 503 });

  const { data: existing } = await supabaseAdmin
    .from("academy_phase_interest")
    .select("phase")
    .eq("user_id", student.id)
    .eq("phase", phase)
    .maybeSingle();
  if (existing) return NextResponse.json({ ok: true, already: true });

  // Removing and re-adding is a way to make the server send mail, so the same
  // throttle as signup and password reset applies.
  if (!mailGuard(request, student.email)) return NextResponse.json({ error: "Too many tries. Wait a few minutes." }, { status: 429 });
  const { error } = await supabaseAdmin.from("academy_phase_interest").insert({ user_id: student.id, phase, email: student.email });
  if (error) {
    console.error("academy_phase_interest insert failed", error.message);
    return NextResponse.json({ error: "Couldn't save that. Try again." }, { status: 503 });
  }
  // A failed confirmation never undoes the sign-up: the launch email is what matters.
  const origin = new URL(request.url).origin;
  const mail = phaseInterestEmail({ name: student.name, email: student.email }, preview, origin);
  await sendEmail(student.email, mail.subject, mail.html);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const phase = new URL(request.url).searchParams.get("phase") ?? "";
  if (!supabaseAdmin || !PHASE_PREVIEW[phase]) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { error } = await supabaseAdmin.from("academy_phase_interest").delete().eq("user_id", student.id).eq("phase", phase);
  if (error) return NextResponse.json({ error: "Couldn't update that. Try again." }, { status: 503 });
  return NextResponse.json({ ok: true });
}

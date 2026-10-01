import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";
import { signupConfirmEmail } from "@/lib/academy-emails";

export const runtime = "nodejs";

// Create the account and send our own branded confirmation email, instead of
// Supabase's default template. We generate the signup link with the service role
// (which does not send anything) and mail it through Resend. The user confirms
// via that link, then signs in. Assumes email confirmation is on in Supabase.
export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown; redirectTo?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const redirectTo = typeof body.redirectTo === "string" ? body.redirectTo : undefined;
  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Sign-up is not configured yet." }, { status: 503 });

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: redirectTo ? { redirectTo } : undefined,
  });
  if (error) return NextResponse.json({ error: error.message || "Could not create your account." }, { status: 400 });

  const link = data?.properties?.action_link;
  if (link) {
    const mail = signupConfirmEmail(link);
    await sendEmail(email, mail.subject, mail.html).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}

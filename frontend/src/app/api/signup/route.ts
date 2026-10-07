import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";
import { signupConfirmEmail } from "@/lib/academy-emails";
import { mailGuard, safeRedirect } from "@/lib/auth-guard";

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
  const redirectTo = safeRedirect(request, body.redirectTo);
  if (!email || !password) return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  if (!supabaseAdmin) return NextResponse.json({ error: "Sign-up is not configured yet." }, { status: 503 });
  if (!mailGuard(request, email)) {
    return NextResponse.json({ error: "Too many attempts. Wait a few minutes and try again." }, { status: 429 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: redirectTo ? { redirectTo } : undefined,
  });
  if (error) {
    // Supabase answers "User already registered" for an address that exists,
    // and passing that through turned sign-up into a way to test whether any
    // given person has an account here. resend-confirmation already refuses to
    // answer that question, so this was the hole in the same rule.
    console.error(`[signup] generateLink failed for ${email}:`, error.message);
    const taken = /already|exist|registered/i.test(error.message || "");
    return NextResponse.json(
      {
        error: taken
          ? "If that address can be used, we have sent a confirmation link. Check your inbox, or reset your password."
          : "Could not create your account. Check the address and try again.",
      },
      { status: 400 }
    );
  }

  const link = data?.properties?.action_link;
  if (!link) {
    console.error(`[signup] no action_link returned for ${email}`);
    return NextResponse.json({ ok: true, emailed: false });
  }

  // The account now exists, so a failed send is not a reason to fail the
  // request. It is a reason to say so: without this the user is left with an
  // account they can never confirm and a sign-in that answers "Email not
  // confirmed" forever. The page offers them a resend instead.
  const mail = signupConfirmEmail(link);
  const emailed = await sendEmail(email, mail.subject, mail.html).catch((err) => {
    console.error(`[signup] confirmation email threw for ${email}:`, err);
    return false;
  });
  if (!emailed) console.error(`[signup] confirmation email not delivered to ${email}`);
  return NextResponse.json({ ok: true, emailed });
}

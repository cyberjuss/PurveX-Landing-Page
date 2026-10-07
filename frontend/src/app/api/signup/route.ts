import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail, signupConfirmEmail } from "@/lib/academy-emails";
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
    return NextResponse.json({ error: "Too many attempts. Wait a minute and try again." }, { status: 429 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: redirectTo ? { redirectTo } : undefined,
  });
  if (error) {
    console.error(`[signup] generateLink failed for ${email}:`, error.message);
    // Supabase answers "User already registered" for an address that exists.
    // Wording it differently is not enough, because the status code answers the
    // same question on its own: a taken address replied 400 where a new one
    // replied 200, so sign-up could still be used to test whether any given
    // person has an account here.
    //
    // So a taken address gets the success response, byte for byte, and the
    // person who actually owns it gets a reset link rather than a second
    // confirmation it has no use for. Someone probing learns nothing; someone
    // who forgot they had signed up gets the mail that helps.
    if (/already|exist|registered/i.test(error.message || "")) {
      const back = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: redirectTo ? { redirectTo } : undefined,
      });
      const link = back.data?.properties?.action_link;
      if (link) {
        const mail = passwordResetEmail(link);
        await sendEmail(email, mail.subject, mail.html).catch(() => false);
      }
      return NextResponse.json({ ok: true, emailed: true });
    }
    return NextResponse.json({ error: "Could not create your account. Check the address and try again." }, { status: 400 });
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

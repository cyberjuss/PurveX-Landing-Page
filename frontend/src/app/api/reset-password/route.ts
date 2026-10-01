import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";
import { passwordResetEmail } from "@/lib/academy-emails";

export const runtime = "nodejs";

// Send the password reset email ourselves, branded like the rest of PurveX,
// instead of Supabase's default template. We generate the recovery link with the
// service role and mail it through Resend. The response is always ok so the page
// never reveals whether an account exists for that email.

export async function POST(request: Request) {
  let body: { email?: unknown; redirectTo?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const redirectTo = typeof body.redirectTo === "string" ? body.redirectTo : undefined;
  if (!email || !supabaseAdmin) return NextResponse.json({ ok: true });

  try {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: redirectTo ? { redirectTo } : undefined,
    });
    const link = data?.properties?.action_link;
    if (!error && link) {
      const mail = passwordResetEmail(link);
      await sendEmail(email, mail.subject, mail.html).catch(() => {});
    }
  } catch {
    // Swallow so the response does not reveal whether the account exists.
  }
  return NextResponse.json({ ok: true });
}

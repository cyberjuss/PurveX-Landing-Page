import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

// Send the password reset email ourselves, branded like the rest of PurveX,
// instead of Supabase's default template. We generate the recovery link with the
// service role and mail it through Resend. The response is always ok so the page
// never reveals whether an account exists for that email.

const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c] ?? c);

function resetEmail(actionLink: string): { subject: string; html: string } {
  const html = `
<h2 style="margin:0 0 12px;font-size:19px;color:#0f172a;">Reset your password</h2>
<p style="margin:0 0 16px;">Someone asked to reset the password for your PurveX account. Use this button within the hour.</p>
<p style="margin:0 0 18px;"><a href="${esc(actionLink)}" style="display:inline-block;background:#6a5cff;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:9px;">Reset your password</a></p>
<p style="margin:0;color:#64748b;font-size:13px;">Did not ask for this? Ignore this email. Your password stays the same.</p>`;
  return { subject: "Reset your PurveX password", html };
}

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
      const mail = resetEmail(link);
      await sendEmail(email, mail.subject, mail.html).catch(() => {});
    }
  } catch {
    // Swallow so the response does not reveal whether the account exists.
  }
  return NextResponse.json({ ok: true });
}

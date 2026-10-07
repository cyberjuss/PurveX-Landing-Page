import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/email";
import { signupConfirmEmail } from "@/lib/academy-emails";
import { mailGuard, safeRedirect } from "@/lib/auth-guard";

export const runtime = "nodejs";

// Send a fresh confirmation link to someone whose signup email never arrived.
// Sign-in answers "Email not confirmed" until they click one, and the original
// link is single-use and expires, so without this route an account whose first
// email was lost is stuck for good.
//
// Like /api/reset-password the response is always ok, so the page cannot be
// used to find out which addresses have accounts.

/** Look up one account by address. The JS admin client has no lookup by email. */
async function findUser(email: string): Promise<{ id: string; confirmed: boolean } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const res = await fetch(
    `${url}/auth/v1/admin/users?filter=${encodeURIComponent(email)}&per_page=2`,
    { headers: { apikey: key, Authorization: `Bearer ${key}` }, cache: "no-store" },
  );
  if (!res.ok) return null;
  const body = (await res.json()) as { users?: { id: string; email?: string; email_confirmed_at?: string | null }[] };
  const row = (body.users ?? []).find((u) => (u.email ?? "").toLowerCase() === email);
  return row ? { id: row.id, confirmed: Boolean(row.email_confirmed_at) } : null;
}

export async function POST(request: Request) {
  let body: { email?: unknown; redirectTo?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }
  const email = String(body.email ?? "").trim().toLowerCase();
  const redirectTo = safeRedirect(request, body.redirectTo);
  if (!email || !supabaseAdmin) return NextResponse.json({ ok: true });
  // Same ok:true as every other outcome here, so the throttle does not become
  // the tell that the rest of the endpoint avoids being.
  if (!mailGuard(request, email)) return NextResponse.json({ ok: true });

  try {
    const user = await findUser(email);
    // Nothing to confirm: either no such account, or they already did it. Say
    // the same thing either way rather than confirming the address exists.
    if (!user || user.confirmed) return NextResponse.json({ ok: true });

    // A magic link is the right shape here. "signup" needs the password back,
    // which we do not have, and clicking a magic link marks the address
    // confirmed, which is exactly what is missing. Their password still works
    // afterwards.
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: redirectTo ? { redirectTo } : undefined,
    });
    const link = data?.properties?.action_link;
    if (error || !link) {
      console.error(`[resend-confirmation] could not generate a link for ${email}:`, error?.message);
      return NextResponse.json({ ok: true });
    }
    const mail = signupConfirmEmail(link);
    const emailed = await sendEmail(email, mail.subject, mail.html).catch(() => false);
    if (!emailed) console.error(`[resend-confirmation] send failed for ${email}`);
  } catch (err) {
    console.error("[resend-confirmation] unexpected failure:", err);
  }
  return NextResponse.json({ ok: true });
}

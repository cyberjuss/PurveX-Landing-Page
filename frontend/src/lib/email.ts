// Minimal Resend wrapper -- plain fetch, no SDK dependency needed for
// something this small. Sign up at resend.com (free tier, no card) and set
// RESEND_API_KEY to enable; without it, sendEmail just logs and returns
// false so callers (e.g. the Stripe webhook) can keep working -- a missing
// notification should never be the reason a payment fails to record.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.NOTIFICATION_FROM_EMAIL || "PurveX <onboarding@resend.dev>";

// Wrap message content in a branded, email-client-safe shell (table layout,
// inline styles) so every email carries the PurveX mark, accent and footer.
// Exported so a preview route can render it in the browser.
export function brandEmail(content: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><meta name="supported-color-schemes" content="light"></head>
  <body style="margin:0;padding:0;background:#f4f5f8;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f8;padding:36px 14px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid #ecedf2;border-radius:18px;box-shadow:0 1px 2px rgba(16,24,40,0.04),0 14px 36px -14px rgba(16,24,40,0.14);overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr><td style="padding:30px 40px 0 40px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="width:40px;vertical-align:middle;"><img src="https://purvex.io/logo.png" width="40" height="40" alt="PurveX" style="display:block;border:0;outline:none;text-decoration:none;border-radius:10px;" /></td>
            <td style="padding-left:12px;font-size:17px;font-weight:700;color:#0f172a;letter-spacing:-0.01em;vertical-align:middle;">PurveX<span style="color:#9aa3b2;font-weight:600;"> Range</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:26px 40px 34px 40px;color:#334155;font-size:15px;line-height:1.6;">${content}</td></tr>
        <tr><td style="padding:22px 40px;border-top:1px solid #eef0f4;color:#9aa3b2;font-size:12px;line-height:1.6;">
          PurveX Range &middot; Hands-on cybersecurity training<br>
          <a href="https://purvex.io" style="color:#6a5cff;text-decoration:none;font-weight:600;">purvex.io</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendEmail(to: string, subject: string, html: string, replyTo?: string): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn(`[email] RESEND_API_KEY not set -- skipped "${subject}" to ${to}`);
    return false;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_ADDRESS, to, subject, html: brandEmail(html), ...(replyTo ? { reply_to: replyTo } : {}) }),
    });
    if (!res.ok) {
      console.error(`[email] Resend API error (${res.status}) sending "${subject}" to ${to}:`, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[email] Failed to send "${subject}" to ${to}:`, err);
    return false;
  }
}

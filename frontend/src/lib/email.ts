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
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f8;padding:40px 14px;">
    <tr><td align="center">
      <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="width:580px;max-width:100%;background:#ffffff;border:1px solid #e8eaf0;border-radius:14px;box-shadow:0 1px 2px rgba(16,24,40,0.04),0 10px 28px -16px rgba(16,24,40,0.16);overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr><td style="background:#0c1020;padding:20px 34px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="width:34px;height:34px;background:#ffffff;border-radius:9px;text-align:center;vertical-align:middle;"><img src="https://purvex.io/logo.png" width="21" height="21" alt="PurveX" style="display:inline-block;vertical-align:middle;border:0;outline:none;text-decoration:none;" /></td>
            <td style="padding-left:12px;font-size:16px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;vertical-align:middle;">PurveX<span style="color:#8b93a7;font-weight:600;"> Range</span></td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:34px 34px 32px 34px;color:#334155;font-size:15px;line-height:1.6;">${content}</td></tr>
        <tr><td style="padding:20px 34px 24px;border-top:1px solid #eef0f4;color:#9aa3b2;font-size:12px;line-height:1.65;">
          <a href="https://purvex.io" style="color:#6a5cff;text-decoration:none;font-weight:600;">purvex.io</a>
          &nbsp;&middot;&nbsp; Hands-on cybersecurity training<br>
          <span style="color:#b2b9c6;">This email was sent by PurveX Range because an account uses this address.</span>
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

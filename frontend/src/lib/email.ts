// Minimal Resend wrapper -- plain fetch, no SDK dependency needed for
// something this small. Sign up at resend.com (free tier, no card) and set
// RESEND_API_KEY to enable; without it, sendEmail just logs and returns
// false so callers (e.g. the Stripe webhook) can keep working -- a missing
// notification should never be the reason a payment fails to record.
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.NOTIFICATION_FROM_EMAIL || "PurveX <onboarding@resend.dev>";

// Wrap message content in a branded, email-client-safe shell (table layout,
// inline styles) so every email carries the PurveX mark, accent and footer.
function brandEmail(content: string): string {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f4f5f7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;background:#ffffff;border:1px solid #e6e8ee;border-radius:12px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
        <tr><td style="height:4px;background:#6a5cff;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:22px 28px 4px 28px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="width:30px;height:30px;background:#6a5cff;border-radius:7px;text-align:center;vertical-align:middle;color:#ffffff;font-weight:800;font-size:16px;">P</td>
            <td style="padding-left:10px;font-size:16px;font-weight:700;color:#0f172a;letter-spacing:-0.01em;">PurveX</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:10px 28px 24px 28px;color:#334155;font-size:14px;line-height:1.6;">${content}</td></tr>
        <tr><td style="padding:16px 28px;border-top:1px solid #eef0f4;color:#94a3b8;font-size:12px;line-height:1.5;">
          PurveX &middot; Hands-on cybersecurity training<br>
          <a href="https://purvex.io" style="color:#6a5cff;text-decoration:none;">purvex.io</a>
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

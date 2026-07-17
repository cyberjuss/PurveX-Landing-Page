"""
Email HTML templates for PurveX.

All templates use inline styles for maximum email client compatibility.
The design is clean and minimal — security-operations teams get enough
noisy emails from their SIEMs already.
"""

_BASE_STYLE = """
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f5f7; margin: 0; padding: 0; }
  .container { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .header { background: #0d152f; padding: 28px 32px; text-align: center; }
  .header h1 { color: #ffffff; font-size: 22px; margin: 0; font-weight: 600; letter-spacing: -0.3px; }
  .body { padding: 32px; color: #1a1a2e; line-height: 1.6; font-size: 15px; }
  .body p { margin: 0 0 16px 0; }
  .cta { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0 16px 0; }
  .footer { padding: 20px 32px; background: #f8f9fa; color: #6b7280; font-size: 13px; text-align: center; border-top: 1px solid #e5e7eb; }
  .code { background: #f0f4ff; border: 1px solid #dbeafe; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 14px; letter-spacing: 1px; text-align: center; margin: 12px 0; }
  .muted { color: #6b7280; font-size: 13px; }
</style>
"""


def password_reset_email(reset_url: str, username: str) -> str:
    """Password reset email — sent when a user requests a password reset."""
    return f"""<!DOCTYPE html>
<html><head>{_BASE_STYLE}</head>
<body>
<div class="container">
  <div class="header"><h1>PurveX</h1></div>
  <div class="body">
    <p>Hi {username},</p>
    <p>We received a request to reset your password. Click the button below to choose a new one:</p>
    <p style="text-align:center;">
      <a href="{reset_url}" class="cta">Reset Password</a>
    </p>
    <p class="muted">This link expires in 30 minutes. If you didn't request this, you can safely ignore this email — your password won't change.</p>
    <p class="muted">If the button doesn't work, copy and paste this URL into your browser:</p>
    <div class="code">{reset_url}</div>
  </div>
  <div class="footer">
    <p>PurveX &mdash; Detection Validation Platform</p>
    <p class="muted">This is an automated message. Please do not reply.</p>
  </div>
</div>
</body></html>"""


def welcome_email(username: str, login_url: str) -> str:
    """Welcome email — sent when a new user is created via invitation."""
    return f"""<!DOCTYPE html>
<html><head>{_BASE_STYLE}</head>
<body>
<div class="container">
  <div class="header"><h1>Welcome to PurveX</h1></div>
  <div class="body">
    <p>Hi {username},</p>
    <p>Your PurveX account has been created. PurveX helps your detection engineering team validate that security detections actually work — before an attacker tests them for you.</p>
    <p><strong>Why this matters for your CISO:</strong> Every untested detection is a gap in your defense posture. PurveX gives your team measurable proof that detections fire when they should, in the environments that matter.</p>
    <p style="text-align:center;">
      <a href="{login_url}" class="cta">Sign In to PurveX</a>
    </p>
    <p class="muted">If you have questions, reach out to your PurveX admin or contact us at support@purvex.com.</p>
  </div>
  <div class="footer">
    <p>PurveX &mdash; Detection Validation Platform</p>
  </div>
</div>
</body></html>"""


def two_factor_backup_email(username: str, backup_codes: list[str]) -> str:
    """2FA backup codes — sent when a user enables 2FA."""
    codes_html = "<br>".join(f"<code>{code}</code>" for code in backup_codes)
    return f"""<!DOCTYPE html>
<html><head>{_BASE_STYLE}</head>
<body>
<div class="container">
  <div class="header"><h1>PurveX — 2FA Backup Codes</h1></div>
  <div class="body">
    <p>Hi {username},</p>
    <p>You've enabled two-factor authentication on your PurveX account. Save these backup codes somewhere secure — each code can only be used once:</p>
    <div class="code">{codes_html}</div>
    <p class="muted"><strong>Important:</strong> If you lose access to your authenticator app and these codes, you will need an administrator to reset your 2FA.</p>
  </div>
  <div class="footer">
    <p>PurveX &mdash; Detection Validation Platform</p>
    <p class="muted">This is an automated message. Please do not reply.</p>
  </div>
</div>
</body></html>"""


def data_export_ready_email(username: str, download_url: str) -> str:
    """GDPR data export ready notification."""
    return f"""<!DOCTYPE html>
<html><head>{_BASE_STYLE}</head>
<body>
<div class="container">
  <div class="header"><h1>PurveX — Data Export Ready</h1></div>
  <div class="body">
    <p>Hi {username},</p>
    <p>Your data export is ready for download. This file contains all personal data associated with your PurveX account.</p>
    <p style="text-align:center;">
      <a href="{download_url}" class="cta">Download Export</a>
    </p>
    <p class="muted">This download link expires in 24 hours. After that, you'll need to request a new export.</p>
  </div>
  <div class="footer">
    <p>PurveX &mdash; Detection Validation Platform</p>
  </div>
</div>
</body></html>"""


def waitlist_confirmation_email(email: str) -> str:
    """Waitlist confirmation email for public landing-page signups."""
    return f"""<!DOCTYPE html>
<html><head>{_BASE_STYLE}</head>
<body>
<div class="container">
  <div class="header"><h1>Thanks for joining the PurveX waitlist</h1></div>
  <div class="body">
    <p>Hi {email},</p>
    <p>Thanks for your interest in PurveX.</p>
    <p>You're on the list, and we'll be in touch as soon as access opens.</p>
    <p>PurveX helps security teams validate whether detections actually fire in the environments that matter, so coverage is measured with evidence instead of assumptions.</p>
    <p class="muted">If your team is actively evaluating detection validation, you can reply through your usual PurveX contact path and we can prioritize the conversation.</p>
  </div>
  <div class="footer">
    <p>PurveX &mdash; Detection Validation Platform</p>
    <p class="muted">This is an automated message. Please do not reply.</p>
  </div>
</div>
</body></html>"""


def waitlist_internal_notification_email(email: str, source: str) -> str:
    """Internal notification email when someone joins the public waitlist."""
    return f"""<!DOCTYPE html>
<html><head>{_BASE_STYLE}</head>
<body>
<div class="container">
  <div class="header"><h1>New waitlist signup</h1></div>
  <div class="body">
    <p>A new waitlist entry was created.</p>
    <div class="code">Email: {email}<br/>Source: {source}</div>
  </div>
  <div class="footer">
    <p>PurveX</p>
  </div>
</div>
</body></html>"""

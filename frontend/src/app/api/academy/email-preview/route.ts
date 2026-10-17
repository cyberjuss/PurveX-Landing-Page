import { brandEmail } from "@/lib/email";
import {
  dormantNudgeEmail,
  instructorDigestEmail,
  instructorSetupEmail,
  passwordResetEmail,
  signupConfirmEmail,
  studentJoinedEmail,
  studentMilestoneEmail,
  studentNudgeEmail,
  studentWelcomeEmail,
  trialEndingEmail,
} from "@/lib/academy-emails";

export const runtime = "nodejs";

// Render any email template in the browser with sample data, so the design can
// be reviewed without sending. Visit /api/academy/email-preview?t=welcome
// with any key from the `templates` map below. Sample data only, nothing real.
export async function GET(request: Request) {
  // Open in development; elsewhere only with the cron secret, so production
  // does not publish every template the site can send.
  if (process.env.NODE_ENV === "production") {
    const secret = process.env.CRON_SECRET?.trim();
    if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
      return new Response("Not found", { status: 404 });
    }
  }
  const url = new URL(request.url);
  const t = url.searchParams.get("t") ?? "welcome";
  const o = url.origin;
  const cls = { id: "sample", code: "GOVTECH-M4PONI", name: "Govtech Academy", instructorEmail: "instructor@school.edu", createdAt: new Date().toISOString() };
  const student = { name: "Justin Duru", email: "justin@example.com" };

  // One entry per template. Add a template here and ?t=<key> renders it.
  const templates: Record<string, () => { subject: string; html: string }> = {
    welcome: () => studentWelcomeEmail(student, cls, o),
    setup: () => instructorSetupEmail(cls, o),
    nudge: () => studentNudgeEmail(student, o),
    dormant: () => dormantNudgeEmail(student, true, o),
    fresh: () => dormantNudgeEmail(student, false, o),
    milestone: () => studentMilestoneEmail(student, "the Sign-in Log lab", o),
    joined: () => studentJoinedEmail("Govtech Academy", "Justin Duru", o),
    signup: () => signupConfirmEmail(`${o}/academy`),
    reset: () => passwordResetEmail(`${o}/reset-password`),
    trial: () => trialEndingEmail(student, new Date(Date.now() + 36 * 3_600_000), o),
    digest: () =>
      instructorDigestEmail(
        {
          className: "Govtech Academy",
          students: 12,
          active: 8,
          stuck: 2,
          avgReadiness: 71,
          attention: [
            { name: "Priya Nair", reason: "Stuck on Lockout triage", tone: "bad" },
            { name: "Devon Brooks", reason: "Quiet 9 days", tone: "warn" },
            { name: "Sam Whitfield", reason: "Not started", tone: "none" },
          ],
        },
        o
      ),
  };

  const built = (templates[t] ?? templates.welcome)();

  return new Response(brandEmail(built.html), { headers: { "content-type": "text/html; charset=utf-8" } });
}

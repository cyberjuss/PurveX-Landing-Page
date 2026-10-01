import { brandEmail } from "@/lib/email";
import { instructorDigestEmail, instructorSetupEmail, passwordResetEmail, studentNudgeEmail, studentWelcomeEmail } from "@/lib/academy-emails";

export const runtime = "nodejs";

// Render any email template in the browser with sample data, so the design can
// be reviewed without sending. Visit /api/academy/email-preview?t=welcome
// (welcome | setup | nudge | digest | reset). Sample data only, nothing real.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const t = url.searchParams.get("t") ?? "welcome";
  const o = url.origin;
  const cls = { id: "sample", code: "GOVTECH-M4PONI", name: "Govtech Academy", instructorEmail: "instructor@school.edu", createdAt: new Date().toISOString() };
  const student = { name: "Justin Duru", email: "justin@example.com" };

  const built =
    t === "setup"
      ? instructorSetupEmail(cls, o)
      : t === "nudge"
        ? studentNudgeEmail(student, o)
        : t === "reset"
          ? passwordResetEmail(`${o}/reset-password`)
          : t === "digest"
            ? instructorDigestEmail(
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
              )
            : studentWelcomeEmail(student, cls, o);

  return new Response(brandEmail(built.html), { headers: { "content-type": "text/html; charset=utf-8" } });
}

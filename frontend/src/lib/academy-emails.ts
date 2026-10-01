import "server-only";
import type { AcademyClass } from "@/lib/academy-classes";

// Academy email templates. One voice: short, plain, no dashes, few commas, no
// hype. Each returns { subject, html }; the html is inner content that sendEmail
// wraps in the branded shell (see lib/email.ts). The first node is a hidden
// preheader (inbox preview). Student links point at /range.

type Built = { subject: string; html: string };
type Named = { name: string | null; email?: string | null };

const INK = "#0f172a";
const INK2 = "#334155";
const MUTED = "#8a94a6";
const LINE = "#edeff3";
const ACCENT = "#6a5cff";
const TONE: Record<string, string> = { good: "#0f9f6e", warn: "#c4820e", bad: "#d93a3f", none: "#8a94a6" };

const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c] ?? c);
const base = (o: string) => o.replace(/\/$/, "");
const first = (name: string | null) => name?.trim().split(/\s+/)[0] || "there";

// Simple stroke icons. Apple Mail, Outlook and mobile render the SVG; Gmail
// strips it and the soft accent tile remains, so the header still reads clean.
const ICON: Record<string, string> = {
  welcome: '<path d="M5 12l4 4L19 7"/>',
  rocket: '<path d="M12 3c3 1 5 4 5 8l-3 3-4 0-3-3c0-4 2-7 5-8z"/><path d="M9 16l-3 3M15 16l3 3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  chart: '<path d="M4 20h16M7 20v-7M12 20V6M17 20v-4"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l2 2"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M5 5H3v2a3 3 0 0 0 3 3M19 5h2v2a3 3 0 0 1-3 3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
};

// A small accent line icon above the heading. The dark header carries the brand,
// so the body stays light: just the icon, no tile. Gmail may drop the SVG, which
// only leaves a little space.
const badge = (icon: keyof typeof ICON) =>
  `<div style="margin:0 0 14px;line-height:0;"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${ACCENT}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON[icon]}</svg></div>`;

const h = (text: string) => `<h1 style="margin:0 0 12px;font-size:23px;line-height:1.25;color:${INK};font-weight:700;letter-spacing:-0.02em;">${esc(text)}</h1>`;
const p = (html: string) => `<p style="margin:0 0 18px;font-size:15px;line-height:1.65;color:${INK2};">${html}</p>`;
const note = (html: string) => `<p style="margin:20px 0 0;font-size:13px;line-height:1.55;color:${MUTED};">${html}</p>`;
const mono = (text: string) => `<span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:${INK2};word-break:break-all;">${esc(text)}</span>`;
const pre = (text: string) => `<span style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(text)}</span>`;
const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 4px;"><tr><td style="border-radius:11px;background:${ACCENT};box-shadow:0 2px 8px rgba(106,92,255,0.32);">` +
  `<a href="${href}" style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.01em;">${esc(label)}</a>` +
  `</td></tr></table>`;
const linkRow = (label: string, value: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:4px 0 0;background:#f7f8fa;border:1px solid ${LINE};border-radius:10px;"><tr>` +
  `<td style="padding:12px 14px;font-size:12.5px;">${label ? `<span style="display:block;color:${MUTED};margin-bottom:3px;">${esc(label)}</span>` : ""}${mono(value)}</td></tr></table>`;

/** Sent to the instructor when their class is created. */
export function instructorSetupEmail(cls: AcademyClass, o: string): Built {
  const url = base(o);
  const join = `${url}/range/join?code=${encodeURIComponent(cls.code)}`;
  const html =
    pre(`Your dashboard and the link to invite students to ${cls.name}.`) +
    badge("key") +
    h(`Your class ${cls.name} is live`) +
    p("There are two quick steps to get your class running.") +
    p("<strong>First, see your class.</strong> Open your dashboard and sign in with this email to follow every student's progress in one place.") +
    button(`${url}/range/instructor`, "Open your dashboard") +
    p('<strong style="display:block;margin-top:18px;">Second, add your students.</strong> Share the link below with them. They open it, sign in, and land straight in your class.') +
    linkRow("Student link", join) +
    note(`If a student needs to type a code instead, the passcode is <strong style="color:${INK2};">${esc(cls.code)}</strong>.`);
  return { subject: `Your class ${cls.name} is live on PurveX Range`, html };
}

/** Sent to a student the first time they join a class. */
export function studentWelcomeEmail(student: Named, cls: AcademyClass, o: string): Built {
  const url = base(o);
  const html =
    pre("Your first lab is ready.") +
    badge("rocket") +
    h(`Welcome to ${cls.name}`) +
    p(`Hi ${esc(first(student.name))}, welcome to ${esc(cls.name)}. Your training is ready, with hands-on labs that are graded against a live environment, so you build the skills the job actually asks for rather than test-taking ones.`) +
    button(`${url}/range`, "Start training") +
    note("You can sign in with this email any time and pick up where you left off.");
  return { subject: `Welcome to ${cls.name} on PurveX Range`, html };
}

/** Retention: a student who has gone quiet. */
export function studentNudgeEmail(student: Named, o: string): Built {
  const url = base(o);
  const html =
    pre("Your lab is where you left it.") +
    badge("clock") +
    h(`Pick up where you left off, ${first(student.name)}`) +
    p("It has been about a week since your last session, and your lab is exactly where you left it. Ten minutes is enough to get moving again and keep your momentum going.") +
    button(`${url}/range`, "Jump back in") +
    note("Even a single daily drill keeps your streak alive.");
  return { subject: "Your lab is waiting", html };
}

export type DigestInput = {
  className: string;
  students: number;
  active: number;
  stuck: number;
  avgReadiness: number | null;
  attention: { name: string; reason: string; tone: keyof typeof TONE }[];
};

/** Retention: a weekly class digest for the instructor. */
export function instructorDigestEmail(d: DigestInput, o: string): Built {
  const url = base(o);
  const stat = (label: string, value: string, color = INK) =>
    `<td width="33%" style="padding:16px 12px;text-align:center;border-right:1px solid ${LINE};">` +
    `<div style="font-size:28px;font-weight:700;line-height:1;color:${color};">${esc(value)}</div>` +
    `<div style="margin-top:7px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">${esc(label)}</div></td>`;
  const stats =
    `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:4px 0 22px;background:#f7f8fa;border:1px solid ${LINE};border-radius:14px;"><tr>` +
    stat("Active", String(d.active)) +
    stat("Stuck", String(d.stuck), d.stuck ? TONE.warn : INK) +
    `<td width="34%" style="padding:16px 12px;text-align:center;">` +
    `<div style="font-size:28px;font-weight:700;line-height:1;color:${INK};">${d.avgReadiness === null ? "—" : esc(String(d.avgReadiness))}</div>` +
    `<div style="margin-top:7px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">Avg readiness</div></td>` +
    `</tr></table>`;
  const list = d.attention.length
    ? `<p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:${MUTED};">Needs a look</p>` +
      d.attention
        .slice(0, 8)
        .map(
          (a) =>
            `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 2px;"><tr>` +
            `<td style="padding:9px 0;border-bottom:1px solid ${LINE};font-size:14px;color:${INK};font-weight:600;">${esc(a.name)}</td>` +
            `<td align="right" style="padding:9px 0;border-bottom:1px solid ${LINE};font-size:13px;color:${TONE[a.tone] ?? MUTED};">${esc(a.reason)}</td></tr></table>`
        )
        .join("")
    : `<p style="margin:0;font-size:14px;color:${TONE.good};font-weight:600;">Everyone is moving. Nobody is stuck or quiet.</p>`;
  const html =
    pre(`${d.className}: ${d.active} active, ${d.stuck} stuck this week.`) +
    badge("chart") +
    h(`${d.className} this week`) +
    p(`Here is how your class is doing. You have ${d.students} student${d.students === 1 ? "" : "s"}, with ${d.active} active this week and ${d.attention.length} who could use a look.`) +
    stats +
    list +
    `<div style="height:20px;"></div>` +
    button(`${url}/range/instructor`, "Open your class") +
    note("You get this weekly for each class you run.");
  return { subject: `${d.className}: your weekly class digest`, html };
}

/** Retention: a student passed a lab or cleared a milestone. */
export function studentMilestoneEmail(student: Named, title: string, o: string): Built {
  const url = base(o);
  const html =
    pre(`Nice work. You cleared ${title}.`) +
    badge("trophy") +
    h(`Nice work, ${first(student.name)}`) +
    p(`You passed ${esc(title)}, which is real hands-on evidence of the skill rather than a quiz score.`) +
    button(`${url}/range`, "Keep going") +
    note("Every lab you clear adds to your proof profile.");
  return { subject: `Nice work on ${title}`, html };
}

/** Sent to the instructor when a new student joins their class. */
export function studentJoinedEmail(className: string, studentName: string, o: string): Built {
  const url = base(o);
  const html =
    pre(`${studentName} joined ${className}.`) +
    badge("user") +
    h(`${studentName} joined ${className}`) +
    p(`${esc(studentName)} just joined your class. Reaching out early to welcome them tends to help new students get started and stay engaged.`) +
    button(`${url}/range/instructor`, "Open your class") +
    note("You can follow their progress any time on your dashboard.");
  return { subject: `${studentName} joined ${className}`, html };
}

/** Standalone signup confirmation (used by /api/academy/signup). */
export function signupConfirmEmail(actionLink: string): Built {
  const html =
    pre("Confirm your email to finish setting up.") +
    badge("mail") +
    h("Confirm your email") +
    p("Thanks for signing up. Confirm your email address with the button below to finish setting up your PurveX account.") +
    button(actionLink, "Confirm email") +
    note("If you did not sign up, you can safely ignore this email.");
  return { subject: "Confirm your PurveX email", html };
}

/** Standalone password reset content (used by /api/reset-password). */
export function passwordResetEmail(actionLink: string): Built {
  const html =
    pre("Reset your password. The link lasts an hour.") +
    badge("lock") +
    h("Reset your password") +
    p("We received a request to reset the password for your PurveX account. Use the button below within the hour to choose a new one.") +
    button(actionLink, "Reset your password") +
    note("If you did not request this, you can ignore this email and your password will stay the same.");
  return { subject: "Reset your PurveX password", html };
}

import "server-only";
import type { AcademyClass } from "@/lib/academy-classes";

// Academy email templates. One voice: short, plain, no dashes, few commas, no
// hype. Each returns { subject, html }; the html is inner content that sendEmail
// wraps in the branded shell (see lib/email.ts). The first node is a hidden
// preheader, which sets the inbox preview line. Student links point at /range so
// nothing we hand a student says academy.

type Built = { subject: string; html: string };
type Named = { name: string | null; email?: string | null };

const INK = "#0f172a";
const INK2 = "#334155";
const MUTED = "#64748b";
const LINE = "#e9ebf0";
const ACCENT = "#6a5cff";
const TONE: Record<string, string> = { good: "#0f9f6e", warn: "#c4820e", bad: "#d93a3f", none: "#64748b" };

const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c] ?? c);
const base = (o: string) => o.replace(/\/$/, "");
const first = (name: string | null) => name?.trim().split(/\s+/)[0] || "there";

const pre = (text: string) => `<span style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(text)}</span>`;
const h = (text: string) => `<h1 style="margin:0 0 14px;font-size:21px;line-height:1.3;color:${INK};font-weight:700;letter-spacing:-0.015em;">${esc(text)}</h1>`;
const p = (html: string) => `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${INK2};">${html}</p>`;
const note = (html: string) => `<p style="margin:18px 0 0;font-size:13px;line-height:1.55;color:${MUTED};">${html}</p>`;
const mono = (text: string) => `<span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:${INK2};word-break:break-all;">${esc(text)}</span>`;
const button = (href: string, label: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:4px 0 18px;"><tr><td style="border-radius:10px;background:${ACCENT};">` +
  `<a href="${href}" style="display:inline-block;padding:13px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">${esc(label)}</a>` +
  `</td></tr></table>`;

/** Sent to the instructor when their class is created. */
export function instructorSetupEmail(cls: AcademyClass, o: string): Built {
  const url = base(o);
  const join = `${url}/range/join?code=${encodeURIComponent(cls.code)}`;
  const html =
    pre(`Your dashboard and the link to invite students to ${cls.name}.`) +
    h(`Your class ${cls.name} is live`) +
    p("Two steps and you are running.") +
    p("<strong>1. See your class.</strong> Open your dashboard and sign in with this email.") +
    button(`${url}/range/instructor`, "Open your dashboard") +
    p("<strong>2. Add students.</strong> Send them this link. They open it and sign in.") +
    `<p style="margin:0 0 4px;font-size:13px;color:${MUTED};">${mono(join)}</p>` +
    note(`Passcode fallback <strong style="color:${INK2};">${esc(cls.code)}</strong>.`);
  return { subject: `Your class ${cls.name} is live on PurveX Range`, html };
}

/** Sent to a student the first time they join a class. */
export function studentWelcomeEmail(student: Named, cls: AcademyClass, o: string): Built {
  const url = base(o);
  const html =
    pre("Your first lab is ready.") +
    h(`Welcome to ${cls.name}`) +
    p(`Hi ${esc(first(student.name))}. You are in. Your training is ready. Real labs graded on a live system. Not multiple choice.`) +
    button(`${url}/range`, "Start training") +
    note("Use this email to sign in any time and continue where you stopped.");
  return { subject: `Welcome to ${cls.name} on PurveX Range`, html };
}

/** Retention: a student who has gone quiet. */
export function studentNudgeEmail(student: Named, o: string): Built {
  const url = base(o);
  const html =
    pre("Your lab is where you left it.") +
    h(`Your lab is waiting, ${first(student.name)}`) +
    p("You have not been back in a week. Ten minutes gets you moving again.") +
    button(`${url}/range`, "Jump back in") +
    note("One daily drill still counts. Short sessions keep your streak alive.");
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
    `<td style="padding:0 18px 0 0;vertical-align:top;">` +
    `<div style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">${esc(label)}</div>` +
    `<div style="margin-top:6px;font-size:30px;font-weight:700;line-height:1;color:${color};">${esc(value)}</div></td>`;
  const stats =
    `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 20px;"><tr>` +
    stat("Active", String(d.active)) +
    stat("Stuck", String(d.stuck), d.stuck ? TONE.warn : INK) +
    stat("Avg readiness", d.avgReadiness === null ? "—" : String(d.avgReadiness)) +
    `</tr></table>`;
  const list = d.attention.length
    ? `<p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${MUTED};">Needs a look</p>` +
      d.attention
        .slice(0, 8)
        .map(
          (a) =>
            `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 8px;"><tr>` +
            `<td style="font-size:14px;color:${INK};font-weight:600;">${esc(a.name)}</td>` +
            `<td align="right" style="font-size:13px;color:${TONE[a.tone] ?? MUTED};">${esc(a.reason)}</td></tr></table>`
        )
        .join("")
    : `<p style="margin:0;font-size:14px;color:${TONE.good};">Everyone is moving. Nobody is stuck or quiet.</p>`;
  const html =
    pre(`${d.className}: ${d.active} active, ${d.stuck} stuck this week.`) +
    h(`${d.className} this week`) +
    p(`${d.students} student${d.students === 1 ? "" : "s"}. ${d.active} active. ${d.attention.length} need a look.`) +
    stats +
    `<div style="height:1px;background:${LINE};margin:0 0 18px;"></div>` +
    list +
    `<div style="height:18px;"></div>` +
    button(`${url}/range/instructor`, "Open your class") +
    note("You get this weekly for each class you run.");
  return { subject: `${d.className}: your weekly class digest`, html };
}

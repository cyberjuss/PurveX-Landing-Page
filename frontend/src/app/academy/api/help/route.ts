import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { canUseHostedLab, hostedLabStatus } from "@/lib/academy-hosted";
import { getAcademyStudent } from "@/lib/academy-student";
import { countHelpRequestsSince, loadHostedLab, loadLabLive, loadLabState, saveHelpRequest } from "@/lib/academy-store";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

// A student asks a person for help. Range attaches what support needs to see
// (lab sync, hosted lab state, the page they were on), so the student only has
// to say what went wrong. Emailed to SUPPORT_EMAIL with the student as reply-to.
const SUPPORT_EMAIL = (process.env.SUPPORT_EMAIL || "justinduru@purvex.io").trim();
const TOPICS = {
  lab: "My lab will not start or open",
  sync: "My lab is not syncing",
  check: "A check marked my work wrong",
  account: "Sign-in or account",
  other: "Something else",
} as const;
type Topic = keyof typeof TOPICS;
const PER_DAY = 5;

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function ago(iso: string | null | undefined): string {
  if (!iso) return "never";
  const min = Math.round((Date.now() - Date.parse(iso)) / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  if (min < 48 * 60) return `${Math.round(min / 60)} h ago`;
  return `${Math.round(min / 1440)} days ago`;
}

export async function POST(request: Request) {
  if (!(await isAcademyUnlocked())) return NextResponse.json({ error: "Locked" }, { status: 401 });
  const student = await getAcademyStudent(request);
  if (!student) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  let body: { topic?: unknown; message?: unknown; page?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const topic: Topic = typeof body.topic === "string" && body.topic in TOPICS ? (body.topic as Topic) : "other";
  const message = typeof body.message === "string" ? body.message.replace(/\u0000/g, "").trim().slice(0, 2000) : "";
  const page = typeof body.page === "string" && body.page.startsWith("/") ? body.page.slice(0, 200) : "";
  if (message.length < 5) return NextResponse.json({ error: "Say in a few words what went wrong." }, { status: 400 });

  if ((await countHelpRequestsSince(student.id, new Date(Date.now() - 86_400_000))) >= PER_DAY) {
    return NextResponse.json({ error: `You have sent ${PER_DAY} requests today. We have them and will reply by email.` }, { status: 429 });
  }

  const [lab, live, hostedRow] = await Promise.all([
    loadLabState(student.id).catch(() => null),
    loadLabLive(student.id).catch(() => null),
    loadHostedLab(student.id).catch(() => null),
  ]);
  const hosted = canUseHostedLab(student.email) ? await hostedLabStatus(student.id).catch(() => null) : null;
  const context = {
    page,
    labSynced: lab?.uploadedAt ?? null,
    labCounts: lab ? { users: lab.snapshot.users.length, groups: lab.snapshot.groups.length, computers: lab.snapshot.computers.length } : null,
    labVerified: live?.verifiedAt ?? null,
    hostedAllowed: Boolean(hosted),
    hostedState: hosted?.state ?? null,
    hostedStopAt: hosted?.stopAt ?? null,
    hostedInstance: hostedRow?.instanceId ?? null,
    userAgent: (request.headers.get("user-agent") || "").slice(0, 200),
  };

  const who = student.name ? `${student.name} (${student.email ?? "no email"})` : (student.email ?? student.id);
  const rows: [string, string][] = [
    ["Student", who],
    ["User ID", student.id],
    ["Page", page || "unknown"],
    ["Last lab sync", lab ? `${ago(lab.uploadedAt)} (${lab.uploadedAt})` : "never"],
    ["Lab objects", context.labCounts ? `${context.labCounts.users} users, ${context.labCounts.groups} groups, ${context.labCounts.computers} computers` : "none"],
    ["Lab verified", live?.verifiedAt ? ago(live.verifiedAt) : "no"],
    ["Hosted lab", hosted ? `${hosted.state}${hosted.stopAt ? `, stops ${hosted.stopAt}` : ""}${hostedRow ? `, ${hostedRow.instanceId}` : ""}` : "not enabled"],
    ["Browser", context.userAgent || "unknown"],
  ];
  const html = `
    <p><strong>${esc(TOPICS[topic])}</strong></p>
    <p style="white-space:pre-wrap">${esc(message)}</p>
    <table cellpadding="6" style="border-collapse:collapse;font-size:13px">
      ${rows.map(([k, v]) => `<tr><td style="color:#64748b">${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}
    </table>
    <p style="color:#64748b;font-size:12px">Reply to this email to answer the student.</p>`;

  const emailed = await sendEmail(SUPPORT_EMAIL, `Range help: ${TOPICS[topic]} (${student.email ?? student.id})`, html, student.email ?? undefined);
  await saveHelpRequest(student.id, { topic, message, context, emailed });

  if (student.email) {
    // Awaited: a serverless function can stop as soon as it responds.
    await sendEmail(
      student.email,
      "We got your message",
      `<p>Thanks for writing. A person on the PurveX team reads every message and will reply to this address within one business day.</p>
       <p><strong>${esc(TOPICS[topic])}</strong></p>
       <p style="white-space:pre-wrap">${esc(message)}</p>`
    );
  }

  return NextResponse.json({ ok: true });
}

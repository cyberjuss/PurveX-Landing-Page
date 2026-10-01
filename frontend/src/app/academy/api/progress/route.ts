import { NextResponse } from "next/server";
import { clearClassCookie, isAcademyUnlocked, readClassCookie } from "@/lib/academy-auth";
import { findClassByCode, joinClass, type AcademyClass } from "@/lib/academy-classes";
import { MISSION_SKILLS, sanitizeResults, type Results } from "@/lib/academy-score";
import { loadProgress, saveProgress } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c] ?? c);

/** Welcome a student the first time they join a class: who they're with, and where to start. */
async function welcomeStudent(student: { email: string | null; name: string | null }, cls: AcademyClass, origin: string): Promise<boolean> {
  if (!student.email) return false;
  const link = `${origin}/academy`;
  const first = student.name?.trim().split(/\s+/)[0] || "there";
  const html = `
<h2 style="margin:0 0 12px;font-size:18px;color:#0f172a;">Welcome to ${esc(cls.name)}</h2>
<p style="margin:0 0 14px;">Hi ${esc(first)}, you're in. Your hands-on cybersecurity training is ready — real labs, graded against a live environment, not multiple choice.</p>
<p style="margin:0 0 14px;"><a href="${link}" style="display:inline-block;background:#6a5cff;color:#ffffff;text-decoration:none;font-weight:600;padding:11px 18px;border-radius:8px;">Open PurveX Range</a></p>
<p style="margin:0;color:#64748b;font-size:13px;">Sign in with this email any time to pick up where you left off.</p>`;
  return sendEmail(student.email, `You're in — ${cls.name} on PurveX Range`, html);
}

export async function GET(request: Request) {
  if (!(await isAcademyUnlocked())) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }
  const student = await getAcademyStudent(request);
  if (!student) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  // Unlocked with a class code: join that class now that we know who this is.
  const code = await readClassCookie();
  if (code) {
    const cls = await findClassByCode(code);
    if (cls) {
      const firstJoin = await joinClass(cls.id, student);
      if (firstJoin) await welcomeStudent(student, cls, new URL(request.url).origin).catch(() => {});
    }
    await clearClassCookie();
  }
  return NextResponse.json({ results: await loadProgress(student.id) });
}

export async function PUT(request: Request) {
  if (!(await isAcademyUnlocked())) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }
  const student = await getAcademyStudent(request);
  if (!student) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const body = payload as { results?: unknown; reset?: unknown };
  const incoming = sanitizeResults(body.results);
  const resetAll = body.reset === "all";
  const resetIds = new Set(Array.isArray(body.reset) ? body.reset.filter((v): v is string => typeof v === "string") : []);
  const wiped = (id: string) => resetAll || resetIds.has(id);

  // Solves, tries and lab checks come from the server alone (mission-answer
  // and mission-check). A reset clears a mission but keeps what the lab confirmed.
  const saved = await loadProgress(student.id);
  const results: Results = {};
  for (const [id, row] of Object.entries(saved)) {
    if (!(id in MISSION_SKILLS)) continue;
    if (!wiped(id)) results[id] = { ...row };
    else if (row.labOk) results[id] = { solved: false, wrong: 0, hint: false, labOk: true, ...(row.at ? { at: row.at } : {}) };
  }
  // The browser may add what only lowers a score: a hint used, a mission skipped.
  for (const [id, row] of Object.entries(incoming)) {
    if (!(id in MISSION_SKILLS) || wiped(id)) continue;
    const cur = results[id] ?? { solved: false, wrong: 0, hint: false };
    const next = { ...cur, hint: cur.hint || row.hint };
    if (row.flagged && !cur.solved) next.flagged = true;
    if (!cur.solved && row.at && (!cur.at || row.at > cur.at)) next.at = row.at;
    results[id] = next;
  }
  // Browser labs grade in the page and show their answers after each check, so a pass is completion, not proof.
  if (!resetAll) for (const [id, row] of Object.entries(saved)) if (!(id in MISSION_SKILLS)) results[id] = row;
  for (const [id, row] of Object.entries(incoming)) if (!(id in MISSION_SKILLS)) results[id] = row;

  await saveProgress(student.id, student.email, results);
  return NextResponse.json({ ok: true, results });
}

import { NextResponse } from "next/server";
import { clearClassCookie, isAcademyUnlocked, readClassCookie } from "@/lib/academy-auth";
import { findClassByCode, joinClass } from "@/lib/academy-classes";
import { LAB_PASS_IDS, MISSION_SKILLS, sanitizeResults, type Results } from "@/lib/academy-score";
import { loadProgress, saveProgress } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";
import { markEmailOnce } from "@/lib/academy-email-log";
import { sendEmail } from "@/lib/email";
import { studentJoinedEmail, studentMilestoneEmail, studentWelcomeEmail } from "@/lib/academy-emails";

export const runtime = "nodejs";

const LAB_NAME: Record<string, string> = {
  "lab-signin-log": "the Sign-in Log lab",
  "lab-effective-access": "the Effective Access lab",
  "lab-risk-triage": "the Risk Triage lab",
  "lab-password-table": "the Password Table lab",
  "lab-hash-verify": "the Hash Verify lab",
};

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
      if (firstJoin) {
        const origin = new URL(request.url).origin;
        if (student.email) {
          const welcome = studentWelcomeEmail(student, cls, origin);
          await sendEmail(student.email, welcome.subject, welcome.html).catch(() => {});
        }
        // Tell the instructor someone joined, so they can engage early.
        const who = student.name || student.email?.split("@")[0] || "A new student";
        const joined = studentJoinedEmail(cls.name, who, origin);
        await sendEmail(cls.instructorEmail, joined.subject, joined.html).catch(() => {});
      }
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
  // A lab's first finished score is the one that counts. A later save can add a pass, never change the score.
  for (const [id, row] of Object.entries(incoming)) {
    if (id in MISSION_SKILLS) continue;
    const cur = results[id];
    results[id] = cur ? { ...cur, solved: cur.solved || row.solved, ...(cur.pts === undefined && row.pts !== undefined ? { pts: row.pts } : {}) } : row;
  }

  await saveProgress(student.id, student.email, results);

  // Milestone: a lab passed for the first time. markEmailOnce keeps it to one
  // send ever, even though the browser saves progress often.
  if (student.email) {
    const origin = new URL(request.url).origin;
    for (const id of LAB_PASS_IDS) {
      if (results[id]?.solved && !saved[id]?.solved && LAB_NAME[id]) {
        if (await markEmailOnce(student.id, `lab:${id}`)) {
          const mail = studentMilestoneEmail(student, LAB_NAME[id], origin);
          await sendEmail(student.email, mail.subject, mail.html).catch(() => {});
        }
      }
    }
  }

  return NextResponse.json({ ok: true, results });
}

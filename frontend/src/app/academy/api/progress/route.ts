import { NextResponse } from "next/server";
import { clearClassCookie, isAcademyUnlocked, readClassCookie } from "@/lib/academy-auth";
import { findClassByCode, joinClass } from "@/lib/academy-classes";
import { hasReadyBadge, levelBest, MISSION_SKILLS, pinReadiness, readinessBest, sanitizeResults, SERVER_MARKER_IDS, type Results } from "@/lib/academy-score";
import { loadProgress, saveProgress } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";
import { sendEmail } from "@/lib/email";
import { studentJoinedEmail, studentWelcomeEmail } from "@/lib/academy-emails";

export const runtime = "nodejs";

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
  // The best Readiness score is normally pinned on a write (saveProgress), so
  // a peak with no write right after it -- content reshuffling which old
  // missions now count, for one -- was never recorded and could later read
  // back lower. Pinning here too, on every read, closes that gap: the floor
  // can only ever rise, so this is safe to run as often as the page loads.
  const results = await loadProgress(student.id);
  const pinned = pinReadiness(results);
  const raised =
    readinessBest(pinned) > readinessBest(results) ||
    (hasReadyBadge(pinned) && !hasReadyBadge(results)) ||
    levelBest(pinned) > levelBest(results);
  if (raised) await saveProgress(student.id, student.email, pinned);
  return NextResponse.json({ results: raised ? pinned : results });
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
    else if (row.labOk) results[id] = { solved: false, wrong: 0, hint: false, labOk: true, ...(row.labVerified ? { labVerified: true } : {}), ...(row.at ? { at: row.at } : {}) };
  }
  // The browser may add what only lowers a score: a hint used, a mission skipped.
  for (const [id, row] of Object.entries(incoming)) {
    if (!(id in MISSION_SKILLS) || wiped(id)) continue;
    const cur = results[id] ?? { solved: false, wrong: 0, hint: false };
    // A hint opened after the solve changes nothing: the points were already earned.
    const next = { ...cur, hint: cur.hint || (row.hint && !cur.solved) };
    if (row.flagged && !cur.solved) next.flagged = true;
    if (!cur.solved && row.at && (!cur.at || row.at > cur.at)) next.at = row.at;
    results[id] = next;
  }
  // Browser labs grade in the page and show their answers after each check, so a pass is completion, not proof.
  if (!resetAll) for (const [id, row] of Object.entries(saved)) if (!(id in MISSION_SKILLS)) results[id] = row;
  // A lab's first finished score is the one that counts. A later save can add a pass, never change the score.
  for (const [id, row] of Object.entries(incoming)) {
    // The best score and the Ready level are the server's to record (saveProgress).
    if (id in MISSION_SKILLS || SERVER_MARKER_IDS.includes(id)) continue;
    const cur = results[id];
    results[id] = cur ? { ...cur, solved: cur.solved || row.solved, ...(cur.pts === undefined && row.pts !== undefined ? { pts: row.pts } : {}) } : row;
  }

  return NextResponse.json({ ok: true, results: await saveProgress(student.id, student.email, results) });
}

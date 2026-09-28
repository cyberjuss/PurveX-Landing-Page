import { NextResponse } from "next/server";
import { isAcademyUnlocked } from "@/lib/academy-auth";
import { MISSION_SKILLS, sanitizeResults, type Results } from "@/lib/academy-score";
import { loadProgress, saveProgress } from "@/lib/academy-store";
import { getAcademyStudent } from "@/lib/academy-student";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!(await isAcademyUnlocked())) {
    return NextResponse.json({ error: "Locked" }, { status: 401 });
  }
  const student = await getAcademyStudent(request);
  if (!student) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
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

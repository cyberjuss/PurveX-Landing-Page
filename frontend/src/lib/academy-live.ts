import "server-only";
import { checkChange, gradeDrill, levelFor, startDrill, unlockGate, weekStart, type StartedDrill } from "@/lib/academy-drills";
import { buildLogCtf } from "@/lib/academy-logctf";
import { loadDailyDrill, loadDrills, loadLabState, loadProgress, saveDailyDrill, saveDrill } from "@/lib/academy-store";

// The weekly CTF built from the student's own Security log. Used by the Drills
// page and by the MCP tools, so a student can start it and answer it from either.
// Nothing here changes their lab: it only reads the digest their lab already sent.

/** Start this week's CTF from the real log, if the log can support a question. */
export async function createRealCtf(userId: string, day: string): Promise<StartedDrill | null> {
  const lab = await loadLabState(userId);
  if (!lab?.snapshot.events) return null;
  const [entries, results] = await Promise.all([loadDrills(userId), loadProgress(userId)]);
  const week = weekStart(day);
  const level = Math.min(4, levelFor(entries) + 1);
  const item = buildLogCtf({ snapshot: lab.snapshot, seed: `${userId}:${week}`, level });
  if (!item) return null;
  const drill = startDrill({ userId, mode: "ctf", day, snapshot: lab.snapshot, results, level, items: [item], id: `ctf-${week}` });
  await saveDailyDrill(userId, week, drill.token, "ctf");
  return drill;
}

export type CtfState = "finished" | "open" | "not_started" | "unavailable";

export async function ctfStatus(userId: string, day: string): Promise<{ state: CtfState; detail: string; hasLog: boolean; captured?: boolean }> {
  const lab = await loadLabState(userId);
  const hasLog = Boolean(lab?.snapshot.events);
  const week = weekStart(day);
  const entries = await loadDrills(userId);
  const done = entries.find((e) => e.mode === "ctf" && e.id === `ctf-${week}`);
  if (done) return { state: "finished", detail: done.correct ? "This week's CTF is captured." : "This week's CTF is closed.", hasLog, captured: done.correct > 0 };
  if (await loadDailyDrill(userId, week, "ctf")) return { state: "open", detail: "This week's CTF is open.", hasLog };
  if (!hasLog) {
    return {
      state: "unavailable",
      detail: "Your lab has not sent a Security log digest yet. Download the lab script again from Build the Environment and run it once, or the log has no recent activity to ask about. The Drills page still offers the standard weekly CTF.",
      hasLog,
    };
  }
  return { state: "not_started", detail: "Not started yet.", hasLog };
}

/** Check the typed answer, then, when the CTF has a second half, the real fix in their lab. */
export async function checkRealCtf(userId: string, day: string, answer: string) {
  const week = weekStart(day);
  const token = await loadDailyDrill(userId, week, "ctf");
  if (!token) return { error: "This week's CTF has not been started. Start it on the Drills page, or with start_investigation if the lab has sent its Security log." };

  const unlocked = unlockGate(userId, token, [answer]);
  if (unlocked) {
    if (!unlocked.ok) return { correct: false, message: "That is not right. Go back to the Security log and count again." };
    const lab = await loadLabState(userId);
    const checked = checkChange(userId, token, lab, [answer]);
    if (!checked) return { error: "Could not check your lab." };
    if (!checked.passed) {
      return {
        correct: true,
        fixed: false,
        labReportedSinceStart: checked.fresh,
        stillToDo: checked.fresh ? checked.results.filter((r) => !r.ok).map((r) => r.label) : [],
        next: checked.fresh
          ? "Right answer. Now fix what made it possible in your lab, then check again after the lab reports."
          : "Right answer. Fix it in your lab, then wait about 1 minute for the lab to report and check again.",
      };
    }
    const graded = await gradeDrill(userId, token, [answer], { changePassed: true });
    if (!graded) return { error: "Could not score it." };
    if (!(await loadDrills(userId)).some((e) => e.id === graded.entry.id)) await saveDrill(userId, graded.entry);
    return { correct: true, fixed: true, captured: true, explanation: graded.review[0]?.explain };
  }

  // No second half: the typed answer is the whole CTF.
  const graded = await gradeDrill(userId, token, [answer]);
  if (!graded) return { error: "Could not score it." };
  if (!graded.review[0]?.correct) return { correct: false, message: "That is not right. Go back to the Security log and count again." };
  if (!(await loadDrills(userId)).some((e) => e.id === graded.entry.id)) await saveDrill(userId, graded.entry);
  return { correct: true, captured: true, explanation: graded.review[0]?.explain };
}

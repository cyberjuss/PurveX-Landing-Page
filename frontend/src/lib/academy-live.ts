import "server-only";
import { randomUUID } from "crypto";
import {
  buildInvestigation,
  checkChange,
  gradeDrill,
  levelFor,
  liveJobId,
  liveReady,
  startDrill,
  unlockGate,
  weekStart,
  type StartedDrill,
} from "@/lib/academy-drills";
import { getLabJob, loadDailyDrill, loadDrills, loadLabState, loadProgress, queueLabJob, saveDailyDrill, saveDrill } from "@/lib/academy-store";

// The live weekly CTF. Used by the Drills page and by the MCP tools, so a
// student can start it and check their answer from either place.

/** Queue the investigation for this week's CTF, if the student's lab can host it. */
export async function createLiveCtf(userId: string, day: string): Promise<StartedDrill | null> {
  const lab = await loadLabState(userId);
  if (!lab) return null;
  const ready = liveReady(lab.snapshot);
  if (!ready.agent || !ready.audit) return null;
  const [entries, results] = await Promise.all([loadDrills(userId), loadProgress(userId)]);
  const week = weekStart(day);
  const level = Math.min(4, levelFor(entries) + 1);
  const built = buildInvestigation({ snapshot: lab.snapshot, seed: `${userId}:${week}`, level });
  if (!built) return null;

  const jobId = randomUUID();
  built.item.live = { jobId };
  await queueLabJob(userId, { id: jobId, type: "investigation", params: { accounts: built.accounts } });
  const drill = startDrill({ userId, mode: "ctf", day, snapshot: lab.snapshot, results, level, items: [built.item], id: `ctf-${week}` });
  await saveDailyDrill(userId, week, drill.token, "ctf");
  return drill;
}

export type LiveState = "unavailable" | "not_started" | "queued" | "sent" | "done" | "failed" | "finished";

export async function liveCtfStatus(userId: string, day: string): Promise<{ state: LiveState; detail: string; ready: { agent: boolean; audit: boolean }; captured?: boolean }> {
  const lab = await loadLabState(userId);
  const ready = liveReady(lab?.snapshot ?? null);
  const week = weekStart(day);
  const entries = await loadDrills(userId);
  const finished = entries.find((e) => e.mode === "ctf" && e.id === `ctf-${week}`);
  if (finished) return { state: "finished", detail: finished.correct ? "This week's CTF is captured." : "This week's CTF is closed.", ready, captured: finished.correct > 0 };

  const token = await loadDailyDrill(userId, week, "ctf");
  const jobId = token ? liveJobId(userId, token) : null;
  if (!token || !jobId) {
    if (!ready.agent) return { state: "unavailable", detail: "Live investigations are off in your lab. Run .\Build-Environment.ps1 -InstallSync -AllowScenarios on your domain controller to turn them on.", ready };
    if (!ready.audit) return { state: "unavailable", detail: "Turn on Logon auditing for success and failure first, so your Security log records the sign-ins. The Turn on the auditing a SOC needs drill covers it.", ready };
    return { state: "not_started", detail: "Not started yet.", ready };
  }
  const job = await getLabJob(userId, jobId);
  if (!job) return { state: "queued", detail: "Waiting for your domain controller.", ready };
  const detail =
    job.status === "queued" ? "Queued. Your domain controller picks it up within 15 minutes, or run .\Build-Environment.ps1 -SyncOnly -AllowScenarios to start it now."
    : job.status === "sent" ? "Your domain controller is building it."
    : job.status === "done" ? "Ready. The practice accounts and their sign-in events are in your Security log."
    : `Your lab could not build it${job.result ? `: ${job.result}` : "."}`;
  return { state: job.status, detail, ready };
}

/** Check the typed answer, then the containment, and record the CTF when both are done. */
export async function checkLiveCtf(userId: string, day: string, answer: string) {
  const week = weekStart(day);
  const token = await loadDailyDrill(userId, week, "ctf");
  if (!token || !liveJobId(userId, token)) return { error: "No live investigation is running this week. Start one first." };
  const unlocked = unlockGate(userId, token, [answer]);
  if (!unlocked) return { error: "No live investigation is running this week. Start one first." };
  if (!unlocked.ok) {
    return { correct: false, message: "That is not the account. Look at the failed and successful sign-ins in the Security log again, and count the failures per account before its first success." };
  }
  const lab = await loadLabState(userId);
  const checked = checkChange(userId, token, lab, [answer]);
  if (!checked) return { error: "Could not check your lab." };
  if (!checked.passed) {
    return {
      correct: true,
      contained: false,
      labReportedSinceStart: checked.fresh,
      stillToDo: checked.fresh ? checked.results.filter((r) => !r.ok).map((r) => r.label) : [],
      next: checked.fresh
        ? "Right account. Now contain it in the lab and keep the evidence, then check again after the lab reports."
        : "Right account. Contain it in the lab, then wait for the lab to report (about 15 minutes, or run .\Build-Environment.ps1 -SyncOnly) and check again.",
    };
  }
  const graded = await gradeDrill(userId, token, [answer], { changePassed: true });
  if (!graded) return { error: "Could not score it." };
  const entries = await loadDrills(userId);
  if (!entries.some((e) => e.id === graded.entry.id)) await saveDrill(userId, graded.entry);
  return { correct: true, contained: true, captured: true, explanation: graded.review[0]?.explain };
}

/**
 * End-to-end health check for a hosted lab: starts a real pod, waits for it
 * to reach the state a student's browser would call "ready", checks that the
 * domain controller actually has a working Active Directory and the Ubuntu
 * server actually has its desktop and shell listening, then stops the pod.
 *
 *   npm run check:lab-health -- <userId>
 *
 * Catches the failure mode behind the 2026-11-25 incident: a session cut
 * short -- by the weekly-hour cap, an idle stop, or anything else -- before
 * the build finished. That left a half-promoted domain controller that came
 * back broken on the next start, and nothing in the logs said why; the
 * student just couldn't log in. `hostedLabStatus` reaching "ready" means a
 * snapshot made it back at least once, which is close but not the same as
 * "AD actually works" or "the Ubuntu desktop actually starts" -- the two
 * commands below ask those directly instead of inferring them.
 *
 * Run this against a dedicated test account, not a real student's, since it
 * starts and stops their lab and spends their weekly hours. Needs the lab's
 * AWS credentials in the environment (the same HOSTED_LAB_* variables Vercel
 * holds) and a free pod slot -- it claims one for the run and releases it
 * when done, including on a crash.
 *
 * Put this on a schedule (cron, a GitHub Actions workflow, anything that can
 * run a 25-minute job and alert on a non-zero exit) so a broken build is
 * caught before a class hits it.
 */
import { hostedLabStatus, runOnLab, runOnLinux, startHostedLab, stopHostedLab } from "@/lib/academy-hosted";

const userId = process.argv[2];
if (!userId) {
  console.error("usage: npm run check:lab-health -- <userId>");
  process.exit(1);
}

// The build screen itself promises up to 20 minutes for a first boot.
// 25 gives margin before this calls it a failure rather than just slow.
const BUILD_TIMEOUT_MS = 25 * 60_000;
const POLL_MS = 10_000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let failures = 0;
function t(name: string, ok: boolean, detail = "") {
  if (!ok) failures += 1;
  console.log(`${ok ? "\x1b[32mok  \x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  ${name}${detail ? ` (${detail})` : ""}`);
}

async function main() {
  const started = Date.now();
  const elapsed = () => `${Math.round((Date.now() - started) / 1000)}s`;

  console.log(`starting hosted lab for ${userId}...`);
  try {
    await startHostedLab(userId);
  } catch (err) {
    // Most likely LabHoursSpentError: the test account itself ran out of
    // hours or pod slots, not a build failure. Said plainly, and nothing to
    // stop since nothing started.
    t("lab start accepted", false, err instanceof Error ? err.message : String(err));
    console.log(`\n${failures} check(s) failed`);
    process.exit(1);
  }

  let status = await hostedLabStatus(userId);
  const deadline = started + BUILD_TIMEOUT_MS;
  while (status.state !== "ready" && Date.now() < deadline) {
    console.log(`  ${elapsed()}: ${status.state}`);
    await sleep(POLL_MS);
    status = await hostedLabStatus(userId);
  }
  t("pod reached ready within 25 minutes", status.state === "ready", `${status.state} after ${elapsed()}`);

  if (status.state === "ready") {
    const ad = await runOnLab(userId, [
      "try { Get-ADDomain -ErrorAction Stop | Out-Null; Write-Output 'AD_OK' } catch { Write-Output \"AD_FAIL: $($_.Exception.Message)\" }",
    ]);
    t("domain controller answers Get-ADDomain", Boolean(ad?.includes("AD_OK")), ad?.trim().slice(0, 200) || "no response");

    if (status.linux) {
      const web = await runOnLinux(userId, ["systemctl is-active --quiet xrdp && systemctl is-active --quiet ssh && echo UBUNTU_OK || echo UBUNTU_FAIL"]);
      t("Ubuntu box has ssh and xrdp running", Boolean(web?.includes("UBUNTU_OK")), web?.trim().slice(0, 200) || "no response");
    } else {
      console.log("  no Ubuntu server on this pod, skipping that check");
    }
  }

  console.log("stopping the lab...");
  await stopHostedLab(userId).catch((err) => console.error("stop failed, pod may still be running", err instanceof Error ? err.message : err));

  console.log(failures ? `\n${failures} check(s) failed` : "\nall checks passed");
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.error("lab health check crashed", err instanceof Error ? err.message : err);
  // Best effort: a crash mid-check must not leave a pod running and billing.
  stopHostedLab(userId)
    .catch(() => undefined)
    .finally(() => process.exit(1));
});

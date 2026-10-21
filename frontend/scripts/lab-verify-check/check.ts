/**
 * Does the hash check Range sends to a pod actually refuse a bad script?
 *
 *   npm run check:lab-verify
 *
 * Three paths download a script onto a pod and run it as SYSTEM: the build
 * script on first boot, the ticket repair, and each Incident-*.ps1 a shift
 * fires. Each one now carries the expected SHA-256 inside the SSM command, so
 * a pod refuses anything that is not the copy this deployment published.
 *
 * That check only ever runs on a real pod, where nobody watches it, and it
 * fails closed -- which means a broken check looks exactly like a working one
 * until a shift quietly stops firing. So it is run here instead: the real
 * emitter produces the real PowerShell, and real PowerShell runs it against a
 * good file, a tampered one, and the same content with Windows line endings.
 *
 * Needs PowerShell, so it is a developer check rather than part of a build.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { firstBootScript, sessionMinutes, shouldStopIdle, verifyDownloaded } from "@/lib/academy-hosted";
import { LAB_SCRIPT_HASHES } from "@/lib/lab-script-hashes";

const root = join(import.meta.dirname, "..", "..");
const scripts = join(root, "public", "lab-scripts");

let failures = 0;
function t(name: string, ok: boolean, detail = "") {
  if (!ok) failures += 1;
  console.log(`${ok ? "\x1b[32mok  \x1b[0m" : "\x1b[31mFAIL\x1b[0m"}  ${name}${detail ? ` (${detail})` : ""}`);
}

const dir = mkdtempSync(join(tmpdir(), "pvx-verify-"));

/** Runs the emitted snippet over `content` and says whether PowerShell accepted it. */
function accepts(published: string, content: string): boolean {
  const file = join(dir, "candidate.ps1");
  writeFileSync(file, content, { encoding: "utf8" });
  // $f is the variable the real call sites use, set the same way.
  const snippet = `$f=${JSON.stringify(file)}; ${verifyDownloaded("$f", published)}; "ACCEPTED"`;
  try {
    const out = execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", snippet], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return out.includes("ACCEPTED");
  } catch {
    return false;
  }
}

try {
  const published = "Build-Environment.ps1";
  const good = readFileSync(join(scripts, published), "utf8").replace(/\r\n/g, "\n");

  t("the published build script is accepted", accepts(published, good));
  t("the same content with CRLF endings is accepted", accepts(published, good.replace(/\n/g, "\r\n")));
  t("a line appended is refused", !accepts(published, `${good}\nnet user evil P@ss1234! /add\n`));
  t("one character changed is refused", !accepts(published, `X${good.slice(1)}`));
  t("an HTML error page is refused", !accepts(published, "<html>404</html>"));
  t("an empty file is refused", !accepts(published, ""));

  // The incident helper and one incident, which is the path a shift uses.
  const common = "incidents/Incident-Common.ps1";
  const commonText = readFileSync(join(scripts, common), "utf8").replace(/\r\n/g, "\n");
  t("the published incident helper is accepted", accepts(common, commonText));
  t("a tampered incident helper is refused", !accepts(common, `${commonText}\nStart-Process cmd\n`));
  // The helper's content under another script's name: the right file, the
  // wrong hash, which is what a swapped download looks like.
  t("the helper served as an incident is refused", !accepts("incidents/Incident-Lockout.ps1", commonText));

  // Every published script has a hash, and every hash has a published script.
  const names = Object.keys(LAB_SCRIPT_HASHES);
  const onDisk = execFileSync("git", ["ls-files", "public/lab-scripts"], { cwd: root, encoding: "utf8" })
    .split("\n")
    .filter((l) => l.endsWith(".ps1"))
    .map((l) => l.replace("public/lab-scripts/", ""));
  const missing = onDisk.filter((n) => !names.includes(n));
  const extra = names.filter((n) => !onDisk.includes(n));
  t(`all ${onDisk.length} published scripts have a hash`, missing.length === 0, missing.join(", "));
  t("no hash points at a script that is gone", extra.length === 0, extra.join(", "));

  // The first-boot script is built from the same emitter, so the hash has to
  // reach it. A pod that silently skipped the check would look identical.
  const boot = firstBootScript("pvl_testkey123", "P@ssw0rd!x", "https://purvex.io");
  t("the first-boot script carries the build script's hash", boot.includes(LAB_SCRIPT_HASHES[published]));

  // --- linking, which is where a pod actually broke -------------------------
  // First boot writes the student's key into the downloaded script and runs
  // what comes out. The needle it searches for also sat inside the script's
  // own updater, so Replace rewrote that line too and every pod wrote itself a
  // file PowerShell would not parse. Nothing caught it: the key really was in
  // there, the download really was ours, and the only symptom was a pod stuck
  // on "Linking to Range" until its hours ran out.
  //
  // So the real first-boot script is emitted, its linking lines are run in
  // real PowerShell against the real script, and the result is parsed.
  const lines = boot.split("\n");
  const from = lines.findIndex((l) => l.startsWith("$keyNeedle ="));
  const to = lines.findIndex((l) => l.startsWith("$text = & $link $build"));
  t("the first-boot script still has a linking step to test", from >= 0 && to > from);
  if (from >= 0 && to > from) {
    const out = join(dir, "linked.ps1");
    const run = [
      `$build = ${JSON.stringify(join(scripts, "Build-Environment.ps1"))}`,
      ...lines.slice(from, to + 1),
      `[IO.File]::WriteAllText(${JSON.stringify(out)}, $text)`,
      "$e = $null",
      `[void][System.Management.Automation.Language.Parser]::ParseInput($text, [ref]$null, [ref]$e)`,
      'if ($e.Count) { "PARSE-ERRORS " + $e.Count; $e[0].Message } else { "LINKED-OK" }',
      '"KEYS " + ([regex]::Matches($text, [regex]::Escape("' + "'pvl_testkey123'" + '"))).Count',
      '"URLS " + ([regex]::Matches($text, [regex]::Escape("' + "'https://purvex.io'" + '"))).Count',
    ].join("\n");
    const res = execFileSync("powershell", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", run], { encoding: "utf8" });
    t("the linked copy parses", res.includes("LINKED-OK"), res.split("\n")[0]?.trim());
    // Exactly one, because a second was the bug: the updater's own needle.
    t("the key is written in exactly once", /KEYS 1\b/.test(res), (res.match(/KEYS \d+/) ?? [""])[0]);
    t("the url is written in exactly once", /URLS 1\b/.test(res), (res.match(/URLS \d+/) ?? [""])[0]);
  }

  // The needle must match the param default and nothing else in the file.
  const buildSrc = readFileSync(join(scripts, "Build-Environment.ps1"), "utf8");
  for (const name of ["PurvexKey", "PurvexUrl"]) {
    const hits = buildSrc.split("\n").filter((l) => l.includes(`[string]$${name} = ""`)).length;
    t(`[string]$${name} = "" appears once in the script`, hits === 1, `${hits} line(s)`);
  }

  // --- the idle clock, which stopped a lab the moment it came up -----------
  // The pod reports how long it has gone without an active session, and with
  // nobody ever signed in it used to measure from boot. A pod spends its first
  // twenty minutes building a domain, so its very first report said "idle for
  // twenty minutes" and the lab was stopped before the student saw it: three
  // hours charged, nothing delivered.
  //
  // The pod now starts that clock when the lab is ready. This checks the
  // second guard, the one that does not depend on the pod being right.
  const idleLines = readFileSync(join(root, "src", "lib", "academy-hosted.ts"), "utf8");
  t(
    "the idle stop measures the session from stopAt, not from createdAt",
    /sessionStartedMs: Date\.parse\(row\.stopAt\) - c\.sessionHours \* 3600_000/.test(idleLines),
    "a restart leaves createdAt where it was"
  );

  // And the pod's half: the clock is restarted when the sync loop starts, so
  // neither a first boot nor a restart counts the build as idle time.
  const buildPs = readFileSync(join(scripts, "Build-Environment.ps1"), "utf8");
  const loopAt = buildPs.indexOf("function Start-PurvexSyncLoop");
  const stampAt = buildPs.indexOf("Set-Content -LiteralPath (Get-PurvexLastActivePath)", loopAt);
  t("the sync loop restarts the idle clock when the lab is ready", loopAt >= 0 && stampAt > loopAt && stampAt - loopAt < 1200);

  // --- the idle decision, case by case ------------------------------------
  // This rule has been wrong twice and both times a student lost a paid
  // session to it, so it is tested as a table rather than by reading it.
  const MIN = 60_000;
  const base = { idleStopMinutes: 20, unopenedStopMinutes: 20, buildGraceMinutes: 10, now: 0 };
  const at = (sessionAgeMin: number) => ({ ...base, now: sessionAgeMin * MIN, sessionStartedMs: 0 });
  const cases: { name: string; args: Parameters<typeof shouldStopIdle>[0]; stop: boolean }[] = [
    // The bug that started all this: a pod's very first report, counting its
    // own build as idle time, on a session less than an hour old.
    { name: "a brand new pod reporting 20 idle minutes is left alone", args: { ...at(21), idleMinutes: 20, everConnected: false }, stop: false },
    { name: "a brand new pod reporting 46 idle minutes is still left alone", args: { ...at(25), idleMinutes: 46, everConnected: false }, stop: false },
    // Never opened: the longer window, and only after the build grace.
    { name: "never opened, 19 minutes, stays up", args: { ...at(120), idleMinutes: 19, everConnected: false }, stop: false },
    { name: "never opened, 20 minutes, stops", args: { ...at(120), idleMinutes: 20, everConnected: false }, stop: true },
    { name: "never opened, 20 minutes but inside the grace, stays up", args: { ...at(20), idleMinutes: 20, everConnected: false }, stop: false },
    // Worked in and walked away: the short window, which is the point of it.
    { name: "worked in, 19 minutes idle, stays up", args: { ...at(120), idleMinutes: 19, everConnected: true }, stop: false },
    { name: "worked in, 20 minutes idle, stops", args: { ...at(120), idleMinutes: 20, everConnected: true }, stop: true },
    { name: "worked in, 20 minutes idle, inside the grace, stays up", args: { ...at(20), idleMinutes: 20, everConnected: true }, stop: false },
    // A pod on an older script says nothing, and keeps the old short window.
    { name: "an older pod with no flag keeps the 20 minute window", args: { ...at(120), idleMinutes: 20, everConnected: undefined }, stop: true },
    { name: "an older pod under 20 minutes stays up", args: { ...at(120), idleMinutes: 5, everConnected: undefined }, stop: false },
    // Nothing reported, nothing done.
    { name: "a pod that reported no idleness is left alone", args: { ...at(999), idleMinutes: undefined, everConnected: true }, stop: false },
    { name: "an unreadable session start is left alone", args: { ...base, idleMinutes: 999, everConnected: true, sessionStartedMs: NaN, now: 0 }, stop: false },
    { name: "the stop switched off leaves everything up", args: { ...at(999), idleStopMinutes: 0, unopenedStopMinutes: 0, idleMinutes: 999, everConnected: true }, stop: false },
  ];
  for (const c of cases) {
    const got = shouldStopIdle(c.args);
    t(c.name, got.stop === c.stop, got.why);
  }

  // --- every running pod is reachable by some sweep ----------------------
  // A lab stops for one of three reasons: its session ran out, nobody is
  // using it, or nothing accounts for it at all. The first two both ask for
  // a stop time, and a row whose stop_at is NULL has none -- so a machine in
  // that state was invisible to both and ran until somebody read the bill.
  // One did, for seven and a half hours. These check the two halves between
  // them cover every row.
  const storeSrc = readFileSync(join(root, "src", "lib", "academy-store.ts"), "utf8");
  t("the due sweep asks for a stop time in the past", /\.lte\("stop_at"/.test(storeSrc));
  t("something asks for the rows with no stop time at all", /\.is\("stop_at", null\)/.test(storeSrc));
  t(
    "a pod with no session is stopped",
    /export async function stopOrphanedHostedLabs/.test(idleLines) && /hostedLabsWithNoSession/.test(idleLines)
  );
  t(
    "and not while it is still launching",
    /age < ORPHAN_GRACE_MINUTES \* 60_000\) continue;/.test(idleLines),
    "a launch writes the row just after the machine starts"
  );
  const cronSrc = readFileSync(join(root, "src", "app", "api", "cron", "hosted-labs", "route.ts"), "utf8");
  t("the nightly cron runs it", /stopOrphanedHostedLabs/.test(cronSrc));

  // --- every download that runs is a download that was checked -----------
  // The hash check only protects the paths that call it, and a new path gets
  // written by somebody thinking about something else. A reset added a fifth
  // download -- of the script that deletes three OUs and everything in them
  // -- and ran it on trust, on the same day the checking was built. So the
  // rule is counted rather than remembered.
  //
  // Counted rather than matched by name because two of the five build their
  // URL from a variable, so the filename is not on the line that fetches it.
  const fetches = (idleLines.match(/Invoke-WebRequest/g) ?? []).length;
  // Minus its own declaration, which the pattern also matches -- counting
  // that made five checks look like six and hid a missing one.
  const checks =
    (idleLines.match(/verifyDownloaded\(/g) ?? []).length - (idleLines.match(/function verifyDownloaded\(/g) ?? []).length;
  t(
    `every lab-script download is hash-checked (${fetches} fetched, ${checks} checked)`,
    fetches > 0 && checks >= fetches,
    checks < fetches ? `${fetches - checks} download(s) run without a check` : ""
  );

  // --- what a lab costs ---------------------------------------------------
  // Hours used to be reserved and refunded, which was correct arithmetic that
  // nobody could read: the meter jumped three hours on Start and the number
  // on it was not hours anyone had spent. A lab costs the time it was up now,
  // and this is billing, so it is a table rather than a reading.
  const MINUTE = 60_000;
  const row = (agoMinutes: number): Parameters<typeof sessionMinutes>[0] => ({
    instanceId: "i-test",
    passwordEnc: "",
    stopAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - agoMinutes * MINUTE).toISOString(),
    linuxInstanceId: null,
    linuxPasswordEnc: null,
    podSlot: 0,
  });
  for (const [mins, want, name] of [
    [0, 0, "a session that just started costs nothing"],
    [1, 1, "a minute costs a minute"],
    [47, 47, "forty-seven minutes cost forty-seven"],
    [180, 180, "a full session costs its three hours"],
    [5000, 180, "a session nothing ever closed is capped at one session"],
  ] as [number, number, string][]) {
    const got = sessionMinutes(row(mins));
    t(name, got === want, `${got} minutes`);
  }
  t("an unreadable start costs nothing", sessionMinutes({ ...row(10), updatedAt: "not a date" }) === 0);


  // --- every stop bills, and only once -----------------------------------
  // Clearing the stop time is what ends a session, and billing is what paid
  // for it. They were two separate acts in five places, and the sweep that
  // stops a lab at the end of its own session did the first without the
  // second -- so the most ordinary stop there is cost nothing. One helper
  // owns both now, and these keep it that way.
  const claims = (idleLines.match(/claimLabSessionEnd\(/g) ?? []).length;
  t("only one place ends a session", claims === 1, `${claims} call(s) to claimLabSessionEnd`);
  // Writing a row with the stop time cleared ends a session behind
  // endSession's back. Only a row write counts -- the status payload has a
  // stopAt of its own and says null when there is no session, which is fine.
  const bareClears = (idleLines.match(/\.\.\.row,[^}]*stopAt: null/g) ?? []).length;
  t("nothing clears the stop time by hand", bareClears === 0, `${bareClears} row write(s) clearing stopAt`);
  const endsSession = (idleLines.match(/await endSession\(/g) ?? []).length;
  t("every stop path routes through it", endsSession >= 5, `${endsSession} call site(s)`);

  // A script we never published must not produce a command at all.
  let threw = false;
  try {
    verifyDownloaded("$f", "incidents/Incident-DoesNotExist.ps1");
  } catch {
    threw = true;
  }
  t("an unpublished script refuses to build a command", threw);
} finally {
  rmSync(dir, { recursive: true, force: true });
}

if (failures) {
  console.error(`\n${failures} failed.`);
  process.exit(1);
}
console.log("\nThe pod-side hash check holds.");

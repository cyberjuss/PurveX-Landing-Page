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
import { firstBootScript, verifyDownloaded } from "@/lib/academy-hosted";
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

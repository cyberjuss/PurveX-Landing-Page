/**
 * Mint this student a lab key and write it into the script on their pod.
 *
 * A pod authenticates with the pvl_ key baked into its own copy of
 * Build-Environment.ps1, and only the SHA-256 is stored, so a key that gets
 * out of step cannot be recovered -- it has to be replaced. launch() does
 * this on every start; this does the same thing for a pod that is already up.
 *
 *   npx tsx scripts/shift-live/relink.ts <userId>
 *
 * The key is read back out of the pod afterwards and checked against the
 * database, because writing the wrong one is exactly the failure this exists
 * to repair.
 */
import { SSMClient, SendCommandCommand, GetCommandInvocationCommand } from "@aws-sdk/client-ssm";
import { createHash } from "node:crypto";
import { createLabKey, loadHostedLab } from "@/lib/academy-store";

const userId = process.argv[2];
if (!userId) { console.error("usage: relink.ts <userId>"); process.exit(1); }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ssm = new SSMClient({
  region: process.env.HOSTED_LAB_REGION || "us-east-1",
  credentials: { accessKeyId: process.env.HOSTED_LAB_AWS_ACCESS_KEY_ID || "", secretAccessKey: process.env.HOSTED_LAB_AWS_SECRET_ACCESS_KEY || "" },
});

async function run(instanceId: string, commands: string[]) {
  const out = await ssm.send(new SendCommandCommand({ InstanceIds: [instanceId], DocumentName: "AWS-RunPowerShellScript", TimeoutSeconds: 300, Parameters: { commands } }));
  const id = out.Command?.CommandId!;
  for (let i = 0; i < 40; i += 1) {
    await sleep(3000);
    const inv = await ssm.send(new GetCommandInvocationCommand({ CommandId: id, InstanceId: instanceId })).catch(() => null);
    if (inv && inv.Status !== "InProgress" && inv.Status !== "Pending") return `${inv.Status}\n${inv.StandardOutputContent ?? ""}${inv.StandardErrorContent ?? ""}`;
  }
  return "timed out";
}

async function main() {
  const row = await loadHostedLab(userId);
  if (!row) { console.error("no hosted lab for that student"); process.exit(1); }
  const key = await createLabKey(userId);
  console.log(`minted a key hashing to ${createHash("sha256").update(key).digest("hex").slice(0, 16)}...`);

  const url = process.env.HOSTED_LAB_SYNC_URL || "https://purvex.io";
  const q = (v: string) => `'${v.replace(/'/g, "''")}'`;
  // Only the first occurrence. The needle names the param default at the top
  // of the file, and the updater used to carry a copy of it further down.
  const out = await run(row.instanceId, [
    "$ErrorActionPreference='Stop'",
    "$dir='C:/ProgramData/PurveX'",
    "[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12",
    // A fresh copy from the site still has the empty defaults, so the
    // substitution is the same one first boot does. Editing the linked copy
    // in place has to cope with it already carrying a key, and with the param
    // block's indentation, and got both wrong.
    `$tmp = Join-Path $env:TEMP 'relink.ps1'`,
    `Invoke-WebRequest -Uri ${q(`${url}/lab-scripts/Build-Environment.ps1`)} -OutFile $tmp -UseBasicParsing -TimeoutSec 60`,
    "$t = Get-Content -LiteralPath $tmp -Raw",
    `$kn = '[string]$PurvexKey = ' + '""'`,
    `$un = '[string]$PurvexUrl = ' + '""'`,
    `$i = $t.IndexOf($kn); if ($i -lt 0) { throw 'no key needle' }`,
    `$t = $t.Substring(0, $i) + "[string]\`$PurvexKey = ${q(key)}" + $t.Substring($i + $kn.Length)`,
    `$j = $t.IndexOf($un); if ($j -lt 0) { throw 'no url needle' }`,
    `$t = $t.Substring(0, $j) + "[string]\`$PurvexUrl = ${q(url)}" + $t.Substring($j + $un.Length)`,
    "$e=$null; [void][System.Management.Automation.Language.Parser]::ParseInput($t,[ref]$null,[ref]$e); if($e.Count){ throw \"will not parse: $($e.Count)\" }",
    "Set-Content -LiteralPath (Join-Path $dir 'Build-Environment.ps1') -Value $t -Encoding UTF8",
    "Set-Content -LiteralPath (Join-Path $dir 'hosted/Build-Environment.ps1') -Value $t -Encoding UTF8",
    "$m = [regex]::Match($t, \"'(pvl_[A-Za-z0-9_-]+)'\")",
    "'key now on the pod: ' + $m.Groups[1].Value",
    // The loop holds the old key in memory, so it has to be restarted. 5.1 has
    // no Restart-ScheduledTask.
    "Stop-ScheduledTask -TaskName 'PurveX Coach Lab Sync' -ErrorAction SilentlyContinue",
    "Start-ScheduledTask -TaskName 'PurveX Coach Lab Sync' -ErrorAction SilentlyContinue",
    "& (Join-Path $dir 'Build-Environment.ps1') -SyncOnly",
  ]);
  console.log(out.trim());

  const onPod = /key now on the pod: (pvl_[A-Za-z0-9_-]+)/.exec(out)?.[1] ?? "";
  console.log(onPod === key ? "the pod carries the key that was minted" : `MISMATCH: pod has ${onPod.slice(0, 16)}...`);
}

main().catch((e) => { console.error(e); process.exit(1); });

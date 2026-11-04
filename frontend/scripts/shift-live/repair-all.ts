/**
 * Replant missing ticket objects on every running hosted lab, now.
 *
 *   npm run pods:repair -- --dry-run   # list the pods, send nothing
 *   npm run pods:repair                # send the repair to every running pod
 *
 * Each running pod downloads the current Build-Environment.ps1 from the site,
 * checks it against the hash this deployment published, and runs it with
 * -RepairOnly: it plants only the tickets the lab is missing and never touches
 * a change the student already made. It is the same command a challenge sends
 * when a lab is missing a ticket, sent to every pod at once instead of waiting
 * for each student to open a challenge.
 *
 * Stopped pods are skipped. They get the same repair the first time their
 * student opens a challenge after starting the lab.
 *
 * Needs the production Supabase service key and the lab's AWS credentials in
 * the environment (the HOSTED_LAB_* variables), the same as the other scripts
 * here. Run it after the site has deployed the script change, so the pods
 * fetch the new copy and its hash matches.
 */
import { supabaseAdmin } from "@/lib/supabase-admin";
import { hostedLabsConfigured, repairHostedLab } from "@/lib/academy-hosted";

const dryRun = process.argv.includes("--dry-run");

async function main() {
  if (!supabaseAdmin) throw new Error("No Supabase service key in the environment.");
  if (!hostedLabsConfigured()) throw new Error("Hosted labs are not configured: the HOSTED_LAB_* variables are missing.");

  const { data, error } = await supabaseAdmin.from("academy_hosted_labs").select("user_id, instance_id").not("instance_id", "is", null);
  if (error) throw new Error(`Could not list hosted labs: ${error.message}`);
  const pods = (data ?? []) as { user_id: string; instance_id: string }[];
  console.log(`${pods.length} hosted lab(s) on record.${dryRun ? " Dry run: nothing is sent." : ""}\n`);

  let sent = 0;
  let skipped = 0;
  for (const pod of pods) {
    if (dryRun) {
      console.log(`  would repair  ${pod.instance_id}  (${pod.user_id})`);
      continue;
    }
    // repairHostedLab skips a pod that is stopped or whose SSM agent is not
    // online yet, and returns false for it.
    const ok = await repairHostedLab(pod.user_id).catch((err) => {
      console.error(`  failed        ${pod.instance_id}: ${err instanceof Error ? err.message : err}`);
      return false;
    });
    if (ok) sent++;
    else skipped++;
    console.log(`  ${ok ? "repair sent " : "skipped     "}  ${pod.instance_id}  (${pod.user_id})`);
  }
  if (!dryRun) {
    console.log(`\nRepair sent to ${sent} running pod(s); ${skipped} stopped or not reachable.`);
    console.log("Each pod reports its new snapshot within a minute or two of the repair finishing.");
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

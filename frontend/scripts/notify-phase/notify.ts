/**
 * Email everyone who asked to hear when a coming-soon phase opens.
 *
 *   npm run notify:phase -- phase-2            # dry run: who would get it
 *   npm run notify:phase -- phase-2 --send     # send it
 *
 * Run it after you open the phase (remove its slug from LOCKED_PHASES in
 * src/lib/academy-locks.ts) and the site has deployed. It refuses while the
 * phase is still locked, so nobody is invited into something they can't open.
 *
 * Each student gets the email once: a sent email stamps notified_at, and a
 * second run skips anyone already stamped. Safe to re-run after a failure.
 *
 * Needs SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_URL and RESEND_API_KEY
 * in the environment, like the other live scripts here. Links point at
 * --origin (default https://purvex.io).
 */
import { supabaseAdmin } from "@/lib/supabase-admin";
import { isPhaseLocked, PHASE_PREVIEW } from "@/lib/academy-locks";
import { phaseOpenEmail } from "@/lib/academy-emails";
import { sendEmail } from "@/lib/email";

const args = process.argv.slice(2);
const phase = args.find((a) => !a.startsWith("--")) ?? "";
const send = args.includes("--send");
const originArg = args.find((a) => a.startsWith("--origin="));
const origin = originArg ? originArg.slice("--origin=".length) : "https://purvex.io";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const preview = PHASE_PREVIEW[phase];
  if (!preview) throw new Error(`Unknown phase "${phase}". Use one of: ${Object.keys(PHASE_PREVIEW).join(", ")}`);
  if (!supabaseAdmin) throw new Error("No Supabase service key in the environment.");
  if (send && isPhaseLocked(phase)) throw new Error(`${preview.label} is still locked. Open it in src/lib/academy-locks.ts and deploy first.`);
  if (send && !process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set, so no email can be sent.");

  const { data, error } = await supabaseAdmin
    .from("academy_phase_interest")
    .select("user_id, email, created_at")
    .eq("phase", phase)
    .is("notified_at", null)
    .order("created_at");
  if (error) throw new Error(`Couldn't read the list: ${error.message}`);
  const rows = data ?? [];
  console.log(`${preview.label}: ${rows.length} student(s) waiting for the launch email.`);
  if (!send) {
    for (const r of rows) console.log(`  ${r.email}  (asked ${r.created_at})`);
    console.log(isPhaseLocked(phase) ? "\nThe phase is still locked. Open it and deploy before sending." : "\nDry run. Add --send to email them.");
    return;
  }

  let sent = 0;
  for (const r of rows) {
    const { data: u } = await supabaseAdmin.auth.admin.getUserById(r.user_id);
    const meta = u?.user?.user_metadata ?? {};
    const name = [meta.full_name, meta.name, meta.given_name].find((v) => typeof v === "string" && v.trim()) as string | undefined;
    const mail = phaseOpenEmail({ name: name ?? null, email: r.email }, { slug: phase, ...preview }, origin);
    if (await sendEmail(r.email, mail.subject, mail.html)) {
      await supabaseAdmin
        .from("academy_phase_interest")
        .update({ notified_at: new Date().toISOString() })
        .eq("user_id", r.user_id)
        .eq("phase", phase);
      sent += 1;
      console.log(`  sent      ${r.email}`);
    } else {
      console.log(`  FAILED    ${r.email}  (left on the list, re-run to retry)`);
    }
    await sleep(600); // stays under Resend's per-second limit
  }
  console.log(`\nSent ${sent} of ${rows.length}.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

/**
 * Range's own read of a hosted lab, run against a real one.
 *
 *   npm run check:verify-pull:live -- <userId>
 *
 * Verified by Range (src/lib/academy-lab-pull.ts) asks the domain controller
 * directly over SSM instead of trusting the lab's report. It cannot be tested
 * without a lab, so this does it: with the student's lab running, it asks for
 * facts that are true on any freshly built PurveX Financial lab and one that is
 * not, and says what came back. All four lines must read as expected before
 * HOSTED_LAB_VERIFIED_PULL=on goes into Vercel.
 *
 * Needs the same environment as the site: the hosted-lab AWS keys and the
 * Supabase keys, for example from frontend/.env.local. It changes nothing on
 * the lab; the command only reads.
 */
import { confirmOnLab } from "@/lib/academy-lab-pull";
import type { Check } from "@/lib/academy-drills";

const userId = process.argv[2];
if (!userId) {
  console.error("usage: npm run check:verify-pull:live -- <userId>");
  process.exit(1);
}
process.env.HOSTED_LAB_VERIFIED_PULL = "on";

const cases: { label: string; checks: { c: Check; label: string }[]; want: "confirmed" | "contradicted" }[] = [
  {
    label: "alex.rivera is enabled and in IT Admins",
    checks: [
      { c: { t: "enabled", sam: "alex.rivera", want: true }, label: "alex.rivera is enabled" },
      { c: { t: "member", sam: "alex.rivera", group: "IT Admins", want: true }, label: "alex.rivera is in IT Admins" },
    ],
    want: "confirmed",
  },
  {
    label: "priya.nair sits in the IT Users OU",
    checks: [{ c: { t: "container", sam: "priya.nair", ou: "OU=Users,OU=IT,OU=Departments" }, label: "priya.nair is in IT Users" }],
    want: "confirmed",
  },
  {
    label: "the domain password policy can be read",
    checks: [{ c: { t: "policy", key: "minLength", min: 1 }, label: "a minimum length is set" }],
    want: "confirmed",
  },
  {
    label: "a fact that is false is reported false",
    checks: [{ c: { t: "member", sam: "priya.nair", group: "Domain Admins", want: true }, label: "priya.nair is a Domain Admin" }],
    want: "contradicted",
  },
];

(async () => {
  let bad = 0;
  for (const k of cases) {
    const t0 = Date.now();
    const out = await confirmOnLab(userId, k.checks);
    const ok = out.status === k.want;
    if (!ok) bad++;
    const why = out.status === "unverified" ? ` (${out.reason})` : out.status === "contradicted" ? ` (${out.results.filter((r) => !r.ok).map((r) => r.label).join("; ")})` : "";
    console.log(`${ok ? "ok  " : "FAIL"} ${k.label}: ${out.status}${why}, ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
  console.log(bad ? `\n${bad} did not read as expected. Leave HOSTED_LAB_VERIFIED_PULL off.` : "\nAll read as expected. HOSTED_LAB_VERIFIED_PULL=on can go into Vercel.");
  process.exit(bad ? 1 : 0);
})();

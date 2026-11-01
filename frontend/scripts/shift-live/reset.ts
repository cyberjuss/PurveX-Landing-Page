// Times a real in-place reset against a running pod, and checks the lab is
// genuinely back rather than merely reported back.
import { resetHostedLab } from "@/lib/academy-hosted";
import { loadLabState } from "@/lib/academy-store";
const userId = process.argv[2];
async function main() {
  const before = await loadLabState(userId);
  console.log("before:", before?.snapshot.users.length, "users,", before?.snapshot.groups.length, "groups,", before?.snapshot.computers.length, "computers");
  const t0 = Date.now();
  await resetHostedLab(userId);
  const secs = Math.round((Date.now() - t0) / 1000);
  const after = await loadLabState(userId);
  console.log("after :", after?.snapshot.users.length, "users,", after?.snapshot.groups.length, "groups,", after?.snapshot.computers.length, "computers");
  console.log(`reset took ${secs}s`);
  const planted = after?.snapshot.infra?.planted ?? [];
  console.log("infra tickets planted again:", planted.join(", ") || "none");
}
main().catch((e) => { console.error(e); process.exit(1); });

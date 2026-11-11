// Times a real in-place reset against a running pod, and checks the lab is
// genuinely back rather than merely reported back. Reset is no longer one
// blocking call -- advanceReset moves it forward one bounded step at a time,
// the same way the lab's own status poll does -- so this drives that loop
// itself instead of awaiting a single function.
import { advanceReset, beginReset } from "@/lib/academy-hosted";
import { loadLabState } from "@/lib/academy-store";
const userId = process.argv[2];
async function main() {
  const before = await loadLabState(userId);
  console.log("before:", before?.snapshot.users.length, "users,", before?.snapshot.groups.length, "groups,", before?.snapshot.computers.length, "computers");
  const t0 = Date.now();
  await beginReset(userId);
  // Comfortably above advanceReset's own worst case (RESET_MAX_MS), so this
  // only gives up if advanceReset itself never reports done.
  const giveUpAt = Date.now() + 20 * 60_000;
  let resetting = true;
  while (resetting && Date.now() < giveUpAt) {
    await new Promise((r) => setTimeout(r, 2_500));
    const r = await advanceReset(userId);
    if (r.error) throw new Error(r.error);
    resetting = r.resetting;
  }
  if (resetting) throw new Error("advanceReset never reported done");
  const secs = Math.round((Date.now() - t0) / 1000);
  const after = await loadLabState(userId);
  console.log("after :", after?.snapshot.users.length, "users,", after?.snapshot.groups.length, "groups,", after?.snapshot.computers.length, "computers");
  console.log(`reset took ${secs}s`);
  const planted = after?.snapshot.infra?.planted ?? [];
  console.log("infra tickets planted again:", planted.join(", ") || "none");
}
main().catch((e) => { console.error(e); process.exit(1); });

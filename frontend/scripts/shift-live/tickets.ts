// Do the new hardening tickets grade against a real lab? Fails-before is the
// half that matters: a ticket whose checks already pass is not a ticket.
import { checkMission } from "@/lib/academy-mission-lab";
import { loadLabState } from "@/lib/academy-store";
import { MISSION_CATALOG } from "@/lib/academy-missions";

async function main() {
  const lab = await loadLabState(process.argv[2]);
  if (!lab) { console.error("no lab snapshot"); process.exit(1); }
  for (const id of ["tq-21", "tq-22", "tq-23", "tq-24", "tq-25"]) {
    const r = checkMission(id, lab.snapshot);
    const m = MISSION_CATALOG[id];
    console.log(`${id}  ${r === null ? "NOT LAB GATED" : r.passed ? "ALREADY PASSES" : "open"}  ${m?.title ?? "??"}`);
    for (const c of r?.results ?? []) console.log(`        ${c.ok ? "ok  " : "todo"} ${c.label}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });



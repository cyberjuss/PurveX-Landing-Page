import { INCIDENTS, effectiveIncident, gradeIncidentLab } from "@/lib/academy-shift";
import { loadLabState } from "@/lib/academy-store";
import { remediate } from "./remediate";
const want = process.argv[3];
const list = INCIDENTS.map((d, i) => ({ d, i })).filter((x) => x.d.id === want);
async function main() {
  const lab = await loadLabState(process.argv[2]);
  for (const { d, i } of list) {
    let off = i;
    const pick = <T,>(a: T[]): T => a[off % a.length];
    const eff = effectiveIncident(d, { bind: d.bind?.(pick) });
    console.log(`${d.id}  (offset ${i})  args=${JSON.stringify(eff.args ?? {})}`);
    for (const r of eff.resolve) {
      console.log(`  check : ${JSON.stringify(r.c)}`);
      console.log(`  fix   : ${remediate(r.c)}`);
    }
    for (const r of eff.noHarm ?? []) console.log(`  noHarm: ${JSON.stringify(r.c)}`);
    const g = gradeIncidentLab(eff, lab?.snapshot ?? null, eff.diagnosis.accept[0] ?? "");
    console.log(`  now   : resolved=${g.resolved} noHarm=${g.noHarm}`);
    for (const r of g.results) console.log(`          ${r.ok ? "ok  " : "todo"} ${r.label}`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });

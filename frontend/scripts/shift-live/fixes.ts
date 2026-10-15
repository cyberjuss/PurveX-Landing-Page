import { INCIDENTS, effectiveIncident } from "@/lib/academy-shift";
import { remediate } from "./remediate";
const pick = <T,>(a: T[]): T => a[0];
for (const def of INCIDENTS) {
  const eff = effectiveIncident(def, { bind: def.bind?.(pick) });
  const fixes = eff.resolve.map((r) => ({ t: r.c.t, ps: remediate(r.c) }));
  const miss = fixes.filter((f) => f.ps === null).map((f) => f.t);
  console.log(`${def.id.padEnd(22)} ${miss.length ? "NO FIX for " + miss.join("/") : fixes.map((f) => f.ps).join(" ; ").slice(0, 150)}`);
}

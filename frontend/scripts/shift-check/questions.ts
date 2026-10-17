/**
 * Shift questions, checked without a lab: every incident has a pool, shifts
 * draw different questions from it, each lands on the run, and answers are
 * matched by word for short terms and numbers.
 *
 *   npm run check:shift
 */
import { INCIDENTS, pickShift, canAlternate, incidentDef as defOf, questionsFor, answerMatches, effectiveIncident, SHIFT_SECONDS, incidentDef } from "@/lib/academy-shift";

let fail = 0;
const ok = (c: boolean, m: string) => {
  if (!c) { fail++; console.log("FAIL", m); }
};

// Every incident has a pool of at least 3, every question has an accept term.
for (const d of INCIDENTS) {
  const qs = questionsFor(d);
  ok(qs.length >= 3, `${d.id} pool ${qs.length}`);
  for (const q of qs) ok(q.accept.length > 0 && q.accept.every(Boolean), `${d.id} empty accept: ${q.prompt}`);
}

// Variety: the same incident asks different things across shifts.
const seen = new Map<string, Set<string>>();
const hits = new Map<string, number>();
for (let k = 0; k < 400; k++) {
  for (const inc of pickShift(`seed-${k}`, k % 2 ? 2 : 1, 1 + (k % 4))) {
    hits.set(inc.defId, (hits.get(inc.defId) ?? 0) + 1);
    const s = seen.get(inc.defId) ?? new Set();
    s.add(inc.question!.prompt);
    seen.set(inc.defId, s);
    // Deadline is the rest of the shift.
    ok(inc.arriveSec + inc.deadlineSec === SHIFT_SECONDS, `deadline ${inc.uid}`);
    // The run uses the picked question.
    const def = incidentDef(inc.defId)!;
    ok(effectiveIncident(def, inc).diagnosis.prompt === inc.question!.prompt, "effective question");
  }
}
for (const [id, s] of seen) ok(s.size >= 2 || (hits.get(id) ?? 0) < 10, `${id} only ever asked ${s.size} in ${hits.get(id)} shifts`);
console.log([...seen].map(([id, s]) => `${id}:${s.size}`).join(" "));

// Determinism.
ok(JSON.stringify(pickShift("x", 2, 3)) === JSON.stringify(pickShift("x", 2, 3)), "deterministic");

// Within one shift, prompts rarely repeat.
let dup = 0;
for (let k = 0; k < 200; k++) {
  const ps = pickShift(`d-${k}`, 2, 4).map((i) => i.question!.prompt);
  if (new Set(ps).size !== ps.length) dup++;
}
console.log("shifts with a repeated prompt:", dup, "of 200");

// Matching.
const cases: [string, string[], boolean][] = [
  ["4625", ["4625"], true],
  ["Event 4625.", ["4625"], true],
  ["46250", ["4625"], false],
  ["4", ["4"], true],
  ["it was set to 4 characters", ["4"], true],
  ["4625", ["4"], false],
  ["no", ["no"], true],
  ["not sure", ["no"], false],
  ["you", ["ou"], false],
  ["wrong OU", ["ou"], true],
  ["disabled", ["disable"], true],
  ["3", ["3", "network"], true],
  ["type 3 network", ["3"], true],
  ["13", ["3"], false],
  ["HTTP/purvex-reports.purvex.local", ["http/purvex-reports"], true],
  ["", ["4625"], false],
  ["svc.helpdesk", ["svc.helpdesk"], true],
  ["one", ["one"], true],
  ["none", ["one"], false],
];
for (const [a, acc, want] of cases) ok(answerMatches(a, acc) === want, `match "${a}" ${acc} want ${want}`);

// Alternating lean: a ticket night is mostly tickets, an alert night mostly alerts.
ok(!canAlternate(1, 1), "a phase 1, level 1 student has only one alert, so no lean");
for (const [phase, level] of [[1, 2], [1, 3], [2, 3], [2, 4]]) {
  ok(canAlternate(phase, level), `should alternate at ${phase}/${level}`);
  const kinds = (mix: "tickets" | "alerts") => {
    let t = 0, a = 0;
    for (let k = 0; k < 50; k++) for (const i of pickShift(`m-${k}`, phase, level, [], mix)) { if (defOf(i.defId)!.kind === "ticket") t++; else a++; }
    return { t, a };
  };
  const tn = kinds("tickets"), an = kinds("alerts");
  console.log(`phase ${phase} level ${level}: ticket night ${tn.t}t/${tn.a}a · alert night ${an.t}t/${an.a}a`);
  ok(tn.t > tn.a, `ticket night not ticket-heavy at ${phase}/${level}`);
  ok(an.a > an.t, `alert night not alert-heavy at ${phase}/${level}`);
}

console.log(fail ? `${fail} failed` : "all passed");
process.exit(fail ? 1 : 0);

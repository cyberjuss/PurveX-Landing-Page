// Saved-work check: answers, quiz picks and progress survive leaving the page,
// follow the student to another device, and never reach another student.
// Run: npm run check:range:saved   (no database, no network)
//
// The page's real module (academy-saved-client.ts) runs against the real
// route (/academy/api/saved): fetch is wired straight into the handlers and
// the browser is a plain in-memory localStorage. Sign-in and the class
// passcode are stubbed the same way as gates.ts.

import { applyPatch, EMPTY_SAVED, mergeSaved, sanitizePatch } from "@/lib/academy-saved";

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  if (!ok) failures++;
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${name}${ok || !detail ? "" : `\n          ${detail}`}`);
}

const A = "00000000-0000-0000-0000-0000000000aa";
const B = "00000000-0000-0000-0000-0000000000bb";

// A browser: localStorage, and window/document events the module listens for.
const store = new Map<string, string>();
const localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, String(v)),
  removeItem: (k: string) => void store.delete(k),
};
const windowEvents = new EventTarget();
Object.assign(globalThis, {
  window: Object.assign(windowEvents, { localStorage, setTimeout, clearTimeout }),
  document: Object.assign(new EventTarget(), { visibilityState: "visible" }),
});

// Every request the page makes goes to the route handler, as the signed-in student.
let serverDown = false;
let puts = 0;
function signIn(id: string | null) {
  if (id) {
    process.env.STUB_STUDENT_EMAIL = `${id.slice(-2)}@example.com`;
    process.env.STUB_STUDENT_ID = id;
  } else delete process.env.STUB_STUDENT_EMAIL;
}

const leave = () => windowEvents.dispatchEvent(new Event("pagehide"));
const settle = () => new Promise((r) => setTimeout(r, 50));

async function main() {
  const route = await import("@/app/academy/api/saved/route");
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(String(input), "https://purvex.io");
    const req = new Request(url, init);
    // Counted before the outage check, so a save that was even attempted is seen.
    if (req.method === "PUT") puts++;
    if (serverDown) return new Response("{}", { status: 503 });
    return req.method === "PUT" ? route.PUT(req) : route.GET(req);
  }) as typeof fetch;
  const read = async (id: string) => {
    signIn(id);
    return (await (await route.GET(new Request("https://purvex.io/academy/api/saved"))).json()).saved;
  };

  const page = await import("@/lib/academy-saved-client");
  const { RESULTS_OWNER_KEY } = await import("@/lib/academy-client");

  console.log("\nThe rules for what is kept");
  const p = sanitizePatch({ drafts: { m1: "x".repeat(500), m2: 7 }, quizzes: { q1: { answers: "bad" }, q2: { answers: [1, null, 99], submitted: true, at: 9 } }, completed: ["a", "a", 3] });
  check("a long answer is cut to what is ever checked", p.drafts?.m1?.length === 120, String(p.drafts?.m1?.length));
  check("a malformed box is dropped", !("m2" in (p.drafts ?? {})));
  check("a malformed quiz is dropped, not used to delete a good one", !("q1" in (p.quizzes ?? {})));
  check("a quiz pick out of range reads as no pick", JSON.stringify(p.quizzes?.q2?.answers) === "[1,null,null]");
  check("lists are de-duplicated and cleaned", JSON.stringify(p.completed) === '["a"]');
  const withDraft = applyPatch(EMPTY_SAVED, { drafts: { m1: "4625" } });
  check("an emptied box is removed", !("m1" in applyPatch(withDraft, { drafts: { m1: null } }).drafts));
  const merged = mergeSaved({ ...EMPTY_SAVED, completed: ["w1"], drafts: { m1: "server" } }, { ...EMPTY_SAVED, completed: ["w2"], drafts: { m1: "local", m2: "only-here" } });
  check("finished work from both copies is kept", merged.completed.length === 2);
  check("the account's copy wins for the same box", merged.drafts.m1 === "server" && merged.drafts.m2 === "only-here");

  console.log("\nLeaving the page does not lose an answer");
  signIn(A);
  await page.openSaved(A);
  page.updateSaved({ drafts: { "p1-w2-m3": "Event ID 4625" } });
  page.updateSaved({ quizzes: { "phase-1:week-2": { answers: [2, 0, null, null], submitted: false, at: 2 } } });
  leave();
  await settle();
  const afterLeave = await read(A);
  check("the typed answer is on the account", afterLeave.drafts["p1-w2-m3"] === "Event ID 4625", JSON.stringify(afterLeave.drafts));
  check("the quiz picks are on the account", JSON.stringify(afterLeave.quizzes["phase-1:week-2"]?.answers) === "[2,0,null,null]");
  check("the quiz question they were on is kept", afterLeave.quizzes["phase-1:week-2"]?.at === 2);

  console.log("\nIt follows the student to another device");
  signIn(A);
  page.updateSaved({ completed: ["phase-1:week-1"], quizPasses: ["phase-1:week-1"] });
  await page.clearSavedLocal();
  store.clear();
  await page.openSaved(A);
  check("the answer comes back on a fresh browser", page.getSaved().drafts["p1-w2-m3"] === "Event ID 4625");
  check("the quiz comes back", page.getSaved().quizzes["phase-1:week-2"]?.at === 2);
  check("lesson checkmarks and quiz passes come back", page.getSaved().completed.includes("phase-1:week-1") && page.getSaved().quizPasses.includes("phase-1:week-1"));
  check("this browser keeps a copy for next time", (store.get("academy-saved-v1") ?? "").includes("Event ID 4625"));

  console.log("\nOn a shared computer, nothing crosses between students");
  // A leaves without signing out. B signs in on the same browser, and the
  // progress tracker loads before anything else has tidied up: the copy's own
  // owner tag is all that stands between A's answers and B's account.
  page.updateSaved({ drafts: { "p1-w3-m1": "A's private answer" } });
  leave();
  await settle();
  signIn(B);
  await page.openSaved(B);
  page.updateSaved({ drafts: { "p1-w1-m1": "B's answer" } });
  leave();
  await settle();
  const bSaved = await read(B);
  check("B does not see A's answers", !Object.values(page.getSaved().drafts).some((d) => d.includes("A's")), JSON.stringify(page.getSaved().drafts));
  check("B's account never receives A's answers", !JSON.stringify(bSaved).includes("A's"), JSON.stringify(bSaved));
  check("B's account never receives A's checkmarks", !bSaved.completed.includes("phase-1:week-1"), JSON.stringify(bSaved.completed));
  check("B's own answer is saved", bSaved.drafts["p1-w1-m1"] === "B's answer");
  check("A's account still has A's work", (await read(A)).drafts["p1-w3-m1"] === "A's private answer");

  console.log("\nProgress kept in the browser before this change");
  // The old keys carry no owner. They belong to whoever the scored results belong to.
  const legacy = (owner: string) => {
    store.clear();
    store.set(RESULTS_OWNER_KEY, owner);
    store.set("academy-progress-v1", JSON.stringify(["phase-1:home-lab"]));
    store.set("academy-labs-done-v1", JSON.stringify(["phase-1:week-2:hash-verify"]));
  };
  await page.clearSavedLocal();
  legacy(A);
  signIn(A);
  await page.openSaved(A);
  await settle();
  leave();
  await settle();
  const aMigrated = await read(A);
  check("the owner's old progress is moved to their account", aMigrated.completed.includes("phase-1:home-lab") && aMigrated.labsDone.includes("phase-1:week-2:hash-verify"), JSON.stringify(aMigrated));
  check("the old keys are removed once moved", !store.has("academy-progress-v1") && !store.has("academy-labs-done-v1"));

  // B signs in where A's old progress sits, and the tracker loads first.
  await page.clearSavedLocal();
  legacy(A);
  signIn(B);
  await page.openSaved(B);
  await settle();
  leave();
  await settle();
  check("someone else's old progress is not moved to B", !(await read(B)).completed.includes("phase-1:home-lab"));

  // The other order: the page records B as the owner of this browser before
  // the tracker loads. A's old progress has to be dropped at that moment,
  // while A is still the recorded owner, or it would read as B's.
  await page.clearSavedLocal();
  store.clear();
  await read(B).then(() => undefined);
  legacy(A);
  signIn(B);
  page.forgetLocalUnless(B);
  store.set(RESULTS_OWNER_KEY, B);
  await page.openSaved(B);
  await settle();
  leave();
  await settle();
  check("A's old progress is dropped when B takes over the browser", !(await read(B)).completed.includes("phase-1:home-lab"));

  console.log("\nA failed load never overwrites the account");
  await page.clearSavedLocal();
  store.clear();
  signIn(A);
  serverDown = true;
  const before = puts;
  await page.openSaved(A);
  // A real edit on a browser that could not load the account's copy. Sending
  // it would replace the account's newer answer with this one.
  page.updateSaved({ drafts: { "p1-w2-m3": "half typed" } });
  leave();
  await settle();
  serverDown = false;
  check("nothing is sent while the account's copy could not be read", puts === before, `${puts - before} save(s) sent`);
  check("the account still has the answer", (await read(A)).drafts["p1-w2-m3"] === "Event ID 4625");

  console.log("\nSigned out, nothing is reachable");
  signIn(null);
  const out = await route.GET(new Request("https://purvex.io/academy/api/saved"));
  check("reading saved work needs an account", out.status === 401, `status ${out.status}`);
  const outPut = await route.PUT(new Request("https://purvex.io/academy/api/saved", { method: "PUT", body: JSON.stringify({ patch: { drafts: { x: "y" } } }) }));
  check("saving needs an account", outPut.status === 401, `status ${outPut.status}`);

  console.log(failures === 0 ? "\nAll saved-work checks passed.\n" : `\n${failures} saved-work check(s) failed.\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});

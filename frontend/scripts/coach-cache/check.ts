/**
 * The Coach's prompt cache, checked.
 *
 * Two breakpoints sit in front of every Coach turn: the shared system prompt,
 * then this student's standing context. They only pay off while their bytes
 * hold still, and a prompt edit can kill that quietly -- the Coach keeps
 * answering, the bill goes up, and nothing in the product looks wrong. This
 * proves the invariant instead.
 *
 *   npm run check:coach-cache
 *
 * With ANTHROPIC_API_KEY set it also makes three real Messages calls, a few
 * cents, and reads the cache counters back from the API. Without one it runs
 * the offline half and says so.
 */
import { COACH_SYSTEM_PROMPT, buildStudentBrief, splitStudentBrief } from "@/lib/academy-coach";
import { BASELINE_GROUPS, BASELINE_USERS, type LabSnapshot } from "@/lib/academy-lab";
import type { Results } from "@/lib/academy-score";

let failures = 0;
function ok(name: string, pass: boolean, detail = "") {
  if (!pass) failures++;
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  ${detail}` : ""}`);
}

/** Runs fn with the clock moved, so "3 minutes ago" strings can be caught rolling over. */
function atClock<T>(ms: number, fn: () => T): T {
  const real = Date.now;
  Date.now = () => ms;
  try {
    return fn();
  } finally {
    Date.now = real;
  }
}

const now = Date.now();

/** A stock lab, built from the same baseline the drills compare against. */
const snapshot: LabSnapshot = {
  capturedAt: new Date(now - 90_000).toISOString(),
  domain: { dnsRoot: "purvexfinancial.local", netbios: "PURVEX" },
  ous: [...new Set(BASELINE_USERS.map((u) => u.deptOu))].map((ou) => ({ path: `OU=Users,OU=${ou},OU=Departments`, description: "" })),
  users: BASELINE_USERS.map((u) => ({
    sam: u.sam,
    name: u.sam,
    title: "",
    department: u.deptOu,
    description: "",
    container: `OU=Users,OU=${u.deptOu},OU=Departments`,
    enabled: true,
    lockedOut: false,
    badLogonCount: 0,
    passwordNeverExpires: false,
    passwordExpired: false,
    lastLogon: null,
    memberOf: [u.group, ...(u.extra ?? [])],
  })),
  groups: BASELINE_GROUPS.map((name) => ({ name, scope: "Global", category: "Security", description: "", container: "OU=AccessLevels", members: [] })),
  computers: [],
};

// One mission finished days ago and one three minutes ago. The recent one is
// what used to rewrite the cached block on every turn of a conversation.
const results: Results = {
  "tq-01": { solved: true, wrong: 0, hint: false, pts: 100, at: new Date(now - 4 * 86_400_000).toISOString() },
  "tq-02": { solved: true, wrong: 1, hint: true, pts: 60, at: new Date(now - 2 * 86_400_000).toISOString() },
  "tq-14": { solved: true, wrong: 2, hint: false, pts: 80, at: new Date(now - 3 * 60_000).toISOString() },
};

const noLab = splitStudentBrief(results, null, "", "");
const withLab = splitStudentBrief(results, snapshot, "", "");

ok("the stable half ignores the lab entirely", noLab.stable === withLab.stable);
ok("the live half carries the lab", noLab.live !== withLab.live && /Lab:/.test(withLab.live));

// The same lab, synced ten minutes earlier. Only the live half may notice.
const older: LabSnapshot = { ...snapshot, capturedAt: new Date(Date.parse(snapshot.capturedAt) - 600_000).toISOString() };
const withOlder = splitStudentBrief(results, older, "", "");
ok("a newer sync leaves the stable half byte-identical", withLab.stable === withOlder.stable);
ok("a newer sync does move the live half", withLab.live !== withOlder.live);

// The invariant the second breakpoint rests on.
ok(
  "ten minutes on the clock does not rewrite the stable half",
  atClock(now, () => splitStudentBrief(results, snapshot, "", "").stable) === atClock(now + 600_000, () => splitStudentBrief(results, snapshot, "", "").stable)
);
ok(
  "the live half does move with the clock",
  atClock(now, () => splitStudentBrief(results, snapshot, "", "").live) !== atClock(now + 600_000, () => splitStudentBrief(results, snapshot, "", "").live)
);

// Finishing a mission is allowed to move it. That is what the block is for.
const progressed: Results = { ...results, "tq-03": { solved: true, wrong: 0, hint: false, pts: 100, at: new Date(now).toISOString() } };
ok("finishing a mission moves the stable half", splitStudentBrief(progressed, snapshot, "", "").stable !== withLab.stable);

ok("the lab's own timing stays out of the stable half", !/Last sync|Last known lab|Last mission activity/.test(withLab.stable));
ok("buildStudentBrief still returns both halves", buildStudentBrief(results, snapshot, "", "") === `${withLab.stable}\n${withLab.live}`);

const approx = (s: string) => Math.round(s.length / 3.6);
console.log(`\nprompt ~${approx(COACH_SYSTEM_PROMPT)} tok | stable ~${approx(withLab.stable)} tok | live ~${approx(withLab.live)} tok`);

// ---- the API's own counters ------------------------------------------------

type Usage = { input_tokens: number; cache_creation_input_tokens?: number; cache_read_input_tokens?: number };

const apiKey = process.env.ANTHROPIC_API_KEY;
const model = process.env.ACADEMY_COACH_MODEL || "claude-sonnet-5-5";

async function call(live: string): Promise<Usage> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey!, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model,
      max_tokens: 16,
      // The same three blocks runCoachTurn sends.
      system: [
        { type: "text", text: COACH_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
        { type: "text", text: withLab.stable, cache_control: { type: "ephemeral" } },
        { type: "text", text: live },
      ],
      messages: [{ role: "user", content: "Say OK." }],
    }),
  });
  const body = (await res.json()) as { usage?: Usage; error?: { message?: string } };
  if (!res.ok || !body.usage) throw new Error(body.error?.message || `HTTP ${res.status}`);
  return body.usage;
}

async function live() {
  if (!apiKey) {
    console.log("\nANTHROPIC_API_KEY is not set, so the live cache check is skipped.");
    return;
  }
  console.log(`\nLive cache check against ${model}:`);
  const first = await call(withLab.live);
  console.log("  call 1                    ", JSON.stringify(first));
  const second = await call(withLab.live);
  console.log("  call 2 (identical)        ", JSON.stringify(second));
  const third = await call(withOlder.live);
  console.log("  call 3 (live half differs)", JSON.stringify(third));

  // A rerun inside the five-minute window finds the prefix already cached, so
  // either counter answering means the breakpoints took.
  const touched = (first.cache_creation_input_tokens ?? 0) + (first.cache_read_input_tokens ?? 0);
  ok("call 1 writes or reads the cached prefix", touched > 0, `${touched} tok`);
  ok("call 2 reads it back", (second.cache_read_input_tokens ?? 0) > 0);
  ok(
    "call 3 still reads both blocks after the live half changed",
    (third.cache_read_input_tokens ?? 0) === (second.cache_read_input_tokens ?? 0) && (third.cache_read_input_tokens ?? 0) > 0,
    `read ${third.cache_read_input_tokens} vs ${second.cache_read_input_tokens}`
  );
  const cached = second.cache_read_input_tokens ?? 0;
  console.log(`\n  ${cached} of ${cached + second.input_tokens} prefix tokens read at a tenth of the input price.`);
}

live()
  .catch((err) => {
    failures++;
    console.error("live check failed:", err instanceof Error ? err.message : err);
  })
  .finally(() => {
    console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
    process.exit(failures === 0 ? 0 : 1);
  });

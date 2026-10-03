// Gate check: drives a free account and a Pro account through the real route
// handlers and asserts what each one gets.
// Run: npm run check:range:gates   (no database, no network, no Stripe)
//
// This is the half the HTTP check cannot reach on its own. Over HTTP the
// session check fires first, so a signed-out caller gets 401 and the paywall
// underneath is never exercised. Here the token verification and the class
// passcode are stubbed (see academy-student.ts and academy-auth.ts, pointed
// at by this directory's tsconfig the same way server-only already is), so
// the plan gate is the only thing left deciding -- which is the point.
//
// Pro is granted through RANGE_PRO_EMAILS rather than a subscription row,
// because the row lives in Supabase and this runs offline. check.ts covers
// the subscription path on its own.

import { GET as coachGet, POST as coachPost } from "@/app/academy/api/coach/route";
import { GET as labGet, POST as labPost } from "@/app/academy/api/hosted-lab/route";
import { GET as proofGet, PUT as proofPut } from "@/app/academy/api/proof/route";
import { GET as planGet } from "@/app/academy/api/plan/route";

let failures = 0;

function check(name: string, ok: boolean, detail = "") {
  if (!ok) failures++;
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${name}${ok || !detail ? "" : `\n          ${detail}`}`);
}

const FREE = "student@example.com";
const PRO = "paid@example.com";

function asStudent(email: string | null) {
  if (email) process.env.STUB_STUDENT_EMAIL = email;
  else delete process.env.STUB_STUDENT_EMAIL;
}

const req = (url: string, init?: RequestInit) => new Request(`https://purvex.io${url}`, init);
const json = (url: string, body: unknown) =>
  req(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

async function read(res: Response) {
  const body = await res.json().catch(() => null);
  return { status: res.status, body: body as Record<string, unknown> | null };
}

async function main() {
  // Only paid@example.com is comped. Everyone else falls through to the
  // subscription lookup, which finds nothing without Supabase, then to the
  // class lookup, which finds nothing either -- so: free.
  process.env.RANGE_PRO_EMAILS = PRO;
  process.env.ACADEMY_ADMIN_EMAILS = "";

  // Fake but well-formed AWS config, so hostedLabsConfigured() is true and
  // the cloud lab looks like a product that exists. Nothing here is dialled:
  // every assertion below stops at the plan gate, well before AWS is called.
  // Without this the route answers "no labs here" for an unrelated reason and
  // the paywall underneath goes untested -- which is how the missing upsell
  // got through in the first place.
  Object.assign(process.env, {
    HOSTED_LAB_AWS_ACCESS_KEY_ID: "AKIAFAKEFAKEFAKEFAKE",
    HOSTED_LAB_AWS_SECRET_ACCESS_KEY: "fake",
    HOSTED_LAB_AMI: "ami-00000000000000000",
    HOSTED_LAB_SUBNET: "subnet-00000000000000000",
    HOSTED_LAB_SECURITY_GROUP: "sg-00000000000000000",
    HOSTED_LAB_GATEWAY_URL: "https://gateway.invalid",
    HOSTED_LAB_GATEWAY_KEY: "0".repeat(32),
    HOSTED_LAB_SECRET: "0".repeat(64),
    HOSTED_LAB_EMAILS: "*",
  });

  console.log("\nA free account hits the paywall");
  asStudent(FREE);

  const freeCoachPost = await read(await coachPost(json("/academy/api/coach", { message: "what is a DC?" })));
  check("coach chat is refused", freeCoachPost.status === 403, `status ${freeCoachPost.status} ${JSON.stringify(freeCoachPost.body)}`);
  check("coach refusal names the feature", String(freeCoachPost.body?.error ?? "").includes("Range Pro"), JSON.stringify(freeCoachPost.body));
  check("coach refusal links the upgrade page", freeCoachPost.body?.upgrade === "/range/upgrade", JSON.stringify(freeCoachPost.body));

  const freeCoachGet = await read(await coachGet(req("/academy/api/coach?day=2026-01-01")));
  check("coach status says locked", freeCoachGet.body?.locked === true, JSON.stringify(freeCoachGet.body));
  check("coach status says disabled", freeCoachGet.body?.enabled === false, JSON.stringify(freeCoachGet.body));

  const freeLabPost = await read(await labPost(json("/academy/api/hosted-lab", { action: "start" })));
  check("starting a cloud lab is refused", freeLabPost.status === 403, `status ${freeLabPost.status}`);
  check("lab refusal links the upgrade page", freeLabPost.body?.upgrade === "/range/upgrade", JSON.stringify(freeLabPost.body));

  const freeLabGet = await read(await labGet(req("/academy/api/hosted-lab")));
  check("no lab controls are offered", freeLabGet.body?.available === false, JSON.stringify(freeLabGet.body));
  check("but the upsell flag is set", freeLabGet.body?.locked === true, JSON.stringify(freeLabGet.body));

  const freeProofPut = await read(
    await proofPut(req("/academy/api/proof", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName: "Test", slug: "test-slug", published: true }) }))
  );
  check("publishing a Proof Profile is refused", freeProofPut.status === 403, `status ${freeProofPut.status}`);
  check("proof refusal links the upgrade page", freeProofPut.body?.upgrade === "/range/upgrade", JSON.stringify(freeProofPut.body));

  const freePlan = await read(await planGet(req("/academy/api/plan")));
  check("the plan endpoint says free", freePlan.body?.plan === "free", JSON.stringify(freePlan.body));

  console.log("\nA free account still gets Explore");
  // The draft is readable so the student can see what their work has earned.
  // Refusing this would make the upgrade page an argument about nothing.
  const freeProofGet = await read(await proofGet(req("/academy/api/proof")));
  check("the Proof Profile draft is readable", freeProofGet.status === 200, `status ${freeProofGet.status}`);
  check("the draft is marked locked", freeProofGet.body?.locked === true, JSON.stringify(freeProofGet.body?.locked));

  console.log("\nA Pro account is let through");
  asStudent(PRO);

  const proPlan = await read(await planGet(req("/academy/api/plan")));
  check("the plan endpoint says pro", proPlan.body?.plan === "pro", JSON.stringify(proPlan.body));

  const proCoachGet = await read(await coachGet(req("/academy/api/coach?day=2026-01-01")));
  check("coach is not locked", proCoachGet.body?.locked !== true, JSON.stringify(proCoachGet.body));

  const proCoachPost = await read(await coachPost(json("/academy/api/coach", { message: "what is a DC?" })));
  // 503 is the expected answer with no ANTHROPIC_API_KEY set. What matters is
  // that it got past the paywall to reach that check at all.
  check("coach chat is past the paywall", proCoachPost.status !== 403, `status ${proCoachPost.status} ${JSON.stringify(proCoachPost.body)}`);

  const proProofPut = await read(
    await proofPut(req("/academy/api/proof", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ displayName: "Test", slug: "test-slug" }) }))
  );
  check("publishing is past the paywall", proProofPut.status !== 403, `status ${proProofPut.status}`);

  const proProofGet = await read(await proofGet(req("/academy/api/proof")));
  check("the Proof Profile is not marked locked", proProofGet.body?.locked === false, JSON.stringify(proProofGet.body?.locked));

  console.log("\nA Pro account is never told to buy what it already bought");
  // Taking this account out of the pilot allowlist leaves the subscription
  // intact and the lab undeliverable. Answering 403 "part of Range Pro" there
  // sends a paying student to a checkout page that would charge them twice
  // and still not fix it.
  process.env.HOSTED_LAB_EMAILS = "someone-else@example.com";
  const proLabPost = await read(await labPost(json("/academy/api/hosted-lab", { action: "start" })));
  check("it is not a paywall error", proLabPost.status !== 403, `status ${proLabPost.status} ${JSON.stringify(proLabPost.body)}`);
  check("it reads as unavailable, not unpaid", proLabPost.status === 503, `status ${proLabPost.status} ${JSON.stringify(proLabPost.body)}`);
  check("it does not push the upgrade page", proLabPost.body?.upgrade === undefined, JSON.stringify(proLabPost.body));
  process.env.HOSTED_LAB_EMAILS = "*";

  console.log("\nSigned out, nothing is reachable");
  asStudent(null);
  const outCoach = await read(await coachPost(json("/academy/api/coach", { message: "hi" })));
  check("coach needs an account", outCoach.status === 401, `status ${outCoach.status}`);
  const outProof = await read(await proofGet(req("/academy/api/proof")));
  check("the Proof Profile needs an account", outProof.status === 401, `status ${outProof.status}`);
  const outPlan = await read(await planGet(req("/academy/api/plan")));
  check("the plan endpoint says signed out", outPlan.body?.signedIn === false, JSON.stringify(outPlan.body));

  console.log(failures === 0 ? "\nAll gate checks passed.\n" : `\n${failures} gate check(s) failed.\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});

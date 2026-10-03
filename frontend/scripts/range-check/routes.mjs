// Range Pro route check: what the gated endpoints actually answer over HTTP.
// Run against `next build && next start`, not `next dev` -- middleware, CSP
// and env resolution differ there, and this is exactly the kind of thing
// that passes in dev and fails in production.
//
//   npm run build && npm start
//   npm run check:range:routes
//
// Without a token it checks the signed-out answers and that /range/upgrade
// escapes the class-passcode gate. To check the free-vs-Pro split itself,
// pass a signed-in student's Supabase access token:
//
//   RANGE_TEST_TOKEN=<access token>            npm run check:range:routes
//   RANGE_TEST_TOKEN=<token> RANGE_TEST_PRO=1  npm run check:range:routes
//
// Get the token from the browser console while signed in at /range:
//   (await window.supabase.auth.getSession()).data.session.access_token
// or from the sb-<ref>-auth-token entry in localStorage.

const BASE = (process.env.BASE_URL || "http://127.0.0.1:3000").replace(/\/+$/, "");
const TOKEN = process.env.RANGE_TEST_TOKEN || "";
// The coach, proof and hosted-lab routes check isAcademyUnlocked() before
// they ever look at the plan, so without this cookie a free account gets a
// 401 and the paywall underneath is never reached -- a test that would pass
// while proving nothing. Value: sha256("<ACADEMY_PASSCODE>:<ACADEMY_SESSION_SALT or purvex-academy>").
const COOKIE = process.env.RANGE_TEST_COOKIE || "";
const EXPECT_PRO = process.env.RANGE_TEST_PRO === "1";

let failures = 0;

function check(name, ok, detail = "") {
  if (!ok) failures++;
  console.log(`${ok ? "  ok  " : "  FAIL"}  ${name}${ok || !detail ? "" : `\n          ${detail}`}`);
}

async function hit(path, init = {}) {
  const headers = new Headers(init.headers);
  if (TOKEN) headers.set("Authorization", `Bearer ${TOKEN}`);
  if (COOKIE) headers.set("Cookie", `academy_session=${COOKIE}`);
  const res = await fetch(`${BASE}${path}`, { ...init, headers, redirect: "manual" });
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, json, text };
}

async function main() {
  try {
    await fetch(BASE, { redirect: "manual" });
  } catch {
    console.error(`\nNothing is serving ${BASE}. Start it with: npm run build && npm start\n`);
    process.exit(2);
  }

  console.log(`\nChecking ${BASE}${TOKEN ? ` as a signed-in ${EXPECT_PRO ? "Pro" : "free"} student` : " signed out"}`);

  console.log("\nThe upgrade page is reachable without a class passcode");
  const upgrade = await hit("/range/upgrade");
  // The whole point of /range/upgrade being a real route rather than a page
  // under /academy: it must not render the passcode screen, or someone who
  // wants to pay is told to go find an instructor first.
  check("/range/upgrade returns a page", upgrade.status === 200, `status ${upgrade.status}`);
  check(
    "/range/upgrade is not the passcode screen",
    !/class passcode/i.test(upgrade.text),
    "the page rendered the unlock form, so it is behind the academy gate"
  );

  console.log("\nThe plan endpoint answers without the passcode cookie");
  const plan = await hit("/academy/api/plan");
  check("/academy/api/plan returns 200", plan.status === 200, `status ${plan.status}`);
  if (TOKEN) {
    check("plan says signed in", plan.json?.signedIn === true, JSON.stringify(plan.json));
    check(
      `plan is ${EXPECT_PRO ? "pro" : "free"}`,
      plan.json?.plan === (EXPECT_PRO ? "pro" : "free"),
      JSON.stringify(plan.json)
    );
  } else {
    check("plan is free when signed out", plan.json?.plan === "free" && plan.json?.signedIn === false, JSON.stringify(plan.json));
  }

  console.log("\nPro-only endpoints");
  const coach = await hit("/academy/api/coach?day=2026-01-01");
  const proofWrite = await hit("/academy/api/proof", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ displayName: "Range Check", slug: "range-check", published: true }),
  });
  const labStart = await hit("/academy/api/hosted-lab", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "start" }),
  });

  if (!TOKEN) {
    // Signed out, the session check fires before the plan check, so these
    // are 401s. Still worth asserting: a 200 here would mean the route lost
    // its auth entirely.
    check("coach rejects a signed-out caller", coach.status === 401, `status ${coach.status}`);
    check("proof write rejects a signed-out caller", proofWrite.status === 401, `status ${proofWrite.status}`);
    check("lab start rejects a signed-out caller", labStart.status === 403 || labStart.status === 401, `status ${labStart.status}`);

    // Static, so it needs no account at all -- and it is how a free student
    // builds the lab every hands-on mission runs against.
    console.log("\nExplore keeps what it is sold");
    const script = await hit("/lab-scripts/Build-Environment.ps1");
    check("the build script downloads without an account", script.status === 200, `status ${script.status}`);
  } else if (EXPECT_PRO) {
    check("coach does not answer 403 to Pro", coach.status !== 403, `status ${coach.status}`);
    check("proof write does not answer 403 to Pro", proofWrite.status !== 403, `status ${proofWrite.status}`);
  } else {
    // The three things the Pro column sells, each refused by name with a
    // link to the upgrade page rather than a bare error.
    check("coach is 403 for a free account", coach.status === 403 || coach.json?.locked === true, `status ${coach.status} ${JSON.stringify(coach.json)}`);
    check("proof write is 403 for a free account", proofWrite.status === 403, `status ${proofWrite.status} ${JSON.stringify(proofWrite.json)}`);
    check("proof 403 points at the upgrade page", proofWrite.json?.upgrade === "/range/upgrade", JSON.stringify(proofWrite.json));
    check("lab start is 403 for a free account", labStart.status === 403, `status ${labStart.status} ${JSON.stringify(labStart.json)}`);
    check("lab 403 points at the upgrade page", labStart.json?.upgrade === "/range/upgrade", JSON.stringify(labStart.json));

    // Explore is not a teaser. It is sold as every lesson, every challenge,
    // the whole Ticket Queue, the five browser labs and the readiness score,
    // and a paywall that creeps into any of those is a broken promise, not a
    // tightened gate. These run as a free account for that reason.
    console.log("\nExplore keeps what it is sold");
    const progress = await hit("/academy/api/progress");
    check("lesson progress is open to free", progress.status === 200, `status ${progress.status}`);

    // Challenges: answering and checking a mission. 401/403 here would mean
    // the course itself went behind the paywall.
    const missionCheck = await hit("/academy/api/mission-check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "ticket-queue-challenge" }),
    });
    check("challenges are open to free", missionCheck.status !== 401 && missionCheck.status !== 403, `status ${missionCheck.status}`);

    // The Ticket Queue is a challenge tab inside this section, served through
    // the normal lesson path -- not the Shift, which fires incidents into a
    // cloud lab and is Pro by its nature. Explore is promised the former.
    //
    // These two render their content client-side, so a 200 proves the route
    // still resolves rather than proving the content came back. They are here
    // to catch a redirect or a 404 appearing where Explore should be, not as
    // the last word on it.
    const queue = await hit("/range/phase-1/home-lab-ad");
    check("the Ticket Queue section still resolves", queue.status === 200, `status ${queue.status}`);

    const labs = await hit("/range/labs");
    check("the browser labs page still resolves", labs.status === 200, `status ${labs.status}`);

    // Building the lab by hand is the free path to every hands-on mission.
    // Pro pays to skip this, not to unlock it.
    const script = await hit("/lab-scripts/Build-Environment.ps1");
    check("the build script downloads for free", script.status === 200, `status ${script.status}`);

    // Reading a draft Proof Profile stays open: it is the argument for
    // upgrading, and the pricing page never put it behind Pro.
    const proofRead = await hit("/academy/api/proof");
    check("proof draft is readable", proofRead.status === 200, `status ${proofRead.status}`);
    check("proof draft is marked locked", proofRead.json?.locked === true, JSON.stringify(proofRead.json?.locked));
  }

  if (!TOKEN) {
    console.log("\n  note  The free-vs-Pro split is covered offline by: npm run check:range:gates");
    console.log("        Set RANGE_TEST_TOKEN to drive it over real HTTP with a real session too.");
  }
  console.log(failures === 0 ? "\nAll route checks passed.\n" : `\n${failures} route check(s) failed.\n`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});

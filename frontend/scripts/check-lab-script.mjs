// Three things that have to be true about the lab script before a deploy, all
// of them cheap, and all of them things that fail quietly otherwise.
//
//   npm run check:lab-script
//
// 1. The committed .sig matches the committed script. A hosted pod verifies the
//    download before it replaces itself, so a stale signature does not break a
//    pod -- it freezes it on the copy it already runs, and nothing anywhere
//    says so. This is the check that notices.
// 2. The public key the script carries is the one the signature was made with.
//    Verifying with the script's own key is the same check the pod does.
// 3. The copy embedded in the Build the Environment lesson still matches. A
//    student builds their own domain from that copy, so the two drifting apart
//    means the lesson teaches a script nobody tested.
// 4. The version is higher than the one purvex.io is serving, when the content
//    has changed. A pod only takes a higher number, so shipping new content on
//    an old number means every pod refuses it in silence. Skipped offline.
//
// Signing is `npm run sign:lab-script`, which bumps the version itself.

import { createPublicKey, createVerify } from "node:crypto";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(here, "..", "public", "lab-scripts", "Build-Environment.ps1");
const SIG = `${SCRIPT}.sig`;
const LESSON = join(here, "..", "src", "content", "academy", "phase-1", "home-lab-ad", "build-the-environment.md");
const LIVE = "https://purvex.io/lab-scripts/Build-Environment.ps1";

// The same line-anchored shape the pod matches with. Indented mentions inside
// the updater must not count.
const VERSION_RX = /^\$PurvexScriptVersion\s*=\s*(\d+)\s*$/m;

const fail = (msg, hint) => {
  console.error(`\x1b[31mFAIL\x1b[0m ${msg}`);
  if (hint) console.error(`     ${hint}`);
  process.exitCode = 1;
};
const pass = (msg) => console.log(`\x1b[32mok\x1b[0m   ${msg}`);

const read = (p) => {
  try {
    return readFileSync(p, "utf8").replace(/^\uFEFF/, "");
  } catch {
    return null;
  }
};

const script = read(SCRIPT);
if (script === null) {
  fail("No Build-Environment.ps1 under public/lab-scripts.");
  process.exit(1);
}
// LF, the way the site serves it and the way the pod normalises it. The
// checkout on Windows has CRLF, which is exactly why neither side signs
// the bytes it happens to have on disk.
const normalised = Buffer.from(script.replace(/\r\n/g, "\n"), "utf8");

// --- 1 and 2: the signature, checked with the script's own public key -------
const sig = read(SIG);
const keyXml = script.match(/\$PurvexSigningKey\s*=\s*'([^']+)'/);

if (!keyXml) {
  fail("The script carries no $PurvexSigningKey, so a pod cannot verify an update at all.");
} else if (!sig) {
  fail("No Build-Environment.ps1.sig beside the script.", "Run: npm run sign:lab-script");
} else {
  const modulus = keyXml[1].match(/<Modulus>([^<]+)<\/Modulus>/);
  const exponent = keyXml[1].match(/<Exponent>([^<]+)<\/Exponent>/);
  if (!modulus || !exponent) {
    fail("$PurvexSigningKey is not an RSA public key in the shape FromXmlString reads.");
  } else {
    const b64url = (b64) => Buffer.from(b64, "base64").toString("base64url");
    let ok = false;
    try {
      const key = createPublicKey({
        key: { kty: "RSA", n: b64url(modulus[1]), e: b64url(exponent[1]) },
        format: "jwk",
      });
      ok = createVerify("sha256").update(normalised).verify(key, sig.trim(), "base64");
    } catch (err) {
      fail(`Could not check the signature: ${err instanceof Error ? err.message : err}`);
    }
    if (ok) pass(`Signature checks out against the key in the script (${normalised.length} bytes, LF).`);
    else {
      fail(
        "The signature does not match the script.",
        "Every hosted pod will refuse the update and keep its old copy. Run: npm run sign:lab-script"
      );
    }
  }
}

// --- 3: the lesson's embedded copy ------------------------------------------
const lesson = read(LESSON);
if (lesson === null) {
  fail("Could not read the Build the Environment lesson.");
} else {
  const block = lesson.match(/<pre class="ad-code__pre--tall"><code>([\s\S]*?)<\/code><\/pre>/);
  if (!block) {
    fail("The lesson no longer has the <pre class=\"ad-code__pre--tall\"> block the script is pasted into.");
  } else {
    const unescaped = block[1]
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, "&");
    const left = unescaped.replace(/\r\n/g, "\n").trimEnd();
    const right = script.replace(/\r\n/g, "\n").trimEnd();
    if (left === right) pass("The lesson's embedded copy matches the script.");
    else {
      const a = left.split("\n");
      const b = right.split("\n");
      let i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
      fail(
        `The lesson's embedded copy has drifted (first difference at its line ${i + 1}).`,
        `lesson: ${JSON.stringify(a[i] ?? "<end>")}\n     script: ${JSON.stringify(b[i] ?? "<end>")}`
      );
    }
  }
}

// --- 4: the version, against what is already serving ------------------------
const localVersion = script.match(VERSION_RX);
if (!localVersion) {
  fail(
    "The script has no $PurvexScriptVersion line on a line of its own.",
    "Without it a pod cannot tell this copy from an older signed one, and refuses every update."
  );
} else {
  const mine = Number(localVersion[1]);
  let live = null;
  try {
    const res = await fetch(LIVE, { signal: AbortSignal.timeout(10_000) });
    if (res.ok) live = await res.text();
  } catch {
    // Offline, or the site is down. Neither is this check's business.
  }
  if (live === null) {
    pass(`Version ${mine}. Could not reach purvex.io, so nothing to compare it to.`);
  } else {
    const theirs = live.match(VERSION_RX);
    const liveVersion = theirs ? Number(theirs[1]) : 0;
    const same = live.replace(/\r\n/g, "\n").trimEnd() === script.replace(/\r\n/g, "\n").trimEnd();
    if (same) pass(`Version ${mine}, already serving, byte for byte.`);
    else if (mine > liveVersion) pass(`Version ${mine}, ahead of the ${liveVersion} being served.`);
    else {
      fail(
        `Version ${mine} is not ahead of the ${liveVersion} purvex.io is serving, but the content has changed.`,
        "Every pod would refuse the update and stay on the old copy. Run: npm run sign:lab-script"
      );
    }
  }
}

if (process.exitCode) console.error("\nThe lab script is not ready to ship.");

"use client";

import Link from "next/link";
import { Eyebrow, H1, Lede, H2, P, Step, TermBlock } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Get started</Eyebrow>
      <H1>First run</H1>
      <Lede>Create your account, sign in, and work through a short setup checklist. Nothing here needs deep security expertise. Each step explains what it&apos;s for.</Lede>

      <H2>Create your account</H2>
      <P>
        Open <code>http://localhost:1120</code> in your browser. A fresh install has no account yet, so you&apos;re
        taken straight to setup. There&apos;s no separate signup form to hunt for. Pick a username, an
        optional email, and a password (12+ characters, with a mix of upper and lower case and a number).
      </P>

      <H2>Sign in</H2>
      <P>Once your account is created, you&apos;re sent to the sign-in screen. Log in with what you just set.</P>

      <H2>Work through the checklist</H2>
      <P>Your dashboard tracks five setup steps. None of them lock you out, so feel free to click around the app first. You&apos;ll need all five done before you can run a real test.</P>

      <Step n="1" title="Connect your SIEM">
        <P><strong>Settings &rarr; SIEM.</strong> Point PurveX at Splunk, Elastic, or Sentinel, whichever your team already uses. It only pulls what it needs to confirm a test set off an alert. See <Link href="/install-guide/data-handling" style={{ color: "var(--accent-deep)", fontWeight: 600 }}>exactly what it never collects</Link>.</P>
      </Step>
      <Step n="2" title="Install the test library">
        <P><strong>Tests &rarr; Explore Coverage</strong> &rarr; pick any technique &rarr; Install catalog. This downloads the Atomic Red Team library, a well-known, open-source set of safe attack simulations. One-time download, then it&apos;s cached for every test after.</P>
      </Step>
      <Step n="3" title="Register a test runner">
        <P><strong>Endpoints &rarr; Add runner.</strong> A test runner is a lab or sandbox machine, never a production one, that PurveX connects to over SSH to actually run the simulated attacks. Before you can use it, you&apos;ll need to confirm its identity with a host-key fingerprint, which you get by running this from a machine you already trust:</P>
        <TermBlock copyText="ssh-keyscan -p 22 <runner-host> | ssh-keygen -lf - -E sha256" lines={<><span className="dc-p1">$</span> <span className="dc-cmd">ssh-keyscan -p 22 &lt;runner-host&gt; | ssh-keygen -lf - -E sha256</span></>} />
        <P>Paste the <code>SHA256:...</code> value it prints into the runner&apos;s settings. This is what stops someone from silently swapping in a different machine later. PurveX won&apos;t run anything against a runner it can&apos;t verify.</P>
      </Step>
      <Step n="4" title="Import or write a detection">
        <P><strong>Detections.</strong> Sync your existing detection rules from the SIEM you connected, or write one by hand and map it to the attack technique it&apos;s meant to catch.</P>
      </Step>
      <Step n="5" title="Run your first test" last>
        <P><strong>Tests &rarr; Run Test.</strong> Pick a technique and watch your dashboard for the result: a pass or fail, backed by the evidence PurveX pulled from your SIEM.</P>
      </Step>
    </>
  );
}

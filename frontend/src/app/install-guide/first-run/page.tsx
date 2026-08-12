"use client";

import Link from "next/link";
import { Eyebrow, H1, Lede, H2, P, Step, TermBlock } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Get started</Eyebrow>
      <H1>First run</H1>
      <Lede>Create an account, sign in, and complete a short setup checklist. No security expertise is required. Each step explains its purpose.</Lede>

      <H2>Create an account</H2>
      <P>
        Open <code>http://localhost:1120</code> in your browser. A fresh installation has no account yet, so
        you are taken directly to setup; there is no separate signup form to locate. Choose a username, an
        optional email address, and a password (12 or more characters, with a mix of upper and lower case and
        a number).
      </P>

      <H2>Sign in</H2>
      <P>Once your account is created, you are directed to the sign-in screen. Sign in with the credentials you just set.</P>

      <H2>Complete the checklist</H2>
      <P>Your dashboard tracks five setup steps. None of them restrict access to the rest of the app, so you can explore it first if you prefer. All five must be completed before you can run a real test.</P>

      <Step n="1" title="Connect your SIEM">
        <P><strong>Settings &rarr; SIEM.</strong> Point PurveX at Splunk, Elastic, or Sentinel, whichever your team already uses. It pulls only what it needs to confirm that a test triggered an alert. See <Link href="/install-guide/data-handling" style={{ color: "var(--accent-deep)", fontWeight: 600 }}>exactly what it never collects</Link>.</P>
      </Step>
      <Step n="2" title="Install the test library">
        <P><strong>Tests &rarr; Explore Coverage</strong> &rarr; select any technique &rarr; Install catalog. This downloads the Atomic Red Team library, a well-known, open-source set of safe attack simulations. It is a one-time download; the library is cached for every test after.</P>
      </Step>
      <Step n="3" title="Register a test runner">
        <P><strong>Endpoints &rarr; Add runner.</strong> A test runner is a lab or sandbox machine, never a production one, that PurveX connects to over SSH to execute simulated attacks. Before you can use it, confirm its identity with a host-key fingerprint. Obtain that fingerprint by running the following command from a machine you already trust:</P>
        <TermBlock copyText="ssh-keyscan -p 22 <runner-host> | ssh-keygen -lf - -E sha256" lines={<><span className="dc-p1">$</span> <span className="dc-cmd">ssh-keyscan -p 22 &lt;runner-host&gt; | ssh-keygen -lf - -E sha256</span></>} />
        <P>Paste the resulting <code>SHA256:...</code> value into the runner&apos;s settings. This confirms the identity of the runner and prevents a different machine from silently being substituted later. PurveX will not run anything against a runner it cannot verify.</P>
      </Step>
      <Step n="4" title="Import or write a detection">
        <P><strong>Detections.</strong> Sync existing detection rules from the SIEM you connected, or write one by hand and map it to the attack technique it is meant to catch.</P>
      </Step>
      <Step n="5" title="Run your first test" last>
        <P><strong>Tests &rarr; Run Test.</strong> Select a technique and monitor your dashboard for the result: a pass or fail, backed by evidence PurveX retrieved from your SIEM.</P>
      </Step>
    </>
  );
}

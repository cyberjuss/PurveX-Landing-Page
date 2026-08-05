"use client";

import Link from "next/link";
import { Eyebrow, H1, Lede, H2, P, Step, TermBlock } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Get started</Eyebrow>
      <H1>First run</H1>
      <Lede>Create the admin account, sign in, and work through the setup checklist.</Lede>

      <H2>Create the admin account</H2>
      <P>
        Visit <code>http://localhost:1120</code>. A fresh install has no admin yet, so it takes you straight to
        first-run setup &mdash; no separate signup form. Set a username, an optional email, and a password (12+
        characters, including upper, lower, and a number).
      </P>

      <H2>Log in</H2>
      <P>You&apos;re redirected to the login screen once the admin account is created. Sign in with what you just set.</P>

      <H2>Work through the checklist</H2>
      <P>The dashboard tracks five steps. They&apos;re advisory, not gates &mdash; you can explore the app before finishing them &mdash; but running a real test needs all five done.</P>

      <Step n="1" title="Connect your SIEM">
        <P><strong>Settings &rarr; SIEM.</strong> Splunk, Elastic, or Sentinel. PurveX pulls only what&apos;s needed to confirm a test fired &mdash; see <Link href="/install-guide/data-handling" style={{ color: "var(--accent-deep)", fontWeight: 600 }}>what it never collects</Link>.</P>
      </Step>
      <Step n="2" title="Install the Atomic Red Team catalog">
        <P><strong>Tests &rarr; Explore Coverage</strong> &rarr; any technique &rarr; Install catalog. One-time download, cached after.</P>
      </Step>
      <Step n="3" title="Register a test runner">
        <P><strong>Settings &rarr; Agents.</strong> A lab or sandbox machine PurveX will SSH into to execute tests &mdash; never a production host. You&apos;ll need its SSH host-key fingerprint, captured from a trusted path:</P>
        <TermBlock copyText="ssh-keyscan -p 22 <runner-host> | ssh-keygen -lf - -E sha256" lines={<><span className="dc-p1">$</span> <span className="dc-cmd">ssh-keyscan -p 22 &lt;runner-host&gt; | ssh-keygen -lf - -E sha256</span></>} />
        <P>Enroll the printed <code>SHA256:...</code> value in the runner config. PurveX refuses to execute anything against a runner without one &mdash; it&apos;s the pinned-host-key check that stops SSH man-in-the-middle.</P>
      </Step>
      <Step n="4" title="Import or author a detection">
        <P><strong>Detections.</strong> Sync from your connected SIEM, or write one manually and map it to a MITRE technique.</P>
      </Step>
      <Step n="5" title="Run your first validation test" last>
        <P><strong>Tests &rarr; Run Test.</strong> Watch the dashboard for a scored result with evidence.</P>
      </Step>
    </>
  );
}

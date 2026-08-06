"use client";

import { Eyebrow, H1, Lede, H2, P, Table, Callout } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Feature guide</Eyebrow>
      <H1>Runners &amp; testing policy</H1>
      <Lede>
        A runner is the machine a test actually executes on. Testing policy is what keeps that from ever touching
        something it shouldn&apos;t.
      </Lede>

      <H2 id="register-a-runner">Register a runner</H2>
      <P>
        <strong>Endpoints &rarr; Add runner.</strong> A runner is a lab, dev, or (carefully) production machine that
        actually executes a test, never PurveX&apos;s own server. PurveX reaches it over SSH. Two ways to add one:
      </P>
      <Table
        head={["Method", "How it works"]}
        rows={[
          [
            "Installer script (recommended)",
            "Generate a short-lived token, download a script for Linux, Windows, or Python, and run it on the target machine. It provisions PurveX's key into the machine's own authorized_keys, reports back its SSH host-key fingerprint automatically, and installs a lightweight heartbeat service.",
          ],
          [
            "Manual SSH",
            "Enter hostname, port, credentials, and the SSH host-key fingerprint yourself, for machines you'd rather not run a script on.",
          ],
        ]}
      />
      <Callout tone="warn">
        The SSH host-key fingerprint isn&apos;t optional paperwork. PurveX refuses to run anything against an SSH
        runner without one. It&apos;s what stops a man-in-the-middle from silently swapping in a different machine
        later.
      </Callout>
      <P>
        Every runner is tagged with an <strong>environment</strong> (lab, dev, prod, or anything else you name).
        That&apos;s what the Run Test wizard uses to offer it as a target. The Endpoints page shows each
        runner&apos;s state (Ready, Needs review, Paused, Silent), recent validation history, and last check-in.
        Need to take one offline for a while? Use <strong>Pause</strong> and <strong>Resume</strong>.
      </P>

      <H2 id="testing-policy">Testing policy</H2>
      <P><strong>Settings &rarr; Testing Policy.</strong> The guardrails around what tests are allowed to touch.</P>
      <Table
        head={["Setting", "What it does"]}
        rows={[
          ["Allowed environments", "Lab / Dev / Prod toggles. This one is enforced: PurveX will refuse to run a test in an environment you haven't allowed."],
          ["Test markers", "A prefix (and optional environment/timestamp suffix) stamped on every test, plus a SOC alert tag, so test activity is easy to filter out of real alerts."],
          ["Production safeguards", "Notify before production tests; require a declared maintenance window for prod runs."],
          ["Business hours", "Block tests from running during a time window you set."],
          ["Data retention", "How long pass/fail results are kept, globally and per environment (defaults: Lab 7/30 days, Dev 30/90, Prod 90/180)."],
        ]}
      />
      <Callout tone="info">
        <strong>Where we are today:</strong> the allowed-environments check is fully enforced server-side, and a
        production run always requires a written reason. Business hours, the maintenance-window requirement, and
        pre-prod notifications are configurable and saved, but nothing in the run path reads them yet. Treat them
        as recorded intent rather than an active block until that lands. We&apos;ll tighten this guide as
        enforcement catches up to the settings.
      </Callout>
    </>
  );
}

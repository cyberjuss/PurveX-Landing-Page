"use client";

import { Eyebrow, H1, Lede, H2, P, Table, Callout } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Feature guide</Eyebrow>
      <H1>Runners &amp; testing policy</H1>
      <Lede>
        A runner is the machine a test executes on. Testing policy governs what a runner is permitted to
        touch.
      </Lede>

      <H2 id="register-a-runner">Register a runner</H2>
      <P>
        <strong>Endpoints &rarr; Add runner.</strong> A runner is a lab, dev, or (carefully) production machine
        that executes a test, never PurveX&apos;s own server. PurveX reaches it over SSH. Two methods are
        available:
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
            "Enter hostname, port, credentials, and the SSH host-key fingerprint directly, for machines where running a script is not preferred.",
          ],
        ]}
      />
      <Callout tone="warn">
        The SSH host-key fingerprint is not optional. PurveX refuses to run anything against an SSH
        runner without one. It is what prevents a machine-in-the-middle from silently substituting a different
        machine later.
      </Callout>
      <P>
        Every runner is tagged with an <strong>environment</strong> (lab, dev, prod, or any other name chosen).
        This is what the Run Test wizard uses to offer it as a target. The Endpoints page shows each
        runner&apos;s state (Ready, Needs review, Paused, Silent), recent validation history, and last check-in.
        Use <strong>Pause</strong> and <strong>Resume</strong> to take a runner offline temporarily.
      </P>

      <H2 id="testing-policy">Testing policy</H2>
      <P><strong>Settings &rarr; Testing Policy.</strong> The guardrails governing what tests are allowed to touch.</P>
      <Table
        head={["Setting", "What it does"]}
        rows={[
          ["Allowed environments", "Lab / Dev / Prod toggles. This setting is enforced: PurveX refuses to run a test in an environment that has not been allowed."],
          ["Test markers", "A prefix (and optional environment/timestamp suffix) stamped on every test, plus a SOC alert tag, so test activity can be filtered out of real alerts."],
          ["Production safeguards", "Notify before production tests; require a declared maintenance window for prod runs."],
          ["Business hours", "Block tests from running during a configured time window."],
          ["Data retention", "How long pass/fail results are kept, globally and per environment (defaults: Lab 7/30 days, Dev 30/90, Prod 90/180)."],
        ]}
      />
      <Callout tone="info">
        <strong>Current status:</strong> the allowed-environments check is fully enforced server-side, and a
        production run always requires a written reason. Business hours, the maintenance-window requirement, and
        pre-prod notifications are configurable and saved, but nothing in the run path reads them yet. Treat
        these settings as recorded intent rather than an active block until enforcement lands. This guide will
        be updated as enforcement catches up to the settings.
      </Callout>
    </>
  );
}

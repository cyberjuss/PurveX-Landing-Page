"use client";

import Link from "next/link";
import { Eyebrow, H1, Lede, H2, P, Callout } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Feature guide</Eyebrow>
      <H1>Platform tools</H1>
      <Lede>The schedules that keep testing honest and the numbers that tell you how you&apos;re doing.</Lede>

      <Callout tone="info">
        <strong>Watchtower, the AI assistant, is coming in a future release.</strong> It&apos;s not part of the
        current version.
      </Callout>

      <H2 id="notifications">Notifications</H2>
      <P>
        The bell icon in the header. PurveX tells you when a new runner connects, when one stops checking in (and
        blocks test runs against it until it&apos;s back), and when a proposed detection change gets approved and
        deployed. Dismiss individually, dismiss everything older than a week, or dismiss all.
      </P>

      <H2 id="schedules">Schedules</H2>
      <P>
        <strong>Settings &rarr; Test Schedules.</strong> Pick a detection or a technique, an environment, and
        either a one-time run, a repeating interval (down to every minute, up to every 7 days), or a cron
        expression. Production scheduling is Administrator-only. Pause, resume, or delete a schedule any time.
        Creating a schedule is a paid-plan feature; running tests manually stays free on every plan.
      </P>

      <H2 id="scoring-and-reports">Scoring &amp; reports</H2>
      <P>
        Every test gets a score from 0 to 100 based on whether telemetry arrived, how fast, whether the rule
        fired, and how fast. Those roll up on the <strong>Reports</strong> page into an overall{" "}
        <strong>Posture</strong> score for your whole organization, trended against the prior period, free on
        every plan.
      </P>
      <P>
        Exporting that view as a formal PDF, for a leadership update or an audit trail, is a paid-plan feature.
      </P>

      <H2 id="license">License</H2>
      <P>
        <strong>Settings &rarr; License.</strong> Free plan covers 3 team members, 1 test runner, 3 test runs a
        day, and 30 days of audit history. Paid unlocks unlimited team members, runners, and daily runs, plus
        schedules, Detection-as-Code, PDF report export, and unlimited audit retention. Paste a license key into
        this page to unlock it. It takes effect immediately, no restart. See
        the <Link href="/pricing" style={{ color: "var(--accent-deep)", fontWeight: 600 }}>pricing page</Link> to get one.
      </P>

      <Callout tone="info">
        <strong>Where we are today:</strong> the weights behind each test&apos;s score (how much a fast detection
        counts vs. a slow one, for example) are configurable, but only through the API right now. There&apos;s
        no settings page for it yet. The defaults are sensible, and we&apos;ll add the UI for tuning them later.
      </Callout>
    </>
  );
}

"use client";

import Link from "next/link";
import { Eyebrow, H1, Lede, H2, P, Callout } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Feature guide</Eyebrow>
      <H1>Platform tools</H1>
      <Lede>The schedules that keep testing honest and the numbers that report how a team is doing.</Lede>

      <Callout tone="info">
        <strong>Watchtower, the AI assistant, is coming in a future release.</strong> It is not part of the
        current version.
      </Callout>

      <H2 id="notifications">Notifications</H2>
      <P>
        The bell icon in the header. PurveX reports when a new runner connects, when one stops checking in (and
        blocks test runs against it until it returns), and when a proposed detection change is approved and
        deployed. Dismiss notifications individually, dismiss everything older than a week, or dismiss all.
      </P>

      <H2 id="schedules">Schedules</H2>
      <P>
        <strong>Settings &rarr; Test Schedules.</strong> Select a detection or a technique, an environment, and
        either a one-time run, a repeating interval (from every minute up to every 7 days), or a cron
        expression. Production scheduling is Administrator-only. Pause, resume, or delete a schedule at any
        time. Creating a schedule is a paid-plan feature; running tests manually remains free on every plan.
      </P>

      <H2 id="scoring-and-reports">Scoring &amp; reports</H2>
      <P>
        Every test receives a score from 0 to 100 based on whether telemetry arrived, how quickly, whether the
        rule fired, and how quickly. These roll up on the <strong>Reports</strong> page into an overall{" "}
        <strong>Posture</strong> score for the organization, trended against the prior period, free on
        every plan.
      </P>
      <P>
        Exporting that view as a formal PDF, for a leadership update or an audit trail, is a paid-plan feature.
      </P>

      <H2 id="license">License</H2>
      <P>
        <strong>Settings &rarr; License.</strong> The free plan covers 3 team members, 1 test runner, 3 test runs
        per day, and 30 days of audit history. The paid plan unlocks unlimited team members, runners, and daily
        runs, plus schedules, Detection-as-Code, PDF report export, and unlimited audit retention. Upload a
        license file on this page to unlock it; it takes effect immediately, with no restart required. See
        the <Link href="/pricing" style={{ color: "var(--accent-deep)", fontWeight: 600 }}>pricing page</Link> to obtain one.
      </P>

      <Callout tone="info">
        <strong>Current status:</strong> the weights behind each test&apos;s score (for example, how much a fast
        detection counts relative to a slow one) are configurable, but only through the API at this time. There
        is no settings page for it yet. The defaults are sensible; a tuning UI will follow in a later release.
      </Callout>
    </>
  );
}

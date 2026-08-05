"use client";

import Link from "next/link";
import { Eyebrow, H1, Lede, H2, P, Callout } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Feature guide</Eyebrow>
      <H1>Platform tools</H1>
      <Lede>The assistant that explains a failure, the schedules that keep testing honest, and the numbers that tell you how you&apos;re doing.</Lede>

      <H2 id="watchtower">Watchtower, the AI assistant</H2>
      <P>
        <strong>AI Assistant</strong> in the sidebar &mdash; a chat interface for asking about your detection
        portfolio, plus automatic plain-language analysis attached to every failed or inconclusive test result. It
        only ever reasons over data already in PurveX &mdash; your detections, test history, and sample events
        &mdash; nothing is sent anywhere unless you configure a provider.
      </P>
      <P>
        <strong>Settings &rarr; Watchtower.</strong> Pick a provider (OpenAI or DeepSeek), an analysis depth, and
        what it&apos;s allowed to do &mdash; suggest tuning fixes, explain failures. Data-sharing toggles strip IPs
        and hostnames by default. Leave the provider&apos;s API key unset on the server and Watchtower just
        explains that it&apos;s unavailable instead of erroring &mdash; nothing else about the product changes.
      </P>

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
      </P>

      <H2 id="scoring-and-reports">Scoring &amp; reports</H2>
      <P>
        Every test gets a 0&ndash;100 score based on whether telemetry arrived, how fast, whether the rule fired,
        and how fast. Those roll up on the <strong>Reports</strong> page into an overall{" "}
        <strong>Posture</strong> score for your whole organization, trended against the prior period, alongside
        proven ATT&amp;CK coverage percentage, validations run, and detections that regressed between rule
        versions.
      </P>

      <H2 id="license">License</H2>
      <P>
        <strong>Settings &rarr; License.</strong> Free plan covers 3 team members and 1 test runner. Paste a
        license key here to unlock a paid plan&apos;s limits &mdash; it takes effect immediately, no restart. See
        the <Link href="/pricing" style={{ color: "var(--accent-deep)", fontWeight: 600 }}>pricing page</Link> to get one.
      </P>

      <Callout tone="info">
        <strong>Where we are today:</strong> the weights behind each test&apos;s score (how much a fast detection
        counts vs. a slow one, for example) are configurable, but only through the API right now &mdash; there&apos;s
        no settings page for it yet. The defaults are sensible; we&apos;ll add the UI for tuning them later.
      </Callout>
    </>
  );
}

"use client";

import { Eyebrow, H1, Lede, P } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Reference</Eyebrow>
      <H1>What PurveX does and doesn&apos;t collect</H1>
      <Lede>PurveX validates detections &mdash; it does not mirror or store your SIEM data.</Lede>

      <ul className="dc-list">
        <li>Pulls only the minimum needed to confirm whether a test triggered an alert</li>
        <li>Uses scoped queries with minimal permissions</li>
        <li>Defaults to deep-linking back to your SIEM for full event details</li>
      </ul>

      <P>Never collected:</P>
      <ul className="dc-list">
        <li>Raw event logs or payloads</li>
        <li>PII or customer data</li>
        <li>Case notes or IR artifacts</li>
      </ul>

      <P>
        Everything PurveX does store lives in your own PostgreSQL database, on your own infrastructure. SIEM
        connection credentials, 2FA secrets, and detection-source tokens are encrypted at rest with the
        <code> PURVEX_ENCRYPTION_KEY</code> you set during installation. There is no PurveX cloud component and no
        telemetry sent back to us.
      </P>
    </>
  );
}

"use client";

import { Eyebrow, H1, Lede, P } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Reference</Eyebrow>
      <H1>What PurveX does and doesn&apos;t collect</H1>
      <Lede>PurveX checks whether your detections work &mdash; it doesn&apos;t copy or store your SIEM data to do that.</Lede>

      <ul className="dc-list">
        <li>Only pulls the small amount of data needed to confirm whether a test set off an alert</li>
        <li>Asks your SIEM for narrowly-scoped results, using the fewest permissions it can get away with</li>
        <li>Links back to your SIEM for the full event details, instead of storing a copy itself</li>
      </ul>

      <P>It never collects:</P>
      <ul className="dc-list">
        <li>Raw event logs or their contents</li>
        <li>Personal or customer data</li>
        <li>Case notes or incident-response records</li>
      </ul>

      <P>
        Whatever PurveX does store lives in your own PostgreSQL database, on your own machine &mdash; not in
        anything we run. SIEM login credentials, two-factor authentication (2FA) codes if you turn that feature on,
        and detection-source tokens are all encrypted before they&apos;re saved, using the
        <code> PURVEX_ENCRYPTION_KEY</code> you set during installation. There&apos;s no PurveX cloud service
        involved, and nothing is ever sent back to us.
      </P>
    </>
  );
}

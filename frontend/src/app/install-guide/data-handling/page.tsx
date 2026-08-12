"use client";

import { Eyebrow, H1, Lede, P } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Reference</Eyebrow>
      <H1>What PurveX does and does not collect</H1>
      <Lede>PurveX checks whether your detections work. It does not copy or store your SIEM data to do that.</Lede>

      <ul className="dc-list">
        <li>Pulls only the small amount of data needed to confirm whether a test set off an alert</li>
        <li>Requests narrowly scoped results from your SIEM, using the fewest permissions required</li>
        <li>Links back to your SIEM for full event details instead of storing a copy itself</li>
      </ul>

      <P>It never collects:</P>
      <ul className="dc-list">
        <li>Raw event logs or their contents</li>
        <li>Personal or customer data</li>
        <li>Case notes or incident-response records</li>
      </ul>

      <P>
        Whatever PurveX does store lives in your own database, on your own machine, not in anything we run.
        SIEM login credentials and detection-source tokens are encrypted before they are saved, using the
        <code> PURVEX_ENCRYPTION_KEY</code> generated during installation. No PurveX cloud service is
        involved, and nothing is ever sent back to us.
      </P>
    </>
  );
}

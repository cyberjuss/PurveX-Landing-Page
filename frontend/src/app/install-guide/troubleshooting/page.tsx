"use client";

import { Eyebrow, H1, Lede, Table } from "@/components/purvex-landing-page/docs-content";

const TROUBLESHOOTING: [string, string][] = [
  ["Login succeeds but bounces back to /login", "Your browser isn't holding on to the session cookie. On plain localhost this shouldn't happen. Behind a reverse proxy, it usually means HTTPS isn't set up correctly on that proxy — the cookie is marked \"HTTPS only\" but arrives over plain HTTP, so the browser silently drops it."],
  ["A test runs forever, never completes", "The background worker (the process that actually runs tests behind the scenes) isn't running, or Redis is unreachable if you've configured one. Check that worker's own log output for the specific error."],
  ["“Agent never comes online” after registering a runner", "Confirm the runner machine can actually reach the PurveX server over the network, and that its registration token hasn't expired — tokens are single-use and only valid for a short window. On Windows, run the installer as administrator."],
  ["Setup keeps redirecting back after creating the admin account", "Your browser isn't accepting the session cookie PurveX just issued (same-origin required; HTTPS if you've turned on secure cookies). Clear cookies for the site and try going to /login directly."],
  ["The test library never finishes installing", "Check that the server can reach GitHub over the internet. If you're on an isolated network with no internet access, pre-stage the archive yourself at the path set in PURVEX_ATOMIC_DATA_DIR instead."],
  ["SIEM “test connection” passes but no events show up", "The pattern PurveX looks for in your logs doesn't match what your SIEM is actually sending. Double-check the SIEM-side filter matches the connector's configured log_marker_pattern setting."],
  ["Encrypted data fails to read after restarting", "PURVEX_ENCRYPTION_KEY changed, or the original was lost. Restore the exact value you set during installation — there's no way to recover that data without it."],
];

export default function Page() {
  return (
    <>
      <Eyebrow>Reference</Eyebrow>
      <H1>Troubleshooting</H1>
      <Lede>The problems that come up most often during and right after install, and what to check first.</Lede>

      <Table
        head={["Symptom", "First check"]}
        rows={TROUBLESHOOTING}
        variant="trouble"
      />
    </>
  );
}

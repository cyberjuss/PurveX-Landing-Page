"use client";

import { Eyebrow, H1, Lede } from "@/components/purvex-landing-page/docs-content";

const FAQ: [string, string][] = [
  ["Is PurveX a replacement for my SIEM?", "No. PurveX reads from your SIEM; it doesn't replace it. You still need Splunk, Elastic, Sentinel, or similar for PurveX to be useful."],
  ["Is it safe to run against production?", "Atomic Red Team tests are scoped and reversible by design, and PurveX adds its own Testing Policy layer on top — PROD runs are restricted to admins, inside configured maintenance windows, with irreversible atomics blocked outright."],
  ["Does the AI assistant send data to third parties?", "Only if you configure it with an external provider (OpenAI, DeepSeek). Leave OPENAI_API_KEY blank and it disables cleanly — nothing is sent anywhere."],
  ["Can one instance serve multiple teams or clients?", "Yes — PurveX is multi-tenant. Organizations are isolated from each other, and a user can hold different roles across different organizations."],
  ["Do I need Redis for a local install?", "No. Redis backs distributed rate limiting and the job queue for multi-replica production deployments. A single-machine install works without it — set REDIS_URL only if you're testing that path specifically."],
  ["What happens if I lose PURVEX_ENCRYPTION_KEY?", "Every encrypted column — SIEM credentials, 2FA secrets, source tokens — becomes permanently unreadable. There's no recovery path other than restoring the original key. Back it up before you store any real credentials."],
];

export default function Page() {
  return (
    <>
      <Eyebrow>Reference</Eyebrow>
      <H1>FAQ</H1>
      <Lede>Questions that come up during install, before anyone&apos;s touched the product yet.</Lede>

      <div>
        {FAQ.map(([q, a]) => (
          <div className="dc-faq__item" key={q}>
            <p className="dc-faq__q">{q}</p>
            <p className="dc-faq__a">{a}</p>
          </div>
        ))}
      </div>
    </>
  );
}

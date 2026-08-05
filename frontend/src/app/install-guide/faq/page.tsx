"use client";

import { Eyebrow, H1, Lede } from "@/components/purvex-landing-page/docs-content";

const FAQ: [string, string][] = [
  ["Is PurveX a replacement for my SIEM?", "No. PurveX reads from your SIEM, it doesn't replace it. You still need Splunk, Elastic, Sentinel, or something similar already in place for PurveX to be useful."],
  ["Do I need to set up two-factor authentication (2FA)?", "No — 2FA is entirely optional and off by default. Nothing in setup requires it. If you'd like to turn it on for your account later, you can from your profile settings; if you never touch it, nothing changes about how PurveX works."],
  ["Is it safe to run against production?", "Yes, by design. The attack simulations PurveX runs (from the Atomic Red Team library) are scoped and reversible, and PurveX adds its own policy layer on top: production runs are restricted to admins, only allowed inside maintenance windows you configure, and anything irreversible is blocked outright."],
  ["Does the AI assistant send my data to third parties?", "Only if you choose to connect one (OpenAI or DeepSeek). Leave OPENAI_API_KEY blank during install and the assistant just turns itself off — nothing is sent anywhere, and nothing else about the product changes."],
  ["Can one install serve multiple teams or clients?", "Yes. PurveX supports multiple organizations on a single install, fully isolated from each other, and the same person can hold different roles across different organizations."],
  ["Do I need Redis for a local install?", "No. Redis is only needed for the rate limiting and job queue behind larger, multi-server production deployments. A single-machine install works fine without it — only set REDIS_URL if you're specifically testing that setup."],
  ["What happens if I lose PURVEX_ENCRYPTION_KEY?", "Everything it protects — SIEM credentials, 2FA codes, source tokens — becomes permanently unreadable. There's no way to recover it besides restoring the original key, so back it up before you connect any real credentials."],
];

export default function Page() {
  return (
    <>
      <Eyebrow>Reference</Eyebrow>
      <H1>FAQ</H1>
      <Lede>Questions that tend to come up during install, before anyone&apos;s actually used the product yet.</Lede>

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

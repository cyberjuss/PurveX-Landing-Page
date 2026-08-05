"use client";

import Link from "next/link";
import { Clock, Server, ShieldCheck } from "lucide-react";
import { Eyebrow, H1, Lede, MetaRow, H2, P, Table } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Install guide</Eyebrow>
      <H1>Get PurveX running on your own infrastructure</H1>
      <Lede>
        PurveX connects to your SIEM, runs Atomic Red Team tests against your environment, and tells you whether
        your detections actually fired &mdash; with evidence. This guide walks through a self-hosted install end to
        end: clone, configure, start, create the admin account, and run your first validation.
      </Lede>
      <MetaRow>
        <span><Clock size={14} /> About 10 minutes</span>
        <span><Server size={14} /> Self-hosted, single machine</span>
        <span><ShieldCheck size={14} /> Nothing leaves your perimeter</span>
      </MetaRow>

      <H2>Prerequisites</H2>
      <P>The install script checks these too, but it&apos;s faster to fix gaps up front.</P>
      <Table
        head={["Tool", "Version", "Check"]}
        rows={[
          ["Python", "3.11+", <code key="c">python --version</code>],
          ["Node.js", "20+", <code key="c">node --version</code>],
          ["npm", "9+", <code key="c">npm --version</code>],
          ["PostgreSQL", "14+", <code key="c">psql --version</code>],
          ["Git", "optional", <code key="c">git --version</code>],
        ]}
      />

      <H2>What you&apos;re installing</H2>
      <P>
        A FastAPI backend, a Next.js frontend, and PostgreSQL for storage &mdash; all running on one machine you
        control. There&apos;s no PurveX cloud component: nothing calls out except to a SIEM you configure, and
        optionally an LLM provider if you enable the AI assistant.
      </P>
      <P>
        Ready? <Link href="/install-guide/installation" style={{ color: "var(--accent-deep)", fontWeight: 600 }}>Start with installation &rarr;</Link>
      </P>
    </>
  );
}

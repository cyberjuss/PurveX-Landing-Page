"use client";

import { Eyebrow, H1, Lede, H2, P, Table } from "@/components/purvex-landing-page/docs-content";

export default function Page() {
  return (
    <>
      <Eyebrow>Feature guide</Eyebrow>
      <H1>Team &amp; access</H1>
      <Lede>Who&apos;s on your team, what they can do, and the record of what actually happened.</Lede>

      <H2 id="inviting-people">Inviting people</H2>
      <P>
        <strong>Settings &rarr; Users &rarr; Add member.</strong> Enter an email and send. PurveX emails an
        activation link, and the new person sets their own password. Nobody, including the admin who invited them,
        ever sees or chooses that password. The row shows <strong>Pending</strong> until they accept, then flips
        to <strong>Active</strong>.
      </P>

      <H2 id="roles">Roles</H2>
      <P>Four fixed roles. There&apos;s no custom role builder today.</P>
      <Table
        head={["Role", "Can do"]}
        rows={[
          ["Administrator", "Everything, including production runs, SIEM management, and user/settings administration"],
          ["Detection Engineer", "Build and maintain detections, run validation in lab/dev, export reports"],
          ["Security Analyst", "Review coverage, run lab validations, use Watchtower"],
          ["Viewer", "Read-only across detections, evidence, endpoints, and settings summaries"],
        ]}
      />
      <P>
        Assign a role from the dropdown on that person&apos;s row in Settings &rarr; Users. Remove one by clicking
        the &times; on their role chip.
      </P>
      <P>
        A few actions stay Administrator-only no matter what role someone holds: production runs, deploying
        high-criticality detections, deleting detections, and managing settings.
      </P>

      <H2 id="audit-log">Audit log</H2>
      <P>
        <strong>Settings &rarr; Audit.</strong> Every configuration change, login, and test run, with who did it
        and when. Searchable, filterable by action or resource type, and exportable as CSV. An admin can
        also set a minimum retention window and purge anything older.
      </P>

      <H2 id="one-org-per-account">One organization per account</H2>
      <P>
        Each PurveX login belongs to exactly one organization. There&apos;s no switcher. If someone genuinely
        needs access to two separate PurveX organizations, that&apos;s two separate accounts. Within an
        organization, everything is fully isolated: detections, tests, users, settings, and the audit log never
        cross organization boundaries, even on a shared self-hosted instance.
      </P>
    </>
  );
}

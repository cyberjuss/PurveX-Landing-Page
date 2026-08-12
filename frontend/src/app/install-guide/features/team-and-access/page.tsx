"use client";

import { Eyebrow, H1, Lede, H2, P, RoleBlock } from "@/components/purvex-landing-page/docs-content";

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
      <P>Four fixed roles. There&apos;s no custom role builder today. This is the same breakdown shown in the app itself, under Settings &rarr; Users.</P>

      <RoleBlock
        name="Administrator"
        can={[
          "Manage users, roles, organization settings, SIEM connections, and endpoints",
          "Run and schedule production validations",
          "Approve high-severity and production changes",
        ]}
        cannot={[
          "Bypass audit logging or tenant isolation",
          "Remove the last protected administrator through normal role removal",
        ]}
      />
      <RoleBlock
        name="Detection Engineer"
        can={[
          "Create and edit detections",
          "Run lab/dev validations and schedule lab/dev tests",
          "View endpoint status and export reports",
        ]}
        cannot={[
          "Manage users, SIEM connections, endpoints, or organization settings",
          "Run or schedule production validations",
          "Change severity or approve high-severity/production promotion",
        ]}
      />
      <RoleBlock
        name="Security Analyst"
        can={[
          "Read detections, tests, endpoint status, and reports",
          "Create test records and run lab validations",
          "Use Watchtower for analysis",
        ]}
        cannot={[
          "Edit detections or change lifecycle/severity",
          "Run dev or production validations",
          "Manage settings, SIEM connections, endpoints, users, or roles",
        ]}
      />
      <RoleBlock
        name="Viewer"
        can={[
          "Read detections, validation evidence, endpoint status, settings summaries, and reports",
        ]}
        cannot={[
          "Create, update, delete, deploy, approve, or run anything",
          "Use Watchtower",
          "Manage settings, users, SIEM connections, or endpoints",
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
      <P>
        Free plans see the last 30 days. Paid plans see everything, for as long as you choose to keep it.
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

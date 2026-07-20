import type { Metadata } from "next";
import { Building2, Database, Mail, Shield, ShieldCheck } from "lucide-react";
import LegalPage from "@/components/purvex-landing-page/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | PurveX",
  description:
    "PurveX privacy policy for enterprise customers, prospects, and website visitors.",
};

const highlights = [
  {
    icon: Building2,
    title: "Built for B2B relationships",
    body:
      "PurveX is designed for business users, security teams, and enterprise buying groups. This policy explains how we handle company, account, billing, and platform data.",
  },
  {
    icon: Database,
    title: "Clear roles for service data",
    body:
      "For customer environment data processed in the platform, PurveX generally acts as a processor or service provider acting on the customer's documented instructions.",
  },
  {
    icon: Shield,
    title: "Limited use and controlled sharing",
    body:
      "We use personal information to operate, secure, support, and improve the service, manage commercial relationships, and meet legal obligations.",
  },
];

const summaryItems = [
  "PurveX collects account, support, billing, site, and service-operational data needed to run the platform.",
  "Customer environment data submitted to the service is generally processed under customer instructions.",
  "PurveX does not use customer service data for unrelated advertising purposes.",
  "Vendors receive data only as needed to host, secure, support, bill, and operate the service.",
  "Privacy and data-rights requests may need to be routed through the relevant customer when PurveX is acting as a processor or service provider.",
];

const sections = [
  {
    title: "1. Scope",
    paragraphs: [
      "This Privacy Policy describes how PurveX collects, uses, discloses, and protects personal information in connection with our websites, product demos, trials, commercial activities, and the PurveX platform.",
      "This policy is intended for business-to-business use. It applies to information relating to employees, contractors, administrators, buyers, and other representatives of our customers, prospects, partners, and vendors, as well as website visitors.",
      "Where a customer uploads, transmits, or otherwise makes available data through the PurveX service, that customer remains responsible for determining whether the data may be lawfully processed. In those circumstances, PurveX typically processes that data on the customer's behalf under the applicable commercial agreement or data processing terms.",
    ],
  },
  {
    title: "2. Information We Collect",
    paragraphs: [
      "We collect business contact and account information such as name, company name, business email address, job title, authentication identifiers, account preferences, and support communications.",
      "We collect commercial and transaction information such as subscription details, billing contact information, invoicing records, and payment-related metadata. Card numbers and similar payment credentials are typically processed by our payment providers rather than stored by PurveX.",
      "We collect technical and usage information such as IP address, browser type, device and network identifiers, cookie or similar online identifiers, log data, product usage events, security events, diagnostic information, and configuration metadata necessary to deliver and secure the service.",
      "If a customer uses PurveX to evaluate detections, validate telemetry, or upload environment-related materials, we may process service data, test results, audit trails, uploaded documents, and related platform content in accordance with the customer's instructions.",
    ],
  },
  {
    title: "3. How We Use Information",
    paragraphs: [
      "We use personal information to provide, maintain, secure, support, and improve the PurveX platform and related services.",
      "We use information to authenticate users, administer accounts, provision access, process billing, respond to inquiries, deliver support, communicate about product updates, detect abuse, investigate incidents, enforce our agreements, and comply with legal obligations.",
      "We may also use business contact information for reasonable B2B marketing, event invitations, and sales outreach where permitted by law. You may opt out of non-essential marketing communications at any time.",
    ],
  },
  {
    title: "4. Legal Bases and Processing Roles",
    paragraphs: [
      "Where applicable data protection laws require a legal basis, PurveX relies on one or more of the following: performance of a contract, legitimate interests in operating and securing our business and service, compliance with legal obligations, and consent where specifically required.",
      "PurveX acts as an independent controller for website analytics, account administration, billing, vendor management, business communications, compliance, and similar corporate purposes. For customer service data processed in the platform, PurveX generally acts as a processor or service provider.",
      "If you interact with PurveX through your employer or another customer organization, that organization may be the primary controller of certain information submitted to the service. Requests relating to such service data should generally be directed to the relevant customer first.",
    ],
  },
  {
    title: "5. How We Share Information",
    paragraphs: [
      "We disclose information only where reasonably necessary for business and service operations, including to hosting providers, infrastructure providers, analytics providers, customer support tools, professional advisers, payment processors, and other vendors operating under appropriate contractual restrictions.",
      "We may disclose information to comply with law, lawful process, government requests, or to protect the rights, safety, security, and integrity of PurveX, our customers, users, and the public.",
      "We may also disclose information in connection with an actual or proposed merger, acquisition, financing, reorganization, or sale of assets, subject to customary confidentiality and lawful handling requirements.",
      "We do not sell personal information in the ordinary meaning of that term, and we do not share personal information for cross-context behavioral advertising in a manner inconsistent with this policy.",
    ],
  },
  {
    title: "6. International Transfers",
    paragraphs: [
      "PurveX and its service providers may process information in the United States and other jurisdictions where we or our subprocessors operate. Where required, we use appropriate safeguards for cross-border transfers, such as contractual protections and related supplementary measures.",
    ],
  },
  {
    title: "7. Data Retention",
    paragraphs: [
      "We retain personal information for as long as reasonably necessary to fulfill the purposes described in this policy, including to provide the service, maintain security records, resolve disputes, enforce agreements, and satisfy legal, tax, accounting, and compliance obligations.",
      "Retention periods vary based on the nature of the data, the sensitivity of the information, the customer's instructions, applicable law, and operational needs. When data is no longer required, we delete, de-identify, or securely limit access to it in accordance with our retention practices.",
    ],
  },
  {
    title: "8. Security",
    paragraphs: [
      "PurveX uses administrative, technical, and physical safeguards designed to protect personal information against unauthorized access, loss, misuse, alteration, and disclosure. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
      "Customers remain responsible for their own endpoint, identity, and environment security practices, including account credential protection, access governance, and appropriate configuration of the PurveX service within their environments.",
    ],
  },
  {
    title: "9. Your Rights and Choices",
    paragraphs: [
      "Depending on your location and the context of the processing, you may have rights to request access, correction, deletion, restriction, portability, objection, or withdrawal of consent. You may also have the right to appeal certain privacy decisions or lodge a complaint with a supervisory authority.",
      "If your information is processed by PurveX on behalf of one of our customers, we may need to refer your request to that customer because it controls the relevant service data.",
      "You may submit privacy requests through the methods designated by PurveX, including email at privacy@purvex.com and, where made available, account, web, or support-channel request workflows. PurveX may take reasonable steps to verify identity and request authority before acting on a request.",
      "You may opt out of promotional emails by using the unsubscribe link in the message or by contacting us directly. Service, security, billing, and transactional communications are not marketing opt-out communications.",
    ],
  },
  {
    title: "10. Cookies and Similar Technologies",
    paragraphs: [
      "PurveX may use cookies, local storage, and similar technologies to keep users signed in, remember preferences, secure sessions, understand site performance, and improve the user experience. Where required by law, we will obtain consent before using non-essential technologies.",
      "Where third-party tools are used for hosting, analytics, security, support, or embedded functionality, those providers may receive technical information such as IP address, browser information, device identifiers, and interaction data as needed to deliver their services.",
    ],
  },
  {
    title: "11. California Do Not Track Disclosure",
    paragraphs: [
      "Some web browsers offer a Do Not Track setting. Because there is no single uniform industry standard for responding to these signals, PurveX does not promise that all websites, services, or third-party tools associated with the service will respond to Do Not Track signals in a particular way unless we explicitly say so in a product-specific notice.",
      "Third parties integrated into the website or service, such as infrastructure, analytics, security, communications, or support providers, may collect information over time and across different online services in accordance with their own notices and contractual roles.",
    ],
  },
  {
    title: "12. Children's Privacy",
    paragraphs: [
      "The PurveX service and website are not directed to children, and PurveX does not knowingly collect personal information from children under 13, or a higher age threshold where required by applicable law.",
    ],
  },
  {
    title: "13. Changes to This Policy",
    paragraphs: [
      "We may update this Privacy Policy from time to time to reflect changes in our service, business practices, or legal obligations. When we make material changes, we will update the effective date on this page and take additional notice steps where required.",
    ],
  },
  {
    title: "14. Contact",
    paragraphs: [
      "For privacy-related questions or requests, contact PurveX at privacy@purvex.com or through the business contact information provided in your order form, master services agreement, or customer support channel.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      badge="Privacy Policy"
      updated="Last updated April 4, 2026"
      title="Privacy terms written for enterprise buyers, security teams, and procurement review."
      intro="This policy is structured for a B2B SaaS relationship. It explains what PurveX collects, why we collect it, how we use and share it, and how we handle customer service data when organizations use the platform to validate detections, telemetry, and security coverage."
      highlights={highlights}
      summaryTitle="Practical summary"
      summaryItems={summaryItems}
      contactLabel="Privacy contact"
      contactIcon={Mail}
      contactBody={
        <>
          Email{" "}
          <a href="mailto:privacy@purvex.com">privacy@purvex.com</a> or use
          the business contact path defined in your commercial agreement.
        </>
      }
      caveatLabel="Privacy notice"
      caveatIcon={ShieldCheck}
      caveatBody="This page is a professional B2B privacy notice, not a substitute for advice from counsel familiar with your specific jurisdictions, subprocessors, retention schedules, and commercial commitments."
      sectionsHeading="Full Policy"
      sections={sections}
    />
  );
}

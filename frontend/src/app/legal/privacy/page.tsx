import type { Metadata } from "next";
import LegalPage from "@/components/purvex-landing-page/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | PurveX",
  description:
    "PurveX privacy policy for enterprise customers, prospects, and website visitors.",
};

const summaryItems = [
  "PurveX collects account, support, billing, and site data needed to run the website and the PurveX Labs software.",
  "PurveX Labs is self-hosted: PurveX does not host, access, or process the SIEM data, detection data, or environment data inside your PurveX Labs instance.",
  "Security Operations and Cybersecurity Training engagements are governed by your signed contract, which may include its own data-handling terms.",
  "PurveX does not use customer data for unrelated advertising purposes and does not sell personal information.",
  "Named service providers (Stripe, Supabase, Resend, Vercel) receive data only as needed to host, secure, support, and bill for the website and portal.",
];

const sections = [
  {
    title: "1. Scope",
    paragraphs: [
      "This Privacy Policy describes how PurveX LLC, a Maryland limited liability company (\"PurveX,\" \"we,\" \"us,\" or \"our\"), collects, uses, discloses, and protects personal information in connection with our website, product demos, commercial activities, and the PurveX Labs software.",
      "This policy is intended for business-to-business use. It applies to information relating to employees, contractors, administrators, buyers, and other representatives of our customers, prospects, partners, and vendors, as well as website visitors.",
      "PurveX Labs is self-hosted software: customers download, install, and run it entirely on their own infrastructure. PurveX does not host, access, receive, or otherwise process the SIEM data, detection data, telemetry, logs, or other environment data within a customer's PurveX Labs instance -- that data remains on the customer's own infrastructure, under the customer's control, and PurveX has no visibility into it. Where PurveX provides Security Operations or Cybersecurity Training services under a signed contract, any customer data handled during that engagement is governed by the terms of that contract, not by this policy.",
    ],
  },
  {
    title: "2. Information We Collect",
    paragraphs: [
      "We collect business contact and account information such as name, company name, business email address, job title, authentication identifiers, account preferences, and support communications.",
      "We collect commercial and transaction information such as subscription details, billing contact information, invoicing records, and payment-related metadata. Card numbers and similar payment credentials are typically processed by our payment providers rather than stored by PurveX.",
      "We collect technical and usage information such as IP address, browser type, device and network identifiers, cookie or similar online identifiers, log data, product usage events, security events, diagnostic information, and configuration metadata necessary to deliver and secure the service.",
      "If you sign up for PurveX Labs, we collect the account, company, and payment information needed to create your account, process your subscription, and issue and deliver your license key.",
      "If you enable PurveX Labs' optional AI assistant feature and configure your own API key for a third-party AI provider (currently OpenAI or DeepSeek), your PurveX Labs instance sends relevant detection or test data directly to that provider, under your own account and agreement with them. That transmission happens directly from your own infrastructure; PurveX does not receive, transmit, or store that data.",
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
      "PurveX acts as an independent controller for website analytics, account administration, billing, vendor management, business communications, and compliance. Because PurveX Labs is self-hosted software that does not transmit environment, SIEM, or detection data to PurveX, PurveX does not act as a processor or sub-processor for that data -- the customer operating a PurveX Labs instance is solely responsible for that data, including any controller or processor obligations that apply to it under laws governing that customer.",
      "Where PurveX provides Security Operations or Cybersecurity Training services under a signed contract, the client organization is generally the controller of any data handled during that engagement, and requests relating to that data should be directed to the relevant client first.",
    ],
  },
  {
    title: "5. How We Share Information",
    paragraphs: [
      "We disclose information only where reasonably necessary for business and service operations. Current service providers include Vercel (website hosting), Supabase (account authentication and portal database), Stripe (payment processing), and Resend (transactional email), along with professional advisers and other vendors operating under appropriate contractual restrictions. If you separately choose to enable PurveX Labs' AI assistant feature with your own API key, your PurveX Labs instance communicates directly with your chosen AI provider (OpenAI or DeepSeek) under your own account with that provider -- that is your direct relationship with the provider, not a disclosure PurveX makes on your behalf.",
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
      "You may submit privacy requests through the methods designated by PurveX, including email at privacy@purvex-llc.com and, where made available, account, web, or support-channel request workflows. PurveX may take reasonable steps to verify identity and request authority before acting on a request.",
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
      "For privacy-related questions or requests, contact PurveX at privacy@purvex-llc.com or through the business contact information provided in your order form, master services agreement, or customer support channel.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      badge="Privacy Policy"
      updated="Last updated August 16, 2026"
      title="Privacy terms for the PurveX website and the PurveX Labs software."
      intro="This policy explains what PurveX collects, why we collect it, and how we use and share it in connection with the website, demos, and the PurveX Labs software. PurveX Labs is self-hosted, so PurveX does not process the SIEM, detection, or environment data inside your instance; Security Operations and Cybersecurity Training engagements are covered by your signed contract, not this page."
      note="This page reflects PurveX Labs' self-hosted architecture, under which PurveX structurally never receives your security data. It is not a substitute for advice from counsel familiar with your specific jurisdictions, subprocessors, and retention schedules."
      summaryTitle="Practical summary"
      summaryItems={summaryItems}
      sectionsHeading="Full Policy"
      sections={sections}
    />
  );
}

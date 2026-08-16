import type { Metadata } from "next";
import LegalPage from "@/components/purvex-landing-page/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service | PurveX",
  description:
    "PurveX terms of service for website visitors, trial users, and business customers.",
};

const summaryItems = [
  "Security Operations and Cybersecurity Training services are governed by your separately signed contract, not by this public page.",
  "Internal business use only unless PurveX authorizes broader rights in writing.",
  "Customer is responsible for lawful and authorized testing activity in its own environments.",
  "PurveX Labs is self-hosted software offered on Free and Paid plans; PurveX does not host or process the SIEM or environment data inside your instance.",
  "Disputes are resolved through binding individual arbitration in Maryland, not court litigation or class actions -- see Section 17.",
  "Enterprise order forms and negotiated agreements override this public page where they conflict.",
];

const sections = [
  {
    title: "1. Acceptance of Terms",
    paragraphs: [
      "These Terms of Service (\"Terms\") are entered into between you (and, if applicable, the organization you represent) and PurveX LLC, a Maryland limited liability company (\"PurveX,\" \"we,\" \"us,\" or \"our\"), and govern access to and use of the PurveX website, product demos, and the PurveX Labs software. They do not govern Security Operations or Cybersecurity Training services, which are provided exclusively under a separately signed order form, statement of work, or master services agreement between PurveX and the client organization. By accessing or using the website or PurveX Labs, you agree to these terms on your own behalf or on behalf of the organization you represent.",
      "If you are accepting these terms for an organization, you represent that you have authority to bind that organization. If you do not agree to these terms, do not access or use the service.",
      "If your organization has executed a separate order form, subscription agreement, master services agreement, statement of work, or similar written contract with PurveX, that agreement controls over these website terms for the covered services.",
    ],
  },
  {
    title: "2. Eligibility and Business Use",
    paragraphs: [
      "PurveX is intended for business and professional use. You may use the service only if you are legally able to enter into a binding contract and, where applicable, authorized to act for the organization associated with your account.",
      "You may not use the service in violation of applicable law, export controls, sanctions, or contractual restrictions that apply to you or your organization.",
    ],
  },
  {
    title: "3. PurveX Labs Software",
    paragraphs: [
      "PurveX Labs is self-hosted software that you download and run on your own infrastructure, offered on a Free plan and a Paid plan, each with the features and usage limits described on the website and reflected in your account's license entitlements at the time of signup or purchase.",
      "PurveX Labs continues to evolve. Any pricing, plan limits, or feature descriptions presented on the website are informational and subject to the terms actually presented to you at signup or purchase, and to your license key's specific entitlements at any given time.",
      "PurveX may modify, improve, or discontinue individual features of PurveX Labs over time. Security Operations and Cybersecurity Training services are not affected by this section and are governed solely by the applicable signed agreement.",
    ],
  },
  {
    title: "4. Accounts and Security",
    paragraphs: [
      "You are responsible for maintaining the confidentiality of account credentials, controlling user access, and ensuring that all information associated with your account is accurate and current.",
      "You must promptly notify PurveX of any suspected unauthorized access, credential compromise, or misuse of the service. PurveX may require reasonable security steps, including password controls, identity verification, and account administration safeguards.",
      "You are responsible for activity occurring through your account except to the extent caused by PurveX's breach of these terms or applicable law.",
    ],
  },
  {
    title: "5. Customer Responsibilities",
    paragraphs: [
      "You are responsible for the legality, accuracy, quality, and right to use any data, configurations, content, credentials, integrations, scripts, instructions, or materials submitted to the service.",
      "You must ensure that your use of PurveX, including any testing, validation, simulation, or environment-specific activity, is authorized by the owner of the relevant systems and complies with your internal policies, contracts, and applicable law.",
      "You remain solely responsible for security decisions, incident response actions, regulatory conclusions, and production changes made in reliance on service outputs, scores, insights, or recommendations.",
    ],
  },
  {
    title: "6. Acceptable Use Restrictions",
    paragraphs: [
      "You may not use the service to access systems or data without authorization, interfere with the integrity or performance of the service, bypass security controls, scrape or copy the service except as permitted by law, reverse engineer the service except where such restriction is prohibited by law, or use the service to develop a competing offering.",
      "You may not upload malware, unlawful content, personal data you are not authorized to process, or materials that infringe intellectual property or confidentiality rights.",
      "You may not resell, sublicense, timeshare, rent, or otherwise make the service available to third parties except as expressly authorized by PurveX in writing.",
    ],
  },
  {
    title: "7. Trials, Betas, and Evaluation Access",
    paragraphs: [
      "PurveX may offer trial, preview, beta, or evaluation access. Such access may be limited in duration, features, support, and availability, and may be terminated at any time unless otherwise stated in a written agreement.",
      "Beta and preview features may contain defects, be incomplete, or change materially. They are provided for evaluation purposes and may be excluded from service commitments, security commitments, or support obligations that apply to generally available features.",
    ],
  },
  {
    title: "8. Fees, Billing, Renewal, and Taxes",
    paragraphs: [
      "PurveX Labs is offered on a Free plan, subject to the usage limits described on the website, and a Paid plan billed on a recurring subscription basis through the website checkout. Security Operations and Cybersecurity Training fees are governed exclusively by the applicable signed agreement, not by this section.",
      "Fees are due as stated in the applicable order form, invoice, checkout flow, or subscription terms accepted at purchase. Unless otherwise stated, fees are non-cancelable and non-refundable except as required by law or expressly stated in a governing agreement.",
      "If you purchase through a self-serve subscription flow, you authorize PurveX and its payment providers to charge the payment method associated with your account for recurring fees, taxes, and other amounts due under the selected plan.",
      "For self-serve subscriptions that automatically renew, PurveX will present material terms before purchase, including billing frequency, price, trial-to-paid conversion details if applicable, renewal timing, and how to cancel. Enterprise invoiced subscriptions are governed by the applicable commercial agreement rather than consumer-style renewal flows.",
      "Where self-serve cancellation is offered online, PurveX will use commercially reasonable efforts to make cancellation available through a method that is at least as straightforward as the applicable signup or purchase path, subject to security, verification, and account-administration controls.",
      "You are responsible for applicable sales, use, value-added, withholding, or similar taxes, except for taxes based on PurveX's net income.",
    ],
  },
  {
    title: "9. Confidentiality",
    paragraphs: [
      "Each party may receive non-public information from the other party that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.",
      "The receiving party will use the disclosing party's confidential information only as needed to perform or exercise rights under the applicable agreement and will protect it using reasonable safeguards no less protective than those it uses for its own similar information.",
      "Confidentiality obligations do not apply to information that is or becomes public without breach, was already lawfully known, is independently developed without use of the confidential information, or is lawfully received from a third party without restriction.",
    ],
  },
  {
    title: "10. Data Processing and Privacy",
    paragraphs: [
      "PurveX's handling of personal information is described in the Privacy Policy. PurveX Labs is self-hosted software: PurveX does not host, ingest, or process the SIEM data, detection data, telemetry, logs, or other environment data within your PurveX Labs instance. That data remains on your own infrastructure, under your own control, and you are solely responsible for its collection, security, and lawful use.",
      "If you enable PurveX Labs' optional AI assistant feature using your own API key for a third-party AI provider (currently OpenAI or DeepSeek), data sent to that provider is governed by your own agreement with that provider, not by this section. Where Security Operations or Cybersecurity Training engagements involve customer data, that data is handled under the terms of the signed agreement for that engagement.",
      "To the extent the website or purchase flow includes third-party integrations, hosting, or payment processing, your account and billing data may be processed through those providers as necessary to deliver those functions.",
    ],
  },
  {
    title: "11. Intellectual Property",
    paragraphs: [
      "PurveX and its licensors retain all right, title, and interest in and to the service, software, documentation, website content, product design, analytics methodologies, models, trademarks, and related intellectual property.",
      "Subject to these terms and payment of applicable fees, PurveX grants you a limited, non-exclusive, non-transferable, non-sublicensable right during the applicable subscription term to access and use the service for your internal business purposes.",
      "You retain your rights in customer data and materials you submit to the service. You grant PurveX the rights reasonably necessary to host, process, transmit, analyze, secure, and display that data solely to provide and improve the service in accordance with the applicable agreement and law.",
      "PurveX may use aggregated and de-identified information that does not identify you or any individual to operate, secure, benchmark, and improve the service.",
    ],
  },
  {
    title: "12. Feedback",
    paragraphs: [
      "If you provide feedback, suggestions, enhancement requests, or evaluation comments, PurveX may use them without restriction or obligation, provided that doing so does not publicly identify you or disclose your confidential information.",
    ],
  },
  {
    title: "13. Suspension and Termination",
    paragraphs: [
      "PurveX may suspend access immediately if reasonably necessary to prevent security harm, respond to unlawful activity, protect the service, comply with law, or address material breach, payment delinquency, or misuse.",
      "Either party may terminate a self-serve subscription or these website terms as permitted by the applicable purchase flow, plan, or written agreement. Upon termination or expiration, your access rights end except to the extent continued access is expressly provided in a governing agreement.",
      "Sections that by their nature should survive termination, including fees owed, confidentiality, limitations of liability, dispute-related provisions, intellectual property protections, and similar provisions, survive termination.",
    ],
  },
  {
    title: "14. Warranties and Disclaimers",
    paragraphs: [
      "PurveX warrants that generally available paid services will be provided in a professional and workmanlike manner consistent with the applicable documentation and written commitments, if any, for the relevant subscription.",
      "Except as expressly stated in a governing agreement, the service is provided on an as available and as provided basis. To the maximum extent permitted by law, PurveX disclaims implied warranties, including implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement.",
      "PurveX does not warrant that the service will be uninterrupted, error free, or suitable for every customer environment, or that use of the service will detect, prevent, or remediate every security issue, attack path, or compliance risk.",
    ],
  },
  {
    title: "15. Limitation of Liability",
    paragraphs: [
      "To the maximum extent permitted by law, neither party will be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, lost revenues, lost goodwill, loss of use, loss of anticipated savings, business interruption, or loss or corruption of data, even if advised of the possibility of those damages.",
      "To the maximum extent permitted by law, each party's aggregate liability arising out of or relating to the service or these terms will not exceed the amounts paid or payable by the customer to PurveX for the relevant service during the twelve months preceding the event giving rise to the claim.",
      "The limitations in this section do not apply to liability that cannot be limited under applicable law and do not limit your payment obligations or either party's liability for fraud, willful misconduct, or misappropriation of the other party's intellectual property or confidential information to the extent such exclusions are not waivable under applicable law.",
    ],
  },
  {
    title: "16. Indemnity",
    paragraphs: [
      "You will defend, indemnify, and hold harmless PurveX and its affiliates, officers, directors, employees, and agents from third-party claims arising from your customer data, your misuse of the service, your violation of these terms, or your violation of applicable law or third-party rights.",
      "If PurveX provides an express infringement indemnity in a signed enterprise agreement, that signed agreement controls. These website terms do not create a broader indemnity than the one expressly stated here.",
    ],
  },
  {
    title: "17. Governing Law, Venue, and Dispute Resolution",
    paragraphs: [
      "These Terms and any dispute arising out of or relating to them or the service are governed by the laws of the State of Maryland, without regard to its conflict-of-laws principles.",
      "Except as provided below, any dispute, claim, or controversy arising out of or relating to these Terms or the service will be resolved by binding arbitration administered by the American Arbitration Association under its Commercial Arbitration Rules, before a single arbitrator in Maryland (or remotely, by agreement of the parties), rather than in court. Judgment on the arbitration award may be entered in any court having jurisdiction.",
      "YOU AND PURVEX EACH WAIVE THE RIGHT TO A JURY TRIAL AND THE RIGHT TO PARTICIPATE IN A CLASS ACTION, CLASS ARBITRATION, OR REPRESENTATIVE PROCEEDING. Claims must be brought in each party's individual capacity, not as a plaintiff or class member in any purported class, consolidated, or representative proceeding.",
      "Notwithstanding the foregoing, either party may bring an individual action in small claims court, and either party may seek injunctive or other equitable relief in a court of competent jurisdiction in Maryland to protect its intellectual property or confidential information pending resolution of a dispute.",
      "If any part of this arbitration provision is found unenforceable, the remainder will still apply, except that if the class action or class arbitration waiver is found unenforceable as to a particular claim or request for relief, that claim or request must proceed in court and be severed from any arbitration.",
    ],
  },
  {
    title: "18. Changes to the Service or Terms",
    paragraphs: [
      "PurveX may update these terms from time to time. The updated version will apply when posted, unless a later effective date is stated. Material changes will apply prospectively.",
      "PurveX may also present updated terms for affirmative acceptance through the product, account workflow, order flow, or related commercial process when appropriate.",
      "Your continued use of the service after updated terms become effective constitutes acceptance of the updated terms, except to the extent a separate written agreement governs the relevant services for a fixed term.",
    ],
  },
  {
    title: "19. General",
    paragraphs: [
      "These terms do not create a partnership, franchise, joint venture, fiduciary, employment, or agency relationship between the parties.",
      "You may not assign these terms without PurveX's prior written consent, except in connection with a permitted merger, acquisition, or sale of substantially all assets involving the assigning party. PurveX may assign these terms in connection with a merger, acquisition, corporate reorganization, or sale of assets.",
      "If any provision is held unenforceable, the remaining provisions will remain in effect to the maximum extent permitted by law. Failure to enforce a provision is not a waiver.",
    ],
  },
  {
    title: "20. Contact",
    paragraphs: [
      "For commercial, legal, or contract questions, contact PurveX through the business contact information provided in your order documentation or at legal@purvex-llc.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      badge="Terms of Service"
      updated="Last updated August 16, 2026"
      title="Terms for the PurveX website, demos, and the PurveX Labs software."
      intro="These terms cover website use, demos, and use of the PurveX Labs software. Security Operations and Cybersecurity Training engagements are governed exclusively by your separately signed contract with PurveX, not by this page."
      note="You should have counsel confirm the governing-law, arbitration, and export-control clauses below before relying on them, and confirm they match how PurveX Labs is actually licensed and billed."
      summaryTitle="Commercial summary"
      summaryItems={summaryItems}
      sectionsHeading="Full Terms"
      sections={sections}
    />
  );
}

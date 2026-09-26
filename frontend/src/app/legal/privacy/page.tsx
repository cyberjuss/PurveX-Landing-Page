import type { Metadata } from "next";
import LegalPage from "@/components/purvex-landing-page/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How PurveX collects, uses, and protects information across the website, the PurveX Platform, and the PurveX Academy.",
};

const summaryItems = [
  "We collect what we need to run your account, your subscription, and the Academy: your email, your plan, your course progress, and the messages you send us.",
  "The PurveX Platform is self-hosted. We never receive the SIEM, detection, or environment data inside your installation.",
  "In the Academy, AI Coach questions and screenshots are sent to our AI provider, Anthropic, to write a reply, and your lab and results are used to write your drills. We do not store Coach chats or screenshots on our servers.",
  "Payments are handled by Stripe. We never see or store your full card number.",
  "We do not sell your personal information, and we do not use advertising or third-party analytics trackers.",
  "You can ask us to see, correct, or delete your information at any time by emailing justinduru@purvex.io.",
];

const sections = [
  {
    title: "1. Who we are and what this policy covers",
    paragraphs: [
      "This Privacy Policy explains how PurveX LLC, a Maryland limited liability company (\"PurveX,\" \"we,\" \"us,\" or \"our\"), collects, uses, shares, and protects personal information.",
      "It covers the purvex.io website, your PurveX account and license portal, the PurveX Platform software, the PurveX Academy training portal (including the AI Coach), and the messages you send us.",
      "Consulting engagements and training delivered under a signed contract are governed by that contract. Where a contract includes its own data-handling terms, those terms apply to the data handled during that engagement.",
    ],
  },
  {
    title: "2. Information you give us",
    paragraphs: [
      "Account information: your email address and password when you create an account. Passwords are handled by our authentication provider and are stored in hashed form, not in plain text. If you choose Continue with Google, Google shares your name, email address, and basic profile information with us.",
      "Plan and billing information: the plan you choose, your payment status, and the references we need to issue your license. Payments are processed by Stripe. We do not receive or store your full card number.",
      "Messages and requests: when you use a contact form on the website, we collect your name, email address, and what you need help with. If you book a call, the booking is handled by Calendly under its own privacy policy. We also keep the emails you send us.",
    ],
  },
  {
    title: "3. Information from the PurveX Academy",
    paragraphs: [
      "If you use the Academy, we store your course progress: the missions and quizzes you have finished, your answers and results, your drill history, and a count of how many AI Coach questions you have used each day.",
      "The Academy lab runs on your own computer and uses a fictional company. When you run the lab setup script, it sends a snapshot of that practice lab to your Academy account, such as its directory accounts, groups, settings, and security events, so the portal can check your work. We keep only the most recent snapshot.",
      "If you create a connection key so your own AI tool (for example Claude or Cursor) can read your Academy progress, we store that key in hashed form. Information your AI tool reads through that key is then handled under your own agreement with that tool's provider.",
      "Your browser also stores a copy of some progress and preferences locally, as described in the Cookies and local storage section.",
    ],
  },
  {
    title: "4. The AI Coach and AI-written drills",
    paragraphs: [
      "When you ask the AI Coach a question, we send your message, the recent conversation, any screenshot you attach, and the relevant parts of your Academy progress and lab snapshot to our AI provider, Anthropic, so it can write a reply.",
      "The Academy's daily drill and weekly challenge are also written by Anthropic's model, using your lab snapshot, your skill results, and your recent drills, so each question fits your own lab and level.",
      "We do not store your Coach conversations or screenshots on our servers after the reply is returned. We only keep the daily count of questions you have used. Anthropic handles the data it receives under its own commercial terms and privacy policy.",
      "Please do not include passwords, personal details about other people, or other sensitive information in Coach messages or screenshots.",
    ],
  },
  {
    title: "5. Technical information",
    paragraphs: [
      "When you visit the website or use a PurveX service, our hosting and database providers automatically receive technical information such as your IP address, browser type, device information, the pages you request, and the date and time of each request. We use this to deliver the service, keep it secure, and fix problems.",
      "We do not use advertising trackers or third-party analytics tools on the website.",
    ],
  },
  {
    title: "6. The PurveX Platform",
    paragraphs: [
      "The PurveX Platform is self-hosted software. You install and run it on your own infrastructure. PurveX does not host, access, receive, or process the SIEM data, detection data, telemetry, logs, or other environment data inside your installation. That data stays on your infrastructure, under your control.",
      "If you turn on the Platform's optional AI assistant with your own API key for a third-party AI provider (currently OpenAI or DeepSeek), your installation sends data directly to that provider under your own account with them. PurveX does not receive, transmit, or store that data.",
    ],
  },
  {
    title: "7. How we use information",
    paragraphs: [
      "We use personal information to create and secure your account, provide the website, the portal, the Platform license, and the Academy, check your lab work and score your progress, generate AI Coach replies and personalized drills, process payments and issue licenses, respond to your messages and booking requests, send service emails such as sign-in links, receipts, and license details, prevent fraud and abuse, and meet our legal obligations.",
      "We may send occasional updates about PurveX products to business contacts where the law allows. You can opt out of marketing emails at any time. Service, security, and billing emails are not marketing and will still be sent while you have an account.",
      "We do not use your Academy progress, lab snapshots, or Coach conversations to train AI models.",
    ],
  },
  {
    title: "8. Legal bases for processing",
    paragraphs: [
      "Where the law requires a legal basis for processing, such as in the European Union or the United Kingdom, we rely on: performing our contract with you (running your account, subscription, and course), our legitimate interests (keeping the service secure, improving it, and responding to business inquiries), compliance with legal obligations (such as tax and accounting records), and your consent where it is specifically required.",
    ],
  },
  {
    title: "9. Who we share information with",
    paragraphs: [
      "We share information only with service providers that help us run PurveX, and only as much as they need: Vercel (website hosting), Supabase (sign-in and database), Stripe (payments), Resend (service emails), Anthropic (AI Coach replies and AI-written drills), Google (only if you choose Continue with Google), and Calendly (only if you book a call).",
      "We may also share information with professional advisers, when the law requires it, to protect the rights, safety, and security of PurveX, our users, and the public, or as part of a merger, acquisition, financing, or sale of assets, subject to confidentiality protections.",
      "We do not sell personal information, and we do not share it for cross-context behavioral advertising.",
    ],
  },
  {
    title: "10. Where information is processed",
    paragraphs: [
      "PurveX is based in the United States, and our service providers process information in the United States and other countries where they operate. If you use PurveX from outside the United States, your information will be transferred to and processed in the United States. Where the law requires it, we rely on appropriate safeguards for those transfers, such as contractual protections.",
    ],
  },
  {
    title: "11. How long we keep information",
    paragraphs: [
      "Account, plan, and Academy progress information is kept while your account is open, and deleted after you ask us to delete your account, except where we must keep some records for legal, tax, or accounting reasons.",
      "Only your most recent lab snapshot is kept; each new sync replaces the last one. AI Coach conversations and screenshots are not stored on our servers.",
      "Contact form messages and emails are kept as long as needed to respond and follow up, and then deleted or archived. Payment and billing records are kept as long as tax and accounting laws require.",
    ],
  },
  {
    title: "12. How we protect information",
    paragraphs: [
      "We use technical and organizational safeguards to protect personal information, including encrypted connections, hashed passwords and access keys, database access rules that limit each account to its own data, and restricted administrative access. No system is perfectly secure, so we cannot guarantee absolute security.",
      "You are responsible for keeping your password and any connection keys private, and for letting us know right away if you think your account has been accessed without permission.",
    ],
  },
  {
    title: "13. Your rights and choices",
    paragraphs: [
      "You can ask us to show you the personal information we hold about you, correct it, delete it, or give you a copy of it. Depending on where you live, you may also have the right to object to or restrict certain processing, withdraw consent, and appeal a decision we make about your request. Residents of California and other U.S. states with privacy laws have these rights under those laws.",
      "To make a request, email justinduru@purvex.io. We may need to confirm your identity before acting on a request. We will not treat you differently for exercising your privacy rights.",
      "If you are in the European Union or the United Kingdom, you may also lodge a complaint with your local data protection authority.",
    ],
  },
  {
    title: "14. Cookies and local storage",
    paragraphs: [
      "We use a small number of cookies and browser storage items that the service needs to work: to keep you signed in, to remember that you have unlocked the Academy with a class passcode, to remember preferences such as the Academy's light or dark theme, and to keep a local copy of your Academy progress so pages load quickly.",
      "We do not use advertising cookies or third-party analytics cookies. Because these items are needed for the service to work, they are used without a separate consent banner. You can clear them in your browser settings, but some features, such as staying signed in, will stop working.",
      "Some browsers offer a Do Not Track setting. Because we do not track you across other websites, there is nothing for that setting to change.",
    ],
  },
  {
    title: "15. Children's privacy",
    paragraphs: [
      "PurveX is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child under 13 has given us personal information, contact us and we will delete it.",
    ],
  },
  {
    title: "16. Links to other websites",
    paragraphs: [
      "The website links to other services, such as LinkedIn and Calendly. Those services have their own privacy policies, and we are not responsible for how they handle your information.",
    ],
  },
  {
    title: "17. Changes to this policy",
    paragraphs: [
      "We may update this policy as PurveX changes. When we do, we will update the date at the top of this page. If we make a material change, we will give additional notice, such as an email to account holders or a notice in the portal, before the change takes effect.",
    ],
  },
  {
    title: "18. Contact",
    paragraphs: [
      "For privacy questions or requests, email justinduru@purvex.io. If you are a consulting or contracted training client, you can also use the contact details in your agreement.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      badge="Privacy Policy"
      updated="Last updated September 26, 2026"
      title="How PurveX handles your information."
      intro="This policy explains what PurveX collects across the website, the PurveX Platform, and the PurveX Academy, why we collect it, who we share it with, and the choices you have. It is written to be read, so the short version comes first."
      note="Questions about this policy or your information? Email justinduru@purvex.io."
      summaryTitle="The short version"
      summaryItems={summaryItems}
      sectionsHeading="Full Policy"
      sections={sections}
    />
  );
}

import type { Metadata } from "next";
import AboutPage from "@/components/purvex-landing-page/about-page";

const title = "About PurveX";
const description =
  "No team should need to be enterprise-sized to be secure. PurveX helps security teams prove their defenses work, and trains the people who run them.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description },
};

export default function Page() {
  return <AboutPage />;
}

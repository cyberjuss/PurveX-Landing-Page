import type { Metadata } from "next";
import AboutPage from "@/components/purvex-landing-page/about-page";

const title = "About / How We Think";
const description =
  "Blue team. Red team. One discipline. PurveX helps organizations strengthen their security operations and develop the cybersecurity talent needed to support them.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description },
};

export default function Page() {
  return <AboutPage />;
}

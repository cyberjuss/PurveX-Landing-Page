import type { Metadata } from "next";
import FounderPage from "@/components/purvex-landing-page/founder-page";

export const metadata: Metadata = {
  title: "Justin Duru, Founder",
  description:
    "Meet Justin Duru, founder of PurveX, and book consulting on SIEM detection engineering, tuning, coverage reviews, and detection validation.",
};

export default function Page() {
  return <FounderPage />;
}

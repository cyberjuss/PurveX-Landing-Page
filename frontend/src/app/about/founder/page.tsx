import type { Metadata } from "next";
import FounderPage from "@/components/purvex-landing-page/founder-page";

export const metadata: Metadata = {
  title: "Justin Duru — Founder | PurveX",
  description: "Meet Justin Duru, Founder & Lead Security Consultant at PurveX.",
};

export default function Page() {
  return <FounderPage />;
}

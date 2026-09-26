import type { Metadata } from "next";
import PlatformPage from "@/components/purvex-landing-page/platform-page";

const title = "Detection Validation Platform";
const description =
  "PurveX runs real attack tests in your environment and shows which security alerts fired, which missed, and why.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description },
  twitter: { title, description },
};

export default function Page() {
  return <PlatformPage />;
}

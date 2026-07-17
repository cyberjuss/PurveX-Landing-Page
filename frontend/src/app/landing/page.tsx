import { permanentRedirect } from "next/navigation";

// /landing is a legacy duplicate of the home page.
// Permanently redirect (308) to the canonical route so there is no duplicate content.
export default function LandingRedirect() {
  permanentRedirect("/");
}

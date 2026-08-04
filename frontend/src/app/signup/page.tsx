import { redirect } from "next/navigation";

// The old /signup flow called this repo's bundled backend directly
// (POST /auth/register + a static Stripe payment link) and was never
// linked from any button or nav item on the site. Replaced by the portal
// account flow at /account/signup, which is decoupled from any PurveX
// product instance -- see /account/signup, /pricing, and /get-purvex.
export default function LegacySignupRedirect() {
  redirect("/account/signup");
}

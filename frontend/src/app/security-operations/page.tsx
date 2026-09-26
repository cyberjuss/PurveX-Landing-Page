import { permanentRedirect } from "next/navigation";

// Operations is now consulting on the founder page. Keep old links working.
export default function Page() {
  permanentRedirect("/about/founder#consulting");
}

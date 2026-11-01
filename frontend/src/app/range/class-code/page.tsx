import type { Metadata } from "next";
import { ClassCodeForm } from "./class-code-form";

export const metadata: Metadata = { title: "Join your class", robots: { index: false } };

// A real route under /range, like /range/join and /range/upgrade, so it
// renders outside AcademyShell. Signing in is the way into Range now, so a
// class code is no longer asked for at the door. A student handed a code
// rather than a join link types it here, from the account menu.
export default function ClassCodePage() {
  return <ClassCodeForm />;
}

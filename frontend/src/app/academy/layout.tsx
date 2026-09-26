import { isAcademyUnlocked } from "@/lib/academy-auth";
import { phases } from "@/lib/academy-content";
import { UnlockForm } from "./unlock-form";
import { AcademyShell } from "./academy-shell";
import "./academy-media.css";
import "./academy-goals.css";
import "./academy-findings.css";

export default async function AcademyLayout({ children }: { children: React.ReactNode }) {
  const unlocked = await isAcademyUnlocked();

  if (!unlocked) {
    return <UnlockForm />;
  }

  return <AcademyShell phases={phases}>{children}</AcademyShell>;
}

import { isAcademyUnlocked } from "@/lib/academy-auth";
import { UnlockForm } from "./unlock-form";
import { AcademyShell } from "./academy-shell";

export default async function AcademyLayout({ children }: { children: React.ReactNode }) {
  const unlocked = await isAcademyUnlocked();

  if (!unlocked) {
    return <UnlockForm />;
  }

  return <AcademyShell>{children}</AcademyShell>;
}

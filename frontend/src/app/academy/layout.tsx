import { isAcademyUnlocked } from "@/lib/academy-auth";
import { phases } from "@/lib/academy-content";
import { AcademyShell } from "./academy-shell";
import "./academy-media.css";
import "./academy-goals.css";
import "./academy-findings.css";
import "./academy-missions.css";
import "./academy-lessons.css";

export default async function AcademyLayout({ children }: { children: React.ReactNode }) {
  // Don't gate sign-in behind the class passcode. The shell shows sign-in first,
  // and only asks for the passcode after sign-in if the student is not unlocked.
  const unlocked = await isAcademyUnlocked();

  return (
    <AcademyShell phases={phases} unlocked={unlocked}>
      {children}
    </AcademyShell>
  );
}

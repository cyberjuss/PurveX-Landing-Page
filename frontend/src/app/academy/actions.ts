"use server";

import { redirect } from "next/navigation";
import { checkPasscode, setAcademyCookie } from "@/lib/academy-auth";

export async function unlockAcademy(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const passcode = String(formData.get("passcode") ?? "");

  if (!checkPasscode(passcode)) {
    return { error: "That passcode did not work. Check with your instructor and try again." };
  }

  await setAcademyCookie();
  redirect("/academy");
}

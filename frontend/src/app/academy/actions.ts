"use server";

import { redirect } from "next/navigation";
import { checkPasscode, setAcademyCookie, setClassCookie } from "@/lib/academy-auth";
import { findClassByCode } from "@/lib/academy-classes";

export async function unlockAcademy(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const passcode = String(formData.get("passcode") ?? "");

  // The shared passcode, or a class code that also puts the student in that class once they sign in.
  if (!checkPasscode(passcode)) {
    const cls = await findClassByCode(passcode);
    if (!cls) return { error: "That passcode did not work. Check the code you were given and try again." };
    await setClassCookie(cls.code);
  }

  await setAcademyCookie();
  redirect("/range");
}

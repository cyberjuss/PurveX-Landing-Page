"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkPasscode, setAcademyCookie, setClassCookie } from "@/lib/academy-auth";
import { findClassByCode } from "@/lib/academy-classes";
import { clientKey, throttle } from "@/lib/auth-guard";

export async function unlockAcademy(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const passcode = String(formData.get("passcode") ?? "");

  // Grants nothing but portal access, but an unthrottled guess loop would
  // still get there eventually. Same per-IP shape as mailGuard's.
  if (!throttle(`unlock:${clientKey({ headers: await headers() })}`, 10, 15 * 60_000)) {
    return { error: "Too many attempts. Wait a few minutes and try again." };
  }

  // The shared passcode, or a class code that also puts the student in that class once they sign in.
  if (!checkPasscode(passcode)) {
    const cls = await findClassByCode(passcode);
    if (!cls) return { error: "That passcode did not work. Check the code you were given and try again." };
    await setClassCookie(cls.code);
  }

  await setAcademyCookie();
  redirect("/range");
}

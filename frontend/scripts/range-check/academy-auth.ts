// Stands in for the class-passcode cookie. Always unlocked, so the checks
// reach the plan gate underneath instead of stopping at a 401 -- which is
// the whole thing being tested.
export const ACADEMY_COOKIE = "academy_session";
export const ACADEMY_CLASS_COOKIE = "academy_class";
export async function isAcademyUnlocked(): Promise<boolean> {
  return true;
}
export async function setAcademyCookie(): Promise<boolean> {
  return true;
}
export function checkPasscode(): boolean {
  return false;
}
export async function setClassCookie() {}
export async function readClassCookie(): Promise<string | null> {
  return null;
}
export async function clearClassCookie() {}

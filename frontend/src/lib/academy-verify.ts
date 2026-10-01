import { randomBytes } from "crypto";
import type { LabSnapshot } from "@/lib/academy-lab";

// Live lab check. The student plants a one-time code in their own lab and the next
// snapshot has to contain it. It shows the snapshot came from a lab they control
// right now. It does not prove who built the lab.

export const CHALLENGE_MINUTES = 240;
/** How long the lab syncs every few minutes after a challenge or a lab check. */
export const LIVE_MINUTES = 240;
export const VERIFIED_DAYS = 30;

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function newChallengeCode() {
  const b = randomBytes(8);
  const pick = (from: number) => Array.from(b.subarray(from, from + 4), (x) => ALPHABET[x % ALPHABET.length]).join("");
  return `PVX-${pick(0)}-${pick(4)}`;
}

/** A description the Ticket Queue reads or grades. Writing the code over it would break a ticket. */
const ticketData = (d: string | null | undefined) => /CTF-TICKET|\d{1,2}:\d{2}/i.test(d ?? "");

/** The lab object the student edits. A real user when there is one, so the step is one line.
 *  Prefers an empty Description, and never one a ticket depends on. */
export function challengeTarget(s: LabSnapshot): { kind: "user" | "ou"; name: string; label: string } {
  const users = s.users.filter(
    (u) => u.enabled && !/^(administrator|guest|krbtgt|svc-backup-job)$/i.test(u.sam) && !u.sam.endsWith("$") && !ticketData(u.description)
  );
  const user = users.find((u) => !u.description) ?? users[0];
  if (user) return { kind: "user", name: user.sam, label: `the account ${user.sam}` };
  const ou = s.ous.find((o) => !ticketData(o.description)) ?? s.ous[0];
  return { kind: "ou", name: ou?.path ?? "", label: "any organizational unit" };
}

export function powershellLine(t: ReturnType<typeof challengeTarget>, code: string) {
  return t.kind === "user"
    ? `Set-ADUser ${t.name} -Description "${code}"`
    : `Set-ADOrganizationalUnit "${t.name}" -Description "${code}"`;
}

/** True when the code sits in the description of any lab object. */
export function codeInSnapshot(s: LabSnapshot, code: string) {
  const c = code.toLowerCase();
  const has = (v: string) => v.toLowerCase().includes(c);
  return s.users.some((u) => has(u.description)) || s.groups.some((g) => has(g.description)) || s.computers.some((x) => has(x.description)) || s.ous.some((o) => has(o.description));
}

export function challengeOpen(challengeAt: string | null, now = Date.now()) {
  return Boolean(challengeAt) && now - Date.parse(challengeAt as string) < CHALLENGE_MINUTES * 60_000;
}

export function isVerified(verifiedAt: string | null, now = Date.now()) {
  return Boolean(verifiedAt) && now - Date.parse(verifiedAt as string) < VERIFIED_DAYS * 24 * 60 * 60_000;
}

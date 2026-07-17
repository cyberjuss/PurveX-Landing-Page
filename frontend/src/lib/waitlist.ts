"use client";

import { apiFetch } from "@/lib/api";

type WaitlistResult = {
  already_exists: boolean;
};

export async function joinWaitlist(email: string, source: string): Promise<WaitlistResult> {
  const response = (await apiFetch("/waitlist", {
    method: "POST",
    body: JSON.stringify({ email, source }),
  })) as { already_exists?: boolean };

  return { already_exists: Boolean(response?.already_exists) };
}

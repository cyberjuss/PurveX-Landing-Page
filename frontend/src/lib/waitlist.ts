"use client";

import { supabase } from "@/lib/supabase";

type WaitlistResult = {
  already_exists: boolean;
};

const UNIQUE_VIOLATION = "23505";

export async function joinWaitlist(email: string, source: string): Promise<WaitlistResult> {
  if (!supabase) {
    throw new Error("Waitlist is not configured yet. Try again shortly.");
  }

  const { error } = await supabase.from("waitlist_signups").insert({ email, source });

  if (error) {
    if (error.code === UNIQUE_VIOLATION) {
      return { already_exists: true };
    }
    throw new Error("Unable to join right now. Try again.");
  }

  return { already_exists: false };
}

"use client";

import { supabase } from "@/lib/supabase";

export async function sendHold(input: { name: string; email: string; need: string; source: string }) {
  if (!supabase) {
    throw new Error("Holds are not configured yet. Try again shortly.");
  }

  const { error } = await supabase.from("conversation_holds").insert({
    name: input.name,
    email: input.email,
    need: input.need,
    source: input.source,
  });

  if (error) {
    if (error.code === "PGRST205" || /conversation_holds/i.test(error.message)) {
      throw new Error("Holds table is not set up. Run frontend/supabase/holds.sql in the Supabase SQL editor.");
    }
    throw new Error(error.message || "Unable to send right now. Try again.");
  }
}

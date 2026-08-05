import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-only client that bypasses Row Level Security -- never import this
// from a client component or expose SUPABASE_SERVICE_ROLE_KEY with a
// NEXT_PUBLIC_ prefix. Used by server-side routes (e.g. the Stripe webhook)
// that need to write to a user's portal_profiles row without that user's
// own session.
export const supabaseAdmin =
  supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;

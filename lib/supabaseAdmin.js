import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Server-side only client (service role key must never reach the browser).
// null until real Supabase credentials are added to .env.local.
export const supabaseAdmin =
  url && serviceRoleKey ? createClient(url, serviceRoleKey, { auth: { persistSession: false } }) : null;

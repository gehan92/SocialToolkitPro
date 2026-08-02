import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// null until real Supabase credentials are added to .env.local - callers must check for this.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;

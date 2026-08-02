import { supabaseAdmin } from "./supabaseAdmin";

const DEFAULT_PLAN_CONFIG = { premiumPrice: 9, proPrice: 29, freeDailyLimit: 10 };
const CACHE_MS = 60 * 1000;

let cached = null;
let cachedAt = 0;

// Admin-editable plan settings (prices used for revenue/profit math, and the
// free-tier daily generation cap). Read on the hot path of every generate
// request via checkRateLimit, so this is cached briefly instead of hitting
// the DB every time.
export async function getPlanConfig() {
  if (cached && Date.now() - cachedAt < CACHE_MS) return cached;
  if (!supabaseAdmin) return DEFAULT_PLAN_CONFIG;

  const { data } = await supabaseAdmin
    .from("admin_settings")
    .select("value")
    .eq("key", "plan_config")
    .maybeSingle();

  cached = { ...DEFAULT_PLAN_CONFIG, ...(data?.value || {}) };
  cachedAt = Date.now();
  return cached;
}

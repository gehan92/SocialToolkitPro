import { supabaseAdmin } from "./supabaseAdmin";

const DEFAULT_PLAN_CONFIG = {
  premiumPrice: 9,
  proPrice: 29,
  premiumAnnualPrice: 79,
  proAnnualPrice: 299,
  freeDailyLimit: 10, // legacy: no longer enforced now that free = the 3-day trial below, kept so old admin/UI references don't break
  trialDayLimits: [3, 2, 1], // generations allowed on trial day 1, 2, 3 (see lib/rateLimit.js)
  fairUseDailyLimit: 500, // hidden soft cap on "unlimited" premium/pro plans, protects against a single abused account
  creditPackSize: 50, // pay-as-you-go: generations per pack
  creditPackPrice: 5, // pay-as-you-go: USD per pack
};
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

// Called after an admin saves new plan settings so the next read (in this
// serverless instance) picks up the change immediately instead of serving
// the stale cached value for up to CACHE_MS.
export function invalidatePlanConfigCache() {
  cached = null;
  cachedAt = 0;
}

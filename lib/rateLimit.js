import { supabaseAdmin } from "./supabaseAdmin";
import { getAuthUser } from "./getAuthUser";

const FREE_DAILY_LIMIT = 10;

// Anonymous fallback: in-memory per-IP counter. Resets on server restart and
// doesn't share state across serverless instances - fine for anonymous visitors,
// logged-in users get the real, durable check below via the daily_usage table.
const anonHits = new Map();

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (fwd) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

function checkAnonRateLimit(ip) {
  const key = `${ip}:${todayKey()}`;
  const count = anonHits.get(key) || 0;
  if (count >= FREE_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  anonHits.set(key, count + 1);
  return { allowed: true, remaining: FREE_DAILY_LIMIT - count - 1 };
}

async function checkUserRateLimit(userId, tool) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("subscription_tier")
    .eq("id", userId)
    .single();

  const tier = profile?.subscription_tier || "free";
  const usageDate = todayKey();
  const { data: usageRow } = await supabaseAdmin
    .from("daily_usage")
    .select("generations_count, tool_breakdown")
    .eq("user_id", userId)
    .eq("usage_date", usageDate)
    .maybeSingle();

  const count = usageRow?.generations_count ?? 0;

  if (tier !== "premium" && tier !== "pro" && count >= FREE_DAILY_LIMIT) {
    return { allowed: false, remaining: 0, tier };
  }

  const breakdown = usageRow?.tool_breakdown || {};
  if (tool) breakdown[tool] = (breakdown[tool] || 0) + 1;

  await supabaseAdmin
    .from("daily_usage")
    .upsert(
      { user_id: userId, usage_date: usageDate, generations_count: count + 1, tool_breakdown: breakdown },
      { onConflict: "user_id,usage_date" }
    );

  if (tier === "premium" || tier === "pro") {
    return { allowed: true, remaining: null, tier };
  }
  return { allowed: true, remaining: FREE_DAILY_LIMIT - count - 1, tier };
}

// Logged-in users are checked against their real subscription tier + the
// daily_usage table (Premium/Pro = unlimited). Anonymous visitors fall back
// to the in-memory per-IP counter.
export async function checkRateLimit(req, tool) {
  const user = await getAuthUser(req);
  if (user) {
    return checkUserRateLimit(user.id, tool);
  }
  return checkAnonRateLimit(getClientIp(req));
}

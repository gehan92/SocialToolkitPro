import { supabaseAdmin } from "./supabaseAdmin";
import { getAuthUser } from "./getAuthUser";
import { logApiUsage } from "./logUsage";
import { isAdminEmail } from "./isAdmin";
import { getPlanConfig } from "./planConfig";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

// Free-limit counters key off the UTC calendar day, so this is when they roll over.
function nextResetIso() {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.toISOString();
}

// 1-indexed day number since the trial clock started (day 1 = the day the
// account was created/confirmed).
function trialDayNumber(trialStartedAt) {
  const start = new Date(trialStartedAt).getTime();
  const diffMs = Date.now() - start;
  return Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
}

async function bumpDailyUsage(userId, usageDate, count, breakdown, tool) {
  const nextBreakdown = { ...breakdown };
  if (tool) nextBreakdown[tool] = (nextBreakdown[tool] || 0) + 1;
  await supabaseAdmin
    .from("daily_usage")
    .upsert(
      { user_id: userId, usage_date: usageDate, generations_count: count + 1, tool_breakdown: nextBreakdown },
      { onConflict: "user_id,usage_date" }
    );
}

async function logBlocked(userId, tool, statusCode) {
  await logApiUsage({ userId, endpoint: `/api/generate/${tool || "unknown"}`, statusCode, responseTimeMs: null, tokensUsed: null });
}

// Every generate endpoint requires a logged-in, email-verified account (no
// more anonymous/IP-based access). New accounts get a 3-day trial with a
// declining daily cap (day 1: 3, day 2: 2, day 3: 1 — see planConfig's
// trialDayLimits) so usage naturally tapers toward the point where the
// account must pick a paid plan or spend purchased credits. Premium/Pro read
// as "unlimited" to the user but carry a hidden fair-use ceiling so a single
// runaway or abused account can't blow up the Gemini bill.
export async function checkRateLimit(req, tool) {
  const user = await getAuthUser(req);
  if (!user) {
    return { allowed: false, code: 401, message: "Please log in to continue." };
  }
  if (!user.email_confirmed_at) {
    return { allowed: false, code: 403, message: "Please verify your email to activate your free trial — check your inbox for the confirmation link." };
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("subscription_tier, role, trial_started_at, credits_balance")
    .eq("id", user.id)
    .single();

  const tier = (isAdminEmail(user.email) || profile?.role === "admin") ? "pro" : (profile?.subscription_tier || "free");
  const usageDate = todayKey();
  const { data: usageRow } = await supabaseAdmin
    .from("daily_usage")
    .select("generations_count, tool_breakdown")
    .eq("user_id", user.id)
    .eq("usage_date", usageDate)
    .maybeSingle();
  const count = usageRow?.generations_count ?? 0;
  const breakdown = usageRow?.tool_breakdown || {};

  // Paid tiers (and admins, treated as Pro): unlimited to the user, but
  // capped by a hidden fair-use ceiling never surfaced in the UI.
  if (tier === "premium" || tier === "pro") {
    const { fairUseDailyLimit } = await getPlanConfig();
    if (count >= fairUseDailyLimit) {
      await logBlocked(user.id, tool, 429);
      return { allowed: false, code: 429, message: "You've hit today's usage limit. Please try again tomorrow, or contact support if you need a higher limit.", resetAt: nextResetIso() };
    }
    await bumpDailyUsage(user.id, usageDate, count, breakdown, tool);
    return { allowed: true, remaining: null, tier };
  }

  // Free tier, still inside the 3-day trial window.
  const { trialDayLimits } = await getPlanConfig();
  const day = trialDayNumber(profile?.trial_started_at || user.created_at);

  if (day >= 1 && day <= trialDayLimits.length) {
    const limit = trialDayLimits[day - 1];
    if (count >= limit) {
      await logBlocked(user.id, tool, 429);
      return {
        allowed: false,
        code: 429,
        message: "You've used today's trial generations. Come back tomorrow, or choose a plan to unlock unlimited access now.",
        resetAt: nextResetIso(),
        trialDay: day,
      };
    }
    await bumpDailyUsage(user.id, usageDate, count, breakdown, tool);
    return { allowed: true, remaining: limit - count - 1, tier, trialDay: day };
  }

  // Trial window has passed: must be on a paid plan or spend credits.
  const credits = profile?.credits_balance || 0;
  if (credits <= 0) {
    await logBlocked(user.id, tool, 402);
    return { allowed: false, code: 402, message: "Your free trial has ended. Choose a plan or buy credits to keep generating.", trialExpired: true };
  }

  await supabaseAdmin.from("profiles").update({ credits_balance: credits - 1 }).eq("id", user.id);
  await bumpDailyUsage(user.id, usageDate, count, breakdown, tool);
  return { allowed: true, remaining: credits - 1, tier, usingCredits: true };
}

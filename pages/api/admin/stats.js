import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../lib/getAuthUser";
import { isAdminEmail } from "../../../lib/isAdmin";

const TOOL_LABELS = {
  hashtags: "Hashtag Generator", captions: "Caption Writer", bios: "Bio Maker",
  ideas: "Video Ideas", thread: "Thread Writer", "seo-intro": "SEO Blog Intro",
  repurpose: "Content Repurposer", "youtube-desc": "YouTube Description",
  "email-subject": "Email Subject Lines", cta: "CTA Generator",
  "ad-copy": "Ad Copy Writer", "viral-hook": "Viral Hook Generator",
  "tech-writing": "Technical Writing", pitch: "Brand Pitch Writer",
};

const PREMIUM_PRICE = 9;
const PRO_PRICE = 29;
const STRIPE_FEE_PCT = 0.029;
const STRIPE_FEE_FIXED = 0.30;
const GEMINI_COST_PER_GEN = 0.001;

function stripeNet(price) {
  return price - (price * STRIPE_FEE_PCT + STRIPE_FEE_FIXED);
}

// Builds `count` consecutive period windows ending "now", oldest first -
// shared by the daily/weekly/monthly/yearly growth charts below.
function periodBoundaries(now, granularity, count) {
  const periods = [];
  for (let i = count - 1; i >= 0; i--) {
    let start, end, label;
    if (granularity === "daily") {
      start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - i);
      end = new Date(start); end.setDate(end.getDate() + 1);
      label = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (granularity === "weekly") {
      start = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      label = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (granularity === "monthly") {
      start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      label = start.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    } else {
      start = new Date(now.getFullYear() - i, 0, 1);
      end = new Date(now.getFullYear() - i + 1, 0, 1);
      label = String(start.getFullYear());
    }
    periods.push({ start, end, label });
  }
  return periods;
}

function bucketCount(rows, dateField, periods) {
  return periods.map(({ start, end, label }) => ({
    label,
    count: rows.filter((r) => { const d = new Date(r[dateField]); return d >= start && d < end; }).length,
  }));
}

const GROWTH_GRANULARITIES = [["daily", 30], ["weekly", 12], ["monthly", 12], ["yearly", 5]];

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user || !isAdminEmail(user.email)) {
    return res.status(403).json({ success: false, error: "Not authorized" });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const [
    { data: profiles },
    { data: logs },
    { count: messageCount },
    { data: dailyUsage },
    { data: subscriptions },
    { data: settingsRow },
    { data: revenueEvents },
  ] = await Promise.all([
    supabaseAdmin.from("profiles").select("subscription_tier, created_at"),
    supabaseAdmin.from("api_usage_logs").select("endpoint, created_at, tokens_used, status_code, user_id"),
    supabaseAdmin.from("contact_messages").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("daily_usage").select("user_id, generations_count, usage_date"),
    supabaseAdmin.from("subscriptions").select("status, created_at, updated_at"),
    supabaseAdmin.from("admin_settings").select("value").eq("key", "fixed_monthly_costs").maybeSingle(),
    supabaseAdmin.from("revenue_events").select("status, amount, fee_estimate, created_at"),
  ]);

  const allProfiles = profiles || [];
  const allLogs = logs || [];
  const allUsage = dailyUsage || [];
  const allSubscriptions = subscriptions || [];
  const fixedCosts = settingsRow?.value || { vercel: 0, supabase: 0, other: 0 };
  const paidRevenueEvents = (revenueEvents || []).filter((r) => r.status === "paid");

  // Tier breakdown
  const tierBreakdown = { free: 0, premium: 0, pro: 0 };
  allProfiles.forEach((p) => {
    const t = p.subscription_tier || "free";
    tierBreakdown[t] = (tierBreakdown[t] || 0) + 1;
  });

  // Revenue calculations
  const premiumRevenue = tierBreakdown.premium * PREMIUM_PRICE;
  const proRevenue = tierBreakdown.pro * PRO_PRICE;
  const grossRevenue = premiumRevenue + proRevenue;
  const stripeFees = (tierBreakdown.premium * (PREMIUM_PRICE * STRIPE_FEE_PCT + STRIPE_FEE_FIXED)) +
                     (tierBreakdown.pro * (PRO_PRICE * STRIPE_FEE_PCT + STRIPE_FEE_FIXED));

  // Gemini cost estimate
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const logsThisMonth = allLogs.filter((l) => new Date(l.created_at) >= monthStart);
  const geminiCost = logsThisMonth.length * GEMINI_COST_PER_GEN;
  const netProfit = grossRevenue - stripeFees - geminiCost;

  // Tool usage counts
  const toolCounts = {};
  allLogs.forEach((l) => {
    const tool = l.endpoint?.split("/").pop() || "unknown";
    const label = TOOL_LABELS[tool] || tool;
    toolCounts[label] = (toolCounts[label] || 0) + 1;
  });

  // Daily generations for last 30 days (for chart)
  const last30 = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const row = allUsage.find((u) => u.usage_date === key);
    last30.push({ date: key, count: row?.generations_count || 0 });
  }

  // New users per week for last 8 weeks
  const usersByWeek = [];
  for (let i = 7; i >= 0; i--) {
    const wStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
    const wEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const label = wStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    usersByWeek.push({
      week: label,
      count: allProfiles.filter((p) => {
        const d = new Date(p.created_at);
        return d >= wStart && d < wEnd;
      }).length,
    });
  }

  // New users per month for last 6 months
  const usersByMonth = [];
  for (let i = 5; i >= 0; i--) {
    const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    usersByMonth.push({
      month: mStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      count: allProfiles.filter((p) => {
        const d = new Date(p.created_at);
        return d >= mStart && d < mEnd;
      }).length,
    });
  }

  // Active vs inactive users: generated something in the last 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const activeUserIds = new Set(
    allUsage
      .filter((u) => new Date(u.usage_date) >= thirtyDaysAgo && u.generations_count > 0)
      .map((u) => u.user_id)
  );
  const activeUsers = activeUserIds.size;
  const inactiveUsers = Math.max(allProfiles.length - activeUsers, 0);

  // Plan changes: new paid subscriptions vs cancellations this month
  const newPaidSubsThisMonth = allSubscriptions.filter(
    (s) => s.status === "active" && new Date(s.created_at) >= monthStart
  ).length;
  const canceledThisMonth = allSubscriptions.filter(
    (s) => s.status === "canceled" && new Date(s.updated_at) >= monthStart
  ).length;
  const newUsersThisMonthCount = allProfiles.filter((p) => new Date(p.created_at) >= monthStart).length;
  const conversionRate = newUsersThisMonthCount > 0
    ? Math.round((newPaidSubsThisMonth / newUsersThisMonthCount) * 100)
    : 0;

  // Rate-limit hits: how often free users hit their daily cap (upgrade signal)
  const rateLimitHits = allLogs.filter((l) => l.status_code === 429);
  const rateLimitHitsThisWeek = rateLimitHits.filter((l) => new Date(l.created_at) >= weekStart).length;
  const rateLimitHitsThisMonth = rateLimitHits.filter((l) => new Date(l.created_at) >= monthStart).length;
  const hitsByUser = {};
  rateLimitHits.forEach((l) => {
    if (!l.user_id) return;
    hitsByUser[l.user_id] = (hitsByUser[l.user_id] || 0) + 1;
  });
  const topRateLimitUsers = Object.entries(hitsByUser)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId, count]) => ({ userId, count }));

  // True profit after fixed hosting costs (Vercel/Supabase plans, entered manually
  // in Settings since these aren't available from any API).
  const fixedCostsTotal = (fixedCosts.vercel || 0) + (fixedCosts.supabase || 0) + (fixedCosts.other || 0);
  const trueNetProfit = netProfit - fixedCostsTotal;

  // Growth charts: new users, usage and revenue bucketed into daily/weekly/
  // monthly/yearly series so the admin dashboard can show trends over time,
  // not just today's snapshot.
  const growth = { newUsers: {}, usage: {}, revenue: {} };
  for (const [granularity, count] of GROWTH_GRANULARITIES) {
    const periods = periodBoundaries(now, granularity, count);
    growth.newUsers[granularity] = bucketCount(allProfiles, "created_at", periods);
    growth.usage[granularity] = bucketCount(allLogs, "created_at", periods);
    growth.revenue[granularity] = periods.map(({ start, end, label }) => {
      const eventsInRange = paidRevenueEvents.filter((r) => {
        const d = new Date(r.created_at);
        return d >= start && d < end;
      });
      const gross = eventsInRange.reduce((s, r) => s + Number(r.amount || 0), 0);
      const fees = eventsInRange.reduce((s, r) => s + Number(r.fee_estimate || 0), 0);
      const usageInRange = allLogs.filter((l) => {
        const d = new Date(l.created_at);
        return d >= start && d < end;
      }).length;
      const periodDays = Math.max((end - start) / (24 * 60 * 60 * 1000), 1);
      const fixedCostProrated = fixedCostsTotal * (periodDays / 30);
      const net = gross - fees;
      const trueNet = net - usageInRange * GEMINI_COST_PER_GEN - fixedCostProrated;
      return {
        label,
        gross: parseFloat(gross.toFixed(2)),
        net: parseFloat(net.toFixed(2)),
        trueNet: parseFloat(trueNet.toFixed(2)),
      };
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      // Users
      totalUsers: allProfiles.length,
      newUsersThisWeek: allProfiles.filter((p) => new Date(p.created_at) >= weekStart).length,
      newUsersThisMonth: newUsersThisMonthCount,
      activeUsers,
      inactiveUsers,
      tierBreakdown,
      usersByWeek,
      usersByMonth,
      // Generations
      totalGenerations: allLogs.length,
      generationsThisMonth: logsThisMonth.length,
      generationsThisWeek: allLogs.filter((l) => new Date(l.created_at) >= weekStart).length,
      toolCounts,
      last30Days: last30,
      // Rate-limit hits (free users hitting their daily cap)
      rateLimitHits: {
        thisWeek: rateLimitHitsThisWeek,
        thisMonth: rateLimitHitsThisMonth,
        topUsers: topRateLimitUsers,
      },
      // Plan changes
      planChanges: {
        newPaidSubsThisMonth,
        canceledThisMonth,
        conversionRate,
      },
      // Revenue & costs
      revenue: {
        premium: premiumRevenue,
        pro: proRevenue,
        gross: grossRevenue,
        stripeFees: parseFloat(stripeFees.toFixed(2)),
        geminiCost: parseFloat(geminiCost.toFixed(2)),
        net: parseFloat(netProfit.toFixed(2)),
        fixedCosts,
        fixedCostsTotal: parseFloat(fixedCostsTotal.toFixed(2)),
        trueNet: parseFloat(trueNetProfit.toFixed(2)),
      },
      growth,
      revenueTrackingSince: paidRevenueEvents.length
        ? paidRevenueEvents.reduce((min, r) => (r.created_at < min ? r.created_at : min), paidRevenueEvents[0].created_at)
        : null,
      messageCount: messageCount || 0,
    },
  });
}

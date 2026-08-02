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
  ] = await Promise.all([
    supabaseAdmin.from("profiles").select("subscription_tier, created_at"),
    supabaseAdmin.from("api_usage_logs").select("endpoint, created_at, tokens_used"),
    supabaseAdmin.from("contact_messages").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("daily_usage").select("generations_count, usage_date"),
  ]);

  const allProfiles = profiles || [];
  const allLogs = logs || [];
  const allUsage = dailyUsage || [];

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

  return res.status(200).json({
    success: true,
    data: {
      // Users
      totalUsers: allProfiles.length,
      newUsersThisWeek: allProfiles.filter((p) => new Date(p.created_at) >= weekStart).length,
      newUsersThisMonth: allProfiles.filter((p) => new Date(p.created_at) >= monthStart).length,
      tierBreakdown,
      usersByWeek,
      // Generations
      totalGenerations: allLogs.length,
      generationsThisMonth: logsThisMonth.length,
      generationsThisWeek: allLogs.filter((l) => new Date(l.created_at) >= weekStart).length,
      toolCounts,
      last30Days: last30,
      // Revenue & costs
      revenue: {
        premium: premiumRevenue,
        pro: proRevenue,
        gross: grossRevenue,
        stripeFees: parseFloat(stripeFees.toFixed(2)),
        geminiCost: parseFloat(geminiCost.toFixed(2)),
        net: parseFloat(netProfit.toFixed(2)),
      },
      messageCount: messageCount || 0,
    },
  });
}

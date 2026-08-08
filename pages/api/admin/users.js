import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../lib/getAuthUser";
import { isAdminUser, isAdminEmail } from "../../../lib/isAdmin";

const VALID_TIERS = ["free", "premium", "pro"];
const VALID_ROLES = ["user", "admin"];
const PAGE_SIZE = 25;

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user || !(await isAdminUser(user))) {
    return res.status(403).json({ success: false, error: "Not authorized" });
  }

  if (req.method === "GET") {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: profiles, error, count } = await supabaseAdmin
      .from("profiles")
      .select("id, subscription_tier, role, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    if (error) return res.status(500).json({ success: false, error: error.message });

    const { data: authList, error: authError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (authError) return res.status(500).json({ success: false, error: authError.message });

    // Per-user hit counts: total API calls vs. how many of those hit the
    // free-tier rate limit (429s) - shown as two columns in the Users tab
    // so an admin can see usage/upgrade-pressure per user, not just an
    // aggregate top-5 leaderboard. Scoped to just this page's users (rather
    // than pulling every api_usage_logs row) so it stays cheap as usage grows.
    const pageUserIds = (profiles || []).map((p) => p.id);
    const { data: logs } = pageUserIds.length
      ? await supabaseAdmin.from("api_usage_logs").select("user_id, status_code").in("user_id", pageUserIds)
      : { data: [] };
    const totalHitsById = {};
    const rateLimitHitsById = {};
    (logs || []).forEach((l) => {
      if (!l.user_id) return;
      totalHitsById[l.user_id] = (totalHitsById[l.user_id] || 0) + 1;
      if (l.status_code === 429) rateLimitHitsById[l.user_id] = (rateLimitHitsById[l.user_id] || 0) + 1;
    });

    const emailById = {};
    (authList?.users || []).forEach((u) => {
      emailById[u.id] = u.email;
    });

    const merged = (profiles || []).map((p) => {
      const email = emailById[p.id] || "(unknown)";
      return {
        id: p.id,
        email,
        subscription_tier: p.subscription_tier || "free",
        // A bootstrap (env-var) admin is always an admin regardless of the
        // DB role column - reflect that here so the Users tab shows it
        // accurately even before/without ever setting the DB role.
        role: p.role === "admin" || isAdminEmail(email) ? "admin" : "user",
        isBootstrapAdmin: isAdminEmail(email),
        created_at: p.created_at,
        totalHits: totalHitsById[p.id] || 0,
        rateLimitHits: rateLimitHitsById[p.id] || 0,
      };
    });

    return res.status(200).json({ success: true, data: merged, page, pageSize: PAGE_SIZE, total: count || 0 });
  }

  if (req.method === "PATCH") {
    const { userId, tier, role } = req.body || {};
    if (!userId) {
      return res.status(400).json({ success: false, error: "userId is required." });
    }
    if (tier === undefined && role === undefined) {
      return res.status(400).json({ success: false, error: "Nothing to update." });
    }

    const update = {};
    if (tier !== undefined) {
      if (!VALID_TIERS.includes(tier)) {
        return res.status(400).json({ success: false, error: "Invalid tier." });
      }
      update.subscription_tier = tier;
    }
    if (role !== undefined) {
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ success: false, error: "Invalid role." });
      }
      update.role = role;
    }

    const { error } = await supabaseAdmin.from("profiles").update(update).eq("id", userId);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}

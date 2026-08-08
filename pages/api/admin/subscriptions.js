import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../lib/getAuthUser";
import { isAdminUser } from "../../../lib/isAdmin";

const PAGE_SIZE = 25;

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user || !(await isAdminUser(user))) {
    return res.status(403).json({ success: false, error: "Not authorized" });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const [
    { data: subs, error, count },
    { count: activeCount },
    { count: pastDueCount },
    { count: cancelingCount },
    { count: canceledCount },
  ] = await Promise.all([
    supabaseAdmin
      .from("subscriptions")
      .select("id, user_id, paddle_subscription_id, stripe_subscription_id, status, price_id, created_at, updated_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to),
    supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "past_due"),
    supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "canceling"),
    supabaseAdmin.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "canceled"),
  ]);
  if (error) return res.status(500).json({ success: false, error: error.message });

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, subscription_tier");
  const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

  const tierById = {};
  (profiles || []).forEach((p) => { tierById[p.id] = p.subscription_tier; });
  const emailById = {};
  (authList?.users || []).forEach((u) => { emailById[u.id] = u.email; });

  const merged = (subs || []).map((s) => ({
    id: s.id,
    email: emailById[s.user_id] || "(unknown)",
    tier: tierById[s.user_id] || "free",
    status: s.status,
    provider: s.paddle_subscription_id ? "paddle" : s.stripe_subscription_id ? "stripe" : null,
    created_at: s.created_at,
    updated_at: s.updated_at,
  }));

  // Counted separately (not from `merged`) so these stay accurate for the
  // whole table regardless of which page is currently loaded.
  const summary = {
    active: activeCount || 0,
    pastDue: pastDueCount || 0,
    canceling: cancelingCount || 0,
    canceled: canceledCount || 0,
    total: count || 0,
  };

  return res.status(200).json({ success: true, data: merged, summary, page, pageSize: PAGE_SIZE, total: count || 0 });
}

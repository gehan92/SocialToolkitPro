import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../lib/getAuthUser";
import { isAdminUser } from "../../../lib/isAdmin";

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user || !(await isAdminUser(user))) {
    return res.status(403).json({ success: false, error: "Not authorized" });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { data: subs, error } = await supabaseAdmin
    .from("subscriptions")
    .select("id, user_id, paddle_subscription_id, stripe_subscription_id, status, price_id, created_at, updated_at")
    .order("created_at", { ascending: false });
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

  const summary = {
    active: merged.filter((s) => s.status === "active").length,
    pastDue: merged.filter((s) => s.status === "past_due").length,
    canceling: merged.filter((s) => s.status === "canceling").length,
    canceled: merged.filter((s) => s.status === "canceled").length,
    total: merged.length,
  };

  return res.status(200).json({ success: true, data: merged, summary });
}

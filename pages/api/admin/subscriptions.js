import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../lib/getAuthUser";
import { isAdminEmail } from "../../../lib/isAdmin";

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user || !isAdminEmail(user.email)) {
    return res.status(403).json({ success: false, error: "Not authorized" });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { data: subs, error } = await supabaseAdmin
    .from("subscriptions")
    .select("id, stripe_subscription_id, stripe_customer_id, status, price_id, created_at, updated_at")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ success: false, error: error.message });

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, stripe_customer_id, subscription_tier");
  const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });

  const profileByCustomer = {};
  (profiles || []).forEach((p) => {
    if (p.stripe_customer_id) profileByCustomer[p.stripe_customer_id] = p;
  });
  const emailById = {};
  (authList?.users || []).forEach((u) => {
    emailById[u.id] = u.email;
  });

  const merged = (subs || []).map((s) => {
    const profile = profileByCustomer[s.stripe_customer_id];
    return {
      id: s.id,
      email: profile ? emailById[profile.id] || "(unknown)" : "(unknown)",
      tier: profile?.subscription_tier || "free",
      status: s.status,
      stripe_subscription_id: s.stripe_subscription_id,
      created_at: s.created_at,
      updated_at: s.updated_at,
    };
  });

  const summary = {
    active: merged.filter((s) => s.status === "active").length,
    pastDue: merged.filter((s) => s.status === "past_due").length,
    canceled: merged.filter((s) => s.status === "canceled").length,
    total: merged.length,
  };

  return res.status(200).json({ success: true, data: merged, summary });
}

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../lib/getAuthUser";
import { isAdminUser } from "../../../lib/isAdmin";

// Every individual payment event (charges, failures, refunds/chargebacks),
// as opposed to pages/api/admin/subscriptions.js which only shows each
// subscription's current status - this is the actual per-user transaction
// history, sourced from revenue_events (written by both webhook handlers).
export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user || !(await isAdminUser(user))) {
    return res.status(403).json({ success: false, error: "Not authorized" });
  }
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { data: events, error } = await supabaseAdmin
    .from("revenue_events")
    .select("id, user_id, email, tier, status, amount, fee_estimate, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) return res.status(500).json({ success: false, error: error.message });

  const { data: authList } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  const emailById = {};
  (authList?.users || []).forEach((u) => { emailById[u.id] = u.email; });

  const data = (events || []).map((e) => ({
    id: e.id,
    email: emailById[e.user_id] || e.email || "(unknown)",
    tier: e.tier,
    status: e.status,
    amount: e.amount,
    fee_estimate: e.fee_estimate,
    created_at: e.created_at,
  }));

  return res.status(200).json({ success: true, data });
}

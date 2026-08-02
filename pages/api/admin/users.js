import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../lib/getAuthUser";
import { isAdminEmail } from "../../../lib/isAdmin";

const VALID_TIERS = ["free", "premium", "pro"];

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user || !isAdminEmail(user.email)) {
    return res.status(403).json({ success: false, error: "Not authorized" });
  }

  if (req.method === "GET") {
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, subscription_tier, created_at")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });

    const { data: authList, error: authError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (authError) return res.status(500).json({ success: false, error: authError.message });

    const emailById = {};
    (authList?.users || []).forEach((u) => {
      emailById[u.id] = u.email;
    });

    const merged = (profiles || []).map((p) => ({
      id: p.id,
      email: emailById[p.id] || "(unknown)",
      subscription_tier: p.subscription_tier || "free",
      created_at: p.created_at,
    }));

    return res.status(200).json({ success: true, data: merged });
  }

  if (req.method === "PATCH") {
    const { userId, tier } = req.body || {};
    if (!userId || !VALID_TIERS.includes(tier)) {
      return res.status(400).json({ success: false, error: "userId and a valid tier are required." });
    }
    const { error } = await supabaseAdmin.from("profiles").update({ subscription_tier: tier }).eq("id", userId);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}

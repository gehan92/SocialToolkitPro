import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../lib/getAuthUser";
import { isAdminEmail } from "../../../lib/isAdmin";

const DEFAULT_FIXED_COSTS = { vercel: 0, supabase: 0, other: 0 };

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user || !isAdminEmail(user.email)) {
    return res.status(403).json({ success: false, error: "Not authorized" });
  }

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("admin_settings")
      .select("value")
      .eq("key", "fixed_monthly_costs")
      .maybeSingle();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data: data?.value || DEFAULT_FIXED_COSTS });
  }

  if (req.method === "PATCH") {
    const { vercel, supabase, other } = req.body || {};
    const value = {
      vercel: Number(vercel) || 0,
      supabase: Number(supabase) || 0,
      other: Number(other) || 0,
    };
    const { error } = await supabaseAdmin
      .from("admin_settings")
      .upsert({ key: "fixed_monthly_costs", value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data: value });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}

import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../lib/getAuthUser";
import { isAdminUser } from "../../../lib/isAdmin";
import { invalidatePlanConfigCache } from "../../../lib/planConfig";

const DEFAULTS = {
  fixed_monthly_costs: { vercel: 0, supabase: 0, other: 0 },
  plan_config: { premiumPrice: 9, proPrice: 29, freeDailyLimit: 10 },
};

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user || !(await isAdminUser(user))) {
    return res.status(403).json({ success: false, error: "Not authorized" });
  }

  const key = req.query.key === "plan_config" ? "plan_config" : "fixed_monthly_costs";

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("admin_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data: data?.value || DEFAULTS[key] });
  }

  if (req.method === "PATCH") {
    let value;
    if (key === "plan_config") {
      const { premiumPrice, proPrice, freeDailyLimit } = req.body || {};
      value = {
        premiumPrice: Number(premiumPrice) > 0 ? Number(premiumPrice) : DEFAULTS.plan_config.premiumPrice,
        proPrice: Number(proPrice) > 0 ? Number(proPrice) : DEFAULTS.plan_config.proPrice,
        freeDailyLimit: Number(freeDailyLimit) > 0 ? Math.floor(Number(freeDailyLimit)) : DEFAULTS.plan_config.freeDailyLimit,
      };
    } else {
      const { vercel, supabase, other } = req.body || {};
      value = {
        vercel: Number(vercel) || 0,
        supabase: Number(supabase) || 0,
        other: Number(other) || 0,
      };
    }
    const { error } = await supabaseAdmin
      .from("admin_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) return res.status(500).json({ success: false, error: error.message });
    if (key === "plan_config") invalidatePlanConfigCache();
    return res.status(200).json({ success: true, data: value });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { getAuthUser, getUserTier } from "../../../../lib/getAuthUser";

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: "Please log in to use the content calendar." });
  }

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("content_calendar")
      .select("*")
      .eq("user_id", user.id)
      .order("planned_date", { ascending: true });

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  if (req.method === "POST") {
    const tier = await getUserTier(user.id);
    if (tier === "free") {
      return res.status(403).json({ success: false, error: "The content calendar is a Premium feature. Upgrade to plan your posts." });
    }

    const { planned_date, note, output_type } = req.body || {};
    if (!planned_date) {
      return res.status(400).json({ success: false, error: "planned_date is required." });
    }

    const { data, error } = await supabaseAdmin
      .from("content_calendar")
      .insert({ user_id: user.id, planned_date, note: note || "", output_type: output_type || null })
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { getAuthUser, getUserTier } from "../../../../lib/getAuthUser";

const VALID_TYPES = ["hashtag", "caption", "bio", "ideas"];

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: "Please log in to use templates." });
  }

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("templates")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  if (req.method === "POST") {
    const tier = await getUserTier(user.id, user.email);
    if (tier === "free") {
      return res.status(403).json({ success: false, error: "Templates are a Premium feature. Upgrade to save reusable presets." });
    }

    const { name, tool_type, prompt_data } = req.body || {};
    if (!name || !String(name).trim() || !VALID_TYPES.includes(tool_type)) {
      return res.status(400).json({ success: false, error: "name and a valid tool_type are required." });
    }

    const { count } = await supabaseAdmin
      .from("templates")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("tool_type", tool_type);

    if ((count || 0) >= 3) {
      return res.status(403).json({ success: false, error: "You can save up to 3 templates per tool. Delete one to add a new one." });
    }

    const { data, error } = await supabaseAdmin
      .from("templates")
      .insert({ user_id: user.id, name: String(name).trim(), tool_type, prompt_data: prompt_data || {} })
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}

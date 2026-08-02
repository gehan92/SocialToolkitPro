import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { getAuthUser, getUserTier } from "../../../../lib/getAuthUser";

const VALID_TYPES = ["hashtag", "caption", "bio", "ideas"];

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: "Please log in to use saved outputs." });
  }

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("saved_outputs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  if (req.method === "POST") {
    const tier = await getUserTier(user.id);
    if (tier === "free") {
      return res.status(403).json({ success: false, error: "Saving outputs is a Premium feature. Upgrade to save your generations." });
    }

    const { output_type, content, metadata } = req.body || {};
    if (!VALID_TYPES.includes(output_type) || !content || !String(content).trim()) {
      return res.status(400).json({ success: false, error: "output_type and content are required." });
    }

    const { data, error } = await supabaseAdmin
      .from("saved_outputs")
      .insert({ user_id: user.id, output_type, content, metadata: metadata || {} })
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}

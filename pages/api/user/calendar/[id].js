import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../../lib/getAuthUser";

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: "Please log in." });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { id } = req.query;
  const { error } = await supabaseAdmin
    .from("content_calendar")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.status(200).json({ success: true });
}

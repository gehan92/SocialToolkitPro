import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../../lib/getAuthUser";

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: "Please log in." });
  }

  const { id } = req.query;

  if (req.method === "DELETE") {
    const { error } = await supabaseAdmin
      .from("saved_outputs")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // scoped to the caller - can't delete someone else's row

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true });
  }

  if (req.method === "PATCH") {
    const { is_favorite } = req.body || {};
    const { data, error } = await supabaseAdmin
      .from("saved_outputs")
      .update({ is_favorite: !!is_favorite })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true, data });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../../lib/getAuthUser";
import { isAdminUser } from "../../../../lib/isAdmin";

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user || !(await isAdminUser(user))) {
    return res.status(403).json({ success: false, error: "Not authorized" });
  }

  if (req.method !== "DELETE") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { id } = req.query;
  const { error } = await supabaseAdmin.from("contact_messages").delete().eq("id", id);

  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.status(200).json({ success: true });
}

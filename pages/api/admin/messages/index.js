import { supabaseAdmin } from "../../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../../lib/getAuthUser";
import { isAdminEmail } from "../../../../lib/isAdmin";

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user || !isAdminEmail(user.email)) {
    return res.status(403).json({ success: false, error: "Not authorized" });
  }

  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { data, error } = await supabaseAdmin
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.status(200).json({ success: true, data });
}

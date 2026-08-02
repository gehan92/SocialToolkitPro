import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../lib/getAuthUser";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: "Please log in." });
  }

  if (req.method !== "PATCH") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { username } = req.body || {};
  if (!username || !USERNAME_RE.test(username)) {
    return res.status(400).json({ success: false, error: "Username must be 3-20 characters: letters, numbers, underscores only." });
  }

  const { data: existing } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .ilike("username", username)
    .neq("id", user.id)
    .maybeSingle();
  if (existing) {
    return res.status(409).json({ success: false, error: "That username is already taken." });
  }

  const { error } = await supabaseAdmin.from("profiles").update({ username }).eq("id", user.id);
  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.status(200).json({ success: true });
}

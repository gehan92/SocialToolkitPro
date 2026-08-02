import { supabaseAdmin } from "../../lib/supabaseAdmin";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const { username, excludeUserId } = req.query;
  if (!username || !USERNAME_RE.test(username)) {
    return res.status(200).json({ success: true, available: false, reason: "invalid" });
  }

  let query = supabaseAdmin.from("profiles").select("id").ilike("username", username);
  if (excludeUserId) query = query.neq("id", excludeUserId);
  const { data } = await query.maybeSingle();

  return res.status(200).json({ success: true, available: !data });
}

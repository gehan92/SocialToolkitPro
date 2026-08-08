import { supabaseAdmin } from "../../../lib/supabaseAdmin";

// Enforces the data-retention promise made on the homepage FAQ and in
// pages/privacy.js Section 8 ("Saved/favorited outputs are automatically
// deleted after 3 months"). saved_outputs.expires_at is already set by the
// database itself (default: created_at + 3 months, see supabase/schema.sql)
// - this job just needs to actually delete rows once that time passes.
// Triggered daily by Vercel Cron (see vercel.json), authenticated via
// CRON_SECRET so this can't be hit by anyone else.
export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, error: "Unauthorized" });
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ success: false, error: "Supabase isn't configured" });
  }

  const { error, count } = await supabaseAdmin
    .from("saved_outputs")
    .delete({ count: "exact" })
    .lt("expires_at", new Date().toISOString());

  if (error) return res.status(500).json({ success: false, error: error.message });
  return res.status(200).json({ success: true, deleted: count ?? 0 });
}

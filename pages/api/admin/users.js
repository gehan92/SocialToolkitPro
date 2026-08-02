import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../lib/getAuthUser";
import { isAdminUser, isAdminEmail } from "../../../lib/isAdmin";

const VALID_TIERS = ["free", "premium", "pro"];
const VALID_ROLES = ["user", "admin"];

export default async function handler(req, res) {
  const user = await getAuthUser(req);
  if (!user || !(await isAdminUser(user))) {
    return res.status(403).json({ success: false, error: "Not authorized" });
  }

  if (req.method === "GET") {
    const { data: profiles, error } = await supabaseAdmin
      .from("profiles")
      .select("id, subscription_tier, role, created_at")
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ success: false, error: error.message });

    const { data: authList, error: authError } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    if (authError) return res.status(500).json({ success: false, error: authError.message });

    const emailById = {};
    (authList?.users || []).forEach((u) => {
      emailById[u.id] = u.email;
    });

    const merged = (profiles || []).map((p) => {
      const email = emailById[p.id] || "(unknown)";
      return {
        id: p.id,
        email,
        subscription_tier: p.subscription_tier || "free",
        // A bootstrap (env-var) admin is always an admin regardless of the
        // DB role column - reflect that here so the Users tab shows it
        // accurately even before/without ever setting the DB role.
        role: p.role === "admin" || isAdminEmail(email) ? "admin" : "user",
        isBootstrapAdmin: isAdminEmail(email),
        created_at: p.created_at,
      };
    });

    return res.status(200).json({ success: true, data: merged });
  }

  if (req.method === "PATCH") {
    const { userId, tier, role } = req.body || {};
    if (!userId) {
      return res.status(400).json({ success: false, error: "userId is required." });
    }
    if (tier === undefined && role === undefined) {
      return res.status(400).json({ success: false, error: "Nothing to update." });
    }

    const update = {};
    if (tier !== undefined) {
      if (!VALID_TIERS.includes(tier)) {
        return res.status(400).json({ success: false, error: "Invalid tier." });
      }
      update.subscription_tier = tier;
    }
    if (role !== undefined) {
      if (!VALID_ROLES.includes(role)) {
        return res.status(400).json({ success: false, error: "Invalid role." });
      }
      update.role = role;
    }

    const { error } = await supabaseAdmin.from("profiles").update(update).eq("id", userId);
    if (error) return res.status(500).json({ success: false, error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ success: false, error: "Method not allowed" });
}

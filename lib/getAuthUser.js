import { supabaseAdmin } from "./supabaseAdmin";
import { isAdminEmail } from "./isAdmin";

// Shared helper: resolve the logged-in user (if any) from a request's
// Authorization: Bearer <access_token> header. Used by API routes that need
// to know who's calling - rate limiting, saved outputs, etc.
export async function getAuthUser(req) {
  if (!supabaseAdmin) return null;
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

// `email` is optional but should be passed whenever available (from the
// already-resolved auth user) so admin accounts get Pro-equivalent access
// without needing their own paid subscription. Covers both the env-var
// admin bootstrap and anyone promoted via profiles.role = 'admin'.
export async function getUserTier(userId, email) {
  if (isAdminEmail(email)) return "pro";
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("subscription_tier, role")
    .eq("id", userId)
    .single();
  if (profile?.role === "admin") return "pro";
  return profile?.subscription_tier || "free";
}

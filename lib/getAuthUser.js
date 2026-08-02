import { supabaseAdmin } from "./supabaseAdmin";

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

export async function getUserTier(userId) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("subscription_tier")
    .eq("id", userId)
    .single();
  return profile?.subscription_tier || "free";
}

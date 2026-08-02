import { supabaseAdmin } from "./supabaseAdmin";

// Env-var admin list: a bootstrap/fallback that always works regardless of
// database state, so admin access can never be fully locked out. Kept
// synchronous since a few callers need a quick check without a DB round-trip.
export function isAdminEmail(email) {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(String(email).toLowerCase());
}

// The day-to-day admin check: env-var admins always pass (bootstrap), plus
// anyone an existing admin has promoted via profiles.role = 'admin' in the
// Users tab. That column has no client-side UPDATE policy, so it can only
// ever be changed through this service-role backend, never by a user
// editing their own profile.
export async function isAdminUser(user) {
  if (!user) return false;
  if (isAdminEmail(user.email)) return true;
  if (!supabaseAdmin) return false;
  const { data } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role === "admin";
}

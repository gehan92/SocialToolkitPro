import { supabaseAdmin } from "./supabaseAdmin";

// Fire-and-forget usage logging for the analytics dashboard - never throws,
// since a logging failure shouldn't break the actual generation response.
export async function logApiUsage({ userId, endpoint, statusCode, responseTimeMs, tokensUsed }) {
  if (!supabaseAdmin || !userId) return;
  try {
    await supabaseAdmin.from("api_usage_logs").insert({
      user_id: userId,
      endpoint,
      status_code: statusCode,
      response_time_ms: responseTimeMs,
      tokens_used: tokensUsed,
    });
  } catch {
    // best-effort only
  }
}

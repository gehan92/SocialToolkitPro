import { paddle } from "../../../lib/paddleClient";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../lib/getAuthUser";

// Undoes a scheduled cancellation (see pages/api/subscription/cancel.js) as
// long as the current billing period hasn't ended yet - clearing
// scheduledChange on Paddle's side resumes normal recurring billing.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: "Please log in." });
  }

  if (!paddle) {
    return res.status(500).json({ success: false, error: "Paddle isn't configured yet." });
  }

  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("paddle_subscription_id")
    .eq("user_id", user.id)
    .eq("status", "canceling")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub?.paddle_subscription_id) {
    return res.status(404).json({ success: false, error: "No pending cancellation found." });
  }

  try {
    await paddle.subscriptions.update(sub.paddle_subscription_id, { scheduledChange: null });

    await supabaseAdmin.from("subscriptions").update({ status: "active" }).eq("paddle_subscription_id", sub.paddle_subscription_id);
    await supabaseAdmin.from("profiles").update({ subscription_status: "active" }).eq("id", user.id);

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(502).json({ success: false, error: e.message });
  }
}

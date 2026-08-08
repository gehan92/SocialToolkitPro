import { paddle } from "../../../lib/paddleClient";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../lib/getAuthUser";

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

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  if (!profile || profile.subscription_tier === "free") {
    return res.status(400).json({ success: false, error: "You are already on the Free plan." });
  }

  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("paddle_subscription_id")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub?.paddle_subscription_id) {
    return res.status(404).json({ success: false, error: "No active subscription found." });
  }

  try {
    // Cancel at the end of the current billing period, not immediately -
    // matches the "Cancellation and refunds" promise in /terms (Section 4):
    // access continues until the period they already paid for ends.
    await paddle.subscriptions.cancel(sub.paddle_subscription_id, { effectiveFrom: "next_billing_period" });

    // Reflect the pending cancellation right away rather than waiting for the
    // webhook round-trip. Tier is left untouched on purpose - the account
    // stays on its current plan until subscription.canceled actually fires
    // (see pages/api/webhooks/paddle.js), which is when tier flips to free.
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "canceling" })
      .eq("paddle_subscription_id", sub.paddle_subscription_id);

    await supabaseAdmin
      .from("profiles")
      .update({ subscription_status: "canceling" })
      .eq("id", user.id);

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(502).json({ success: false, error: e.message });
  }
}

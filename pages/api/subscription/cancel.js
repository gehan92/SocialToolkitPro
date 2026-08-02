import { stripe } from "../../../lib/stripeClient";
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

  if (!stripe) {
    return res.status(500).json({ success: false, error: "Stripe isn't configured yet." });
  }

  // Get the stripe_customer_id from the user's profile
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("stripe_customer_id, subscription_tier")
    .eq("id", user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return res.status(404).json({ success: false, error: "No billing account found." });
  }

  if (profile.subscription_tier === "free") {
    return res.status(400).json({ success: false, error: "You are already on the Free plan." });
  }

  try {
    // List active subscriptions for this customer in Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    const sub = subscriptions.data[0];
    if (!sub) {
      return res.status(404).json({ success: false, error: "No active subscription found in Stripe." });
    }

    // Cancel at period end — user keeps access until billing cycle ends
    await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true });

    // Update our subscriptions table
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "canceling" })
      .eq("stripe_subscription_id", sub.id);

    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(502).json({ success: false, error: e.message });
  }
}

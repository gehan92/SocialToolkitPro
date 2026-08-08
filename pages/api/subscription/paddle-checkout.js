import { paddle } from "../../../lib/paddleClient";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getAuthUser } from "../../../lib/getAuthUser";

// Body: { plan: "premium" | "pro", cycle?: "monthly" | "annual" }
//
// Paddle Billing checkout is a client-side overlay (Paddle.Checkout.open()),
// not a server redirect like Stripe. So instead of returning a URL, this
// creates a draft transaction server-side (so customData.userId is set from
// the authenticated session, not from client-editable JS - same trust
// boundary as client_reference_id in pages/api/subscription/checkout.js) and
// hands back its id for the frontend to open.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  if (!paddle) {
    return res.status(500).json({ success: false, error: "Paddle isn't configured yet - add PADDLE_API_KEY to .env.local" });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: "Please log in." });
  }

  const { plan, cycle } = req.body || {};
  const isAnnual = cycle === "annual";
  const priceId = isAnnual
    ? (plan === "pro" ? process.env.PADDLE_PRICE_PRO_ANNUAL : process.env.PADDLE_PRICE_PREMIUM_ANNUAL)
    : (plan === "pro" ? process.env.PADDLE_PRICE_PRO : process.env.PADDLE_PRICE_PREMIUM);

  if (!priceId) {
    return res.status(500).json({ success: false, error: `Missing Paddle price ID for plan "${plan}" (${isAnnual ? "annual" : "monthly"})` });
  }

  // If the account already has a subscription with Paddle (active, or
  // pending cancellation), switch that existing subscription to the new
  // price instead of creating a second one via checkout. Paddle bills the
  // proration on the existing payment method directly - no checkout overlay
  // needed, and it also clears any scheduled cancellation, so picking a plan
  // while "Cancellation Scheduled" acts as an implicit resume.
  const { data: existingSub } = await supabaseAdmin
    .from("subscriptions")
    .select("paddle_subscription_id")
    .eq("user_id", user.id)
    .in("status", ["active", "canceling"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingSub?.paddle_subscription_id) {
    try {
      await paddle.subscriptions.update(existingSub.paddle_subscription_id, {
        items: [{ priceId, quantity: 1 }],
        prorationBillingMode: "prorated_immediately",
        scheduledChange: null,
      });

      await supabaseAdmin.from("subscriptions").update({
        price_id: priceId,
        status: "active",
        updated_at: new Date().toISOString(),
      }).eq("paddle_subscription_id", existingSub.paddle_subscription_id);

      await supabaseAdmin.from("profiles").update({
        subscription_tier: plan,
        subscription_status: "active",
      }).eq("id", user.id);

      return res.status(200).json({ success: true, changed: true });
    } catch (e) {
      return res.status(502).json({ success: false, error: e.message });
    }
  }

  try {
    const transaction = await paddle.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customData: { userId: user.id, kind: "subscription" },
    });

    return res.status(200).json({ success: true, transactionId: transaction.id });
  } catch (e) {
    return res.status(502).json({ success: false, error: e.message });
  }
}

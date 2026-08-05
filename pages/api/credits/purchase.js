import { getAuthUser } from "../../../lib/getAuthUser";
import { getPlanConfig } from "../../../lib/planConfig";

// Pay-as-you-go: buy a fixed pack of generations (see planConfig's
// creditPackSize/creditPackPrice) instead of subscribing. This is a one-time
// payment, not a subscription, so it doesn't touch the Stripe subscription
// checkout flow in pages/api/subscription/checkout.js.
//
// NOT WIRED TO A REAL PAYMENT PROCESSOR YET. Once one is chosen (Paddle,
// Lemon Squeezy, etc.) and its account/API keys exist, replace the 501
// response below with a real checkout-session creation call, and credit the
// purchase (profiles.credits_balance + a credit_purchases row) from that
// processor's webhook after payment actually succeeds - never credit here
// on the client's request, the same way pages/api/webhooks/stripe.js is the
// only place subscription tiers get upgraded.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: "Please log in." });
  }

  const { creditPackSize, creditPackPrice } = await getPlanConfig();

  return res.status(501).json({
    success: false,
    error: "Pay-as-you-go isn't connected to a payment processor yet.",
    pack: { credits: creditPackSize, price: creditPackPrice },
  });
}

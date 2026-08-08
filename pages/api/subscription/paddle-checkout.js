import { paddle } from "../../../lib/paddleClient";
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

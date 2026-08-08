import { getAuthUser } from "../../../lib/getAuthUser";
import { getPlanConfig } from "../../../lib/planConfig";
import { paddle } from "../../../lib/paddleClient";

// Pay-as-you-go: buy a fixed pack of generations (see planConfig's
// creditPackSize/creditPackPrice) instead of subscribing. This is a one-time
// payment, not a subscription, so PADDLE_PRICE_CREDIT_PACK must point at a
// non-recurring price in the Paddle catalog.
//
// Creates a draft transaction server-side (customData.userId comes from the
// authenticated session, not client-editable JS) and hands its id back for
// the frontend to open via Paddle.Checkout.open({ transactionId }). The
// actual credit top-up only happens once pages/api/webhooks/paddle.js sees
// this transaction complete - never here, on the client's request.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: "Please log in." });
  }

  if (!paddle) {
    return res.status(500).json({ success: false, error: "Paddle isn't configured yet - add PADDLE_API_KEY to .env.local" });
  }

  const priceId = process.env.PADDLE_PRICE_CREDIT_PACK;
  if (!priceId) {
    return res.status(500).json({ success: false, error: "Missing PADDLE_PRICE_CREDIT_PACK" });
  }

  const { creditPackSize, creditPackPrice } = await getPlanConfig();

  try {
    const transaction = await paddle.transactions.create({
      items: [{ priceId, quantity: 1 }],
      customData: { userId: user.id, kind: "credit_pack" },
    });

    return res.status(200).json({
      success: true,
      transactionId: transaction.id,
      pack: { credits: creditPackSize, price: creditPackPrice },
    });
  } catch (e) {
    return res.status(502).json({ success: false, error: e.message });
  }
}

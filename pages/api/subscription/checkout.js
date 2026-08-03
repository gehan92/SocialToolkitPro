import { stripe } from "../../../lib/stripeClient";
import { getAuthUser } from "../../../lib/getAuthUser";

// Body: { plan: "premium" | "pro" }
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  if (!stripe) {
    return res.status(500).json({ success: false, error: "Stripe isn't configured yet - add STRIPE_SECRET_KEY to .env.local" });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ success: false, error: "Please log in." });
  }

  const { plan } = req.body || {};
  const priceId = plan === "pro" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_PREMIUM;

  if (!priceId) {
    return res.status(500).json({ success: false, error: `Missing Stripe price ID for plan "${plan}"` });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      success_url: `${process.env.NEXT_PUBLIC_URL}/account?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/account?checkout=canceled`,
    });

    return res.status(200).json({ success: true, url: session.url });
  } catch (e) {
    return res.status(502).json({ success: false, error: e.message });
  }
}

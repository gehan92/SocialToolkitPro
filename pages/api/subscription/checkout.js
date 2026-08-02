import { stripe } from "../../../lib/stripeClient";

// Body: { priceId: "premium" | "pro", email }
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  if (!stripe) {
    return res.status(500).json({ success: false, error: "Stripe isn't configured yet - add STRIPE_SECRET_KEY to .env.local" });
  }

  const { plan, email } = req.body || {};
  const priceId = plan === "pro" ? process.env.STRIPE_PRICE_PRO : process.env.STRIPE_PRICE_PREMIUM;

  if (!priceId) {
    return res.status(500).json({ success: false, error: `Missing Stripe price ID for plan "${plan}"` });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      success_url: `${process.env.NEXT_PUBLIC_URL}/account?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/account?checkout=canceled`,
    });

    return res.status(200).json({ success: true, url: session.url });
  } catch (e) {
    return res.status(502).json({ success: false, error: e.message });
  }
}

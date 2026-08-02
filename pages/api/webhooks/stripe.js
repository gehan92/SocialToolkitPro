import { buffer } from "micro";
import { stripe } from "../../../lib/stripeClient";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  if (!stripe) {
    return res.status(500).json({ success: false, error: "Stripe isn't configured yet" });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];
  const rawBody = await buffer(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (e) {
    return res.status(400).json({ success: false, error: `Webhook signature verification failed: ${e.message}` });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      if (supabaseAdmin && customerId && subscriptionId) {
        // Retrieve full subscription to get the price/plan
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = sub.items.data[0]?.price?.id;
        const tier =
          priceId === process.env.STRIPE_PRICE_PRO
            ? "pro"
            : priceId === process.env.STRIPE_PRICE_PREMIUM
            ? "premium"
            : "free";

        // Upsert subscription record
        await supabaseAdmin.from("subscriptions").upsert({
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          status: "active",
          updated_at: new Date().toISOString(),
        }, { onConflict: "stripe_subscription_id" });

        // Update the user's profile: tier + customer ID
        // Match by customer email (Stripe session has customer_email)
        const customerEmail = session.customer_email;
        if (customerEmail) {
          const { data: authUser } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
          const matched = (authUser?.users || []).find((u) => u.email === customerEmail);
          if (matched) {
            await supabaseAdmin.from("profiles").update({
              subscription_tier: tier,
              stripe_customer_id: customerId,
              subscription_status: "active",
            }).eq("id", matched.id);
          }
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      if (supabaseAdmin) {
        const priceId = subscription.items?.data[0]?.price?.id;
        const tier =
          priceId === process.env.STRIPE_PRICE_PRO
            ? "pro"
            : priceId === process.env.STRIPE_PRICE_PREMIUM
            ? "premium"
            : "free";

        await supabaseAdmin.from("subscriptions").upsert({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          status: subscription.status,
          price_id: priceId,
          updated_at: new Date().toISOString(),
        }, { onConflict: "stripe_subscription_id" });

        // Update profile tier by stripe_customer_id
        await supabaseAdmin.from("profiles").update({
          subscription_tier: subscription.cancel_at_period_end ? tier : tier,
          subscription_status: subscription.cancel_at_period_end ? "canceling" : subscription.status,
        }).eq("stripe_customer_id", subscription.customer);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      if (supabaseAdmin) {
        await supabaseAdmin.from("subscriptions").upsert({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          status: "canceled",
          updated_at: new Date().toISOString(),
        }, { onConflict: "stripe_subscription_id" });

        // Revert user to free tier
        await supabaseAdmin.from("profiles").update({
          subscription_tier: "free",
          subscription_status: "canceled",
        }).eq("stripe_customer_id", subscription.customer);
      }
      break;
    }

    default:
      break;
  }

  return res.status(200).json({ received: true });
}

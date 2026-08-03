import { buffer } from "micro";
import { stripe } from "../../../lib/stripeClient";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const config = {
  api: { bodyParser: false },
};

const STRIPE_FEE_PCT = 0.029;
const STRIPE_FEE_FIXED = 0.30;

function tierForPrice(priceId) {
  if (priceId === process.env.STRIPE_PRICE_PRO) return "pro";
  if (priceId === process.env.STRIPE_PRICE_PREMIUM) return "premium";
  return "free";
}

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
        const tier = tierForPrice(priceId);

        // Upsert subscription record
        await supabaseAdmin.from("subscriptions").upsert({
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: customerId,
          status: "active",
          updated_at: new Date().toISOString(),
        }, { onConflict: "stripe_subscription_id" });

        // Update the user's profile: tier + customer ID.
        // client_reference_id is set to our own auth user.id at checkout
        // creation time (see pages/api/subscription/checkout.js) - it's the
        // only trustworthy link back to an app account. Never match by
        // customer_email here: that field is attacker-controllable input to
        // Stripe and would let anyone upgrade/rebind an arbitrary account.
        const userId = session.client_reference_id;
        if (userId) {
          await supabaseAdmin.from("profiles").update({
            subscription_tier: tier,
            stripe_customer_id: customerId,
            subscription_status: "active",
          }).eq("id", userId);
        }
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object;
      if (supabaseAdmin) {
        const priceId = subscription.items?.data[0]?.price?.id;
        const tier = tierForPrice(priceId);

        await supabaseAdmin.from("subscriptions").upsert({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          status: subscription.status,
          price_id: priceId,
          updated_at: new Date().toISOString(),
        }, { onConflict: "stripe_subscription_id" });

        // Update profile tier by stripe_customer_id. Tier stays the same while
        // cancel_at_period_end is set (user keeps access until the period ends);
        // only the status changes to reflect the pending cancellation.
        await supabaseAdmin.from("profiles").update({
          subscription_tier: tier,
          subscription_status: subscription.cancel_at_period_end ? "canceling" : subscription.status,
        }).eq("stripe_customer_id", subscription.customer);
      }
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object;
      if (supabaseAdmin) {
        const priceId = invoice.lines?.data[0]?.price?.id;
        const tier = tierForPrice(priceId);
        const amount = (invoice.amount_paid || 0) / 100;
        const feeEstimate = amount > 0 ? amount * STRIPE_FEE_PCT + STRIPE_FEE_FIXED : 0;

        let userId = null;
        if (invoice.customer) {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("id")
            .eq("stripe_customer_id", invoice.customer)
            .maybeSingle();
          userId = profile?.id || null;
        }

        await supabaseAdmin.from("revenue_events").upsert({
          stripe_event_id: event.id,
          user_id: userId,
          stripe_customer_id: invoice.customer,
          email: invoice.customer_email,
          tier,
          status: "paid",
          amount,
          fee_estimate: feeEstimate,
        }, { onConflict: "stripe_event_id" });
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object;
      if (supabaseAdmin) {
        await supabaseAdmin.from("revenue_events").upsert({
          stripe_event_id: event.id,
          stripe_customer_id: invoice.customer,
          email: invoice.customer_email,
          status: "failed",
          amount: (invoice.amount_due || 0) / 100,
        }, { onConflict: "stripe_event_id" });

        if (invoice.customer) {
          await supabaseAdmin.from("profiles")
            .update({ subscription_status: "past_due" })
            .eq("stripe_customer_id", invoice.customer);
        }
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

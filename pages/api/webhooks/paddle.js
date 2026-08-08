import { buffer } from "micro";
import { paddle } from "../../../lib/paddleClient";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { getPlanConfig } from "../../../lib/planConfig";
import { EventName } from "@paddle/paddle-node-sdk";

export const config = {
  api: { bodyParser: false },
};

// Paddle's standard checkout fee (5% + $0.50) - see stripe.js's STRIPE_FEE_PCT/FIXED
// for the same kind of estimate; check the Paddle dashboard for your actual rate.
const PADDLE_FEE_PCT = 0.05;
const PADDLE_FEE_FIXED = 0.50;

function tierForPrice(priceId) {
  if (priceId === process.env.PADDLE_PRICE_PRO || priceId === process.env.PADDLE_PRICE_PRO_ANNUAL) return "pro";
  if (priceId === process.env.PADDLE_PRICE_PREMIUM || priceId === process.env.PADDLE_PRICE_PREMIUM_ANNUAL) return "premium";
  return "free";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  if (!paddle) {
    return res.status(500).json({ success: false, error: "Paddle isn't configured yet" });
  }

  const signature = req.headers["paddle-signature"] || "";
  const rawBody = (await buffer(req)).toString();
  const secretKey = process.env.PADDLE_WEBHOOK_SECRET || "";

  let event;
  try {
    event = await paddle.webhooks.unmarshal(rawBody, secretKey, signature);
  } catch (e) {
    return res.status(400).json({ success: false, error: `Webhook signature verification failed: ${e.message}` });
  }

  if (!event) {
    return res.status(400).json({ success: false, error: "Missing paddle-signature header" });
  }

  if (!supabaseAdmin) {
    return res.status(200).json({ received: true });
  }

  // TEMPORARY diagnostic logging while debugging why the account-upgrade
  // isn't happening after a successful checkout - remove once confirmed working.
  console.log(`[paddle webhook] event: ${event.eventType}`, JSON.stringify(event.data?.customData ?? null));

  switch (event.eventType) {
    // Fires once a subscription's first payment succeeds. custom_data.userId
    // was set server-side in pages/api/subscription/paddle-checkout.js when
    // the transaction was created, so - like Stripe's client_reference_id -
    // it's a trustworthy link back to our own account (never client-editable).
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionActivated: {
      const sub = event.data;
      const priceId = sub.items?.[0]?.price?.id;
      const tier = tierForPrice(priceId);
      const userId = sub.customData?.userId;

      await supabaseAdmin.from("subscriptions").upsert({
        paddle_subscription_id: sub.id,
        paddle_customer_id: sub.customerId,
        user_id: userId || undefined,
        status: sub.status,
        price_id: priceId,
        current_period_start: sub.currentBillingPeriod?.startsAt || null,
        current_period_end: sub.currentBillingPeriod?.endsAt || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "paddle_subscription_id" });

      if (userId) {
        await supabaseAdmin.from("profiles").update({
          subscription_tier: tier,
          paddle_customer_id: sub.customerId,
          subscription_status: "active",
        }).eq("id", userId);
      }
      break;
    }

    case EventName.SubscriptionUpdated: {
      const sub = event.data;
      const priceId = sub.items?.[0]?.price?.id;
      const tier = tierForPrice(priceId);
      const canceling = sub.scheduledChange?.action === "cancel";

      await supabaseAdmin.from("subscriptions").upsert({
        paddle_subscription_id: sub.id,
        paddle_customer_id: sub.customerId,
        status: sub.status,
        price_id: priceId,
        current_period_start: sub.currentBillingPeriod?.startsAt || null,
        current_period_end: sub.currentBillingPeriod?.endsAt || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "paddle_subscription_id" });

      // Tier stays the same while a cancellation is scheduled (user keeps
      // access until the period ends); only the status reflects it, same as
      // the Stripe webhook's cancel_at_period_end handling.
      await supabaseAdmin.from("profiles").update({
        subscription_tier: tier,
        subscription_status: canceling ? "canceling" : sub.status,
      }).eq("paddle_customer_id", sub.customerId);
      break;
    }

    case EventName.SubscriptionCanceled: {
      const sub = event.data;

      await supabaseAdmin.from("subscriptions").upsert({
        paddle_subscription_id: sub.id,
        paddle_customer_id: sub.customerId,
        status: "canceled",
        updated_at: new Date().toISOString(),
      }, { onConflict: "paddle_subscription_id" });

      await supabaseAdmin.from("profiles").update({
        subscription_tier: "free",
        subscription_status: "canceled",
      }).eq("paddle_customer_id", sub.customerId);
      break;
    }

    // Covers both the first payment of a new subscription (handled above via
    // subscription.created/activated) and one-time pay-as-you-go credit pack
    // purchases (pages/api/credits/purchase.js) - only the latter needs
    // action here, but every completed transaction is logged to
    // revenue_events either way so the admin dashboard has one ledger.
    case EventName.TransactionCompleted: {
      const txn = event.data;
      const grandTotal = Number(txn.details?.totals?.grandTotal || 0) / 100;
      const feeEstimate = grandTotal > 0 ? grandTotal * PADDLE_FEE_PCT + PADDLE_FEE_FIXED : 0;
      const priceId = txn.items?.[0]?.price?.id;
      const tier = txn.subscriptionId ? tierForPrice(priceId) : null;

      // custom_data set directly on this transaction at creation time (see
      // pages/api/subscription/paddle-checkout.js / pages/api/credits/purchase.js)
      // is always present here - unlike subscription.created/activated's own
      // custom_data, which depends on Paddle correctly copying it over from
      // the transaction, this is the reliable link back to our account.
      let userId = txn.customData?.userId || null;
      if (!userId && txn.customerId) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("paddle_customer_id", txn.customerId)
          .maybeSingle();
        userId = profile?.id || null;
      }
      console.log(`[paddle webhook] transaction.completed: subscriptionId=${txn.subscriptionId} priceId=${priceId} tier=${tier} userId=${userId}`);

      await supabaseAdmin.from("revenue_events").upsert({
        paddle_event_id: event.eventId,
        user_id: userId,
        tier,
        status: "paid",
        amount: grandTotal,
        fee_estimate: feeEstimate,
      }, { onConflict: "paddle_event_id" });

      // Belt-and-suspenders account upgrade: subscription.created/activated
      // (above) already does this via the subscription's own custom_data,
      // but that depends on Paddle copying it over from the transaction. This
      // uses the transaction's own custom_data instead, which we set
      // ourselves and is guaranteed present, so the upgrade still happens
      // even if that copy-over doesn't occur.
      if (txn.customData?.kind === "subscription" && txn.subscriptionId && userId) {
        await supabaseAdmin.from("subscriptions").upsert({
          paddle_subscription_id: txn.subscriptionId,
          paddle_customer_id: txn.customerId,
          user_id: userId,
          status: "active",
          price_id: priceId,
          updated_at: new Date().toISOString(),
        }, { onConflict: "paddle_subscription_id" });

        const { data: updateResult, error: updateError, count } = await supabaseAdmin.from("profiles").update({
          subscription_tier: tier,
          paddle_customer_id: txn.customerId,
          subscription_status: "active",
        }).eq("id", userId).select();
        console.log(`[paddle webhook] profile update result: rows=${updateResult?.length} error=${JSON.stringify(updateError)}`);
      }

      if (txn.customData?.kind === "credit_pack" && txn.customData?.userId) {
        const { creditPackSize } = await getPlanConfig();
        const targetUserId = txn.customData.userId;

        // Idempotency: skip if this transaction was already credited (webhook
        // redelivery). Same accepted read-then-write pattern already used for
        // credits_balance elsewhere (see lib/rateLimit.js).
        const { data: existing } = await supabaseAdmin
          .from("credit_purchases")
          .select("id")
          .eq("payment_reference", txn.id)
          .maybeSingle();

        if (!existing) {
          const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("credits_balance")
            .eq("id", targetUserId)
            .maybeSingle();

          await supabaseAdmin.from("profiles").update({
            credits_balance: (profile?.credits_balance || 0) + creditPackSize,
          }).eq("id", targetUserId);

          await supabaseAdmin.from("credit_purchases").insert({
            user_id: targetUserId,
            credits: creditPackSize,
            amount: grandTotal,
            payment_reference: txn.id,
          });
        }
      }
      break;
    }

    case EventName.TransactionPaymentFailed: {
      const txn = event.data;
      if (txn.customerId) {
        await supabaseAdmin.from("profiles")
          .update({ subscription_status: "past_due" })
          .eq("paddle_customer_id", txn.customerId);
      }
      break;
    }

    default:
      break;
  }

  return res.status(200).json({ received: true });
}

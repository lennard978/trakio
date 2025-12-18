import Stripe from "stripe";
import { buffer } from "micro";
import {
  setPremiumRecord,
  getPremiumRecord,
  wasStripeEventProcessed,
  markStripeEventProcessed,
} from "../utils/premiumStore.js";

export const config = {
  api: { bodyParser: false },
};

export const runtime = "nodejs";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

/**
 * Prevent status downgrade caused by out-of-order Stripe events.
 */
function resolveStatus(prevStatus, nextStatus) {
  if (prevStatus === "active" || prevStatus === "trialing") {
    return prevStatus;
  }
  return nextStatus;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) return res.status(400).send("Missing Stripe signature");

  let event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe signature verification failed:", err.message);
    return res.status(400).send("Invalid signature");
  }

  // 🔁 Idempotency guard
  if (await wasStripeEventProcessed(event.id)) {
    return res.status(200).json({ duplicate: true });
  }

  try {
    switch (event.type) {
      /* ---------------------------------------------------------- */
      /* Checkout completed — resolve subscription immediately       */
      /* ---------------------------------------------------------- */
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (!userId || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription
        );

        const prev = await getPremiumRecord(userId);
        const finalStatus = resolveStatus(
          prev?.status,
          subscription.status
        );

        await setPremiumRecord(userId, {
          status: finalStatus,
          stripeCustomerId: subscription.customer,
          subscriptionId: subscription.id,
          currentPeriodEnd: subscription.current_period_end || null,
          trialEnds: subscription.trial_end || null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          lastEventId: event.id,
        });

        break;
      }

      /* ---------------------------------------------------------- */
      /* Subscription lifecycle — source of truth                   */
      /* ---------------------------------------------------------- */
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        const prev = await getPremiumRecord(userId);
        const finalStatus = resolveStatus(prev?.status, sub.status);

        await setPremiumRecord(userId, {
          status: finalStatus,
          stripeCustomerId: sub.customer,
          subscriptionId: sub.id,
          currentPeriodEnd: sub.current_period_end || prev?.currentPeriodEnd || null,
          trialEnds: sub.trial_end || prev?.trialEnds || null,
          cancelAtPeriodEnd: sub.cancel_at_period_end || false,
          lastEventId: event.id,
        });

        break;
      }

      /* ---------------------------------------------------------- */
      /* Payment confirmation — recovery safety net                 */
      /* ---------------------------------------------------------- */
      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (!invoice.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription
        );

        const userId = subscription.metadata?.userId;
        if (!userId) break;

        const prev = await getPremiumRecord(userId);
        const finalStatus = resolveStatus(prev?.status, subscription.status);

        await setPremiumRecord(userId, {
          status: finalStatus,
          currentPeriodEnd: subscription.current_period_end || prev?.currentPeriodEnd || null,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
          lastEventId: event.id,
        });

        break;
      }

      /* ---------------------------------------------------------- */
      /* Subscription canceled                                      */
      /* ---------------------------------------------------------- */
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await setPremiumRecord(userId, {
          status: "canceled",
          currentPeriodEnd: null,
          trialEnds: null,
          cancelAtPeriodEnd: false,
          lastEventId: event.id,
        });

        break;
      }

      default:
        // ignore unrelated events
        break;
    }

    await markStripeEventProcessed(event.id);
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return res.status(500).send("Webhook handler failed");
  }
}

import Stripe from "stripe";
import { buffer } from "micro";
import { setPremiumRecord } from "../utils/premiumStore.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const runtime = "nodejs";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig) {
    return res.status(400).send("Missing Stripe signature");
  }

  if (!webhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is missing");
    return res.status(500).send("Webhook not configured");
  }

  let event;

  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("❌ Stripe signature verification failed:", err.message);
    return res.status(400).send("Invalid signature");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;

        if (!userId) break;

        let subscription = null;
        if (session.subscription) {
          subscription = await stripe.subscriptions.retrieve(
            session.subscription
          );
        }

        await setPremiumRecord(userId, {
          isPremium: true,
          status: subscription?.status || "active",
          stripeCustomerId:
            subscription?.customer || session.customer || null,
          subscriptionId: subscription?.id || null,
          currentPeriodEnd: subscription?.current_period_end || null,
          trialEnds: null,
        });

        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await setPremiumRecord(userId, {
          isPremium: sub.status === "active" || sub.status === "trialing",
          status: sub.status,
          stripeCustomerId: sub.customer,
          subscriptionId: sub.id,
          currentPeriodEnd: sub.current_period_end,
        });

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        await setPremiumRecord(userId, {
          isPremium: false,
          status: "canceled",
        });

        break;
      }

      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return res.status(500).send("Webhook handler failed");
  }
}

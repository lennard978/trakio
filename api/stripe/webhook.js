// /api/webhook.js

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
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

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
    console.log("📨 Webhook received:", event.type);
  } catch (err) {
    console.error("❌ Invalid Stripe signature:", err.message);
    return res.status(400).send("Invalid signature");
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("✅ Checkout Session:", JSON.stringify(session, null, 2));

        let userId = session.metadata?.userId;

        // ⚠️ fallback: get it from the subscription if not found in session
        let subscription = null;
        if (session.subscription) {
          subscription = await stripe.subscriptions.retrieve(session.subscription);
          if (!userId && subscription?.metadata?.userId) {
            userId = subscription.metadata.userId;
            console.log("✅ Retrieved userId from subscription metadata:", userId);
          }
        }

        if (!userId) {
          console.warn("⚠️ Still missing userId after fallback");
          break;
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

        console.log("📝 Premium record updated via checkout.session.completed");
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;

        if (!userId) {
          console.warn("⚠️ No userId on subscription.updated");
          break;
        }

        await setPremiumRecord(userId, {
          isPremium: sub.status === "active" || sub.status === "trialing",
          status: sub.status,
          stripeCustomerId: sub.customer,
          subscriptionId: sub.id,
          currentPeriodEnd: sub.current_period_end,
        });

        console.log("🔄 Premium record updated via subscription.updated");
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;

        if (!userId) {
          console.warn("⚠️ No userId on subscription.deleted");
          break;
        }

        await setPremiumRecord(userId, {
          isPremium: false,
          status: "canceled",
        });

        console.log("❌ Premium canceled via subscription.deleted");
        break;
      }

      default:
        console.log("ℹ️ Unhandled event:", event.type);
        break;
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    return res.status(500).send("Webhook handler failed");
  }
}

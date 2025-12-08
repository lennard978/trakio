import Stripe from "stripe";
import { setPremiumRecord, getPremiumRecord } from "../utils/premiumStore.js";

export const config = {
  api: {
    bodyParser: false, // IMPORTANT for Stripe webhooks
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let event;

  try {
    const rawBody = await buffer(req);
    event = JSON.parse(rawBody.toString());
  } catch (error) {
    console.error("Webhook parse error:", error);
    return res.status(400).send("Invalid payload");
  }

  try {
    switch (event.type) {

      // USER COMPLETED CHECKOUT
      case "checkout.session.completed": {
        const session = event.data.object;
        const email =
          session.customer_email ||
          session.customer_details?.email ||
          session.metadata?.email;

        if (!email) break;

        const subscriptionId = session.subscription;

        const sub = subscriptionId
          ? await stripe.subscriptions.retrieve(subscriptionId)
          : null;

        await setPremiumRecord(email, {
          isPremium: true,
          status: "active",
          stripeCustomerId: sub?.customer || session.customer,
          subscriptionId,
          currentPeriodEnd: sub?.current_period_end || null,
          trialEnds: null,
        });

        break;
      }

      // BILLING PORTAL CHANGES (cancel, update plan)
      case "customer.subscription.updated": {
        const sub = event.data.object;

        const customer = await stripe.customers.retrieve(sub.customer);
        const email = customer.email;
        if (!email) break;

        await setPremiumRecord(email, {
          isPremium: sub.status === "active",
          status: sub.status,
          stripeCustomerId: sub.customer,
          subscriptionId: sub.id,
          currentPeriodEnd: sub.current_period_end,
        });

        break;
      }

      // SUBSCRIPTION CANCELED
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customer = await stripe.customers.retrieve(sub.customer);
        const email = customer.email;

        if (!email) break;

        await setPremiumRecord(email, {
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
    console.error("Webhook handler error:", err);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}

// Needed for raw body
function buffer(req) {
  return new Promise((resolve) => {
    let chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

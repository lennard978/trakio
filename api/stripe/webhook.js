import Stripe from "stripe";
import { setPremiumRecord } from "../../src/server/premiumStore";

export const config = {
  api: {
    bodyParser: false, // Required for raw body parsing
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  let rawBody;

  try {
    rawBody = await buffer(req);

    // ✅ Secure verification of Stripe webhook signature
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (error) {
    console.error("Webhook signature error:", error.message);
    return res.status(400).send("Webhook signature verification failed");
  }

  try {
    switch (event.type) {
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
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}

// Needed for raw body parsing
function buffer(req) {
  return new Promise((resolve) => {
    let chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

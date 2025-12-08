import Stripe from "stripe";
import { setPremiumRecord } from "../premiumStore.js";

export const config = {
  api: {
    bodyParser: false, // REQUIRED by Stripe
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on("data", (chunk) => chunks.push(chunk));
    readable.on("end", () => resolve(Buffer.concat(chunks)));
    readable.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let event;
  const buf = await buffer(req);
  const signature = req.headers["stripe-signature"];

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const data = event.data.object;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const email =
          data.customer_email ||
          data.customer_details?.email ||
          data.metadata?.email;

        if (!email) break;

        let subscriptionId = data.subscription;
        let currentPeriodEnd = null;
        let stripeCustomerId = data.customer;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          currentPeriodEnd = subscription.current_period_end;
          stripeCustomerId = subscription.customer;
        }

        await setPremiumRecord(email, {
          isPremium: true,
          status: "active",
          subscriptionId,
          stripeCustomerId,
          currentPeriodEnd,
        });

        break;
      }

      case "invoice.paid": {
        const email = data.customer_email;
        if (!email) break;

        await setPremiumRecord(email, {
          isPremium: true,
          status: "active",
        });

        break;
      }

      case "invoice.payment_failed": {
        const email = data.customer_email;
        if (!email) break;

        await setPremiumRecord(email, {
          isPremium: false,
          status: "past_due",
        });

        break;
      }

      case "customer.subscription.deleted": {
        const customer = await stripe.customers.retrieve(data.customer);
        const email = customer.email;

        if (email) {
          await setPremiumRecord(email, {
            isPremium: false,
            status: "canceled",
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Stripe webhook handler error:", err);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

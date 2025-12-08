import Stripe from "stripe";
import { setPremiumRecord } from "../utils/premiumStore.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // NOTE: For simplicity we skip signature verification in dev.
  // In production you should verify using STRIPE_WEBHOOK_SECRET.
  const event = req.body;

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
        let currentPeriodEnd = null;
        let stripeCustomerId = session.customer;

        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          currentPeriodEnd = sub.current_period_end;
          stripeCustomerId = sub.customer;
        }

        await setPremiumRecord(email, {
          isPremium: true,
          status: "active",
          stripeCustomerId,
          subscriptionId,
          currentPeriodEnd,
        });

        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = sub.customer;

        // Try to find email from subscription’s customer object
        const customer = await stripe.customers.retrieve(customerId);
        const email = customer.email;

        if (email) {
          await setPremiumRecord(email, {
            isPremium: false,
            status: "canceled",
          });
        }
        break;
      }

      case "invoice.paid": {
        // Can be used to re-confirm active status if you like
        break;
      }

      case "invoice.payment_failed": {
        // You could mark "past_due" here if needed
        break;
      }

      default:
        // Ignore other events
        break;
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("Stripe webhook error:", err);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

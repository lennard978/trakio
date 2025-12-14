import Stripe from "stripe";
import { getPremiumRecord } from "./utils/premiumStore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { action } = req.body;

    if (!action) {
      return res.status(400).json({ error: "Missing action" });
    }

    /* =========================================================
       CREATE CHECKOUT SESSION
    ========================================================= */
    if (action === "checkout") {
      const { plan, email } = req.body;

      if (!email || !["monthly", "yearly"].includes(plan)) {
        return res.status(400).json({ error: "Missing or invalid parameters" });
      }

      const price =
        plan === "monthly"
          ? process.env.STRIPE_PRICE_MONTHLY
          : process.env.STRIPE_PRICE_YEARLY;

      if (!price) {
        return res.status(400).json({ error: "Invalid plan configuration" });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price, quantity: 1 }],
        success_url: `${process.env.APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL}/premium?canceled=true`,
        customer_email: email,
        metadata: { email },
      });

      return res.status(200).json({ url: session.url });
    }

    /* =========================================================
       CUSTOMER BILLING PORTAL
    ========================================================= */
    if (action === "portal") {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }

      const record = await getPremiumRecord(email);

      if (!record || !record.stripeCustomerId) {
        return res.status(400).json({ error: "No Stripe customer found" });
      }

      if (record.status === "trial") {
        return res.status(400).json({ error: "Trial users cannot open portal" });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: record.stripeCustomerId,
        return_url: `${process.env.APP_URL}/settings`,
      });

      return res.status(200).json({ url: session.url });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    console.error("STRIPE API ERROR:", err);
    return res.status(500).json({ error: "Stripe server error" });
  }
}

import Stripe from "stripe";
import { getPremiumRecord } from "../../utils/premiumStore.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const record = await getPremiumRecord(email);

    if (!record || !record.stripeCustomerId) {
      return res.status(400).json({ error: "No Stripe customer found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: record.stripeCustomerId,
      return_url: `${process.env.APP_URL}/settings`,
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("Portal Error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

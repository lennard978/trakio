import Stripe from "stripe";
import { getPremiumRecord } from "./utils/premiumStore.js";
import { verifyToken } from "./utils/jwt.js";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

function getAuthUser(req) {
  const auth = req.headers.authorization || "";
  const match = auth.match(/^Bearer\s+(.+)$/);
  if (!match) return null;
  return verifyToken(match[1]);
}

function getAppUrl(req) {
  return (process.env.APP_URL || req.headers.origin || "").replace(/\/$/, "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, plan } = req.body || {};
  if (!action) {
    return res.status(400).json({ error: "Missing action" });
  }

  const authUser = getAuthUser(req);
  if (!authUser?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const appUrl = getAppUrl(req);
  if (!appUrl) {
    return res.status(500).json({ error: "APP_URL not configured" });
  }

  try {
    // 🛒 CREATE CHECKOUT
    if (action === "checkout") {
      if (!["monthly", "yearly"].includes(plan)) {
        return res.status(400).json({ error: "Invalid plan" });
      }

      const priceId =
        plan === "monthly"
          ? process.env.STRIPE_PRICE_MONTHLY
          : process.env.STRIPE_PRICE_YEARLY;

      if (!priceId) {
        return res.status(500).json({ error: "Stripe price not configured" });
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/premium?canceled=true`,
        metadata: {
          userId: authUser.userId,
        },
        // 🔴 REQUIRED FOR WEBHOOK RELIABILITY
        subscription_data: {
          metadata: {
            userId: authUser.userId,
          },
        },
      });

      return res.status(200).json({ url: session.url });
    }

    // 🔁 BILLING PORTAL
    if (action === "portal") {
      const record = await getPremiumRecord(authUser.userId);
      if (!record?.stripeCustomerId) {
        return res.status(400).json({ error: "No Stripe customer found" });
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: record.stripeCustomerId,
        return_url: `${appUrl}/settings`,
      });

      return res.status(200).json({ url: session.url });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    console.error("STRIPE API ERROR:", err);
    return res.status(500).json({ error: "Stripe error" });
  }
}

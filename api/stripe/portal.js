import Stripe from "stripe";
import { getPremiumRecord } from "../utils/premiumStore.js";
import { verifyToken } from "../utils/jwt.js";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export default async function handler(req, res) {
  try {
    const token = req.query?.token;
    if (!token) {
      return res.status(401).send("Missing auth token");
    }

    const authUser = verifyToken(token);
    if (!authUser?.userId) {
      return res.status(401).send("Invalid token");
    }

    const record = await getPremiumRecord(authUser.userId);
    if (!record?.stripeCustomerId) {
      return res.status(400).send("No Stripe customer found");
    }

    /* ---------------------------------------------------------- */
    /* Stripe return URL handling                                 */
    /* ---------------------------------------------------------- */

    let returnUrl;

    if (process.env.APP_URL) {
      // ✅ Production (required)
      returnUrl = process.env.APP_URL;
    } else {
      // ✅ Local dev (Stripe does NOT allow http://localhost)
      // Use a guaranteed valid HTTPS URL
      returnUrl = "https://example.com";
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: record.stripeCustomerId,
      return_url: `${returnUrl}/settings`,
    });

    res.writeHead(302, {
      Location: session.url,
    });
    res.end();
  } catch (err) {
    console.error("Stripe portal error:", err);
    res.status(500).send("Stripe error");
  }
}

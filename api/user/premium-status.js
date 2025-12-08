// api/user/premium-status.js
import Stripe from "stripe";
import {
  getPremiumRecord,
  setPremiumRecord,
} from "../utils/premiumStore.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  let record = await getPremiumRecord(email);

  // No record at all → definitely not premium
  if (!record) {
    return res.status(200).json({ isPremium: false, status: "none" });
  }

  // --- TRIAL CHECK ---
  if (record.status === "trial" && record.trialEnds) {
    const now = Date.now();
    const exp = Date.parse(record.trialEnds);

    if (!Number.isNaN(exp) && now > exp) {
      record = await setPremiumRecord(email, {
        isPremium: false,
        status: "trial_expired",
      });

      return res.status(200).json(record);
    }

    // Trial still active → return
    return res.status(200).json(record);
  }

  // --- STRIPE SUBSCRIPTION CHECK ---
  if (record.subscriptionId || record.stripeCustomerId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(
        record.subscriptionId
      );

      const status = subscription.status;

      // Interpret Stripe statuses
      const isActive =
        status === "active" ||
        status === "trialing" ||
        status === "past_due"; // still active until canceled

      const updated = await setPremiumRecord(email, {
        isPremium: isActive,
        status,
        currentPeriodEnd: subscription.current_period_end,
      });

      return res.status(200).json(updated);

    } catch (err) {
      console.error("Stripe subscription lookup failed:", err);

      // If subscription retrieval fails, user is not premium
      const updated = await setPremiumRecord(email, {
        isPremium: false,
        status: "unknown",
      });

      return res.status(200).json(updated);
    }
  }

  // No subscription and no trial → not premium
  return res.status(200).json({
    isPremium: false,
    status: record.status || "none",
    trialEnds: record.trialEnds || null,
  });
}

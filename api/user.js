import { getPremiumRecord, setPremiumRecord } from "./utils/premiumStore.js";
import { verifyToken } from "./utils/jwt.js";
import Stripe from "stripe";
import { kv } from "@vercel/kv";
import crypto from "crypto"; // ⬅️ REQUIRED at top of file


/* ------------------------------------------------------------------ */
/* Auth helper                                                         */
/* ------------------------------------------------------------------ */

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}


function getAuthUser(req) {
  const auth = req.headers.authorization || "";
  const match = auth.match(/^Bearer\s+(.+)$/);
  if (!match) return null;
  return verifyToken(match[1]);
}

/* ------------------------------------------------------------------ */
/* API handler                                                         */
/* ------------------------------------------------------------------ */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action } = req.body || {};
  if (!action) {
    return res.status(400).json({ error: "Missing action" });
  }

  const authUser = getAuthUser(req);
  if (!authUser?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const userId = authUser.userId;

  try {

    /* -------------------------------------------------------------- */
    /* CANCEL STRIPE TRIAL (OPTION A – SOURCE OF TRUTH)               */
    /* -------------------------------------------------------------- */

    if (action === "cancel-trial") {
      const record = await getPremiumRecord(userId);

      if (!record?.stripeCustomerId) {
        // No Stripe customer → nothing to cancel
        return res.status(200).json({ ok: true });
      }

      // Find active trialing subscription
      const subs = await stripe.subscriptions.list({
        customer: record.stripeCustomerId,
        status: "trialing",
        limit: 1,
      });

      if (subs.data.length === 0) {
        // No trial subscription → safe no-op
        return res.status(200).json({ ok: true });
      }

      // ❗ Cancel immediately to prevent future charge
      await stripe.subscriptions.del(subs.data[0].id);

      return res.status(200).json({ ok: true });
    }

    /* -------------------------------------------------------------- */
    /* DELETE ACCOUNT (GDPR – Art. 17)                                */
    /* -------------------------------------------------------------- */

    if (action === "delete-account") {
      const record = await getPremiumRecord(userId);
      const email = authUser.email;

      // 1️⃣ Cancel Stripe subscription
      if (record?.subscriptionId) {
        try {
          await stripe.subscriptions.del(record.subscriptionId);
        } catch {
          // already cancelled or gone → ignore
        }
      }

      // 2️⃣ Delete premium state
      await kv.del(`premium:${userId}`);

      // 3️⃣ Delete ALL user data
      await Promise.all([
        kv.del(`subs:${email}`),
        kv.del(`subs:${userId}`),

        kv.del(`user:${email}`),
        kv.del(`user:${userId}`),

        kv.del(`payments:${email}`),
        kv.del(`payments:${userId}`),
      ]);

      // 4️⃣ GDPR deletion audit log (NON-BLOCKING, NON-PII)
      try {
        await kv.set(
          `gdpr:deletion:${userId}`,
          {
            deletedAt: Date.now(),
            emailHash: crypto
              .createHash("sha256")
              .update(email)
              .digest("hex"),
          },
          { ex: 60 * 60 * 24 * 3 } // 30 days retention
        );
      } catch (err) {
        // ❗ MUST NOT block deletion
        console.warn("GDPR audit log failed:", err);
      }

      return res.status(200).json({ ok: true });
    }


    /* -------------------------------------------------------------- */
    /* GET PREMIUM STATUS (Stripe truth passthrough)                  */
    /* -------------------------------------------------------------- */

    if (action === "get-status") {
      const record = await getPremiumRecord(userId);

      // 🔑 ALWAYS RETURN A STATUS
      if (!record) {
        return res.status(200).json({
          status: "canceled",
          currentPeriodEnd: null,
          trialEnds: null,
          cancelAtPeriodEnd: false,
        });
      }

      return res.status(200).json({
        status: record.status || "canceled",
        currentPeriodEnd: record.currentPeriodEnd || null,
        trialEnds: record.trialEnds || null,
        cancelAtPeriodEnd: !!record.cancelAtPeriodEnd,
      });
    }


    /* -------------------------------------------------------------- */
    /* START LOCAL TRIAL (NO STRIPE YET)                               */
    /* -------------------------------------------------------------- */

    // if (action === "start-trial") {
    //   const existing = (await getPremiumRecord(userId)) || {};

    //   if (
    //     existing.status === "active" ||
    //     existing.status === "trialing"
    //   ) {
    //     return res.status(400).json({ error: "Already premium or trialing" });
    //   }

    //   if (existing.trialEnds) {
    //     return res.status(400).json({ error: "Trial already used" });
    //   }

    //   // 7-day trial (unix seconds)
    //   const trialEnds =
    //     Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

    //   await setPremiumRecord(userId, {
    //     status: "trialing",
    //     trialEnds,
    //     currentPeriodEnd: trialEnds,
    //   });

    //   return res.status(200).json({
    //     status: "trialing",
    //     trialEnds,
    //     currentPeriodEnd: trialEnds,
    //   });
    // }

    /* -------------------------------------------------------------- */
    /* CANCEL LOCAL TRIAL                                              */
    /* -------------------------------------------------------------- */

    // if (action === "cancel-trial") {
    //   const existing = (await getPremiumRecord(userId)) || {};

    //   if (existing.status !== "trialing") {
    //     return res.status(400).json({ error: "No active trial" });
    //   }

    //   await setPremiumRecord(userId, {
    //     status: "canceled",
    //     trialEnds: null,
    //     currentPeriodEnd: null,
    //   });

    //   return res.status(200).json({
    //     status: "canceled",
    //     trialEnds: null,
    //     currentPeriodEnd: null,
    //   });
    // }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    console.error("USER API ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

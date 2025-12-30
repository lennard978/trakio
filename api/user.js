import { kv } from "@vercel/kv";
import { getPremiumRecord, setPremiumRecord } from "./utils/premiumStore.js";
import { verifyToken } from "./utils/jwt.js";
// <== Add this line

/* ------------------------------------------------------------------ */
/* Auth helper                                                         */
/* ------------------------------------------------------------------ */

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

    if (action === "start-trial") {
      const existing = (await getPremiumRecord(userId)) || {};

      if (
        existing.status === "active" ||
        existing.status === "trialing"
      ) {
        return res.status(400).json({ error: "Already premium or trialing" });
      }

      if (existing.trialEnds) {
        return res.status(400).json({ error: "Trial already used" });
      }

      // 7-day trial (unix seconds)
      const trialEnds =
        Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;

      await setPremiumRecord(userId, {
        status: "trialing",
        trialEnds,
        currentPeriodEnd: trialEnds,
      });

      return res.status(200).json({
        status: "trialing",
        trialEnds,
        currentPeriodEnd: trialEnds,
      });
    }

    /* -------------------------------------------------------------- */
    /* CANCEL LOCAL TRIAL                                              */
    /* -------------------------------------------------------------- */

    if (action === "cancel-trial") {
      const existing = (await getPremiumRecord(userId)) || {};

      if (existing.status !== "trialing") {
        return res.status(400).json({ error: "No active trial" });
      }

      await setPremiumRecord(userId, {
        status: "canceled",
        trialEnds: null,
        currentPeriodEnd: null,
      });

      return res.status(200).json({
        status: "canceled",
        trialEnds: null,
        currentPeriodEnd: null,
      });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    console.error("USER API ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

import { getPremiumRecord, setPremiumRecord } from "./utils/premiumStore.js";
import { verifyToken } from "./utils/jwt.js";

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
  const userId = authUser?.email || authUser?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    /* -------------------------------------------------------------- */
    /* GET PREMIUM STATUS                                              */
    /* -------------------------------------------------------------- */
    if (action === "get-status") {
      const record = await getPremiumRecord(userId);

      return res.status(200).json({
        status: record?.status ?? "canceled",
        currentPeriodEnd: record?.currentPeriodEnd ?? null,
        trialEnds: record?.trialEnds ?? null,
        cancelAtPeriodEnd: !!record?.cancelAtPeriodEnd,
      });
    }

    /* -------------------------------------------------------------- */
    /* START TRIAL                                                     */
    /* -------------------------------------------------------------- */
    if (action === "start-trial") {
      const existing = (await getPremiumRecord(userId)) || {};

      if (
        existing.status === "active" ||
        existing.status === "trialing"
      ) {
        return res
          .status(400)
          .json({ error: "Already premium or trialing" });
      }

      if (existing.trialEnds) {
        return res
          .status(400)
          .json({ error: "Trial already used" });
      }

      const trialEnds = Math.floor(Date.now() / 1000) + 7 * 86400;

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
    /* CANCEL TRIAL                                                    */
    /* -------------------------------------------------------------- */
    if (action === "cancel-trial") {
      const existing = (await getPremiumRecord(userId)) || {};

      if (existing.status !== "trialing") {
        return res
          .status(400)
          .json({ error: "No active trial" });
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
    console.error("Subscriptions API error:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
      stack: err.stack, // add this
    });
  }

}

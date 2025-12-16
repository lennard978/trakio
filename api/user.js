import { getPremiumRecord, setPremiumRecord } from "./utils/premiumStore.js";
import { verifyToken } from "./utils/jwt.js";

function getAuthUser(req) {
  const auth = req.headers.authorization || "";
  const match = auth.match(/^Bearer\s+(.+)$/);
  if (!match) return null;
  return verifyToken(match[1]);
}

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
    // ✅ GET STATUS
    if (action === "get-status") {
      const record = (await getPremiumRecord(userId)) || {};
      const trialEnds = record.trialEnds || null;

      let status = record.status || (record.isPremium ? "active" : "free");

      if (trialEnds && !record.isPremium) {
        if (new Date() > new Date(trialEnds)) {
          status = "trial_expired";
        }
      }

      return res.status(200).json({
        isPremium: !!record.isPremium,
        trialEnds,
        status,
        currentPeriodEnd: record.currentPeriodEnd || null,
      });
    }

    // ⏳ START TRIAL (7 DAYS)
    if (action === "start-trial") {
      const existing = (await getPremiumRecord(userId)) || {};

      if (existing.isPremium) {
        return res.status(400).json({ error: "Already premium" });
      }

      if (existing.trialEnds) {
        return res.status(400).json({ error: "Trial already started" });
      }

      const trialEnds = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      await setPremiumRecord(userId, {
        isPremium: false,
        status: "trial",
        trialEnds,
      });

      return res.status(200).json({
        isPremium: false,
        trialEnds,
        status: "trial",
      });
    }

    // ❌ CANCEL TRIAL
    if (action === "cancel-trial") {
      const existing = (await getPremiumRecord(userId)) || {};

      if (!existing.trialEnds) {
        return res.status(400).json({ error: "No active trial" });
      }

      await setPremiumRecord(userId, {
        trialEnds: null,
        status: "canceled",
      });

      return res.status(200).json({
        isPremium: false,
        trialEnds: null,
        status: "canceled",
      });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    console.error("USER API ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

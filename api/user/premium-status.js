// api/user/premium-status.js
import {
  getPremiumRecord,
  setPremiumRecord,
} from "../utils/premiumStore.js";

export default async function handler(req, res) {
  const { email } = req.query;

  if (!email) return res.status(400).json({ error: "Missing email" });

  let record = await getPremiumRecord(email);

  // No record => not premium
  if (!record) {
    return res.status(200).json({ isPremium: false });
  }

  // Handle trial expiry on the server
  if (record.trialEnds) {
    const now = Date.now();
    const exp = Date.parse(record.trialEnds);

    if (!Number.isNaN(exp) && now > exp && record.status === "trial") {
      record = await setPremiumRecord(email, {
        isPremium: false,
        status: "trial_expired",
      });
    }
  }

  return res.status(200).json(record);
}

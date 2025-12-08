// api/user/start-trial.js
import { getPremiumRecord, setPremiumRecord } from "../utils/premiumStore.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  const existing = await getPremiumRecord(email);

  // ❌ already had a trial before
  if (existing?.trialEnds) {
    return res.status(400).json({ error: "Trial already used." });
  }

  // 7-day trial from now
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  const trialEnds = expires.toISOString();

  const record = await setPremiumRecord(email, {
    isPremium: true,
    status: "trial",
    trialEnds,
  });

  return res.status(200).json(record);
}

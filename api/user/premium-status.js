import { getPremiumRecord } from "../utils/premiumStore.js";

export default async function handler(req, res) {
  const { email } = req.query;

  if (!email) return res.status(400).json({ error: "Missing email" });

  const record = await getPremiumRecord(email);

  res.status(200).json(record || { isPremium: false });
}

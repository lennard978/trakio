import { getPremiumRecord } from "../premiumStore.js";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const email = req.query?.email || req.query?.e; // for safety

  if (!email) return res.status(400).json({ error: "Missing email" });

  const record = await getPremiumRecord(email);

  res.status(200).json({
    isPremium: !!record?.isPremium,
    status: record?.status || "none",
    currentPeriodEnd: record?.currentPeriodEnd || null,
  });
}

// api/user/start-trial.js
import { getPremiumRecord, setPremiumRecord } from "../utils/premiumStore.js";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let email;

  try {
    // Vercel edge/serverless sometimes keeps req.body empty → must parse manually
    const raw = req.body || (await readBody(req));
    email = raw?.email;
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  const existing = await getPremiumRecord(email);

  if (existing?.trialEnds) {
    return res.status(400).json({ error: "Trial already used." });
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  const record = await setPremiumRecord(email, {
    isPremium: true,
    status: "trial",
    trialEnds: expires.toISOString(),
  });

  return res.status(200).json(record);
}

// Utility to read the raw request body
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(data || "{}"));
      } catch (e) {
        reject(e);
      }
    });

    req.on("error", reject);
  });
}

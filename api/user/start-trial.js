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
    // Vercel sometimes leaves req.body empty → manually parse JSON
    const raw = req.body || (await readBody(req));
    email = raw?.email;
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  const existing = await getPremiumRecord(email);

  // User already had a trial before
  if (existing?.trialEnds) {
    return res.status(400).json({ error: "Trial already used." });
  }

  // 7-day trial from now
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);

  const record = await setPremiumRecord(email, {
    isPremium: true,
    status: "trial",
    trialEnds: expires.toISOString(),
  });

  return res.status(200).json(record);
}

// Manual JSON body parser (required for Vercel)
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

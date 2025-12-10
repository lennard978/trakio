// /api/user.js
import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const key = `premium:${email}`;

    // Helper to fetch record
    const getRecord = async () => {
      const data = await kv.get(key);
      return data || {};
    };

    switch (action) {
      // ⏳ Start Trial
      case "start-trial": {
        const existing = await getRecord();

        if (existing.isPremium) {
          return res.status(400).json({ error: "Already a premium user" });
        }

        if (existing.trialEnds) {
          return res.status(400).json({ error: "Trial already started" });
        }

        const now = new Date();
        const ends = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const trialEnds = ends.toISOString();

        const updated = {
          ...existing,
          trialEnds,
          isPremium: false,
        };

        await kv.set(key, updated);

        return res.status(200).json({ trialEnds, isPremium: false });
      }

      // ❌ Cancel Trial
      case "cancel-trial": {
        const existing = await getRecord();

        if (!existing.trialEnds) {
          return res.status(400).json({ error: "No active trial to cancel" });
        }

        const updated = {
          ...existing,
          trialEnds: null,
        };

        await kv.set(key, updated);

        return res.status(200).json({ success: true });
      }

      // 🔍 Get Premium/Trial Status
      case "get-status": {
        const record = await getRecord();

        return res.status(200).json({
          isPremium: !!record.isPremium,
          trialEnds: record.trialEnds || null,
        });
      }

      default:
        return res.status(400).json({ error: "Invalid action" });
    }
  } catch (err) {
    console.error("User API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

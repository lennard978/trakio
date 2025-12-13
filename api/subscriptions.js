// /api/subscriptions.js
import { kv } from "@vercel/kv";

function key(email) {
  return `subscriptions:${email.toLowerCase()}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { action, email, subscriptions } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  try {
    switch (action) {
      // 🔹 Fetch subscriptions
      case "get": {
        const data = await kv.get(key(email));
        return res.status(200).json({
          subscriptions: Array.isArray(data) ? data : [],
        });
      }

      // 🔹 Save subscriptions (overwrite)
      case "save": {
        if (!Array.isArray(subscriptions)) {
          return res.status(400).json({ error: "Invalid subscriptions payload" });
        }

        await kv.set(key(email), subscriptions);
        return res.status(200).json({ ok: true });
      }

      default:
        return res.status(400).json({ error: "Invalid action" });
    }
  } catch (err) {
    console.error("Subscriptions API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

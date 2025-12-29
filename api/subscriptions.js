import { kv } from "@vercel/kv";
import { verifyToken } from "./utils/jwt.js";

function getAuthUser(req) {
  const auth = req.headers.authorization || "";
  const match = auth.match(/^Bearer\s+(.+)$/);
  if (!match) return null;

  return verifyToken(match[1]);
}

function key(userId) {
  return `subscriptions:${userId}`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authUser = getAuthUser(req);
  if (!authUser?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { action, subscriptions } = req.body || {};

  try {
    switch (action) {
      // 🔹 Fetch subscriptions
      case "get": {
        const data = await kv.get(key(authUser.userId));
        return res.status(200).json({
          subscriptions: Array.isArray(data) ? data : [],
        });
      }

      // 🔹 Overwrite subscriptions
      case "save": {
        if (!Array.isArray(subscriptions)) {
          return res
            .status(400)
            .json({ error: "Invalid subscriptions payload" });
        }

        await kv.set(key(authUser.userId), subscriptions);
        return res.status(200).json({ ok: true });
      }

      // 🔹 Merge synced subscriptions
      case "sync": {
        if (!Array.isArray(subscriptions)) {
          return res
            .status(400)
            .json({ error: "Invalid subscriptions payload" });
        }

        const existing = (await kv.get(key(authUser.userId))) || [];

        // Merge: Prevent duplicates by 'id'
        const merged = [
          ...existing,
          ...subscriptions.filter(
            (newSub) =>
              !existing.some((existingSub) => existingSub.id === newSub.id)
          ),
        ];

        await kv.set(key(authUser.userId), merged);

        return res.status(200).json({ ok: true, mergedCount: merged.length });
      }

      default:
        return res.status(400).json({ error: "Invalid action" });
    }
  } catch (err) {
    console.error("Subscriptions API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

import { redis } from "../../src/lib/redis"; // ✅ make sure the path is correct
import { verifyToken } from "../../api/utils/jwt"; // ✅ adjust based on new file location

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
  console.log("HIT /api/subscriptions"); // add this

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" }); // ← this is why you're getting 405
  }

  const authUser = getAuthUser(req);
  if (!authUser?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { action, subscriptions } = req.body || {};

  try {
    switch (action) {
      case "get": {
        const data = await redis.get(key(authUser.userId));
        return res.status(200).json({
          subscriptions: Array.isArray(data) ? data : [],
        });
      }

      case "save": {
        if (!Array.isArray(subscriptions)) {
          return res.status(400).json({ error: "Invalid subscriptions payload" });
        }

        await redis.set(key(authUser.userId), subscriptions);
        return res.status(200).json({ ok: true });
      }

      default:
        return res.status(400).json({ error: "Invalid action" });
    }
  } catch (err) {
    console.error("Subscriptions API error:", err);
    return res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
}

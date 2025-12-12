export const config = { runtime: "nodejs" };

import { verifyToken } from "../utils/auth";
import { kvGet, kvSet } from "../utils/kvAdapter";

export default async function handler(req, res) {
  try {
    // Local dev fallback (no KV)
    if (!process.env.VERCEL) {
      if (req.method === "GET") return res.status(200).json([]);
      if (req.method === "POST") return res.status(201).json(req.body);
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Auth (Vercel only)
    const user = await verifyToken(req);
    if (!user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const listKey = `user:${user.id}:subscriptions`;

    if (req.method === "GET") {
      const subs = (await kvGet(listKey)) || [];
      return res.status(200).json(subs);
    }

    if (req.method === "POST") {
      const sub = req.body;
      if (!sub?.id) {
        return res.status(400).json({ error: "Invalid data" });
      }

      const existing = (await kvGet(listKey)) || [];
      const arr = Array.isArray(existing) ? existing : [];

      if (!arr.some((s) => s.id === sub.id)) {
        await kvSet(listKey, [...arr, sub]);
      }

      return res.status(201).json(sub);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Subscriptions API error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

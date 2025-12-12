export const config = { runtime: "nodejs" };

import { verifyToken } from "../utils/auth";
import { kvGet, kvSet } from "../utils/kvAdapter";

export default async function handler(req, res) {
  try {
    if (!process.env.VERCEL) {
      if (req.method === "PUT") return res.status(200).json(req.body);
      if (req.method === "DELETE") return res.status(204).end();
      return res.status(405).json({ error: "Method not allowed" });
    }

    const user = await verifyToken(req);
    if (!user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { id } = req.query;
    const listKey = `user:${user.id}:subscriptions`;
    const subs = (await kvGet(listKey)) || [];

    if (req.method === "PUT") {
      const updated = subs.map((s) => (s.id === id ? req.body : s));
      await kvSet(listKey, updated);
      return res.status(200).json(req.body);
    }

    if (req.method === "DELETE") {
      const filtered = subs.filter((s) => s.id !== id);
      await kvSet(listKey, filtered);
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Subscription ID API error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

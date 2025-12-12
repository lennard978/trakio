export const config = { runtime: "nodejs" };

import { verifyToken } from "./utils/auth";
import { kvGet, kvSet } from "./utils/kvAdapter";

export default async function handler(req, res) {
  try {
    // Local dev fallback
    if (!process.env.VERCEL) {
      if (req.method === "GET") return res.status(200).json([]);
      if (req.method === "POST") return res.status(201).json(req.body);
      if (req.method === "PUT") return res.status(200).json(req.body);
      if (req.method === "DELETE") return res.status(204).end();
      return res.status(405).json({ error: "Method not allowed" });
    }

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
      const existing = (await kvGet(listKey)) || [];
      await kvSet(listKey, [...existing, sub]);
      return res.status(201).json(sub);
    }

    if (req.method === "PUT") {
      const updated = req.body;
      const existing = (await kvGet(listKey)) || [];
      const next = existing.map((s) =>
        s.id === updated.id ? updated : s
      );
      await kvSet(listKey, next);
      return res.status(200).json(updated);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      const existing = (await kvGet(listKey)) || [];
      const next = existing.filter((s) => s.id !== id);
      await kvSet(listKey, next);
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("subscriptions error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

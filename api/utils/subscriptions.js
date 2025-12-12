export const config = { runtime: "nodejs" };

import { verifyToken } from "./utils/auth";
import { kvGet, kvSet } from "./utils/kvAdapter";

export default async function handler(req, res) {
  try {
    /* --------------------------------------------------
     * LOCAL DEV FALLBACK (NO KV, NO CRASH)
     * -------------------------------------------------- */
    if (!process.env.VERCEL) {
      if (req.method === "GET") return res.status(200).json([]);
      if (req.method === "POST") return res.status(201).json(req.body);
      if (req.method === "PUT") return res.status(200).json(req.body);
      if (req.method === "DELETE") return res.status(204).end();
      return res.status(405).json({ error: "Method not allowed" });
    }

    /* --------------------------------------------------
     * AUTH (VERCEL ONLY)
     * -------------------------------------------------- */
    const user = await verifyToken(req);
    if (!user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const listKey = `user:${user.id}:subscriptions`;

    /* --------------------------------------------------
     * GET — LIST
     * -------------------------------------------------- */
    if (req.method === "GET") {
      const subs = (await kvGet(listKey)) || [];
      return res.status(200).json(subs);
    }

    /* --------------------------------------------------
     * POST — CREATE
     * -------------------------------------------------- */
    if (req.method === "POST") {
      const sub = req.body;
      if (!sub?.id) {
        return res.status(400).json({ error: "Invalid subscription data" });
      }

      const existing = (await kvGet(listKey)) || [];
      const arr = Array.isArray(existing) ? existing : [];

      if (!arr.some((s) => s.id === sub.id)) {
        await kvSet(listKey, [...arr, sub]);
      }

      return res.status(201).json(sub);
    }

    /* --------------------------------------------------
     * PUT — UPDATE
     * -------------------------------------------------- */
    if (req.method === "PUT") {
      const updatedSub = req.body;
      if (!updatedSub?.id) {
        return res.status(400).json({ error: "Invalid subscription data" });
      }

      const existing = (await kvGet(listKey)) || [];
      const updated = existing.map((s) =>
        s.id === updatedSub.id ? updatedSub : s
      );

      await kvSet(listKey, updated);
      return res.status(200).json(updatedSub);
    }

    /* --------------------------------------------------
     * DELETE — REMOVE
     * -------------------------------------------------- */
    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: "Missing id" });
      }

      const existing = (await kvGet(listKey)) || [];
      const filtered = existing.filter((s) => s.id !== id);

      await kvSet(listKey, filtered);
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Subscriptions API error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

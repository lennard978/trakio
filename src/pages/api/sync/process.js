import { Redis } from "@upstash/redis";
import { kv } from "@vercel/kv";
import { verifyToken } from "../utils/auth.js";

const redis = Redis.fromEnv();

function getAuthUser(req) {
  const auth = req.headers.authorization || "";
  const match = auth.match(/^Bearer\s+(.+)$/);
  if (!match) return null;
  return verifyToken(match[1]);
}

function subsKey(userId) {
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

  const userId = authUser.userId;

  const jobId = await redis.lpop(`sync:queue:${userId}`);
  if (!jobId) {
    return res.status(200).json({ empty: true });
  }

  const lockKey = `sync:lock:${jobId}`;
  const locked = await redis.set(lockKey, "1", { nx: true, ex: 30 });
  if (!locked) {
    return res.status(200).json({ locked: true });
  }

  const rawJob = await redis.get(`sync:job:${jobId}`);
  const job = rawJob ? JSON.parse(rawJob) : null;

  if (!job) {
    await redis.del(lockKey);
    return res.status(200).json({ ok: true });
  }

  try {
    if (job.type === "ADD" && job.entity === "subscription") {
      const current = (await kv.get(subsKey(userId))) || [];

      const exists = current.some(
        (s) => s.id === job.payload.subscription.id
      );

      if (!exists) {
        await kv.set(subsKey(userId), [
          ...current,
          job.payload.subscription,
        ]);
      }
    }

    await redis.del(`sync:job:${jobId}`);
    await redis.del(lockKey);

    return res.status(200).json({ processed: jobId });
  } catch (err) {
    job.retryCount = (job.retryCount || 0) + 1;
    await redis.set(`sync:job:${jobId}`, JSON.stringify(job));
    await redis.rpush(`sync:queue:${userId}`, jobId);
    await redis.del(lockKey);

    return res.status(500).json({ error: "Processing failed" });
  }
}

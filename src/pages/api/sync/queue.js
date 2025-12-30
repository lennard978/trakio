import { Redis } from "@upstash/redis";
import { verifyToken } from "../utils/jwt.js";

const redis = Redis.fromEnv();

function getAuthUser(req) {
  const auth = req.headers.authorization || "";
  const match = auth.match(/^Bearer\s+(.+)$/);
  if (!match) return null;
  return verifyToken(match[1]);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authUser = getAuthUser(req);
  if (!authUser?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { type, entity, payload } = req.body || {};

  if (type !== "ADD" || entity !== "subscription" || !payload?.subscription) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const jobId = crypto.randomUUID();
  const userId = authUser.userId;

  const job = {
    jobId,
    userId,
    type,
    entity,
    payload,
    createdAt: Date.now(),
    retryCount: 0,
  };

  await redis.set(`sync:job:${jobId}`, job);
  await redis.rpush(`sync:queue:${userId}`, jobId);

  return res.status(200).json({ ok: true, jobId });
}

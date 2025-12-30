import { redis } from "../../src/lib/redis.js";

function premiumKey(userId) {
  return `premium:${userId}`;
}

function eventKey(eventId) {
  return `stripe:event:${eventId}`;
}

export async function getPremiumRecord(userId) {
  return redis.get(premiumKey(userId));
}

export async function setPremiumRecord(userId, record) {
  const existing = await redis.get(premiumKey(userId)) || {};
  const merged = {
    ...existing,
    ...record,
    lastUpdated: Date.now(),
  };
  console.log("📦 [Redis] Saving premium record for", userId, JSON.stringify(merged, null, 2));
  await redis.set(premiumKey(userId), merged);
  return merged;
}

export async function wasStripeEventProcessed(eventId) {
  return redis.get(eventKey(eventId));
}

export async function markStripeEventProcessed(eventId) {
  await redis.set(eventKey(eventId), true, { ex: 60 * 60 * 24 * 7 }); // Expires in 7 days
}

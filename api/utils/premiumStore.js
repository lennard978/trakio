import { kv } from "@vercel/kv";

function premiumKey(userId) {
  return `premium:${userId}`;
}

function eventKey(eventId) {
  return `stripe:event:${eventId}`;
}

// ✅ Add this missing function
export async function getPremiumRecord(userId) {
  return kv.get(premiumKey(userId));
}

export async function setPremiumRecord(userId, record) {
  const existing = await kv.get(premiumKey(userId)) || {};

  const merged = {
    ...existing,
    ...record,
    lastUpdated: Date.now(),
  };

  await kv.set(premiumKey(userId), merged);
  return merged;
}

// Optional: also export these if you're using them elsewhere
export async function wasStripeEventProcessed(eventId) {
  return kv.get(eventKey(eventId));
}

export async function markStripeEventProcessed(eventId) {
  await kv.set(eventKey(eventId), true, { ex: 60 * 60 * 24 * 7 });
}

import { kv } from "@vercel/kv";

function key(userId) {
  return `premium:${userId}`;
}

/**
 * record:
 * {
 *   isPremium: boolean,
 *   status: "active" | "trial" | "trial_expired" | "canceled" | "past_due",
 *   stripeCustomerId,
 *   subscriptionId,
 *   currentPeriodEnd,
 *   trialEnds
 * }
 */
export async function setPremiumRecord(userId, record) {
  const existing = (await kv.get(key(userId))) || {};
  const merged = { ...existing, ...record };
  await kv.set(key(userId), merged);
  return merged;
}

export async function getPremiumRecord(userId) {
  return kv.get(key(userId)); // may be null
}

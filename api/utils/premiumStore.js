import { kv } from "@vercel/kv";

function key(email) {
  return `premium:${email.toLowerCase()}`;
}

/**
 * Save or update premium record for a user
 * record example:
 * { isPremium: true, status: "active", stripeCustomerId, subscriptionId, currentPeriodEnd }
 */
export async function setPremiumRecord(email, record) {
  const existing = (await kv.get(key(email))) || {};
  const merged = { ...existing, ...record };
  await kv.set(key(email), merged);
  return merged;
}

export async function getPremiumRecord(email) {
  return kv.get(key(email)); // might be null
}

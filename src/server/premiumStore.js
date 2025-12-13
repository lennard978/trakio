import { kv } from "@vercel/kv";

function key(email) {
  return `premium:${email.toLowerCase()}`;
}

/**
 * record example:
 * {
 *   isPremium: true,
 *   status: "active" | "trial" | "trial_expired" | "canceled" | "past_due",
 *   stripeCustomerId,
 *   subscriptionId,
 *   currentPeriodEnd,
 *   trialEnds
 * }
 */
export async function setPremiumRecord(email, record) {
  const existing = (await kv.get(key(email))) || {};
  const merged = { ...existing, ...record };
  await kv.set(key(email), merged);
  return merged;
}

export async function getPremiumRecord(email) {
  return kv.get(key(email)); // may be null
}

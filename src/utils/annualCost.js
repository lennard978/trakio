// src/utils/getAnnualCost.js

/**
 * getAnnualCost
 *
 * Calculates total annual cost for a list of subscriptions.
 * Defensive against malformed data.
 *
 * @param {Array} subscriptions
 * @returns {number} annual total (rounded to 2 decimals)
 */
export function getAnnualCost(subscriptions = []) {
  if (!Array.isArray(subscriptions)) return 0;

  const MULTIPLIERS = {
    weekly: 52,
    biweekly: 26,
    monthly: 12,
    quarterly: 4,
    yearly: 1,
  };

  const total = subscriptions.reduce((sum, s) => {
    if (!s) return sum;

    const price = Number(s.price);
    const freq = s.frequency;

    if (!Number.isFinite(price) || price <= 0) return sum;
    if (!MULTIPLIERS[freq]) return sum;

    return sum + price * MULTIPLIERS[freq];
  }, 0);

  // Ensure stable currency math
  return Number(total.toFixed(2));
}

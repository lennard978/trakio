// src/utils/savings.js

import { computeNextRenewal } from "./renewal";

/**
 * Estimate how much money can be saved if a subscription
 * is cancelled today (unused remaining period).
 */
export function estimateSavingsIfCancelledToday(subscription) {
  if (!subscription?.price || !subscription?.frequency) return 0;

  const now = new Date();
  const nextRenewal = computeNextRenewal(subscription);

  if (!nextRenewal || nextRenewal <= now) return 0;

  const msRemaining = nextRenewal.getTime() - now.getTime();
  const daysRemaining = msRemaining / (1000 * 60 * 60 * 24);

  let billingDays;

  switch (subscription.frequency) {
    case "weekly":
      billingDays = 7;
      break;
    case "monthly":
      billingDays = 30.437; // average month
      break;
    case "quarterly":
      billingDays = 91.31;
      break;
    case "yearly":
      billingDays = 365.25;
      break;
    default:
      billingDays = 30.437;
  }

  const dailyCost = subscription.price / billingDays;
  const estimatedSavings = dailyCost * Math.max(daysRemaining, 0);

  return Number(estimatedSavings.toFixed(2));
}

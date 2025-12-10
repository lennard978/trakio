// src/hooks/usePremium.js
import { usePremiumContext } from "../context/PremiumContext";

/**
 * Wrapper around PremiumContext with helpful derived flags.
 */
export function usePremium() {
  const ctx = usePremiumContext();
  const { isPremium, trialEnds } = ctx;

  const now = new Date();
  const trialEndDate = trialEnds ? new Date(trialEnds) : null;

  // Derived trial state
  const hasActiveTrial =
    !!trialEndDate && now <= trialEndDate;

  const trialExpired =
    !!trialEndDate && now > trialEndDate && !isPremium;

  const noTrial = !trialEndDate && !isPremium;

  // Trial days left
  let trialDaysLeft = null;
  if (trialEndDate && now <= trialEndDate) {
    const diffMs = trialEndDate - now;
    trialDaysLeft = Math.max(0, Math.ceil(diffMs / 86400000));
  }

  return {
    ...ctx, // isPremium, trialEnds, loading, etc.
    trialEndDate,
    hasActiveTrial,
    trialExpired,
    noTrial,
    trialDaysLeft,
  };
}

// src/hooks/usePremium.js
import { usePremiumContext } from "../context/PremiumContext";

/**
 * Thin wrapper around PremiumContext that also exposes
 * useful derived flags so components don't have to
 * re-implement date logic everywhere.
 */
export function usePremium() {
  const ctx = usePremiumContext();
  const { isPremium, trialEnds } = ctx;

  const now = new Date();
  const trialEndDate = trialEnds ? new Date(trialEnds) : null;

  // Derived state
  const hasActiveTrial =
    !!trialEndDate && now <= trialEndDate && !isPremium;

  const trialExpired =
    !!trialEndDate && now > trialEndDate && !isPremium;

  const noTrial = !trialEndDate && !isPremium;

  // Optional helper: days left in trial (for banners, etc.)
  let trialDaysLeft = null;
  if (trialEndDate && now <= trialEndDate) {
    const diffMs = trialEndDate - now;
    trialDaysLeft = Math.max(0, Math.ceil(diffMs / 86400000));
  }

  return {
    ...ctx,          // isPremium, trialEnds, loading, startTrial, startCheckout, activatePremium, refreshPremiumStatus
    trialEndDate,    // Date object or null
    hasActiveTrial,  // true = trial in progress (not yet converted to paid premium)
    trialExpired,    // true = trial ended and user is not premium
    noTrial,         // true = no trial recorded and not premium
    trialDaysLeft,   // integer or null
  };
}

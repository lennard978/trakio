import { usePremiumContext } from "../context/PremiumContext";

export function usePremium() {
  const ctx = usePremiumContext();
  const { isPremium, trialEnds, status } = ctx;

  const now = new Date();
  const trialEndDate = trialEnds ? new Date(trialEnds) : null;

  const hasActiveTrial = !!trialEndDate && now <= trialEndDate;
  const trialExpired = !!trialEndDate && now > trialEndDate && !isPremium;
  const noTrial = !trialEndDate && !isPremium;

  let trialDaysLeft = null;
  if (trialEndDate && now <= trialEndDate) {
    const diffMs = trialEndDate - now;
    trialDaysLeft = Math.max(0, Math.ceil(diffMs / 86400000));
  }

  return {
    ...ctx,
    status,
    trialEndDate,
    hasActiveTrial,
    trialExpired,
    noTrial,
    trialDaysLeft,
  };
}

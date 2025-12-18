import { useMemo } from "react";
import { usePremiumContext } from "../context/PremiumContext";

/**
 * Authoritative premium resolver.
 * Frontend MUST NOT trust raw flags alone.
 */
export function usePremium() {
  const ctx = usePremiumContext();

  const {
    status,
    currentPeriodEnd,
    trialEnds,
    loading,
  } = ctx;

  const premiumState = useMemo(() => {
    const now = Date.now();

    const periodEndMs =
      typeof currentPeriodEnd === "number"
        ? currentPeriodEnd * 1000
        : null;

    const trialEndMs =
      typeof trialEnds === "number"
        ? trialEnds * 1000
        : null;

    const isPremium =
      (status === "active" || status === "trialing") &&
      periodEndMs &&
      periodEndMs > now;

    const hasActiveTrial =
      status === "trialing" &&
      trialEndMs &&
      trialEndMs > now;

    const trialExpired =
      trialEndMs &&
      trialEndMs <= now &&
      status !== "active";

    const noTrial =
      !trialEndMs && status !== "active";

    let trialDaysLeft = null;
    if (hasActiveTrial) {
      const diffMs = trialEndMs - now;
      trialDaysLeft = Math.max(
        0,
        Math.ceil(diffMs / 86400000)
      );
    }

    return {
      isPremium: !!isPremium,
      hasActiveTrial,
      trialExpired,
      noTrial,
      trialDaysLeft,
      premiumEndsAt: periodEndMs
        ? new Date(periodEndMs).toISOString()
        : null,
      trialEndsAt: trialEndMs
        ? new Date(trialEndMs).toISOString()
        : null,
    };
  }, [status, currentPeriodEnd, trialEnds]);

  return {
    ...ctx,
    ...premiumState,
    loading,
  };
}

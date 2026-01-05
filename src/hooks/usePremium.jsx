import { useMemo } from "react";
import { usePremiumContext } from "../context/PremiumContext";

const SNAPSHOT_KEY = "premium_snapshot_v1";

function saveSnapshot(data) {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({
      ...data,
      savedAt: Date.now(),
    }));
  } catch { }
}

function loadSnapshot() {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Authoritative premium resolver.
 * Frontend MUST NOT trust raw flags alone.
 */
export function usePremium() {
  const ctx = usePremiumContext?.() ?? null;

  // ✅ NEVER throw here — return safe defaults instead
  if (!ctx) {
    return {
      loaded: true,
      isPremium: false,
      status: null,
      currentPeriodEnd: null,
      trialEnds: null,
      cancelAtPeriodEnd: false,
      loading: false,

      // keep API stable
      startTrial: async () => false,
      cancelTrial: async () => false,
      startCheckout: async () => { },
      refreshPremiumStatus: async () => null,

      // any other fields your UI expects:
      hasActiveTrial: false,
      trialExpired: false,
      noTrial: true,
      trialDaysLeft: 0,
      trialEndDate: null,
    };
  }

  // ✅ only destructure AFTER ctx is confirmed
  const {
    status,
    currentPeriodEnd,
    trialEnds,
    cancelAtPeriodEnd,
    loading,
    startTrial,
    cancelTrial,
    startCheckout,
    refreshPremiumStatus,
  } = ctx;
  const premiumState = useMemo(() => {
    const now = Date.now();

    // ---- OFFLINE FALLBACK (DISPLAY ONLY) ----
    if (!navigator.onLine && !status && loading) {
      const cached = loadSnapshot();
      if (cached) return cached;
    }

    const periodEndMs =
      typeof currentPeriodEnd === "number"
        ? currentPeriodEnd * 1000
        : null;

    const trialEndMs =
      typeof trialEnds === "number"
        ? trialEnds * 1000
        : null;

    const isPremium =
      (status === "active" && periodEndMs && periodEndMs > now) ||
      (status === "trialing" && trialEndMs && trialEndMs > now);


    const hasActiveTrial =
      status === "trialing" &&
      trialEndMs &&
      trialEndMs > now;

    let trialDaysLeft = null;
    if (hasActiveTrial) {
      trialDaysLeft = Math.max(
        0,
        Math.ceil((trialEndMs - now) / 86400000)
      );
    }

    const resolved = {
      isPremium,
      hasActiveTrial,
      trialDaysLeft,
      premiumEndsAt: periodEndMs
        ? new Date(periodEndMs).toISOString()
        : null,
      trialEndsAt: trialEndMs
        ? new Date(trialEndMs).toISOString()
        : null,
      trialEndDate: trialEndMs
        ? new Date(trialEndMs).toISOString()
        : null,
    };


    // ---- SAVE SNAPSHOT WHEN ONLINE ----
    if (navigator.onLine && !loading) {
      saveSnapshot(resolved);
    }

    return resolved;
  }, [status, currentPeriodEnd, trialEnds, loading]);

  return {
    ...ctx,
    ...premiumState,
    loading,
    loaded: true, // ✅ REQUIRED
  };

}


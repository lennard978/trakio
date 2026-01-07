import { useMemo, useCallback } from "react";
import { usePremiumContext } from "../context/PremiumContext";

const SNAPSHOT_KEY = "premium_snapshot_v1";

/* -------------------- Storage helpers -------------------- */

function saveSnapshot(data) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        SNAPSHOT_KEY,
        JSON.stringify({
          ...data,
          savedAt: Date.now(),
        })
      );
    }
  } catch {
    /* intentionally silent */
  }
}

function loadSnapshot() {
  try {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isOnline() {
  return typeof navigator !== "undefined" && navigator.onLine;
}

/**
 * usePremium
 *
 * Authoritative premium resolver.
 * UI components MUST rely on this hook only.
 *
 * Stable return shape guaranteed.
 */
export function usePremium() {
  const ctx =
    typeof usePremiumContext === "function"
      ? usePremiumContext()
      : null;

  /* -------------------- Hard fallback (no provider) -------------------- */
  if (!ctx) {
    return {
      loaded: true,
      loading: false,

      isPremium: false,
      hasActiveTrial: false,
      trialDaysLeft: null,

      premiumEndsAt: null,
      trialEndsAt: null,
      trialEndDate: null,

      status: null,
      cancelAtPeriodEnd: false,
      noTrial: true,

      startTrial: async () => false,
      cancelTrial: async () => false,
      startCheckout: async () => { },
      refreshPremiumStatus: async () => ({
        status: null,
      }),
    };
  }

  const {
    status,
    currentPeriodEnd,
    trialEnds,
    cancelAtPeriodEnd,
    loading,

    startTrial,
    cancelTrial,
    startCheckout,
    refreshPremiumStatus: _refresh,
  } = ctx;

  /* -------------------- Safe refresh wrapper -------------------- */
  const refreshPremiumStatus = useCallback(async () => {
    try {
      const result = await _refresh();
      return result ?? { status: null };
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("refreshPremiumStatus failed:", err);
      }
      return { status: null };
    }
  }, [_refresh]);

  /* -------------------- Derived premium state -------------------- */
  const premiumState = useMemo(() => {
    const now = Date.now();

    /* ---------- Offline snapshot fallback ---------- */
    if (!isOnline() && !status && loading) {
      const cached = loadSnapshot();
      if (cached) {
        return {
          ...cached,
          loaded: true,
          loading: false,
        };
      }
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
      (status === "active" &&
        periodEndMs &&
        periodEndMs > now) ||
      (status === "trialing" &&
        trialEndMs &&
        trialEndMs > now);

    const hasActiveTrial =
      status === "trialing" &&
      trialEndMs &&
      trialEndMs > now;

    const trialDaysLeft = hasActiveTrial
      ? Math.max(
        0,
        Math.ceil((trialEndMs - now) / 86400000)
      )
      : null;

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

      // legacy alias (kept intentionally)
      trialEndDate: trialEndMs
        ? new Date(trialEndMs).toISOString()
        : null,
    };

    /* ---------- Persist snapshot when online & settled ---------- */
    if (isOnline() && !loading) {
      saveSnapshot(resolved);
    }

    return resolved;
  }, [status, currentPeriodEnd, trialEnds, loading]);

  return {
    /* ---------- Raw context (controlled) ---------- */
    status: status ?? null,
    cancelAtPeriodEnd: Boolean(cancelAtPeriodEnd),

    loaded: true,
    loading: Boolean(loading),

    /* ---------- Derived state ---------- */
    ...premiumState,

    /* ---------- Actions ---------- */
    startTrial,
    cancelTrial,
    startCheckout,
    refreshPremiumStatus,
  };
}

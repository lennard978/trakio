import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import PropTypes from "prop-types";
import { useAuth } from "../hooks/useAuth";

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const { user, token } = useAuth();
  const isLoggedIn = Boolean(user && token);

  /* ------------------------------------------------------------------ */
  /* Raw Stripe-backed state (NO DERIVED LOGIC HERE)                     */
  /* ------------------------------------------------------------------ */

  const [status, setStatus] = useState(null); // active | trialing | past_due | canceled | incomplete
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState(null); // unix seconds
  const [trialEnds, setTrialEnds] = useState(null); // unix seconds
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [loading, setLoading] = useState(false);

  const mountedRef = useRef(true);

  /* ------------------------------------------------------------------ */
  /* Mount / unmount safety                                             */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const safeSet = (setter) => (value) => {
    if (mountedRef.current) setter(value);
  };

  /* ------------------------------------------------------------------ */
  /* Reset on logout (STRICT)                                           */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!isLoggedIn) {
      safeSet(setStatus)(null);
      safeSet(setCurrentPeriodEnd)(null);
      safeSet(setTrialEnds)(null);
      safeSet(setCancelAtPeriodEnd)(false);
      safeSet(setLoading)(false);
    }
  }, [isLoggedIn]);

  /* ------------------------------------------------------------------ */
  /* Auth headers helper                                                */
  /* ------------------------------------------------------------------ */

  const authHeaders = useCallback(() => {
    if (!token) return null;

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [token]);

  /* ------------------------------------------------------------------ */
  /* Refresh premium from backend (Stripe truth)                        */
  /* ------------------------------------------------------------------ */

  const refreshPremiumStatus = useCallback(async () => {
    if (!isLoggedIn) return { status: null };

    safeSet(setLoading)(true);

    try {
      const headers = authHeaders();
      if (!headers) {
        safeSet(setLoading)(false);
        return { status: null };
      }

      const res = await fetch("/api/user", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "get-status" }),
      });

      if (!res.ok) {
        safeSet(setLoading)(false);
        return { status: null };
      }

      const data = await res.json();

      safeSet(setStatus)(data.status ?? null);
      safeSet(setCurrentPeriodEnd)(
        typeof data.currentPeriodEnd === "number"
          ? data.currentPeriodEnd
          : null
      );
      safeSet(setTrialEnds)(
        typeof data.trialEnds === "number" ? data.trialEnds : null
      );
      safeSet(setCancelAtPeriodEnd)(Boolean(data.cancelAtPeriodEnd));

      safeSet(setLoading)(false);
      return data;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Premium refresh failed:", err);
      }
      safeSet(setLoading)(false);
      return { status: null };
    }
  }, [isLoggedIn, authHeaders]);

  /* ------------------------------------------------------------------ */
  /* Auto-refresh on login + every 5 minutes                            */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!isLoggedIn) return;

    refreshPremiumStatus();

    const id = setInterval(
      refreshPremiumStatus,
      5 * 60 * 1000 // 5 minutes
    );

    return () => clearInterval(id);
  }, [isLoggedIn, refreshPremiumStatus]);

  /* ------------------------------------------------------------------ */
  /* Recover from Stripe "incomplete"                                   */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (status === "incomplete") {
      refreshPremiumStatus();
    }
  }, [status, refreshPremiumStatus]);

  /* ------------------------------------------------------------------ */
  /* Trial handling                                                     */
  /* ------------------------------------------------------------------ */

  const cancelTrial = useCallback(async () => {
    if (!isLoggedIn) return false;

    safeSet(setLoading)(true);

    try {
      const headers = authHeaders();
      if (!headers) return false;

      const res = await fetch("/api/user", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "cancel-trial" }),
      });

      if (!res.ok) return false;

      await refreshPremiumStatus();
      return true;
    } catch {
      return false;
    } finally {
      safeSet(setLoading)(false);
    }
  }, [isLoggedIn, authHeaders, refreshPremiumStatus]);

  /* ------------------------------------------------------------------ */
  /* Stripe checkout                                                    */
  /* ------------------------------------------------------------------ */

  const startCheckout = useCallback(
    async (plan) => {
      if (!isLoggedIn) return;

      safeSet(setLoading)(true);

      try {
        const headers = authHeaders();
        if (!headers) return;

        const res = await fetch("/api/stripe", {
          method: "POST",
          headers,
          body: JSON.stringify({ action: "checkout", plan }),
        });

        const data = await res.json();
        if (data?.url) {
          window.location.href = data.url;
        }
      } finally {
        safeSet(setLoading)(false);
      }
    },
    [isLoggedIn, authHeaders]
  );

  /* ------------------------------------------------------------------ */

  return (
    <PremiumContext.Provider
      value={{
        // RAW STRIPE STATE
        status,
        currentPeriodEnd,
        trialEnds,
        cancelAtPeriodEnd,

        // ACTIONS
        loading,
        cancelTrial,
        startCheckout,
        refreshPremiumStatus,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* Consumer hook                                                       */
/* ------------------------------------------------------------------ */

export function usePremiumContext() {
  const ctx = useContext(PremiumContext);

  if (!ctx) {
    // SAFE fallback (ErrorBoundary-safe)
    return {
      status: null,
      currentPeriodEnd: null,
      trialEnds: null,
      cancelAtPeriodEnd: false,
      loading: false,
      cancelTrial: async () => false,
      startCheckout: async () => { },
      refreshPremiumStatus: async () => ({ status: null }),
    };
  }

  return ctx;
}

PremiumProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "../hooks/useAuth";

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const { user, token } = useAuth();
  const isLoggedIn = !!user && !!token;

  /* ------------------------------------------------------------------ */
  /* Raw Stripe-backed state (DO NOT DERIVE LOGIC HERE)                  */
  /* ------------------------------------------------------------------ */

  const [status, setStatus] = useState(null); // active | trialing | past_due | canceled
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState(null); // unix seconds
  const [trialEnds, setTrialEnds] = useState(null); // unix seconds
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [loading, setLoading] = useState(false);


  /* ------------------------------------------------------------------ */
  /* Reset on logout                                                     */
  /* ------------------------------------------------------------------ */

  if (loading && !isLoggedIn) {
    console.warn("PremiumProvider loading while logged out — forcing reset");
    setLoading(false);
  }

  useEffect(() => {
    if (!isLoggedIn) {
      setStatus(null);
      setCurrentPeriodEnd(null);
      setTrialEnds(null);
      setCancelAtPeriodEnd(false);
      setLoading(false); // ✅ IMPORTANT
    }
  }, [isLoggedIn]);


  useEffect(() => {
    if (status === "incomplete") {
      refreshPremiumStatus();
    }
  }, [status]);


  const authHeaders = useCallback(() => {
    if (!token) return null;

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [token]);


  /* ------------------------------------------------------------------ */
  /* Refresh premium from backend (Stripe truth)                         */
  /* ------------------------------------------------------------------ */
  const refreshPremiumStatus = useCallback(async () => {
    if (!isLoggedIn) return null;

    setLoading(true);

    try {
      const headers = authHeaders();
      if (!headers) {
        setLoading(false);
        return null;
      }
      const res = await fetch("/api/user", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "get-status" }),
      });


      if (!res.ok) {
        setLoading(false);
        return null;
      }

      const data = await res.json();

      setStatus(data.status ?? null);
      setCurrentPeriodEnd(
        typeof data.currentPeriodEnd === "number"
          ? data.currentPeriodEnd
          : null
      );
      setTrialEnds(
        typeof data.trialEnds === "number"
          ? data.trialEnds
          : null
      );
      setCancelAtPeriodEnd(!!data.cancelAtPeriodEnd);

      setLoading(false);
      return data;
    } catch (err) {
      console.error("Premium refresh failed:", err);
      setLoading(false);
      return null;
    }
  }, [isLoggedIn, authHeaders]);

  /* ------------------------------------------------------------------ */
  /* Auto refresh every 5 minutes                                        */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!isLoggedIn) return;

    refreshPremiumStatus();
    const id = setInterval(refreshPremiumStatus, 5 * 60 * 1000);

    return () => clearInterval(id);
  }, [isLoggedIn, refreshPremiumStatus]);



  /* ------------------------------------------------------------------ */
  /* Trial handling (still backend-authoritative)                        */
  /* ------------------------------------------------------------------ */

  const cancelTrial = async () => {
    if (!isLoggedIn) return false;

    setLoading(true);
    try {
      const headers = authHeaders();
      if (!headers) return false;

      const res = await fetch("/api/user", {
        method: "POST",
        headers,
        body: JSON.stringify({ action: "cancel-trial" }),
      });

      if (!res.ok) return false;

      // 🔁 Always re-sync from Stripe
      await refreshPremiumStatus();
      return true;
    } finally {
      setLoading(false);
    }
  };


  /* ------------------------------------------------------------------ */
  /* Stripe checkout                                                     */
  /* ------------------------------------------------------------------ */

  const startCheckout = async (plan) => {
    if (!isLoggedIn) return;

    setLoading(true);
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
      setLoading(false);
    }
  };


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

export function usePremiumContext() {
  const ctx = useContext(PremiumContext);

  if (!ctx) {
    // SAFE fallback — prevents white screen
    return {
      status: null,
      currentPeriodEnd: null,
      trialEnds: null,
      cancelAtPeriodEnd: false,
      loading: false,
      cancelTrial: async () => false,
      startCheckout: async () => { },
      refreshPremiumStatus: async () => null,
    };
  }

  return ctx;
}



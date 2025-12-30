import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "../hooks/useAuth";

const PremiumContext = createContext(null);

const STORAGE_KEY = "premiumStatus"; // 🔄 Cache key

export function PremiumProvider({ children }) {
  const { user, token } = useAuth();
  const isLoggedIn = !!user && !!token;

  const [status, setStatus] = useState(null);
  const [currentPeriodEnd, setCurrentPeriodEnd] = useState(null);
  const [trialEnds, setTrialEnds] = useState(null);
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔄 Load from localStorage on mount
  useEffect(() => {
    const cache = localStorage.getItem(STORAGE_KEY);
    if (cache) {
      try {
        const parsed = JSON.parse(cache);
        setStatus(parsed.status ?? null);
        setCurrentPeriodEnd(parsed.currentPeriodEnd ?? null);
        setTrialEnds(parsed.trialEnds ?? null);
        setCancelAtPeriodEnd(!!parsed.cancelAtPeriodEnd);
      } catch (err) {
        console.warn("Invalid premium cache:", err);
      }
    }
  }, []);

  // 🔄 Reset cache + state on logout
  useEffect(() => {
    if (!isLoggedIn) {
      setStatus(null);
      setCurrentPeriodEnd(null);
      setTrialEnds(null);
      setCancelAtPeriodEnd(false);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (status === "incomplete") {
      refreshPremiumStatus();
    }
  }, [status]);

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  // ✅ Refresh from server + update localStorage
  const refreshPremiumStatus = useCallback(async () => {
    if (!isLoggedIn) return null;

    setLoading(true);

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ action: "get-status" }),
      });

      if (!res.ok) {
        setLoading(false);
        return null;
      }

      const data = await res.json();

      setStatus(data.status ?? null);
      setCurrentPeriodEnd(typeof data.currentPeriodEnd === "number" ? data.currentPeriodEnd : null);
      setTrialEnds(typeof data.trialEnds === "number" ? data.trialEnds : null);
      setCancelAtPeriodEnd(!!data.cancelAtPeriodEnd);

      // ✅ Cache in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      return data;
    } catch (err) {
      console.error("Premium refresh failed:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, authHeaders]);

  // ⏱️ Refresh every 5 minutes
  useEffect(() => {
    refreshPremiumStatus();
    const id = setInterval(refreshPremiumStatus, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [refreshPremiumStatus]);

  const startTrial = async () => {
    if (!isLoggedIn) return false;
    try {
      setLoading(true);
      const res = await fetch("/api/user", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ action: "start-trial" }),
      });

      if (!res.ok) return false;

      const data = await res.json();
      setTrialEnds(data.trialEnds || null);
      setStatus("trialing");

      // ✅ Cache updated trial state
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        status: "trialing",
        trialEnds: data.trialEnds,
        currentPeriodEnd: data.currentPeriodEnd ?? data.trialEnds,
      }));

      return true;
    } finally {
      setLoading(false);
    }
  };

  const cancelTrial = async () => {
    if (!isLoggedIn) return false;

    try {
      setLoading(true);
      const res = await fetch("/api/user", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ action: "cancel-trial" }),
      });

      if (!res.ok) return false;

      setTrialEnds(null);
      setStatus("canceled");

      // ✅ Update local cache
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        status: "canceled",
        trialEnds: null,
        currentPeriodEnd: null,
      }));

      return true;
    } finally {
      setLoading(false);
    }
  };

  const startCheckout = async (plan) => {
    if (!isLoggedIn) return;
    try {
      setLoading(true);
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: authHeaders(),
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

  return (
    <PremiumContext.Provider
      value={{
        status,
        currentPeriodEnd,
        trialEnds,
        cancelAtPeriodEnd,
        loading,
        startTrial,
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
    throw new Error("usePremiumContext must be used inside PremiumProvider");
  }
  return ctx;
}

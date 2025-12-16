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

  const [isPremium, setIsPremium] = useState(false);
  const [trialEnds, setTrialEnds] = useState(null);
  const [loading, setLoading] = useState(false);

  // Clear state on logout
  useEffect(() => {
    if (!isLoggedIn) {
      setIsPremium(false);
      setTrialEnds(null);
    }
  }, [isLoggedIn]);

  const authHeaders = useCallback(
    () => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }),
    [token]
  );

  // 🔄 Refresh premium from backend
  const refreshPremiumStatus = useCallback(async () => {
    if (!isLoggedIn) {
      return { isPremium: false, trialEnds: null };
    }

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ action: "get-status" }),
      });

      if (!res.ok) return null;

      const data = await res.json();

      if (typeof data.isPremium === "boolean") {
        setIsPremium(data.isPremium);
      }

      if ("trialEnds" in data) {
        setTrialEnds(data.trialEnds);
      }

      return data;
    } catch {
      return null;
    }
  }, [isLoggedIn, authHeaders]);

  // Auto refresh
  useEffect(() => {
    refreshPremiumStatus();
    const id = setInterval(refreshPremiumStatus, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [refreshPremiumStatus]);

  // ⏳ START TRIAL
  const startTrial = async () => {
    if (!isLoggedIn) return false;

    try {
      setLoading(true);
      const res = await fetch("/api/user", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ action: "start-trial" }),
      });

      const data = await res.json();
      if (!res.ok) return false;

      setTrialEnds(data.trialEnds || null);
      setIsPremium(false);
      return true;
    } finally {
      setLoading(false);
    }
  };

  // ❌ CANCEL TRIAL
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
      setIsPremium(false);
      return true;
    } finally {
      setLoading(false);
    }
  };

  // 💳 STRIPE CHECKOUT
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
        isPremium,
        trialEnds,
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

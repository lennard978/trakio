// src/context/PremiumContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const PremiumContext = createContext(null);

// Helper to read current user email from localStorage
function getCurrentEmail() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.email || null;
  } catch {
    return null;
  }
}

export function PremiumProvider({ children }) {
  // Local cache (will be overwritten by server on mount)
  const [isPremium, setIsPremium] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("isPremium")) || false;
    } catch {
      return false;
    }
  });

  const [trialEnds, setTrialEnds] = useState(() => {
    try {
      return localStorage.getItem("trialEnds") || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Persist to localStorage as a cache
  useEffect(() => {
    localStorage.setItem("isPremium", JSON.stringify(isPremium));
  }, [isPremium]);

  useEffect(() => {
    if (trialEnds) {
      localStorage.setItem("trialEnds", trialEnds);
    } else {
      localStorage.removeItem("trialEnds");
    }
  }, [trialEnds]);

  // --------- CORE: refresh status from backend ---------
  const refreshPremiumStatus = async () => {
    const email = getCurrentEmail();
    if (!email) {
      setIsPremium(false);
      setTrialEnds(null);
      return;
    }

    try {
      const res = await fetch(
        `/api/user/premium-status?email=${encodeURIComponent(email)}`
      );

      if (!res.ok) {
        console.error("premium-status HTTP error:", res.status);
        return;
      }

      const data = await res.json();

      if (typeof data.isPremium === "boolean") {
        setIsPremium(data.isPremium);
      }

      if (data.trialEnds || data.trialEnds === null) {
        // May be undefined if never set
        setTrialEnds(data.trialEnds);
      }
    } catch (err) {
      console.error("Premium refresh error:", err);
    }
  };

  // On mount: sync once, then refresh every 5 minutes
  useEffect(() => {
    refreshPremiumStatus();
    const id = setInterval(() => refreshPremiumStatus(), 5 * 60 * 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --------- TRIAL: start 7-day trial via backend ---------
  const startTrial = async () => {
    const email = getCurrentEmail();
    if (!email) {
      alert("Please log in first.");
      return false;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/user/start-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("start-trial error:", data);
        alert("Could not start trial.");
        return false;
      }

      // Backend returns trialEnds and isPremium=true
      if (data.trialEnds) setTrialEnds(data.trialEnds);
      if (typeof data.isPremium === "boolean") setIsPremium(data.isPremium);

      return true;
    } catch (err) {
      console.error("startTrial error:", err);
      alert("Could not start trial.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // --------- STRIPE CHECKOUT (monthly / yearly) ---------
  const startCheckout = async (plan, emailOverride) => {
    const email = emailOverride || getCurrentEmail();

    if (!email) {
      alert("Please log in first.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email }),
      });

      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL", data);
        alert("Failed to start checkout.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to start checkout.");
    } finally {
      setLoading(false);
    }
  };

  // --------- AFTER SUCCESS REDIRECT ---------
  const activatePremium = async () => {
    // After Stripe success page, trust backend + webhook
    await refreshPremiumStatus();
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        trialEnds,
        loading,
        startTrial,
        startCheckout,
        activatePremium,
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
    throw new Error("usePremiumContext must be used inside <PremiumProvider>");
  }
  return ctx;
}

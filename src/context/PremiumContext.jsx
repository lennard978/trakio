// src/context/PremiumContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const PremiumContext = createContext(null);

// Reads email from auth LocalStorage
function getCurrentEmail() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw)?.email || null;
  } catch {
    return null;
  }
}

export function PremiumProvider({ children }) {
  // Local cache while waiting for server
  const [isPremium, setIsPremium] = useState(() => {
    return localStorage.getItem("isPremium") === "true";
  });

  const [trialEnds, setTrialEnds] = useState(() => {
    return localStorage.getItem("trialEnds") || null;
  });

  const [loading, setLoading] = useState(false);

  /* ------------------------------------------------------------
   * Persist state
   * ------------------------------------------------------------ */
  useEffect(() => {
    localStorage.setItem("isPremium", isPremium ? "true" : "false");
  }, [isPremium]);

  useEffect(() => {
    if (trialEnds) {
      localStorage.setItem("trialEnds", trialEnds);
    } else {
      localStorage.removeItem("trialEnds");
    }
  }, [trialEnds]);

  /* ------------------------------------------------------------
   * Trial Helpers
   * ------------------------------------------------------------ */

  const isTrialExpired = () => {
    if (!trialEnds) return false;
    return new Date() > new Date(trialEnds);
  };

  const isTrialActive = () => {
    if (!trialEnds) return false;
    return !isTrialExpired();
  };

  /* ------------------------------------------------------------
   * Sync status from backend
   * ------------------------------------------------------------ */
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

      // Premium from backend
      if (typeof data.isPremium === "boolean") {
        setIsPremium(data.isPremium);

        // Premium overrides trial
        if (data.isPremium) {
          setTrialEnds(null);
        }
      }

      // Trial from backend
      if (data.trialEnds || data.trialEnds === null) {
        setTrialEnds(data.trialEnds);
      }
    } catch (err) {
      console.error("Premium refresh error:", err);
    }
  };

  // Run once on mount, refresh every 5 min
  useEffect(() => {
    refreshPremiumStatus();
    const id = setInterval(refreshPremiumStatus, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  /* ------------------------------------------------------------
   * Start trial (server-controlled)
   * ------------------------------------------------------------ */
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
        alert("Could not start trial.");
        return false;
      }

      if (data.trialEnds) setTrialEnds(data.trialEnds);

      // Some backends set isPremium=true during trial
      if (typeof data.isPremium === "boolean") {
        setIsPremium(data.isPremium);
      }

      return true;
    } catch (err) {
      console.error("startTrial error:", err);
      alert("Could not start trial.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------
   * Stripe Checkout
   * ------------------------------------------------------------ */
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
        alert("Failed to start checkout.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to start checkout.");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------
   * After Stripe success → trust backend → refresh
   * ------------------------------------------------------------ */
  const activatePremium = async () => {
    // Refresh local state based on server
    await refreshPremiumStatus();
  };

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        trialEnds,
        isTrialExpired: isTrialExpired(),
        isTrialActive: isTrialActive(),
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
    throw new Error("usePremiumContext must be inside <PremiumProvider>");
  }
  return ctx;
}

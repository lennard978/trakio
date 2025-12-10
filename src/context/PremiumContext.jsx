// src/context/PremiumContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const { user } = useAuth();
  const email = user?.email;

  const [isPremium, setIsPremium] = useState(() => {
    return localStorage.getItem("isPremium") === "true";
  });

  const [trialEnds, setTrialEnds] = useState(() => {
    return localStorage.getItem("trialEnds") || null;
  });

  const [loading, setLoading] = useState(false);

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

  const isTrialExpired = () => {
    if (!trialEnds) return false;
    return new Date() > new Date(trialEnds);
  };

  const isTrialActive = () => {
    if (!trialEnds) return false;
    return !isTrialExpired();
  };

  const refreshPremiumStatus = async () => {
    if (!email) {
      setIsPremium(false);
      setTrialEnds(null);
      return;
    }

    try {
      const res = await fetch(`/api/user/premium-status?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (typeof data.isPremium === "boolean") {
        setIsPremium(data.isPremium);
        if (data.isPremium) setTrialEnds(null);
      }

      if (data.trialEnds || data.trialEnds === null) {
        setTrialEnds(data.trialEnds);
      }
    } catch (err) {
      console.error("Premium refresh error:", err);
    }
  };

  useEffect(() => {
    refreshPremiumStatus();
    const id = setInterval(refreshPremiumStatus, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, [email]);

  const startTrial = async () => {
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
        alert(data?.error || "Could not start trial.");
        return false;
      }

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

  const cancelTrial = async () => {
    if (!email) return;

    try {
      setLoading(true);
      await fetch("/api/user/cancel-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setTrialEnds(null);
    } catch (err) {
      console.error("Cancel trial error:", err);
    } finally {
      setLoading(false);
    }
  };

  const startCheckout = async (plan, emailOverride) => {
    const checkoutEmail = emailOverride || email;
    if (!checkoutEmail) {
      alert("Please log in first.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email: checkoutEmail }),
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

  const activatePremium = async () => {
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
        cancelTrial,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremiumContext() {
  const ctx = useContext(PremiumContext);
  if (!ctx) {
    throw new Error("usePremiumContext must be used within <PremiumProvider>");
  }
  return ctx;
}

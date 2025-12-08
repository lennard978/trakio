import React, { createContext, useContext, useState, useEffect } from "react";

const PremiumContext = createContext();

export function PremiumProvider({ children }) {
  // Load premium flag from localStorage
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

  useEffect(() => {
    const interval = setInterval(() => refreshPremiumStatus(), 60000);
    return () => clearInterval(interval);
  }, []);


  // Persist premium status
  useEffect(() => {
    localStorage.setItem("isPremium", JSON.stringify(isPremium));
  }, [isPremium]);

  // Persist trial end date
  useEffect(() => {
    if (trialEnds) {
      localStorage.setItem("trialEnds", trialEnds);
    } else {
      localStorage.removeItem("trialEnds");
    }
  }, [trialEnds]);

  // Start 7-day trial
  const startTrial = () => {
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    const iso = expires.toISOString();
    setTrialEnds(iso);
    setIsPremium(true);
    return true;
  };

  // Launch real Stripe checkout
  // replace startCheckout in PremiumContext.jsx
  const startCheckout = async (plan, email) => {
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL", data);
        alert("Failed to start checkout.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to start checkout.");
    }
  };


  // Called AFTER Stripe success page redirect
  const activatePremium = () => {
    setIsPremium(true);
    setTrialEnds(null);
  };

  // Check trial expiration
  useEffect(() => {
    if (!trialEnds) return;

    const now = new Date();
    const exp = new Date(trialEnds);

    if (now > exp) setIsPremium(false);
  }, [trialEnds]);

  const refreshPremiumStatus = async () => {
    const email = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")).email
      : null;

    if (!email) return;

    try {
      const res = await fetch(`/api/user/premium-status?email=${email}`);
      const data = await res.json();

      if (data && typeof data.isPremium === "boolean") {
        setIsPremium(data.isPremium);
      }
    } catch (err) {
      console.error("Premium refresh error:", err);
    }
  };


  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        trialEnds,
        startTrial,
        startCheckout,
        activatePremium,
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

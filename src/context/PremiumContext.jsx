import React, { createContext, useContext, useState, useEffect } from "react";

const PremiumContext = createContext();

export function PremiumProvider({ children }) {
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

  // 🔁 periodically refresh from backend
  useEffect(() => {
    refreshPremiumStatus(); // initial
    const interval = setInterval(() => refreshPremiumStatus(), 60000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // persist flags
  useEffect(() => {
    localStorage.setItem("isPremium", JSON.stringify(isPremium));
  }, [isPremium]);

  useEffect(() => {
    if (trialEnds) localStorage.setItem("trialEnds", trialEnds);
    else localStorage.removeItem("trialEnds");
  }, [trialEnds]);

  // 7-day TRIAL via backend
  const startTrial = async () => {
    const userRaw = localStorage.getItem("user");
    const email = userRaw ? JSON.parse(userRaw).email : null;

    if (!email) {
      alert("Please log in first.");
      return false;
    }

    try {
      const res = await fetch("/api/user/start-trial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Could not start trial.");
        return false;
      }

      setIsPremium(!!data.isPremium);
      if (data.trialEnds) setTrialEnds(data.trialEnds);

      return true;
    } catch (err) {
      console.error("Trial start error:", err);
      alert("Could not start trial.");
      return false;
    }
  };

  // Stripe checkout
  const startCheckout = async (plan, email) => {
    const userEmail = email || (() => {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw).email : null;
    })();

    if (!userEmail) {
      alert("Please log in first.");
      return;
    }

    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, email: userEmail }),
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

  // Called from /success page if you still need it
  const activatePremium = () => {
    setIsPremium(true);
    setTrialEnds(null);
  };

  // local-only expiry (offline safety)
  useEffect(() => {
    if (!trialEnds) return;

    const now = new Date();
    const exp = new Date(trialEnds);
    if (now > exp) setIsPremium(false);
  }, [trialEnds]);

  // 🔁 sync from backend (subscription + trial)
  const refreshPremiumStatus = async () => {
    const raw = localStorage.getItem("user");
    const email = raw ? JSON.parse(raw).email : null;
    if (!email) return;

    try {
      const res = await fetch(`/api/user/premium-status?email=${encodeURIComponent(email)}`);
      const data = await res.json();

      if (data && typeof data.isPremium === "boolean") {
        setIsPremium(data.isPremium);
        if ("trialEnds" in data) {
          setTrialEnds(data.trialEnds || null);
        }
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

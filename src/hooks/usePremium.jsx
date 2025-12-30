import { useState, useEffect } from "react";
import { isOnline } from "../utils/mainDB";

export function usePremium() {
  const [status, setStatus] = useState({
    isPremium: false,
    trialEndDate: null,
    hasActiveTrial: false,
    trialExpired: false,
    noTrial: false,
    trialDaysLeft: 0,
  });

  const [loading, setLoading] = useState(false); // add loading state

  useEffect(() => {
    const fetchStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        if (isOnline()) {
          const res = await fetch("/api/user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: "get-status" }),
          });

          const data = await res.json();

          if (res.ok) {
            localStorage.setItem("premium_status", JSON.stringify(data));
            updateState(data);
          }
        } else {
          const cached = localStorage.getItem("premium_status");
          if (cached) {
            updateState(JSON.parse(cached));
          }
        }
      } catch (err) {
        console.error("Failed to fetch premium status", err);
      }
    };

    const updateState = (data) => {
      const now = Date.now() / 1000;
      const trialEnds = data.trialEnds ?? 0;
      const trialDaysLeft = Math.max(0, Math.ceil((trialEnds - now) / 86400));

      setStatus({
        isPremium: data.status === "active" || data.status === "trialing",
        trialEndDate: data.trialEnds,
        hasActiveTrial: data.status === "trialing",
        trialExpired: data.status === "canceled" && !!data.trialEnds,
        noTrial: !data.trialEnds,
        trialDaysLeft,
      });
    };

    fetchStatus();
  }, []);

  const startCheckout = async (plan) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: "checkout", plan }), // ✅ FIXED
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error("Checkout failed");
      }

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Failed to start checkout. Please try again.");
    }
  };


  return {
    ...status,
    loading,
    startCheckout,
  };
}

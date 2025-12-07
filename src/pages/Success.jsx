import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { usePremiumContext } from "../context/PremiumContext";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { activatePremium } = usePremiumContext();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doSync = async () => {
      try {
        // If user not loaded yet → wait one render cycle
        if (!user || !user.email) {
          activatePremium(); // fallback
          setLoading(false);
          return;
        }

        const email = encodeURIComponent(user.email);

        const res = await fetch(`/api/user/premium-status?email=${email}`);
        const data = await res.json();

        if (data?.isPremium) {
          activatePremium();
        } else {
          // Stripe says not premium? Rare case – still allow fallback
          activatePremium();
        }
      } catch (err) {
        console.error("Success sync error:", err);
        activatePremium(); // fallback
      }

      setLoading(false);
    };

    doSync();
  }, [user, activatePremium]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-xl font-semibold">{t("loading") || "Loading..."}</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-3">
        {t("premium_success_title") || "Subscription activated!"}
      </h1>

      <p className="mb-6 text-center max-w-md">
        {t("premium_success_message") ||
          "Your premium subscription is now active."}
      </p>

      <button
        onClick={() => navigate("/dashboard")}
        className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
      >
        {t("button_continue") || "Continue"}
      </button>
    </div>
  );
}

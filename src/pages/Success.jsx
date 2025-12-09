// src/pages/Success.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePremiumContext } from "../context/PremiumContext";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function Success() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activatePremium } = usePremiumContext();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doSync = async () => {
      try {
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
          activatePremium();
        }
      } catch (err) {
        console.error("Success sync error:", err);
        activatePremium();
      }

      setLoading(false);
    };

    doSync();
  }, [user, activatePremium]);

  if (loading) {
    return (
      <div className="flex justify-center mt-16 px-4">
        <div className="max-w-md w-full p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 text-center">
          <h1 className="text-xl font-semibold">
            {t("loading") || "Loading..."}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-16 px-4">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 text-center">
        <h1 className="text-2xl font-bold mb-3">
          {t("premium_success_title") || "Subscription activated!"}
        </h1>

        <p className="mb-6 text-sm text-gray-700 dark:text-gray-200">
          {t("premium_success_message") ||
            "Your Premium subscription is now active and synced to your account."}
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition active:scale-95"
        >
          {t("button_continue") || "Continue"}
        </button>
      </div>
    </div>
  );
}

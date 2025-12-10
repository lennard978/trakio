// src/pages/Success.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePremiumContext } from "../context/PremiumContext";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useToast } from "../context/ToastContext";

export default function Success() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activatePremium } = usePremiumContext();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncPremium = async () => {
      try {
        if (!user?.email) {
          showToast(t("premium_sync_failed"), "error");
          setLoading(false);
          return;
        }

        const email = encodeURIComponent(user.email);
        const res = await fetch(`/api/user/premium-status?email=${email}`);
        const data = await res.json();

        if (data?.isPremium) {
          activatePremium();
          showToast(t("premium_success_message"), "success");
        } else {
          showToast(t("premium_sync_failed"), "error");
        }
      } catch (err) {
        console.error("Success sync error:", err);
        showToast(t("premium_sync_failed"), "error");
      }

      setLoading(false);
    };

    syncPremium();
  }, [user, activatePremium, showToast, t]);

  if (loading) {
    return (
      <div className="flex justify-center mt-16 px-4">
        <div className="max-w-md w-full p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 text-center">
          <h1 className="text-xl font-semibold">{t("loading")}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-16 px-4">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 text-center">
        <h1 className="text-2xl font-bold mb-3">
          {t("premium_success_title")}
        </h1>

        <p className="mb-6 text-sm text-gray-700 dark:text-gray-200">
          {t("premium_success_message")}
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition active:scale-95"
        >
          {t("button_continue")}
        </button>
      </div>
    </div>
  );
}

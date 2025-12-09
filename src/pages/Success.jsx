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
    activatePremium();
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <h1 className="text-xl font-semibold">{t("loading")}</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full p-8 bg-white dark:bg-gray-900 
      rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 text-center">

        <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-gray-100">
          {t("premium_success_title")}
        </h1>

        <p className="mb-6 text-gray-700 dark:text-gray-300">
          {t("premium_success_message")}
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="px-6 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
        >
          {t("button_continue")}
        </button>
      </div>
    </div>
  );
}

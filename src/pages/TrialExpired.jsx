// src/pages/TrialExpired.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePremium } from "../hooks/usePremium";

export default function TrialExpired() {
  const { t } = useTranslation();
  const premium = usePremium();
  const navigate = useNavigate();

  return (
    <div className="flex justify-center mt-16 px-4">
      <div className="
        max-w-md w-full p-8 rounded-xl shadow-lg
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
        text-center
      ">
        <h1 className="text-2xl font-semibold mb-4">
          {t("trial_expired_title")}
        </h1>

        <p className="mb-6 leading-relaxed text-sm text-gray-700 dark:text-gray-200">
          {t("trial_expired_message")}
        </p>

        <button
          disabled={premium.loading}
          onClick={() => navigate("/premium")}
          className="
            w-full py-2 mb-4
            bg-blue-600 text-white font-medium rounded-md
            hover:bg-blue-700 transition active:scale-95
            disabled:opacity-50
          "
        >
          {t("trial_expired_button")}
        </button>

        <Link
          to="/dashboard"
          className="text-blue-600 dark:text-blue-300 hover:underline text-sm"
        >
          Continue in read-only mode
        </Link>
      </div>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function TrialExpired() {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center mt-20 px-4">
      <div className="max-w-md w-full p-8 rounded-2xl shadow-xl 
        bg-gradient-to-br from-yellow-100 to-orange-200 text-gray-900 
        dark:from-yellow-600 dark:to-orange-700 dark:text-white text-center">

        <h1 className="text-2xl font-semibold mb-4">{t("trial_expired_title")}</h1>

        <p className="mb-6 leading-relaxed">{t("trial_expired_message")}</p>

        <button
          onClick={() => alert("Stripe integration coming soon.")}
          className="w-full py-2 mb-4 bg-white text-yellow-700 font-medium rounded-md hover:bg-gray-100 
            transition dark:bg-gray-900 dark:text-white dark:border dark:border-white dark:hover:bg-gray-800"
        >
          {t("trial_expired_button")}
        </button>

        <Link
          to="/settings"
          className="text-blue-600 dark:text-blue-300 hover:underline"
        >
          {t("button_settings")}
        </Link>
      </div>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function TrialExpired() {
  const { t } = useTranslation();

  return (
    <div className="flex justify-center mt-20 px-4">
      <div className="max-w-md w-full p-8 rounded-xl shadow-lg 
      bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center">

        <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t("trial_expired_title")}
        </h1>

        <p className="mb-6 text-gray-700 dark:text-gray-300">
          {t("trial_expired_message")}
        </p>

        <button
          className="w-full py-2 mb-4 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition"
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

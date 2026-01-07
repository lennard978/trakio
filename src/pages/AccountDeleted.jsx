// src/pages/AccountDeleted.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function AccountDeleted() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          {t("account_deleted_title")}
        </h1>

        <p className="text-gray-600 dark:text-gray-300">
          {t("account_deleted_message")}
        </p>

        <p className="text-gray-600 dark:text-gray-300">
          {t("account_deleted_subscription_note")}
        </p>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("account_deleted_support")}{" "}
          <a
            href="mailto:support@trakio.de"
            className="underline hover:text-gray-700 dark:hover:text-gray-200"
          >
            support@trakio.de
          </a>
        </p>

        <Link
          to="/"
          className="
            inline-block mt-4 px-4 py-2
            rounded bg-orange-600 text-white
            hover:bg-orange-700 transition
            active:scale-95
          "
        >
          {t("account_deleted_back_home")}
        </Link>
      </div>
    </div>
  );
}

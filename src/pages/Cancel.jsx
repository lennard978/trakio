import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";

export default function Cancel() {
  const { showToast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    showToast(t("cancel_message"), "error");
  }, [showToast, t]);

  return (
    <div className="flex justify-center mt-20 px-4">
      <div className="max-w-md w-full p-8 rounded-2xl shadow-xl 
        bg-gradient-to-br from-red-100 to-pink-200 text-gray-900 
        dark:from-red-600 dark:to-pink-700 dark:text-white text-center">

        <h1 className="text-2xl font-semibold mb-4">{t("cancel_title")}</h1>

        <p className="mb-6">{t("cancel_message")}</p>

        <Link
          to="/settings"
          className="inline-block px-6 py-2 bg-white text-red-600 font-medium rounded-md hover:bg-gray-100 
            transition dark:bg-gray-900 dark:text-white dark:border dark:border-white dark:hover:bg-gray-800"
        >
          {t("cancel_back")}
        </Link>
      </div>
    </div>
  );
}

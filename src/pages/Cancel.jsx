// src/pages/Cancel.jsx
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";

export default function Cancel() {
  const { showToast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    showToast(t("cancel_message"), "error");
  }, []);

  return (
    <div className="flex justify-center mt-20 px-4">
      <div className="max-w-md w-full p-8 rounded-xl shadow-lg 
      bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center">

        <h1 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {t("cancel_title")}
        </h1>

        <p className="mb-6 text-gray-700 dark:text-gray-300">{t("cancel_message")}</p>

        <Link
          to="/settings"
          className="inline-block px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
        >
          {t("cancel_back")}
        </Link>
      </div>
    </div>
  );
}

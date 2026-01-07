// src/pages/Cancel.jsx
import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useTranslation } from "react-i18next";

export default function Cancel() {
  const { showToast } = useToast();
  const { t } = useTranslation();
  const shownRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate toasts in StrictMode / re-mounts
    if (shownRef.current) return;
    shownRef.current = true;

    showToast(t("cancel_message"), "error");
  }, [t, showToast]);

  return (
    <div className="flex justify-center mt-16 px-4">
      <div className="max-w-md w-full p-8 rounded-xl shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center">
        <h1 className="text-2xl font-semibold mb-4">
          {t("cancel_title")}
        </h1>

        <p className="mb-6 text-sm text-gray-700 dark:text-gray-200">
          {t("cancel_message")}
        </p>

        <Link
          to="/settings"
          className="
            inline-block px-6 py-2
            bg-blue-600 text-white font-medium
            rounded-md hover:bg-blue-700
            transition active:scale-95
          "
        >
          {t("cancel_back")}
        </Link>
      </div>
    </div>
  );
}

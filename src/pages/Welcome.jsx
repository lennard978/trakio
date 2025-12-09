// src/pages/Welcome.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function Welcome() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // If already logged in → simple card with link
  if (user) {
    return (
      <div className="flex justify-center mt-16 px-4">
        <div className="max-w-md w-full p-8 rounded-xl shadow-lg 
        bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-center">

          <p className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-100">
            {t("toast_login_success")}
          </p>

          <Link
            to="/dashboard"
            className="inline-block px-5 py-2 mt-2 rounded-md 
            bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {t("success_back")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-16 px-4">
      <div className="max-w-lg w-full p-10 rounded-xl 
      bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-800">

        <h1 className="text-3xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
          {t("welcome_title")}
        </h1>

        <p className="text-center text-base text-gray-700 dark:text-gray-300 mb-8">
          {t("welcome_message")}
        </p>

        <div className="flex justify-center space-x-4">
          <Link
            to="/login"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition"
          >
            {t("button_sign_in")}
          </Link>

          <Link
            to="/signup"
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 
            text-gray-900 dark:text-gray-100 font-medium rounded-md 
            hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {t("button_sign_up")}
          </Link>
        </div>
      </div>
    </div>
  );
}

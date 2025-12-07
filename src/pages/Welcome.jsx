import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

export default function Welcome() {
  const { user } = useAuth();
  const { t } = useTranslation();

  //
  // LOGGED IN VIEW
  //
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#0d1117]">
        <div className="max-w-md w-full p-8 rounded-2xl shadow-xl
        bg-gradient-to-br from-blue-100 to-indigo-200 text-gray-900
        dark:from-blue-600 dark:to-indigo-700 dark:text-white text-center">

          <p className="mb-4 text-lg font-semibold">
            {t("toast_login_success")}
          </p>

          <Link
            to="/dashboard"
            className="inline-block px-5 py-2 mt-2 bg-white text-blue-600 font-medium rounded-md
            hover:bg-gray-100 transition dark:bg-gray-900 dark:text-white dark:border dark:border-white
            dark:hover:bg-gray-800"
          >
            {t("success_back")}
          </Link>
        </div>
      </div>
    );
  }

  //
  // GUEST WELCOME VIEW
  //
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-[#0d1117]">
      <div className="max-w-md w-full p-10 rounded-2xl shadow-xl
      bg-gradient-to-br from-blue-600 to-indigo-600 text-white">

        <h1 className="text-2xl font-bold mb-4 text-center tracking-tight">
          {t("welcome_title")}
        </h1>

        <p className="text-center text-base opacity-90 mb-8 leading-relaxed">
          {t("welcome_message")}
        </p>

        <div className="flex justify-center space-x-4">
          <Link
            to="/login"
            className="px-6 py-2 bg-white text-blue-600 font-medium rounded-md hover:bg-gray-100 transition"
          >
            {t("button_sign_in")}
          </Link>

          <Link
            to="/signup"
            className="px-6 py-2 border border-white text-white font-medium rounded-md
            hover:bg-white hover:text-blue-600 transition"
          >
            {t("button_sign_up")}
          </Link>
        </div>
      </div>
    </div>
  );
}

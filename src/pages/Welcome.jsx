// src/pages/Welcome.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

// UI
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

export default function Welcome() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // LOGGED-IN VIEW
  if (user) {
    return (
      <div className="flex justify-center mt-12 px-4 pb-24">
        <div className="max-w-md w-full">
          <Card className="text-center">
            <p className="mb-2 text-lg font-semibold text-orange-600">
              {t("toast_login_success")}
            </p>

            <Link to="/dashboard" className="inline-block w-full">
              <SettingButton variant="primary">
                {t("success_back")}
              </SettingButton>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // PUBLIC VIEW
  return (
    <div className="flex justify-center mt-12 px-4 pb-24">
      <div className="max-w-lg w-full">
        <Card>
          <h1 className="text-3xl font-bold mb-3 text-center tracking-tight">
            {t("welcome_title")}
          </h1>

          <p className="text-center text-base text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {t("welcome_message")}
          </p>

          {/* Premium-style value line */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
            {t("welcome_value_proposition") ||
              "Track, analyze, and optimize all your subscriptions in one place."}
          </p>

          <div className="flex justify-center gap-3">
            <Link to="/login">
              <SettingButton
                variant="primary"
                className="px-6 bg-orange-500 hover:bg-orange-600 focus:ring-orange-500"
              >
                {t("button_sign_in")}
              </SettingButton>
            </Link>

            <Link to="/signup">
              <SettingButton
                variant="neutral"
                className="px-6 border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                {t("button_sign_up")}
              </SettingButton>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

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

  // Logged-in state
  if (user) {
    return (
      <div className="flex justify-center mt-12 px-4 pb-24">
        <div className="max-w-md w-full">
          <Card className="text-center">
            <p className="mb-4 text-lg font-semibold">
              {t("toast_login_success")}
            </p>

            <SettingButton variant="primary" onClick={() => { }}>
              <Link to="/dashboard">{t("success_back")}</Link>
            </SettingButton>
          </Card>
        </div>
      </div>
    );
  }

  // Public welcome
  return (
    <div className="flex justify-center mt-12 px-4 pb-24">
      <div className="max-w-lg w-full">
        <Card>
          <h1 className="text-3xl font-bold mb-4 text-center tracking-tight">
            {t("welcome_title")}
          </h1>

          <p className="text-center text-base text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {t("welcome_message")}
          </p>

          <div className="flex justify-center gap-3">
            <SettingButton
              variant="primary"
              className="w-auto px-6"
              onClick={() => { }}
            >
              <Link to="/login">{t("button_sign_in")}</Link>
            </SettingButton>

            <SettingButton
              variant="neutral"
              className="w-auto px-6"
              onClick={() => { }}
            >
              <Link to="/signup">{t("button_sign_up")}</Link>
            </SettingButton>
          </div>
        </Card>
      </div>
    </div>
  );
}

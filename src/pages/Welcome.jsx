// src/pages/Welcome.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

// UI
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

export default function Welcome() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // -------------------------------------------------------
  // LOGGED-IN VIEW
  // -------------------------------------------------------
  if (user) {
    return (
      <div className="flex justify-center mt-12 px-4 pb-24">
        <div className="max-w-md w-full">
          <Card className="text-center">
            <p className="mb-4 text-lg font-semibold">
              {t("toast_login_success")}
            </p>

            {/* FIXED BUTTON (wrap with Link) */}
            <Link to="/dashboard" className="inline-block w-full">
              <SettingButton
                variant="primary"
                onClick={() => navigate("/dashboard")}
              >
                {t("success_back")}
              </SettingButton>

            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------
  // PUBLIC VIEW
  // -------------------------------------------------------
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

            {/* FIX: Wrap SettingButton with Link */}
            <Link to="/login" className="inline-block">
              <SettingButton
                variant="primary"
                className="w-auto px-6"
              >
                {t("button_sign_in")}
              </SettingButton>
            </Link>

            <Link to="/signup" className="inline-block">
              <SettingButton
                variant="neutral"
                className="w-auto px-6"
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

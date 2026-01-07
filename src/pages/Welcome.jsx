// src/pages/Welcome.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

// UI
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

/**
 * Welcome
 * - Public landing page for unauthenticated users
 * - Success confirmation for authenticated users
 */
export default function Welcome() {
  const { user } = useAuth();
  const { t } = useTranslation();

  // LOGGED-IN VIEW
  if (user) {
    return (
      <main className="flex justify-center mt-12 px-4 pb-24">
        <section className="max-w-md w-full">
          <Card className="text-center space-y-3">
            <p className="text-lg font-semibold text-orange-600">
              {t("welcome_back", {
                defaultValue: "Welcome back! You’re logged in.",
              })}
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("welcome_back_hint", {
                defaultValue: "You can continue managing your subscriptions.",
              })}
            </p>

            <Link to="/dashboard" className="inline-block w-full pt-2">
              <SettingButton variant="primary">
                {t("success_back", { defaultValue: "Go to dashboard" })}
              </SettingButton>
            </Link>
          </Card>
        </section>
      </main>
    );
  }

  // PUBLIC VIEW
  return (
    <main className="flex justify-center mt-12 px-4 pb-24">
      <section className="max-w-lg w-full">
        <Card className="space-y-6">
          <header className="text-center space-y-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {t("welcome_title")}
            </h1>

            <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              {t("welcome_message")}
            </p>
          </header>

          {/* Value proposition */}
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            {t("welcome_value_proposition", {
              defaultValue:
                "Track, analyze, and optimize all your subscriptions in one place.",
            })}
          </p>

          {/* Trust signals */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            {t("welcome_trust_note", {
              defaultValue:
                "No credit card required · Privacy-first · Built for EU users",
            })}
          </p>

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-2">
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
      </section>
    </main>
  );
}

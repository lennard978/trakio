// src/pages/TrialExpired.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePremium } from "../hooks/usePremium";

// UI
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

/**
 * TrialExpired
 * - Shown when free trial has ended
 * - Guides user to upgrade or continue in read-only mode
 */
export default function TrialExpired() {
  const { t } = useTranslation();
  const premium = usePremium();
  const navigate = useNavigate();

  return (
    <main className="flex justify-center mt-16 px-4">
      <section
        className="max-w-md w-full"
        aria-labelledby="trial-expired-title"
      >
        <Card className="p-8 text-center space-y-6">
          <header className="space-y-3">
            <h1
              id="trial-expired-title"
              className="text-2xl font-semibold"
            >
              {t("trial_expired_title")}
            </h1>

            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
              {t("trial_expired_message")}
            </p>
          </header>

          {/* Primary CTA */}
          <SettingButton
            variant="primary"
            disabled={premium.loading}
            onClick={() => navigate("/premium")}
            className="w-full"
          >
            {t("trial_expired_button")}
          </SettingButton>

          {/* Secondary action */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("trial_expired_readonly_hint", {
              defaultValue:
                "You can continue using the app in read-only mode.",
            })}
          </p>

          <Link
            to="/dashboard"
            className="text-sm text-blue-600 dark:text-blue-300 hover:underline"
          >
            {t("trial_expired_continue_read_only")}
          </Link>
        </Card>
      </section>
    </main>
  );
}

// src/pages/PremiumPage.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useLocation, useNavigate } from "react-router-dom";
import { usePremiumContext } from "../context/PremiumContext";
import { useAuth } from "../hooks/useAuth";

// Reusable UI
import Card from "../components/ui/Card";
import SettingButton from "../components/ui/SettingButton";

export default function PremiumPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const premium = usePremiumContext();
  const { user } = useAuth();

  const reason = new URLSearchParams(location.search).get("reason");

  const trialActive = premium.trialEnds !== null;
  const isPaidPremium = premium.isPremium && !trialActive;

  const requireLogin = () => {
    if (!user?.email) {
      alert("Please log in first.");
      navigate("/login");
      return false;
    }
    return true;
  };

  const handleCheckout = (plan) => {
    if (!requireLogin()) return;
    premium.startCheckout(plan, user.email);
  };

  const handleStartTrial = () => {
    if (!requireLogin()) return;

    premium.startTrial();
    alert(t("premium_trial_started"));
    navigate("/dashboard");
  };

  const features = [
    t("premium_feature_unlimited_subs"),
    t("premium_feature_advanced_intervals"),
    t("premium_feature_multi_currency"),
    t("premium_feature_cloud_backup"),
    t("premium_feature_sync"),
    t("premium_feature_priority_support"),
  ];

  return (
    <div className="w-full px-4 py-6 sm:py-10 flex justify-center pb-24">
      <Card className="max-w-3xl w-full">
        {/* HEADER */}
        <div className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {t("premium_title")}
          </h1>

          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            {t("premium_subtitle")}
          </p>

          {reason === "limit" && (
            <p className="mt-2 text-xs sm:text-sm text-blue-600 dark:text-blue-300">
              {t("premium_reason_limit")}
            </p>
          )}

          {reason === "currency" && (
            <p className="mt-2 text-xs sm:text-sm text-blue-600 dark:text-blue-300">
              {t("premium_reason_currency")}
            </p>
          )}
        </div>

        {/* FEATURES */}
        <Card className="bg-gray-50/90 dark:bg-gray-900/70 border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 text-center">
            {t("premium_whats_included")}
          </h2>

          <ul className="space-y-2 text-sm sm:text-base max-w-md mx-auto text-gray-700 dark:text-gray-200">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* PAID PREMIUM INFO */}
        {isPaidPremium && (
          <div className="text-center text-green-600 dark:text-green-400 font-semibold mb-6">
            {t("premium_active_message") ||
              "Your Premium subscription is active."}
          </div>
        )}

        {/* PRICING CARDS (only if not paid) */}
        {!isPaidPremium && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {/* MONTHLY */}
            <Card className="bg-gray-50/90 dark:bg-gray-900/70 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold mb-1 text-center">
                {t("premium_monthly")}
              </h3>
              <div className="text-3xl sm:text-4xl font-bold mb-1 text-center">
                €4
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-center text-xs sm:text-sm mb-3">
                {t("premium_month")}
              </div>

              <SettingButton
                variant="success"
                onClick={() => handleCheckout("monthly")}
                className="mt-2"
              >
                {t("premium_button_upgrade")}
              </SettingButton>
            </Card>

            {/* YEARLY */}
            <Card className="bg-gray-50/90 dark:bg-gray-900/70 border-gray-200 dark:border-gray-700">
              <h3 className="text-lg sm:text-xl font-semibold mb-1 text-center">
                {t("premium_yearly")}
              </h3>
              <div className="text-3xl sm:text-4xl font-bold mb-1 text-center">
                €40
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-center text-xs sm:text-sm mb-3">
                {t("premium_year")}
              </div>

              <SettingButton
                variant="success"
                onClick={() => handleCheckout("yearly")}
                className="mt-2"
              >
                {t("premium_button_upgrade")}
              </SettingButton>
            </Card>
          </div>
        )}

        {/* TRIAL (if not paid) */}
        {!isPaidPremium && (
          <>
            <Card className="bg-gray-50/90 dark:bg-gray-900/70 border-gray-200 dark:border-gray-700 mb-3">
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 text-center">
                “{t("premium_testimonial")}”
              </p>
            </Card>

            <p className="mt-1 mb-3 text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center">
              {t("premium_7day_trial")}
            </p>

            {!trialActive ? (
              <button
                onClick={handleStartTrial}
                className="block mx-auto text-xs sm:text-sm underline text-blue-600 dark:text-blue-300"
              >
                {t("premium_start_trial")}
              </button>
            ) : (
              <p className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                {t("premium_trial_active_until")}{" "}
                {new Date(premium.trialEnds).toLocaleDateString()}
              </p>
            )}
          </>
        )}

        {/* BACK BUTTON */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate(-1)}
            className="text-[11px] sm:text-xs text-gray-600 dark:text-gray-300 underline"
          >
            {t("button_back") || "Back"}
          </button>
        </div>
      </Card>
    </div>
  );
}

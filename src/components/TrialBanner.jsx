// src/components/TrialBanner.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { usePremium } from "../hooks/usePremium";

export default function TrialBanner() {
  const { t } = useTranslation();
  const {
    isPremium,
    hasActiveTrial,
    trialDaysLeft,
  } = usePremium();

  // Hide banner for:
  // - paid premium
  // - no trial
  // - expired trial
  if (isPremium || !hasActiveTrial || trialDaysLeft == null) return null;

  return (
    <div
      className="
        mb-4 p-3 rounded-md bg-blue-100 dark:bg-blue-900
        text-blue-800 dark:text-blue-100 border border-blue-300
        dark:border-blue-700 shadow animate-slide-top text-sm text-center
      "
    >
      {trialDaysLeft === 1
        ? t("trial_banner_one_day")
        : t("trial_banner_days_left", { count: trialDaysLeft })}
    </div>
  );
}

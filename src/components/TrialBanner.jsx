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

  if (isPremium || !hasActiveTrial || trialDaysLeft == null) return null;

  const urgent = trialDaysLeft <= 2;

  return (
    <div
      className={`
        mb-4 p-3 rounded-md
        ${urgent
          ? "bg-orange-100 dark:bg-orange-900/40 border-orange-400 text-orange-800 dark:text-orange-200 animate-pulse-soft"
          : "bg-orange-50 dark:bg-orange-900/20 border-orange-300 text-orange-700 dark:text-orange-200"
        }
        border shadow text-sm text-center
      `}
    >
      {trialDaysLeft === 1
        ? t("trial_banner_one_day")
        : t("trial_banner_days_left", { count: trialDaysLeft })}
    </div>
  );
}

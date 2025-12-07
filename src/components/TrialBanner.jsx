import React from "react";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "react-i18next";

function getTrialDaysLeft(trialStart) {
  if (!trialStart) return 0;
  const start = new Date(trialStart);
  const now = new Date();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  const daysLeft = 7 - diff;
  return daysLeft > 0 ? daysLeft : 0;
}

export default function TrialBanner() {
  const { trialStart, isTrialExpired } = useAuth();
  const { t } = useTranslation();

  if (!trialStart || isTrialExpired) return null;

  const daysLeft = getTrialDaysLeft(trialStart);

  return (
    <div className="mb-4 p-3 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border border-blue-300 dark:border-blue-700 shadow animate-slide-top text-sm text-center">
      {daysLeft === 1
        ? t("trial_banner_one_day")
        : t("trial_banner_days_left", { count: daysLeft })}
    </div>
  );
}

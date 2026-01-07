import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { usePremium } from "../hooks/usePremium";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function TrialBanner() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isPremium, hasActiveTrial, trialDaysLeft } = usePremium();

  if (isPremium || !hasActiveTrial || trialDaysLeft == null) return null;

  const urgent = trialDaysLeft <= 2;

  const message =
    trialDaysLeft === 1
      ? t("trial_banner_one_day", "Your trial ends in 1 day.")
      : t("trial_banner_days_left", { count: trialDaysLeft, defaultValue: `Your trial ends in ${trialDaysLeft} days.` });

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        mb-4 px-4 py-3 rounded-xl border text-sm text-center shadow-sm backdrop-blur-md
        ${urgent
          ? "bg-orange-100 dark:bg-orange-900/40 border-orange-400 text-orange-800 dark:text-orange-200 animate-pulse"
          : "bg-orange-50 dark:bg-orange-900/20 border-orange-300 text-orange-700 dark:text-orange-200"
        }
      `}
    >
      <div className="flex items-center justify-center gap-2">
        <span aria-hidden="true">⚠️</span>
        <span>{message}</span>
        <button
          onClick={() => navigate("/premium")}
          className="ml-2 px-3 py-1 rounded-lg text-xs font-medium bg-orange-600 text-white hover:bg-orange-700 transition"
        >
          {t("upgrade_now") || "Upgrade Now"}
        </button>

      </div>
    </motion.div>
  );
}

TrialBanner.propTypes = {
  isPremium: PropTypes.bool,
  hasActiveTrial: PropTypes.bool,
  trialDaysLeft: PropTypes.number,
};

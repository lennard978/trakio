import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrency } from "../../context/CurrencyContext";
import { usePremium } from "../../hooks/usePremium";
import { useTranslation, Trans } from "react-i18next";

export default function EmptyDashboardState() {
  const { currency } = useCurrency();
  const { isPremium } = usePremium();
  const { t } = useTranslation();

  return (
    <motion.div
      role="region"
      aria-label={t("empty_dashboard_label") || "Empty Dashboard"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-12 mb-8 text-center px-4"
    >
      {/* Title */}
      <h1 className="text-3xl font-bold tracking-tight mb-3 text-gray-900 dark:text-white">
        {t("insights_no_subscriptions", "No subscriptions yet")}
      </h1>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
        <Trans
          i18nKey="welcome_message"
          values={{ currency }}
          components={{ 1: <strong /> }}
          defaultValue={`Start tracking your subscriptions and expenses in ${currency}.`}
        />
      </p>

      {/* CTA */}
      <Link to="/add" aria-label={t("add_first") || "Add your first subscription"}>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="
            relative inline-flex items-center justify-center gap-2
            px-7 py-4 rounded-2xl
            bg-orange-500 hover:bg-orange-600
            text-white font-semibold text-base
            shadow-lg shadow-orange-500/30
            transition-all duration-200
          "
        >
          {/* Soft glow animation */}
          <span
            className="
              absolute inset-0 rounded-2xl
              bg-orange-400 opacity-20 blur-xl
              animate-pulse
            "
          />
          <span className="relative text-xl leading-none">＋</span>
          <span className="relative">{t("add_first", "Add your first subscription")}</span>
        </motion.button>
      </Link>

      {/* Premium teaser */}
      {!isPremium && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-xs text-orange-600 dark:text-orange-400"
        >
          {t("premium_unlock", "Unlock more with Premium")}
        </motion.div>
      )}

      {/* Feature bullets */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 space-y-4 text-left max-w-sm mx-auto"
      >
        <Feature icon="👁️" text={t("track", "Track all subscriptions easily")} />
        <Feature icon="🔔" text={t("get", "Get timely reminders")} />
        <Feature icon="📈" text={t("analyze", "Analyze your spending trends")} />
      </motion.div>
    </motion.div>
  );
}

/* ------------------ Subcomponent ------------------ */
function Feature({ icon, text }) {
  return (
    <div
      className="flex items-center gap-3 text-gray-700 dark:text-gray-300"
      role="listitem"
    >
      <div
        className="
          flex items-center justify-center
          w-9 h-9 rounded-full
          bg-orange-100 dark:bg-orange-900/30
          text-orange-600 dark:text-orange-400
        "
        aria-hidden="true"
      >
        {icon}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}

Feature.propTypes = {
  icon: PropTypes.node.isRequired,
  text: PropTypes.string.isRequired,
};

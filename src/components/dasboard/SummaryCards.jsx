import React from "react";
import { useTranslation } from "react-i18next";

export default function SummaryCards({ currency, totalMonthly, annualCost, monthlyChange }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 mt-2 mb-4">
      {/* Monthly Total */}
      <div
        className="
          p-5 rounded-2xl relative
          bg-white/90 dark:bg-black/30
          border border-gray-300/60 dark:border-white/10
          backdrop-blur-xl
          shadow-[0_8px_25px_rgba(0,0,0,0.08)]
          dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)]
          transition-all
        "
        title={t("change_since_last_month")}
      >
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("dashboard_total_monthly")}
        </div>
        <div className="text-2xl font-bold tabular-nums mt-1 text-gray-900 dark:text-white">
          {currency} {totalMonthly.toFixed(2)}
        </div>
        {typeof monthlyChange === "number" && (
          <div
            className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-full ${monthlyChange >= 0
              ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"
              }`}
          >
            {monthlyChange >= 0 ? "+" : ""}
            {monthlyChange.toFixed(1)}%
          </div>
        )}
      </div>

      {/* Annual Total */}
      <div
        className="
          p-5 rounded-2xl
          bg-white/90 dark:bg-black/30
          border border-gray-300/60 dark:border-white/10
          backdrop-blur-xl
          shadow-[0_8px_25px_rgba(0,0,0,0.08)]
          dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)]
          transition-all
        "
        title={t("tooltip_annual_estimate")}
      >
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {t("dashboard_total_annual")}
        </div>
        <div className="text-2xl font-bold tabular-nums mt-1 text-gray-900 dark:text-white">
          {currency} {annualCost.toFixed(2)}
        </div>
      </div>
    </div>
  );
}

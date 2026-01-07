import React, { useEffect, useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { usePremium } from "../hooks/usePremium";
import { useTranslation } from "react-i18next";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { useToast } from "../context/ToastContext";
import { getCurrentMonthSpending } from "../utils/budget";

export default function MonthlyBudget({
  subscriptions,
  currency,
  rates,
  convert,
}) {
  const { t } = useTranslation();
  const premium = usePremium();
  const { showToast } = useToast();

  const [budget, setBudget] = useState(() => {
    const v = localStorage.getItem("monthly_budget");
    return v ? Number(v) : null;
  });

  const [input, setInput] = useState(budget ?? "");
  const [autoReset, setAutoReset] = useState(() => localStorage.getItem("budget_auto_reset") === "1");

  const spent = useMemo(
    () => getCurrentMonthSpending(subscriptions, currency, rates, convert),
    [subscriptions, currency, rates, convert]
  );

  const remaining = budget != null ? budget - spent : null;
  const percentUsed = budget != null && budget > 0 ? Math.min(100, (spent / budget) * 100) : null;

  // Save Budget
  const saveBudget = useCallback(() => {
    const value = Number(input);
    if (!Number.isFinite(value) || value <= 0) {
      showToast(t("budget_invalid") || "Please enter a valid positive number", "error");
      return;
    }
    localStorage.setItem("monthly_budget", String(value));
    setBudget(value);
    showToast(t("budget_saved") || "Budget saved successfully", "success");
  }, [input, t, showToast]);

  // Toggle Auto-Reset
  const handleToggleReset = useCallback(() => {
    const newValue = !autoReset;
    setAutoReset(newValue);
    localStorage.setItem("budget_auto_reset", newValue ? "1" : "0");
  }, [autoReset]);

  // Handle Auto-Reset on 1st of Month
  useEffect(() => {
    if (!autoReset) return;

    const lastReset = localStorage.getItem("budget_last_reset");
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${today.getMonth() + 1}`;

    if (lastReset !== currentMonth) {
      setBudget(null);
      setInput("");
      localStorage.removeItem("monthly_budget");
      localStorage.setItem("budget_last_reset", currentMonth);
      showToast(t("budget_reset_toast") || "Monthly budget has been reset", "info");
    }
  }, [autoReset, showToast, t]);

  // Sync Budget Across Tabs
  useEffect(() => {
    const sync = () => {
      const v = localStorage.getItem("monthly_budget");
      setBudget(v ? Number(v) : null);
      setInput(v ? Number(v) : "");
      setAutoReset(localStorage.getItem("budget_auto_reset") === "1");
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return (
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
    >
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center mb-3">
        {t("budget_title")}
      </h3>

      {/* Input */}
      <div className="flex gap-2 mb-4 items-center">
        <input
          type="number"
          min="0"
          step="0.01"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={!premium.isPremium}
          placeholder={t("budget_input_placeholder")}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 text-sm"
        />
        <button
          onClick={saveBudget}
          disabled={!premium.isPremium}
          className="px-3 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {t("budget_save")}
        </button>
      </div>

      {/* Budget Info */}
      <div className="text-sm space-y-2">
        <div className="flex justify-between text-gray-600 dark:text-gray-300">
          <span>{t("budget_spent")}</span>
          <span>
            {currency} {(Number(spent) || 0).toFixed(2)}
          </span>
        </div>

        {budget != null && (
          <>
            <div className="flex justify-between font-medium text-gray-800 dark:text-gray-100">
              <span>{t("budget_remaining")}</span>
              <span className={remaining < 0 ? "text-red-500" : ""}>
                {currency} {(Number(remaining) || 0).toFixed(2)}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-800 mt-1 overflow-hidden">
              <div
                className={`h-2 transition-all duration-700 ease-out ${percentUsed < 90
                    ? "bg-green-500"
                    : percentUsed <= 100
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                style={{
                  width: `${percentUsed}%`,
                  transition: "width 0.7s ease-in-out",
                }}
              />
            </div>

            {/* Progress Percent */}
            {percentUsed !== null && (
              <div className="flex justify-end text-xs text-gray-500 dark:text-gray-400 mt-1">
                {percentUsed.toFixed(0)}%
              </div>
            )}

            {/* Alerts */}
            {percentUsed >= 90 && percentUsed < 100 && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                ⚠️ {t("budget_alert_high")}
              </div>
            )}

            {percentUsed >= 100 && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                ❗ {t("budget_alert_exceeded")}
              </div>
            )}
          </>
        )}
      </div>

      {/* Toggle Auto-reset */}
      {premium.isPremium && (
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-600 dark:text-gray-300">
          <input
            type="checkbox"
            checked={autoReset}
            onChange={handleToggleReset}
            id="auto-reset"
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="auto-reset">{t("budget_auto_reset")}</label>
        </div>
      )}

      {!premium.isPremium && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <LockClosedIcon className="w-4 h-4" />
          <span>{t("budget_premium_required")}</span>
        </div>
      )}
    </div>
  );
}

MonthlyBudget.propTypes = {
  subscriptions: PropTypes.array.isRequired,
  currency: PropTypes.string.isRequired,
  rates: PropTypes.object,
  convert: PropTypes.func,
};

// src/components/MonthlyBudget.jsx
import React, { useEffect, useState, useMemo } from "react";
import { usePremium } from "../hooks/usePremium";

/* ---------------- Monthly factor ---------------- */
const MONTHLY_FACTOR = {
  weekly: 4.345,
  biweekly: 2.1725,
  monthly: 1,
  quarterly: 1 / 3,
  semiannual: 1 / 6,
  yearly: 1 / 12,
};

export default function MonthlyBudget({
  subscriptions,
  currency,
  rates,
  convert,
}) {
  const premium = usePremium();

  const [budget, setBudget] = useState(() => {
    const v = localStorage.getItem("monthly_budget");
    return v ? Number(v) : null;
  });

  /* ---------------- Recalculate monthly spend ---------------- */
  const spent = useMemo(() => {
    if (!Array.isArray(subscriptions)) return 0;

    return subscriptions.reduce((sum, s) => {
      if (!s.price || !s.frequency) return sum;

      const factor = MONTHLY_FACTOR[s.frequency] ?? 1;

      const priceInCurrency =
        s.currency && rates
          ? convert(s.price, s.currency, currency, rates)
          : s.price;

      return sum + priceInCurrency * factor;
    }, 0);
  }, [subscriptions, currency, rates, convert]);

  const remaining = budget != null ? budget - spent : null;

  /* ---------------- Sync with Settings ---------------- */
  useEffect(() => {
    const sync = () => {
      const v = localStorage.getItem("monthly_budget");
      setBudget(v ? Number(v) : null);
    };

    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const percent =
    budget && budget > 0
      ? Math.min(100, Math.round((spent / budget) * 100))
      : 0;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-4">
      <h3 className="text-sm font-medium text-center mb-2">
        Monthly Budget
      </h3>

      <div className="text-sm space-y-1">
        <div>
          Spent: {currency} {spent.toFixed(2)}
        </div>

        {budget != null && (
          <div>
            Remaining:{" "}
            <span className={remaining < 0 ? "text-red-500" : ""}>
              {currency} {remaining.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {budget != null && (
        <div className="mt-3">
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className={`h-2 rounded-full ${percent >= 100 ? "bg-red-500" : "bg-green-500"
                }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {!premium.isPremium && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Upgrade to Premium to set a budget
        </div>
      )}
    </div>
  );
}

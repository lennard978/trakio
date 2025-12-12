import React, { useState, useEffect } from "react";
import { getCurrentMonthSpending } from "../utils/budget";
import { usePremium } from "../hooks/usePremium";

export default function MonthlyBudget({ subscriptions, currency }) {
  const premium = usePremium();

  const [budget, setBudget] = useState(() => {
    const v = localStorage.getItem("monthlyBudget");
    return v ? Number(v) : null;
  });

  const spent = getCurrentMonthSpending(subscriptions);
  const remaining = budget != null ? budget - spent : null;

  useEffect(() => {
    if (budget != null) {
      localStorage.setItem("monthlyBudget", String(budget));
    }
  }, [budget]);

  const percent =
    budget && budget > 0
      ? Math.min(100, Math.round((spent / budget) * 100))
      : 0;

  return (
    <div className="
      bg-white dark:bg-gray-900
      border border-gray-200 dark:border-gray-800
      rounded-xl shadow-sm
      p-4 mb-4
    ">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
        Monthly budget
      </h3>

      <div className="text-sm text-gray-800 dark:text-gray-200 space-y-1">
        <div>Spent: {currency} {spent.toFixed(2)}</div>

        {budget != null && (
          <div>
            Remaining:{" "}
            <span className={remaining < 0 ? "text-red-500" : ""}>
              {currency} {remaining.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Progress */}
      {budget != null && (
        <div className="mt-3">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className={`h-2 rounded-full transition-all ${percent >= 100 ? "bg-red-500" : "bg-green-500"
                }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Budget Input */}
      {premium.isPremium ? (
        <input
          type="number"
          min="0"
          placeholder="Set monthly budget"
          value={budget ?? ""}
          onChange={(e) => setBudget(Number(e.target.value) || null)}
          className="
            mt-3 w-full px-3 py-2 text-sm
            rounded-lg border
            bg-white dark:bg-gray-800
            border-gray-300 dark:border-gray-700
          "
        />
      ) : (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Upgrade to Premium to set a budget
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { getCurrentMonthSpending } from "../utils/budget";
import { usePremium } from "../hooks/usePremium";

export default function MonthlyBudget({ subscriptions, currency }) {
  const premium = usePremium();

  const [budget, setBudget] = useState(() => {
    const v = localStorage.getItem("monthly_budget");
    return v ? Number(v) : null;
  });

  const spent = getCurrentMonthSpending(subscriptions);
  const remaining = budget != null ? budget - spent : null;

  // Keep in sync if Settings changes it
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
    <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 mb-4">
      <h3 className="text-sm font-medium text-center mb-2">
        Monthly budget
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

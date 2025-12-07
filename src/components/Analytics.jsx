import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTranslation } from "react-i18next";

export default function Analytics({ subscriptions }) {
  const { t } = useTranslation();

  // Guard: no data
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center mt-4">
        {t("analytics_no_data")}
      </p>
    );
  }

  // Compute monthly cost (simple: non-monthly treated as yearly / 12)
  const subsWithMonthly = subscriptions.map((s) => ({
    ...s,
    monthlyCost: s.frequency === "monthly" ? s.price : s.price / 12,
  }));

  // Sum by category
  const categoryTotals = {};
  subsWithMonthly.forEach((s) => {
    const key = s.category || "Other";
    categoryTotals[key] = (categoryTotals[key] || 0) + s.monthlyCost;
  });

  // Color mapping by category
  const CATEGORY_COLORS = {
    Fitness: "#22c55e",
    Bills: "#6366f1",
    Transport: "#f97316",
    Streaming: "#8b5cf6",
    Software: "#3b82f6",
    Productivity: "#f59e0b",
    Gaming: "#ef4444",
    Education: "#14b8a6",
    Food: "#84cc16",
    Other: "#64748b",
  };

  const pieData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: Number(amount.toFixed(2)),
    color: CATEGORY_COLORS[category] || CATEGORY_COLORS.Other,
  }));

  const totalMonthly = subsWithMonthly.reduce(
    (sum, s) => sum + s.monthlyCost,
    0
  );

  return (
    <div className="mt-8">
      {/* Total monthly spend */}
      {/* <div className="w-full bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-4 mb-6">
        <h2 className="text-sm text-gray-500 dark:text-gray-400 mb-1">
          {t("analytics_total_spend")}
        </h2>
        <div className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
          {totalMonthly.toFixed(2)}
        </div>
      </div> */}

      {/* Pie Chart */}
      <div
        className="w-full bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 p-4 mb-4"
        style={{ height: "320px", minHeight: "320px", minWidth: "250px" }}
      >
        <h3 className="text-sm mb-2">
          {t("analytics_monthly_category")}
        </h3>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              dataKey="value"
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={(entry) => `${entry.name} (${entry.value.toFixed(0)})`}
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// src/pages/Analytics.jsx

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

  // Defensive: no subscriptions
  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        {t("analytics_no_data")}
      </div>
    );
  }

  // Normalize & calculate monthly cost
  const normalized = subscriptions.map((s) => ({
    ...s,
    monthlyCost: s.frequency === "monthly" ? s.price : s.price / 12,
  }));

  // Group by category
  const totals = {};
  normalized.forEach((s) => {
    const key = s.category || "Other";
    totals[key] = (totals[key] || 0) + s.monthlyCost;
  });

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

  const pieData = Object.entries(totals).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
    color: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
  }));

  return (
    <div className="mt-4">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow p-4 h-[340px]">
        <h3 className="text-sm mb-2">{t("analytics_monthly_category")}</h3>

        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={(entry) => `${entry.name} (${entry.value.toFixed(0)})`}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
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

// src/components/Analytics.jsx
import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTranslation } from "react-i18next";

/* ------------------------------------------------------------------ */
/* Frequency normalization (same model as InsightsPage)                */
/* ------------------------------------------------------------------ */
const FREQ = {
  weekly: 4.345,
  biweekly: 2.1725,
  monthly: 1,
  quarterly: 1 / 3,
  semiannual: 1 / 6,
  nine_months: 1 / 9,
  yearly: 1 / 12,
  biennial: 1 / 24,
  triennial: 1 / 36,
};

const COLORS = [
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#22c55e",
  "#84cc16",
  "#f97316",
  "#ef4444",
  "#14b8a6",
  "#f59e0b",
  "#64748b",
];

export default function Analytics({ subscriptions }) {
  const { t } = useTranslation();

  const data = useMemo(() => {
    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      return [];
    }

    const totals = {};

    subscriptions.forEach((s) => {
      const price = Number(s.price || 0);
      const factor = FREQ[s.frequency] ?? FREQ.monthly;
      const monthlyValue = price * factor;

      const category = s.category || t("category_other") || "Other";
      totals[category] = (totals[category] || 0) + monthlyValue;
    });

    return Object.entries(totals).map(([name, value], index) => ({
      name,
      value: Number(value.toFixed(2)),
      color: COLORS[index % COLORS.length],
    }));
  }, [subscriptions, t]);

  if (data.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center mt-6 mb-10">
        {t("analytics_no_data")}
      </p>
    );
  }

  return (
    <div
      className="
        w-full bg-white dark:bg-gray-900
        rounded-xl shadow-lg
        border border-gray-200 dark:border-gray-800
        p-4 mt-4 mb-20
      "
      style={{ minHeight: "340px" }}
    >
      <h3 className="text-sm mb-3 text-gray-700 dark:text-gray-300 font-medium text-center">
        {t("analytics_monthly_category")}
      </h3>

      <div className="w-full h-[280px] flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              dataKey="value"
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={90}
              paddingAngle={3}
              label={({ name, value }) => `${name}: ${value.toFixed(0)}`}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                background: "rgba(0,0,0,0.75)",
                border: "none",
                borderRadius: "8px",
              }}
              itemStyle={{ color: "#fff" }}
            />

            <Legend
              verticalAlign="bottom"
              height={40}
              wrapperStyle={{
                fontSize: "12px",
                paddingTop: "10px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

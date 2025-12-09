// src/components/Analytics.jsx
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

  if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 text-center mt-6 mb-10">
        {t("analytics_no_data")}
      </p>
    );
  }

  // Convert prices to monthly values
  const convertToMonthly = (s) =>
    s.frequency === "monthly" ? s.price : s.price / 12;

  const totals = {};
  subscriptions.forEach((s) => {
    const category = s.category || "Other";
    totals[category] = (totals[category] || 0) + convertToMonthly(s);
  });

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

  const data = Object.entries(totals).map(([name, value], i) => ({
    name,
    value: Number(value.toFixed(2)),
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div
      className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4 mt-4 mb-20"
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

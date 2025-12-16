import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import { useTranslation } from "react-i18next";

function getMonthlySpending(subs) {
  const spendingByMonth = {};

  subs.forEach((s) => {
    const allDates = [...(s.history || []), s.datePaid].filter(Boolean);
    allDates.forEach((d) => {
      const date = new Date(d);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      spendingByMonth[key] = (spendingByMonth[key] || 0) + s.price;
    });
  });

  return Object.entries(spendingByMonth)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([month, value]) => ({ month, value: +value.toFixed(2) }));
}

export default function SpendingTrend({ subscriptions }) {
  const { t } = useTranslation();
  const data = useMemo(() => getMonthlySpending(subscriptions), [subscriptions]);

  if (data.length === 0) return null;

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4 mt-4 mb-10">
      <h3 className="text-sm mb-3 text-gray-700 dark:text-gray-300 font-medium text-center">
        {t("analytics_monthly_trend")}
      </h3>

      <div className="w-full h-[280px] flex justify-center items-center">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

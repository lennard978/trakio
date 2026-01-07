// src/components/analytics/SpendingTrend.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useTranslation } from "react-i18next";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function getMonthlySpending(subs = []) {
  const spendingByMonth = {};

  subs.forEach((s) => {
    if (!s || typeof s.price !== "number") return;

    const dates = [
      ...(Array.isArray(s.history) ? s.history : []),
      s.datePaid,
    ].filter(Boolean);

    dates.forEach((d) => {
      const date = new Date(d);
      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      spendingByMonth[key] =
        (spendingByMonth[key] || 0) + s.price;
    });
  });

  return Object.entries(spendingByMonth)
    .sort(([a], [b]) => new Date(a) - new Date(b))
    .map(([month, value]) => ({
      month,
      value: Number(value.toFixed(2)),
    }));
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function SpendingTrend({ subscriptions }) {
  const { t } = useTranslation();

  const data = useMemo(
    () => getMonthlySpending(subscriptions),
    [subscriptions]
  );

  if (!data.length) return null;

  return (
    <div className="w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4 mt-4 mb-10">
      <h3 className="text-sm mb-3 text-gray-700 dark:text-gray-300 font-medium text-center">
        {t("analytics_monthly_trend")}
      </h3>

      <div className="w-full h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PropTypes                                                          */
/* ------------------------------------------------------------------ */

SpendingTrend.propTypes = {
  subscriptions: PropTypes.arrayOf(
    PropTypes.shape({
      price: PropTypes.number.isRequired,
      datePaid: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.instanceOf(Date),
      ]),
      history: PropTypes.arrayOf(
        PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
          PropTypes.instanceOf(Date),
        ])
      ),
    })
  ).isRequired,
};

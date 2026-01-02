import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";

export default function SmartForecastCard({ data, currency }) {
  const { t } = useTranslation();

  /* -------------------------------------------------
   * Safe inputs
   * ------------------------------------------------- */
  const safeTrends = Array.isArray(data?.trends) ? data.trends : [];
  const safeCategories = data?.categories || {};

  /* -------------------------------------------------
   * Forecast calculation (robust linear regression)
   * ------------------------------------------------- */
  const forecastData = useMemo(() => {
    const points = safeTrends
      .filter((t) => t && typeof t.total === "number" && isFinite(t.total))
      .map((t, i) => ({ x: i, y: t.total }));

    if (points.length < 2) return null;

    const n = points.length;

    const sumX = points.reduce((a, p) => a + p.x, 0);
    const sumY = points.reduce((a, p) => a + p.y, 0);
    const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
    const sumX2 = points.reduce((a, p) => a + p.x * p.x, 0);

    const varianceX = n * sumX2 - sumX ** 2;

    // ✅ Stable regression (no fake divisors)
    const slope =
      varianceX === 0
        ? 0
        : (n * sumXY - sumX * sumY) / varianceX;

    const intercept = (sumY - slope * sumX) / n;

    // Next 3 forecast points
    const nextPoints = [n, n + 1, n + 2].map((x) => ({
      label: t("month_projection_label", { month: x - n + 1 }),
      total: Math.max(intercept + slope * x, 0),
    }));

    // Growth rate (guard tiny denominators)
    const lastValue = points.at(-1)?.y ?? 0;
    const EPS = 0.01;

    const growthRate =
      Math.abs(lastValue) > EPS
        ? (slope / lastValue) * 100
        : 0;

    return { nextPoints, growthRate };
  }, [safeTrends, t]);

  /* -------------------------------------------------
   * Top categories
   * ------------------------------------------------- */
  const topCategories = useMemo(() => {
    return Object.entries(safeCategories)
      .filter(([, v]) => typeof v === "number" && isFinite(v))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [safeCategories]);

  if (!forecastData || !currency) return null;

  const { nextPoints, growthRate } = forecastData;

  const fmt = (num) =>
    Number(num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  /* -------------------------------------------------
   * Status logic
   * ------------------------------------------------- */
  const status =
    growthRate > 10
      ? { emoji: "📈", label: t("forecast_increase"), color: "text-orange-400" }
      : growthRate < -5
        ? { emoji: "📉", label: t("forecast_decrease"), color: "text-green-400" }
        : { emoji: "⚖️", label: t("forecast_stable"), color: "text-blue-400" };

  const forecastValue = fmt(nextPoints[0]?.total ?? 0);

  /* -------------------------------------------------
   * Category summary
   * ------------------------------------------------- */
  const topNames = topCategories.map(([name]) => name);

  const categorySummary =
    topNames.length === 1
      ? t("forecast_category_single", { category: topNames[0] })
      : topNames.length === 2
        ? t("forecast_category_double", {
          c1: topNames[0],
          c2: topNames[1],
        })
        : topNames.length >= 3
          ? t("forecast_category_triple", {
            c1: topNames[0],
            c2: topNames[1],
            c3: topNames[2],
          })
          : "";

  const aiSummary =
    growthRate > 15
      ? t("forecast_summary_rising_ai", { categorySummary })
      : growthRate < -10
        ? t("forecast_summary_declining_ai", { categorySummary })
        : t("forecast_summary_stable_ai", { categorySummary });

  /* -------------------------------------------------
   * Render
   * ------------------------------------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="
        rounded-xl
        bg-gradient-to-b from-white to-gray-100
        dark:from-[#0e1420] dark:to-[#1a1f2a]
        border border-gray-300 dark:border-gray-800/70
        shadow-md dark:shadow-inner dark:shadow-[#141824]
        hover:border-[#ed7014]/60 hover:shadow-[#ed7014]/20
        transition-all duration-300 p-4
      "
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t("smart_forecast_title")}
        </h3>
        <span className={`text-xs font-medium ${status.color} flex items-center gap-1`}>
          {status.emoji} {status.label}
        </span>
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        {aiSummary}{" "}
        {t("forecast_expected_next", {
          value: forecastValue,
          currency,
        })}
      </p>

      <div className="w-full h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={[
              ...safeTrends.map((t) => ({
                label: t.label,
                total: Number(t.total) || 0,
              })),
              ...nextPoints.map((p) => ({
                label: p.label,
                total: p.total,
              })),
            ]}
          >
            <XAxis dataKey="label" stroke="#aaa" />
            <YAxis hide />
            <Tooltip formatter={(v) => `${currency} ${fmt(v)}`} />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#ED7014"
              strokeWidth={2}
              dot={false}
              isAnimationActive
              animationDuration={700}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {topCategories.length > 0 && (
        <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">
            {t("forecast_top_categories")}:
          </span>{" "}
          {topCategories
            .map(([name, value]) => `${name} (${currency} ${fmt(value)})`)
            .join(", ")}
        </div>
      )}
    </motion.div>
  );
}

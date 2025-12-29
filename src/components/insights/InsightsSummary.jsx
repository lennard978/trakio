import React, { useMemo, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useTranslation } from "react-i18next";


const COLORS = {
  green: "#22C55E",
  orange: "#ED7014",
  red: "#EF4444",
  gray: "#6B7280",
};

function StatusBadge({ label, color, emoji, value = 0 }) {
  const motionValue = useMotionValue(0);
  const radius = 9;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = useTransform(
    motionValue,
    (val) => circumference - (val / 100) * circumference
  );

  useEffect(() => {
    const controls = animate(motionValue, Math.min(value, 100), {
      duration: 1.2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value]);

  const glowClass =
    color === COLORS.orange
      ? "shadow-[0_0_10px_2px_rgba(237,112,20,0.45)]"
      : color === COLORS.green
        ? "shadow-[0_0_10px_2px_rgba(34,197,94,0.35)]"
        : color === COLORS.red
          ? "shadow-[0_0_10px_2px_rgba(239,68,68,0.4)]"
          : "";

  return (
    <motion.div
      className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border 
      border-gray-300 dark:border-gray-700/60 bg-gray-100/70 dark:bg-gray-800/60 ${glowClass}`}
      animate={{
        boxShadow: [
          `0 0 10px 2px ${color}55`,
          `0 0 18px 5px ${color}99`,
          `0 0 10px 2px ${color}55`,
        ],
      }}
      transition={{ duration: 3, ease: "easeInOut", repeat: Infinity }}
    >
      <div className="relative w-5 h-5 flex-shrink-0">
        <svg className="w-5 h-5 -rotate-90">
          <circle
            cx="10"
            cy="10"
            r={radius}
            fill="transparent"
            stroke={COLORS.gray}
            strokeWidth="2"
          />
          <motion.circle
            cx="10"
            cy="10"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="2"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-900 dark:text-white font-semibold">
          {emoji}
        </span>
      </div>
      <span className="text-gray-800 dark:text-gray-200">{label}</span>
    </motion.div>
  );
}

export default function InsightsSummary({ data, currency }) {
  const { t } = useTranslation();

  const { summaryLines, status, confidence } = useMemo(() => {
    if (!data) {
      return {
        summaryLines: [t("insight_line_no_data")],
        status: {
          label: t("insight_status_no_data"),
          color: COLORS.gray,
          emoji: "⚪",
          value: 0,
        },
        confidence: {
          label: t("insight_confidence_unknown"),
          color: COLORS.gray,
          emoji: "❔",
          value: 0,
        },
      };
    }

    const trends = data.trends || [];

    const lastMonth = trends.at(-2)?.total ?? 0;
    const thisMonth = data.totalThisMonth ?? trends.at(-1)?.total ?? 0;
    const growth = lastMonth ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
    const forecast = data.forecast ?? thisMonth * 1.08;

    const monthlyBudget = Number(localStorage.getItem("monthly_budget")) || 0;
    const overBudget = monthlyBudget > 0 && thisMonth > monthlyBudget;
    const percentUsed = monthlyBudget
      ? ((thisMonth / monthlyBudget) * 100).toFixed(1)
      : "0.0";

    const volatility =
      trends.length > 3
        ? trends
          .map((t) => t.total)
          .reduce((acc, val, _, arr) => {
            const mean =
              arr.reduce((s, n) => s + n, 0) / arr.length || 0;
            return acc + Math.pow(val - mean, 2);
          }, 0) / trends.length
        : 0;

    let confidenceLevel = {
      label: t("insight_confidence_stable"),
      color: COLORS.green,
      emoji: "🟢",
      value: 90,
    };
    if (volatility > thisMonth * 0.5)
      confidenceLevel = {
        label: t("insight_confidence_uncertain"),
        color: COLORS.red,
        emoji: "🔴",
        value: 40,
      };
    else if (volatility > thisMonth * 0.25)
      confidenceLevel = {
        label: t("insight_confidence_volatile"),
        color: COLORS.orange,
        emoji: "🟠",
        value: 65,
      };

    const categories = Object.entries(data.categories || {});
    const topCategory = categories.sort((a, b) => b[1] - a[1])[0];
    const totalSpending = categories.reduce((s, [, v]) => s + v, 0);
    const topPercent = topCategory
      ? (topCategory[1] / totalSpending) * 100
      : 0;

    let status = {
      label: t("insight_status_balanced"),
      color: COLORS.green,
      emoji: "🟢",
      value: Math.abs(growth),
    };

    if (overBudget) {
      status = {
        label: t("insight_status_over_budget"),
        color: COLORS.red,
        emoji: "🔴",
        value: Math.min(Number(percentUsed), 100),
      };
    } else if (growth > 15 || topPercent > 45) {
      status = {
        label: t("insight_status_high_spending"),
        color: COLORS.orange,
        emoji: "🟠",
        value: Math.min(growth, 100),
      };
    } else if (growth > 5 && growth <= 15) {
      status = {
        label: t("insight_status_active_spending"),
        color: COLORS.orange,
        emoji: "🟠",
        value: Math.min(growth, 100),
      };
    } else if (growth < -5) {
      status = {
        label: t("insight_status_improving"),
        color: COLORS.green,
        emoji: "🟢",
        value: Math.abs(growth),
      };
    }

    const fmt = (num) =>
      (isFinite(num) ? num : 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const summaryLines = [];

    if (growth > 10) {
      summaryLines.push(t("insight_line_growth_up", { growth: growth.toFixed(1) }));
    } else if (growth < -10) {
      summaryLines.push(t("insight_line_growth_down", { growth: Math.abs(growth).toFixed(1) }));
    } else {
      summaryLines.push(t("insight_line_growth_stable"));
    }

    if (topCategory) {
      summaryLines.push(
        t("insight_line_top_category", {
          category: topCategory[0],
          currency,
          amount: fmt(topCategory[1]),
          percent: topPercent.toFixed(1),
        })
      );
    }

    summaryLines.push(
      t("insight_line_total_spent", {
        currency,
        amount: fmt(thisMonth),
      }),
      monthlyBudget
        ? t("insight_line_budget_used", {
          percentUsed,
          currency,
          budget: fmt(monthlyBudget),
        })
        : t("insight_line_no_budget"),
      // t("insight_line_forecast", {
      //   currency,
      //   forecast: fmt(forecast),
      // }),
      topPercent > 40
        ? t("insight_line_top_warning", {
          percent: topPercent.toFixed(0),
          category: topCategory[0],
        })
        : t("insight_line_distribution_good"),
      t("insight_line_consistency_tip")
    );

    return { summaryLines, status, confidence: confidenceLevel };
  }, [data, currency, t]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="rounded-xl bg-gradient-to-b from-white to-gray-100 dark:from-[#0e1420] dark:to-[#1a1f2a]
      border border-gray-300 dark:border-gray-800/70 shadow-md dark:shadow-inner dark:shadow-[#141824]
      hover:border-[#ed7014]/60 hover:shadow-[#ed7014]/20 transition-all duration-300 p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {t("insight_title")}
        </h3>
        <div className="flex gap-2">
          <StatusBadge {...confidence} />
        </div>
      </div>

      <div className="space-y-2 text-gray-700 dark:text-gray-300 text-sm leading-relaxed mt-3">
        {summaryLines.map((line, i) => (
          <p key={i} className="whitespace-pre-wrap">
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

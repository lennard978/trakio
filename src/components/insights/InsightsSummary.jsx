// src/components/insights/InsightsSummary.jsx
import React, { useMemo, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useTranslation } from "react-i18next";

const COLORS = {
  green: "#22C55E",
  orange: "#ED7014",
  red: "#EF4444",
  gray: "#6B7280",
};

function clamp(v) {
  return Math.max(0, Math.min(100, v));
}

function StatusBadge({ label, color, emoji, value = 0 }) {
  const motionValue = useMotionValue(0);
  const radius = 9;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset = useTransform(
    motionValue,
    (val) => circumference - (val / 100) * circumference
  );

  useEffect(() => {
    const controls = animate(motionValue, clamp(value), {
      duration: 1.1,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value]);

  return (
    <motion.div
      className="flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium
      border border-gray-300 dark:border-gray-700/60
      bg-gray-100/70 dark:bg-gray-800/60"
    >
      <div className="relative w-5 h-5">
        <svg className="w-5 h-5 -rotate-90">
          <circle
            cx="10"
            cy="10"
            r={radius}
            stroke={COLORS.gray}
            strokeWidth="2"
            fill="transparent"
          />
          <motion.circle
            cx="10"
            cy="10"
            r={radius}
            stroke={color}
            strokeWidth="2"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold">
          {emoji}
        </span>
      </div>
      <span>{label}</span>
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
    const last = trends.at(-2)?.total ?? 0;
    const current = data.totalThisMonth ?? trends.at(-1)?.total ?? 0;
    const growth = last ? ((current - last) / last) * 100 : 0;

    const monthlyBudget = Number(localStorage.getItem("monthly_budget")) || 0;
    const overBudget = monthlyBudget > 0 && current > monthlyBudget;

    const categories = Object.entries(data.categories || {});
    const topCategory = categories.sort((a, b) => b[1] - a[1])[0];
    const totalSpending = categories.reduce((s, [, v]) => s + v, 0);
    const topPercent = totalSpending
      ? (topCategory?.[1] / totalSpending) * 100
      : 0;

    let status = {
      label: t("insight_status_balanced"),
      color: COLORS.green,
      emoji: "🟢",
      value: clamp(Math.abs(growth)),
    };

    if (overBudget) {
      status = {
        label: t("insight_status_over_budget"),
        color: COLORS.red,
        emoji: "🔴",
        value: clamp((current / monthlyBudget) * 100),
      };
    } else if (growth > 15 || topPercent > 45) {
      status = {
        label: t("insight_status_high_spending"),
        color: COLORS.orange,
        emoji: "🟠",
        value: clamp(growth),
      };
    } else if (growth < -5) {
      status = {
        label: t("insight_status_improving"),
        color: COLORS.green,
        emoji: "🟢",
        value: clamp(Math.abs(growth)),
      };
    }

    const confidence =
      trends.length < 3
        ? {
          label: t("insight_confidence_low"),
          color: COLORS.gray,
          emoji: "❔",
          value: 30,
        }
        : {
          label: t("insight_confidence_stable"),
          color: COLORS.green,
          emoji: "🟢",
          value: 85,
        };

    const fmt = (n) =>
      (isFinite(n) ? n : 0).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const summaryLines = [
      growth > 10
        ? t("insight_line_growth_up", { growth: growth.toFixed(1) })
        : growth < -10
          ? t("insight_line_growth_down", {
            growth: Math.abs(growth).toFixed(1),
          })
          : t("insight_line_growth_stable"),
      topCategory &&
      t("insight_line_top_category", {
        category: topCategory[0],
        currency,
        amount: fmt(topCategory[1]),
        percent: topPercent.toFixed(1),
      }),
      t("insight_line_total_spent", {
        currency,
        amount: fmt(current),
      }),
      monthlyBudget
        ? t("insight_line_budget_used", {
          percentUsed: ((current / monthlyBudget) * 100).toFixed(1),
          currency,
          budget: fmt(monthlyBudget),
        })
        : t("insight_line_no_budget"),
      topPercent > 40
        ? t("insight_line_top_warning", {
          percent: topPercent.toFixed(0),
          category: topCategory?.[0],
        })
        : t("insight_line_distribution_good"),
    ].filter(Boolean);

    return { summaryLines, status, confidence };
  }, [data, currency, t]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl p-4
      bg-gradient-to-b from-white to-gray-100
      dark:from-[#0e1420] dark:to-[#1a1f2a]
      border border-gray-300 dark:border-gray-800/70"
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold">
          {t("insight_title")}
        </h3>
        <div className="flex gap-2">
          <StatusBadge {...status} />
          <StatusBadge {...confidence} />
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
        {summaryLines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </motion.div>
  );
}

import React, { useMemo, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  animate,
  AnimatePresence,
} from "framer-motion";
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts";

// === THEME COLORS ===
const COLORS = {
  green: "#22C55E",
  orange: "#ED7014",
  red: "#EF4444",
  gray: "#6B7280",
};

// === Animated Circular Badge ===
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
      className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border border-gray-700/60 bg-gray-800/60 ${glowClass}`}
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
        <span className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-semibold">
          {emoji}
        </span>
      </div>
      <span className="text-gray-200">{label}</span>
    </motion.div>
  );
}

// === Mini Sparkline for Forecast Confidence ===
function ConfidenceSparkline({ trends, color }) {
  if (!trends?.length) return null;

  const sparkData = trends.slice(-6).map((t) => ({
    month: t.label,
    value: t.total,
  }));

  const lineColor = color || COLORS.orange;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-[60px] mt-2"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sparkData}>
          <XAxis
            dataKey="month"
            stroke="#555"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={false}
            formatter={(v) => [`${v.toFixed(2)}`, "Spending"]}
            contentStyle={{
              backgroundColor: "#1e293b",
              borderRadius: "6px",
              border: "1px solid rgba(255,255,255,0.05)",
              color: "#fff",
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={700}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

// === MAIN COMPONENT ===
export default function InsightsSummary({ data, currency }) {
  const { summaryLines, status, confidence } = useMemo(() => {
    if (!data || !data.trends?.length) {
      return {
        summaryLines: ["📊 Not enough data to generate insights yet."],
        status: { label: "No Data", color: COLORS.gray, emoji: "⚪", value: 0 },
        confidence: { label: "Unknown", color: COLORS.gray, emoji: "❔", value: 0 },
      };
    }

    const trends = data.trends;
    const lastMonth = trends.at(-2)?.total ?? 0;
    const thisMonth = trends.at(-1)?.total ?? 0;
    const growth = lastMonth ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;
    const forecast = data.forecast ?? thisMonth * 1.08;

    // Volatility-based confidence
    const volatility =
      trends.length > 3
        ? trends
          .map((t) => t.total)
          .reduce((acc, val, _, arr) => {
            const mean = arr.reduce((s, n) => s + n, 0) / arr.length || 0;
            return acc + Math.pow(val - mean, 2);
          }, 0) / trends.length
        : 0;

    let confidence = {
      label: "Stable",
      color: COLORS.green,
      emoji: "🟢",
      value: 90,
    };
    if (volatility > thisMonth * 0.5) {
      confidence = {
        label: "Uncertain",
        color: COLORS.red,
        emoji: "🔴",
        value: 40,
      };
    } else if (volatility > thisMonth * 0.25) {
      confidence = {
        label: "Volatile",
        color: COLORS.orange,
        emoji: "🟠",
        value: 65,
      };
    }

    const categories = Object.entries(data.categories || {});
    const topCategory = categories.sort((a, b) => b[1] - a[1])[0];
    const totalSpending = categories.reduce((s, [, v]) => s + v, 0);
    const topPercent = topCategory ? (topCategory[1] / totalSpending) * 100 : 0;

    let status = {
      label: "Balanced",
      color: COLORS.green,
      emoji: "🟢",
      value: Math.abs(growth),
    };
    if (growth > 15 || topPercent > 45) {
      status = {
        label: "Over Budget",
        color: COLORS.red,
        emoji: "🔴",
        value: Math.min(growth, 100),
      };
    } else if ((growth > 5 && growth <= 15) || topPercent > 35) {
      status = {
        label: "Active Spending",
        color: COLORS.orange,
        emoji: "🟠",
        value: Math.min(growth, 100),
      };
    } else if (growth < -5) {
      status = {
        label: "Improving",
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

    if (growth > 10)
      summaryLines.push(`📈 You spent ${growth.toFixed(1)}% more than last month.`);
    else if (growth < -10)
      summaryLines.push(`📉 Great work — spending decreased by ${Math.abs(growth).toFixed(1)}%.`);
    else summaryLines.push(`⚖️ Your spending remained stable this month.`);

    if (topCategory)
      summaryLines.push(
        `🏷️ Top category: **${topCategory[0]}**, ${currency} ${fmt(topCategory[1])} (${topPercent.toFixed(1)}%).`
      );

    summaryLines.push(
      `💰 Total spent this month: ${currency} ${fmt(thisMonth)}.`,
      `🔮 Forecast for next month: ${currency} ${fmt(forecast)}.`
    );

    summaryLines.push(
      topPercent > 40
        ? `⚠️ ${topPercent.toFixed(0)}% of spending is in **${topCategory[0]}** — consider balancing.`
        : `🎯 Your spending is well distributed across categories.`
    );

    summaryLines.push(`💡 Keep tracking — consistency builds better results.`);

    return { summaryLines, status, confidence };
  }, [data, currency]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="rounded-xl bg-[#0e1420] border border-gray-800/60 shadow-sm p-4"
    >
      {/* Header + Badges */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-100">
          Financial Insights
        </h3>
        <div className="flex gap-2">
          <StatusBadge {...status} />
          <StatusBadge {...confidence} />
        </div>
      </div>

      {/* Animated Sparkline */}
      <ConfidenceSparkline trends={data.trends} color={confidence.color} />

      {/* Multiline Summary */}
      <div className="space-y-2 text-gray-300 text-sm leading-relaxed mt-3">
        {summaryLines.map((line, i) => (
          <p key={i} className="whitespace-pre-wrap">
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  );
}

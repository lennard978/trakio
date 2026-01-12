import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import {
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  StarIcon,
  AdjustmentsVerticalIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { ResponsiveContainer, LineChart, Line } from "recharts";
import AnimatedNumber from "./AnimatedNumber";
import { getCurrencyFlag } from "../../utils/currencyFlags";
import { getCategoryStyles } from "../../utils/CategoryStyles";
import { useTranslation } from "react-i18next";

/**
 * OverviewStatsGrid
 * ------------------------------------------------------------------
 * Displays the animated KPI cards at the top of BudgetOverviewChart.
 *
 * METRICS INCLUDED
 * - Monthly spend
 * - Annual cost
 * - Top category
 * - Average per subscription
 * - Active subscriptions count
 * - Growth rate with mini sparkline
 *
 * DESIGN & BEHAVIOR
 * - Animations identical to original implementation
 * - Layout unchanged (grid-cols-2 / md:grid-cols-4)
 * - All calculations are performed in the parent
 *
 * IMPORTANT
 * - PURE PRESENTATIONAL COMPONENT
 * - No internal state
 * - Receives fully prepared values via props
 */
export default function OverviewStatsGrid({
  currency,
  data,
  annualCost,
  avgPerSub,
  subscriptionsCount,
  topCategory,
}) {
  const cardContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.2 },
    },
  };

  const cardItem = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };
  const { t } = useTranslation();

  return (
    <motion.div
      variants={cardContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm"
    >
      {[
        {
          label: "Monthly spend",
          icon: <ArrowTrendingUpIcon className="w-5 h-5 text-purple-500" />,
          value: (
            <span className="flex items-center gap-2 font-bold">
              <span className="text-xl">{getCurrencyFlag(currency)}</span>
              <AnimatedNumber
                value={Number(data.totalThisMonth ?? 0)}
                decimals={2}
                prefix={`${currency} `}
              />
            </span>
          ),
        },
        {
          label: "Annual cost",
          icon: <ArrowPathIcon className="w-5 h-5 text-pink-600" />,
          value: (
            <span className="flex items-center gap-2 font-bold">
              <span className="text-xl">{getCurrencyFlag(currency)}</span>
              <AnimatedNumber
                value={Number(annualCost ?? 0)}
                decimals={2}
                prefix={`${currency} `}
              />
            </span>
          ),
        },
        {
          label: "Top category",
          icon: <StarIcon className="w-5 h-5 text-green-600" />,
          value: topCategory ? (
            <span className="flex flex-col mt-2 font-bold">
              {(() => {
                const categoryKey = topCategory[0];
                const styles = getCategoryStyles(categoryKey);
                return (
                  <span className="flex items-center gap-2 truncate">
                    <span>{styles.icon}</span>
                    {t(styles.label)}
                  </span>

                );
              })()}
              <span className="flex items-center gap-2">
                <span className="text-xl">{getCurrencyFlag(currency)}</span>
                <AnimatedNumber
                  value={Number(topCategory[1]) || 0}
                  decimals={2}
                  prefix={`${currency} `}
                />
              </span>
            </span>
          ) : (
            "—"
          ),
        },
        {
          label: "Avg / subscription",
          icon: <AdjustmentsVerticalIcon className="w-5 h-5 text-pink-600" />,
          value: (
            <span className="flex items-center gap-2 font-bold">
              <span className="text-xl">{getCurrencyFlag(currency)}</span>
              <AnimatedNumber
                value={Number(avgPerSub) || 0}
                decimals={2}
                prefix={`${currency} `}
              />
            </span>
          ),
        },
        {
          label: "Active subscriptions",
          icon: <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />,
          value: (
            <span className="font-bold">{subscriptionsCount}</span>
          ),
        },
        {
          label: "Growth rate",
          icon: <ChartBarIcon className="w-5 h-5 text-blue-600" />,
          value: (() => {
            const hasTrend = data.trends?.length > 1;
            const growth = Number(data.growthRate) || 0;
            if (!hasTrend) return <span className="text-gray-500">—</span>;

            const isIncrease = growth > 0;
            const arrow = isIncrease ? "↑" : "↓";
            const color = isIncrease ? "text-orange-400" : "text-green-400";

            return (
              <div className="flex items-center gap-2">
                <span className={`${color} font-bold`}>
                  {arrow}{" "}
                  <AnimatedNumber
                    value={Math.abs(growth)}
                    suffix="%"
                    decimals={1}
                  />
                </span>
                <div className="h-5 w-16">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.trends}>
                      <Line
                        type="monotone"
                        dataKey="total"
                        stroke={isIncrease ? "#ED7014" : "#22c55e"}
                        strokeWidth={2}
                        dot={false}
                        animationDuration={600}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })(),
        },
      ].map((item, idx) => (
        <motion.div
          key={idx}
          variants={cardItem}
          className="flex flex-col justify-between p-3 rounded-lg
            bg-gradient-to-b from-white to-gray-100 dark:from-[#1a1f2a] dark:to-[#0e1420]
            border border-gray-300 dark:border-gray-800/70 hover:border-[#ed7014]/60
            shadow-sm dark:shadow-inner dark:shadow-[#141824]
            transition-all duration-300 min-h-[88px]"
        >
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-400">
            {item.icon}
            {item.label}
          </div>
          {item.value}
        </motion.div>
      ))}
    </motion.div>
  );
}

OverviewStatsGrid.propTypes = {
  currency: PropTypes.string.isRequired,
  annualCost: PropTypes.number.isRequired,
  avgPerSub: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  subscriptionsCount: PropTypes.number.isRequired,
  topCategory: PropTypes.array,
  data: PropTypes.shape({
    totalThisMonth: PropTypes.number,
    growthRate: PropTypes.number,
    trends: PropTypes.array,
  }).isRequired,
};

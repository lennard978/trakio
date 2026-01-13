import React from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import Section from "./Section";
import SpendingRangeSelector from "./SpendingRangeSelector";

/**
 * SpendingOverTimeSection
 * --------------------------------------------------
 * Visual-only section responsible for:
 * - Range selector (1M / 3M / 6M / 12M)
 * - Animated spending bar chart
 * - Trend pulse background
 *
 * All calculations must be done upstream.
 */
export default function SpendingOverTimeSection({
  title,
  description,
  currency,
  activeRange,
  onRangeChange,
  spendingData,
  animatedData,
  isIncrease,
  t,
}) {
  return (
    <Section title={title}>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="
  flex flex-col 
  lg:flex-row 
  lg:items-center 
  lg:justify-between 
  gap-3 
  mb-4
"      >
        <div>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t("projection.title", { range: activeRange })}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 max-w-md">
            💡 {description}
          </p>
        </div>

        <SpendingRangeSelector
          activeRange={activeRange}
          onChange={onRangeChange}
          ranges={["1M", "3M", "6M", "12M"]}
          t={t}
        />
      </motion.div>

      <div className="relative w-full h-[180px] md:h-[220px] lg:h-[260px]">
        {/* Trend pulse */}
        <motion.div
          key={`pulse-${activeRange}`}
          initial={{ opacity: 0.8, scale: 0.95 }}
          animate={{ opacity: 0, scale: 1.3 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={`absolute inset-0 rounded-xl blur-2xl pointer-events-none
            ${isIncrease ? "bg-[#ed7014]/10" : "bg-green-500/10"}`}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeRange}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={animatedData.length ? animatedData : spendingData}>
                <XAxis
                  dataKey="month"
                  stroke="#aaa"
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: "#333" }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  formatter={(v) => [
                    `${currency} ${v.toFixed(2)}`,
                    t("common.spending"),
                  ]}
                  contentStyle={{
                    backgroundColor: "rgba(255,255,255,0.9)",
                    color: "#000",
                    borderRadius: "6px",
                    border: "1px solid rgba(0,0,0,0.1)",
                  }}
                  wrapperStyle={{ backdropFilter: "blur(8px)" }}
                />
                <Bar
                  dataKey="animatedValue"
                  radius={[10, 10, 10, 10]}
                  fill="url(#barGradient)"
                  isAnimationActive={false}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ED7014" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#5a2b06" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </div>
    </Section>
  );
}

SpendingOverTimeSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  currency: PropTypes.string.isRequired,
  activeRange: PropTypes.string.isRequired,
  onRangeChange: PropTypes.func.isRequired,
  spendingData: PropTypes.array.isRequired,
  animatedData: PropTypes.array.isRequired,
  isIncrease: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

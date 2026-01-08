import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

/**
 * BudgetUsageBar
 * ------------------------------------------------------------------
 * Visual indicator for monthly budget usage.
 *
 * Extracted from BudgetOverviewChart without changing:
 * - Styling
 * - Animation
 * - Layout
 *
 * RESPONSIBILITIES
 * - Display usage label (already translated by parent)
 * - Display percentage used
 * - Animate progress bar width
 *
 * IMPORTANT
 * - This component is PRESENTATIONAL ONLY
 * - All calculations must happen in the parent
 */
export default function BudgetUsageBar({
  label,
  percentUsed,
  barColor = "#ED7014",
}) {
  const clampedPercent = Math.min(Number(percentUsed) || 0, 100);

  return (
    <div className="mt-4">
      <div className="flex justify-between text-xs text-gray-700 dark:text-gray-400 mb-1">
        <span>{label}</span>
        <span>{clampedPercent}%</span>
      </div>

      <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-2 rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedPercent}%` }}
          transition={{
            duration: 1.4,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        />
      </div>
    </div>
  );
}

BudgetUsageBar.propTypes = {
  /** Label shown above the progress bar (already translated) */
  label: PropTypes.string.isRequired,

  /** Percentage of budget used (0–100+) */
  percentUsed: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,

  /** Optional bar color (defaults to Trakio orange) */
  barColor: PropTypes.string,
};

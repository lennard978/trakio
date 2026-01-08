import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

/**
 * SpendingRangeSelector
 * ------------------------------------------------------------------
 * Small animated button group for selecting a time range
 * (1M / 3M / 6M / 12M).
 *
 * Used inside BudgetOverviewChart → "Spending Over Time" section.
 *
 * DESIGN
 * - Spring animations on hover & tap
 * - Active state styling preserved
 * - Fully controlled by parent
 *
 * IMPORTANT
 * - No state
 * - No business logic
 * - Pure UI component
 */
export default function SpendingRangeSelector({
  activeRange,
  onChange,
  ranges,
  t,
}) {
  return (
    <div className="flex space-x-2 mt-3 md:mt-0">
      {ranges.map((range) => (
        <motion.button
          key={range}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 250, damping: 18 }}
          onClick={() => onChange(range)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
            ${activeRange === range
              ? "bg-[#ED7014] text-white shadow-md shadow-[#ed7014]/40"
              : "bg-gray-200 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-[#ed7014]/40 hover:text-white"
            }`}
        >
          {t(`range.${range}`)}
        </motion.button>
      ))}
    </div>
  );
}

SpendingRangeSelector.propTypes = {
  /** Currently active range (e.g. "6M") */
  activeRange: PropTypes.string.isRequired,

  /** Callback when a range is selected */
  onChange: PropTypes.func.isRequired,

  /** Array of ranges to render (e.g. ["1M","3M","6M","12M"]) */
  ranges: PropTypes.arrayOf(PropTypes.string).isRequired,

  /** i18n translate function */
  t: PropTypes.func.isRequired,
};

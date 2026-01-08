// src/components/insights/Stat.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * Stat
 * ------------------------------------------------------------------
 * Small, reusable row component for displaying a labeled statistic.
 *
 * Used primarily inside BudgetOverviewChart to show:
 * - Monthly / yearly totals
 * - Paid / due values
 * - Aggregated metrics
 *
 * DESIGN GOALS
 * - Minimal layout
 * - Works in light & dark mode
 * - Accepts any renderable value (string, number, JSX)
 *
 * IMPORTANT
 * - This component is PRESENTATIONAL ONLY
 * - No state, no side effects, no business logic
 */
export default function Stat({ label, value }) {
  return (
    <div className="flex justify-between text-sm py-1 border-b border-gray-300 dark:border-gray-800/60">
      <span className="text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {value}
      </span>
    </div>
  );
}

Stat.propTypes = {
  /** Label text shown on the left side */
  label: PropTypes.string.isRequired,

  /**
   * Value displayed on the right side.
   * Can be:
   * - string
   * - number
   * - JSX (e.g. animated numbers, formatted currency)
   */
  value: PropTypes.node.isRequired,
};

// src/components/insights/Section.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * Section
 * ------------------------------------------------------------------
 * Visual container component used to group logical sections
 * inside Insights / BudgetOverviewChart.
 *
 * FEATURES
 * - Glossy gradient background
 * - Light & dark mode support
 * - Optional section title
 * - Consistent padding, border, and hover effects
 *
 * DESIGN NOTES
 * - This component is PURELY PRESENTATIONAL
 * - No state
 * - No side effects
 * - Children are rendered as-is
 */
export default function Section({ title, children }) {
  return (
    <div
      className="
        rounded-xl
        bg-gradient-to-b from-white to-gray-100
        dark:from-[#0e1420] dark:to-[#1a1f2a]
        border border-gray-300 dark:border-gray-800/70
        shadow-md dark:shadow-inner dark:shadow-[#141824]
        transition-all duration-300
        hover:shadow-[#ed7014]/20 hover:border-[#ed7014]/60
        p-4 mb-2
      "
    >
      {title && (
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-700/60 pb-2 mb-3">
          {title}
        </h3>
      )}

      {children}
    </div>
  );
}

Section.propTypes = {
  /** Optional section title shown at the top */
  title: PropTypes.string,

  /** Section content */
  children: PropTypes.node.isRequired,
};

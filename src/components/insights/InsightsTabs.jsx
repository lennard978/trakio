import React from "react";
import PropTypes from "prop-types";

/**
 * InsightsTabs
 * ------------------------------------------------------------------
 * Horizontal tab selector used in BudgetOverviewChart.
 *
 * PURPOSE
 * - Render available insight tabs (General, Categories, Frequency, etc.)
 * - Highlight active tab
 * - Notify parent when tab changes
 *
 * DESIGN NOTES
 * - Styling is 1:1 identical to original implementation
 * - Transitions, hover states, colors unchanged
 *
 * IMPORTANT
 * - This is a PURE PRESENTATIONAL component
 * - No internal state
 * - All logic remains in the parent
 */
export default function InsightsTabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex flex-wrap justify-center mb-3 space-x-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-3 py-1 mb-2 rounded-full text-sm font-medium transition-all duration-300
            ${activeTab === tab.key
              ? "bg-[#ED7014] text-white shadow-md shadow-[#ed7014]/30"
              : "bg-gray-200 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-[#ED7014]/30 hover:text-white"
            }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

InsightsTabs.propTypes = {
  /** Array of tab definitions: [{ key, label }] */
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,

  /** Currently active tab key */
  activeTab: PropTypes.string.isRequired,

  /** Callback when tab changes */
  onChange: PropTypes.func.isRequired,
};

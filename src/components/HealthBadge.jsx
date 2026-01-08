import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

const COLORS = {
  green: "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30",
  yellow: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
  red: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
  gray: "bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/30",
};

// const ICONS = {
//   green: "✅",
//   yellow: "⚠️",
//   red: "❌",
//   gray: "⏸️",
// };

export default function HealthBadge({ label, color }) {
  if (!COLORS[color] && process.env.NODE_ENV === "development") {
    console.warn(`⚠️ Unknown color "${color}" passed to <HealthBadge />`);
  }

  return (
    <motion.span
      role="status"
      aria-label={`Status: ${label}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`px-2 py-0.5 text-xs font-medium rounded-lg border ${COLORS[color] || COLORS.gray}`}
    >
      <div className="flex flex-col justify-center items-center">
        {/* <div>
          {ICONS[color]}
        </div> */}
        <div>
          {label}
        </div>
      </div>
    </motion.span>
  );
}

HealthBadge.propTypes = {
  label: PropTypes.string.isRequired,
  color: PropTypes.oneOf(["green", "yellow", "red", "gray"]),
};


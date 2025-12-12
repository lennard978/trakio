import React from "react";

const COLORS = {
  green: "bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30",
  yellow: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-300 border-yellow-500/30",
  red: "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30",
  gray: "bg-gray-500/15 text-gray-700 dark:text-gray-300 border-gray-500/30",
};

export default function HealthBadge({ label, color }) {
  return (
    <span
      className={`
        px-2 py-0.5 text-xs font-medium rounded-lg border
        ${COLORS[color] || COLORS.gray}
      `}
    >
      {label}
    </span>
  );
}

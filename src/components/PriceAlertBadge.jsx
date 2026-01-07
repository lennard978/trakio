import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

export default function PriceAlertBadge({ alert }) {
  // Defensive guard
  if (!alert || typeof alert !== "object") return null;

  const { oldPrice, newPrice, percent } = alert;
  if (oldPrice == null || newPrice == null) return null;

  const formattedPercent =
    typeof percent === "number" ? percent.toFixed(1) : percent;

  return (
    <motion.div
      role="status"
      aria-label={`Price change: from ${oldPrice} to ${newPrice} (${formattedPercent}% increase)`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="
        mt-2 text-xs px-2 py-1 rounded-lg border font-medium
        bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30
        backdrop-blur-sm shadow-sm flex items-center gap-1
      "
    >
      <span aria-hidden="true">⚠️</span>
      <span>
        Price increased: {oldPrice} → {newPrice} (+{formattedPercent}%)
      </span>
    </motion.div>
  );
}

PriceAlertBadge.propTypes = {
  alert: PropTypes.shape({
    oldPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    newPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    percent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

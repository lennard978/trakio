import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function LoadingSpinner({ size = "md", color = "orange" }) {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-[3px]",
    lg: "w-12 h-12 border-4",
  };

  const colorClasses = {
    orange: "border-t-orange-500 border-gray-300 dark:border-gray-700",
    white: "border-t-white border-gray-300 dark:border-gray-600",
    gray: "border-t-gray-500 border-gray-300 dark:border-gray-600",
  };

  const selectedSize = sizeClasses[size] || sizeClasses.md;
  const selectedColor = colorClasses[color] || colorClasses.orange;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      role="status"
      aria-label={t("loading", "Loading...")}
      className={`animate-spin rounded-full ${selectedSize} ${selectedColor}`}
      style={{
        background: `conic-gradient(from 90deg, ${color} 0deg, transparent 270deg)`,
        WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), black 0)',
      }}
    />
  );
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  color: PropTypes.oneOf(["orange", "white", "gray"]),
};

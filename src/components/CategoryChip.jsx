import PropTypes from "prop-types";
import React from "react";
import { useTranslation } from "react-i18next";
import { CATEGORY_COLORS } from "../constants/categoryColors.js";
import { motion } from "framer-motion";

export default function CategoryChip({ category }) {
  const { t } = useTranslation();

  // Normalize key safely
  const key = String(category || "other").trim().toLowerCase();
  const color = CATEGORY_COLORS[key] || CATEGORY_COLORS.other;

  // Determine if text color should be dark or light for contrast
  const isBright = (() => {
    const rgb = color.match(/\d+/g);
    if (!rgb) return false;
    const brightness = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    return brightness > 0.7;
  })();

  return (
    <motion.div
      role="note"
      aria-label={t(`category.${key}`, key)}
      className="px-3 py-1 text-xs font-semibold rounded-full capitalize backdrop-blur-md border border-white/40 shadow-md select-none cursor-default"
      style={{
        "--chip-color": color,
        background: `linear-gradient(145deg, ${color}, ${color}cc)`,
        boxShadow: `0 0 14px ${color}55`,
        color: isBright ? "#111" : "#fff",
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.25 }}
    >
      {t(`category.${key}`, key)}
    </motion.div>
  );
}

CategoryChip.propTypes = {
  category: PropTypes.string,
};


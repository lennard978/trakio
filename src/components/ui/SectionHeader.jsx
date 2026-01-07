// src/components/ui/SectionHeader.jsx
import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";

/**
 * SectionHeader
 * Animated section title with optional subtitle.
 */
export default function SectionHeader({ title, subtitle, className = "" }) {
  if (!title) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
      className={`px-2 mb-3 ${className}`}
    >
      <h2 className="text-xs uppercase tracking-wide text-gray-500">
        {title}
      </h2>

      {subtitle && (
        <p className="text-[11px] text-gray-400 mt-0.5">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* PropTypes                                                          */
/* ------------------------------------------------------------------ */

SectionHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  className: PropTypes.string,
};

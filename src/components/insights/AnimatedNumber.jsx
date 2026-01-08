// src/components/insights/AnimatedNumber.jsx
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { motion, useMotionValue, animate } from "framer-motion";

/**
 * AnimatedNumber
 * ------------------------------------------------------------------
 * Animates a numeric value from 0 → target value.
 *
 * USED FOR
 * - Monthly / yearly totals
 * - Averages
 * - Growth percentages
 *
 * BEHAVIOR (IMPORTANT)
 * - Animation runs whenever `value` changes
 * - Internally uses Framer Motion's `useMotionValue`
 * - Displayed value is rounded using `toFixed(decimals)`
 *
 * ⚠️ DO NOT OPTIMIZE OR REFACTOR LOGIC
 * This implementation matches the original behavior EXACTLY.
 */
export default function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  decimals = 2,
  duration = 1,
}) {
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplay(latest.toFixed(decimals));
      },
    });

    return controls.stop;
  }, [value, decimals, duration, motionValue]);

  return (
    <motion.span className="tabular-nums font-bold text-gray-900 dark:text-gray-100">
      {prefix}
      {display}
      {suffix}
    </motion.span>
  );
}

AnimatedNumber.propTypes = {
  /** Target numeric value to animate to */
  value: PropTypes.number.isRequired,

  /** Optional text shown before the number (e.g. currency code) */
  prefix: PropTypes.string,

  /** Optional text shown after the number (e.g. %) */
  suffix: PropTypes.string,

  /** Number of decimal places */
  decimals: PropTypes.number,

  /** Animation duration in seconds */
  duration: PropTypes.number,
};

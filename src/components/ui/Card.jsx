// src/components/ui/Card.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * Card
 * Core layout primitive for Trakio.
 *
 * Variants:
 * - default (solid)
 * - transparent
 * - interactive (hover lift)
 * - compact (reduced padding)
 */
export default function Card({
  children,
  transparent = false,
  interactive = false,
  compact = false,
  className = "",
}) {
  return (
    <div
      className={`
        relative rounded-2xl
        border border-gray-200/80 dark:border-white/10
        backdrop-blur-xl
        transition-all duration-300 ease-out

        ${compact ? "p-4" : "p-4"}

        ${transparent
          ? "bg-transparent"
          : "bg-white/90 dark:bg-gray-900/80"
        }

        ${interactive
          ? "hover:-translate-y-0.5 hover:shadow-xl"
          : "shadow-lg"
        }

        ${className}
      `}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PropTypes                                                          */
/* ------------------------------------------------------------------ */

Card.propTypes = {
  children: PropTypes.node.isRequired,

  /** Removes background, keeps border + blur */
  transparent: PropTypes.bool,

  /** Hover lift + stronger shadow */
  interactive: PropTypes.bool,

  /** Smaller padding for dense layouts */
  compact: PropTypes.bool,

  /** Extra Tailwind classes */
  className: PropTypes.string,
};

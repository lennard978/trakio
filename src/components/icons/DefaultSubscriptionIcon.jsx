// src/components/icons/DefaultSubscriptionIcon.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * DefaultSubscriptionIcon
 * - Visual fallback when no icon/logo is available
 * - Theme-aware
 * - Accessible + i18n-ready
 */
export default function DefaultSubscriptionIcon({
  size,
  label,
  decorative,
}) {
  const ariaProps = decorative
    ? { "aria-hidden": true }
    : { role: "img", "aria-label": label };

  return (
    <div
      {...ariaProps}
      className="flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 24 24"
        width={size * 0.6}
        height={size * 0.6}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 10h18" />
      </svg>
    </div>
  );
}

DefaultSubscriptionIcon.propTypes = {
  /** Icon size in pixels */
  size: PropTypes.number,

  /** Accessible label (i18n string resolved by parent) */
  label: PropTypes.string,

  /** If true, icon is decorative and hidden from screen readers */
  decorative: PropTypes.bool,
};

DefaultSubscriptionIcon.defaultProps = {
  size: 28,
  label: "Subscription",
  decorative: true,
};

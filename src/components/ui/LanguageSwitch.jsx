// src/components/ui/LanguageSwitch.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * LanguageSwitch
 * Simple language toggle button (e.g. EN / DE).
 */
export default function LanguageSwitch({ value, onChange, disabled = false }) {
  if (!value) return null;

  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-label={`Change language to ${value}`}
      className="
        px-3 py-1.5 text-xs rounded-full
        bg-gray-200 dark:bg-gray-700
        text-gray-900 dark:text-gray-100
        font-medium
        transition
        hover:bg-gray-300 dark:hover:bg-gray-600
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
      "
    >
      {value.toUpperCase()}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* PropTypes                                                          */
/* ------------------------------------------------------------------ */

LanguageSwitch.propTypes = {
  value: PropTypes.string.isRequired,   // e.g. "en", "de"
  onChange: PropTypes.func.isRequired,  // language toggle handler
  disabled: PropTypes.bool,
};

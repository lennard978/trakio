// src/components/ui/ThemeSwitch.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * ThemeSwitch
 * Toggle switch for light / dark mode.
 */
export default function ThemeSwitch({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label="Toggle theme"
      onClick={onChange}
      disabled={disabled}
      className={`
        relative w-11 h-6 rounded-full transition
        focus:outline-none focus:ring-2 focus:ring-orange-500/40
        ${checked ? "bg-orange-600" : "bg-gray-300"}
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <span
        className={`
          absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white
          transition-transform duration-200
          ${checked ? "translate-x-5" : ""}
        `}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* PropTypes                                                          */
/* ------------------------------------------------------------------ */

ThemeSwitch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

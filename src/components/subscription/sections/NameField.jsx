import React from "react";
import PropTypes from "prop-types";

/**
 * NameField
 * - Subscription name input
 * - Offline notice
 * - Suggestions dropdown
 *
 * PURE UI COMPONENT
 * No side effects, no data fetching
 */
export default function NameField({
  name,
  setName,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  setIcon,
  setCategory,
  t
}) {
  const isOffline =
    typeof navigator !== "undefined" && navigator.onLine === false;

  return (
    <div className="relative">
      <label
        htmlFor="subscription-name"
        className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {t("form_name")}
      </label>

      {/* Offline notice */}
      {isOffline && (
        <div
          role="status"
          className="text-sm text-orange-600 mt-2"
        >
          {t("offline_sync_notice")}
        </div>
      )}

      <input
        id="subscription-name"
        type="text"
        autoComplete="off"
        value={name || ""}
        onChange={(e) => {
          setName(e.target.value);
          setShowSuggestions(true);
          setIcon(null);
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder={t("placeholder_examples")}
        className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60"
        aria-autocomplete="list"
        aria-expanded={showSuggestions}
      />

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          role="listbox"
          className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
        >
          {suggestions.map((s) => (
            <button
              key={`${s.name}-${s.icon}`}
              type="button"
              role="option"
              onClick={() => {
                setName(s.name);
                setIcon(s.icon);
                setCategory(s.category || "other");
                setShowSuggestions(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <img
                src={`/icons/${s.icon}.svg`}
                alt=""
                className="w-5 h-5"
                aria-hidden="true"
              />
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

NameField.propTypes = {
  name: PropTypes.string,
  setName: PropTypes.func.isRequired,

  suggestions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      category: PropTypes.string
    })
  ),

  showSuggestions: PropTypes.bool.isRequired,
  setShowSuggestions: PropTypes.func.isRequired,

  setIcon: PropTypes.func.isRequired,
  setCategory: PropTypes.func.isRequired,

  t: PropTypes.func.isRequired
};

NameField.defaultProps = {
  name: "",
  suggestions: []
};

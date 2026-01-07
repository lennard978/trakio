import React from "react";
import PropTypes from "prop-types";
import CategorySelector from "../../CategorySelector";
import { CATEGORY_INTENSITY_DEFAULT } from "../constants";

/**
 * CategoryField
 * - Handles subscription category selection
 * - Syncs gradient intensity with category
 * - Accessible + theme-consistent
 *
 * PURE UI COMPONENT
 */
export default function CategoryField({
  category,
  setCategory,
  setGradientIntensity,
  t,
}) {
  const handleChange = (newValue) => {
    if (typeof newValue !== "string") return;

    const normalized = newValue.trim().toLowerCase();
    setCategory(normalized);

    // 🔗 Sync gradient intensity with category
    if (typeof setGradientIntensity === "function") {
      setGradientIntensity(
        CATEGORY_INTENSITY_DEFAULT[normalized] ??
        CATEGORY_INTENSITY_DEFAULT.other
      );
    }
  };

  return (
    <div className="space-y-1">
      <label
        htmlFor="category-select"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {t("form_category")}
      </label>

      <CategorySelector
        id="category-select"
        value={category}
        onChange={handleChange}
        aria-label={t("form_category")}
      />
    </div>
  );
}

CategoryField.propTypes = {
  category: PropTypes.string.isRequired,
  setCategory: PropTypes.func.isRequired,

  /** Optional: sync visual intensity with category */
  setGradientIntensity: PropTypes.func,

  t: PropTypes.func.isRequired,
};

CategoryField.defaultProps = {
  setGradientIntensity: undefined,
};

import React from "react";
import CategorySelector from "../../CategorySelector";

/**
 * CategoryField
 * - Subscription category selector
 *
 * PURE UI COMPONENT
 */
export default function CategoryField({
  category,
  setCategory,
  t
}) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("form_category")}
      </label>

      <CategorySelector
        value={category}
        onChange={setCategory}
      />
    </div>
  );
}

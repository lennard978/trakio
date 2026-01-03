import React from "react";

/**
 * PriceField
 * - Subscription price input
 * - Currency display
 *
 * PURE UI COMPONENT
 */
export default function PriceField({
  price,
  setPrice,
  currency,
  t
}) {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
        {t("form_price")} ({currency})
      </label>

      <div className="relative">
        <input
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60"
        />
      </div>
    </div>
  );
}

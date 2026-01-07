import React, { useState } from "react";
import PropTypes from "prop-types";
import { useCurrency } from "../../../context/CurrencyContext";

/**
 * PriceField
 * - Subscription price input with live formatting
 * - Auto-formats to 2 decimals
 * - Uses global currency context
 */
export default function PriceField({ price, setPrice, t }) {
  const { currency } = useCurrency(); // ✅ Get from global context
  const [localValue, setLocalValue] = useState(price || "");

  const handleChange = (e) => {
    const value = e.target.value;

    // ✅ Allow only digits and 1 decimal point
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setLocalValue(value);
      setPrice(value);
    }
  };

  const handleBlur = () => {
    if (localValue === "") return;
    const formatted = parseFloat(localValue).toFixed(2);
    setLocalValue(formatted);
    setPrice(formatted);
  };

  return (
    <div className="space-y-1">
      <label
        htmlFor="price-input"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {t("form_price")} ({currency})
      </label>

      <div className="relative">
        <input
          id="price-input"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t("form_price_placeholder") || "e.g. 9.99"}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700
                     bg-white/90 dark:bg-gray-900/60
                     text-gray-800 dark:text-gray-100
                     focus:ring-2 focus:ring-orange-400 focus:border-orange-400
                     placeholder-gray-400 dark:placeholder-gray-500
                     pr-12 transition-all duration-150"
        />

        {/* ✅ Currency indicator */}
        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
          <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            {currency}
          </span>
        </div>
      </div>
    </div>
  );
}

PriceField.propTypes = {
  price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setPrice: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

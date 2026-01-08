import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { CATEGORY_STYLES } from "../utils/CategoryStyles";
import { PAYMENT_METHODS } from "../components/subscription/constants";
import { SUPPORTED_CURRENCIES } from "./CurrencySelector";

/**
 * DashboardFilterUI
 * - PURE UI component
 * - Styled, compact, dashboard-grade filter bar
 * - Props contract: onChange(field, value)
 */
export default function DashboardFilterUI({
  year,
  category,
  paymentMethod,
  currency,
  sortBy,
  onChange,
  years,
  currencies,
}) {
  const { t } = useTranslation();

  /* ------------------------------------------------------------------ */
  /* Options                                                            */
  /* ------------------------------------------------------------------ */

  const categoryOptions = useMemo(() => {
    const keys = Object.keys(CATEGORY_STYLES);
    const sorted = keys
      .filter((k) => k !== "other")
      .sort((a, b) => a.localeCompare(b));
    return [...sorted, "other"];
  }, []);

  const paymentOptions = useMemo(() => PAYMENT_METHODS, []);

  const yearOptions = useMemo(() => {
    if (Array.isArray(years) && years.length) {
      return [...new Set(years.map((y) => String(y)))];
    }
    const now = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => String(now - i));
  }, [years]);

  const currencyOptions = useMemo(() => {
    if (Array.isArray(currencies) && currencies.length) {
      return [...new Set(currencies.map((c) => c.toUpperCase()))];
    }

    return SUPPORTED_CURRENCIES;
  }, [currencies]);

  /* ------------------------------------------------------------------ */

  const baseSelect =
    "h-9 px-3 rounded-xl text-xs font-medium transition-all " +
    "bg-white dark:bg-gray-900 " +
    "border border-gray-200 dark:border-gray-700 " +
    "text-gray-800 dark:text-gray-100 " +
    "shadow-sm " +
    "hover:border-gray-300 dark:hover:border-gray-600 " +
    "focus:outline-none focus:ring-2 focus:ring-orange-500/40";

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Year */}
      <select
        value={year || ""}
        onChange={(e) => onChange("year", e.target.value)}
        className={baseSelect}
        aria-label={t("filter_year") || "Year"}
      >
        <option value="">
          {t("filter_all_years") || "All Years"}
        </option>
        {yearOptions.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>

      {/* Category */}
      <select
        value={category || ""}
        onChange={(e) => onChange("category", e.target.value)}
        className={baseSelect}
        aria-label={t("filter_category") || "Category"}
      >
        <option value="">
          {t("filter_all_categories") || "All Categories"}
        </option>
        {categoryOptions.map((key) => {
          const c = CATEGORY_STYLES[key] || CATEGORY_STYLES.other;
          return (
            <option key={key} value={key}>
              {t(c.label)}
            </option>
          );
        })}
      </select>

      {/* Payment Method */}
      <select
        value={paymentMethod || ""}
        onChange={(e) => onChange("paymentMethod", e.target.value)}
        className={baseSelect}
        aria-label={t("filter_payment_method") || "Payment Method"}
      >
        <option value="">
          {t("filter_all_payment_methods") || "All Payment Methods"}
        </option>
        {paymentOptions.map((m) => (
          <option key={m.value} value={m.value}>
            {m.labelKey ? t(m.labelKey) : m.label}
          </option>
        ))}
      </select>

      {/* Currency */}
      <select
        value={currency || ""}
        onChange={(e) => onChange("currency", e.target.value)}
        className={baseSelect}
        aria-label={t("filter_currency") || "Currency"}
      >
        <option value="">
          {t("filter_all_currencies") || "All Currencies"}
        </option>
        {currencyOptions.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={sortBy || "next"}
        onChange={(e) => onChange("sortBy", e.target.value)}
        className={`${baseSelect} min-w-[140px]`}
        aria-label={t("filter_sort_by") || "Sort By"}
      >
        <option value="next">
          {t("sort_next_payment") || "Next Payment"}
        </option>
        <option value="price">
          {t("sort_price") || "Price"}
        </option>
        <option value="name">
          {t("sort_name") || "Name"}
        </option>
        <option value="progress">
          {t("sort_progress") || "Progress"}
        </option>
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* PropTypes                                                          */
/* ------------------------------------------------------------------ */

DashboardFilterUI.propTypes = {
  year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  category: PropTypes.string,
  paymentMethod: PropTypes.string,
  currency: PropTypes.string,
  sortBy: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  years: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  currencies: PropTypes.arrayOf(PropTypes.string),
};

// DashboardFilterUI.defaultProps = {
//   year: "",
//   category: "",
//   paymentMethod: "",
//   currency: "",
//   sortBy: "next",
//   years: undefined,
//   currencies: undefined,
// };

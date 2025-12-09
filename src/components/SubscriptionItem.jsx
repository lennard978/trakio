// src/components/SubscriptionItem.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SubscriptionItem({
  item,
  currency,
  rates,
  convert,
  onDelete,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Convert price for display
  const displayPrice =
    rates && convert
      ? convert(item.price, item.currency || "EUR", currency, rates)
      : item.price;

  // Next renewal
  const formatDate = (d) => {
    const dt = new Date(d);
    return dt.toLocaleDateString();
  };

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-lg font-semibold">{item.name}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {currency} {displayPrice.toFixed(2)} / {t(`frequency_${item.frequency}`)}
          </div>

          {item.datePaid && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t("last_paid")}: {formatDate(item.datePaid)}
            </div>
          )}
        </div>

        {/* Category pill */}
        <div className="px-3 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700">
          {item.category || "Other"}
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex justify-end items-center gap-3 mt-4">

        {/* PAID / UNPAID STATUS (Optional) */}
        {item.datePaid && (
          <span className="px-3 py-1 rounded-md text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
            {t("paid")}
          </span>
        )}

        {/* EDIT BUTTON */}
        <button
          onClick={() => navigate(`/edit/${item.id}`)}
          className="px-3 py-1 rounded-md text-xs bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
        >
          {t("edit")}
        </button>

        {/* DELETE BUTTON */}
        <button
          onClick={() => onDelete(item.id)}
          className="px-3 py-1 rounded-md text-xs bg-red-500 text-white hover:bg-red-600 active:scale-95"
        >
          {t("delete")}
        </button>
      </div>
    </div>
  );
}

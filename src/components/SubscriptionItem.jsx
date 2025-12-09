// src/components/SubscriptionItem.jsx
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CATEGORY_COLORS = {
  Fitness: "#22c55e",
  Bills: "#6366f1",
  Transport: "#f97316",
  Streaming: "#8b5cf6",
  Software: "#3b82f6",
  Productivity: "#f59e0b",
  Gaming: "#ef4444",
  Education: "#14b8a6",
  Food: "#84cc16",
  Other: "#6b7280",
};

export default function SubscriptionItem({
  item,
  currency,
  rates,
  convert,
  onDelete,
  onUpdatePaidDate,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dateInputRef = useRef(null);

  const displayPrice =
    rates && convert
      ? convert(item.price, item.currency || "EUR", currency, rates)
      : item.price;

  const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;

  const calcProgress = () => {
    if (!item.datePaid) return 0;
    const start = new Date(item.datePaid);
    const now = new Date();
    const end = new Date(start);

    const monthsMap = {
      monthly: 1,
      quarterly: 3,
      semiannual: 6,
      nine_months: 9,
      yearly: 12,
      biennial: 24,
      triennial: 36,
    };

    const daysMap = { weekly: 7, biweekly: 14 };

    if (monthsMap[item.frequency]) {
      end.setMonth(start.getMonth() + monthsMap[item.frequency]);
    } else if (daysMap[item.frequency]) {
      end.setDate(start.getDate() + daysMap[item.frequency]);
    } else {
      end.setMonth(start.getMonth() + 1);
    }

    const total = end - start;
    const used = now - start;
    if (used <= 0) return 0;
    if (used >= total) return 100;
    return Math.round((used / total) * 100);
  };

  const progress = calcProgress();

  const openCalendar = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.();
      dateInputRef.current.click?.();
    }
  };

  return (
    <div className="relative p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
      {/* TOP BAR */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {item.name}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-300">
            {currency} {displayPrice.toFixed(2)} /{" "}
            {t(`frequency_${item.frequency}`)}
          </div>

          {item.datePaid && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t("label_last_paid")}:{" "}
              {new Date(item.datePaid).toLocaleDateString()}
            </div>
          )}
        </div>

        <div
          className="px-3 py-1 capitalize text-xs rounded-full font-medium text-white"
          style={{ backgroundColor: color }}
        >
          {item.category || "Other"}
        </div>
      </div>

      {/* PROGRESS CIRCLE */}
      <div className="w-full flex justify-center mt-2 mb-4">
        <div className="relative">
          <svg width="70" height="70">
            <circle
              cx="35"
              cy="35"
              r="30"
              stroke="#e5e7eb"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="35"
              cy="35"
              r="30"
              stroke={color}
              strokeWidth="6"
              fill="none"
              strokeDasharray={Math.PI * 2 * 30}
              strokeDashoffset={
                Math.PI * 2 * 30 - (Math.PI * 2 * 30 * progress) / 100
              }
              strokeLinecap="round"
              transform="rotate(-90 35 35)"
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-200">
            {progress}%
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end items-center gap-3">
        {/* HIDDEN DATE INPUT */}
        <input
          ref={dateInputRef}
          type="date"
          className="hidden"
          value={item.datePaid || ""}
          onChange={(e) => onUpdatePaidDate(item.id, e.target.value)}
        />

        {/* PAID BUTTON (opens calendar) */}
        <button
          onClick={openCalendar}
          className={`px-3 py-1 rounded-md text-xs font-medium active:scale-95 ${item.datePaid
            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }`}
        >
          {item.datePaid ? t("paid") : t("unpaid")}
        </button>

        {/* EDIT */}
        <button
          onClick={() => navigate(`/edit/${item.id}`)}
          className="px-3 capitalize py-1 rounded-md text-xs bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
        >
          {t("edit")}
        </button>

        {/* DELETE */}
        <button
          onClick={() => onDelete(item.id)}
          className="px-3 capitalize py-1 rounded-md text-xs bg-red-500 text-white hover:bg-red-600 active:scale-95"
        >
          {t("delete")}
        </button>
      </div>
    </div>
  );
}

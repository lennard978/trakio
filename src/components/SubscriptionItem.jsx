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

  // ------------------------------------------------------
  // PROGRESS CALCULATION WITH OVERDUE DETECTION
  // ------------------------------------------------------
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
  const isOverdue = progress >= 100;

  const openCalendar = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.();
      dateInputRef.current.click?.();
    }
  };

  return (
    <div
      className="
        relative p-5 mb-4 rounded-2xl
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        shadow-sm 
        transition-all duration-300
        hover:shadow-md hover:-translate-y-0.5
      "
    >
      {/* -------------------------------------------------- */}
      {/* TOP ROW: NAME / PRICE / CATEGORY BADGE */}
      {/* -------------------------------------------------- */}
      <div className="flex justify-between items-start">
        <div>
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {item.name}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-300">
            {currency} {displayPrice.toFixed(2)} / {t(`frequency_${item.frequency}`)}
          </div>

          {item.datePaid && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {t("label_last_paid")}: {new Date(item.datePaid).toLocaleDateString()}
            </div>
          )}
        </div>

        <div
          style={{ backgroundColor: color }}
          className="
            px-3 py-1 text-xs font-medium text-white capitalize rounded-full 
            shadow-sm
            transition-all duration-300 
            hover:scale-105
          "
        >
          {item.category}
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* PROGRESS RING AREA — tappable to open calendar */}
      {/* -------------------------------------------------- */}
      <div className="w-full flex justify-center mt-4 mb-4">
        <div
          className={`
            relative cursor-pointer transition-transform duration-300 
            active:scale-95 
            ${isOverdue ? "animate-pulse" : ""}
          `}
          onClick={openCalendar}
        >
          <svg width="80" height="80">
            {/* Background circle */}
            <circle
              cx="40" cy="40" r="32"
              stroke="#e5e7eb"
              className="dark:stroke-gray-700"
              strokeWidth="6"
              fill="none"
            />

            {/* Progress circle */}
            <circle
              cx="40" cy="40" r="32"
              stroke={color}
              strokeWidth="6"
              fill="none"
              strokeDasharray={Math.PI * 2 * 32}
              strokeDashoffset={
                Math.PI * 2 * 32 - (Math.PI * 2 * 32 * progress) / 100
              }
              strokeLinecap="round"
              transform="rotate(-90 40 40)"
              className="
                transition-all duration-500 ease-out
                drop-shadow-[0_0_6px_rgba(0,0,0,0.15)]
              "
            />
          </svg>

          {/* Percentage in the middle */}
          <div
            className="
              absolute inset-0 flex items-center justify-center 
              text-sm font-semibold
              text-gray-800 dark:text-gray-200
            "
          >
            {progress}%
          </div>

          {/* Soft glow when overdue */}
          {isOverdue && (
            <div
              className="absolute inset-0 rounded-full 
              blur-xl opacity-30"
              style={{ backgroundColor: color }}
            />
          )}
        </div>
      </div>

      {/* -------------------------------------------------- */}
      {/* ACTION BUTTONS — LEFT = PAID, RIGHT = EDIT/DELETE */}
      {/* -------------------------------------------------- */}
      <div className="flex justify-between items-center pt-2">

        {/* HIDDEN CALENDAR INPUT */}
        <input
          ref={dateInputRef}
          type="date"
          className="hidden"
          value={item.datePaid || ""}
          onChange={(e) => onUpdatePaidDate(item.id, e.target.value)}
        />

        {/* LEFT — PAID BUTTON */}
        <button
          onClick={openCalendar}
          className={`
            px-4 py-1.5 rounded-md text-xs font-medium transition-all active:scale-95
            ${item.datePaid
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
            }
          `}
        >
          {item.datePaid ? t("paid") : t("unpaid")}
        </button>

        {/* RIGHT — EDIT / DELETE */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/edit/${item.id}`)}
            className="
              px-3 py-1.5 rounded-md text-xs font-semibold text-white
              bg-blue-500 hover:bg-blue-600 active:scale-95 transition
            "
          >
            {t("edit")}
          </button>

          <button
            onClick={() => onDelete(item.id)}
            className="
              px-3 py-1.5 rounded-md text-xs font-semibold text-white
              bg-red-500 hover:bg-red-600 active:scale-95 transition
            "
          >
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

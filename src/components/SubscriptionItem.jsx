// src/components/SubscriptionItem.jsx
import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Reusable UI components
import SwipeToDeleteWrapper from "./ui/SwipeToDeleteWrapper";
import CategoryChip, { CATEGORY_COLORS } from "./CategoryChip";
import ProgressBar from "./ui/ProgressBar";

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

  // ---------------------------------------------
  // OPEN DATE PICKER (used by "Paid" button)
  // ---------------------------------------------
  const openCalendar = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.();
      dateInputRef.current.click?.();
    }
  };

  // ---------------------------------------------
  // PRICE CONVERSION
  // ---------------------------------------------
  const displayPrice =
    rates && convert
      ? convert(item.price, item.currency || "EUR", currency, rates)
      : item.price;

  // ---------------------------------------------
  // CATEGORY COLOR (passed to ProgressBar)
  // ---------------------------------------------
  const categoryKey = (item.category || "other").toLowerCase();
  const color = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.other;

  // ---------------------------------------------
  // PROGRESS CALCULATION
  // ---------------------------------------------
  const calcProgress = () => {
    if (!item.datePaid) return 0;

    const start = new Date(item.datePaid);
    const now = new Date();
    const end = new Date(start);

    const months = {
      monthly: 1,
      quarterly: 3,
      semiannual: 6,
      nine_months: 9,
      yearly: 12,
      biennial: 24,
      triennial: 36,
    };

    const days = {
      weekly: 7,
      biweekly: 14,
    };

    if (months[item.frequency]) {
      end.setMonth(start.getMonth() + months[item.frequency]);
    } else if (days[item.frequency]) {
      end.setDate(start.getDate() + days[item.frequency]);
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

  // ---------------------------------------------
  // TOOLTIP HELP TEXT
  // ---------------------------------------------
  const getNextPaymentText = () => {
    if (!item.datePaid) return t("no_paid_date");

    const start = new Date(item.datePaid);
    const now = new Date();
    const end = new Date(start);

    const months = {
      monthly: 1,
      quarterly: 3,
      semiannual: 6,
      nine_months: 9,
      yearly: 12,
      biennial: 24,
      triennial: 36,
    };

    const days = { weekly: 7, biweekly: 14 };

    if (months[item.frequency]) {
      end.setMonth(start.getMonth() + months[item.frequency]);
    } else if (days[item.frequency]) {
      end.setDate(start.getDate() + days[item.frequency]);
    } else {
      end.setMonth(start.getMonth() + 1);
    }

    const diff = Math.ceil((end - now) / 86400000);

    if (diff > 1) return t("payment_in_days", { d: diff });
    if (diff === 1) return t("payment_in_1_day");
    if (diff === 0) return t("due_today");
    if (diff === -1) return t("overdue_1_day");
    return t("overdue_days", { d: Math.abs(diff) });
  };

  return (
    <SwipeToDeleteWrapper
      onDelete={() => onDelete(item.id)}
      deleteLabel={t("delete")}
    >
      {/* CARD */}
      <div
        className="
          p-5 rounded-3xl
          bg-white/90 dark:bg-black/25
          border border-gray-300 dark:border-white/10
          backdrop-blur-xl shadow-lg capitalize
          dark:shadow-[0_18px_45px_rgba(0,0,0,0.55)]
        "
      >
        {/* HEADER ROW */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {item.name}
            </div>

            <div className="text-sm text-gray-700 dark:text-gray-300">
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

          {/* CATEGORY CHIP */}
          <CategoryChip category={item.category} />
        </div>

        {/* BOTTOM ROW */}
        <div className="flex items-center gap-4">

          {/* PAID BUTTON */}
          <button
            onClick={openCalendar}
            className={`
              px-4 py-1.5 rounded-xl text-xs font-medium active:scale-95
              backdrop-blur-md border
              ${item.datePaid
                ? "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/40"
                : "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/40"
              }
            `}
          >
            {t("paid")}
          </button>

          {/* PROGRESS BAR */}
          <ProgressBar
            progress={progress}
            color={color}
            onClick={() => { }}
          />

          {/* EDIT BUTTON */}
          <button
            onClick={() => navigate(`/edit/${item.id}`)}
            className="
              px-4 py-1.5 rounded-xl text-xs font-semibold
              text-white bg-blue-500/85 capitalize
              backdrop-blur-md border border-blue-300/40
              shadow-[0_4px_14px_rgba(0,0,0,0.15)]
              active:scale-95
            "
          >
            {t("edit")}
          </button>
        </div>

        {/* HIDDEN DATE PICKER */}
        <input
          ref={dateInputRef}
          type="date"
          className="hidden"
          value={item.datePaid || ""}
          onChange={(e) => onUpdatePaidDate(item.id, e.target.value)}
        />
      </div>
    </SwipeToDeleteWrapper>
  );
}

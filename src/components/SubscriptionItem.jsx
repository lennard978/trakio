// src/components/SubscriptionItem.jsx

import React, { useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import SwipeToDeleteWrapper from "./ui/SwipeToDeleteWrapper";
import CategoryChip, { CATEGORY_COLORS } from "./CategoryChip";
import ProgressBar from "./ui/ProgressBar";

/* -------------------------------------------------------------------------- */
const FREQ = {
  monthly: { months: 1 },
  quarterly: { months: 3 },
  semiannual: { months: 6 },
  nine_months: { months: 9 },
  yearly: { months: 12 },
  biennial: { months: 24 },
  triennial: { months: 36 },
  weekly: { days: 7 },
  biweekly: { days: 14 },
};

function computeNextRenewal(datePaid, frequency) {
  if (!datePaid) return null;

  const start = new Date(datePaid);
  if (isNaN(start)) return null;

  const next = new Date(start);
  const cfg = FREQ[frequency] || { months: 1 };

  if (cfg.months) next.setMonth(start.getMonth() + cfg.months);
  if (cfg.days) next.setDate(start.getDate() + cfg.days);

  return next;
}

function diffInDays(dateA, dateB) {
  return Math.ceil((dateA - dateB) / 86400000);
}

/* -------------------------------------------------------------------------- */
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

  // Calculate daysLeft
  const nextRenewal = computeNextRenewal(item.datePaid, item.frequency);
  const today = new Date();
  const daysLeft = nextRenewal ? Math.max(diffInDays(nextRenewal, today), 0) : null;


  const displayPrice = useMemo(() => {
    if (!rates || !convert) return item.price;
    return convert(item.price, item.currency || "EUR", currency, rates);
  }, [item.price, item.currency, currency, rates, convert]);

  const categoryKey = (item.category || "other").toLowerCase();
  const color = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.other;

  const progress = useMemo(() => {
    if (!item.datePaid) return 0;

    const start = new Date(item.datePaid);
    const now = new Date();
    const end = computeNextRenewal(item.datePaid, item.frequency);

    if (!end) return 0;
    const total = end - start;
    const used = now - start;

    if (used <= 0) return 0;
    if (used >= total) return 100;

    return Math.round((used / total) * 100);
  }, [item.datePaid, item.frequency]);

  const nextPaymentText = useMemo(() => {
    if (!item.datePaid) return t("no_paid_date");

    const now = new Date();
    const next = computeNextRenewal(item.datePaid, item.frequency);
    if (!next) return t("no_paid_date");

    const diff = diffInDays(next, now);

    if (diff > 1) return t("payment_in_days", { d: diff });
    if (diff === 1) return t("payment_in_1_day");
    if (diff === 0) return t("due_today");
    if (diff === -1) return t("overdue_1_day");
    return t("overdue_days", { d: Math.abs(diff) });
  }, [item.datePaid, item.frequency, t]);

  const openCalendar = () => {
    const input = dateInputRef.current;
    if (!input) return;

    input.showPicker?.();
    input.click?.();
  };

  return (
    <SwipeToDeleteWrapper
      onDelete={() => onDelete(item.id)}
      deleteLabel={t("delete")}
    >
      <div
        className="
          p-5 rounded-3xl
          bg-white/90 dark:bg-black/25
          border border-gray-300 dark:border-white/10
          backdrop-blur-xl shadow-lg capitalize
          dark:shadow-[0_18px_45px_rgba(0,0,0,0.55)]
        "
      >
        {/* HEADER */}
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

          <CategoryChip category={item.category} />
        </div>

        {/* BOTTOM ROW */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* PAID BUTTON */}
          <button
            onClick={openCalendar}
            title={nextPaymentText}
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
          <ProgressBar progress={progress} color={color} datePaid={item.datePaid} daysLeft={daysLeft}
            frequency={item.frequency} />

          {/* EDIT BUTTON */}
          <button
            onClick={() => navigate(`/edit/${item.id}`)}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold
              text-white bg-blue-500/85 capitalize
              backdrop-blur-md border border-blue-300/40
              shadow-[0_4px_14px_rgba(0,0,0,0.15)]
              active:scale-95"
          >
            {t("edit")}
          </button>

          {/* DESKTOP DELETE BUTTON (Trash Icon) */}
          <button
            onClick={() => onDelete(item.id)}
            title={t("button_delete")}
            className="hidden md:inline-block px-3 py-1.5 rounded-xl text-sm
              text-white bg-red-500/90
              backdrop-blur-md border border-red-300/40
              shadow-[0_4px_14px_rgba(0,0,0,0.15)]
              hover:bg-red-600 active:scale-95"
          >
            🗑️
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

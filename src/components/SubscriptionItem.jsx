// src/components/SubscriptionItem.jsx
import React, { useRef, useState } from "react";
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

  // Swipe states
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const openedRef = useRef(false);

  // Tooltip state
  const [showTooltip, setShowTooltip] = useState(false);

  const displayPrice =
    rates && convert
      ? convert(item.price, item.currency || "EUR", currency, rates)
      : item.price;

  const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;

  // -------- PROGRESS (same logic) --------
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

  // Tooltip calculation
  const getNextPaymentText = () => {
    if (!item.datePaid) return "No paid date";

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

    const ms = 1000 * 60 * 60 * 24;
    const diff = Math.ceil((end - now) / ms);

    if (diff > 1) return `Next payment in ${diff} days`;
    if (diff === 1) return "Next payment in 1 day";
    if (diff === 0) return "Due today";
    if (diff === -1) return "Overdue by 1 day";
    return `Overdue by ${Math.abs(diff)} days`;
  };

  // -------- Swipe handlers (same) --------
  const MAX_SWIPE = -90;
  const THRESHOLD = -45;

  const handleTouchStart = (e) => {
    if (!e.touches?.length) return;
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !e.touches?.length) return;

    const dx = e.touches[0].clientX - startXRef.current;

    if (dx < 0) {
      const base = openedRef.current ? -Math.abs(dx) - 40 : dx;
      setTranslateX(Math.max(base, MAX_SWIPE));
    } else {
      setTranslateX(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (translateX <= THRESHOLD) {
      setTranslateX(MAX_SWIPE);
      openedRef.current = true;
    } else {
      setTranslateX(0);
      openedRef.current = false;
    }
  };

  const handleCardClick = () => {
    if (openedRef.current) {
      setTranslateX(0);
      openedRef.current = false;
    }
  };

  const toggleTooltip = () => setShowTooltip((v) => !v);

  return (
    <div className="relative mb-6">

      {/* DELETE BUTTON BEHIND CARD */}
      <div className="absolute inset-y-0 right-3 flex items-center">
        <button
          onClick={() => onDelete(item.id)}
          className="
            px-4 py-2 rounded-xl text-xs font-semibold
            text-white bg-red-600/80
            backdrop-blur-md border border-red-400/40
            shadow-md active:scale-95
          "
        >
          {t("delete").toLowerCase()}
        </button>
      </div>

      {/* MAIN CARD */}
      <div
        className="
          relative p-5 rounded-3xl
          bg-white/90 dark:bg-black/30
          border border-gray-300 dark:border-white/10
          backdrop-blur-xl
          shadow-lg dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)]
          transition-all
        "
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging ? "none" : "transform .25s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
      >
        {/* TOP SECTION */}
        <div className="flex justify-between items-start">
          <div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {item.name}
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {currency} {displayPrice.toFixed(2)} / {t(`frequency_${item.frequency}`)}
            </div>
            {item.datePaid && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t("label_last_paid")}: {new Date(item.datePaid).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* CATEGORY CHIP */}
          <div
            className="
              px-3 py-1 text-xs font-semibold rounded-full
              text-white backdrop-blur-md border border-white/20
              shadow-md
            "
            style={{
              backgroundColor: color,
              boxShadow: `0 0 12px ${color}60`,
            }}
          >
            {(item.category || "other").toLowerCase()}
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="flex items-center gap-4 mt-5">

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
            {item.datePaid ? t("paid") : t("unpaid")}
          </button>

          {/* PROGRESS BAR */}
          <div className="relative flex-1">
            <div
              className="
                w-full h-4 rounded-full
                bg-gray-300 dark:bg-white/10
                border border-gray-400/60 dark:border-white/20
                backdrop-blur-md overflow-hidden cursor-pointer
              "
              onClick={toggleTooltip}
            >
              <div
                className="
                  h-full rounded-full transition-all duration-500
                  flex items-center justify-center text-[10px] font-semibold
                "
                style={{
                  width: `${progress}%`,
                  backgroundColor: color,
                  color: "white",
                  boxShadow: `0 0 10px ${color}70`,
                }}
              >
                {progress}%
              </div>
            </div>

            {/* Tooltip */}
            {showTooltip && (
              <div
                className="
                  absolute -top-7 left-1/2 -translate-x-1/2
                  px-2 py-1 rounded-lg
                  bg-black/85 text-[10px] text-white shadow-lg
                  whitespace-nowrap
                "
              >
                {getNextPaymentText()}
              </div>
            )}
          </div>

          {/* EDIT BUTTON */}
          <button
            onClick={() => navigate(`/edit/${item.id}`)}
            className="
              px-4 py-1.5 rounded-xl text-xs font-semibold
              text-white bg-blue-500/85
              backdrop-blur-md border border-blue-300/40
              shadow-md active:scale-95
            "
          >
            {t("edit").toLowerCase()}
          </button>
        </div>

        {/* HIDDEN DATE INPUT */}
        <input
          ref={dateInputRef}
          type="date"
          className="hidden"
          value={item.datePaid || ""}
          onChange={(e) => onUpdatePaidDate(item.id, e.target.value)}
        />
      </div>
    </div>
  );
}

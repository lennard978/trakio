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

  // Tooltip state for progress bar
  const [showTooltip, setShowTooltip] = useState(false);

  const displayPrice =
    rates && convert
      ? convert(item.price, item.currency || "EUR", currency, rates)
      : item.price;

  const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;

  // -------- PROGRESS (unchanged) --------
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

  // Extra helper for tooltip text (no impact on existing logic)
  const getNextPaymentText = () => {
    if (!item.datePaid) return "No paid date yet";

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

    const msPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.ceil((end - now) / msPerDay);

    if (diffDays > 1) return `Next payment in ${diffDays} days`;
    if (diffDays === 1) return "Next payment in 1 day";
    if (diffDays === 0) return "Due today";
    const overdue = Math.abs(diffDays);
    if (overdue === 1) return "Overdue by 1 day";
    return `Overdue by ${overdue} days`;
  };

  // -------- Swipe handlers (unchanged) --------
  const MAX_SWIPE = -90;
  const THRESHOLD = -45;

  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    startXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || !e.touches || e.touches.length === 0) return;

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

  const toggleTooltip = () => {
    setShowTooltip((prev) => !prev);
  };

  // ---------------------------------------------------------
  //                     RENDER
  // ---------------------------------------------------------

  return (
    <div className="relative mb-6">
      {/* DELETE BUTTON – BEHIND SWIPED CARD */}
      <div className="absolute inset-y-0 right-3 flex items-center">
        <button
          onClick={() => onDelete(item.id)}
          className="
            px-4 py-2 rounded-xl font-semibold text-xs sm:text-sm
            text-white
            bg-red-600/70 backdrop-blur-md
            border border-red-400/30
            shadow-lg shadow-red-900/40
            active:scale-95 transition
          "
        >
          {t("delete").toLowerCase()}
        </button>
      </div>

      {/* MAIN CARD */}
      <div
        className="
          relative p-5 rounded-3xl
          backdrop-blur-xl
          bg-white/10 dark:bg-black/20
          border border-white/20 dark:border-white/10
          shadow-[0_8px_30px_rgba(0,0,0,0.25)]
          transition-all duration-300
        "
        style={{
          transform: `translateX(${translateX}px)`,
          transition: isDragging
            ? "none"
            : "transform 0.25s ease-out, box-shadow 0.25s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
      >
        {/* TOP SECTION */}
        <div className="flex justify-between items-start">
          <div>
            <div className="text-lg font-semibold text-white">
              {item.name}
            </div>

            <div className="text-sm text-gray-300">
              {currency} {displayPrice.toFixed(2)} /{" "}
              {t(`frequency_${item.frequency}`)}
            </div>

            {item.datePaid && (
              <div className="mt-1 text-xs text-gray-400">
                {t("label_last_paid")}:{" "}
                {new Date(item.datePaid).toLocaleDateString()}
              </div>
            )}
          </div>

          <div
            className="
              px-3 py-1 text-xs font-medium rounded-full
              text-white shadow-md backdrop-blur-md
            "
            style={{ backgroundColor: color + "cc" }}
          >
            {item.category || "Other"}
          </div>
        </div>

        {/* BOTTOM ROW: PAID / PROGRESS BAR / EDIT */}
        <div className="flex items-center gap-3 mt-4">
          {/* PAID / UNPAID BUTTON */}
          <button
            onClick={openCalendar}
            className={`
              px-4 py-1.5 rounded-xl text-xs font-medium active:scale-95
              backdrop-blur-md
              ${item.datePaid
                ? "bg-green-500/20 text-green-300 border border-green-400/20"
                : "bg-red-500/20 text-red-300 border border-red-400/20"
              }
            `}
          >
            {item.datePaid ? t("paid") : t("unpaid")}
          </button>

          {/* GLASS HORIZONTAL PROGRESS BAR */}
          <div className="relative flex-1 mx-1">
            <div
              className={`
                w-full h-3 rounded-full 
                bg-white/10 border border-white/20 
                backdrop-blur-md overflow-hidden 
                cursor-pointer
                ${isOverdue ? "animate-pulse" : ""}
              `}
              onClick={toggleTooltip}
              style={{
                boxShadow: `0 0 18px rgba(0,0,0,0.45)`,
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  backgroundColor: color,
                  boxShadow: `0 0 22px ${color}80`,
                }}
              />
            </div>

            {/* Tooltip */}
            {showTooltip && (
              <div
                className="
                  absolute -top-8 left-1/2 -translate-x-1/2
                  px-2 py-1 rounded-lg
                  bg-black/85 text-[10px] text-white
                  whitespace-nowrap
                  shadow-lg
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
              text-white bg-blue-500/80 backdrop-blur-md
              border border-blue-300/20
              shadow-md active:scale-95 transition
            "
          >
            {t("edit").toLowerCase()}
          </button>
        </div>

        {/* HIDDEN DATE INPUT (unchanged) */}
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

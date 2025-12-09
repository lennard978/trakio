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

  // Swipe left-to-delete states
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const openedRef = useRef(false);

  const displayPrice =
    rates && convert
      ? convert(item.price, item.currency || "EUR", currency, rates)
      : item.price;

  const color = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;

  // ------------ PROGRESS LOGIC (unchanged) ------------
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

  // ------------- Swipe handlers (unchanged) -------------
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

  // ---------------------------------------------------------
  //                  UPDATED STYLING BELOW
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
          {t("delete")}
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
              text-white shadow-md
              backdrop-blur-md
            "
            style={{ backgroundColor: color + "cc" }}
          >
            {item.category || "Other"}
          </div>
        </div>

        {/* PROGRESS CIRCLE */}
        <div className="flex justify-center mt-4 mb-4">
          <div
            className={`relative cursor-pointer active:scale-95 transition
                        ${isOverdue ? "animate-pulse" : ""}`}
            onClick={openCalendar}
          >
            <svg width="80" height="80">
              <circle
                cx="40"
                cy="40"
                r="32"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="6"
                fill="none"
              />

              <circle
                cx="40"
                cy="40"
                r="32"
                stroke={color}
                strokeWidth="6"
                fill="none"
                strokeDasharray={Math.PI * 2 * 32}
                strokeDashoffset={
                  Math.PI * 2 * 32 -
                  (Math.PI * 2 * 32 * progress) / 100
                }
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
                className="transition-all duration-500 drop-shadow-[0_0_10px_rgba(0,0,0,0.4)]"
              />
            </svg>

            <div className="absolute inset-0 flex items-center justify-center text-white font-semibold text-sm">
              {progress}%
            </div>

            {isOverdue && (
              <div
                className="absolute inset-0 rounded-full blur-xl opacity-40"
                style={{ backgroundColor: color }}
              />
            )}
          </div>
        </div>

        {/* BOTTOM BUTTON ROW */}
        <div className="flex justify-between items-center pt-2">
          <input
            ref={dateInputRef}
            type="date"
            className="hidden"
            value={item.datePaid || ""}
            onChange={(e) => onUpdatePaidDate(item.id, e.target.value)}
          />

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
            {t("edit")}
          </button>
        </div>
      </div>
    </div>
  );
}

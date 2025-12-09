// src/components/SubscriptionItem.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/**
 * Pastel category colors (softer, Apple-like).
 * Keys are LOWERCASE because we normalize the category string.
 */
const CATEGORY_COLORS = {
  fitness: "#bbf7d0",      // pastel green
  bills: "#c7d2fe",        // pastel indigo
  transport: "#fed7aa",    // pastel orange
  streaming: "#e9d5ff",    // pastel purple
  software: "#bfdbfe",     // pastel blue
  productivity: "#fee2b3", // pastel amber
  gaming: "#fecaca",       // pastel red
  education: "#a5f3fc",    // pastel teal
  food: "#d9f99d",         // pastel lime
  other: "#e5e7eb",        // neutral gray
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

  // Swipe state
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const openedRef = useRef(false);

  // Tooltip for progress / next payment
  const [showTooltip, setShowTooltip] = useState(false);

  // Normalize category (defensive against "Streaming", " streaming " etc.)
  const normalizedCategory = (item.category || "Other").trim().toLowerCase();
  const color = CATEGORY_COLORS[normalizedCategory] || CATEGORY_COLORS.other;

  // Open the hidden <input type="date"> (used by Paid button)
  const openCalendar = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker?.();
      dateInputRef.current.click?.();
    }
  };

  // -------- PRICE --------
  const displayPrice =
    rates && convert
      ? convert(item.price, item.currency || "EUR", currency, rates)
      : item.price;

  // -------- PROGRESS CALCULATION --------
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

    const days = { weekly: 7, biweekly: 14 };

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

  // -------- TOOLTIP TEXT --------
  const getNextPaymentText = () => {
    if (!item.datePaid) return "No paid date";

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

    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

    if (diff > 1) return `Next payment in ${diff} days`;
    if (diff === 1) return "Next payment in 1 day";
    if (diff === 0) return "Due today";
    if (diff === -1) return "Overdue by 1 day";
    return `Overdue by ${Math.abs(diff)} days`;
  };

  // -------- SWIPE-TO-DELETE LOGIC --------
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
      // swiping left
      const base = openedRef.current ? -Math.abs(dx) - 40 : dx;
      setTranslateX(Math.max(base, MAX_SWIPE));
    } else {
      // swiping right → close
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
    // Tap closes the swipe if delete is visible
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
            px-4 py-2 rounded-xl text-xs font-semibold text-white
            backdrop-blur-md active:scale-95 transition border

            /* Light mode: stronger red glow on white background */
            bg-red-500/85 border-red-400/70
            shadow-[0_0_18px_rgba(255,70,70,0.55)]

            /* Dark mode: deeper red + slightly stronger glow */
            dark:bg-red-600/90 dark:border-red-400/50
            dark:shadow-[0_0_22px_rgba(255,50,50,0.65)]
          "
        >
          {/* Capitalized, even if translation is lowercase */}
          {t("delete").charAt(0).toUpperCase() + t("delete").slice(1)}
        </button>
      </div>

      {/* MAIN CARD */}
      <div
        className="
          relative p-5 rounded-3xl
          bg-white/90 dark:bg-black/25
          border border-gray-200 dark:border-white/10
          backdrop-blur-xl shadow-lg
          dark:shadow-[0_18px_45px_rgba(0,0,0,0.55)]
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
        {/* HEADER: name, price, last paid, category chip */}
        <div className="flex justify-between items-start">
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

          {/* CATEGORY CHIP (pastel + glow) */}
          <div
            className="
              px-3 py-1 text-xs font-semibold rounded-full
              text-gray-900 dark:text-white
              backdrop-blur-md border border-white/40
              shadow-md
            "
            style={{
              backgroundColor: color,
              // Soft glow around the chip using the same pastel tone
              boxShadow: `0 0 18px ${color}90`,
            }}
          >
            {normalizedCategory}
          </div>
        </div>

        {/* BOTTOM ROW: Paid button, progress bar, Edit button */}
        <div className="flex items-center gap-4 mt-5">
          {/* PAID BUTTON – opens calendar */}
          <button
            onClick={openCalendar}
            className={`
              px-4 py-1.5 rounded-xl text-xs font-medium active:scale-95
              backdrop-blur-md border
              ${item.datePaid
                ? "bg-green-500/15 text-green-800 dark:text-green-300 border-green-500/40"
                : "bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/40"
              }
            `}
          >
            {t("paid")}
          </button>

          {/* PROGRESS BAR */}
          <div className="relative flex-1">
            <div
              className="
                w-full h-4 rounded-full overflow-hidden relative cursor-pointer
                backdrop-blur-md border
                bg-gray-200 dark:bg-gray-700
                border-gray-300 dark:border-white/20
              "
              onClick={toggleTooltip}
            >
              {/* Colored pastel fill with glow */}
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  // Slight gradient within the same pastel hue
                  background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                  boxShadow: `0 0 14px ${color}80`,
                }}
              />

              {/* Percentage text always centered above fill */}
              <div
                className="
                  absolute inset-0 flex items-center justify-center
                  text-[10px] font-semibold z-10 pointer-events-none
                "
                style={{
                  // On very small progress, black text works better on gray
                  color: progress < 10 ? "#000" : "#1f2933",
                }}
              >
                {progress}%
              </div>
            </div>

            {/* Optional tooltip with "Next payment in X days" */}
            {showTooltip && (
              <div
                className="
                  absolute -top-7 left-1/2 -translate-x-1/2
                  px-2 py-1 rounded-lg bg-black/85
                  text-[10px] text-white shadow-lg whitespace-nowrap
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
              text-white bg-blue-500/90
              backdrop-blur-md border border-blue-300/50
              shadow-[0_4px_14px_rgba(15,23,42,0.25)]
              active:scale-95
            "
          >
            {t("edit").charAt(0).toUpperCase() + t("edit").slice(1)}
          </button>
        </div>

        {/* Hidden date picker controlled by openCalendar */}
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
